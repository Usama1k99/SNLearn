// ============================================
// IRM PAGE SCRIPTS
// ============================================

// -- Tabs --
function initTabs() {
    document.querySelectorAll('.tabs-container').forEach(container => {
        const buttons = container.querySelectorAll('.tab-btn');
        const panels = container.querySelectorAll('.tab-panel');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;

                buttons.forEach(b => b.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));

                btn.classList.add('active');
                container.querySelector(`#${target}`).classList.add('active');
            });
        });
    });
}

// -- Accordion --
function initAccordion() {
    document.querySelectorAll('.accordion-trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.accordion-item');
            const isOpen = item.classList.contains('open');

            // Close all in same accordion
            item.closest('.accordion').querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('open');
            });

            if (!isOpen) {
                item.classList.add('open');
            }
        });
    });
}

// -- Copy Code --
function initCodeCopy() {
    document.querySelectorAll('.code-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.closest('.code-block').querySelector('code');
            navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                const original = btn.textContent;
                btn.textContent = 'Copied!';
                btn.style.color = 'var(--success)';
                setTimeout(() => {
                    btn.textContent = original;
                    btn.style.color = '';
                }, 2000);
            });
        });
    });
}

// -- Active TOC tracking --
function initTocTracking() {
    const tocLinks = document.querySelectorAll('.toc-link');
    if (!tocLinks.length) return;

    const sections = [];
    tocLinks.forEach(link => {
        const id = link.getAttribute('href')?.replace('#', '');
        const el = document.getElementById(id);
        if (el) sections.push({ el, link });
    });

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                tocLinks.forEach(l => l.classList.remove('active'));
                const match = sections.find(s => s.el === entry.target);
                if (match) match.link.classList.add('active');
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1
    });

    sections.forEach(s => observer.observe(s.el));
}

