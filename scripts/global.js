// ============================================
// GLOBAL SCRIPTS — ServiceNow Learning Hub
// ============================================

// Session ID initialization (Persistent across mobile & desktop reloads)
let globalSessionId = null;
try {
    globalSessionId = localStorage.getItem('sessionId') || sessionStorage.getItem('sessionId');
} catch (e) {}

if (!globalSessionId) {
    globalSessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    try { localStorage.setItem('sessionId', globalSessionId); } catch (e) {}
    try { sessionStorage.setItem('sessionId', globalSessionId); } catch (e) {}
}

// Early theme & invert restoration
window.invertColors = false;
try {
    const cachedTheme = localStorage.getItem('theme') || sessionStorage.getItem('theme');
    if (cachedTheme) {
        document.documentElement.setAttribute('data-theme', cachedTheme);
    }
    const cachedInvert = localStorage.getItem('invertColors') || sessionStorage.getItem('invertColors');
    if (cachedInvert === 'true') {
        window.invertColors = true;
        document.documentElement.classList.add('invert-mode');
    }
} catch (e) {}

// Color calculation helpers
function invertHexColor(hex) {
    if (!hex || hex === '#ffffff') return '#000000';
    if (hex === '#000000') return '#ffffff';
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = 255 - (num >> 16);
    const g = 255 - ((num >> 8) & 0x00FF);
    const b = 255 - (num & 0x0000FF);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
window.invertHexColor = invertHexColor;

function getActiveThemeColor() {
    const themeColors = {
        'emerald':   '#10b981',
        'sapphire':  '#3b82f6',
        'amethyst':  '#8b5cf6',
        'amber':     '#f59e0b',
        'ruby':      '#f43f5e',
        'noir':      '#ffffff',
        'neon-red':  '#ff1a1a',
        'neon':      '#ff1a1a'
    };
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
    let baseColor = themeColors[currentTheme] || (getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '').trim() || '#10b981';

    if (window.invertColors) {
        return invertHexColor(baseColor);
    }
    return baseColor;
}
window.getActiveThemeColor = getActiveThemeColor;

// Update favicon to include session ID and invert state so server can pick the right theme color
function updateFavicon() {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        document.head.appendChild(link);
    }
    let isInv = !!window.invertColors;
    try {
        if (localStorage.getItem('invertColors') === 'true') isInv = true;
    } catch(e) {}
    const invParam = isInv ? '&inv=1' : '&inv=0';
    link.href = `/favicon.svg?sid=${globalSessionId}${invParam}&t=${Date.now()}`;
}
updateFavicon();

// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// Card glow follow mouse
document.querySelectorAll('.module-card--irm, .page-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.module-card, .page-card').forEach(el => {
    observer.observe(el);
});

// ============================================
// Mermaid Diagram Interactive Edge Hover
// ============================================

(function initMermaidInteractivity() {
    const pollForMermaid = setInterval(() => {
        const svgs = document.querySelectorAll('.mermaid svg');
        if (svgs.length === 0) return;
        clearInterval(pollForMermaid);
        svgs.forEach(svg => setupDiagramInteractivity(svg));
    }, 300);
    setTimeout(() => clearInterval(pollForMermaid), 10000);

    function setupDiagramInteractivity(svg) {
        // Query all connector elements: solid, dashed, message lines, relations
        const edgeElements = Array.from(svg.querySelectorAll(
            'path.flowchart-link, g.edgePath path, path.edge-pattern-dashed, path.edge-pattern-solid, path.edge-pattern-dotted, path.path, line.messageLine0, line.messageLine1, path.messageLine0, path.messageLine1, path.relation'
        )).filter(el => !el.classList.contains('edge-hit-box'));

        const allNodes = Array.from(svg.querySelectorAll('.node, .actor, g.cluster, .statediagram-state, .classGroup'));

        // Build node lookup by various ID formats
        const nodeById = {};
        const nodeBoxes = [];

        allNodes.forEach(node => {
            if (node.id) {
                nodeById[node.id] = node;
                const m1 = node.id.match(/^flowchart-(.*?)-\d+$/);
                if (m1) nodeById[m1[1]] = node;
                const m2 = node.id.match(/^flowchart-(.*?)$/);
                if (m2) nodeById[m2[1]] = node;
            }
            try {
                const bbox = node.getBBox ? node.getBBox() : null;
                if (bbox && bbox.width > 0 && bbox.height > 0) {
                    nodeBoxes.push({
                        node,
                        cx: bbox.x + bbox.width / 2,
                        cy: bbox.y + bbox.height / 2,
                        bbox
                    });
                }
            } catch (err) {}
        });

        const edgeMap = new Map();
        const hitBoxToPath = new Map();

        // Helper to find nearest node geometrically
        function findNearestNode(pt) {
            if (!pt || nodeBoxes.length === 0) return null;
            let bestNode = null;
            let minDist = Infinity;
            nodeBoxes.forEach(item => {
                const dx = item.cx - pt.x;
                const dy = item.cy - pt.y;
                const dist = Math.hypot(dx, dy);
                if (dist < minDist) {
                    minDist = dist;
                    bestNode = item.node;
                }
            });
            return bestNode;
        }

        edgeElements.forEach(path => {
            const parent = path.parentElement;
            const classes = `${path.getAttribute('class') || ''} ${path.className.baseVal || ''} ${parent ? (parent.getAttribute('class') || '') + ' ' + (parent.className.baseVal || '') : ''}`;
            const idStr = `${path.id || ''} ${parent ? parent.id || '' : ''}`;

            const lsMatch = classes.match(/LS-([\w-]+)/) || idStr.match(/LS-([\w-]+)/);
            const leMatch = classes.match(/LE-([\w-]+)/) || idStr.match(/LE-([\w-]+)/);

            let source = lsMatch ? (nodeById[lsMatch[1]] || svg.querySelector(`[id*="${lsMatch[1]}"]`)) : null;
            let target = leMatch ? (nodeById[leMatch[1]] || svg.querySelector(`[id*="${leMatch[1]}"]`)) : null;

            // Geometric fallback if not found by ID classes (e.g. sequence messages or dashed links)
            if (!source || !target) {
                try {
                    let startPt = null;
                    let endPt = null;
                    if (path.tagName.toLowerCase() === 'line') {
                        startPt = { x: parseFloat(path.getAttribute('x1')), y: parseFloat(path.getAttribute('y1')) };
                        endPt = { x: parseFloat(path.getAttribute('x2')), y: parseFloat(path.getAttribute('y2')) };
                    } else if (path.getPointAtLength) {
                        const len = path.getTotalLength();
                        startPt = path.getPointAtLength(0);
                        endPt = path.getPointAtLength(len);
                    }
                    if (!source && startPt) source = findNearestNode(startPt);
                    if (!target && endPt) target = findNearestNode(endPt);
                } catch (e) {}
            }

            edgeMap.set(path, { source, target });

            // Create thick transparent hit-box path for easier hover interaction
            const hitBox = path.cloneNode();
            hitBox.removeAttribute('id');
            hitBox.removeAttribute('marker-end');
            hitBox.removeAttribute('marker-start');
            hitBox.setAttribute('class', 'edge-hit-box');
            hitBox.setAttribute('stroke', 'transparent');
            hitBox.setAttribute('stroke-width', '45');
            hitBox.setAttribute('fill', 'none');
            hitBox.style.pointerEvents = 'stroke';

            hitBoxToPath.set(hitBox, path);
            edgeMap.set(hitBox, { source, target });

            if (path.parentNode) {
                path.parentNode.insertBefore(hitBox, path.nextSibling);
            }
        });

        // Event delegation on the SVG
        svg.addEventListener('mouseover', (e) => {
            const target = e.target;
            const isHitBox = target.classList.contains('edge-hit-box');
            const isEdge = edgeMap.has(target);
            if (!isEdge && !isHitBox) return;

            clearHighlights(svg);

            const visiblePath = isHitBox ? hitBoxToPath.get(target) : target;
            if (visiblePath) visiblePath.classList.add('edge-hover-glow');

            const conn = edgeMap.get(target) || (visiblePath ? edgeMap.get(visiblePath) : null);
            if (conn) {
                if (conn.source) conn.source.classList.add('node-hover-glow');
                if (conn.target) conn.target.classList.add('node-hover-glow');
            }
        });

        svg.addEventListener('mouseout', (e) => {
            const target = e.target;
            if (!edgeMap.has(target) && !target.classList.contains('edge-hit-box')) return;
            clearHighlights(svg);
        });
    }

    function clearHighlights(svg) {
        svg.querySelectorAll('.edge-hover-glow').forEach(el => el.classList.remove('edge-hover-glow'));
        svg.querySelectorAll('.node-hover-glow').forEach(el => el.classList.remove('node-hover-glow'));
    }
})();

