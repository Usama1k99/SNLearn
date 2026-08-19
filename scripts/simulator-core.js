let CurrentSimulatorData = null;

// ============================================
// RENDERER
// ============================================

function initSimulatorCore() {
    let data = null;
    if (typeof IrmSimulatorData !== 'undefined') data = IrmSimulatorData;
    else if (typeof SamSimulatorData !== 'undefined') data = SamSimulatorData;
    else if (typeof HamSimulatorData !== 'undefined') data = HamSimulatorData;
    else if (typeof SecopsSimulatorData !== 'undefined') data = SecopsSimulatorData;
    else if (typeof ItsmSimulatorData !== 'undefined') data = ItsmSimulatorData;
    else if (typeof SimulatorData !== 'undefined') data = SimulatorData;

    window.CurrentSimulatorData = data;
    if (!window.CurrentSimulatorData) {
        console.error('No SimulatorData found');
        return;
    }

    const tabsContainer = document.getElementById('sim-tabs-header');
    const contentContainer = document.getElementById('sim-tabs-content');
    if (!tabsContainer || !contentContainer) return;

    const tableKeys = Object.keys(window.CurrentSimulatorData);

    // Build tab buttons
    tableKeys.forEach((key, idx) => {
        const tab = window.CurrentSimulatorData[key];
        const btn = document.createElement('button');
        btn.className = 'sim-tab-btn' + (idx === 0 ? ' active' : '');
        btn.dataset.simTab = key;
        btn.innerHTML = `<span class="sim-tab-icon">${tab.icon}</span><span class="sim-tab-label">${tab.label}</span>`;
        tabsContainer.appendChild(btn);
    });

    // Build tab panels
    tableKeys.forEach((key, idx) => {
        const tab = window.CurrentSimulatorData[key];
        const panel = document.createElement('div');
        panel.className = 'sim-tab-panel' + (idx === 0 ? ' active' : '');
        panel.id = `sim-panel-${key}`;

        // Table meta header
        panel.innerHTML = `
            <div class="sim-table-meta">
                <div class="sim-table-meta-left">
                    <span class="sim-table-name"><code>${tab.table}</code></span>
                    <span class="sim-table-desc">${tab.description}</span>
                </div>
                <span class="sim-record-count">${tab.records.length} record${tab.records.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="sim-records-list" id="sim-records-${key}"></div>
            ${renderProcessExplanation(tab.processExplanation)}
        `;

        contentContainer.appendChild(panel);

        // Render records
        const recordsList = panel.querySelector(`#sim-records-${key}`);
        tab.records.forEach((record, rIdx) => {
            recordsList.appendChild(createRecordRow(tab, record, rIdx));
        });
    });

    // Tab switching
    tabsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.sim-tab-btn');
        if (!btn) return;
        const target = btn.dataset.simTab;

        tabsContainer.querySelectorAll('.sim-tab-btn').forEach(b => b.classList.remove('active'));
        contentContainer.querySelectorAll('.sim-tab-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(`sim-panel-${target}`).classList.add('active');
    });

    // Record expand/collapse
    contentContainer.addEventListener('click', (e) => {
        // Record header click
        const header = e.target.closest('.sim-record-header');
        if (header) {
            const row = header.closest('.sim-record-row');
            const isOpen = row.classList.contains('open');

            // Close all others in same panel
            row.closest('.sim-records-list').querySelectorAll('.sim-record-row.open').forEach(r => {
                if (r !== row) r.classList.remove('open');
            });

            row.classList.toggle('open', !isOpen);
            return;
        }

        // Reference info button click
        const refBtn = e.target.closest('.sim-ref-info-btn');
        if (refBtn) {
            e.stopPropagation();
            const tooltip = refBtn.querySelector('.sim-ref-tooltip');
            // Close all other tooltips
            document.querySelectorAll('.sim-ref-tooltip.visible').forEach(t => {
                if (t !== tooltip) t.classList.remove('visible');
            });

            // Position tooltip using fixed coords relative to the button
            const btnRect = refBtn.getBoundingClientRect();
            tooltip.style.top = (btnRect.bottom + 6) + 'px';
            tooltip.style.left = 'auto';
            tooltip.style.right = (window.innerWidth - btnRect.right) + 'px';

            tooltip.classList.toggle('visible');
            return;
        }
    });

    // Close tooltips on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.sim-ref-info-btn')) {
            document.querySelectorAll('.sim-ref-tooltip.visible').forEach(t => {
                t.classList.remove('visible');
            });
        }
    });

}