// -- Active sidebar link based on current page --
function initActiveSidebar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// -- Diagram Controls: Zoom, Pan & Fullscreen --
function setupDiagramControls() {
    document.querySelectorAll('.diagram-block').forEach((block, idx) => {
        const mermaidContainer = block.querySelector('.mermaid');
        if (!mermaidContainer || block.querySelector('.diagram-toolbar')) return;

        // Create toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'diagram-toolbar';
        toolbar.innerHTML = `
            <div class="diagram-zoom-level" id="zoom-level-${idx}">100%</div>
            <button class="diagram-btn diagram-btn-zoom-out" title="Zoom Out (Ctrl + Scroll Down / Alt + -)" aria-label="Zoom Out">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button class="diagram-btn diagram-btn-reset" title="Reset Zoom" aria-label="Reset Zoom">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </button>
            <button class="diagram-btn diagram-btn-zoom-in" title="Zoom In (Ctrl + Scroll Up / Alt + +)" aria-label="Zoom In">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            </button>
            <button class="diagram-btn diagram-btn-fullscreen" title="Toggle Fullscreen" aria-label="Toggle Fullscreen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
            </button>
        `;

        const titleEl = block.querySelector('.diagram-title');
        if (titleEl) {
            const headerWrapper = document.createElement('div');
            headerWrapper.className = 'diagram-header-row';
            titleEl.parentNode.insertBefore(headerWrapper, titleEl);
            headerWrapper.appendChild(titleEl);
            headerWrapper.appendChild(toolbar);
        } else {
            block.insertBefore(toolbar, mermaidContainer);
        }

        let zoom = 1.0;
        const zoomLevelEl = block.querySelector(`#zoom-level-${idx}`);

        function applyZoom(newZoom) {
            zoom = Math.max(0.2, Math.min(2.5, Math.round(newZoom * 10) / 10));
            const svg = mermaidContainer.querySelector('svg');
            if (svg) {
                svg.style.transform = `scale(${zoom})`;
                svg.style.transformOrigin = 'top center';
            }
            if (zoomLevelEl) {
                zoomLevelEl.textContent = `${Math.round(zoom * 100)}%`;
            }
            if (zoom > 1.05) {
                mermaidContainer.classList.add('is-zoomed');
            } else {
                mermaidContainer.classList.remove('is-zoomed');
            }
        }

        toolbar.querySelector('.diagram-btn-zoom-in')?.addEventListener('click', () => applyZoom(zoom + 0.1));
        toolbar.querySelector('.diagram-btn-zoom-out')?.addEventListener('click', () => applyZoom(zoom - 0.1));
        toolbar.querySelector('.diagram-btn-reset')?.addEventListener('click', () => applyZoom(1.0));

        // Intercept Ctrl/Meta + Scroll Wheel to step zoom levels and suppress default browser window zoom
        block.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const step = 0.10;
                if (e.deltaY < 0) {
                    applyZoom(zoom + step);
                } else if (e.deltaY > 0) {
                    applyZoom(zoom - step);
                }
            }
        }, { passive: false });

        const fullscreenBtn = toolbar.querySelector('.diagram-btn-fullscreen');
        const EXPAND_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>';
        const CLOSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

        let placeholderNode = null;

        // Ensure global portal overlay exists on document.body
        let overlay = document.getElementById('diagramModalOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'diagramModalOverlay';
            overlay.className = 'diagram-modal-overlay';
            document.body.appendChild(overlay);

            // Close when clicking the backdrop mask outside the modal card
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeFullscreen();
                }
            });
        }

        function openFullscreen() {
            placeholderNode = document.createElement('div');
            placeholderNode.className = 'diagram-block-placeholder';
            placeholderNode.style.display = 'none';
            block.parentNode.insertBefore(placeholderNode, block);

            overlay.innerHTML = '';
            overlay.appendChild(block);
            overlay.classList.add('active');
            document.body.classList.add('diagram-modal-open');

            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = CLOSE_ICON;
                fullscreenBtn.title = 'Close Fullscreen (Esc)';
                fullscreenBtn.setAttribute('aria-label', 'Close Fullscreen');
            }

            applyZoom(1.0);
        }

        function closeFullscreen() {
            if (!placeholderNode || !placeholderNode.parentNode) return;

            placeholderNode.parentNode.insertBefore(block, placeholderNode);
            placeholderNode.remove();
            placeholderNode = null;

            overlay.classList.remove('active');
            overlay.innerHTML = '';
            document.body.classList.remove('diagram-modal-open');

            if (fullscreenBtn) {
                fullscreenBtn.innerHTML = EXPAND_ICON;
                fullscreenBtn.title = 'Toggle Fullscreen';
                fullscreenBtn.setAttribute('aria-label', 'Toggle Fullscreen');
            }

            applyZoom(1.0);
        }

        function toggleFullscreen() {
            if (overlay.classList.contains('active') && overlay.contains(block)) {
                closeFullscreen();
            } else {
                openFullscreen();
            }
        }

        fullscreenBtn?.addEventListener('click', toggleFullscreen);

        // Escape key listener to close fullscreen
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('active') && overlay.contains(block)) {
                closeFullscreen();
            }
        });

        // Mouse drag panning when zoomed
        let isDragging = false;
        let startX, startY, scrollLeft, scrollTop;

        mermaidContainer.addEventListener('mousedown', (e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            isDragging = true;
            mermaidContainer.classList.add('is-dragging');
            startX = e.pageX - mermaidContainer.offsetLeft;
            startY = e.pageY - mermaidContainer.offsetTop;
            scrollLeft = mermaidContainer.scrollLeft;
            scrollTop = mermaidContainer.scrollTop;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
            mermaidContainer.classList.remove('is-dragging');
        });

        mermaidContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - mermaidContainer.offsetLeft;
            const y = e.pageY - mermaidContainer.offsetTop;
            const walkX = (x - startX) * 1.5;
            const walkY = (y - startY) * 1.5;
            mermaidContainer.scrollLeft = scrollLeft - walkX;
            mermaidContainer.scrollTop = scrollTop - walkY;
        });
    });
}