// ============================================
// Interactive Custom Cursor
// ============================================
(function initCursor() {
    const cursor = document.querySelector('.cursor-ghost');
    if (!cursor || !window.matchMedia("(pointer: fine)").matches) {
        if (cursor) cursor.style.display = 'none';
        return;
    }
    
    let pointerDot = document.querySelector('.cursor-pointer-dot');
    if (!pointerDot) {
        pointerDot = document.createElement('div');
        pointerDot.className = 'cursor-pointer-dot';
        if (document.body) {
            document.body.appendChild(pointerDot);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.appendChild(pointerDot));
        }
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX, cursorY = mouseY;
    let isHovering = false;
    let targetElement = null;
    let targetRect = null;

    // Droplet physics state
    let currentAngle = 0;
    let prevStretch = 0;
    let jiggleTimer = 0;

    let isMouseDown = false;
    let isTextHovering = false;

    function getCaretRect(x, y) {
        let rect = null;
        if (document.caretRangeFromPoint) {
            const range = document.caretRangeFromPoint(x, y);
            if (range) rect = range.getBoundingClientRect();
        } else if (document.caretPositionFromPoint) {
            const pos = document.caretPositionFromPoint(x, y);
            if (pos && pos.offsetNode && pos.offsetNode.nodeType === Node.TEXT_NODE) {
                const range = document.createRange();
                range.setStart(pos.offsetNode, pos.offset);
                range.setEnd(pos.offsetNode, Math.min(pos.offset + 1, pos.offsetNode.length));
                rect = range.getBoundingClientRect();
            }
        }
        return (rect && rect.width > 0 && rect.height > 0) ? rect : null;
    }

    // Initialize default state (normal cursor)
    document.documentElement.classList.remove('custom-cursor');
    cursor.style.display = 'none';

    window.currentCursorType = 'default';
    window.sparkleTrailEnabled = false;
    window.cursorBloomEnabled = false;
    window.cursorEncompassDelay = 0.15;
    window.invertColors = false;

    // Fetch initial state
    fetch('/api/user-prefs', {
        headers: { 'x-session-id': globalSessionId }
    })
        .then(res => {
            if (!res.ok) throw new Error("API not available");
            return res.json();
        })
        .then(data => {
            window.currentCursorType = (data.cursorType === 'droplet') ? 'ring' : (data.cursorType || (data.customCursor ? 'ring' : 'default'));
            window.sparkleTrailEnabled = !!data.sparkleTrail;
            window.cursorSizeMultiplier = data.cursorSize || 1.0;
            window.cursorChaseSpeed = data.cursorChaseSpeed !== undefined ? data.cursorChaseSpeed : 0.5;
            window.cursorBloomEnabled = data.cursorBloomEnabled !== undefined ? !!data.cursorBloomEnabled : false;
            window.cursorEncompassDelay = data.cursorEncompassDelay !== undefined ? data.cursorEncompassDelay : 0.15;
            window.starfieldEnabled = !!data.starfieldEnabled;
            window.starfieldParticleCount = data.starfieldParticleCount || 250;
            window.starfieldGravityStrength = data.starfieldGravityStrength !== undefined ? data.starfieldGravityStrength : 0.1;
            window.starfieldRampDuration = data.starfieldRampDuration || 8;
            window.invertColors = !!data.invertColors;

            if (window.invertColors) {
                try { localStorage.setItem('invertColors', 'true'); } catch (e) {}
                document.documentElement.classList.add('invert-mode');
            } else {
                try { localStorage.setItem('invertColors', 'false'); } catch (e) {}
                document.documentElement.classList.remove('invert-mode');
            }

            if (window.updateStarfieldState) window.updateStarfieldState(window.starfieldEnabled);
            if (window.updateUnifiedSettingsUI) window.updateUnifiedSettingsUI();
            
            if (window.currentCursorType !== 'default') {
                document.documentElement.classList.add('custom-cursor');
                cursor.style.display = 'block';
                if (window.currentCursorType === 'inverted') {
                    document.documentElement.classList.add('cursor-inverted');
                }
            }
            if (data.theme) {
                document.documentElement.setAttribute('data-theme', data.theme);
                try { localStorage.setItem('theme', data.theme); } catch (e) {}
                try { sessionStorage.setItem('theme', data.theme); } catch (e) {}
                if (window.updateActiveSwatch) window.updateActiveSwatch(data.theme);
                if (window.showConsoleArt) window.showConsoleArt();
            }

            updateFavicon();
        })
        .catch(err => console.error('Failed to load user preferences:', err));

    // Global helper functions
    window.toggleZenMode = function() {
        document.body.classList.toggle('zen-mode');
    };

    window.toggleInvertColors = function() {
        window.invertColors = !window.invertColors;
        document.documentElement.classList.toggle('invert-mode', window.invertColors);
        try { localStorage.setItem('invertColors', window.invertColors ? 'true' : 'false'); } catch (e) {}
        try { sessionStorage.setItem('invertColors', window.invertColors ? 'true' : 'false'); } catch (e) {}

        updateFavicon();

        const devInfo = window.getDetailedDeviceInfo ? window.getDetailedDeviceInfo() : { deviceType: (window.innerWidth <= 768 ? 'Mobile' : 'PC / Desktop') };
        const activeColor = getActiveThemeColor();
        const stateText = window.invertColors ? 'ACTIVE (INVERTED)' : 'INACTIVE (NORMAL)';

        console.log(
            `%c[${devInfo.deviceType}] 🌓 Invert Colors toggled -> State: ${stateText} | Accent: ${activeColor}`,
            `color: ${activeColor}; font-weight: bold; font-family: monospace; font-size: 12px; padding: 2px 6px; background: rgba(0,0,0,0.6); border: 1px solid ${activeColor}; border-radius: 4px;`
        );

        if (window.updateUnifiedSettingsUI) window.updateUnifiedSettingsUI();
        fetch('/api/user-prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
            body: JSON.stringify({ invertColors: window.invertColors })
        }).catch(() => {});
    };

    window.performFactoryReset = function() {
        document.documentElement.setAttribute('data-theme', 'emerald');
        document.documentElement.classList.remove('custom-cursor', 'cursor-inverted', 'invert-mode');
        document.body.classList.remove('zen-mode', 'invert-mode');
        window.invertColors = false;
        try { localStorage.setItem('theme', 'emerald'); } catch (e) {}
        try { sessionStorage.setItem('theme', 'emerald'); } catch (e) {}
        try { localStorage.setItem('invertColors', 'false'); } catch (e) {}
        try { sessionStorage.setItem('invertColors', 'false'); } catch (e) {}
        updateFavicon();
        
        document.querySelectorAll('.unified-settings-overlay, .shortcuts-modal-overlay, .cmd-palette-overlay').forEach(m => m.classList.remove('active'));

        const cursorGhost = document.querySelector('.cursor-ghost');
        if (cursorGhost) {
            cursorGhost.style.display = 'none';
            cursorGhost.style.width = '';
            cursorGhost.style.height = '';
            cursorGhost.style.borderRadius = '';
            cursorGhost.style.opacity = '1';
            cursorGhost.classList.remove('magnetic-hover', 'text-drag');
        }

        window.currentCursorType = 'default';
        window.sparkleTrailEnabled = false;
        window.cursorSizeMultiplier = 1.0;
        window.cursorChaseSpeed = 0.5;
        window.cursorBloomEnabled = false;
        window.cursorEncompassDelay = 0.15;
        window.starfieldEnabled = false;
        window.starfieldParticleCount = 250;
        window.starfieldGravityStrength = 0.1;
        window.starfieldRampDuration = 8;
        window.invertColors = false;
        
        if (window.updateActiveSwatch) window.updateActiveSwatch('emerald');
        if (window.updateUnifiedSettingsUI) window.updateUnifiedSettingsUI();
        if (window.updateStarfieldState) window.updateStarfieldState(false);
        if (window.reinitStarfieldParticles) window.reinitStarfieldParticles(250);
        if (window.showConsoleArt) window.showConsoleArt();
        
        fetch('/api/user-prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
            body: JSON.stringify({
                theme: 'emerald',
                cursorType: 'default',
                sparkleTrail: false,
                cursorSize: 1.0,
                cursorChaseSpeed: 0.5,
                cursorBloomEnabled: false,
                cursorEncompassDelay: 0.15,
                starfieldEnabled: false,
                starfieldParticleCount: 250,
                starfieldGravityStrength: 0.1,
                starfieldRampDuration: 8,
                invertColors: false
            })
        }).catch(() => {});
    };

    // Hotkeys: Settings Modal (Alt + T), Zen Mode (Alt + Z), Reset (Alt + R), Shortcuts (Alt + H), Invert (Alt + I)
    window.addEventListener('keydown', (e) => {
        if (!e.altKey) return;
        const key = e.key ? e.key.toLowerCase() : '';
        
        if (key === 't' || e.code === 'KeyT') {
            e.preventDefault();
            if (window.openUnifiedSettingsModal) {
                window.openUnifiedSettingsModal('theme');
            }
        } else if (key === 'z' || e.code === 'KeyZ') {
            window.toggleZenMode();
        } else if (key === 'r') {
            window.performFactoryReset();
        } else if (key === 'h') {
            const shortcutsOverlay = document.querySelector('.shortcuts-modal-overlay');
            if (shortcutsOverlay) {
                shortcutsOverlay.classList.toggle('active');
            }
        } else if (key === 'i') {
            e.preventDefault();
            window.toggleInvertColors();
        }
    });

    window.addEventListener('mousedown', (e) => { if (e.button === 0) isMouseDown = true; });
    window.addEventListener('mouseup', () => isMouseDown = false);

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    const animate = () => {
        const selection = window.getSelection();
        const hasSelection = selection && !selection.isCollapsed;

        if (hasSelection && isMouseDown) {
            let rect = getCaretRect(mouseX, mouseY);
            if (!rect) {
                const rects = selection.getRangeAt(0).getClientRects();
                if (rects.length > 0) rect = rects[rects.length - 1];
            }
            if (rect) {
                cursorX += (mouseX - cursorX) * 0.4;
                cursorY += ((rect.top + rect.height/2) - cursorY) * 0.4;
                
                cursor.style.width = '24px';
                cursor.style.height = `${rect.height + 6}px`;
                cursor.style.borderRadius = '4px';
                cursor.style.transform = `translate(${cursorX - 12}px, ${cursorY - (rect.height + 6)/2}px)`;
                
                cursor.classList.add('text-drag');
                cursor.classList.remove('magnetic-hover');
                requestAnimationFrame(animate);
                return;
            }
        } 
        cursor.classList.remove('text-drag');

        if (isHovering && targetElement && targetRect && window.currentCursorType !== 'inverted') {
            // Magnetic pull to center of target
            const targetCenterX = targetRect.left + (targetRect.width / 2);
            const targetCenterY = targetRect.top + (targetRect.height / 2);
            cursorX += (targetCenterX - cursorX) * 0.2;
            cursorY += (targetCenterY - cursorY) * 0.2;

            // Adjust dimensions to match target
            cursor.style.width = `${targetRect.width + 10}px`;
            cursor.style.height = `${targetRect.height + 10}px`;

            const computedStyle = window.getComputedStyle(targetElement);
            cursor.style.borderRadius = computedStyle.borderRadius !== '0px' ? computedStyle.borderRadius : '8px';

            // 3D Card Tilt check for encompassed cards
            const cardEl = targetElement.closest('.module-card-horizontal, .page-card, .module-card, .feature-card, .bento-card, .stat-card');
            if (cardEl) {
                const cRect = cardEl.getBoundingClientRect();
                const relX = mouseX - cRect.left;
                const relY = mouseY - cRect.top;
                const centerX = cRect.width / 2;
                const centerY = cRect.height / 2;
                const rotateX = -((relY - centerY) / centerY) * 8;
                const rotateY = ((relX - centerX) / centerX) * 8;
                cursor.style.transform = `translate(${cursorX - (targetRect.width + 10) / 2}px, ${cursorY - (targetRect.height + 10) / 2}px) perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
            } else {
                cursor.style.transform = `translate(${cursorX - (targetRect.width + 10) / 2}px, ${cursorY - (targetRect.height + 10) / 2}px)`;
            }

            jiggleTimer = 0;
            prevStretch = 0;

        } else {
            // Normal follow mode
            const dx = mouseX - cursorX;
            const dy = mouseY - cursorY;
            const chaseSpeed = window.cursorChaseSpeed || 0.5;

            cursorX += dx * chaseSpeed;
            cursorY += dy * chaseSpeed;

            const speed = Math.sqrt(dx * dx + dy * dy);
            if (speed > 1) {
                currentAngle = Math.atan2(dy, dx);
            }

            const stretch = Math.min(speed / 30, 2.5);
            let scaleX = 1 + stretch;
            let scaleY = Math.max(0.2, 1 - (stretch * 0.4));

            if (window.currentCursorType !== 'inverted') {
                if (speed > 5) {
                    cursor.style.borderRadius = '0 50% 50% 50%';
                    jiggleTimer = 0;
                } else {
                    cursor.style.borderRadius = '50%';
                    if (speed < 0.5 && prevStretch > 0.1 && jiggleTimer === 0) {
                        jiggleTimer = 1;
                    }
                }

                if (jiggleTimer > 0) {
                    jiggleTimer -= 0.04;
                    if (jiggleTimer <= 0) jiggleTimer = 0;

                    const jiggleAmt = Math.sin(jiggleTimer * Math.PI * 5) * jiggleTimer;
                    scaleX += jiggleAmt * 0.4;
                    scaleY -= jiggleAmt * 0.4;
                }
            } else {
                cursor.style.borderRadius = '50%';
            }

            prevStretch = stretch;

            const baseSize = (window.currentCursorType === 'inverted') ? 48 : 20;
            const size = baseSize * (window.cursorSizeMultiplier || 1.0);
            const offset = size / 2;

            if (window.currentCursorType === 'inverted') {
                cursor.style.width = `${size}px`;
                cursor.style.height = `${size}px`;
                cursor.style.transform = `translate(${cursorX - offset}px, ${cursorY - offset}px)`;
            } else {
                cursor.style.width = `${size}px`;
                cursor.style.height = `${size}px`;
                cursor.style.transform = `translate(${cursorX - offset}px, ${cursorY - offset}px) rotate(${currentAngle}rad) scale(${scaleX}, ${scaleY}) rotate(-45deg)`;
            }
            
            // Sparkle Trail logic
            if (window.sparkleTrailEnabled && speed > 2 && Math.random() > 0.4) {
                const sparkle = document.createElement('div');
                sparkle.className = 'cursor-sparkle';
                sparkle.style.left = `${cursorX + (Math.random() - 0.5) * 16}px`;
                sparkle.style.top = `${cursorY + (Math.random() - 0.5) * 16}px`;
                const spkSize = Math.random() * 4 + 2;
                sparkle.style.width = `${spkSize}px`;
                sparkle.style.height = `${spkSize}px`;
                if (window.currentCursorType === 'inverted') {
                    sparkle.style.background = '#888';
                }
                document.body.appendChild(sparkle);
                setTimeout(() => sparkle.remove(), 600);
            }
        }

        if (pointerDot) {
            pointerDot.style.left = `${mouseX}px`;
            pointerDot.style.top = `${mouseY}px`;
            if (isHovering && (window.currentCursorType === 'ring' || window.currentCursorType === 'droplet')) {
                pointerDot.classList.add('active');
            } else {
                pointerDot.classList.remove('active');
            }
        }

        requestAnimationFrame(animate);
    };
    animate();

    window.addEventListener('scroll', () => {
        if (isHovering && targetElement) {
            targetRect = targetElement.getBoundingClientRect();
        }
    }, { passive: true });


    let encompassTimer = null;

    const setupInteractives = () => {
        const interactives = document.querySelectorAll('a, button, .btn-primary, .btn-secondary, .node, .nav-link, .sidebar-link, .toc-link, .tab-btn, .sim-record-header, .sim-ref-info-btn, .sim-tab-btn, select, option, input[type="button"], input[type="submit"], .flow-step, .custom-scrollbar-thumb');
        interactives.forEach(el => {
            if (el.dataset.cursorBound) return;
            el.dataset.cursorBound = 'true';

            el.addEventListener('mouseenter', () => {
                // Cancel any pending delay from a previous leave
                if (encompassTimer) { clearTimeout(encompassTimer); encompassTimer = null; }
                isHovering = true;
                targetElement = el;
                targetRect = el.getBoundingClientRect();
                // Snap cursor position to element center so encompass doesn't travel from old position
                cursorX = targetRect.left + targetRect.width / 2;
                cursorY = targetRect.top + targetRect.height / 2;
                // Immediately reset for new encompassment
                cursor.style.transition = '';
                cursor.style.opacity = '1';
                cursor.classList.add('magnetic-hover');
            });
            el.addEventListener('mouseleave', () => {
                if (el.dataset.dragging === 'true') return;
                isHovering = false;
                targetElement = null;
                targetRect = null;
                cursor.classList.remove('magnetic-hover');

                if (window.currentCursorType === 'ring' || window.currentCursorType === 'droplet') {
                    // Fade out the encompassed rectangle in place
                    cursor.style.transition = 'opacity 0.15s ease';
                    cursor.style.opacity = '0';

                    // After the configured delay, silently reset and show the ring
                    const delayMs = (window.cursorEncompassDelay !== undefined ? window.cursorEncompassDelay : 0.15) * 1000;
                    encompassTimer = setTimeout(() => {
                        encompassTimer = null;
                        if (!isHovering) {
                            // Reset dimensions without any visible transition
                            cursor.style.transition = 'none';
                            cursor.style.width = '';
                            cursor.style.height = '';
                            cursor.style.borderRadius = '';
                            // Force layout so 'transition: none' takes effect before we fade in
                            cursor.offsetHeight;
                            // Fade the ring back in
                            cursor.style.transition = 'opacity 0.25s ease';
                            cursor.style.opacity = '1';
                            // Clean up transition after fade-in completes
                            setTimeout(() => {
                                if (!isHovering) cursor.style.transition = '';
                            }, 250);
                        }
                    }, delayMs);
                } else {
                    // Inverted cursor: just reset immediately
                    cursor.style.width = '';
                    cursor.style.height = '';
                    cursor.style.borderRadius = '';
                    cursor.style.opacity = '1';
                }
            });
        });
    };
    setupInteractives();

    setInterval(setupInteractives, 2000);
})();

// ============================================
// UNIFIED SETTINGS MODAL (Alt + T / Alt + C)
// ============================================
(function initUnifiedSettingsModal() {
    const themes = [
        { id: 'emerald', name: 'Emerald', color: '#10b981' },
        { id: 'sapphire', name: 'Sapphire', color: '#3b82f6' },
        { id: 'amethyst', name: 'Amethyst', color: '#8b5cf6' },
        { id: 'amber', name: 'Amber', color: '#f59e0b' },
        { id: 'ruby', name: 'Ruby', color: '#f43f5e' },
        { id: 'noir', name: 'Noir', color: '#ffffff' },
        { id: 'neon-red', name: 'Neon Red', color: '#ff1a1a' }
    ];

    const overlay = document.createElement('div');
    overlay.className = 'unified-settings-overlay';
    overlay.innerHTML = `
        <div class="unified-settings-modal">
            <div class="unified-modal-header">
                <div class="unified-modal-title">⚡ Personalization & Visual Physics</div>
                <div class="unified-modal-tabs">
                    <button class="unified-tab-btn active" data-tab="theme">🎨 Theme & Physics</button>
                    <button class="unified-tab-btn" data-tab="cursor">🖱️ Custom Cursor</button>
                </div>
            </div>

            <!-- PANEL 1: Theme & Starfield Physics -->
            <div class="unified-panel active" id="panel-theme">
                <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Color Themes</div>
                <div class="theme-swatches" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 22px;">
                    ${themes.map(t => `<div class="theme-swatch-container" data-theme-id="${t.id}" style="display: flex; align-items: center; justify-content: flex-start; gap: 14px; padding: 10px 14px; border-radius: 8px; cursor: pointer;">
                        <div class="theme-swatch" style="--swatch-color: ${t.color}"></div>
                        <span class="theme-label" style="text-align: left;">${t.name || (t.id.charAt(0).toUpperCase() + t.id.slice(1))}</span>
                    </div>`).join('')}
                </div>

                <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding-top: 14px; border-top: 1px solid var(--border-subtle);">Starfield Background & Particle Physics</div>
                <div style="display: flex; flex-direction: column; gap: 14px; background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                    <label for="starfieldCheckbox" style="color: var(--text-primary); font-size: 14px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="starfieldCheckbox" style="accent-color: var(--accent-primary); width: 18px; height: 18px;">
                        Enable Starfield Background
                    </label>
                    
                    <div id="starfieldPhysicsControls" style="display: flex; flex-direction: column; gap: 14px; opacity: 0.4; pointer-events: none; transition: opacity 0.2s ease;">
                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 13px; color: var(--text-primary); font-weight: 500;">Particle Density</span>
                                <span id="starfieldCountVal" style="font-size: 13px; color: var(--accent-primary); font-weight: bold; font-family: monospace;">250</span>
                            </div>
                            <input type="range" id="starfieldSlider" min="60" max="1000" value="250" step="10" style="accent-color: var(--accent-primary); cursor: pointer; width: 100%;">
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 13px; color: var(--text-primary); font-weight: 500;">Gravity Attraction Strength</span>
                                <span id="starfieldGravityVal" style="font-size: 13px; color: var(--accent-primary); font-weight: bold; font-family: monospace;">10%</span>
                            </div>
                            <input type="range" id="starfieldGravitySlider" min="0" max="100" step="5" value="10" style="accent-color: var(--accent-primary); cursor: pointer; width: 100%;">
                        </div>

                        <div>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 13px; color: var(--text-primary); font-weight: 500;">Gravity Ramp-Up Duration</span>
                                <span id="starfieldRampVal" style="font-size: 13px; color: var(--accent-primary); font-weight: bold; font-family: monospace;">8s</span>
                            </div>
                            <input type="range" id="starfieldRampSlider" min="1" max="10" step="1" value="8" style="accent-color: var(--accent-primary); cursor: pointer; width: 100%;">
                        </div>
                    </div>
                </div>
            </div>

            <!-- PANEL 2: Custom Cursor & Trail -->
            <div class="unified-panel" id="panel-cursor">
                <div style="font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">Cursor Style</div>
                <div class="cursor-options" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <div class="cursor-option theme-swatch-container" data-cursor-id="default" style="flex: 1; text-align: center; justify-content: center; padding: 10px;">
                        <span class="theme-label">Default</span>
                    </div>
                    <div class="cursor-option theme-swatch-container" data-cursor-id="ring" style="flex: 1; text-align: center; justify-content: center; padding: 10px;">
                        <span class="theme-label">Ring</span>
                    </div>
                    <div class="cursor-option theme-swatch-container" data-cursor-id="inverted" style="flex: 1; text-align: center; justify-content: center; padding: 10px;">
                        <span class="theme-label">Inverted Circle</span>
                    </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: 14px; background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 16px;">
                    <div class="cursor-size-container">
                        <div style="display:flex; justify-content:space-between; align-items:center; color:var(--text-primary); font-size:13px; font-weight:600; margin-bottom:8px;">
                            <label>Custom Cursor Size</label>
                            <div id="cursorPreviewContainer" style="width:24px; height:24px; display:flex; align-items:center; justify-content:center;">
                                <div id="cursorPreview" style="width:16px; height:16px; border-radius:50%; background:var(--accent-primary); transition:all 0.1s;"></div>
                            </div>
                        </div>
                        <input type="range" id="cursorSizeSlider" min="0.5" max="2.5" step="0.1" value="1.0" style="width: 100%; accent-color: var(--accent-primary);">
                    </div>

                    <div class="cursor-speed-container">
                        <div style="display:flex; justify-content:space-between; align-items:center; color:var(--text-primary); font-size:13px; font-weight:600; margin-bottom:8px;">
                            <label>Chase Speed</label>
                            <span id="chaseSpeedVal" style="color:var(--accent-primary); font-family: monospace;">0.50</span>
                        </div>
                        <input type="range" id="cursorSpeedSlider" min="0.1" max="1.0" step="0.01" value="0.50" style="width: 100%; accent-color: var(--accent-primary);">
                    </div>

                    <div class="cursor-delay-container" style="border-top: 1px solid var(--border-subtle); padding-top: 12px; margin-top: 4px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; color:var(--text-primary); font-size:13px; font-weight:600; margin-bottom:8px;">
                            <label>Droplet Encompass Release Delay</label>
                            <span id="encompassDelayVal" style="color:var(--accent-primary); font-family: monospace;">0.15s</span>
                        </div>
                        <input type="range" id="cursorEncompassDelaySlider" min="0.0" max="0.5" step="0.05" value="0.15" style="width: 100%; accent-color: var(--accent-primary);">
                    </div>
                </div>

                <div class="cursor-bloom-toggle" style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 14px;">
                    <label for="cursorBloomCheckbox" style="color: var(--text-primary); font-size: 14px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="cursorBloomCheckbox" style="accent-color: var(--accent-primary); width: 18px; height: 18px;">
                        Enable Stationary Cursor Bloom Effect
                    </label>
                </div>

                <div class="cursor-trail-toggle" style="display: flex; align-items: center; gap: 10px; background: var(--bg-surface); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                    <input type="checkbox" id="sparkleTrailCheckbox" style="accent-color: var(--accent-primary); width: 18px; height: 18px;">
                    <label for="sparkleTrailCheckbox" style="color: var(--text-primary); font-size: 14px; cursor: pointer; font-weight: 500;">Enable Sparkle Particle Trail</label>
                </div>
            </div>
        </div>
    `;
    function safeAppend(el) {
        if (document.body) {
            document.body.appendChild(el);
        } else {
            document.addEventListener('DOMContentLoaded', () => document.body.appendChild(el));
        }
    }
    safeAppend(overlay);

    let originalTheme = 'emerald';
    const tabBtns = overlay.querySelectorAll('.unified-tab-btn');
    const panels = overlay.querySelectorAll('.unified-panel');

    const starfieldCb = overlay.querySelector('#starfieldCheckbox');
    const starfieldPhysicsControls = overlay.querySelector('#starfieldPhysicsControls');
    const starfieldSlider = overlay.querySelector('#starfieldSlider');
    const starfieldCountVal = overlay.querySelector('#starfieldCountVal');
    const gravitySlider = overlay.querySelector('#starfieldGravitySlider');
    const gravityVal = overlay.querySelector('#starfieldGravityVal');
    const rampSlider = overlay.querySelector('#starfieldRampSlider');
    const rampVal = overlay.querySelector('#starfieldRampVal');

    const cursorOptions = overlay.querySelectorAll('.cursor-option');
    const bloomCheckbox = overlay.querySelector('#cursorBloomCheckbox');
    const trailCheckbox = overlay.querySelector('#sparkleTrailCheckbox');
    const sizeSlider = overlay.querySelector('#cursorSizeSlider');
    const cursorPreview = overlay.querySelector('#cursorPreview');
    const cursorSizeContainer = overlay.querySelector('.cursor-size-container');
    const speedSlider = overlay.querySelector('#cursorSpeedSlider');
    const speedVal = overlay.querySelector('#chaseSpeedVal');
    const encompassSlider = overlay.querySelector('#cursorEncompassDelaySlider');
    const encompassVal = overlay.querySelector('#encompassDelayVal');

    // Tab Switcher
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            overlay.querySelector(`#panel-${btn.dataset.tab}`).classList.add('active');
        });
    });

    window.openUnifiedSettingsModal = function(initialTab = 'theme') {
        if (window.innerWidth <= 768 && initialTab === 'cursor') {
            initialTab = 'theme';
        }
        const isActive = overlay.classList.contains('active');
        if (isActive) {
            overlay.classList.remove('active');
            document.documentElement.setAttribute('data-theme', originalTheme);
        } else {
            overlay.classList.add('active');
            tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === initialTab));
            panels.forEach(p => p.classList.toggle('active', p.id === `panel-${initialTab}`));
            originalTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
            updateUnifiedSettingsUI();
        }
    };

    window.updateActiveSwatch = function(themeId) {
        overlay.querySelectorAll('.theme-swatch-container').forEach(s => {
            if (s.dataset.themeId) {
                s.classList.toggle('active', s.dataset.themeId === themeId);
            }
        });
        originalTheme = themeId;
    };

    window.updateUnifiedSettingsUI = function() {
        // Theme Swatches
        const activeTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        updateActiveSwatch(activeTheme);

        // Starfield & Physics UI
        const sfEnabled = !!window.starfieldEnabled;
        if (starfieldCb) starfieldCb.checked = sfEnabled;
        if (starfieldPhysicsControls) {
            starfieldPhysicsControls.style.opacity = sfEnabled ? '1' : '0.4';
            starfieldPhysicsControls.style.pointerEvents = sfEnabled ? 'auto' : 'none';
        }
        if (starfieldSlider) {
            const count = window.starfieldParticleCount || 250;
            starfieldSlider.value = count;
            if (starfieldCountVal) starfieldCountVal.innerText = count;
        }
        if (gravitySlider) {
            const grav = window.starfieldGravityStrength !== undefined ? window.starfieldGravityStrength : 0.1;
            gravitySlider.value = Math.round(grav * 100);
            if (gravityVal) gravityVal.innerText = `${Math.round(grav * 100)}%`;
        }
        if (rampSlider) {
            const ramp = window.starfieldRampDuration || 8;
            rampSlider.value = ramp;
            if (rampVal) rampVal.innerText = `${ramp}s`;
        }

        // Cursor UI
        const type = window.currentCursorType || 'default';
        cursorOptions.forEach(opt => {
            const optId = opt.dataset.cursorId;
            const isActive = (optId === type) || (optId === 'ring' && type === 'droplet');
            if (isActive) {
                opt.style.boxShadow = '0 0 0 2px var(--accent-primary)';
                opt.style.background = 'var(--accent-soft)';
            } else {
                opt.style.boxShadow = 'none';
                opt.style.background = 'transparent';
            }
        });
        if (bloomCheckbox) bloomCheckbox.checked = !!window.cursorBloomEnabled;
        if (trailCheckbox) trailCheckbox.checked = !!window.sparkleTrailEnabled;
        if (sizeSlider) sizeSlider.value = window.cursorSizeMultiplier || 1.0;
        if (speedSlider) {
            const speed = window.cursorChaseSpeed !== undefined ? window.cursorChaseSpeed : 0.5;
            speedSlider.value = speed;
            if (speedVal) speedVal.innerText = parseFloat(speed).toFixed(2);
        }
        if (encompassSlider) {
            const delay = window.cursorEncompassDelay !== undefined ? window.cursorEncompassDelay : 0.15;
            encompassSlider.value = delay;
            if (encompassVal) encompassVal.innerText = `${parseFloat(delay).toFixed(2)}s`;
        }

        if (cursorSizeContainer && sizeSlider && cursorPreview) {
            if (type === 'default') {
                cursorSizeContainer.style.opacity = '0.4';
                sizeSlider.disabled = true;
                cursorPreview.style.display = 'none';
            } else {
                cursorSizeContainer.style.opacity = '1';
                sizeSlider.disabled = false;
                cursorPreview.style.display = 'block';
                const baseSize = type === 'inverted' ? 20 : 16;
                const previewSize = baseSize * sizeSlider.value;
                cursorPreview.style.width = `${previewSize}px`;
                cursorPreview.style.height = `${previewSize}px`;
                if (type === 'inverted') {
                    cursorPreview.style.background = 'var(--text-primary)';
                    cursorPreview.style.border = 'none';
                    cursorPreview.style.boxShadow = 'none';
                    cursorPreview.style.opacity = '0.5';
                } else {
                    cursorPreview.style.background = 'transparent';
                    cursorPreview.style.border = '2px solid var(--accent-primary)';
                    cursorPreview.style.boxShadow = '0 0 6px var(--accent-glow)';
                    cursorPreview.style.opacity = '1';
                }
            }
        }
    };

    // Listeners for Theme Swatches
    overlay.querySelectorAll('.theme-swatch-container[data-theme-id]').forEach(swatch => {
        swatch.addEventListener('mouseenter', () => {
            document.documentElement.setAttribute('data-theme', swatch.dataset.themeId);
        });
        swatch.addEventListener('mouseleave', () => {
            document.documentElement.setAttribute('data-theme', originalTheme);
        });
        swatch.addEventListener('click', () => {
            const selectedTheme = swatch.dataset.themeId;
            document.documentElement.setAttribute('data-theme', selectedTheme);
            originalTheme = selectedTheme;
            try { localStorage.setItem('theme', selectedTheme); } catch (e) {}
            try { sessionStorage.setItem('theme', selectedTheme); } catch (e) {}
            updateActiveSwatch(selectedTheme);
            if (window.showConsoleArt) window.showConsoleArt();
            fetch('/api/user-prefs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
                body: JSON.stringify({ theme: selectedTheme })
            }).then(() => updateFavicon()).catch(() => {});
        });
    });

    // Starfield Checkbox
    starfieldCb.addEventListener('change', (e) => {
        const enabled = e.target.checked;
        window.starfieldEnabled = enabled;
        updateUnifiedSettingsUI();
        if (window.updateStarfieldState) window.updateStarfieldState(enabled);
        fetch('/api/user-prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
            body: JSON.stringify({ starfieldEnabled: enabled })
        }).catch(() => {});
    });

    // Starfield Density Slider
    starfieldSlider.addEventListener('input', (e) => {
        const count = parseInt(e.target.value);
        window.starfieldParticleCount = count;
        if (starfieldCountVal) starfieldCountVal.innerText = count;
        if (window.reinitStarfieldParticles) window.reinitStarfieldParticles(count);
    });
    starfieldSlider.addEventListener('change', () => {
        fetch('/api/user-prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
            body: JSON.stringify({ starfieldParticleCount: window.starfieldParticleCount })
        }).catch(() => {});
    });

    // Gravity Strength Slider
    gravitySlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        const grav = val / 100;
        window.starfieldGravityStrength = grav;
        if (gravityVal) gravityVal.innerText = `${val}%`;
    });
    gravitySlider.addEventListener('change', () => {
        fetch('/api/user-prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
            body: JSON.stringify({ starfieldGravityStrength: window.starfieldGravityStrength })
        }).catch(() => {});
    });

    // Gravity Ramp Duration Slider
    rampSlider.addEventListener('input', (e) => {
        const ramp = parseInt(e.target.value);
        window.starfieldRampDuration = ramp;
        if (rampVal) rampVal.innerText = `${ramp}s`;
    });
    rampSlider.addEventListener('change', () => {
        fetch('/api/user-prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
            body: JSON.stringify({ starfieldRampDuration: window.starfieldRampDuration })
        }).catch(() => {});
    });

    // Cursor Type Options
    cursorOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            window.currentCursorType = opt.dataset.cursorId;
            saveCursorPrefs();
        });
    });

    // Cursor Bloom Checkbox
    bloomCheckbox.addEventListener('change', (e) => {
        window.cursorBloomEnabled = e.target.checked;
        saveCursorPrefs();
    });

    // Sparkle Trail Checkbox
    trailCheckbox.addEventListener('change', (e) => {
        window.sparkleTrailEnabled = e.target.checked;
        saveCursorPrefs();
    });

    // Cursor Size Slider
    sizeSlider.addEventListener('input', (e) => {
        window.cursorSizeMultiplier = parseFloat(e.target.value);
        updateUnifiedSettingsUI();
    });
    sizeSlider.addEventListener('change', () => saveCursorPrefs());

    // Chase Speed Slider
    speedSlider.addEventListener('input', (e) => {
        window.cursorChaseSpeed = parseFloat(e.target.value);
        updateUnifiedSettingsUI();
    });
    speedSlider.addEventListener('change', () => saveCursorPrefs());

    // Encompass Delay Slider
    encompassSlider.addEventListener('input', (e) => {
        const delay = parseFloat(e.target.value);
        window.cursorEncompassDelay = delay;
        if (encompassVal) encompassVal.innerText = `${delay.toFixed(2)}s`;
    });
    encompassSlider.addEventListener('change', () => saveCursorPrefs());

    function saveCursorPrefs() {
        const type = window.currentCursorType || 'default';
        const trail = !!window.sparkleTrailEnabled;
        const sizeMult = window.cursorSizeMultiplier || 1.0;
        const chaseSpeed = window.cursorChaseSpeed !== undefined ? window.cursorChaseSpeed : 0.5;
        const bloomEnabled = !!window.cursorBloomEnabled;
        const encompassDelay = window.cursorEncompassDelay !== undefined ? window.cursorEncompassDelay : 0.15;

        document.documentElement.classList.remove('custom-cursor', 'cursor-inverted');
        const cursorGhost = document.querySelector('.cursor-ghost');
        if (cursorGhost) cursorGhost.style.display = 'none';

        if (type !== 'default') {
            document.documentElement.classList.add('custom-cursor');
            if (cursorGhost) cursorGhost.style.display = 'block';
            if (type === 'inverted') {
                document.documentElement.classList.add('cursor-inverted');
            }
        }

        fetch('/api/user-prefs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
            body: JSON.stringify({
                cursorType: type,
                sparkleTrail: trail,
                cursorSize: sizeMult,
                cursorChaseSpeed: chaseSpeed,
                cursorBloomEnabled: bloomEnabled,
                cursorEncompassDelay: encompassDelay
            })
        }).catch(() => {});

        updateUnifiedSettingsUI();
    }

    // Overlay click to close
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            document.documentElement.setAttribute('data-theme', originalTheme);
        }
    });
})();