function createRecordRow(tab, record, idx) {
    const row = document.createElement('div');
    row.className = 'sim-record-row';

    // Determine display label for the record
    const primaryField = record.number || record.display_name || record.name || `Record ${idx + 1}`;
    const secondaryField = record.short_description || record.description || record.profile || '';
    
    // Status/State logic
    const stateField = tab.fields.find(f => f.name === 'state');
    const statusField = tab.fields.find(f => f.name === 'status');
    const activeField = tab.fields.find(f => f.name === 'active');
    
    let stateLabel = '';
    let stateClass = 'sim-badge-default';

    if (statusField && record.status) {
        stateLabel = getChoiceLabel(statusField, record.status);
        stateClass = getBadgeClass(record.status);
    } else if (stateField && record.state) {
        stateLabel = getChoiceLabel(stateField, record.state);
        stateClass = getBadgeClass(record.state);
    } else if (activeField && record.active) {
        stateLabel = record.active === 'true' ? 'Active' : 'Inactive';
        stateClass = record.active === 'true' ? 'sim-badge-active' : 'sim-badge-closed';
    }

    // Header (always visible)
    const header = document.createElement('div');
    header.className = 'sim-record-header';
    header.innerHTML = `
        <div class="sim-record-header-left">
            <span class="sim-record-id">${primaryField}</span>
            <span class="sim-record-title">${secondaryField.substring(0, 60)}${secondaryField.length > 60 ? '...' : ''}</span>
        </div>
        <div class="sim-record-header-right">
            ${stateLabel ? `<span class="sim-state-badge ${stateClass}">${stateLabel}</span>` : ''}
            <span class="sim-expand-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
        </div>
    `;

    // Form body (expandable)
    const body = document.createElement('div');
    body.className = 'sim-record-body';

    const form = document.createElement('div');
    form.className = 'sim-form';

    tab.fields.forEach(field => {
        const value = record[field.name];
        if (value === undefined) return;

        const fieldEl = document.createElement('div');
        fieldEl.className = 'sim-form-field';

        const labelEl = document.createElement('label');
        labelEl.className = 'sim-form-label';
        labelEl.textContent = field.label;

        const controlEl = document.createElement('div');
        controlEl.className = 'sim-form-control';

        switch (field.type) {
            case 'choice':
                controlEl.appendChild(renderChoiceField(field, value));
                break;
            case 'reference':
                controlEl.appendChild(renderReferenceField(field, value));
                break;
            case 'textarea':
                controlEl.appendChild(renderTextareaField(field, value));
                break;
            case 'number':
                controlEl.appendChild(renderNumberField(field, value));
                break;
            case 'datetime':
                controlEl.appendChild(renderDatetimeField(field, value));
                break;
            default:
                controlEl.appendChild(renderStringField(field, value));
        }

        fieldEl.appendChild(labelEl);
        fieldEl.appendChild(controlEl);
        form.appendChild(fieldEl);
    });

    body.appendChild(form);
    row.appendChild(header);
    row.appendChild(body);
    return row;
}