// -- Load and initialize Mermaid cleanly via dynamic ES import --
async function initMermaid() {
    if (document.querySelectorAll('.mermaid').length === 0) return;

    try {
        const { default: mermaid } = await import('https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs');
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            themeVariables: {
                edgeLabelBackground: 'transparent',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
                fontSize: '14px',
                actorFontSize: '14px',
                messageFontSize: '13px'
            },
            sequence: {
                useMaxWidth: false,
                actorFontSize: 14,
                messageFontSize: 13,
                noteFontSize: 13,
                width: 170,
                boxMargin: 12,
                mirrorActors: false
            },
            er: {
                useMaxWidth: false,
                fontSize: 14
            },
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis'
            }
        });

        // Explicitly trigger Mermaid rendering for all .mermaid elements
        await mermaid.run({
            querySelector: '.mermaid'
        });

        // Setup diagram toolbar controls and post-render styling
        setupDiagramControls();

        // 1) Force rounded corners on ALL rects
        document.querySelectorAll('.mermaid svg rect').forEach(r => {
            if (!r.closest('.cluster')) {
                r.setAttribute('rx', '8');
                r.setAttribute('ry', '8');
            }
        });

        // 2) Make cluster rects invisible
        document.querySelectorAll('.mermaid svg .cluster rect').forEach(r => {
            r.style.fill = 'transparent';
            r.style.stroke = 'transparent';
        });

        // 3) Interactive "to" and "from" node glow on hover + Enhanced Hitboxes
        document.querySelectorAll('.mermaid svg').forEach(svg => {
            const nodes = svg.querySelectorAll('.node');
            let edges = svg.querySelectorAll('.edgePath');

            if (nodes.length === 0 && edges.length === 0) return;

            // Create invisible hitboxes for easier hovering
            edges.forEach(edge => {
                const path = edge.querySelector('.path');
                if (path && !edge.querySelector('.hitbox')) {
                    const hitbox = path.cloneNode(true);
                    hitbox.classList.add('hitbox');
                    hitbox.style.stroke = 'transparent';
                    hitbox.style.strokeWidth = '24px';
                    hitbox.style.fill = 'none';
                    hitbox.style.cursor = 'pointer';
                    hitbox.style.pointerEvents = 'stroke';
                    hitbox.removeAttribute('id');
                    if (path.hasAttribute('marker-end')) hitbox.removeAttribute('marker-end');
                    edge.appendChild(hitbox);
                }
            });

            nodes.forEach(node => {
                node.addEventListener('mouseenter', () => {
                    const nodeId = node.id || '';
                    const cleanId = nodeId.replace(/^flowchart-/, '').replace(/-\d+$/, '');
                    if (!cleanId) return;

                    node.classList.add('active-glow');

                    edges.forEach(edge => {
                        const cls = edge.className ? (edge.className.baseVal || '') : '';
                        if (cls.includes('LS-' + cleanId) || cls.includes('LE-' + cleanId)) {
                            edge.classList.add('active-glow');

                            nodes.forEach(other => {
                                const otherId = (other.id || '').replace(/^flowchart-/, '').replace(/-\d+$/, '');
                                if (otherId && otherId !== cleanId &&
                                    (cls.includes('LS-' + otherId) || cls.includes('LE-' + otherId))) {
                                    other.classList.add('active-glow');
                                }
                            });
                        }
                    });
                });

                node.addEventListener('mouseleave', () => {
                    svg.querySelectorAll('.active-glow').forEach(el => el.classList.remove('active-glow'));
                });
            });

            edges.forEach(edge => {
                edge.addEventListener('mouseenter', () => {
                    const cls = edge.className ? (edge.className.baseVal || '') : '';
                    edge.classList.add('active-glow');
                    nodes.forEach(node => {
                        const cleanId = (node.id || '').replace(/^flowchart-/, '').replace(/-\d+$/, '');
                        if (cleanId && (cls.includes('LS-' + cleanId) || cls.includes('LE-' + cleanId))) {
                            node.classList.add('active-glow');
                        }
                    });
                });

                edge.addEventListener('mouseleave', () => {
                    svg.querySelectorAll('.active-glow').forEach(el => el.classList.remove('active-glow'));
                });
            });
        });
    } catch (err) {
        console.error('Error loading Mermaid library:', err);
    }
}

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAccordion();
    initCodeCopy();
    initTocTracking();
    initActiveSidebar();
    initMermaid();
});