// ============================================
// Custom DOM Scrollbar Logic
// ============================================
(function initCustomScrollbar() {
    const container = document.createElement('div');
    container.className = 'custom-scrollbar';
    
    const thumb = document.createElement('div');
    thumb.className = 'custom-scrollbar-thumb';
    
    container.appendChild(thumb);
    
    if (document.body) {
        document.body.appendChild(container);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(container));
    }

    let scrollTimeout;
    let isDragging = false;
    let startY = 0;
    let startScrollY = 0;

    function updateScrollbar() {
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        
        if (docHeight <= winHeight) {
            container.style.display = 'none';
            return;
        } else {
            container.style.display = 'block';
        }

        const ratio = winHeight / docHeight;
        let thumbHeight = Math.max(ratio * winHeight, 40);
        thumb.style.height = `${thumbHeight}px`;

        const maxScroll = docHeight - winHeight;
        const scrollRatio = window.scrollY / maxScroll;
        const maxThumbTravel = winHeight - thumbHeight;
        
        const thumbY = scrollRatio * maxThumbTravel;
        thumb.style.transform = `translateY(${thumbY}px)`;

        if (!isDragging) {
            document.body.setAttribute('data-scrolling', 'true');
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                if (!isDragging) document.body.removeAttribute('data-scrolling');
            }, 800);
        }
    }

    thumb.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startScrollY = window.scrollY;
        thumb.dataset.dragging = 'true';
        document.body.setAttribute('data-scrolling', 'true');
        document.body.style.userSelect = 'none';
        document.documentElement.style.scrollBehavior = 'auto';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const docHeight = document.documentElement.scrollHeight;
        const winHeight = window.innerHeight;
        const thumbHeight = parseFloat(thumb.style.height);
        const maxThumbTravel = winHeight - thumbHeight;
        const maxScroll = docHeight - winHeight;
        
        const deltaY = e.clientY - startY;
        const scrollDelta = (deltaY / maxThumbTravel) * maxScroll;
        
        window.scrollTo(0, startScrollY + scrollDelta);
    });

    window.addEventListener('mouseup', (e) => {
        if (isDragging) {
            isDragging = false;
            thumb.dataset.dragging = 'false';
            document.body.style.userSelect = '';
            document.documentElement.style.scrollBehavior = '';
            
            const rect = thumb.getBoundingClientRect();
            if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
                thumb.dispatchEvent(new Event('mouseleave'));
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                document.body.removeAttribute('data-scrolling');
            }, 800);
        }
    });

    window.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar);
    
    setTimeout(updateScrollbar, 100);
    
    const observer = new MutationObserver(updateScrollbar);
    const startObserver = () => {
        if (document.body) observer.observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserver);
    } else {
        startObserver();
    }
})();