function renderChoiceField(field, value) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sim-select-wrapper';
    const select = document.createElement('select');
    select.className = 'sim-select';
    
    // Allow dropdown to be opened but revert any changes
    select.dataset.originalValue = value || '';
    select.addEventListener('change', function() {
        this.value = this.dataset.originalValue;
    });

    field.choices.forEach(choice => {
        const opt = document.createElement('option');
        opt.value = choice.value;
        opt.textContent = choice.label;
        if (choice.value === value) opt.selected = true;
        select.appendChild(opt);
    });

    if (!value) {
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = '— None —';
        emptyOpt.selected = true;
        select.insertBefore(emptyOpt, select.firstChild);
    }

    wrapper.appendChild(select);
    return wrapper;
}

function renderReferenceField(field, value) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sim-ref-wrapper';

    const valueEl = document.createElement('span');
    valueEl.className = 'sim-ref-value';
    valueEl.textContent = value || '— empty —';
    if (!value) valueEl.classList.add('sim-ref-empty');

    const infoBtn = document.createElement('button');
    infoBtn.className = 'sim-ref-info-btn';
    infoBtn.setAttribute('aria-label', `Reference info for ${field.label}`);
    infoBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" stroke-width="1.2"/>
            <path d="M7 6.5V10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
            <circle cx="7" cy="4.5" r="0.75" fill="currentColor"/>
        </svg>
        <span class="sim-ref-tooltip">
            <span class="sim-ref-tooltip-label">References</span>
            <code>${field.refTable}</code>
        </span>
    `;

    wrapper.appendChild(valueEl);
    wrapper.appendChild(infoBtn);
    return wrapper;
}

function renderTextareaField(field, value) {
    const textarea = document.createElement('div');
    textarea.className = 'sim-textarea';
    textarea.textContent = value || '— empty —';
    if (!value) textarea.classList.add('sim-empty');
    return textarea;
}

function renderNumberField(field, value) {
    const input = document.createElement('div');
    input.className = 'sim-input sim-input-number';
    input.textContent = value !== undefined && value !== '' ? value : '— empty —';
    if (value === undefined || value === '') input.classList.add('sim-empty');
    return input;
}

function renderDatetimeField(field, value) {
    const input = document.createElement('div');
    input.className = 'sim-input sim-input-datetime';
    input.textContent = value || '— empty —';
    if (!value) input.classList.add('sim-empty');
    return input;
}

function renderStringField(field, value) {
    const input = document.createElement('div');
    input.className = 'sim-input';
    input.textContent = value || '— empty —';
    if (!value) input.classList.add('sim-empty');
    return input;
}

function renderProcessExplanation(explanation) {
    if (!explanation) return '';
    let stepsHtml = explanation.steps.map(step => `
        <div class="sim-process-step">
            <h4>${step.heading}</h4>
            <p>${step.content}</p>
        </div>
    `).join('');

    return `
        <div class="sim-process-section">
            <div class="sim-process-header">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L18 6V14L10 18L2 14V6L10 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                    <path d="M10 9V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <circle cx="10" cy="7" r="0.75" fill="currentColor"/>
                </svg>
                <h3>${explanation.title}</h3>
            </div>
            <div class="sim-process-steps">
                ${stepsHtml}
            </div>
        </div>
    `;
}

function getChoiceLabel(field, value) {
    if (!field.choices) return value || '';
    const choice = field.choices.find(c => c.value === value);
    return choice ? choice.label : value || '';
}

function getBadgeClass(statusValue) {
    const closedStates = ['retired', 'closed'];
    const activeStates = ['published', 'monitor', 'compliant', 'mitigate'];
    const draftStates = ['draft', 'new'];
    const reviewStates = ['review', 'attest', 'assess', 'respond', 'awaiting_approval'];
    const specialStates = ['non_compliant', 'accept', 'avoid', 'transfer'];

    if (closedStates.includes(statusValue)) return 'sim-badge-closed';
    if (specialStates.includes(statusValue)) return 'sim-badge-special';
    if (reviewStates.includes(statusValue)) return 'sim-badge-review';
    if (activeStates.includes(statusValue)) return 'sim-badge-active';
    if (draftStates.includes(statusValue)) return 'sim-badge-draft';
    return 'sim-badge-default';
}

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initSimulatorCore);
