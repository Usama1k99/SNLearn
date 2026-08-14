// ============================================
// GLOBAL SCRIPTS — ServiceNow Learning Hub
// ============================================

// Session ID initialization
let globalSessionId = sessionStorage.getItem('sessionId');
if (!globalSessionId) {
    globalSessionId = 'session_' + Math.random().toString(36).substring(2, 9);
    sessionStorage.setItem('sessionId', globalSessionId);
}

// Update favicon to include session ID so server can pick the right theme color
function updateFavicon() {
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/svg+xml';
        document.head.appendChild(link);
    }
    link.href = `/favicon.svg?sid=${globalSessionId}&t=${Date.now()}`;
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
                document.documentElement.classList.add('invert-mode');
            } else {
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
                if (window.updateActiveSwatch) window.updateActiveSwatch(data.theme);
                if (window.showConsoleArt) window.showConsoleArt();
            }
        })
        .catch(err => console.error('Failed to load user preferences:', err));

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
            document.body.classList.toggle('zen-mode');
        } else if (key === 'r') {
            // Factory Reset to pristine state
            document.documentElement.setAttribute('data-theme', 'emerald');
            document.documentElement.classList.remove('custom-cursor', 'cursor-inverted', 'invert-mode');
            document.body.classList.remove('zen-mode');
            
            // Close any open modals
            document.querySelectorAll('.unified-settings-overlay, .shortcuts-modal-overlay, .cmd-palette-overlay').forEach(m => m.classList.remove('active'));

            cursor.style.display = 'none';
            cursor.style.width = '';
            cursor.style.height = '';
            cursor.style.borderRadius = '';
            cursor.style.opacity = '1';
            cursor.classList.remove('magnetic-hover', 'text-drag');

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
        } else if (key === 'h') {
            const shortcutsOverlay = document.querySelector('.shortcuts-modal-overlay');
            if (shortcutsOverlay) {
                shortcutsOverlay.classList.toggle('active');
            }
        } else if (key === 'i') {
            e.preventDefault();
            window.invertColors = !window.invertColors;
            document.documentElement.classList.toggle('invert-mode', window.invertColors);
            if (window.updateUnifiedSettingsUI) window.updateUnifiedSettingsUI();
            fetch('/api/user-prefs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-session-id': globalSessionId },
                body: JSON.stringify({ invertColors: window.invertColors })
            }).catch(() => {});
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
// SHORTCUTS MODAL
// ============================================
(function initShortcutsModal() {
    const overlay = document.createElement('div');
    overlay.className = 'shortcuts-modal-overlay theme-modal-overlay';
    
    overlay.innerHTML = `
        <div class="theme-modal" style="width: 370px;">
            <div class="theme-modal-title">Available Shortcuts</div>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px; color: var(--text-primary); font-size: 13px;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
                    <span>Search Box</span>
                    <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Ctrl + K</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
                    <span>Show Shortcuts</span>
                    <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Alt + H</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
                    <span>Personalization & Settings</span>
                    <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Alt + T</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
                    <span>Zen Mode</span>
                    <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Alt + Z</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
                    <span>Invert Colors</span>
                    <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Alt + I</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
                    <span>Next / Prev Page</span>
                    <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">] / [</kbd>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Factory Reset</span>
                    <kbd style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Alt + R</kbd>
                </div>
            </div>
        </div>
    `;
    if (document.body) {
        document.body.appendChild(overlay);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.appendChild(overlay));
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('active');
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
        const color = themeColors[currentTheme] || (getComputedStyle(document.documentElement).getPropertyValue('--accent-primary') || '').trim() || '#10b981';

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
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key !== '[' && e.key !== ']') return;

        // 1. Collect all sidebar navigation links on the current page
        const sidebarLinks = Array.from(document.querySelectorAll('.irm-sidebar a, .sidebar-nav a, .module-nav a'))
            .map(a => a.getAttribute('href'))
            .filter(href => href && href.startsWith('/'));

        // Unique links for the active module
        let modulePages = [...new Set(sidebarLinks)];

        // If no sidebar links found in DOM, fallback to route-based module subpages
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

        if (e.key === ']') {
            if (currentIndex !== -1 && currentIndex < modulePages.length - 1) {
                document.body.classList.add('page-exiting');
                setTimeout(() => window.location.href = modulePages[currentIndex + 1], 150);
            }
        } else if (e.key === '[') {
            if (currentIndex > 0) {
                document.body.classList.add('page-exiting');
                setTimeout(() => window.location.href = modulePages[currentIndex - 1], 150);
            }
        }
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
// KONAMI CODE EASTER EGG (Feature 3 - Viewport & Scroll Lock)
// ============================================
(function initKonamiCode() {
    const overlay = document.createElement('div');
    overlay.className = 'konami-overlay';
    overlay.innerHTML = `
        <div class="konami-title">🎮 DEVELOPER MODE UNLOCKED</div>
        <div class="konami-stats">
            <div>⚡ ServiceNow Learning Hub Stats</div>
            <div>------------------------------</div>
            <div>Active Session ID: <span id="konamiSessionId"></span></div>
            <div>Current Theme: <span id="konamiTheme"></span></div>
            <div>Viewport Size: <span id="konamiViewport"></span></div>
            <div>Platform OS: Windows (Antigravity IDE)</div>
            <div style="margin-top: 16px; color: #888;">Press ESC or click anywhere to close</div>
        </div>
    `;
    document.body.appendChild(overlay);

    const sequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let index = 0;

    function closeKonami() {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === sequence[index] || e.key.toLowerCase() === sequence[index]) {
            index++;
            if (index === sequence.length) {
                index = 0;
                document.getElementById('konamiSessionId').innerText = globalSessionId || 'default';
                document.getElementById('konamiTheme').innerText = document.documentElement.getAttribute('data-theme') || 'emerald';
                document.getElementById('konamiViewport').innerText = `${window.innerWidth}x${window.innerHeight}`;
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        } else {
            index = 0;
        }

        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeKonami();
        }
    });

    overlay.addEventListener('click', () => {
        closeKonami();
    });
})();