// ============================================
// SHORTCUTS & QUICK ACTIONS MODAL
// ============================================
(function initShortcutsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-modal-overlay theme-modal-overlay';
    
    overlay.innerHTML = `
        <div class="theme-modal shortcuts-modal-container" style="width: 380px; max-width: 92vw;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div class="theme-modal-title" style="margin-bottom: 0; text-align: left; font-size: 1.15rem;">⚡ Quick Actions</div>
                <button class="shortcuts-close-btn" aria-label="Close" style="background: transparent; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 4px; line-height: 1;">✕</button>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">Tap any action to execute, or use keyboard hotkeys.</div>
            <div class="shortcuts-actions-list" style="display: flex; flex-direction: column; gap: 8px;">
                <div class="shortcut-action-row" data-action="search" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">🔍</span>
                        <span style="font-weight: 500; color: var(--text-primary);">Search Box</span>
                    </div>
                    <kbd style="background: var(--bg-tertiary); padding: 3px 7px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid var(--border-subtle); color: var(--text-secondary);">Ctrl + K</kbd>
                </div>
                <div class="shortcut-action-row" data-action="settings" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">🎨</span>
                        <span style="font-weight: 500; color: var(--text-primary);">Personalization & Settings</span>
                    </div>
                    <kbd style="background: var(--bg-tertiary); padding: 3px 7px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid var(--border-subtle); color: var(--text-secondary);">Alt + T</kbd>
                </div>
                <div class="shortcut-action-row" data-action="zen" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">🧘</span>
                        <span style="font-weight: 500; color: var(--text-primary);">Zen Mode</span>
                    </div>
                    <kbd style="background: var(--bg-tertiary); padding: 3px 7px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid var(--border-subtle); color: var(--text-secondary);">Alt + Z</kbd>
                </div>
                <div class="shortcut-action-row" data-action="invert" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">🌓</span>
                        <span style="font-weight: 500; color: var(--text-primary);">Invert Colors</span>
                    </div>
                    <kbd style="background: var(--bg-tertiary); padding: 3px 7px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid var(--border-subtle); color: var(--text-secondary);">Alt + I</kbd>
                </div>
                <div class="shortcut-action-row" data-action="nav" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">📖</span>
                        <span style="font-weight: 500; color: var(--text-primary);">Chapter Navigation</span>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="nav-prev-btn" title="Previous Page" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-secondary); border-radius: 4px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-family: monospace;">◀ [</button>
                        <button class="nav-next-btn" title="Next Page" style="background: var(--bg-tertiary); border: 1px solid var(--border-subtle); color: var(--text-secondary); border-radius: 4px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-family: monospace;">] ▶</button>
                    </div>
                </div>
                <div class="shortcut-action-row" data-action="reset" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">🔄</span>
                        <span style="font-weight: 500; color: var(--text-primary);">Factory Reset</span>
                    </div>
                    <kbd style="background: var(--bg-tertiary); padding: 3px 7px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid var(--border-subtle); color: var(--text-secondary);">Alt + R</kbd>
                </div>
                <div class="shortcut-action-row" data-action="dev" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--bg-surface); border: 1px solid var(--border-subtle); cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px;">🎮</span>
                        <span style="font-weight: 500; color: var(--text-primary);">Developer Mode</span>
                    </div>
                    <kbd style="background: var(--bg-tertiary); padding: 3px 7px; border-radius: 4px; font-family: monospace; font-size: 11px; border: 1px solid var(--border-subtle); color: var(--text-secondary);">Konami</kbd>
                </div>
            </div>
        </div>
    `;
    if (document.body) {
        document.body.appendChild(overlay);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));
    }

    const closeBtn = overlay.querySelector('.shortcuts-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            overlay.classList.remove('active');
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });

    function handleAction(action, e) {
        if (e) {
            e.stopPropagation();
        }
        overlay.classList.remove('active');

        const devInfo = window.getDetailedDeviceInfo ? window.getDetailedDeviceInfo() : { deviceType: (window.innerWidth <= 768 ? 'Mobile' : 'PC / Desktop') };
        console.log(`%c[${devInfo.deviceType}] 📱 Quick Action Executed: ${action}`, 'color: #3b82f6; font-weight: bold; font-family: monospace; font-size: 11px;');

        if (action === 'search') {
            const cmdOverlay = document.querySelector('.cmd-palette-overlay');
            if (cmdOverlay) {
                cmdOverlay.classList.add('active');
                const input = cmdOverlay.querySelector('.cmd-palette-input');
                if (input) setTimeout(() => input.focus(), 50);
            }
        } else if (action === 'settings') {
            if (window.openUnifiedSettingsModal) {
                window.openUnifiedSettingsModal('theme');
            }
        } else if (action === 'zen') {
            if (window.toggleZenMode) window.toggleZenMode();
        } else if (action === 'invert') {
            if (window.toggleInvertColors) window.toggleInvertColors();
        } else if (action === 'nav') {
            if (window.navigateModulePage) window.navigateModulePage('next');
        } else if (action === 'reset') {
            if (window.performFactoryReset) window.performFactoryReset();
        } else if (action === 'dev') {
            if (window.triggerKonamiEasterEgg) window.triggerKonamiEasterEgg();
        }
    }

    const rows = overlay.querySelectorAll('.shortcut-action-row');
    rows.forEach(row => {
        let touchTriggered = false;

        const onTrigger = (e) => {
            if (e.target.closest('.nav-prev-btn')) {
                e.stopPropagation();
                if (window.navigateModulePage) window.navigateModulePage('prev');
                return;
            }
            if (e.target.closest('.nav-next-btn')) {
                e.stopPropagation();
                if (window.navigateModulePage) window.navigateModulePage('next');
                return;
            }
            handleAction(row.dataset.action, e);
        };

        row.addEventListener('touchend', (e) => {
            touchTriggered = true;
            onTrigger(e);
            setTimeout(() => { touchTriggered = false; }, 350);
        });

        row.addEventListener('click', (e) => {
            if (!touchTriggered) {
                onTrigger(e);
            }
        });
    });
})();

