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
// User Preferences API
const fs = require('fs');
const PREF_FILE = path.join(__dirname, 'user-prefs.json');

app.get('/favicon.svg', (req, res) => {
    const colors = {
        'emerald':  '#10b981',
        'sapphire': '#3b82f6',
        'amethyst': '#8b5cf6',
        'amber':    '#f59e0b',
        'ruby':     '#f43f5e'
    };
    let themeColor = colors['emerald']; // default

    if (fs.existsSync(PREF_FILE)) {
        try {
            const allPrefs = JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
            // Accept session id from query param (browsers can't send custom headers for favicons)
            const sessionId = req.query.sid || req.headers['x-session-id'];
            let sessionPrefs = sessionId ? allPrefs[sessionId] : null;

            // If no match, pick the last session in the file
            if (!sessionPrefs) {
                const sessions = Object.values(allPrefs).filter(v => typeof v === 'object');
                if (sessions.length > 0) sessionPrefs = sessions[sessions.length - 1];
            }

            if (sessionPrefs && sessionPrefs.theme && colors[sessionPrefs.theme]) {
                themeColor = colors[sessionPrefs.theme];
            }
        } catch(e) {}
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="${themeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>`;

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store'); // always fresh
    res.send(svg);
});

app.get('/api/user-prefs', (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default';
    if (fs.existsSync(PREF_FILE)) {
        try {
            const allPrefs = JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
            // Only return prefs if the top-level key is a session id (not old flat format)
            if (allPrefs[sessionId] && typeof allPrefs[sessionId] === 'object') {
                return res.json(allPrefs[sessionId]);
            }
        } catch (e) {
            console.error("Error reading prefs", e);
        }
    }
    // No prefs for this session yet - return defaults
    res.json({
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
    });
});

app.post('/api/user-prefs', (req, res) => {
    const sessionId = req.headers['x-session-id'] || 'default';
    let allPrefs = {};
    if (fs.existsSync(PREF_FILE)) {
        try {
            const raw = JSON.parse(fs.readFileSync(PREF_FILE, 'utf8'));
            // If file is old flat format (has theme/cursorType at top level), reset it
            if (raw.theme || raw.cursorType) {
                allPrefs = {};
            } else {
                allPrefs = raw;
            }
        } catch (e) {
            console.error("Error parsing existing user-prefs", e);
        }
    }
    
    // Merge new preferences with existing for this session
    const currentSessionPrefs = allPrefs[sessionId] || {};
    const newPrefs = { ...currentSessionPrefs, ...req.body };
    allPrefs[sessionId] = newPrefs;
    
    fs.writeFileSync(PREF_FILE, JSON.stringify(allPrefs, null, 2));
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
