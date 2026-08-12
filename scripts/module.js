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

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initAccordion();
    initCodeCopy();
    initTocTracking();
    initActiveSidebar();

    // Dynamically load Mermaid & setup global interactive graph effects
    if (document.querySelectorAll('.mermaid').length > 0) {
        const script = document.createElement('script');
        script.type = 'module';
        script.innerHTML = `
            import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
            mermaid.initialize({ 
                startOnLoad: true, 
                theme: 'dark',
                themeVariables: {
                    edgeLabelBackground: 'transparent'
                }
            });
            
            // Post-render: rounded corners + interactive glow
            setTimeout(() => {
                // 1) Force rounded corners on ALL rects (catches sequence diagram actors)
                document.querySelectorAll('.mermaid svg rect').forEach(r => {
                    if (!r.closest('.cluster')) {
                        r.setAttribute('rx', '8');
                        r.setAttribute('ry', '8');
                    }
                });
                
                // 2) Make cluster rects invisible (backup for CSS)
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
                            // Ensure hitbox doesn't have the visible styling
                            hitbox.removeAttribute('id');
                            if(path.hasAttribute('marker-end')) hitbox.removeAttribute('marker-end');
                            edge.appendChild(hitbox);
                        }
                    });

                    nodes.forEach(node => {
                        node.addEventListener('mouseenter', () => {
                            const nodeId = node.id || '';
                            const cleanId = nodeId.replace(/^flowchart-/, '').replace(/-\\d+$/, '');
                            if (!cleanId) return;
                            
                            node.classList.add('active-glow');
                            
                            edges.forEach(edge => {
                                const cls = edge.className ? (edge.className.baseVal || '') : '';
                                if (cls.includes('LS-' + cleanId) || cls.includes('LE-' + cleanId)) {
                                    edge.classList.add('active-glow');
                                    
                                    // Find the OTHER node connected by this edge
                                    nodes.forEach(other => {
                                        const otherId = (other.id || '').replace(/^flowchart-/, '').replace(/-\\d+$/, '');
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
                                const cleanId = (node.id || '').replace(/^flowchart-/, '').replace(/-\\d+$/, '');
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
            }, 1200);
        `;
        document.body.appendChild(script);
    }
});