// ============================================
// CONSOLE ART (Feature 4)
// ============================================
(function initConsoleArt() {
    window.showConsoleArt = function() {
        try {
            console.clear();
        } catch (e) {}

        const color = getActiveThemeColor();

        console.log(
            '%c' +
            '   _____ _   _ _                          \n' +
            '  / ____| \\ | | |                         \n' +
            ' | (___ |  \\| | |     ___  __ _ _ __ _ __ \n' +
            '  \\___ \\| . ` | |    / _ \\/ _` | \'__| \'_ \\\n' +
            '  ____) | |\\  | |___|  __/ (_| | |  | | | |\n' +
            ' |_____/|_| \\_|______\\___|\\__,_|_|  |_| |_|\n\n' +
            '⚡ SNLearn — ServiceNow Learning Hub\n' +
            'Press Ctrl+K to open Search Box | Alt+H for Shortcuts.',
            `color: ${color}; font-weight: bold; font-family: monospace; font-size: 12px;`
        );
    };

    window.showConsoleArt();
})();

// ============================================
// PAGE TRANSITIONS (Feature 8)
// ============================================
(function initPageTransitions() {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('page-loaded');
    });
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        document.body.classList.add('page-loaded');
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || link.target === '_blank') return;
        if (link.origin !== window.location.origin) return;

        e.preventDefault();
        document.body.classList.add('page-exiting');
        setTimeout(() => {
            window.location.href = href;
        }, 200);
    });
})();

// ============================================
// KEYBOARD PAGE NAVIGATION (Feature 5 - Module Scoped)
// ============================================
(function initKeyboardPageNavigation() {
    window.navigateModulePage = function(direction) {
        const sidebarLinks = Array.from(document.querySelectorAll('.irm-sidebar a, .sidebar-nav a, .module-nav a'))
            .map(a => a.getAttribute('href'))
            .filter(href => href && href.startsWith('/'));

        let modulePages = [...new Set(sidebarLinks)];

        if (modulePages.length === 0) {
            const path = window.location.pathname;
            if (path.startsWith('/irm')) {
                modulePages = ['/irm', '/irm/overview', '/irm/policy-compliance', '/irm/risk-lifecycle', '/irm/audit-regulatory', '/irm/data-model', '/irm/developer-patterns', '/irm/simulator'];
            } else if (path.startsWith('/sam')) {
                modulePages = ['/sam', '/sam/overview', '/sam/normalization', '/sam/reconciliation', '/sam/remediation', '/sam/data-model', '/sam/developer-patterns', '/sam/simulator'];
            } else if (path.startsWith('/secops')) {
                modulePages = ['/secops', '/secops/overview', '/secops/sir-lifecycle', '/secops/vulnerability-response', '/secops/threat-intelligence', '/secops/data-model', '/secops/developer-patterns', '/secops/simulator'];
            } else if (path.startsWith('/ham')) {
                modulePages = ['/ham', '/ham/overview', '/ham/procurement', '/ham/inventory', '/ham/disposal', '/ham/data-model', '/ham/developer-patterns', '/ham/simulator'];
            }
        }

        if (modulePages.length === 0) return;

        const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
        const currentIndex = modulePages.indexOf(currentPath);

        if (direction === 'next' || direction === ']') {
            if (currentIndex !== -1 && currentIndex < modulePages.length - 1) {
                document.body.classList.add('page-exiting');
                setTimeout(() => window.location.href = modulePages[currentIndex + 1], 150);
            }
        } else if (direction === 'prev' || direction === '[') {
            if (currentIndex > 0) {
                document.body.classList.add('page-exiting');
                setTimeout(() => window.location.href = modulePages[currentIndex - 1], 150);
            }
        }
    };

    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key !== '[' && e.key !== ']') return;

        window.navigateModulePage(e.key);
    });
})();

