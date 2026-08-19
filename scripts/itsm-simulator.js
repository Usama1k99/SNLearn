const ItsmSimulatorData = {
    // -----------------------------------------------
    // TAB 1: Incident Management (incident)
    // -----------------------------------------------
    'incident': {
        label: 'Incidents',
        table: 'incident',
        icon: '🚨',
        description: 'Master incident restoration records tracking outages, priority matrix scoring, VIP callers, and resolution metrics.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'caller_id', label: 'Caller', type: 'reference', refTable: 'sys_user' },
            { name: 'category', label: 'Category', type: 'choice', choices: [
                { value: 'Software', label: 'Software' },
                { value: 'Hardware', label: 'Hardware' },
                { value: 'Network', label: 'Network' },
                { value: 'Database', label: 'Database' },
                { value: 'Inquiry', label: 'Inquiry / Access' }
            ]},
            { name: 'subcategory', label: 'Subcategory', type: 'string' },
            { name: 'business_service', label: 'Business Service', type: 'reference', refTable: 'cmdb_ci_service' },
            { name: 'cmdb_ci', label: 'Configuration Item', type: 'reference', refTable: 'cmdb_ci' },
            { name: 'impact', label: 'Impact', type: 'choice', choices: [
                { value: '1', label: '1 - High' },
                { value: '2', label: '2 - Medium' },
                { value: '3', label: '3 - Low' }
            ]},
            { name: 'urgency', label: 'Urgency', type: 'choice', choices: [
                { value: '1', label: '1 - High' },
                { value: '2', label: '2 - Medium' },
                { value: '3', label: '3 - Low' }
            ]},
            { name: 'priority', label: 'Priority (Data Lookup)', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'New' },
                { value: '2', label: 'In Progress' },
                { value: '3', label: 'On Hold' },
                { value: '6', label: 'Resolved' },
                { value: '7', label: 'Closed' },
                { value: '8', label: 'Canceled' }
            ]},
            { name: 'hold_reason', label: 'On Hold Reason', type: 'choice', choices: [
                { value: '', label: '-- None --' },
                { value: '1', label: 'Awaiting Caller' },
                { value: '3', label: 'Awaiting Problem' },
                { value: '4', label: 'Awaiting Vendor' },
                { value: '5', label: 'Awaiting Change' }
            ]},
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'major_incident_state', label: 'Major Incident (MIM)', type: 'choice', choices: [
                { value: 'none', label: 'None' },
                { value: 'proposed', label: 'Candidate Proposed' },
                { value: 'accepted', label: 'MIM Accepted (Active Outage)' },
                { value: 'rejected', label: 'Rejected' }
            ]},
            { name: 'problem_id', label: 'Associated Problem', type: 'reference', refTable: 'problem' },
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'close_code', label: 'Resolution Code', type: 'choice', choices: [
                { value: '', label: '-- Open / Unresolved --' },
                { value: 'Solved (Permanently)', label: 'Solved (Permanently)' },
                { value: 'Solved (Workaround)', label: 'Solved (Workaround)' },
                { value: 'Not Solved (Not Reproducible)', label: 'Not Solved (Not Reproducible)' },
                { value: 'Closed Resolved by Caller', label: 'Closed Resolved by Caller' }
            ]}
        ],
        records: [
            {
                number: 'INC0010482',
                caller_id: 'Sarah Jenkins (VP Global Trading - VIP)',
                category: 'Database',
                subcategory: 'Oracle DB',
                business_service: 'Global Payment Processing Service',
                cmdb_ci: 'prdsrv-oracle-core01',
                impact: '1',
                urgency: '1',
                priority: '1',
                state: '2',
                hold_reason: '',
                assignment_group: 'Database Engineering L3',
                assigned_to: 'Alex Rivera',
                major_incident_state: 'accepted',
                problem_id: 'PRB0010042',
                short_description: 'Global Payment Gateway API returning HTTP 504 Gateway Timeout during market open',
                close_code: ''
            },
            {
                number: 'INC0010495',
                caller_id: 'Marcus Vance (Customer Support Operations)',
                category: 'Network',
                subcategory: 'Wireless & VPN',
                business_service: 'Corporate Remote Access Service',
                cmdb_ci: 'vpn-east-gateway-cluster',
                impact: '2',
                urgency: '2',
                priority: '2',
                state: '3',
                hold_reason: '4',
                assignment_group: 'Network Infrastructure',
                assigned_to: 'David Chen',
                major_incident_state: 'none',
                problem_id: 'PRB0009821',
                short_description: 'Intermittent packet loss on secondary VPN IPSec tunnel during transatlantic video calls',
                close_code: ''
            },
            {
                number: 'INC0010501',
                caller_id: 'DevOps Automated Alert Engine (System User)',
                category: 'Software',
                subcategory: 'Cloud Kubernetes',
                business_service: 'Customer Self-Service Portal',
                cmdb_ci: 'k8s-ingress-prod-02',
                impact: '1',
                urgency: '1',
                priority: '1',
                state: '2',
                hold_reason: '',
                assignment_group: 'Kubernetes DevOps Squad',
                assigned_to: 'Rachel Scott',
                major_incident_state: 'proposed',
                problem_id: 'PRB0010115',
                short_description: 'Envoy ingress controller pods terminating due to memory threshold breach on node pool 3',
                close_code: ''
            },
            {
                number: 'INC0010512',
                caller_id: 'Siddharth Nair (HR Business Operations)',
                category: 'Inquiry',
                subcategory: 'Single Sign-On (SSO)',
                business_service: 'Identity & Access Management',
                cmdb_ci: 'auth-okta-connector-01',
                impact: '2',
                urgency: '3',
                priority: '3',
                state: '2',
                hold_reason: '',
                assignment_group: 'IAM Operations',
                assigned_to: 'Chloe Adams',
                major_incident_state: 'none',
                problem_id: '',
                short_description: 'New hire batch Okta user profile SCIM synchronization experiencing 45-minute latency',
                close_code: ''
            },
            {
                number: 'INC0010310',
                caller_id: 'Elena Rostova (Compliance & Audit Analyst)',
                category: 'Hardware',
                subcategory: 'Workstation macOS',
                business_service: 'Corporate End-User Computing',
                cmdb_ci: 'corp-laptop-mac-881',
                impact: '3',
                urgency: '3',
                priority: '4',
                state: '6',
                hold_reason: '',
                assignment_group: 'Service Desk L1',
                assigned_to: 'Michael Thorne',
                major_incident_state: 'none',
                problem_id: '',
                short_description: 'Outlook desktop search index corrupted after macOS Sequoia operating system update',
                close_code: 'Solved (Permanently)'
            }
        ],
        processExplanation: {
            title: 'Incident Lifecycle, Priority Matrix & Major Outage Management',
            steps: [
                {
                    heading: '1. Ingestion & Dynamic Priority Scoring',
                    content: 'When an incident is logged via Employee Center, Agent Workspace, or Event Management alerts, the <code>dl_u_priority</code> table calculates the Priority dynamically from Impact (1–3) and Urgency (1–3). VIP callers trigger automated business rule escalations.'
                },
                {
                    heading: '2. On-Hold State & Contractual SLA Pausing',
                    content: 'When an engineer transitions the state to <code>On Hold (3)</code> with <code>hold_reason = Awaiting Caller (1)</code> or <code>Awaiting Vendor (4)</code>, the SLA Engine pause condition evaluates to true, freezing the contractual SLA timer until the third party responds.'
                },
                {
                    heading: '3. Major Incident (MIM) Elevation',
                    content: 'For P1 Critical failures affecting core business services (e.g., <code>INC0010482</code>), resolvers click "Propose Major Incident" to alert the Major Incident Manager, spin up the technical bridge, and notify executive leadership.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 2: Major Incident Tasks (incident_task)
    // -----------------------------------------------
    'incident_task': {
        label: 'Incident Tasks',
        table: 'incident_task',
        icon: '📋',
        description: 'Subdivided diagnostic and recovery work packages assigned to specialized technical squads during Major Incident (MIM) triage.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'incident', label: 'Parent Incident', type: 'reference', refTable: 'incident' },
            { name: 'incident_task_type', label: 'Task Type', type: 'choice', choices: [
                { value: 'investigation', label: 'Investigation' },
                { value: 'recovery', label: 'Recovery' },
                { value: 'mitigation', label: 'Mitigation' },
                { value: 'communication', label: 'Communication' }
            ]},
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'Draft' },
                { value: '2', label: 'Work in Progress' },
                { value: '3', label: 'Closed Complete' },
                { value: '4', label: 'Closed Incomplete' }
            ]},
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'work_notes', label: 'Latest Work Notes', type: 'string' }
        ],
        records: [
            {
                number: 'INCTASK0001041',
                incident: 'INC0010482',
                incident_task_type: 'investigation',
                assignment_group: 'Cloud Platform Engineering',
                assigned_to: 'Tyler Vance',
                state: '2',
                priority: '1',
                short_description: 'Analyze AWS Transit Gateway CloudWatch metric drops and packet buffer saturations',
                work_notes: 'Packet loss identified on Transit Gateway Attachment 3 connecting to Oracle Primary Node.'
            },
            {
                number: 'INCTASK0001042',
                incident: 'INC0010482',
                incident_task_type: 'recovery',
                assignment_group: 'Database Engineering L3',
                assigned_to: 'Alex Rivera',
                state: '3',
                priority: '1',
                short_description: 'Execute automated database failover to Standby Oracle Cluster in US-East-2',
                work_notes: 'Database VIP successfully shifted. Read/Write connections restored with zero data divergence.'
            },
            {
                number: 'INCTASK0001043',
                incident: 'INC0010482',
                incident_task_type: 'communication',
                assignment_group: 'MIM Communications Squad',
                assigned_to: 'Jessica Morales',
                state: '2',
                priority: '1',
                short_description: 'Publish executive 30-minute status broadcast to Business Operations leadership',
                work_notes: 'Notification sent to 450 stakeholders via Notify SMS and Teams Broadcast channel.'
            },
            {
                number: 'INCTASK0001044',
                incident: 'INC0010495',
                incident_task_type: 'investigation',
                assignment_group: 'Network Infrastructure',
                assigned_to: 'David Chen',
                state: '2',
                priority: '2',
                short_description: 'Engage Cisco TAC for real-time packet capture on Gigabit optical transceivers',
                work_notes: 'TAC engineer reviewing wireshark capture for fragmented IPSec tunnel handshakes.'
            },
            {
                number: 'INCTASK0001045',
                incident: 'INC0010501',
                incident_task_type: 'mitigation',
                assignment_group: 'Kubernetes DevOps Squad',
                assigned_to: 'Rachel Scott',
                state: '3',
                priority: '1',
                short_description: 'Temporarily increase Envoy sidecar memory limit from 1Gi to 4Gi across ingress daemonset',
                work_notes: 'Kubernetes patch deployed. Pod restarts halted and gateway response times stabilized.'
            }
        ],
        processExplanation: {
            title: 'Major Incident Task Delegation & Multi-Squad Coordination',
            steps: [
                {
                    heading: '1. Parallel Investigation & Recovery',
                    content: 'During P1/P2 Major Incidents, the Major Incident Manager decomposes the troubleshooting effort into parallel <code>incident_task</code> records assigned to Cloud, Database, and Network teams.'
                },
                {
                    heading: '2. Synchronized Parent Closure',
                    content: 'The master incident cannot be resolved until all mandatory investigation and recovery child tasks are completed.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 3: Problem Management & KEDB (problem)
    // -----------------------------------------------
    'problem': {
        label: 'Problems',
        table: 'problem',
        icon: '🔍',
        description: 'Root cause forensic records identifying underlying software defects, hardware flaws, and Known Error Database workarounds.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'first_reported_by_task', label: 'Originating Task', type: 'reference', refTable: 'incident' },
            { name: 'cmdb_ci', label: 'Configuration Item', type: 'reference', refTable: 'cmdb_ci' },
            { name: 'impact', label: 'Impact', type: 'choice', choices: [
                { value: '1', label: '1 - High' },
                { value: '2', label: '2 - Medium' },
                { value: '3', label: '3 - Low' }
            ]},
            { name: 'urgency', label: 'Urgency', type: 'choice', choices: [
                { value: '1', label: '1 - High' },
                { value: '2', label: '2 - Medium' },
                { value: '3', label: '3 - Low' }
            ]},
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '101', label: 'New' },
                { value: '102', label: 'Assess' },
                { value: '103', label: 'Root Cause Analysis' },
                { value: '104', label: 'Fix in Progress' },
                { value: '106', label: 'Resolved' },
                { value: '107', label: 'Closed' },
                { value: '108', label: 'Canceled' }
            ]},
            { name: 'known_error', label: 'Known Error (KEDB)', type: 'choice', choices: [
                { value: 'true', label: 'Yes - Published to KEDB' },
                { value: 'false', label: 'No' }
            ]},
            { name: 'resolution_code', label: 'Resolution Code', type: 'choice', choices: [
                { value: '', label: '-- In Investigation --' },
                { value: '101', label: 'Solved (Permanently)' },
                { value: '102', label: 'Solved (Workaround)' },
                { value: '103', label: 'Canceled (Duplicate)' },
                { value: '104', label: 'Closed Risk Accepted' }
            ]},
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'short_description', label: 'Problem Statement', type: 'string' },
            { name: 'cause_notes', label: 'Root Cause Details', type: 'string' },
            { name: 'workaround', label: 'Step-by-Step Workaround', type: 'string' }
        ],
        records: [
            {
                number: 'PRB0010042',
                first_reported_by_task: 'INC0010482',
                cmdb_ci: 'prdsrv-oracle-core01',
                impact: '1',
                urgency: '1',
                priority: '1',
                state: '103',
                known_error: 'true',
                resolution_code: '102',
                assignment_group: 'Database Engineering L3',
                assigned_to: 'Alex Rivera',
                short_description: 'Recurring connection pool socket exhaustion in JDBC driver under thread concurrency',
                cause_notes: 'Underlying JDBC driver v4.2 fails to release pooled socket handles during SSL TLSv1.3 renegotiation.',
                workaround: 'Execute DB connection pool flush via cron every 4 hours or disable SSL session resumption cache.'
            },
            {
                number: 'PRB0009821',
                first_reported_by_task: 'INC0010495',
                cmdb_ci: 'vpn-east-gateway-cluster',
                impact: '2',
                urgency: '2',
                priority: '2',
                state: '106',
                known_error: 'true',
                resolution_code: '101',
                assignment_group: 'Network Infrastructure',
                assigned_to: 'David Chen',
                short_description: 'IPSec tunnel MTU size fragmentation on Gigabit fiber interfaces',
                cause_notes: 'Firmware buffer allocation bug on Cisco ASA 5585-X causes kernel packet drops on frames > 1420 bytes.',
                workaround: 'Clamp TCP MSS to 1360 in router firewall policy until firmware upgrade.'
            },
            {
                number: 'PRB0010115',
                first_reported_by_task: 'INC0010501',
                cmdb_ci: 'k8s-ingress-prod-02',
                impact: '1',
                urgency: '2',
                priority: '2',
                state: '104',
                known_error: 'true',
                resolution_code: '',
                assignment_group: 'Kubernetes DevOps Squad',
                assigned_to: 'Rachel Scott',
                short_description: 'Memory leak in Envoy Ingress Sidecar during HTTP/2 multiplexed streams',
                cause_notes: 'Envoy proxy v1.26 retains abandoned stream buffers in memory when client terminates TCP RST prematurely.',
                workaround: 'Enforce max_connection_duration to 300s in envoy.yaml to force connection recycle.'
            },
            {
                number: 'PRB0008740',
                first_reported_by_task: 'INC0008102',
                cmdb_ci: 'erp-batch-mainframe-01',
                impact: '3',
                urgency: '3',
                priority: '4',
                state: '107',
                known_error: 'false',
                resolution_code: '104',
                assignment_group: 'Legacy Systems Group',
                assigned_to: 'Arthur Pendelton',
                short_description: 'Legacy ERP COBOL batch buffer overflow during end-of-month financial reconciliation',
                cause_notes: 'Legacy fixed 32-bit integer array overflows when transaction count exceeds 2,147,483 records.',
                workaround: 'Split month-end batch execution into two consecutive sub-runs (1st-15th, 16th-31st).'
            },
            {
                number: 'PRB0010204',
                first_reported_by_task: 'INC0010512',
                cmdb_ci: 'auth-okta-connector-01',
                impact: '2',
                urgency: '3',
                priority: '3',
                state: '102',
                known_error: 'false',
                resolution_code: '',
                assignment_group: 'IAM Operations',
                assigned_to: 'Chloe Adams',
                short_description: 'Okta SCIM synchronization rate-limit throttling during bulk HR worker onboarding',
                cause_notes: 'Under investigation. Suspected missing exponential backoff headers in custom SCIM bridge connector.',
                workaround: 'Batch new hire provisioning batches into max chunks of 50 users per hour.'
            }
        ],
        processExplanation: {
            title: 'KEDB Publishing & Cascade Synchronization',
            steps: [
                {
                    heading: '1. Documenting Root Cause & Workaround',
                    content: 'Once engineers identify the root cause, setting <code>known_error = true</code> generates a standardized KEDB article in <code>kb_knowledge</code> so Service Desk agents can apply workarounds immediately.'
                },
                {
                    heading: '2. Incident Workaround Sync',
                    content: 'Clicking "Communicate Workaround" runs <code>IncidentUtils.copyProblemWorkaround()</code> to automatically update all linked active incidents with step-by-step resolution steps.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 4: Problem Tasks (problem_task)
    // -----------------------------------------------
    'problem_task': {
        label: 'Problem Tasks',
        table: 'problem_task',
        icon: '🔬',
        description: 'Parallel engineering assignments for root cause investigation, temporary workaround formulation, and fix validation.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'problem', label: 'Parent Problem', type: 'reference', refTable: 'problem' },
            { name: 'problem_task_type', label: 'Task Type', type: 'choice', choices: [
                { value: 'rca', label: 'Root Cause Analysis' },
                { value: 'workaround', label: 'Workaround' },
                { value: 'general', label: 'General' }
            ]},
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '151', label: 'New' },
                { value: '152', label: 'Assess' },
                { value: '153', label: 'Work in Progress' },
                { value: '154', label: 'Closed Complete' },
                { value: '157', label: 'Canceled' }
            ]},
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'work_notes', label: 'Technical Findings', type: 'string' }
        ],
        records: [
            {
                number: 'PTASK0001088',
                problem: 'PRB0010042',
                problem_task_type: 'rca',
                assignment_group: 'Software Architecture L3',
                assigned_to: 'Dmitri Volkov',
                state: '153',
                priority: '1',
                short_description: 'Profile JDBC thread socket exhaustion using Java Flight Recorder',
                work_notes: 'JFR dump confirms leaked TCP sockets originating from com.oracle.jdbc.pool.HikariCPWorker.'
            },
            {
                number: 'PTASK0001089',
                problem: 'PRB0010042',
                problem_task_type: 'workaround',
                assignment_group: 'DevOps & Site Reliability',
                assigned_to: 'Liam O\'Connor',
                state: '154',
                priority: '1',
                short_description: 'Deploy automated cron container restart script every 4 hours until patch release',
                work_notes: 'Ansible playbook deployed across all 12 worker nodes. Memory leak mitigated in production.'
            },
            {
                number: 'PTASK0001090',
                problem: 'PRB0010115',
                problem_task_type: 'workaround',
                assignment_group: 'Kubernetes DevOps Squad',
                assigned_to: 'Rachel Scott',
                state: '154',
                priority: '2',
                short_description: 'Patch Envoy Ingress Helm values file to enable connection duration recycling',
                work_notes: 'ConfigMap updated with max_connection_duration: 300s. RSS memory flattened across pods.'
            },
            {
                number: 'PTASK0001091',
                problem: 'PRB0009821',
                problem_task_type: 'general',
                assignment_group: 'Network Infrastructure',
                assigned_to: 'David Chen',
                state: '154',
                priority: '2',
                short_description: 'Schedule firmware maintenance window for Cisco ASA Gateway cluster upgrade',
                work_notes: 'Change Request CHG0030250 raised for firmware upgrade scheduled on next Sunday window.'
            },
            {
                number: 'PTASK0001092',
                problem: 'PRB0010204',
                problem_task_type: 'rca',
                assignment_group: 'IAM Operations',
                assigned_to: 'Chloe Adams',
                state: '152',
                priority: '3',
                short_description: 'Audit Okta SCIM bridge pagination and rate-limit HTTP 429 response handling',
                work_notes: 'Connector code decompiled. Missing retry-after header parsing in Java SCIM client.'
            }
        ],
        processExplanation: {
            title: 'Problem Task Decomposition & Specialization',
            steps: [
                {
                    heading: '1. Multi-Disciplinary Forensics',
                    content: 'Complex enterprise problems are decomposed into specialized RCA and Workaround tasks without passing the master problem record back and forth across teams.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 5: Change Request (change_request)
    // -----------------------------------------------
    'change_request': {
        label: 'Change Requests',
        table: 'change_request',
        icon: '🛡️',
        description: 'Requests for Change (RFC) governing Normal, Standard, and Emergency production releases, CAB approvals, and conflict checks.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'type', label: 'Change Type', type: 'choice', choices: [
                { value: 'Normal', label: 'Normal (Full CAB & Risk Assessment)' },
                { value: 'Standard', label: 'Standard (Pre-Approved Template)' },
                { value: 'Emergency', label: 'Emergency (Urgent ECAB Outage Fix)' }
            ]},
            { name: 'cmdb_ci', label: 'Configuration Item', type: 'reference', refTable: 'cmdb_ci' },
            { name: 'business_service', label: 'Impacted Service', type: 'reference', refTable: 'cmdb_ci_service' },
            { name: 'risk', label: 'Calculated Risk', type: 'choice', choices: [
                { value: '1', label: '1 - Very High' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'impact', label: 'Impact', type: 'choice', choices: [
                { value: '1', label: '1 - High' },
                { value: '2', label: '2 - Medium' },
                { value: '3', label: '3 - Low' }
            ]},
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '-5', label: 'New' },
                { value: '-4', label: 'Assess' },
                { value: '-3', label: 'Authorize (CAB Review)' },
                { value: '-2', label: 'Scheduled' },
                { value: '-1', label: 'Implement' },
                { value: '0', label: 'Review (PIR)' },
                { value: '3', label: 'Closed' },
                { value: '4', label: 'Canceled' }
            ]},
            { name: 'cab_required', label: 'CAB Required', type: 'choice', choices: [
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' }
            ]},
            { name: 'cab_date', label: 'CAB Meeting Date', type: 'string' },
            { name: 'start_date', label: 'Planned Start', type: 'string' },
            { name: 'end_date', label: 'Planned End', type: 'string' },
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'justification', label: 'Business Justification', type: 'string' },
            { name: 'backout_plan', label: 'Rollback & Backout Plan', type: 'string' },
            { name: 'close_code', label: 'Closure Code', type: 'choice', choices: [
                { value: '', label: '-- Not Closed --' },
                { value: 'Successful', label: 'Successful' },
                { value: 'Successful with Issues', label: 'Successful with Issues' },
                { value: 'Unsuccessful', label: 'Unsuccessful' }
            ]}
        ],
        records: [
            {
                number: 'CHG0030194',
                type: 'Normal',
                cmdb_ci: 'prdsrv-oracle-core01',
                business_service: 'Global Payment Processing Service',
                risk: '2',
                impact: '1',
                state: '-3',
                cab_required: 'true',
                cab_date: '2026-09-10',
                start_date: '2026-09-12 02:00:00',
                end_date: '2026-09-12 05:00:00',
                assignment_group: 'Database Engineering L3',
                assigned_to: 'Alex Rivera',
                short_description: 'Upgrade Oracle Database Cluster Engine to 19c Enterprise Release 4',
                justification: 'Permanently eliminates connection pool socket leak identified in PRB0010042.',
                backout_plan: 'Restore cold storage RMAN snapshot from SAN LUN within 45 minutes.',
                close_code: ''
            },
            {
                number: 'CHG0030250',
                type: 'Standard',
                cmdb_ci: 'app_srv_farm_east',
                business_service: 'Corporate Internal Web Applications',
                risk: '4',
                impact: '3',
                state: '-2',
                cab_required: 'false',
                cab_date: '',
                start_date: '2026-09-01 01:00:00',
                end_date: '2026-09-01 03:00:00',
                assignment_group: 'Server Operations Team',
                assigned_to: 'Marcus Bell',
                short_description: 'Monthly OS Kernel Security Rollup Patching via Standard Template STDCHG_WIN_PATCH',
                justification: 'Routine monthly enterprise security compliance baseline maintenance.',
                backout_plan: 'Revert VMware virtual machine snapshot prior to reboot cycle.',
                close_code: ''
            },
            {
                number: 'CHG0030401',
                type: 'Emergency',
                cmdb_ci: 'edge_router_global_01',
                business_service: 'Enterprise WAN & Internet Perimeter',
                risk: '1',
                impact: '1',
                state: '-1',
                cab_required: 'true',
                cab_date: '2026-08-19',
                start_date: '2026-08-19 11:00:00',
                end_date: '2026-08-19 12:00:00',
                assignment_group: 'Network Infrastructure',
                assigned_to: 'David Chen',
                short_description: 'Emergency Hotfix for Zero-Day OpenSSL Vulnerability CVE-2026-9812 on Edge Routers',
                justification: 'Critical zero-day exploit actively observed in security telemetry.',
                backout_plan: 'Swap active BGP route tables to secondary standby hardware cluster.',
                close_code: ''
            },
            {
                number: 'CHG0030510',
                type: 'Normal',
                cmdb_ci: 'k8s-ingress-prod-02',
                business_service: 'Customer Self-Service Portal',
                risk: '3',
                impact: '2',
                state: '-4',
                cab_required: 'true',
                cab_date: '2026-09-17',
                start_date: '2026-09-18 03:00:00',
                end_date: '2026-09-18 04:30:00',
                assignment_group: 'Kubernetes DevOps Squad',
                assigned_to: 'Rachel Scott',
                short_description: 'Deploy Kubernetes Ingress Helm Chart v4.2 with Envoy memory leak fixes',
                justification: 'Permanently addresses Envoy stream leak documented in PRB0010115.',
                backout_plan: 'Helm rollback ingress-controller --revision 41.',
                close_code: ''
            },
            {
                number: 'CHG0030622',
                type: 'Standard',
                cmdb_ci: 'san-purestorage-tier1',
                business_service: 'Enterprise Storage Area Network',
                risk: '4',
                impact: '3',
                state: '3',
                cab_required: 'false',
                cab_date: '',
                start_date: '2026-08-15 00:00:00',
                end_date: '2026-08-15 01:00:00',
                assignment_group: 'Storage Engineering',
                assigned_to: 'Karen White',
                short_description: 'Add 2TB NVMe LUN storage expansion to VMware ESXi Cluster 04',
                justification: 'Storage capacity expansion for growing analytics datastore.',
                backout_plan: 'Unmount LUN and re-provision original volume size.',
                close_code: 'Successful'
            }
        ],
        processExplanation: {
            title: 'Change Governance & CAB Workbench Evaluation',
            steps: [
                {
                    heading: '1. Automated Risk Scoring & Conflict Radar',
                    content: 'ServiceNow calculates Risk from CI criticality and survey scores. The Conflict Engine evaluates blackout calendars (<code>cmn_schedule_blackout</code>) and active maintenance windows.'
                },
                {
                    heading: '2. In-Meeting CAB Authorizations',
                    content: 'In the CAB Workbench, CAB leaders review agenda items, inspect CI outage topology, and record live approvals directly updating <code>sysapproval_approver</code> records.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 6: Change Tasks (change_task)
    // -----------------------------------------------
    'change_task': {
        label: 'Change Tasks',
        table: 'change_task',
        icon: '⚙️',
        description: 'Discrete sequential technical execution tasks (Planning, Implementation, Testing, Post-Implementation Review).',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'change_request', label: 'Parent Change', type: 'reference', refTable: 'change_request' },
            { name: 'change_task_type', label: 'Task Type', type: 'choice', choices: [
                { value: 'Planning', label: 'Planning' },
                { value: 'Implementation', label: 'Implementation' },
                { value: 'Testing', label: 'Testing' },
                { value: 'Review', label: 'Post-Implementation Review' }
            ]},
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '-5', label: 'Pending' },
                { value: '1', label: 'Open' },
                { value: '2', label: 'Work in Progress' },
                { value: '3', label: 'Closed Complete' },
                { value: '4', label: 'Closed Incomplete' }
            ]},
            { name: 'planned_start_date', label: 'Planned Start', type: 'string' },
            { name: 'planned_end_date', label: 'Planned End', type: 'string' },
            { name: 'short_description', label: 'Short Description', type: 'string' }
        ],
        records: [
            {
                number: 'CTASK0004101',
                change_request: 'CHG0030194',
                change_task_type: 'Implementation',
                assignment_group: 'Database Engineering L3',
                assigned_to: 'Alex Rivera',
                state: '2',
                planned_start_date: '2026-09-12 02:00:00',
                planned_end_date: '2026-09-12 03:30:00',
                short_description: 'Execute Schema Migration DDL Scripts on Oracle Primary Node'
            },
            {
                number: 'CTASK0004102',
                change_request: 'CHG0030194',
                change_task_type: 'Testing',
                assignment_group: 'Quality Assurance & SRE',
                assigned_to: 'Priya Sharma',
                state: '-5',
                planned_start_date: '2026-09-12 03:30:00',
                planned_end_date: '2026-09-12 04:30:00',
                short_description: 'Execute automated post-deployment smoke test suite across all banking APIs'
            },
            {
                number: 'CTASK0004103',
                change_request: 'CHG0030194',
                change_task_type: 'Planning',
                assignment_group: 'Storage Engineering',
                assigned_to: 'Karen White',
                state: '3',
                planned_start_date: '2026-09-10 10:00:00',
                planned_end_date: '2026-09-10 12:00:00',
                short_description: 'Validate SAN LUN backup snapshot storage space allocation'
            },
            {
                number: 'CTASK0004104',
                change_request: 'CHG0030401',
                change_task_type: 'Implementation',
                assignment_group: 'Network Infrastructure',
                assigned_to: 'David Chen',
                state: '2',
                planned_start_date: '2026-08-19 11:00:00',
                planned_end_date: '2026-08-19 11:45:00',
                short_description: 'Deploy OpenSSL binary hotfix to edge_router_global_01 and reload routing daemons'
            },
            {
                number: 'CTASK0004105',
                change_request: 'CHG0030401',
                change_task_type: 'Review',
                assignment_group: 'Change Management Office',
                assigned_to: 'Evelyn Carter',
                state: '-5',
                planned_start_date: '2026-08-20 09:00:00',
                planned_end_date: '2026-08-20 10:00:00',
                short_description: 'Conduct formal Post-Implementation Review (PIR) for emergency router hotfix'
            }
        ],
        processExplanation: {
            title: 'Change Execution Sequencing & Stage Gating',
            steps: [
                {
                    heading: '1. Sequential Task Gating',
                    content: 'Testing tasks remain in Pending (-5) until Implementation tasks are marked Closed Complete (3), ensuring strict operational quality gates.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 7: Requested Items (sc_req_item)
    // -----------------------------------------------
    'sc_req_item': {
        label: 'Requested Items (RITM)',
        table: 'sc_req_item',
        icon: '📦',
        description: 'Tier-2 catalog line items ordered from the Service Catalog, executing dedicated Flow Designer workflows.',
        fields: [
            { name: 'number', label: 'RITM Number', type: 'string' },
            { name: 'request', label: 'Parent Order (REQ)', type: 'reference', refTable: 'sc_request' },
            { name: 'cat_item', label: 'Catalog Item', type: 'reference', refTable: 'sc_cat_item' },
            { name: 'quantity', label: 'Quantity', type: 'string' },
            { name: 'price', label: 'Price ($)', type: 'string' },
            { name: 'stage', label: 'Workflow Stage', type: 'choice', choices: [
                { value: 'waiting_for_approval', label: 'Waiting for Approval' },
                { value: 'fulfillment', label: 'Fulfillment' },
                { value: 'delivery', label: 'Delivery' },
                { value: 'complete', label: 'Complete' },
                { value: 'request_cancelled', label: 'Request Cancelled' }
            ]},
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'Open' },
                { value: '2', label: 'Work in Progress' },
                { value: '3', label: 'Closed Complete' },
                { value: '4', label: 'Closed Incomplete' }
            ]},
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'short_description', label: 'Short Description', type: 'string' }
        ],
        records: [
            {
                number: 'RITM0010042',
                request: 'REQ0010042',
                cat_item: 'MacBook Pro 16" M3 Max (Developer Spec 64GB RAM)',
                quantity: '1',
                price: '3499.00',
                stage: 'fulfillment',
                state: '2',
                assignment_group: 'Desktop Support L2',
                assigned_to: 'Chloe Adams',
                short_description: 'Standard Developer Workstation Provisioning for Sarah Jenkins'
            },
            {
                number: 'RITM0010043',
                request: 'REQ0010042',
                cat_item: 'Corporate AWS Sandbox Environment Access',
                quantity: '1',
                price: '0.00',
                stage: 'waiting_for_approval',
                state: '1',
                assignment_group: 'Cloud IAM Operations',
                assigned_to: '',
                short_description: 'Developer AWS Sandbox Account with $500 monthly budget ceiling'
            },
            {
                number: 'RITM0010055',
                request: 'REQ0010055',
                cat_item: 'Dual 27" 4K Dell UltraSharp USB-C Monitors',
                quantity: '2',
                price: '1150.00',
                stage: 'delivery',
                state: '2',
                assignment_group: 'Hardware Asset Logistics',
                assigned_to: 'Tyler Vance',
                short_description: 'Home Office Ergonomic Monitor Dispatch for Marcus Vance'
            },
            {
                number: 'RITM0010060',
                request: 'REQ0010060',
                cat_item: 'Production Oracle Read-Only Database Role Provisioning',
                quantity: '1',
                price: '0.00',
                stage: 'complete',
                state: '3',
                assignment_group: 'Database Operations',
                assigned_to: 'Alex Rivera',
                short_description: 'Grant SELECT role on ERP_FINANCE schema for Compliance Audit'
            },
            {
                number: 'RITM0010072',
                request: 'REQ0010072',
                cat_item: 'Ubiquiti Enterprise Wi-Fi 7 Access Point (Executive Home Lab)',
                quantity: '1',
                price: '299.00',
                stage: 'fulfillment',
                state: '1',
                assignment_group: 'Hardware Asset Management',
                assigned_to: 'Michael Thorne',
                short_description: 'High-speed remote office network hardware for VP Trading'
            }
        ],
        processExplanation: {
            title: '3-Tier Service Catalog Architecture & Flow Execution',
            steps: [
                {
                    heading: '1. Cart Submission to RITM Breakdown',
                    content: 'A single cart checkout (<code>sc_request</code>) splits into individual line items (<code>sc_req_item</code>), each executing its own Flow Designer approvals and variable capture.'
                },
                {
                    heading: '2. Multi-Stage Progress Tracking',
                    content: 'The <code>stage</code> field provides end users with transparent visibility (Waiting for Approval $\rightarrow$ Fulfillment $\rightarrow$ Delivery $\rightarrow$ Complete) on the Employee Center.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 8: Catalog Tasks (sc_task)
    // -----------------------------------------------
    'sc_task': {
        label: 'Catalog Tasks (SCTASK)',
        table: 'sc_task',
        icon: '🚚',
        description: 'Tier-3 discrete fulfillment tasks assigned to Procurement, Desktop Support, and IAM teams to deliver requested goods.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'request_item', label: 'Parent RITM', type: 'reference', refTable: 'sc_req_item' },
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'Open' },
                { value: '2', label: 'Work in Progress' },
                { value: '3', label: 'Closed Complete' },
                { value: '4', label: 'Closed Incomplete' }
            ]},
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'work_notes', label: 'Latest Fulfillment Notes', type: 'string' }
        ],
        records: [
            {
                number: 'SCTASK0010891',
                request_item: 'RITM0010042',
                assignment_group: 'Hardware Asset Management',
                assigned_to: 'Michael Thorne',
                state: '3',
                priority: '3',
                short_description: 'Procure & Allocate MacBook Serial Number from San Jose Stockroom',
                work_notes: 'Serial # MBP-M3-98442 assigned and asset record status updated to In Fulfillment.'
            },
            {
                number: 'SCTASK0010892',
                request_item: 'RITM0010042',
                assignment_group: 'Desktop Support L2',
                assigned_to: 'Chloe Adams',
                state: '2',
                priority: '3',
                short_description: 'Deploy Standard Developer Gold Master OS Image and Security Certificates',
                work_notes: 'MDM enrollment complete; deploying IntelliJ, Docker, and Cisco AnyConnect VPN.'
            },
            {
                number: 'SCTASK0010893',
                request_item: 'RITM0010043',
                assignment_group: 'Cloud IAM Operations',
                assigned_to: 'Tyler Vance',
                state: '1',
                priority: '3',
                short_description: 'Provision AWS IAM Sandbox Account and configure billing alert budget ceiling',
                work_notes: 'Awaiting manager approval verification before running Terraform workspace creation.'
            },
            {
                number: 'SCTASK0010894',
                request_item: 'RITM0010055',
                assignment_group: 'Hardware Asset Logistics',
                assigned_to: 'Liam O\'Connor',
                state: '2',
                priority: '4',
                short_description: 'Package and Dispatch Dual 4K Monitors via FedEx Overnight Courier',
                work_notes: 'Tracking # FDX-99412-882 created. Picked up by courier at dock 4.'
            },
            {
                number: 'SCTASK0010895',
                request_item: 'RITM0010060',
                assignment_group: 'Database Operations',
                assigned_to: 'Alex Rivera',
                state: '3',
                priority: '2',
                short_description: 'Execute SQL Grant Scripts on Oracle Production Replica Node',
                work_notes: 'GRANT SELECT ON ERP_FINANCE TO u_sarah_jenkins executed successfully.'
            }
        ],
        processExplanation: {
            title: 'Fulfillment Task Automation & Cross-Team Orchestration',
            steps: [
                {
                    heading: '1. Parallel & Sequential Handoffs',
                    content: 'Flow Designer generates child catalog tasks sequentially: Hardware Asset Management allocates physical serial numbers, then Desktop Support images the machine.'
                },
                {
                    heading: '2. Automatic Parent RITM Progression',
                    content: 'When all child <code>sc_task</code> records reach <code>Closed Complete (3)</code>, the parent RITM stage transitions to Complete and closes automatically.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 9: Task SLAs (task_sla)
    // -----------------------------------------------
    'task_sla': {
        label: 'SLA Timers (task_sla)',
        table: 'task_sla',
        icon: '⏱️',
        description: 'Active contract SLA instances tracking elapsed time, business schedule calculations, and breach milestones.',
        fields: [
            { name: 'task', label: 'Task Record', type: 'reference', refTable: 'task' },
            { name: 'sla', label: 'SLA Definition', type: 'reference', refTable: 'contract_sla' },
            { name: 'stage', label: 'Stage', type: 'choice', choices: [
                { value: 'in_progress', label: 'In Progress' },
                { value: 'paused', label: 'Paused (On-Hold)' },
                { value: 'completed', label: 'Completed (Met)' },
                { value: 'breached', label: 'Breached (Failed)' },
                { value: 'cancelled', label: 'Cancelled' }
            ]},
            { name: 'has_breached', label: 'Has Breached', type: 'choice', choices: [
                { value: 'false', label: 'False (Compliant)' },
                { value: 'true', label: 'True (Breached)' }
            ]},
            { name: 'percentage', label: 'Elapsed Actual (%)', type: 'string' },
            { name: 'business_percentage', label: 'Elapsed Business (%)', type: 'string' },
            { name: 'business_duration', label: 'Elapsed Business Time', type: 'string' },
            { name: 'business_time_left', label: 'Business Time Left', type: 'string' },
            { name: 'planned_end_time', label: 'Planned End Time', type: 'string' }
        ],
        records: [
            {
                task: 'INC0010482',
                sla: 'Priority 1 Resolution (4 Hours - 24x7 Continuous)',
                stage: 'in_progress',
                has_breached: 'false',
                percentage: '42.5%',
                business_percentage: '42.5%',
                business_duration: '1 Hour 42 Minutes',
                business_time_left: '2 Hours 18 Minutes',
                planned_end_time: '2026-08-19 14:30:00'
            },
            {
                task: 'INC0010495',
                sla: 'Priority 2 Resolution (8 Hours - 8x5 Weekdays)',
                stage: 'paused',
                has_breached: 'false',
                percentage: '35.0%',
                business_percentage: '18.2%',
                business_duration: '1 Hour 27 Minutes',
                business_time_left: '6 Hours 33 Minutes',
                planned_end_time: '2026-08-20 12:00:00'
            },
            {
                task: 'INC0010501',
                sla: 'Priority 1 Response (15 Minutes - 24x7)',
                stage: 'completed',
                has_breached: 'false',
                percentage: '33.3%',
                business_percentage: '33.3%',
                business_duration: '5 Minutes 02 Seconds',
                business_time_left: '0 Seconds',
                planned_end_time: '2026-08-19 09:15:00'
            },
            {
                task: 'INC0010512',
                sla: 'Priority 3 Resolution (3 Business Days - 8x5)',
                stage: 'in_progress',
                has_breached: 'false',
                percentage: '68.0%',
                business_percentage: '62.5%',
                business_duration: '15 Hours',
                business_time_left: '9 Hours (1.1 Days)',
                planned_end_time: '2026-08-21 17:00:00'
            },
            {
                task: 'RITM0010042',
                sla: 'Standard Laptop Fulfillment SLA (5 Days - 8x5)',
                stage: 'in_progress',
                has_breached: 'false',
                percentage: '40.0%',
                business_percentage: '40.0%',
                business_duration: '2 Business Days',
                business_time_left: '3 Business Days',
                planned_end_time: '2026-08-22 17:00:00'
            }
        ],
        processExplanation: {
            title: 'SLA Engine Timers & Contractual Compliance Tracking',
            steps: [
                {
                    heading: '1. Dynamic Business Schedule Calculations',
                    content: 'The SLA Engine computes both real-world wall-clock elapsed time and schedule-adjusted business duration (e.g. 8x5 excluding corporate weekends and holidays).'
                },
                {
                    heading: '2. Automated Escalation Milestone Alerts',
                    content: 'SLA workflows broadcast warning alerts at 50% and 75% elapsed duration to assignees and group managers before contractual breach at 100%.'
                }
            ]
        }
    }
};
