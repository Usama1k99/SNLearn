// ============================================
// SECOPS PROCESS SIMULATOR — Data & Logic
// ============================================

const SimulatorData = {
    // -----------------------------------------------
    // TAB 1: Security Incidents (sn_si_incident)
    // -----------------------------------------------
    'sn_si_incident': {
        label: 'Security Incidents',
        table: 'sn_si_incident',
        icon: '🛡️',
        description: 'Core security incident records created from SIEM alerts, user reports, or automated detections. Extends the platform task table.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'Draft' },
                { value: '16', label: 'Analysis' },
                { value: '18', label: 'Contain' },
                { value: '20', label: 'Eradicate' },
                { value: '22', label: 'Recover' },
                { value: '24', label: 'Review' },
                { value: '3', label: 'Closed' },
                { value: '7', label: 'Cancelled' }
            ]},
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' },
                { value: '5', label: '5 - Planning' }
            ]},
            { name: 'severity', label: 'Severity', type: 'choice', choices: [
                { value: '1', label: '1 - High' },
                { value: '2', label: '2 - Medium' },
                { value: '3', label: '3 - Low' }
            ]},
            { name: 'category', label: 'Category', type: 'choice', choices: [
                { value: 'phishing', label: 'Phishing' },
                { value: 'malware', label: 'Malware' },
                { value: 'ransomware', label: 'Ransomware' },
                { value: 'data_loss', label: 'Data Loss' },
                { value: 'unauthorized_access', label: 'Unauthorized Access' },
                { value: 'denial_of_service', label: 'Denial of Service' },
                { value: 'insider_threat', label: 'Insider Threat' }
            ]},
            { name: 'subcategory', label: 'Subcategory', type: 'choice', choices: [
                { value: 'spear_phishing', label: 'Spear Phishing' },
                { value: 'whaling', label: 'Whaling' },
                { value: 'credential_harvesting', label: 'Credential Harvesting' },
                { value: 'trojan', label: 'Trojan' },
                { value: 'worm', label: 'Worm' },
                { value: 'ransomware_crypto', label: 'Crypto Ransomware' }
            ]},
            { name: 'business_criticality', label: 'Business Criticality', type: 'choice', choices: [
                { value: '1', label: '1 - Most Critical' },
                { value: '2', label: '2 - Somewhat Critical' },
                { value: '3', label: '3 - Less Critical' },
                { value: '4', label: '4 - Not Critical' }
            ]},
            { name: 'risk_score', label: 'Risk Score', type: 'number' },
            { name: 'affected_ci', label: 'Affected CI', type: 'reference', refTable: 'cmdb_ci' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'contact_type', label: 'Contact Type', type: 'choice', choices: [
                { value: 'siem', label: 'SIEM Alert' },
                { value: 'edr', label: 'EDR Detection' },
                { value: 'email', label: 'Email Report' },
                { value: 'phone', label: 'Phone' },
                { value: 'self_service', label: 'Self-Service' }
            ]},
            { name: 'opened_at', label: 'Opened At', type: 'datetime' },
            { name: 'closed_at', label: 'Closed At', type: 'datetime' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'close_notes', label: 'Close Notes', type: 'textarea' }
        ],
        records: [
            {
                number: 'SIR0010042',
                short_description: 'Spear phishing campaign targeting Finance dept',
                state: '16',
                priority: '1',
                severity: '1',
                category: 'phishing',
                subcategory: 'spear_phishing',
                business_criticality: '1',
                risk_score: 92,
                affected_ci: 'mail-gw-prod-01',
                assigned_to: 'Sarah Chen',
                assignment_group: 'Security Incident Response',
                contact_type: 'siem',
                opened_at: '2026-08-04 09:15:33',
                closed_at: '',
                description: 'Splunk SIEM alert triggered: Multiple Finance department users received emails from spoofed CFO address containing malicious links to credential harvesting page. 3 users confirmed clicked. Email originated from external IP 198.51.100.45.',
                close_notes: ''
            },
            {
                number: 'SIR0010043',
                short_description: 'Malware detected on endpoint WS-FIN-034',
                state: '18',
                priority: '2',
                severity: '1',
                category: 'malware',
                subcategory: 'trojan',
                business_criticality: '1',
                risk_score: 88,
                affected_ci: 'WS-FIN-034',
                assigned_to: 'Marcus Rivera',
                assignment_group: 'Security Incident Response',
                contact_type: 'edr',
                opened_at: '2026-08-04 10:22:07',
                closed_at: '',
                description: 'CrowdStrike EDR detected Emotet trojan execution on workstation WS-FIN-034 (Finance dept). This endpoint belongs to a user who clicked the phishing link in SIR0010042. Lateral movement indicators detected.',
                close_notes: ''
            },
            {
                number: 'SIR0010038',
                short_description: 'Unauthorized SSH access to db-prod-02',
                state: '24',
                priority: '2',
                severity: '2',
                category: 'unauthorized_access',
                subcategory: '',
                business_criticality: '2',
                risk_score: 72,
                affected_ci: 'db-prod-02',
                assigned_to: 'James Okafor',
                assignment_group: 'Security Incident Response',
                contact_type: 'siem',
                opened_at: '2026-08-01 14:33:21',
                closed_at: '',
                description: 'QRadar detected SSH login to db-prod-02 from unusual geographic location (Romania) using valid service account credentials. No data exfiltration confirmed. Credentials rotated.',
                close_notes: ''
            },
            {
                number: 'SIR0010035',
                short_description: 'DDoS attack on customer portal',
                state: '3',
                priority: '1',
                severity: '1',
                category: 'denial_of_service',
                subcategory: '',
                business_criticality: '1',
                risk_score: 45,
                affected_ci: 'web-portal-prod',
                assigned_to: 'Sarah Chen',
                assignment_group: 'Security Incident Response',
                contact_type: 'siem',
                opened_at: '2026-07-28 03:45:00',
                closed_at: '2026-07-29 11:30:00',
                description: 'Volumetric DDoS attack detected targeting customer-facing web portal. Traffic peaked at 45Gbps. CDN and WAF rules engaged. Attack originated from botnet.',
                close_notes: 'Attack mitigated via CDN rate limiting and upstream ISP blackholing. Additional WAF rules deployed. PIR completed — no data loss or compromise confirmed.'
            }
        ],
        processExplanation: {
            title: 'How Security Incidents Work in Practice',
            steps: [
                {
                    heading: '1. Alert Ingestion & Incident Creation',
                    content: 'When your SIEM (Splunk, QRadar) or EDR (CrowdStrike, Carbon Black) detects a threat, it sends an alert to SecOps via a pre-built integration or REST API. SecOps creates an <code>sn_si_incident</code> record in <strong>Draft</strong> state. The integration auto-populates fields like category, source IP, affected CI, and severity based on the alert payload.'
                },
                {
                    heading: '2. Triage & Analysis',
                    content: 'A SOC analyst picks up the incident (or it\'s auto-assigned via assignment rules). They move it to <strong>Analysis</strong> state and begin investigation: enriching observables (IPs, domains, hashes) via threat intelligence lookups, checking CMDB for the affected CI\'s business criticality, and scoping the blast radius. The <code>risk_score</code> is calculated combining CVSS, business criticality, and exploit availability.'
                },
                {
                    heading: '3. Containment',
                    content: 'Once the threat is understood, the analyst moves to <strong>Contain</strong> state and executes containment actions — blocking malicious IPs at the firewall, isolating compromised endpoints via EDR, disabling compromised accounts. Playbooks guide these steps and can auto-execute containment actions via Flow Designer.'
                },
                {
                    heading: '4. Eradication & Recovery',
                    content: 'In <strong>Eradicate</strong>, the root cause is removed — malware cleaned, vulnerabilities patched, attack vectors closed. In <strong>Recover</strong>, systems are restored to normal operation, backups restored if needed, and monitoring intensified to watch for recurrence.'
                },
                {
                    heading: '5. Review & Closure',
                    content: 'The <strong>Review</strong> state triggers creation of a Post-Incident Review (PIR) record in <code>sn_si_write_up</code>. The team documents the timeline, root cause, impact, and lessons learned. Once the PIR is complete and approved, the incident moves to <strong>Closed</strong>.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 2: SIR Tasks (sn_si_task)
    // -----------------------------------------------
    'sn_si_task': {
        label: 'SIR Tasks',
        table: 'sn_si_task',
        icon: '📋',
        description: 'Sub-tasks spawned from security incidents, typically created by playbooks. Each task represents a specific response activity.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '-5', label: 'Pending' },
                { value: '1', label: 'Open' },
                { value: '2', label: 'Work in Progress' },
                { value: '3', label: 'Closed Complete' },
                { value: '4', label: 'Closed Incomplete' },
                { value: '7', label: 'Closed Skipped' }
            ]},
            { name: 'parent', label: 'Parent Incident', type: 'reference', refTable: 'sn_si_incident' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'opened_at', label: 'Opened At', type: 'datetime' },
            { name: 'closed_at', label: 'Closed At', type: 'datetime' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'work_notes', label: 'Work Notes', type: 'textarea' }
        ],
        records: [
            {
                number: 'SIRT0021050',
                short_description: 'Extract and analyze email headers from phishing campaign',
                state: '3',
                parent: 'SIR0010042',
                assigned_to: 'Sarah Chen',
                assignment_group: 'Security Incident Response',
                priority: '1',
                opened_at: '2026-08-04 09:20:00',
                closed_at: '2026-08-04 09:45:00',
                description: 'Parse headers from reported phishing emails. Identify sender IP, return path, X-Originating-IP, and any relay information.',
                work_notes: 'Headers extracted from 12 reported emails. All originated from 198.51.100.45 via compromised mail relay. SPF/DKIM checks failed on all.'
            },
            {
                number: 'SIRT0021051',
                short_description: 'Check malicious URLs against threat intelligence feeds',
                state: '3',
                parent: 'SIR0010042',
                assigned_to: 'Sarah Chen',
                assignment_group: 'Security Incident Response',
                priority: '1',
                opened_at: '2026-08-04 09:25:00',
                closed_at: '2026-08-04 10:05:00',
                description: 'Submit extracted URLs to VirusTotal, URLhaus, and internal threat intel for reputation scoring and malware analysis.',
                work_notes: 'URL hxxps://secure-login[.]finance-verify[.]com flagged by 14/90 VT vendors. Domain registered 2 days ago. Hosting credential harvesting page mimicking our SSO portal.'
            },
            {
                number: 'SIRT0021052',
                short_description: 'Identify all recipients of phishing email',
                state: '3',
                parent: 'SIR0010042',
                assigned_to: 'Marcus Rivera',
                assignment_group: 'Security Incident Response',
                priority: '1',
                opened_at: '2026-08-04 09:30:00',
                closed_at: '2026-08-04 10:15:00',
                description: 'Query Exchange/O365 message trace to identify all users who received the phishing email. Cross-reference with proxy logs to identify who clicked.',
                work_notes: '47 users received the email across Finance (32) and Accounting (15) departments. 3 users clicked the link based on proxy logs. All 3 from Finance.'
            },
            {
                number: 'SIRT0021053',
                short_description: 'Block sender domain and IP on email gateway',
                state: '2',
                parent: 'SIR0010042',
                assigned_to: 'Marcus Rivera',
                assignment_group: 'IT Security Operations',
                priority: '1',
                opened_at: '2026-08-04 10:20:00',
                closed_at: '',
                description: 'Add finance-verify[.]com domain and IP 198.51.100.45 to email gateway blocklist. Create transport rule to quarantine any remaining copies.',
                work_notes: 'Domain blocked on Proofpoint gateway. Transport rule created. Working on purging remaining copies from mailboxes.'
            },
            {
                number: 'SIRT0021054',
                short_description: 'Reset credentials for users who clicked phishing link',
                state: '1',
                parent: 'SIR0010042',
                assigned_to: 'James Okafor',
                assignment_group: 'IT Security Operations',
                priority: '1',
                opened_at: '2026-08-04 10:30:00',
                closed_at: '',
                description: 'Force password reset and revoke active sessions for the 3 users who clicked the credential harvesting link. Enable MFA if not already active.',
                work_notes: ''
            }
        ],
        processExplanation: {
            title: 'How SIR Tasks Drive Incident Response',
            steps: [
                {
                    heading: '1. Playbook-Generated Tasks',
                    content: 'When a playbook is triggered on a security incident (either automatically based on category or manually by an analyst), it generates a sequence of <code>sn_si_task</code> records. Each task represents a concrete action — "Extract email headers", "Block malicious IP", "Reset user credentials". Tasks are linked to the parent incident via the <code>parent</code> reference field.'
                },
                {
                    heading: '2. Manual vs Automated Tasks',
                    content: 'Tasks can be <strong>manual</strong> (requiring human action, like "Interview affected user") or <strong>automated</strong> (executed by Flow Designer, like "Query VirusTotal API for URL reputation"). Automated tasks execute immediately and populate work notes with results.'
                },
                {
                    heading: '3. Task Assignment & Routing',
                    content: 'Tasks can be assigned to different teams. For example, credential resets may go to IT Operations while forensic analysis stays with the SOC. The <code>assignment_group</code> field routes work to the correct queue, and SLAs can track response times per task.'
                },
                {
                    heading: '4. Task Completion & Incident Progression',
                    content: 'As tasks are completed (moved to <strong>Closed Complete</strong>), the parent incident can progress through its lifecycle states. Some process definitions require all containment tasks to be complete before the incident can move from Contain → Eradicate.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 3: Observables (sn_ti_observable)
    // -----------------------------------------------
    'sn_ti_observable': {
        label: 'Observables',
        table: 'sn_ti_observable',
        icon: '🔍',
        description: 'Indicators of Compromise (IoCs) — IPs, domains, file hashes, URLs — tracked by Threat Intelligence and linked to security incidents.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'value', label: 'Value', type: 'string' },
            { name: 'type', label: 'Type', type: 'choice', choices: [
                { value: 'ip', label: 'IP Address' },
                { value: 'domain', label: 'Domain' },
                { value: 'url', label: 'URL' },
                { value: 'file_hash_md5', label: 'File Hash (MD5)' },
                { value: 'file_hash_sha256', label: 'File Hash (SHA-256)' },
                { value: 'email', label: 'Email Address' }
            ]},
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'new', label: 'New' },
                { value: 'active', label: 'Active' },
                { value: 'under_investigation', label: 'Under Investigation' },
                { value: 'resolved', label: 'Resolved' }
            ]},
            { name: 'enrichment_status', label: 'Enrichment Status', type: 'choice', choices: [
                { value: 'not_enriched', label: 'Not Enriched' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'enriched', label: 'Enriched' },
                { value: 'failed', label: 'Failed' }
            ]},
            { name: 'threat_score', label: 'Threat Score', type: 'number' },
            { name: 'source', label: 'Source', type: 'string' },
            { name: 'first_seen', label: 'First Seen', type: 'datetime' },
            { name: 'last_seen', label: 'Last Seen', type: 'datetime' },
            { name: 'related_incident', label: 'Related Incident', type: 'reference', refTable: 'sn_si_incident' },
            { name: 'notes', label: 'Notes', type: 'textarea' }
        ],
        records: [
            {
                number: 'OBS0008871',
                value: '198.51.100.45',
                type: 'ip',
                state: 'active',
                enrichment_status: 'enriched',
                threat_score: 95,
                source: 'Splunk SIEM',
                first_seen: '2026-08-04 09:15:33',
                last_seen: '2026-08-04 11:22:00',
                related_incident: 'SIR0010042',
                notes: 'Source IP of phishing campaign. VirusTotal: 8/90 vendors flag as malicious. AbuseIPDB confidence: 97%. Geo: Romania. ISP: Hosting provider known for bulletproof hosting.'
            },
            {
                number: 'OBS0008872',
                value: 'secure-login.finance-verify.com',
                type: 'domain',
                state: 'active',
                enrichment_status: 'enriched',
                threat_score: 98,
                source: 'Email Header Analysis',
                first_seen: '2026-08-04 09:20:00',
                last_seen: '2026-08-04 09:20:00',
                related_incident: 'SIR0010042',
                notes: 'Credential harvesting domain. Registered 2 days ago via privacy-protected registrar. Hosting a clone of our SSO login page. Certificate issued by Let\'s Encrypt.'
            },
            {
                number: 'OBS0008873',
                value: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6',
                type: 'file_hash_md5',
                state: 'under_investigation',
                enrichment_status: 'enriched',
                threat_score: 87,
                source: 'CrowdStrike EDR',
                first_seen: '2026-08-04 10:22:07',
                last_seen: '2026-08-04 10:22:07',
                related_incident: 'SIR0010043',
                notes: 'MD5 hash of Emotet dropper binary found on WS-FIN-034. VT detection rate: 52/72. Known Emotet variant associated with credential theft and lateral movement.'
            },
            {
                number: 'OBS0008874',
                value: 'cfo-update@finance-verify.com',
                type: 'email',
                state: 'active',
                enrichment_status: 'enriched',
                threat_score: 90,
                source: 'Email Header Analysis',
                first_seen: '2026-08-04 09:15:33',
                last_seen: '2026-08-04 09:15:33',
                related_incident: 'SIR0010042',
                notes: 'Spoofed sender address used in the phishing campaign. Impersonating CFO. Domain matches the credential harvesting site.'
            }
        ],
        processExplanation: {
            title: 'How Observables & Threat Intelligence Work',
            steps: [
                {
                    heading: '1. Observable Extraction',
                    content: 'During incident analysis, observables (IoCs) are extracted from alert data, email headers, endpoint forensics, and network logs. These are created as <code>sn_ti_observable</code> records and linked to the parent security incident via a many-to-many table (<code>sn_ti_m2m_observable_sn_si_incident</code>).'
                },
                {
                    heading: '2. Automated Enrichment',
                    content: 'Once an observable is created, enrichment workflows automatically query external threat intelligence sources — VirusTotal, AbuseIPDB, WHOIS, passive DNS, sandbox detonation. Results update the <code>enrichment_status</code> and populate the <code>threat_score</code>. This happens via Flow Designer actions or IntegrationHub spokes.'
                },
                {
                    heading: '3. Correlation & Pivoting',
                    content: 'Analysts can pivot from an observable to find all incidents where the same IoC appeared. If the same malicious IP shows up across multiple incidents, it indicates a persistent threat actor. This cross-incident correlation is a core value of the Threat Intelligence module.'
                },
                {
                    heading: '4. Threat Feed Integration',
                    content: 'External threat feeds (commercial, open-source, ISAC) push indicators into ServiceNow via STIX/TAXII protocols or REST APIs. These are stored in <code>sn_ti_indicator</code> and automatically matched against observables in active incidents.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 3.5: Indicators (sn_ti_indicator)
    // -----------------------------------------------
    'sn_ti_indicator': {
        label: 'Indicators',
        table: 'sn_ti_indicator',
        icon: '🎯',
        description: 'Threat Indicators imported from external Threat Intelligence feeds (e.g., STIX/TAXII). Master records that can match against observables.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'value', label: 'Value', type: 'string' },
            { name: 'type', label: 'Type', type: 'choice', choices: [
                { value: 'ip', label: 'IP Address' },
                { value: 'domain', label: 'Domain' },
                { value: 'url', label: 'URL' },
                { value: 'file_hash_md5', label: 'File Hash (MD5)' }
            ]},
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'Review' },
                { value: '2', label: 'Active' },
                { value: '3', label: 'Retired' }
            ]},
            { name: 'source', label: 'Source Feed', type: 'string' },
            { name: 'confidence', label: 'Confidence', type: 'choice', choices: [
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
            ]},
            { name: 'valid_from', label: 'Valid From', type: 'datetime' },
            { name: 'valid_until', label: 'Valid Until', type: 'datetime' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'IND0015523',
                value: '198.51.100.45',
                type: 'ip',
                state: '2',
                source: 'AlienVault OTX',
                confidence: 'high',
                valid_from: '2026-08-01 00:00:00',
                valid_until: '2026-11-01 00:00:00',
                description: 'Known bulletproof hosting IP used in recent credential harvesting campaigns targeting financial sector.'
            },
            {
                number: 'IND0015524',
                value: 'secure-login.finance-verify.com',
                type: 'domain',
                state: '2',
                source: 'FS-ISAC',
                confidence: 'high',
                valid_from: '2026-08-02 00:00:00',
                valid_until: '2026-09-02 00:00:00',
                description: 'Newly registered domain mimicking SSO portals.'
            }
        ],
        processExplanation: {
            title: 'How Indicators Relate to Observables',
            steps: [
                {
                    heading: '1. Feeds and Import',
                    content: 'Indicators are ingested automatically from external threat intelligence feeds (like AlienVault, FS-ISAC, or TAXII servers) and stored in <code>sn_ti_indicator</code>.'
                },
                {
                    heading: '2. Auto-Matching (Sighting)',
                    content: 'When a new Observable (<code>sn_ti_observable</code>) is created in a Security Incident, the system checks if it matches any active Indicator. If it does, a "Sighting" is recorded, instantly telling the analyst that this Observable is a known threat.'
                },
                {
                    heading: '3. Lifecycle Management',
                    content: 'Indicators have a lifecycle. Threat actor infrastructure changes, so indicators are eventually moved to a <strong>Retired</strong> state when their <code>valid_until</code> date passes, preventing false positives on old IPs.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 4: Vulnerability Entries (sn_vul_entry)
    // -----------------------------------------------
    'sn_vul_entry': {
        label: 'Vulnerability Entries',
        table: 'sn_vul_entry',
        icon: '📄',
        description: 'Vulnerability definitions (CVEs) imported from NVD and scanner feeds. Each entry represents a unique vulnerability, not a specific instance on an asset.',
        fields: [
            { name: 'id', label: 'Vulnerability ID', type: 'string' },
            { name: 'title', label: 'Title', type: 'string' },
            { name: 'severity', label: 'Severity', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Medium' },
                { value: '4', label: '4 - Low' },
                { value: '5', label: '5 - Info' }
            ]},
            { name: 'cvss_score', label: 'CVSS Score', type: 'number' },
            { name: 'cvss_version', label: 'CVSS Version', type: 'choice', choices: [
                { value: '3.1', label: 'CVSS v3.1' },
                { value: '3.0', label: 'CVSS v3.0' },
                { value: '2.0', label: 'CVSS v2.0' }
            ]},
            { name: 'source', label: 'Source', type: 'string' },
            { name: 'published_date', label: 'Published Date', type: 'datetime' },
            { name: 'last_modified', label: 'Last Modified', type: 'datetime' },
            { name: 'exploit_available', label: 'Exploit Available', type: 'choice', choices: [
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' }
            ]},
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                id: 'CVE-2026-21894',
                title: 'Apache HTTP Server Path Traversal',
                severity: '1',
                cvss_score: 9.8,
                cvss_version: '3.1',
                source: 'NVD',
                published_date: '2026-07-15 00:00:00',
                last_modified: '2026-07-20 00:00:00',
                exploit_available: 'true',
                description: 'A path traversal vulnerability in Apache HTTP Server 2.4.49 allows an attacker to map URLs to files outside the directories configured by Alias-like directives. If files outside of these directories are not protected by the usual default configuration, these requests can succeed. Exploits are publicly available.'
            },
            {
                id: 'CVE-2026-34521',
                title: 'OpenSSL Buffer Overflow in X.509 Certificate Verification',
                severity: '1',
                cvss_score: 9.1,
                cvss_version: '3.1',
                source: 'NVD',
                published_date: '2026-07-22 00:00:00',
                last_modified: '2026-07-25 00:00:00',
                exploit_available: 'false',
                description: 'A buffer overflow vulnerability exists in OpenSSL versions 3.0.0 through 3.0.6 when verifying X.509 certificates. A malicious certificate can trigger a buffer overrun, potentially leading to remote code execution.'
            },
            {
                id: 'CVE-2026-18734',
                title: 'Linux Kernel Privilege Escalation via eBPF',
                severity: '2',
                cvss_score: 7.8,
                cvss_version: '3.1',
                source: 'NVD',
                published_date: '2026-06-10 00:00:00',
                last_modified: '2026-06-28 00:00:00',
                exploit_available: 'true',
                description: 'A local privilege escalation vulnerability exists in the Linux kernel eBPF subsystem. An unprivileged user can exploit this to gain root access on affected systems running kernel versions 5.8 through 5.16.'
            },
            {
                id: 'CVE-2026-55210',
                title: 'PostgreSQL Authentication Bypass',
                severity: '3',
                cvss_score: 6.5,
                cvss_version: '3.1',
                source: 'Qualys',
                published_date: '2026-07-01 00:00:00',
                last_modified: '2026-07-10 00:00:00',
                exploit_available: 'false',
                description: 'Under certain configurations, PostgreSQL 14.x and 15.x allow authentication bypass via a crafted connection string when using SCRAM authentication. Requires network access to the database port.'
            }
        ],
        processExplanation: {
            title: 'How Vulnerability Entries Are Managed',
            steps: [
                {
                    heading: '1. CVE Ingestion',
                    content: 'Vulnerability entries are imported from the National Vulnerability Database (NVD), scanner vendor feeds (Qualys, Tenable, Rapid7), and advisory sources. Each unique CVE gets one <code>sn_vul_entry</code> record. This is the "master definition" — it describes the vulnerability itself, not where it exists in your environment.'
                },
                {
                    heading: '2. Severity & Scoring',
                    content: 'Each entry carries its CVSS score and version (v2.0, v3.0, v3.1). The <code>severity</code> field is a normalized rating. Critically, the <code>exploit_available</code> flag is tracked — a vulnerability with a public exploit is far more dangerous than one that is theoretical.'
                },
                {
                    heading: '3. Entry → Vulnerable Items',
                    content: 'A single CVE entry can produce <strong>thousands</strong> of Vulnerable Items across your infrastructure. CVE-2026-21894 (Apache path traversal) might affect 200 web servers — creating 200 <code>sn_vul_vulnerable_item</code> records, all referencing this one entry. This is the one-to-many relationship that drives remediation scale.'
                },
                {
                    heading: '4. Continuous Updates',
                    content: 'Entries are updated as new information emerges — CVSS score revisions, exploit availability changes, vendor patches released. The <code>last_modified</code> timestamp tracks these updates, and business rules can trigger re-evaluation of risk scores on linked Vulnerable Items.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 4.5: Detections (sn_vul_detection)
    // -----------------------------------------------
    'sn_vul_detection': {
        label: 'Detections',
        table: 'sn_vul_detection',
        icon: '📡',
        description: 'Raw detection records imported from third-party scanners (Qualys, Tenable). Serves as evidence linking a scanner finding to a Vulnerable Item.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'vulnerability', label: 'Vulnerability', type: 'reference', refTable: 'sn_vul_entry' },
            { name: 'cmdb_ci', label: 'Configuration Item', type: 'reference', refTable: 'cmdb_ci' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '0', label: 'Open' },
                { value: '1', label: 'Stale' },
                { value: '2', label: 'Closed' }
            ]},
            { name: 'source', label: 'Source', type: 'choice', choices: [
                { value: 'qualys', label: 'Qualys' },
                { value: 'tenable', label: 'Tenable.io' },
                { value: 'rapid7', label: 'Rapid7 InsightVM' }
            ]},
            { name: 'first_found', label: 'First Found', type: 'datetime' },
            { name: 'last_found', label: 'Last Found', type: 'datetime' },
            { name: 'ip_address', label: 'IP Address', type: 'string' },
            { name: 'port', label: 'Port', type: 'string' },
            { name: 'protocol', label: 'Protocol', type: 'string' },
            { name: 'proof', label: 'Proof', type: 'textarea' }
        ],
        records: [
            {
                number: 'VDET0010992',
                vulnerability: 'CVE-2026-21894',
                cmdb_ci: 'web-prod-01',
                state: '0',
                source: 'qualys',
                first_found: '2026-07-20 05:30:00',
                last_found: '2026-08-03 05:30:00',
                ip_address: '10.200.15.44',
                port: '443',
                protocol: 'TCP',
                proof: 'QID 12345: Apache HTTP Server Path Traversal Vulnerability detected.\nGET /cgi-bin/.%2e/.%2e/.%2e/.%2e/etc/passwd HTTP/1.1\nResponse: root:x:0:0:root:/root:/bin/bash...'
            },
            {
                number: 'VDET0010993',
                vulnerability: 'CVE-2026-34521',
                cmdb_ci: 'api-prod-01',
                state: '0',
                source: 'tenable',
                first_found: '2026-07-25 04:15:00',
                last_found: '2026-08-03 04:15:00',
                ip_address: '10.200.16.82',
                port: '443',
                protocol: 'TCP',
                proof: 'Plugin 98765: OpenSSL version 3.0.4 detected on port 443. Vulnerable to CVE-2026-34521 buffer overflow.'
            }
        ],
        processExplanation: {
            title: 'How Detections Feed Vulnerability Response',
            steps: [
                {
                    heading: '1. Scanner Import',
                    content: 'During a scheduled integration run, the scanner (e.g., Qualys) drops raw detection data into ServiceNow. These are stored as <code>sn_vul_detection</code> records.'
                },
                {
                    heading: '2. De-duplication and Keys',
                    content: 'ServiceNow uses Detection Key Configuration to uniquely identify a detection (typically CI + Vulnerability + Port). If a matching detection exists, it updates the <code>last_found</code> date. If not, it creates a new one.'
                },
                {
                    heading: '3. Rolling up to Vulnerable Items',
                    content: 'Detections are the "evidence". A single Vulnerable Item (VIT) on a CI might have multiple underlying Detections (e.g., the same vulnerability found on ports 80 and 443). The VIT state is driven by the state of its underlying detections.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 5: Vulnerable Items (sn_vul_vulnerable_item)
    // -----------------------------------------------
    'sn_vul_vulnerable_item': {
        label: 'Vulnerable Items',
        table: 'sn_vul_vulnerable_item',
        icon: '⚠️',
        description: 'A specific vulnerability on a specific CI — the core Vulnerability Response record. Links a vulnerability entry to a CMDB configuration item.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'Open' },
                { value: '2', label: 'Under Investigation' },
                { value: '3', label: 'In Progress' },
                { value: '4', label: 'Resolved' },
                { value: '7', label: 'Closed' },
                { value: '100', label: 'Accepted Risk' },
                { value: '200', label: 'False Positive' }
            ]},
            { name: 'vulnerability', label: 'Vulnerability', type: 'reference', refTable: 'sn_vul_entry' },
            { name: 'cmdb_ci', label: 'Configuration Item', type: 'reference', refTable: 'cmdb_ci' },
            { name: 'risk_score', label: 'Risk Score', type: 'number' },
            { name: 'risk_rating', label: 'Risk Rating', type: 'choice', choices: [
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
            ]},
            { name: 'source', label: 'Source Scanner', type: 'choice', choices: [
                { value: 'qualys', label: 'Qualys' },
                { value: 'tenable', label: 'Tenable.io' },
                { value: 'rapid7', label: 'Rapid7 InsightVM' },
                { value: 'defender', label: 'Microsoft Defender' }
            ]},
            { name: 'first_found', label: 'First Found', type: 'datetime' },
            { name: 'last_found', label: 'Last Found', type: 'datetime' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'remediation_task', label: 'Remediation Task', type: 'reference', refTable: 'sn_vul_vulnerability' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'VIT0042001',
                state: '1',
                vulnerability: 'CVE-2026-21894',
                cmdb_ci: 'web-prod-01',
                risk_score: 96,
                risk_rating: 'critical',
                source: 'qualys',
                first_found: '2026-07-20 06:00:00',
                last_found: '2026-08-03 06:00:00',
                assigned_to: '',
                assignment_group: 'Linux Server Team',
                remediation_task: 'VUL0005521',
                description: 'Apache HTTP Server 2.4.49 path traversal vulnerability detected on production web server web-prod-01. This is an internet-facing Tier 1 system serving the customer portal.'
            },
            {
                number: 'VIT0042002',
                state: '1',
                vulnerability: 'CVE-2026-21894',
                cmdb_ci: 'web-prod-02',
                risk_score: 96,
                risk_rating: 'critical',
                source: 'qualys',
                first_found: '2026-07-20 06:00:00',
                last_found: '2026-08-03 06:00:00',
                assigned_to: '',
                assignment_group: 'Linux Server Team',
                remediation_task: 'VUL0005521',
                description: 'Same Apache vulnerability on web-prod-02 (load-balanced pair with web-prod-01). Also internet-facing Tier 1.'
            },
            {
                number: 'VIT0042003',
                state: '3',
                vulnerability: 'CVE-2026-34521',
                cmdb_ci: 'api-prod-01',
                risk_score: 85,
                risk_rating: 'critical',
                source: 'tenable',
                first_found: '2026-07-25 06:00:00',
                last_found: '2026-08-03 06:00:00',
                assigned_to: 'David Kim',
                assignment_group: 'Application Server Team',
                remediation_task: 'VUL0005522',
                description: 'OpenSSL 3.0.4 buffer overflow on API server. Handles TLS termination for internal APIs. Patch scheduled for next maintenance window.'
            },
            {
                number: 'VIT0042004',
                state: '100',
                vulnerability: 'CVE-2026-18734',
                cmdb_ci: 'dev-sandbox-03',
                risk_score: 22,
                risk_rating: 'low',
                source: 'qualys',
                first_found: '2026-06-15 06:00:00',
                last_found: '2026-08-03 06:00:00',
                assigned_to: '',
                assignment_group: 'Dev Infrastructure',
                remediation_task: '',
                description: 'Linux kernel eBPF privilege escalation on isolated development sandbox. No production data, no external access. Risk accepted per exception policy SEC-EXC-2026-044.'
            },
            {
                number: 'VIT0042005',
                state: '7',
                vulnerability: 'CVE-2026-55210',
                cmdb_ci: 'db-staging-01',
                risk_score: 15,
                risk_rating: 'low',
                source: 'tenable',
                first_found: '2026-07-05 06:00:00',
                last_found: '2026-07-20 06:00:00',
                assigned_to: 'Priya Patel',
                assignment_group: 'Database Team',
                remediation_task: 'VUL0005518',
                description: 'PostgreSQL auth bypass on staging DB. Patched to 15.3. Rescan confirmed fix — vulnerability no longer detected.'
            }
        ],
        processExplanation: {
            title: 'How Vulnerable Items Drive Remediation',
            steps: [
                {
                    heading: '1. Scanner Import Creates VIs',
                    content: 'When a vulnerability scanner (Qualys, Tenable) runs and imports results, the integration creates <code>sn_vul_vulnerable_item</code> records. Each record links a specific CVE (<code>vulnerability</code> → <code>sn_vul_entry</code>) to a specific CI (<code>cmdb_ci</code> → <code>cmdb_ci</code>). This is the "this vulnerability exists on this server" record.'
                },
                {
                    heading: '2. Risk Score Calculation',
                    content: 'The <code>risk_score</code> is calculated by combining CVSS base score with CMDB business criticality, exploit availability, network exposure, and age. A Critical CVE on an internet-facing Tier 1 system scores much higher than the same CVE on an isolated dev sandbox — this is what makes VR more valuable than raw scanner output.'
                },
                {
                    heading: '3. Grouping into Remediation Tasks',
                    content: 'VIs are grouped into Remediation Tasks (<code>sn_vul_vulnerability</code>) by Vulnerability Grouping Rules. Multiple VIs for the same CVE affecting the same team\'s servers become one assignable task. The <code>remediation_task</code> reference field links VIs to their parent group.'
                },
                {
                    heading: '4. Closed-Loop Verification',
                    content: 'When the scanner runs again and no longer detects the vulnerability on a CI, the VI automatically moves to <strong>Closed</strong>. If the scanner still detects it, the <code>last_found</code> date updates and the VI remains open. This creates a fully automated verification loop without manual confirmation.'
                },
                {
                    heading: '5. Exception Management',
                    content: '<strong>Accepted Risk</strong> and <strong>False Positive</strong> states allow teams to formally disposition VIs that won\'t be remediated. Accepted Risk requires an approval workflow and exception documentation. These VIs are excluded from remediation metrics but remain tracked for audit.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 6: Remediation Tasks (sn_vul_vulnerability)
    // -----------------------------------------------
    'sn_vul_vulnerability': {
        label: 'Remediation Tasks',
        table: 'sn_vul_vulnerability',
        icon: '🔧',
        description: 'Remediation tasks that group multiple Vulnerable Items for assignment and tracking. Extends the platform task table.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: '1', label: 'Open' },
                { value: '2', label: 'In Progress' },
                { value: '3', label: 'Closed' },
                { value: '4', label: 'Closed - Incomplete' },
                { value: '10', label: 'Pending Approval' }
            ]},
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'assignment_group', label: 'Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'vi_count', label: 'Vulnerable Item Count', type: 'number' },
            { name: 'grouping_rule', label: 'Grouping Rule', type: 'string' },
            { name: 'opened_at', label: 'Opened At', type: 'datetime' },
            { name: 'due_date', label: 'Due Date', type: 'datetime' },
            { name: 'closed_at', label: 'Closed At', type: 'datetime' },
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'work_notes', label: 'Work Notes', type: 'textarea' }
        ],
        records: [
            {
                number: 'VUL0005521',
                short_description: 'Patch Apache HTTP Server CVE-2026-21894 — Production Web Servers',
                state: '1',
                priority: '1',
                assigned_to: 'Alex Thompson',
                assignment_group: 'Linux Server Team',
                vi_count: 2,
                grouping_rule: 'Vulnerability + CI Group',
                opened_at: '2026-07-20 08:00:00',
                due_date: '2026-08-06 23:59:59',
                closed_at: '',
                description: 'Remediation task for CVE-2026-21894 (Apache path traversal) affecting production web servers managed by the Linux Server Team. 2 vulnerable items: web-prod-01, web-prod-02.',
                work_notes: 'Change request CHG0045321 submitted for emergency maintenance window on Aug 5. Apache 2.4.51 package staged on internal repo.'
            },
            {
                number: 'VUL0005522',
                short_description: 'Update OpenSSL on API servers — CVE-2026-34521',
                state: '2',
                priority: '1',
                assigned_to: 'David Kim',
                assignment_group: 'Application Server Team',
                vi_count: 1,
                grouping_rule: 'Vulnerability + CI Group',
                opened_at: '2026-07-25 08:00:00',
                due_date: '2026-08-08 23:59:59',
                closed_at: '',
                description: 'Update OpenSSL from 3.0.4 to 3.0.7 on api-prod-01. Requires TLS certificate revalidation after update.',
                work_notes: 'OpenSSL 3.0.7 compiled and tested in staging. TLS handshake tests passed. Scheduling prod deployment for Aug 6 maintenance window.'
            },
            {
                number: 'VUL0005518',
                short_description: 'Patch PostgreSQL staging databases — CVE-2026-55210',
                state: '3',
                priority: '3',
                assigned_to: 'Priya Patel',
                assignment_group: 'Database Team',
                vi_count: 1,
                grouping_rule: 'Vulnerability + CI Group',
                opened_at: '2026-07-08 08:00:00',
                due_date: '2026-07-22 23:59:59',
                closed_at: '2026-07-19 14:30:00',
                description: 'Update PostgreSQL to 15.3 on db-staging-01 to address authentication bypass vulnerability.',
                work_notes: 'Patched to 15.3 on July 18. Rescan on July 20 confirmed fix. Closing task.'
            }
        ],
        processExplanation: {
            title: 'How Remediation Tasks Organize the Fix',
            steps: [
                {
                    heading: '1. Grouping Rules Create Tasks',
                    content: 'Vulnerability Grouping Rules (VGRs) automatically bundle Vulnerable Items into Remediation Tasks. The most common strategy is <strong>Vulnerability + CI Group</strong> — all instances of the same CVE affecting CIs managed by the same team become one task. This means "Patch Apache on all 200 Linux servers" becomes one assignable task for the Linux team, not 200 separate tasks.'
                },
                {
                    heading: '2. Assignment & SLA',
                    content: 'Remediation tasks are routed to the appropriate team via assignment rules. A <code>due_date</code> is calculated based on severity-driven SLA policies — Critical vulnerabilities might get 7 days, High gets 30, Medium gets 90. The task extends <code>task</code>, so it inherits full SLA tracking and breach notifications.'
                },
                {
                    heading: '3. Change Management Integration',
                    content: 'In practice, fixing vulnerabilities often requires a Change Request. Teams will reference the VUL record from their CHG record, creating a traceable link between "why we\'re changing" (security vulnerability) and "what we\'re changing" (patching Apache). Some organizations automate this linkage.'
                },
                {
                    heading: '4. Auto-Close on Rescan',
                    content: 'When all Vulnerable Items linked to a Remediation Task are closed (verified fixed by the scanner), the task can automatically close. This creates a fully closed-loop workflow: Scanner detects → VI created → Grouped into task → Team patches → Scanner re-verifies → VI closed → Task closed.'
                }
            ]
        }
    }
};