// ============================================
// COMMAND PALETTE (Feature 1 - All 32 Module Pages)
// ============================================
(function initCommandPalette() {
    const overlay = document.createElement('div');
    overlay.className = 'cmd-palette-overlay';
    overlay.innerHTML = `
        <div class="cmd-palette-modal">
            <div class="cmd-palette-header">
                <span class="cmd-palette-icon">🔍</span>
                <input type="text" class="cmd-palette-input" placeholder="Search pages...">
            </div>
            <div class="cmd-palette-results"></div>
        </div>
    `;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('.cmd-palette-input');
    const resultsContainer = overlay.querySelector('.cmd-palette-results');

    const commands = [
        { label: 'Home Page', category: 'Navigation', url: '/' },
        
        // IRM Module (8 Pages)
        { label: 'IRM Dashboard', category: 'IRM Module', url: '/irm' },
        { label: 'IRM Overview', category: 'IRM Module', url: '/irm/overview' },
        { label: 'IRM Policy & Compliance', category: 'IRM Module', url: '/irm/policy-compliance' },
        { label: 'IRM Risk Lifecycle', category: 'IRM Module', url: '/irm/risk-lifecycle' },
        { label: 'IRM Audit & Regulatory', category: 'IRM Module', url: '/irm/audit-regulatory' },
        { label: 'IRM Data Model', category: 'IRM Module', url: '/irm/data-model' },
        { label: 'IRM Developer Patterns', category: 'IRM Module', url: '/irm/developer-patterns' },
        { label: 'IRM Simulator', category: 'IRM Module', url: '/irm/simulator' },

        // SAM Module (8 Pages)
        { label: 'SAM Dashboard', category: 'SAM Module', url: '/sam' },
        { label: 'SAM Overview', category: 'SAM Module', url: '/sam/overview' },
        { label: 'SAM Normalization', category: 'SAM Module', url: '/sam/normalization' },
        { label: 'SAM Reconciliation', category: 'SAM Module', url: '/sam/reconciliation' },
        { label: 'SAM Remediation', category: 'SAM Module', url: '/sam/remediation' },
        { label: 'SAM Data Model', category: 'SAM Module', url: '/sam/data-model' },
        { label: 'SAM Developer Patterns', category: 'SAM Module', url: '/sam/developer-patterns' },
        { label: 'SAM Simulator (Interactive)', category: 'SAM Module', url: '/sam/simulator' },

        // SecOps Module (8 Pages)
        { label: 'SecOps Dashboard', category: 'SecOps Module', url: '/secops' },
        { label: 'SecOps Overview', category: 'SecOps Module', url: '/secops/overview' },
        { label: 'SecOps SIR Lifecycle', category: 'SecOps Module', url: '/secops/sir-lifecycle' },
        { label: 'SecOps Vulnerability Response', category: 'SecOps Module', url: '/secops/vulnerability-response' },
        { label: 'SecOps Threat Intelligence', category: 'SecOps Module', url: '/secops/threat-intelligence' },
        { label: 'SecOps Data Model', category: 'SecOps Module', url: '/secops/data-model' },
        { label: 'SecOps Developer Patterns', category: 'SecOps Module', url: '/secops/developer-patterns' },
        { label: 'SecOps Simulator', category: 'SecOps Module', url: '/secops/simulator' },

        // HAM Module (8 Pages)
        { label: 'HAM Dashboard', category: 'HAM Module', url: '/ham' },
        { label: 'HAM Overview', category: 'HAM Module', url: '/ham/overview' },
        { label: 'HAM Procurement', category: 'HAM Module', url: '/ham/procurement' },
        { label: 'HAM Inventory', category: 'HAM Module', url: '/ham/inventory' },
        { label: 'HAM Disposal', category: 'HAM Module', url: '/ham/disposal' },
        { label: 'HAM Data Model', category: 'HAM Module', url: '/ham/data-model' },
        { label: 'HAM Developer Patterns', category: 'HAM Module', url: '/ham/developer-patterns' },
        { label: 'HAM Simulator', category: 'HAM Module', url: '/ham/simulator' },

        // Actions & Settings
        { label: 'Personalization & Settings (Alt + T)', category: 'Setting', action: () => document.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 't' })) },
        { label: 'Zen Mode (Alt + Z)', category: 'Action', action: () => document.body.classList.toggle('zen-mode') },
        { label: 'Invert Colors (Alt + I)', category: 'Action', action: () => document.documentElement.classList.toggle('invert-mode') },
        { label: 'Keyboard Shortcuts (Alt + H)', category: 'Help', action: () => document.dispatchEvent(new KeyboardEvent('keydown', { altKey: true, key: 'h' })) }
    ];

    let selectedIndex = 0;
    let filteredCommands = [...commands];

    function renderResults() {
        resultsContainer.innerHTML = '';
        if (filteredCommands.length === 0) {
            resultsContainer.innerHTML = `<div style="padding: 12px; text-align: center; color: var(--text-muted); font-size: 13px;">No commands found</div>`;
            return;
        }
        filteredCommands.forEach((cmd, idx) => {
            const item = document.createElement('div');
            item.className = `cmd-palette-item ${idx === selectedIndex ? 'selected' : ''}`;
            item.innerHTML = `
                <span>${cmd.label}</span>
                <span class="cmd-category">${cmd.category}</span>
            `;
            item.addEventListener('click', () => executeCommand(cmd));
            resultsContainer.appendChild(item);
        });
    }

    function executeCommand(cmd) {
        overlay.classList.remove('active');
        if (cmd.url) {
            document.body.classList.add('page-exiting');
            setTimeout(() => window.location.href = cmd.url, 150);
        } else if (cmd.action) {
            cmd.action();
        }
    }

    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        filteredCommands = commands.filter(c => 
            c.label.toLowerCase().includes(query) || c.category.toLowerCase().includes(query)
        );
        selectedIndex = 0;
        renderResults();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % filteredCommands.length;
            renderResults();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
            renderResults();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) executeCommand(filteredCommands[selectedIndex]);
        } else if (e.key === 'Escape') {
            overlay.classList.remove('active');
        }
    });

    // Support BOTH Ctrl+K and Alt+K
    window.addEventListener('keydown', (e) => {
        const isK = e.key.toLowerCase() === 'k';
        if ((e.ctrlKey || e.metaKey || e.altKey) && isK) {
            e.preventDefault();
            overlay.classList.toggle('active');
            if (overlay.classList.contains('active')) {
                input.value = '';
                filteredCommands = [...commands];
                selectedIndex = 0;
                renderResults();
                setTimeout(() => input.focus(), 50);
            }
        }
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
    });
})();

// ============================================
// CURSOR BLOOM EFFECT (Feature 7 - Smooth 1.2s Fade-Out)
// ============================================
(function initCursorBloom() {
    const bloom = document.createElement('div');
    bloom.className = 'cursor-bloom';
    if (document.body) {
        document.body.appendChild(bloom);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(bloom));
    }

    let idleTimer = null;

    window.addEventListener('mousemove', (e) => {
        if (bloom.classList.contains('blooming')) {
            bloom.classList.remove('blooming');
            bloom.classList.add('fading');
            setTimeout(() => bloom.classList.remove('fading'), 1200);
        }
        clearTimeout(idleTimer);

        if (!window.cursorBloomEnabled) {
            bloom.classList.remove('blooming', 'fading');
            return;
        }

        idleTimer = setTimeout(() => {
            if (!window.cursorBloomEnabled) return;
            bloom.style.left = `${e.clientX}px`;
            bloom.style.top = `${e.clientY}px`;
            bloom.classList.remove('fading');
            bloom.classList.add('blooming');
        }, 1200);
    });
})();

