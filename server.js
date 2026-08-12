const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Parse JSON bodies
app.use(express.json());

// Serve static assets
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/models.json', express.static(path.join(__dirname, 'models.json')));

// Preferences store (Upstash Redis on Vercel, local JSON file otherwise)
const { readAllPrefs, writeAllPrefs } = require('./prefs-store');

const THEME_COLORS = {
    'emerald':  '#10b981',
    'sapphire': '#3b82f6',
    'amethyst': '#8b5cf6',
    'amber':    '#f59e0b',
    'ruby':     '#f43f5e'
};

const DEFAULT_PREFS = {
    theme: 'emerald',
    cursorType: 'default',
    sparkleTrail: false,
    cursorSize: 1.0,
    cursorChaseSpeed: 0.5,
    cursorBloomEnabled: true,
    cursorEncompassDelay: 0.15,
    starfieldEnabled: false,
    starfieldParticleCount: 250,
    starfieldGravityStrength: 0.1,
    starfieldRampDuration: 8,
    invertColors: false
};

app.get('/favicon.svg', async (req, res) => {
    let themeColor = THEME_COLORS['emerald'];

    try {
        const allPrefs = await readAllPrefs();
        const sessionId = req.query.sid || req.headers['x-session-id'];
        let sessionPrefs = sessionId ? allPrefs[sessionId] : null;

        if (!sessionPrefs) {
            const sessions = Object.values(allPrefs).filter(v => typeof v === 'object');
            if (sessions.length > 0) sessionPrefs = sessions[sessions.length - 1];
        }

        if (sessionPrefs && sessionPrefs.theme && THEME_COLORS[sessionPrefs.theme]) {
            themeColor = THEME_COLORS[sessionPrefs.theme];
        }
    } catch(e) {}

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${themeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    res.send(svg);
});

app.get('/api/user-prefs', async (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default';
    try {
        const allPrefs = await readAllPrefs();
        if (allPrefs[sessionId] && typeof allPrefs[sessionId] === 'object') {
            return res.json(allPrefs[sessionId]);
        }
    } catch (e) {
        console.error("Error reading prefs", e);
    }
    res.json({ ...DEFAULT_PREFS });
});

app.post('/api/user-prefs', async (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default';
    let allPrefs = {};
    try {
        const raw = await readAllPrefs();
        if (raw.theme || raw.cursorType) {
            allPrefs = {};
        } else {
            allPrefs = raw;
        }
    } catch (e) {
        console.error("Error parsing existing user-prefs", e);
    }

    const currentSessionPrefs = allPrefs[sessionId] || {};
    const newPrefs = { ...currentSessionPrefs, ...req.body };
    allPrefs[sessionId] = newPrefs;

    await writeAllPrefs(allPrefs);
    res.json({ success: true, prefs: newPrefs });
});

// Routes
// 1. Root route
app.get('/', (req, res) => {
    res.render('pages/index');
});

// 2. Dynamic route for modules (e.g. /irm, /secops/overview, /sam/simulator)
const renderModulePage = (req, res, next) => {
    const moduleName = req.params.module;
    let pageName = req.params.page || 'index'; // default to index if no page specified
    
    // Strip .html suffix if present (gracefully handles legacy links)
    pageName = pageName.replace(/\.html$/, '');
    
    // Basic validation to prevent arbitrary directory traversal
    const allowedModules = ['irm', 'sam', 'secops', 'ham'];
    
    if (allowedModules.includes(moduleName)) {
        res.locals.activePage = pageName;
        res.render(`pages/${moduleName}/${pageName}`, (err, html) => {
            if (err) {
                console.error(`Error rendering page: pages/${moduleName}/${pageName}`, err);
                return res.status(404).send('Page not found');
            }
            res.send(html);
        });
    } else {
        // Pass to 404 if module is invalid
        next();
    }
};

app.get('/:module', renderModulePage);
app.get('/:module/:page', renderModulePage);

// 404 Handler
app.use((req, res) => {
    res.status(404).send('404 - Not Found');
});

app.listen(port, () => {
    console.log(`ServiceNow Learning Hub running at http://localhost:${port}`);
});

module.exports = app;
