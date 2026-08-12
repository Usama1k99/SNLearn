// ============================================
// IRM PROCESS SIMULATOR — Data & Logic
// ============================================

const IrmSimulatorData = {
    // -----------------------------------------------
    // TAB 1: Entities (sn_grc_profile)
    // -----------------------------------------------
    'sn_grc_profile': {
        label: 'Entities (Profiles)',
        table: 'sn_grc_profile',
        icon: '🏢',
        description: 'The foundation of IRM. People, places, objects, or things that need to be monitored for compliance and risk (e.g., servers, departments, vendors).',
        fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'sys_class_name', label: 'Class', type: 'choice', choices: [
                { value: 'sn_grc_profile', label: 'Entity' },
                { value: 'sn_grc_profile_type', label: 'Entity Type' },
                { value: 'sn_grc_profile_class', label: 'Entity Class' }
            ]},
            { name: 'owned_by', label: 'Owner', type: 'reference', refTable: 'sys_user' },
            { name: 'profile_type', label: 'Entity Type', type: 'reference', refTable: 'sn_grc_profile_type' },
            { name: 'profile_class', label: 'Entity Class', type: 'reference', refTable: 'sn_grc_profile_class' },
            { name: 'active', label: 'Active', type: 'choice', choices: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ]},
            { name: 'applies_to', label: 'Applies To (CI)', type: 'reference', refTable: 'cmdb_ci' },
            { name: 'compliance_score', label: 'Compliance Score', type: 'number' },
            { name: 'risk_score', label: 'Risk Score', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                name: 'Customer Data Application',
                number: 'ENT0001042',
                sys_class_name: 'sn_grc_profile',
                owned_by: 'Sarah Chen',
                profile_type: 'Business Applications',
                profile_class: 'Business Application',
                active: 'true',
                applies_to: 'Business Application: Customer Data Portal',
                compliance_score: 85,
                risk_score: 15,
                description: 'The primary application used by customers to manage their personal data and account settings.'
            },
            {
                name: 'EMEA Data Center',
                number: 'ENT0001043',
                sys_class_name: 'sn_grc_profile',
                owned_by: 'Marcus Rivera',
                profile_type: 'Locations',
                profile_class: 'Location',
                active: 'true',
                applies_to: 'Location: Frankfurt Datacenter',
                compliance_score: 98,
                risk_score: 5,
                description: 'Primary European data center located in Frankfurt, subject to GDPR and local German data privacy laws.'
            },
            {
                name: 'Stripe Payment Gateway',
                number: 'ENT0001044',
                sys_class_name: 'sn_grc_profile',
                owned_by: 'James Okafor',
                profile_type: 'Third Party Vendors',
                profile_class: 'Vendor',
                active: 'true',
                applies_to: 'Company: Stripe',
                compliance_score: 100,
                risk_score: 0,
                description: 'Third-party payment processor. PCI-DSS compliance required.'
            }
        ],
        processExplanation: {
            title: 'How Entities Form the Foundation',
            steps: [
                {
                    heading: '1. What is an Entity?',
                    content: 'An Entity (technically <code>sn_grc_profile</code>) is the core scoping mechanism in ServiceNow IRM. Instead of manually applying policies and risks to individual servers, you create Entities. They represent anything that needs compliance or risk monitoring.'
                },
                {
                    heading: '2. Entity Scoping via Types',
                    content: 'Entities are grouped into Entity Types (e.g., "All Linux Servers"). When you assign a Policy or Risk Framework to an Entity Type, ServiceNow automatically instantiates specific Controls and Risks for every individual Entity within that type.'
                },
                {
                    heading: '3. Connecting to the CMDB',
                    content: 'Most Entities are automatically generated from CMDB records (like Business Applications, Servers, or Vendors). If the CMDB record changes (e.g., a server is retired), the corresponding Entity can be automatically deactivated.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 1.5: Authority Documents (sn_compliance_authority_document)
    // -----------------------------------------------
    'sn_compliance_authority_document': {
        label: 'Authority Documents',
        table: 'sn_compliance_authority_document',
        icon: '🏛️',
        description: 'External regulations, standards, or frameworks that the organization must comply with (e.g., GDPR, ISO 27001, HIPAA).',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'source', label: 'Source', type: 'string' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'active', label: 'Active', type: 'choice', choices: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ]},
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'AD0001001',
                name: 'General Data Protection Regulation (GDPR)',
                source: 'European Union',
                version: '2016/679',
                active: 'true',
                description: 'The General Data Protection Regulation is a regulation in EU law on data protection and privacy in the European Union and the European Economic Area.'
            },
            {
                number: 'AD0001002',
                name: 'ISO/IEC 27001:2022',
                source: 'ISO',
                version: '2022',
                active: 'true',
                description: 'Information security management systems — Requirements.'
            }
        ],
        processExplanation: {
            title: 'How Authority Documents Fit In',
            steps: [
                {
                    heading: '1. External Requirements',
                    content: 'Authority Documents represent rules you <em>don\'t</em> control. These are external laws, industry standards, or regulatory frameworks (like HIPAA or PCI-DSS).'
                },
                {
                    heading: '2. Breaking it Down',
                    content: 'An Authority Document is usually massive. To make it manageable, it is broken down into hundreds of individual requirements called <strong>Citations</strong>.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 1.6: Citations (sn_compliance_citation)
    // -----------------------------------------------
    'sn_compliance_citation': {
        label: 'Citations',
        table: 'sn_compliance_citation',
        icon: '🔖',
        description: 'Individual clauses or requirements extracted from an Authority Document.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'authority_document', label: 'Authority Document', type: 'reference', refTable: 'sn_compliance_authority_document' },
            { name: 'reference', label: 'Reference / Clause', type: 'string' },
            { name: 'active', label: 'Active', type: 'choice', choices: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ]},
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'CIT0004501',
                name: 'GDPR Article 32 - Security of processing',
                authority_document: 'General Data Protection Regulation (GDPR)',
                reference: 'Article 32(1)(a)',
                active: 'true',
                description: 'The controller and the processor shall implement appropriate technical and organisational measures... including the pseudonymisation and encryption of personal data.'
            },
            {
                number: 'CIT0004502',
                name: 'ISO 27001 - Cryptographic controls',
                authority_document: 'ISO/IEC 27001:2022',
                reference: 'Annex A.8.24',
                active: 'true',
                description: 'Rules for the effective use of cryptography, including cryptographic key management, shall be defined and implemented.'
            }
        ],
        processExplanation: {
            title: 'How Citations Map to Operations',
            steps: [
                {
                    heading: '1. The Granular Rule',
                    content: 'A Citation represents a specific, testable clause from an Authority Document (e.g., "Data must be encrypted").'
                },
                {
                    heading: '2. Mapping to Control Objectives',
                    content: 'Instead of creating a new Control for every single law, you map multiple Citations to a single internal <strong>Control Objective</strong>. For example, GDPR Article 32 and ISO A.8.24 both map to your internal "Encrypt Data at Rest" objective.'
                },
                {
                    heading: '3. Test Once, Comply Many',
                    content: 'Because of this mapping, when a single Control passes its test, ServiceNow automatically marks you as compliant for <em>both</em> the GDPR Citation and the ISO Citation simultaneously.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 2: Policies (sn_compliance_policy)
    // -----------------------------------------------
    'sn_compliance_policy': {
        label: 'Policies',
        table: 'sn_compliance_policy',
        icon: '📜',
        description: 'Internal directives, standards, or procedures that the organization must follow to remain compliant.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'draft', label: 'Draft' },
                { value: 'review', label: 'Review' },
                { value: 'awaiting_approval', label: 'Awaiting Approval' },
                { value: 'published', label: 'Published' },
                { value: 'retired', label: 'Retired' }
            ]},
            { name: 'type', label: 'Type', type: 'choice', choices: [
                { value: 'policy', label: 'Policy' },
                { value: 'procedure', label: 'Procedure' },
                { value: 'standard', label: 'Standard' },
                { value: 'plan', label: 'Plan' }
            ]},
            { name: 'owner', label: 'Owner', type: 'reference', refTable: 'sys_user' },
            { name: 'valid_from', label: 'Valid From', type: 'datetime' },
            { name: 'valid_to', label: 'Valid To', type: 'datetime' },
            { name: 'compliance_score', label: 'Compliance Score', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'POL0001001',
                name: 'Data Privacy and Protection Policy',
                state: 'published',
                type: 'policy',
                owner: 'Elena Rostova',
                valid_from: '2026-01-01 00:00:00',
                valid_to: '2027-01-01 00:00:00',
                compliance_score: 92,
                description: 'This policy mandates the protection of Customer Data across all enterprise systems to comply with GDPR, CCPA, and internal security standards.'
            },
            {
                number: 'POL0001005',
                name: 'Access Control Standard',
                state: 'published',
                type: 'standard',
                owner: 'David Kim',
                valid_from: '2026-03-15 00:00:00',
                valid_to: '2027-03-15 00:00:00',
                compliance_score: 78,
                description: 'Standard defining requirements for authentication, authorization, and accounting (AAA) including mandatory MFA for privileged access.'
            }
        ],
        processExplanation: {
            title: 'How Policies Drive Compliance',
            steps: [
                {
                    heading: '1. Policy Definition',
                    content: 'Policies are high-level internal documents (<code>sn_compliance_policy</code>). They go through a structured lifecycle: Draft → Review → Approval → Published. They can also be mapped to external Authority Documents (like GDPR or ISO 27001).'
                },
                {
                    heading: '2. From Policy to Action',
                    content: 'A Policy itself isn\'t testable. It\'s just text. To enforce a policy, you break it down into specific, actionable requirements called Control Objectives (e.g., "Data must be encrypted at rest").'
                },
                {
                    heading: '3. Compliance Scoring',
                    content: 'The <code>compliance_score</code> on a Policy rolls up from all the individual Controls instantiated under it. If the controls protecting the "Data Privacy Policy" are failing across your servers, the Policy\'s compliance score drops in real-time.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 3: Control Objectives (sn_compliance_control_objective)
    // -----------------------------------------------
    'sn_compliance_control_objective': {
        label: 'Control Objectives',
        table: 'sn_compliance_control_objective',
        icon: '🎯',
        description: 'Specific, actionable requirements derived from a Policy. These act as templates to generate actual Controls on Entities.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'policy', label: 'Parent Policy', type: 'reference', refTable: 'sn_compliance_policy' },
            { name: 'category', label: 'Category', type: 'choice', choices: [
                { value: 'security', label: 'Security' },
                { value: 'privacy', label: 'Privacy' },
                { value: 'operations', label: 'Operations' }
            ]},
            { name: 'classification', label: 'Classification', type: 'choice', choices: [
                { value: 'preventative', label: 'Preventative' },
                { value: 'detective', label: 'Detective' },
                { value: 'corrective', label: 'Corrective' }
            ]},
            { name: 'weight', label: 'Weight', type: 'number' },
            { name: 'compliance_score', label: 'Compliance Score', type: 'number' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'CO0002011',
                name: 'Encrypt Customer Data at Rest',
                policy: 'Data Privacy and Protection Policy',
                category: 'security',
                classification: 'preventative',
                weight: 10,
                compliance_score: 85,
                description: 'All databases and storage volumes containing customer Personally Identifiable Information (PII) must be encrypted at rest using AES-256 or better.'
            },
            {
                number: 'CO0002012',
                name: 'Enforce MFA for Admin Access',
                policy: 'Access Control Standard',
                category: 'security',
                classification: 'preventative',
                weight: 10,
                compliance_score: 100,
                description: 'Multi-Factor Authentication (MFA) must be enforced for all users with administrative or root privileges.'
            }
        ],
        processExplanation: {
            title: 'Control Objectives as Templates',
            steps: [
                {
                    heading: '1. The Blueprint',
                    content: 'A Control Objective (<code>sn_compliance_control_objective</code>) is a template. It says "Encrypt Data at Rest". It doesn\'t test a specific server; it defines what the requirement is across the organization.'
                },
                {
                    heading: '2. The Magic of Item Generation',
                    content: 'You link a Control Objective to an Entity Type (e.g., "Production Databases"). ServiceNow automatically generates a specific <strong>Control</strong> record for every single database in that Entity Type. This is how GRC scales from 1 rule to 10,000 systems instantly.'
                },
                {
                    heading: '3. Rollup Reporting',
                    content: 'The Control Objective acts as a reporting node. You can look at "Encrypt Customer Data at Rest" and immediately see its compliance score based on how all the generated individual Controls are performing.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 4: Controls (sn_compliance_control)
    // -----------------------------------------------
    'sn_compliance_control': {
        label: 'Controls',
        table: 'sn_compliance_control',
        icon: '✅',
        description: 'The actual implementation of a Control Objective on a specific Entity. This is what gets attested and continuously monitored.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'draft', label: 'Draft' },
                { value: 'attest', label: 'Attest' },
                { value: 'review', label: 'Review' },
                { value: 'monitor', label: 'Monitor' },
                { value: 'retired', label: 'Retired' }
            ]},
            { name: 'status', label: 'Status', type: 'choice', choices: [
                { value: 'compliant', label: 'Compliant' },
                { value: 'non_compliant', label: 'Non-Compliant' },
                { value: 'not_applicable', label: 'Not Applicable' }
            ]},
            { name: 'profile', label: 'Entity (Profile)', type: 'reference', refTable: 'sn_grc_profile' },
            { name: 'control_objective', label: 'Control Objective', type: 'reference', refTable: 'sn_compliance_control_objective' },
            { name: 'owned_by', label: 'Control Owner', type: 'reference', refTable: 'sys_user' },
            { name: 'last_attested', label: 'Last Attested', type: 'datetime' },
            { name: 'enforcement_logic', label: 'Implementation Details', type: 'textarea' }
        ],
        records: [
            {
                number: 'CTRL0055102',
                name: 'Encrypt Customer Data at Rest - Customer Data Application',
                state: 'monitor',
                status: 'compliant',
                profile: 'Customer Data Application',
                control_objective: 'Encrypt Customer Data at Rest',
                owned_by: 'Sarah Chen',
                last_attested: '2026-06-01 10:00:00',
                enforcement_logic: 'AWS RDS encryption is enabled using KMS key alias/customer-data-prod.'
            },
            {
                number: 'CTRL0055103',
                name: 'Encrypt Customer Data at Rest - Legacy DB Server',
                state: 'monitor',
                status: 'non_compliant',
                profile: 'Legacy DB Server',
                control_objective: 'Encrypt Customer Data at Rest',
                owned_by: 'Marcus Rivera',
                last_attested: '2026-07-15 14:30:00',
                enforcement_logic: 'Server is running MySQL 5.6; native encryption at rest is not supported on this OS volume.'
            }
        ],
        processExplanation: {
            title: 'How Controls Are Monitored',
            steps: [
                {
                    heading: '1. Instantiation',
                    content: 'A Control (<code>sn_compliance_control</code>) is the intersection of a Control Objective and an Entity. It asks: "Is the Customer Data Application actually encrypting its data at rest?"'
                },
                {
                    heading: '2. Attestation',
                    content: 'When a control is created, it enters the <strong>Attest</strong> state. A survey is sent to the Control Owner (the person responsible for the Entity) asking them to confirm the control is in place and provide evidence. If they answer positively, the control becomes <strong>Compliant</strong>.'
                },
                {
                    heading: '3. Continuous Monitoring (Indicators)',
                    content: 'Instead of relying on human attestation, IRM uses <strong>Indicators</strong>. An Indicator can run a script daily to check the AWS API and verify if encryption is enabled. If it finds it disabled, the Control immediately flips to <strong>Non-Compliant</strong> and an Issue is generated automatically.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 5: Risks (sn_risk_risk)
    // -----------------------------------------------
    'sn_risk_risk': {
        label: 'Risks',
        table: 'sn_risk_risk',
        icon: '⚠️',
        description: 'A specific risk tied to an Entity, detailing what could go wrong, its probability, and its impact.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'draft', label: 'Draft' },
                { value: 'assess', label: 'Assess' },
                { value: 'respond', label: 'Respond' },
                { value: 'monitor', label: 'Monitor' },
                { value: 'retired', label: 'Retired' }
            ]},
            { name: 'profile', label: 'Entity (Profile)', type: 'reference', refTable: 'sn_grc_profile' },
            { name: 'risk_statement', label: 'Risk Statement', type: 'reference', refTable: 'sn_risk_statement' },
            { name: 'owned_by', label: 'Risk Owner', type: 'reference', refTable: 'sys_user' },
            { name: 'inherent_score', label: 'Inherent Score (ALE)', type: 'number' },
            { name: 'calculated_score', label: 'Calculated Score (ALE)', type: 'number' },
            { name: 'response', label: 'Risk Response', type: 'choice', choices: [
                { value: 'accept', label: 'Accept' },
                { value: 'mitigate', label: 'Mitigate' },
                { value: 'avoid', label: 'Avoid' },
                { value: 'transfer', label: 'Transfer' }
            ]},
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'RSK0008422',
                name: 'Data Breach via Unencrypted Storage - Legacy DB Server',
                state: 'monitor',
                profile: 'Legacy DB Server',
                risk_statement: 'Loss of Customer Data',
                owned_by: 'Marcus Rivera',
                inherent_score: 500000,
                calculated_score: 350000,
                response: 'mitigate',
                description: 'The risk that malicious actors exfiltrate unencrypted database files directly from the storage volume, leading to regulatory fines and reputation damage.'
            },
            {
                number: 'RSK0008423',
                name: 'Service Outage due to DDoS - Customer Data Application',
                state: 'monitor',
                profile: 'Customer Data Application',
                risk_statement: 'Denial of Service',
                owned_by: 'Sarah Chen',
                inherent_score: 250000,
                calculated_score: 25000,
                response: 'mitigate',
                description: 'The risk of a volumetric DDoS attack taking the customer portal offline.'
            }
        ],
        processExplanation: {
            title: 'How Risk Management Works',
            steps: [
                {
                    heading: '1. Risk Scoring (Inherent vs. Residual)',
                    content: 'Risk is scored using ALE (Annualized Loss Expectancy). The <strong>Inherent Score</strong> is the risk level if no controls existed. The <strong>Residual (Calculated) Score</strong> is the remaining risk after factoring in the effectiveness of active Controls.'
                },
                {
                    heading: '2. The Control-Risk Relationship',
                    content: 'Risks are mitigated by Controls. In ServiceNow, when a Control (like "Encrypt Data") fails or becomes Non-Compliant, the Calculated Score of the linked Risk ("Data Breach") automatically increases because the mitigation is no longer effective.'
                },
                {
                    heading: '3. Risk Response',
                    content: 'Once assessed, a Risk Owner chooses a response: <strong>Mitigate</strong> (apply controls), <strong>Accept</strong> (acknowledge the risk and do nothing), <strong>Avoid</strong> (shut down the risky activity), or <strong>Transfer</strong> (buy insurance).'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 6: Issues (sn_grc_issue)
    // -----------------------------------------------
    'sn_grc_issue': {
        label: 'Issues',
        table: 'sn_grc_issue',
        icon: '🚩',
        description: 'Generated when a Control fails, a Risk occurs, or an Audit finds a deficiency. Issues track the remediation effort.',
        fields: [
            { name: 'number', label: 'Number', type: 'string' },
            { name: 'short_description', label: 'Short Description', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'new', label: 'New' },
                { value: 'analyze', label: 'Analyze' },
                { value: 'respond', label: 'Respond' },
                { value: 'review', label: 'Review' },
                { value: 'closed', label: 'Closed' }
            ]},
            { name: 'priority', label: 'Priority', type: 'choice', choices: [
                { value: '1', label: '1 - Critical' },
                { value: '2', label: '2 - High' },
                { value: '3', label: '3 - Moderate' },
                { value: '4', label: '4 - Low' }
            ]},
            { name: 'profile', label: 'Entity (Profile)', type: 'reference', refTable: 'sn_grc_profile' },
            { name: 'source', label: 'Source', type: 'reference', refTable: 'sn_compliance_control' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'remediation_task', label: 'Remediation Task', type: 'reference', refTable: 'sn_grc_task' },
            { name: 'description', label: 'Description', type: 'textarea' }
        ],
        records: [
            {
                number: 'ISS0009115',
                short_description: 'Control Failure: Encryption not enabled on Legacy DB Server',
                state: 'respond',
                priority: '2',
                profile: 'Legacy DB Server',
                source: 'CTRL0055103',
                assigned_to: 'Marcus Rivera',
                remediation_task: 'REMEDY00452',
                description: 'Continuous monitoring indicator script detected that encryption at rest is disabled on the Legacy DB Server volume. This violates the Data Privacy Policy.'
            },
            {
                number: 'ISS0009118',
                short_description: 'Missing evidence for Access Review Attestation',
                state: 'new',
                priority: '3',
                profile: 'Customer Data Application',
                source: 'CTRL0055140',
                assigned_to: 'Sarah Chen',
                remediation_task: '',
                description: 'The quarterly attestation for user access reviews was submitted without the required PDF evidence attachment.'
            }
        ],
        processExplanation: {
            title: 'How Issues Drive Remediation',
            steps: [
                {
                    heading: '1. Issue Generation',
                    content: 'Issues (<code>sn_grc_issue</code>) are typically generated automatically. If a Control Owner fails an attestation, or a continuous monitoring Indicator fails its test, an Issue is spawned immediately and assigned to the Entity owner.'
                },
                {
                    heading: '2. Remediation Tasks',
                    content: 'To fix an Issue, you create Remediation Tasks. These are actionable tickets routed to IT or operations teams to actually perform the fix (e.g., "Please enable encryption on this volume").'
                },
                {
                    heading: '3. Closing the Loop',
                    content: 'When the Issue is marked Closed, the system can automatically re-test the Control. If the Indicator passes this time, the Control becomes Compliant again, and the Risk Score goes back down.'
                }
            ]
        }
    }
};