// ============================================
// 3D CARD PARALLAX (Feature 9 - Clean 3D Perspective Tilt)
// ============================================
(function initCardTilt() {
    let currentCard = null;

    document.addEventListener('mousemove', (e) => {
        // Target top-level outer card containers
        const cardTarget = e.target.closest(
            '.module-card-horizontal, .page-card, .module-card, .feature-card, .bento-card, .stat-card'
        );

        if (!cardTarget) {
            if (currentCard) {
                currentCard.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
                currentCard.style.boxShadow = '';
                currentCard = null;
            }
            return;
        }

        if (currentCard && currentCard !== cardTarget) {
            currentCard.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            currentCard.style.boxShadow = '';
        }

        currentCard = cardTarget;
        const rect = cardTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Clean, responsive 3D tilt calculation (max 8 deg tilt)
        const rotateX = -((y - centerY) / centerY) * 8;
        const rotateY = ((x - centerX) / centerX) * 8;

        cardTarget.style.transform = `perspective(600px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        cardTarget.style.boxShadow = `${-rotateY * 0.8}px ${rotateX * 0.8}px 25px rgba(0, 0, 0, 0.4), 0 0 15px var(--accent-glow)`;
    });

    document.addEventListener('mouseleave', () => {
        if (currentCard) {
            currentCard.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            currentCard.style.boxShadow = '';
            currentCard = null;
        }
    });
})();

// ============================================
// BACKGROUND STARFIELD CANVAS (Stationary Cursor Gravitation & 3D Orbital Swarm)
// ============================================
(function initStarfieldCanvas() {
    const canvas = document.createElement('canvas');
    canvas.id = 'starfieldCanvas';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let animationFrame;
    let particles = [];

    // Stationary mouse tracking with 3s gravity ramp-up
    let mouseX = -1000;
    let mouseY = -1000;
    let isStationary = false;
    let stationaryTimer = null;
    let stationaryStartTime = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        isStationary = false;
        stationaryStartTime = 0;
        clearTimeout(stationaryTimer);

        stationaryTimer = setTimeout(() => {
            isStationary = true;
            stationaryStartTime = Date.now();
        }, 800); // Trigger stationary gravitational mode after 0.8s idle
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function initParticles(customCount) {
        particles = [];
        const count = customCount || window.starfieldParticleCount || 105;
        for (let i = 0; i < count; i++) {
            const vx = (Math.random() - 0.5) * 0.35;
            const vy = (Math.random() - 0.5) * 0.35;
            const baseAlpha = Math.random() * 0.6 + 0.25;
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.6 + 0.5,
                alpha: baseAlpha,
                baseAlpha: baseAlpha,
                vx: vx,
                vy: vy,
                baseVx: vx,
                baseVy: vy,
                orbitAngle: Math.random() * Math.PI * 2,
                // Extremely subtle orbital rotation (0.25x of previous)
                orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (0.00075 + Math.random() * 0.001),
                // Expanded outer radius cloud (40px core + up to 180px offset = 220px spread)
                orbitRadiusOffset: Math.pow(Math.random(), 2.0) * 180
            });
        }
    }

    window.reinitStarfieldParticles = function(count) {
        initParticles(count);
    };

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const themeColors = {
            'emerald':   '#10b981',
            'sapphire':  '#3b82f6',
            'amethyst':  '#8b5cf6',
            'amber':     '#f59e0b',
            'ruby':      '#f43f5e',
            'noir':      '#ffffff',
            'neon-red':  '#ff1a1a',
            'neon':      '#ff1a1a'
        };
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'emerald';
        const particleColor = themeColors[currentTheme] || (getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '').trim() || '#10b981';
        ctx.fillStyle = particleColor;

        // Calculate gravity ramp factor (0.0 -> 1.0 over dynamic ramp duration)
        let gravityWeight = 0;
        const rampDurationMs = (window.starfieldRampDuration || 6) * 1000;
        const gravityMult = window.starfieldGravityStrength !== undefined ? window.starfieldGravityStrength : 0.5;

        if (isStationary && stationaryStartTime > 0) {
            const elapsed = Date.now() - stationaryStartTime;
            gravityWeight = Math.min(1.0, Math.max(0, elapsed / rampDurationMs));
        }

        particles.forEach(p => {
            if (isStationary && gravityWeight > 0 && gravityMult > 0 && mouseX > 0 && mouseY > 0) {
                const dx = mouseX - p.x;
                const dy = mouseY - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 340) {
                    // True circle target radius (40px core + density falloff offset)
                    const targetRadius = 40 + p.orbitRadiusOffset;
                    
                    // Advance orbital angle
                    p.orbitAngle += p.orbitSpeed;
                    
                    // True circle trigonometry (equal X and Y radius)
                    const targetX = mouseX + Math.cos(p.orbitAngle) * targetRadius;
                    const targetY = mouseY + Math.sin(p.orbitAngle) * targetRadius;
                    
                    // Dynamic gravity force & smooth ramp
                    const lerpForce = 0.016 * gravityMult * gravityWeight;
                    const damping = 1.0 - (0.06 * gravityMult * gravityWeight);
                    
                    p.vx = p.vx * damping + (targetX - p.x) * lerpForce;
                    p.vy = p.vy * damping + (targetY - p.y) * lerpForce;

                    // Density falloff alpha weighting weighted by gravity ramp
                    const proximityFactor = Math.max(0, 1 - dist / 340);
                    p.alpha = Math.min(1.0, p.baseAlpha + proximityFactor * 0.45 * gravityWeight);
                } else {
                    // Smoothly revert to natural velocity
                    p.vx = p.vx * 0.95 + p.baseVx * 0.05;
                    p.vy = p.vy * 0.95 + p.baseVy * 0.05;
                    p.alpha = p.alpha * 0.95 + p.baseAlpha * 0.05;
                }
            } else {
                // Return to normal drift mode
                p.vx = p.vx * 0.94 + p.baseVx * 0.06;
                p.vy = p.vy * 0.94 + p.baseVy * 0.06;
                p.alpha = p.alpha * 0.94 + p.baseAlpha * 0.06;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Screen boundary wrapping
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
        });

        animationFrame = requestAnimationFrame(render);
    }

    // Touch Gravitation: Touch and hold for 200ms without scrolling to activate gravity vortex
    let touchHoldTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchGravitating = false;

    window.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            clearTimeout(touchHoldTimer);

            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            if (target && target.closest('a, button, input, textarea, select, .theme-modal, .cmd-palette-modal, .theme-swatch-container, .shortcut-action-row')) {
                return;
            }

            touchHoldTimer = setTimeout(() => {
                isTouchGravitating = true;
                isStationary = true;
                mouseX = touchStartX;
                mouseY = touchStartY;
                stationaryStartTime = Date.now();
                if (navigator.vibrate) navigator.vibrate(15);
            }, 200);
        } else {
            clearTimeout(touchHoldTimer);
            if (isTouchGravitating) {
                isTouchGravitating = false;
                isStationary = false;
                stationaryStartTime = 0;
            }
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const dx = touch.clientX - touchStartX;
            const dy = touch.clientY - touchStartY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (!isTouchGravitating && dist > 15) {
                clearTimeout(touchHoldTimer);
            } else if (isTouchGravitating) {
                mouseX = touch.clientX;
                mouseY = touch.clientY;
            }
        }
    }, { passive: true });

    const endTouchGravity = () => {
        clearTimeout(touchHoldTimer);
        if (isTouchGravitating) {
            isTouchGravitating = false;
            isStationary = false;
            stationaryStartTime = 0;
        }
    };

    window.addEventListener('touchend', endTouchGravity, { passive: true });
    window.addEventListener('touchcancel', endTouchGravity, { passive: true });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else if (window.starfieldEnabled) {
            cancelAnimationFrame(animationFrame);
            render();
        }
    });

    window.updateStarfieldState = function(enabled) {
        canvas.style.display = enabled ? 'block' : 'none';
        if (enabled) {
            if (!particles.length) initParticles();
            cancelAnimationFrame(animationFrame);
            render();
        } else {
            cancelAnimationFrame(animationFrame);
        }
    };
})();

// ============================================
// KONAMI CODE EASTER EGG & DEVICE TELEMETRY
// ============================================
(function initKonamiCode() {
    const overlay = document.createElement('div');
    overlay.className = 'konami-overlay';
    overlay.innerHTML = `
        <div class="konami-title">🎮 DEVELOPER MODE UNLOCKED</div>
        <div class="konami-stats">
            <div style="color: var(--accent-primary); font-weight: bold; margin-bottom: 8px;">⚡ ServiceNow Learning Hub Telemetry</div>
            <div style="border-bottom: 1px dashed rgba(255,255,255,0.2); margin-bottom: 10px;"></div>
            <div>📱 Device Type: <span id="konamiDeviceType" style="color: #6ee7b7; font-weight: bold;"></span></div>
            <div>🏷️ Device Model: <span id="konamiDeviceName" style="color: #6ee7b7; font-weight: bold;"></span></div>
            <div>💻 Operating System: <span id="konamiOS" style="color: #93c5fd;"></span></div>
            <div>🌐 Browser & Engine: <span id="konamiBrowser" style="color: #c4b5fd;"></span></div>
            <div>📐 Viewport & Screen: <span id="konamiViewport" style="color: #fde047;"></span></div>
            <div>⚡ GPU / Renderer: <span id="konamiGPU" style="color: #f472b6;"></span></div>
            <div>🔑 Active Session ID: <span id="konamiSessionId" style="color: #e2e8f0;"></span></div>
            <div>🎨 Current Theme: <span id="konamiTheme" style="color: #e2e8f0;"></span></div>
            <div style="margin-top: 16px; color: #94a3b8; font-size: 11px;">Press ESC or tap anywhere to close</div>
        </div>
    `;
    document.body.appendChild(overlay);

    function getDetailedDeviceInfo() {
        const ua = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const width = window.innerWidth;
        const height = window.innerHeight;
        const dpr = window.devicePixelRatio || 1;
        const maxTouchPoints = navigator.maxTouchPoints || 0;
        const isTouch = maxTouchPoints > 0 || 'ontouchstart' in window;

        // 1. Device Type Detection
        let deviceType = 'PC / Desktop';
        const isMobileUA = /Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
        const isTabletUA = /iPad|Tablet|PlayBook|Silk/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);

        if (isTabletUA || (isTouch && Math.min(width, height) >= 600 && Math.max(width, height) >= 900)) {
            deviceType = 'Tablet';
        } else if (isMobileUA || (isTouch && Math.min(width, height) < 600)) {
            deviceType = 'Mobile';
        } else if (isTouch) {
            deviceType = 'Touchscreen PC';
        }

        // 2. Device Model / Name Detection
        let deviceName = 'Generic Device';
        if (/iPhone/i.test(ua)) {
            const screenMax = Math.max(window.screen.width, window.screen.height);
            const screenMin = Math.min(window.screen.width, window.screen.height);
            if (screenMax === 932 && screenMin === 430) deviceName = 'iPhone 14/15/16 Pro Max / Plus';
            else if (screenMax === 852 && screenMin === 393) deviceName = 'iPhone 14/15/16 Pro';
            else if (screenMax === 844 && screenMin === 390) deviceName = 'iPhone 12/13/14';
            else if (screenMax === 812 && screenMin === 375) deviceName = 'iPhone X / XS / 11 Pro / 12 Mini / 13 Mini';
            else if (screenMax === 896 && screenMin === 414) deviceName = 'iPhone XR / XS Max / 11 / 11 Pro Max';
            else if (screenMax === 667 && screenMin === 375) deviceName = 'iPhone 6/7/8/SE';
            else deviceName = 'Apple iPhone';
        } else if (/iPad/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1)) {
            deviceName = 'Apple iPad';
        } else if (/Android/i.test(ua)) {
            const match = ua.match(/;\s*([A-Za-z0-9\-\s\_]+)\s*Build/i) || ua.match(/Android[^;]+;\s*([^;]+)/i);
            if (match && match[1]) {
                deviceName = match[1].trim();
            } else if (/Pixel/i.test(ua)) {
                deviceName = 'Google Pixel';
            } else if (/SM-|Samsung/i.test(ua)) {
                deviceName = 'Samsung Galaxy';
            } else {
                deviceName = 'Android Device';
            }
        } else if (/Macintosh|Mac OS X/i.test(ua)) {
            deviceName = 'Apple Mac';
        } else if (/Windows NT 10.0/i.test(ua)) {
            deviceName = 'Windows 10/11 PC';
        } else if (/Windows NT/i.test(ua)) {
            deviceName = 'Windows PC';
        } else if (/Linux/i.test(ua)) {
            deviceName = 'Linux Workstation';
        }

        // 3. Operating System
        let osName = 'Unknown OS';
        if (/iPhone|iPad|iPod/i.test(ua)) {
            const match = ua.match(/OS ([\d_]+)/i);
            osName = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS';
        } else if (platform === 'MacIntel' && maxTouchPoints > 1) {
            osName = 'iPadOS';
        } else if (/Android/i.test(ua)) {
            const match = ua.match(/Android\s+([\d\.]+)/i);
            osName = match ? `Android ${match[1]}` : 'Android';
        } else if (/Windows NT 10.0/i.test(ua)) {
            osName = 'Windows 10 / 11';
        } else if (/Windows NT 6.3/i.test(ua)) {
            osName = 'Windows 8.1';
        } else if (/Windows NT 6.1/i.test(ua)) {
            osName = 'Windows 7';
        } else if (/Mac OS X/i.test(ua)) {
            const match = ua.match(/Mac OS X ([\d_]+)/i);
            osName = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
        } else if (/Linux/i.test(ua)) {
            osName = 'Linux';
        }

        // 4. Browser Info
        let browserName = 'Browser';
        if (/Edg\//i.test(ua)) {
            const m = ua.match(/Edg\/([\d\.]+)/i);
            browserName = `Microsoft Edge ${m ? m[1].split('.')[0] : ''}`;
        } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua) && !/OPR\//i.test(ua)) {
            const m = ua.match(/Chrome\/([\d\.]+)/i);
            browserName = `Google Chrome ${m ? m[1].split('.')[0] : ''}`;
        } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
            const m = ua.match(/Version\/([\d\.]+)/i);
            browserName = `Apple Safari ${m ? m[1].split('.')[0] : ''}`;
        } else if (/Firefox\//i.test(ua)) {
            const m = ua.match(/Firefox\/([\d\.]+)/i);
            browserName = `Mozilla Firefox ${m ? m[1].split('.')[0] : ''}`;
        }

        // 5. GPU Renderer (via WebGL)
        let gpuRenderer = 'Hardware Accelerated';
        try {
            const glCanvas = document.createElement('canvas');
            const gl = glCanvas.getContext('webgl') || glCanvas.getContext('experimental-webgl');
            if (gl) {
                const dbg = gl.getExtension('WEBGL_debug_renderer_info');
                if (dbg) {
                    gpuRenderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
                }
            }
        } catch (e) {}

        return {
            deviceType,
            deviceName,
            osName,
            browserName,
            viewport: `${width}×${height} (Screen: ${window.screen.width}×${window.screen.height}, DPR: ${dpr.toFixed(1)}x)`,
            gpuRenderer: gpuRenderer.length > 35 ? gpuRenderer.slice(0, 35) + '...' : gpuRenderer
        };
    }
    window.getDetailedDeviceInfo = getDetailedDeviceInfo;

    function logKonamiProgress(devicePrefix, step, total, moveName) {
        const color = getActiveThemeColor();

        if (step === total) {
            console.log(
                `%c[${devicePrefix}] 🎮 Konami Sequence Completed: ${step}/${total} (${moveName}) -> Developer Mode Unlocked!`,
                `color: ${color}; font-weight: bold; font-family: monospace; font-size: 12px; padding: 3px 6px; background: rgba(0,0,0,0.5); border: 1px solid ${color}; border-radius: 4px;`
            );
        } else {
            console.log(
                `%c[${devicePrefix}] 🎮 Konami Sequence: ${step}/${total} (${moveName})`,
                `color: ${color}; font-weight: 600; font-family: monospace; font-size: 11px; padding: 1px 4px;`
            );
        }
    }
    window.logKonamiProgress = logKonamiProgress;

    const desktopSequence = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right', 'b', 'a'];
    const keyLabels = {
        'up': '↑ Up',
        'down': '↓ Down',
        'left': '← Left',
        'right': '→ Right',
        'b': 'B',
        'a': 'A'
    };
    let desktopIndex = 0;
    let desktopTimer = null;

    function normalizeKey(e) {
        const k = (e.key || '').toLowerCase();
        const c = (e.code || '').toLowerCase();
        const code = e.keyCode || e.which;

        if (code === 38 || k === 'arrowup' || k === 'up' || c === 'arrowup' || c === 'numpad8') return 'up';
        if (code === 40 || k === 'arrowdown' || k === 'down' || c === 'arrowdown' || c === 'numpad2') return 'down';
        if (code === 37 || k === 'arrowleft' || k === 'left' || c === 'arrowleft' || c === 'numpad4') return 'left';
        if (code === 39 || k === 'arrowright' || k === 'right' || c === 'arrowright' || c === 'numpad6') return 'right';
        if (code === 66 || k === 'b' || c === 'keyb') return 'b';
        if (code === 65 || k === 'a' || c === 'keya') return 'a';
        return k || '';
    }

    function closeKonami() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    window.triggerKonamiEasterEgg = function() {
        const info = getDetailedDeviceInfo();
        document.getElementById('konamiDeviceType').innerText = info.deviceType;
        document.getElementById('konamiDeviceName').innerText = info.deviceName;
        document.getElementById('konamiOS').innerText = info.osName;
        document.getElementById('konamiBrowser').innerText = info.browserName;
        document.getElementById('konamiViewport').innerText = info.viewport;
        document.getElementById('konamiGPU').innerText = info.gpuRenderer;
        document.getElementById('konamiSessionId').innerText = globalSessionId || 'default';
        document.getElementById('konamiTheme').innerText = document.documentElement.getAttribute('data-theme') || 'emerald';
        
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 100]);
    };

    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const normalized = normalizeKey(e);
        const expected = desktopSequence[desktopIndex];

        if (normalized === expected) {
            // Prevent arrow keys from scrolling the page during code entry
            if (['up', 'down', 'left', 'right'].includes(normalized)) {
                e.preventDefault();
            }

            desktopIndex++;
            clearTimeout(desktopTimer);
            desktopTimer = setTimeout(() => { 
                if (desktopIndex > 0) {
                    desktopIndex = 0;
                    console.log('%c[PC / Desktop] ⏱️ Konami sequence timed out (4s inactive)', 'color: #94a3b8; font-family: monospace; font-size: 11px;');
                }
            }, 4000);

            const devInfo = getDetailedDeviceInfo();
            logKonamiProgress(devInfo.deviceType, desktopIndex, desktopSequence.length, keyLabels[normalized] || e.key);

            if (desktopIndex === desktopSequence.length) {
                desktopIndex = 0;
                window.triggerKonamiEasterEgg();
            }
        } else {
            if (normalized === 'up') {
                e.preventDefault();
                desktopIndex = 1;
                clearTimeout(desktopTimer);
                desktopTimer = setTimeout(() => { 
                    if (desktopIndex > 0) {
                        desktopIndex = 0;
                        console.log('%c[PC / Desktop] ⏱️ Konami sequence timed out (4s inactive)', 'color: #94a3b8; font-family: monospace; font-size: 11px;');
                    }
                }, 4000);
                const devInfo = getDetailedDeviceInfo();
                logKonamiProgress(devInfo.deviceType, 1, desktopSequence.length, '↑ Up');
            } else if (desktopIndex > 0) {
                const devInfo = getDetailedDeviceInfo();
                console.log(
                    `%c[${devInfo.deviceType}] ❌ Sequence reset (received: "${e.key}", expected: "${keyLabels[expected] || expected}")`,
                    `color: #ef4444; font-family: monospace; font-size: 11px;`
                );
                desktopIndex = 0;
            }
        }

        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeKonami();
        }
    }, true);

    overlay.addEventListener('click', () => {
        closeKonami();
    });
})();

// ============================================
// MOBILE GESTURES, SWIPES & FLOATING ACTION BUTTON
// ============================================
(function initMobileGestures() {
    // 1. Mobile Swipe Sequence for Konami Dev Mode (Up, Up, Down, Down, Left, Right, Left, Right)
    const mobileSwipeSequence = ['up', 'up', 'down', 'down', 'left', 'right', 'left', 'right'];
    const swipeLabels = {
        'up': '↑ Up',
        'down': '↓ Down',
        'left': '← Left',
        'right': '→ Right'
    };
    let mobileSwipeIndex = 0;
    let swipeTimer = null;
    let singleTouchStartX = 0;
    let singleTouchStartY = 0;
    let singleTouchStartTime = 0;

    window.addEventListener('touchstart', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
        if (e.touches.length === 1) {
            singleTouchStartX = e.touches[0].clientX;
            singleTouchStartY = e.touches[0].clientY;
            singleTouchStartTime = Date.now();
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
            const touch = e.changedTouches[0];
            const dx = touch.clientX - singleTouchStartX;
            const dy = touch.clientY - singleTouchStartY;
            const dist = Math.hypot(dx, dy);
            const duration = Date.now() - singleTouchStartTime;

            // Detect swipe if gesture moved >= 28px in < 750ms
            if (dist >= 28 && duration < 750) {
                let swipeDir = '';
                if (Math.abs(dy) > Math.abs(dx)) {
                    swipeDir = dy < 0 ? 'up' : 'down';
                } else {
                    swipeDir = dx < 0 ? 'left' : 'right';
                }

                const devInfo = window.getDetailedDeviceInfo ? window.getDetailedDeviceInfo() : { deviceType: 'Mobile' };
                const devicePrefix = devInfo.deviceType || 'Mobile';

                if (swipeDir === mobileSwipeSequence[mobileSwipeIndex]) {
                    mobileSwipeIndex++;
                    if (navigator.vibrate) navigator.vibrate(15);
                    clearTimeout(swipeTimer);
                    swipeTimer = setTimeout(() => { mobileSwipeIndex = 0; }, 3500);

                    if (window.logKonamiProgress) {
                        window.logKonamiProgress(devicePrefix, mobileSwipeIndex, mobileSwipeSequence.length, swipeLabels[swipeDir] || swipeDir);
                    }

                    if (mobileSwipeIndex === mobileSwipeSequence.length) {
                        mobileSwipeIndex = 0;
                        if (window.triggerKonamiEasterEgg) window.triggerKonamiEasterEgg();
                    }
                } else {
                    if (swipeDir === mobileSwipeSequence[0]) {
                        mobileSwipeIndex = 1;
                        if (navigator.vibrate) navigator.vibrate(15);
                        clearTimeout(swipeTimer);
                        swipeTimer = setTimeout(() => { mobileSwipeIndex = 0; }, 3500);
                        if (window.logKonamiProgress) {
                            window.logKonamiProgress(devicePrefix, 1, mobileSwipeSequence.length, swipeLabels[swipeDir] || swipeDir);
                        }
                    } else {
                        mobileSwipeIndex = 0;
                    }
                }
            }
        }
    }, { passive: true });

    // 2. Secret 5-Tap on Logo
    let logoTaps = 0;
    let lastLogoTapTime = 0;
    let logoNavTimer = null;

    document.addEventListener('click', (e) => {
        const logo = e.target.closest('.nav-logo, .site-logo');
        if (!logo) return;

        e.preventDefault();
        clearTimeout(logoNavTimer);

        const now = Date.now();
        if (now - lastLogoTapTime < 500) {
            logoTaps++;
        } else {
            logoTaps = 1;
        }
        lastLogoTapTime = now;

        if (logoTaps >= 5) {
            logoTaps = 0;
            if (window.triggerKonamiEasterEgg) window.triggerKonamiEasterEgg();
        } else {
            logoNavTimer = setTimeout(() => {
                if (logoTaps === 1) {
                    window.location.href = logo.getAttribute('href') || '/';
                }
                logoTaps = 0;
            }, 300);
        }
    });

    // 3. Multi-touch gesture tracking (4-Finger Tap -> Konami, 2-Finger Double Tap -> Hub)
    let touchCount = 0;
    let twoFingerTouchStartTime = 0;
    let twoFingerStartPos = null;
    let lastTwoFingerTapTime = 0;

    window.addEventListener('touchstart', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

        touchCount = e.touches.length;

        // 4-Finger Tap -> Konami Developer Easter Egg
        if (touchCount === 4) {
            if (window.triggerKonamiEasterEgg) window.triggerKonamiEasterEgg();
            return;
        }

        // 2-Finger Gestures
        if (touchCount === 2) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            twoFingerTouchStartTime = Date.now();
            twoFingerStartPos = {
                x1: t1.clientX,
                y1: t1.clientY,
                x2: t2.clientX,
                y2: t2.clientY,
                centerX: (t1.clientX + t2.clientX) / 2,
                centerY: (t1.clientY + t2.clientY) / 2,
                dist: Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
            };
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (twoFingerStartPos && touchCount === 2) {
            const duration = Date.now() - twoFingerTouchStartTime;
            
            if (duration < 350) {
                const now = Date.now();
                if (now - lastTwoFingerTapTime < 450) {
                    lastTwoFingerTapTime = 0;
                    const shortcutsOverlay = document.querySelector('.shortcuts-modal-overlay');
                    if (shortcutsOverlay) {
                        shortcutsOverlay.classList.add('active');
                        if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
                    }
                } else {
                    lastTwoFingerTapTime = now;
                }
            }

            twoFingerStartPos = null;
            twoFingerTouchStartTime = 0;
        }
        touchCount = e.touches.length;
    }, { passive: true });

    // 2-Finger Horizontal Swipe -> Next / Prev Chapter
    let twoFingerSwiped = false;
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && twoFingerStartPos && !twoFingerSwiped) {
            const t1 = e.touches[0];
            const t2 = e.touches[1];
            const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
            
            if (Math.abs(currentDist - twoFingerStartPos.dist) > 40) return;

            const currentCenterX = (t1.clientX + t2.clientX) / 2;
            const currentCenterY = (t1.clientY + t2.clientY) / 2;
            const deltaX = currentCenterX - twoFingerStartPos.centerX;
            const deltaY = currentCenterY - twoFingerStartPos.centerY;

            if (Math.abs(deltaX) > 70 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
                twoFingerSwiped = true;
                if (navigator.vibrate) navigator.vibrate(25);
                if (deltaX < 0) {
                    if (window.navigateModulePage) window.navigateModulePage('next');
                } else {
                    if (window.navigateModulePage) window.navigateModulePage('prev');
                }
                setTimeout(() => { twoFingerSwiped = false; }, 800);
            }
        }
    }, { passive: true });

    // 4. Inject Mobile / Tablet Floating Action Button (FAB)
    function setupMobileFloatingBtn() {
        if (document.querySelector('.mobile-floating-hub-btn')) return;

        const fab = document.createElement('button');
        fab.className = 'mobile-floating-hub-btn';
        fab.setAttribute('aria-label', 'Open Quick Actions Hub');
        fab.title = 'Quick Actions & Shortcuts';
        fab.innerHTML = `<span>⚡</span>`;

        let fabTouchHandled = false;

        const triggerFab = (e) => {
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            const devInfo = window.getDetailedDeviceInfo ? window.getDetailedDeviceInfo() : { deviceType: 'Mobile' };
            console.log(`%c[${devInfo.deviceType}] ⚡ Floating Action Button pressed -> Opening Quick Actions Hub`, 'color: #f59e0b; font-weight: bold; font-family: monospace; font-size: 11px;');

            const shortcutsOverlay = document.querySelector('.shortcuts-modal-overlay');
            if (shortcutsOverlay) {
                shortcutsOverlay.classList.toggle('active');
                if (navigator.vibrate) navigator.vibrate(20);
            }
        };

        fab.addEventListener('touchend', (e) => {
            fabTouchHandled = true;
            triggerFab(e);
            setTimeout(() => { fabTouchHandled = false; }, 350);
        });

        fab.addEventListener('click', (e) => {
            if (!fabTouchHandled) {
                triggerFab(e);
            }
        });

        document.body.appendChild(fab);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupMobileFloatingBtn);
    } else {
        setupMobileFloatingBtn();
    }
})();

// ============================================
// MOBILE EXPANDABLE NAVBAR
// ============================================
(function initMobileNavbar() {
    function setupNavToggle() {
        const toggleBtn = document.getElementById('navMobileToggle');
        const navLinks = document.getElementById('navLinks');
        const navHubBtn = document.getElementById('navHubBtn');

        if (toggleBtn && navLinks) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = navLinks.classList.toggle('active');
                toggleBtn.classList.toggle('active', isOpen);
                toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                if (navigator.vibrate) navigator.vibrate(15);
            });

            // Close on link click
            navLinks.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('active');
                    toggleBtn.classList.remove('active');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                });
            });

            // Close when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('#navbar')) {
                    navLinks.classList.remove('active');
                    toggleBtn.classList.remove('active');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNavToggle);
    } else {
        setupNavToggle();
    }
})();

