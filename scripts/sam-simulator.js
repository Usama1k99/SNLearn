// ============================================
// SAM PROCESS SIMULATOR — Data & Logic
// Enterprise Software Asset Management Pro (SAM Pro)
// Complete 13-Table Relational Schema & Records
// ============================================

const SamSimulatorData = {
    // -----------------------------------------------
    // TAB 1: Software Installations (cmdb_sam_sw_install)
    // -----------------------------------------------
    'cmdb_sam_sw_install': {
        label: 'Installations',
        table: 'cmdb_sam_sw_install',
        description: 'Raw software inventory discovered on physical and virtual devices via Service Graph Connectors, Discovery, or Agent Client Collector (ACC).',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'publisher', label: 'Publisher', type: 'string' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'edition', label: 'Edition', type: 'string' },
            { name: 'installed_on', label: 'Installed On', type: 'reference', refTable: 'cmdb_ci_computer' },
            { name: 'discovery_model', label: 'Discovery Model', type: 'reference', refTable: 'cmdb_sam_sw_discovery_model' },
            { name: 'install_status', label: 'Install Status', type: 'choice', choices: [
                { value: 'installed', label: 'Installed' },
                { value: 'absent', label: 'Absent / Removed' }
            ]},
            { name: 'install_date', label: 'Install Date', type: 'datetime' },
            { name: 'last_used', label: 'Last Used Date', type: 'datetime' },
            { name: 'usage_status', label: 'Usage Status', type: 'choice', choices: [
                { value: 'active_usage', label: 'Active Usage (< 30 days)' },
                { value: 'low_usage', label: 'Low Usage (30-60 days)' },
                { value: 'inactive_90_days', label: 'Inactive (> 90 days)' },
                { value: 'not_tracked', label: 'Not Tracked' }
            ]},
            { name: 'uninstall_string', label: 'Uninstall String', type: 'string' },
            { name: 'discovery_source', label: 'Discovery Source', type: 'choice', choices: [
                { value: 'sgc_sccm', label: 'SG - Microsoft SCCM' },
                { value: 'sgc_jamf', label: 'SG - Jamf Pro' },
                { value: 'servicenow_discovery', label: 'ServiceNow IP Discovery' },
                { value: 'acc_v', label: 'Agent Client Collector (ACC-V)' }
            ]}
        ],
        records: [
            {
                display_name: 'Microsoft SQL Server 2019 Standard Edition (64-bit)',
                publisher: 'Microsoft Corporation',
                version: '15.0.2000.5',
                edition: 'Standard',
                installed_on: 'DB-PROD-SQL01',
                discovery_model: 'Microsoft SQL Server 2019 Standard',
                install_status: 'installed',
                install_date: '2023-04-12 11:24:00',
                last_used: '2026-08-04 08:15:22',
                usage_status: 'active_usage',
                uninstall_string: 'MsiExec.exe /X{87B9F100-34A1-4F29-92DF-39F224BC1900}',
                discovery_source: 'servicenow_discovery'
            },
            {
                display_name: 'Adobe Acrobat Pro DC 2023 (Continuous)',
                publisher: 'Adobe Systems Inc.',
                version: '23.006.20380',
                edition: 'Pro',
                installed_on: 'WS-ENG-088',
                discovery_model: 'Adobe Acrobat Pro DC 2023',
                install_status: 'installed',
                install_date: '2024-01-18 14:02:15',
                last_used: '2026-04-29 10:11:00',
                usage_status: 'inactive_90_days',
                uninstall_string: 'MsiExec.exe /I{AC76BA86-1033-FFFF-7760-000000000006}',
                discovery_source: 'sgc_sccm'
            },
            {
                display_name: 'Oracle Database 19c Enterprise Edition Release 19.0.0.0.0',
                publisher: 'Oracle Corporation',
                version: '19.3.0.0',
                edition: 'Enterprise',
                installed_on: 'ORA-FIN-SRV04',
                discovery_model: 'Oracle Database 19c Enterprise',
                install_status: 'installed',
                install_date: '2022-09-30 09:12:44',
                last_used: '2026-08-03 16:45:10',
                usage_status: 'active_usage',
                uninstall_string: '/opt/oracle/product/19c/dbhome_1/deinstall/deinstall',
                discovery_source: 'acc_v'
            },
            {
                display_name: 'Zoom Workplace Desktop Client 6.0',
                publisher: 'Zoom Video Communications',
                version: '6.0.4.39884',
                edition: 'Enterprise',
                installed_on: 'LT-CORP-4091',
                discovery_model: 'Zoom Workplace Desktop Client',
                install_status: 'installed',
                install_date: '2024-03-05 13:20:00',
                last_used: '2026-08-04 14:30:11',
                usage_status: 'active_usage',
                uninstall_string: '/Applications/zoom.us.app/Contents/MacOS/ZoomLauncher -uninstall',
                discovery_source: 'sgc_jamf'
            }
        ],
        processExplanation: {
            title: 'Raw Ingestion & In-Memory Deduplication',
            steps: [
                {
                    heading: '1. Multi-Source Ingestion Framework',
                    content: 'Raw installations arrive continuously via Service Graph Connectors (SCCM, Jamf, Intune), native ServiceNow IP Discovery, and Agent Client Collector (ACC-V). Each record captures raw publisher, product name, version, and the target hosting computer CI.'
                },
                {
                    heading: '2. Normalization Engine Trigger',
                    content: 'Upon record insertion into <code>cmdb_sam_sw_install</code>, an asynchronous Business Rule automatically routes the payload to the SAM Normalization Engine. The engine matches the string against the ServiceNow Content Library (over 15 million signatures).'
                },
                {
                    heading: '3. Usage Metering Binding',
                    content: 'Execution timestamps (last used date and total launch count) are collected from endpoint event logs or metering files. These metrics drive reclamation candidate identification when software remains dormant past configured thresholds.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 2: Software Discovery Models (cmdb_sam_sw_discovery_model)
    // -----------------------------------------------
    'cmdb_sam_sw_discovery_model': {
        label: 'Discovery Models',
        table: 'cmdb_sam_sw_discovery_model',
        description: 'Canonical technical signatures grouping thousands of raw install strings, normalized against the ServiceNow Content Library (PPN/DMAP).',
        fields: [
            { name: 'norm_publisher', label: 'Normalized Publisher', type: 'string' },
            { name: 'norm_product', label: 'Normalized Product', type: 'string' },
            { name: 'norm_version', label: 'Normalized Version', type: 'string' },
            { name: 'norm_edition', label: 'Normalized Edition', type: 'string' },
            { name: 'norm_platform', label: 'Platform', type: 'choice', choices: [
                { value: 'windows', label: 'Windows' },
                { value: 'macos', label: 'macOS' },
                { value: 'linux', label: 'Linux / UNIX' },
                { value: 'cross_platform', label: 'Cross-Platform' }
            ]},
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'norm_status', label: 'Normalization Status', type: 'choice', choices: [
                { value: 'normalized', label: 'Normalized' },
                { value: 'partially_normalized', label: 'Partially Normalized' },
                { value: 'publisher_normalized', label: 'Publisher Normalized' },
                { value: 'match_not_found', label: 'Match Not Found' },
                { value: 'manually_normalized', label: 'Manually Normalized' }
            ]},
            { name: 'inferred_suite', label: 'Inferred Suite Parent', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'install_count', label: 'Install Count', type: 'number' },
            { name: 'last_normalized', label: 'Last Normalized Date', type: 'datetime' }
        ],
        records: [
            {
                norm_publisher: 'Microsoft',
                norm_product: 'SQL Server',
                norm_version: '2019',
                norm_edition: 'Standard',
                norm_platform: 'windows',
                software_model: 'Microsoft SQL Server 2019 Standard',
                norm_status: 'normalized',
                inferred_suite: '',
                install_count: 144,
                last_normalized: '2026-08-01 03:00:15'
            },
            {
                norm_publisher: 'Adobe',
                norm_product: 'Acrobat Pro',
                norm_version: 'DC 2023',
                norm_edition: 'Continuous',
                norm_platform: 'windows',
                software_model: 'Adobe Acrobat Pro DC',
                norm_status: 'normalized',
                inferred_suite: 'Adobe Creative Cloud All Apps',
                install_count: 242,
                last_normalized: '2026-08-01 03:05:42'
            },
            {
                norm_publisher: 'Oracle',
                norm_product: 'Database Enterprise Edition',
                norm_version: '19c',
                norm_edition: 'Enterprise',
                norm_platform: 'linux',
                software_model: 'Oracle Database 19c Enterprise',
                norm_status: 'normalized',
                inferred_suite: '',
                install_count: 28,
                last_normalized: '2026-08-01 03:12:08'
            },
            {
                norm_publisher: 'Zoom Video Communications',
                norm_product: 'Zoom Workplace',
                norm_version: '6.0',
                norm_edition: 'Desktop Client',
                norm_platform: 'macos',
                software_model: 'Zoom Workplace Enterprise',
                norm_status: 'normalized',
                inferred_suite: '',
                install_count: 580,
                last_normalized: '2026-08-01 03:18:22'
            }
        ],
        processExplanation: {
            title: 'Discovery Model Clustering & Pattern Normalization',
            steps: [
                {
                    heading: '1. Grouping Discovered Installs',
                    content: 'Instead of evaluating hundreds of thousands of raw installations independently during reconciliation, ServiceNow hashes Publisher, Display Name, and Version into a unique Discovery Model. All identical installations point to this single record.'
                },
                {
                    heading: '2. Continuous Content Service Curation',
                    content: 'The normalized fields (norm_publisher, norm_product, norm_version, norm_edition) are enriched weekly from the central ServiceNow Content Service. If a match is not found, the record can be opted in for anonymous crowd-sourced curation.'
                },
                {
                    heading: '3. Inferred Suite Recognition',
                    content: 'Discovery models evaluate component rules. If individual products (e.g. Word, Excel, PowerPoint) are installed together, the engine infers the parent suite (e.g. Microsoft Office 365) to prevent double counting licenses.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 3: Software Product Models (cmdb_software_product_model)
    // -----------------------------------------------
    'cmdb_software_product_model': {
        label: 'Software Models',
        table: 'cmdb_software_product_model',
        description: 'Commercial catalog definitions bridging normalized discovery models to financial license contracts, tracking lifecycle phases and suite definitions.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'manufacturer', label: 'Manufacturer', type: 'reference', refTable: 'core_company' },
            { name: 'product', label: 'Product Family', type: 'reference', refTable: 'samp_sw_product' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'edition', label: 'Edition', type: 'string' },
            { name: 'platform', label: 'Target Platform', type: 'choice', choices: [
                { value: 'cross_platform', label: 'Cross-Platform' },
                { value: 'windows', label: 'Windows' },
                { value: 'linux', label: 'Linux' },
                { value: 'macos', label: 'macOS' }
            ]},
            { name: 'lifecycle_phase', label: 'Lifecycle Phase', type: 'choice', choices: [
                { value: 'general_availability', label: 'General Availability (GA)' },
                { value: 'end_of_support', label: 'End of Support (EOS)' },
                { value: 'end_of_extended_support', label: 'End of Extended Support' },
                { value: 'end_of_life', label: 'End of Life (EOL)' }
            ]},
            { name: 'cost', label: 'List Price (USD)', type: 'number' },
            { name: 'is_suite', label: 'Is Suite Parent', type: 'choice', choices: [
                { value: 'true', label: 'Yes (Suite Parent)' },
                { value: 'false', label: 'No (Standalone Product)' }
            ]},
            { name: 'discovery_map', label: 'Discovery Map (DMAP)', type: 'reference', refTable: 'samp_sw_entitlement_definition' },
            { name: 'default_metric', label: 'Default Metric', type: 'choice', choices: [
                { value: 'per_core', label: 'Per Core' },
                { value: 'user_subscription', label: 'User Subscription' },
                { value: 'per_processor', label: 'Per Processor' },
                { value: 'named_user', label: 'Named User' }
            ]}
        ],
        records: [
            {
                display_name: 'Microsoft SQL Server 2019 Standard',
                manufacturer: 'Microsoft Corporation',
                product: 'SQL Server',
                version: '2019',
                edition: 'Standard',
                platform: 'windows',
                lifecycle_phase: 'general_availability',
                cost: 1850,
                is_suite: 'false',
                discovery_map: 'DMAP-MSSQL-2019-STD',
                default_metric: 'per_core'
            },
            {
                display_name: 'Adobe Acrobat Pro DC',
                manufacturer: 'Adobe Systems Inc.',
                product: 'Acrobat Pro',
                version: 'DC',
                edition: 'Pro',
                platform: 'cross_platform',
                lifecycle_phase: 'general_availability',
                cost: 240,
                is_suite: 'false',
                discovery_map: 'DMAP-ADOBE-ACRO-DC',
                default_metric: 'user_subscription'
            },
            {
                display_name: 'Oracle Database 19c Enterprise',
                manufacturer: 'Oracle Corporation',
                product: 'Database Enterprise Edition',
                version: '19c',
                edition: 'Enterprise',
                platform: 'linux',
                lifecycle_phase: 'general_availability',
                cost: 47500,
                is_suite: 'false',
                discovery_map: 'DMAP-ORA-DB-19C-EE',
                default_metric: 'per_processor'
            },
            {
                display_name: 'Zoom Workplace Enterprise',
                manufacturer: 'Zoom Video Communications',
                product: 'Zoom Workplace',
                version: '6.0',
                edition: 'Enterprise',
                platform: 'cross_platform',
                lifecycle_phase: 'general_availability',
                cost: 180,
                is_suite: 'false',
                discovery_map: 'DMAP-ZOOM-WORK-ENT',
                default_metric: 'user_subscription'
            }
        ],
        processExplanation: {
            title: 'The Relational Keystone: Software Models',
            steps: [
                {
                    heading: '1. The Architectural Bridge',
                    content: 'The Software Model (<code>cmdb_software_product_model</code>) is the central bridge of SAM Pro. It connects technical reality (Software Discovery Models) to contractual procurement reality (Software Entitlements).'
                },
                {
                    heading: '2. Discovery Maps (DMAPs)',
                    content: 'A Discovery Map encapsulates vendor licensing logic. When you link a DMAP to a Software Model, ServiceNow automatically matches all existing and future normalized discovery models without requiring manual query filters.'
                },
                {
                    heading: '3. Lifecycle & Risk Tracking',
                    content: 'Software Models track publisher milestones (GA, EOS, EOL). When software transitions to End of Life, SAM alerts security and architecture teams to prevent vulnerabilities from unpatched legacy platforms.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 4: Software Lifecycle Milestones (samp_sw_lifecycle)
    // -----------------------------------------------
    'samp_sw_lifecycle': {
        label: 'Lifecycles',
        table: 'samp_sw_lifecycle',
        description: 'Publisher support milestones (GA, End of Support, End of Extended Support, End of Life) enriched continuously by the ServiceNow Content Service.',
        fields: [
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'lifecycle_phase', label: 'Current Phase', type: 'choice', choices: [
                { value: 'general_availability', label: 'General Availability (GA)' },
                { value: 'end_of_support', label: 'End of Support (EOS)' },
                { value: 'end_of_extended_support', label: 'End of Extended Support' },
                { value: 'end_of_life', label: 'End of Life (EOL)' }
            ]},
            { name: 'source', label: 'Data Source', type: 'choice', choices: [
                { value: 'content_service', label: 'ServiceNow Content Service' },
                { value: 'internal_curation', label: 'Internal Enterprise Curation' },
                { value: 'vendor_bulletin', label: 'Vendor Security Bulletin' }
            ]},
            { name: 'start_date', label: 'General Availability Date', type: 'date' },
            { name: 'end_support_date', label: 'End of Support Date', type: 'date' },
            { name: 'end_extended_support_date', label: 'End of Extended Support', type: 'date' },
            { name: 'end_of_life_date', label: 'End of Life Date', type: 'date' },
            { name: 'risk_level', label: 'Lifecycle Risk Level', type: 'choice', choices: [
                { value: 'low_risk', label: 'Low Risk (Active Support)' },
                { value: 'moderate_risk', label: 'Moderate (Approaching EOS)' },
                { value: 'high_risk', label: 'High Risk (Extended Support Only)' },
                { value: 'critical_eol_risk', label: 'Critical Risk (Past End of Life)' }
            ]}
        ],
        records: [
            {
                software_model: 'Microsoft SQL Server 2019 Standard',
                lifecycle_phase: 'general_availability',
                source: 'content_service',
                start_date: '2019-11-04',
                end_support_date: '2025-01-07',
                end_extended_support_date: '2030-01-08',
                end_of_life_date: '2030-01-08',
                risk_level: 'low_risk'
            },
            {
                software_model: 'Microsoft Windows Server 2012 R2',
                lifecycle_phase: 'end_of_life',
                source: 'content_service',
                start_date: '2013-10-18',
                end_support_date: '2018-10-09',
                end_extended_support_date: '2023-10-10',
                end_of_life_date: '2023-10-10',
                risk_level: 'critical_eol_risk'
            },
            {
                software_model: 'Adobe Acrobat Pro DC',
                lifecycle_phase: 'general_availability',
                source: 'content_service',
                start_date: '2023-01-15',
                end_support_date: '2028-12-31',
                end_extended_support_date: '2028-12-31',
                end_of_life_date: '2028-12-31',
                risk_level: 'low_risk'
            },
            {
                software_model: 'Oracle Database 19c Enterprise',
                lifecycle_phase: 'general_availability',
                source: 'content_service',
                start_date: '2019-02-13',
                end_support_date: '2024-04-30',
                end_extended_support_date: '2027-05-01',
                end_of_life_date: '2027-05-01',
                risk_level: 'moderate_risk'
            }
        ],
        processExplanation: {
            title: 'Lifecycle Risk Analysis & Technology Debt',
            steps: [
                {
                    heading: '1. Automated Date Synchronization',
                    content: 'ServiceNow Content Service delivers verified publisher lifecycle dates directly into <code>samp_sw_lifecycle</code>. Asset managers no longer need to manually monitor hundreds of vendor support websites.'
                },
                {
                    heading: '2. Upstream Risk Scoring',
                    content: 'When an asset approaches End of Support (typically within 12 months), SAM updates risk indicators on software model dashboards, alerting enterprise architects to fund upgrade or migration projects.'
                },
                {
                    heading: '3. Security Vulnerability Correlation',
                    content: 'Integrates natively with ServiceNow Vulnerability Response (SecOps). If unpatched CVEs affect software past End of Life, priority is automatically escalated due to absence of vendor patches.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 5: Software Entitlements (alm_license)
    // -----------------------------------------------
    'alm_license': {
        label: 'Entitlements',
        table: 'alm_license',
        description: 'Purchased software licenses extending alm_asset, capturing contract rights, maintenance periods, metrics, and downgrade rights.',
        fields: [
            { name: 'asset_tag', label: 'Asset Tag', type: 'string' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'license_metric', label: 'License Metric', type: 'choice', choices: [
                { value: 'per_core', label: 'Per Core (Physical / Virtual)' },
                { value: 'user_subscription', label: 'User Subscription' },
                { value: 'per_processor', label: 'Per Processor' },
                { value: 'named_user', label: 'Named User' }
            ]},
            { name: 'purchased_rights', label: 'Purchased Rights', type: 'number' },
            { name: 'allocated_rights', label: 'Allocated Rights', type: 'number' },
            { name: 'active_rights', label: 'Active Rights', type: 'number' },
            { name: 'unit_cost', label: 'Unit Cost (USD)', type: 'number' },
            { name: 'total_cost', label: 'Total Cost (USD)', type: 'number' },
            { name: 'po_number', label: 'Purchase Order', type: 'reference', refTable: 'proc_po' },
            { name: 'agreement_type', label: 'Agreement Type', type: 'choice', choices: [
                { value: 'enterprise_agreement', label: 'Enterprise Agreement (EA)' },
                { value: 'cloud_subscription', label: 'Cloud Subscription Agreement' },
                { value: 'perpetual_maintenance', label: 'Perpetual with Software Assurance' },
                { value: 'site_license', label: 'Site / Campus License' }
            ]},
            { name: 'downgrade_rights', label: 'Downgrade Rights', type: 'choice', choices: [
                { value: 'true', label: 'Enabled (Cascade to Older Versions)' },
                { value: 'false', label: 'Disabled (Strict Version Matching)' }
            ]},
            { name: 'start_date', label: 'Effective Start Date', type: 'date' },
            { name: 'end_date', label: 'Maintenance Expiration', type: 'date' }
        ],
        records: [
            {
                asset_tag: 'ENT-2024-MS-SQL-CORE',
                software_model: 'Microsoft SQL Server 2019 Standard',
                license_metric: 'per_core',
                purchased_rights: 128,
                allocated_rights: 64,
                active_rights: 128,
                unit_cost: 1850,
                total_cost: 236800,
                po_number: 'PO-992104',
                agreement_type: 'enterprise_agreement',
                downgrade_rights: 'true',
                start_date: '2024-01-01',
                end_date: '2027-01-01'
            },
            {
                asset_tag: 'ENT-2024-ADOBE-ACRO-USR',
                software_model: 'Adobe Acrobat Pro DC',
                license_metric: 'user_subscription',
                purchased_rights: 250,
                allocated_rights: 242,
                active_rights: 250,
                unit_cost: 240,
                total_cost: 60000,
                po_number: 'PO-883921',
                agreement_type: 'cloud_subscription',
                downgrade_rights: 'false',
                start_date: '2024-03-01',
                end_date: '2025-03-01'
            },
            {
                asset_tag: 'ENT-2023-ORA-DB-PROC',
                software_model: 'Oracle Database 19c Enterprise',
                license_metric: 'per_processor',
                purchased_rights: 32,
                allocated_rights: 16,
                active_rights: 32,
                unit_cost: 47500,
                total_cost: 1520000,
                po_number: 'PO-771802',
                agreement_type: 'perpetual_maintenance',
                downgrade_rights: 'true',
                start_date: '2023-06-01',
                end_date: '2026-06-01'
            },
            {
                asset_tag: 'ENT-2024-ZOOM-ENT-SUB',
                software_model: 'Zoom Workplace Enterprise',
                license_metric: 'user_subscription',
                purchased_rights: 600,
                allocated_rights: 580,
                active_rights: 600,
                unit_cost: 180,
                total_cost: 108000,
                po_number: 'PO-901432',
                agreement_type: 'cloud_subscription',
                downgrade_rights: 'false',
                start_date: '2024-01-15',
                end_date: '2025-01-14'
            }
        ],
        processExplanation: {
            title: 'Financial Entitlement Accounting & Rights Modeling',
            steps: [
                {
                    heading: '1. Asset Inheritance & Financial Governance',
                    content: 'An entitlement extends <code>alm_asset</code>. It represents the legal right to run software. It inherits financial depreciation schedules, capital vs operating expenditure classifications, and purchase order linkages.'
                },
                {
                    heading: '2. Downgrade Rights Hierarchy Traversal',
                    content: 'When <code>downgrade_rights = true</code>, licenses for current versions automatically cascade during reconciliation to cover discovered legacy versions (e.g. SQL Server 2019 licenses covering SQL Server 2016 installs).'
                },
                {
                    heading: '3. Valuation of True-Up Liabilities',
                    content: 'The Entitlement stores contracted unit costs. When the Reconciliation Engine identifies a license deficit, it multiplies the unallocated shortage by this unit cost to project exact dollar audit liabilities.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 6: User Allocations (alm_entitlement_user)
    // -----------------------------------------------
    'alm_entitlement_user': {
        label: 'User Allocations',
        table: 'alm_entitlement_user',
        description: 'Direct assignments reserving purchased entitlement rights for specific employees (sys_user), ensuring prioritized consumption during reconciliation.',
        fields: [
            { name: 'license', label: 'Entitlement', type: 'reference', refTable: 'alm_license' },
            { name: 'assigned_to', label: 'Assigned User', type: 'reference', refTable: 'sys_user' },
            { name: 'department', label: 'Department', type: 'string' },
            { name: 'allocation_type', label: 'Allocation Type', type: 'choice', choices: [
                { value: 'user_allocation', label: 'Named User Right' },
                { value: 'subscription_allocation', label: 'Cloud Subscription Seat' }
            ]},
            { name: 'allocated_condition', label: 'Condition', type: 'choice', choices: [
                { value: 'in_use', label: 'In Use / Verified Active' },
                { value: 'reserved', label: 'Reserved / Pending Provisioning' },
                { value: 'pending_harvest', label: 'Flagged Inactive / Pending Harvest' }
            ]},
            { name: 'allocated_date', label: 'Allocated Date', type: 'datetime' },
            { name: 'last_activity_date', label: 'Last Activity Date', type: 'datetime' },
            { name: 'compliance_status', label: 'Compliance Status', type: 'choice', choices: [
                { value: 'compliant', label: 'Compliant & Active' },
                { value: 'inactive_flagged', label: 'Inactive Flagged (> 60 Days)' },
                { value: 'over_allocated', label: 'Over-Allocated Deficit' }
            ]}
        ],
        records: [
            {
                license: 'ENT-2024-ADOBE-ACRO-USR',
                assigned_to: 'Sarah Jenkins',
                department: 'Corporate Finance',
                allocation_type: 'subscription_allocation',
                allocated_condition: 'in_use',
                allocated_date: '2024-03-05 09:30:00',
                last_activity_date: '2026-08-04 11:15:00',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2024-ADOBE-ACRO-USR',
                assigned_to: 'Marcus Vance',
                department: 'Brand Design',
                allocation_type: 'subscription_allocation',
                allocated_condition: 'pending_harvest',
                allocated_date: '2024-03-10 14:00:00',
                last_activity_date: '2026-04-28 16:20:00',
                compliance_status: 'inactive_flagged'
            },
            {
                license: 'ENT-2024-ZOOM-ENT-SUB',
                assigned_to: 'Elena Rostova',
                department: 'Global Sales',
                allocation_type: 'subscription_allocation',
                allocated_condition: 'in_use',
                allocated_date: '2024-01-20 10:15:00',
                last_activity_date: '2026-08-04 15:45:00',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2024-ZOOM-ENT-SUB',
                assigned_to: 'David Kross',
                department: 'IT Cloud Infrastructure',
                allocation_type: 'subscription_allocation',
                allocated_condition: 'in_use',
                allocated_date: '2024-01-22 08:30:00',
                last_activity_date: '2026-08-04 09:10:00',
                compliance_status: 'compliant'
            }
        ],
        processExplanation: {
            title: 'Named User Licensing & Priority Allocation',
            steps: [
                {
                    heading: '1. Guaranteed Rights Reservation',
                    content: 'User allocations reserve specific entitlement rights for individuals. During reconciliation Step 7 (Allocation Prioritization), users with an explicit allocation consume license rights first before general unassigned pools.'
                },
                {
                    heading: '2. Department Chargeback & Showback',
                    content: 'Because each allocation references the user department and cost center, IT financial controllers can generate precise monthly chargeback reports allocating software expenses to the requesting business units.'
                },
                {
                    heading: '3. Inactivity Detection for Harvesting',
                    content: 'When an employee stops launching an assigned application for longer than corporate threshold (e.g., 60 days), SAM changes the allocated condition to <code>pending_harvest</code> and triggers reclamation.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 7: Device Allocations (alm_entitlement_asset)
    // -----------------------------------------------
    'alm_entitlement_asset': {
        label: 'Device Allocations',
        table: 'alm_entitlement_asset',
        description: 'Device-based rights allocations binding purchased licenses to specific hardware endpoints or virtual machines (cmdb_ci_computer).',
        fields: [
            { name: 'license', label: 'Entitlement', type: 'reference', refTable: 'alm_license' },
            { name: 'allocated_to', label: 'Allocated Computer', type: 'reference', refTable: 'cmdb_ci_computer' },
            { name: 'serial_number', label: 'Serial Number', type: 'string' },
            { name: 'model_category', label: 'Model Category', type: 'reference', refTable: 'cmdb_model_category' },
            { name: 'allocated_rights_count', label: 'Allocated Rights Count', type: 'number' },
            { name: 'assigned_date', label: 'Assigned Date', type: 'datetime' },
            { name: 'active', label: 'Active', type: 'choice', choices: [
                { value: 'true', label: 'True / Active' },
                { value: 'false', label: 'False / Inactive' }
            ]},
            { name: 'compliance_status', label: 'Allocation Status', type: 'choice', choices: [
                { value: 'compliant', label: 'Compliant & Bound' },
                { value: 'orphaned_ci', label: 'Orphaned CI (Hardware Retired)' },
                { value: 'decommissioned', label: 'Decommissioned' }
            ]}
        ],
        records: [
            {
                license: 'ENT-2024-MS-SQL-CORE',
                allocated_to: 'DB-PROD-SQL01',
                serial_number: 'VMW-ESX-SQL-0182',
                model_category: 'Virtual Machine Instance',
                allocated_rights_count: 32,
                assigned_date: '2024-01-05 11:00:00',
                active: 'true',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2024-MS-SQL-CORE',
                allocated_to: 'DB-PROD-SQL02',
                serial_number: 'VMW-ESX-SQL-0183',
                model_category: 'Virtual Machine Instance',
                allocated_rights_count: 32,
                assigned_date: '2024-01-05 11:30:00',
                active: 'true',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2023-ORA-DB-PROC',
                allocated_to: 'ORA-FIN-SRV04',
                serial_number: 'HPE-DL380-9921A',
                model_category: 'Server Hardware',
                allocated_rights_count: 8,
                assigned_date: '2023-06-15 14:20:00',
                active: 'true',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2023-ORA-DB-PROC',
                allocated_to: 'ORA-FIN-SRV05',
                serial_number: 'HPE-DL380-9922B',
                model_category: 'Server Hardware',
                allocated_rights_count: 8,
                assigned_date: '2023-06-15 15:00:00',
                active: 'true',
                compliance_status: 'compliant'
            }
        ],
        processExplanation: {
            title: 'Device & Datacenter Licensing Governance',
            steps: [
                {
                    heading: '1. Machine-Level Binding',
                    content: 'Per Device and Core-based software licenses attach directly to the hosting server or workstation. Device allocations ensure server cores are legally accounted for before non-dedicated compute pools consume rights.'
                },
                {
                    heading: '2. Cluster Topology Traversal',
                    content: 'For virtualized database workloads (ESXi clusters hosting SQL or Oracle), SAM traces from the allocated computer up to its physical cluster parent to enforce hardware core minimums (e.g. 4-core minimum per VM).'
                },
                {
                    heading: '3. Automated License Reclaim on Retirement',
                    content: 'When Hardware Asset Management (HAM) decommissions or retires an endpoint in <code>alm_hardware</code>, any linked device allocations are automatically severed and returned to the unassigned entitlement pool.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 8: Reconciliation Results (samp_reconciliation_result)
    // -----------------------------------------------
    'samp_reconciliation_result': {
        label: 'Reconciliation Runs',
        table: 'samp_reconciliation_result',
        description: 'Run header capturing audit results, true-up expenditure liability, and organization-wide compliance percentage.',
        fields: [
            { name: 'number', label: 'Reconciliation Number', type: 'string' },
            { name: 'reconciliation_date', label: 'Run Timestamp', type: 'datetime' },
            { name: 'reconciliation_scope', label: 'Scope', type: 'choice', choices: [
                { value: 'all_publishers', label: 'All Publishers (Global Enterprise)' },
                { value: 'single_publisher', label: 'Single Publisher' },
                { value: 'reconciliation_group', label: 'Reconciliation Group' }
            ]},
            { name: 'publisher_filter', label: 'Target Publisher', type: 'string' },
            { name: 'status', label: 'Execution Status', type: 'choice', choices: [
                { value: 'completed', label: 'Completed' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'failed', label: 'Failed' },
                { value: 'cancelled', label: 'Cancelled' }
            ]},
            { name: 'compliance_status', label: 'Compliance State', type: 'choice', choices: [
                { value: 'compliant', label: 'Compliant (No Shortfall)' },
                { value: 'non_compliant_shortfall', label: 'Non-Compliant (Shortfall Detected)' },
                { value: 'license_surplus', label: 'License Surplus (Over-Licensed)' }
            ]},
            { name: 'percent_compliant', label: 'Percent Compliant', type: 'string' },
            { name: 'license_cost', label: 'Total Licensed Spend (USD)', type: 'number' },
            { name: 'true_up_cost', label: 'Total True-Up Liability (USD)', type: 'number' },
            { name: 'over_licensed_amount', label: 'Surplus / Shelfware Value (USD)', type: 'number' },
            { name: 'run_by', label: 'Run By User', type: 'reference', refTable: 'sys_user' }
        ],
        records: [
            {
                number: 'REC0001092',
                reconciliation_date: '2026-08-01 02:00:00',
                reconciliation_scope: 'all_publishers',
                publisher_filter: 'All Enterprise Publishers',
                status: 'completed',
                compliance_status: 'non_compliant_shortfall',
                percent_compliant: '94.2%',
                license_cost: 4850000,
                true_up_cost: 38400,
                over_licensed_amount: 112000,
                run_by: 'System Administrator'
            },
            {
                number: 'REC0001091',
                reconciliation_date: '2026-07-31 23:30:00',
                reconciliation_scope: 'single_publisher',
                publisher_filter: 'Microsoft Corporation',
                status: 'completed',
                compliance_status: 'non_compliant_shortfall',
                percent_compliant: '91.5%',
                license_cost: 2150000,
                true_up_cost: 38400,
                over_licensed_amount: 45000,
                run_by: 'Alex Mercer'
            },
            {
                number: 'REC0001090',
                reconciliation_date: '2026-07-28 14:15:00',
                reconciliation_scope: 'single_publisher',
                publisher_filter: 'Oracle Corporation',
                status: 'completed',
                compliance_status: 'compliant',
                percent_compliant: '100.0%',
                license_cost: 1520000,
                true_up_cost: 0,
                over_licensed_amount: 190000,
                run_by: 'Alex Mercer'
            },
            {
                number: 'REC0001089',
                reconciliation_date: '2026-07-25 10:00:00',
                reconciliation_scope: 'single_publisher',
                publisher_filter: 'Adobe Systems Inc.',
                status: 'completed',
                compliance_status: 'compliant',
                percent_compliant: '98.4%',
                license_cost: 240000,
                true_up_cost: 0,
                over_licensed_amount: 19200,
                run_by: 'Sarah Jenkins'
            }
        ],
        processExplanation: {
            title: 'The 7-Step Reconciliation Sequence & Audit Reporting',
            steps: [
                {
                    heading: '1. Scheduled Multi-Publisher Calculations',
                    content: 'Reconciliation is typically scheduled to run weekly or monthly. It systematically compares normalized software discovery counts against active entitlement rights across 7 algorithmic steps.'
                },
                {
                    heading: '2. True-Up Cost Exposure Calculation',
                    content: 'When an organization consumes more rights than it purchased, the engine flags <code>non_compliant_shortfall</code> and calculates the financial liability using contracted entitlement unit costs.'
                },
                {
                    heading: '3. Audit Shield & Shelfware Discovery',
                    content: 'Reconciliation also identifies software surplus (shelfware). By quantifying unallocated licenses, IT leaders can negotiate contract reductions at contract renewal or reallocate seats to freeze new purchases.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 9: License Metric Results (samp_license_metric_result)
    // -----------------------------------------------
    'samp_license_metric_result': {
        label: 'Metric Results (ELP)',
        table: 'samp_license_metric_result',
        description: 'Granular Effective License Position (ELP) records calculated per software model and metric during reconciliation.',
        fields: [
            { name: 'reconciliation_result', label: 'Reconciliation Run', type: 'reference', refTable: 'samp_reconciliation_result' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'license_metric', label: 'License Metric', type: 'choice', choices: [
                { value: 'per_core', label: 'Per Core' },
                { value: 'user_subscription', label: 'User Subscription' },
                { value: 'per_processor', label: 'Per Processor' },
                { value: 'per_user', label: 'Per User' }
            ]},
            { name: 'rights_owned', label: 'Rights Owned', type: 'number' },
            { name: 'rights_used', label: 'Rights Used', type: 'number' },
            { name: 'over_under', label: 'Over / Under Delta', type: 'number' },
            { name: 'true_up_cost', label: 'True-Up Cost (USD)', type: 'number' },
            { name: 'unlicensed_installs', label: 'Unlicensed Installs Count', type: 'number' },
            { name: 'status', label: 'Metric Compliance Status', type: 'choice', choices: [
                { value: 'compliant', label: 'Compliant' },
                { value: 'non_compliant_deficit', label: 'Non-Compliant Deficit' },
                { value: 'license_surplus', label: 'Surplus Available' }
            ]}
        ],
        records: [
            {
                reconciliation_result: 'REC0001091',
                software_model: 'Microsoft SQL Server 2019 Standard',
                license_metric: 'per_core',
                rights_owned: 128,
                rights_used: 144,
                over_under: -16,
                true_up_cost: 29600,
                unlicensed_installs: 16,
                status: 'non_compliant_deficit'
            },
            {
                reconciliation_result: 'REC0001091',
                software_model: 'Microsoft Windows Server 2022 Datacenter',
                license_metric: 'per_core',
                rights_owned: 256,
                rights_used: 256,
                over_under: 0,
                true_up_cost: 0,
                unlicensed_installs: 0,
                status: 'compliant'
            },
            {
                reconciliation_result: 'REC0001090',
                software_model: 'Oracle Database 19c Enterprise',
                license_metric: 'per_processor',
                rights_owned: 32,
                rights_used: 28,
                over_under: 4,
                true_up_cost: 0,
                unlicensed_installs: 0,
                status: 'license_surplus'
            },
            {
                reconciliation_result: 'REC0001089',
                software_model: 'Adobe Acrobat Pro DC',
                license_metric: 'user_subscription',
                rights_owned: 250,
                rights_used: 242,
                over_under: 8,
                true_up_cost: 0,
                unlicensed_installs: 0,
                status: 'license_surplus'
            }
        ],
        processExplanation: {
            title: 'Granular Effective License Position (ELP) Math',
            steps: [
                {
                    heading: '1. Model-Metric Breakdown',
                    content: 'For every software model evaluated in a reconciliation run, ServiceNow creates a License Metric Result line. If a product is licensed under multiple metrics (e.g. Per Core vs Per User), each is evaluated separately.'
                },
                {
                    heading: '2. The Over/Under Calculation',
                    content: 'The core formula is: <code>over_under = rights_owned - rights_used</code>. A negative value indicates license deficit (under-licensed), while a positive value represents license surplus (shelfware).'
                },
                {
                    heading: '3. Remediation Trigger',
                    content: 'When <code>over_under < 0</code>, the engine automatically populates child Remediation Options in <code>samp_remediation_option</code> giving asset managers concrete action paths to resolve the deficit.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 10: Remediation Options (samp_remediation_option)
    // -----------------------------------------------
    'samp_remediation_option': {
        label: 'Remediation Options',
        table: 'samp_remediation_option',
        description: 'Engine-formulated corrective actions generated when an under-licensed shortfall or surplus optimization opportunity is discovered.',
        fields: [
            { name: 'number', label: 'Option ID', type: 'string' },
            { name: 'license_metric_result', label: 'Metric Result', type: 'reference', refTable: 'samp_license_metric_result' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'option_type', label: 'Option Type', type: 'choice', choices: [
                { value: 'purchase_rights', label: 'Purchase Additional Rights' },
                { value: 'remove_unlicensed_installs', label: 'Remove Unlicensed Installs' },
                { value: 'apply_available_allocations', label: 'Apply Available Allocations' },
                { value: 'upgrade_via_maintenance', label: 'Upgrade via Software Assurance' }
            ]},
            { name: 'short_description', label: 'Action Plan', type: 'string' },
            { name: 'rights_needed', label: 'Rights Impact', type: 'number' },
            { name: 'cost_estimate', label: 'Projected Cost / Savings (USD)', type: 'number' },
            { name: 'state', label: 'Remediation State', type: 'choice', choices: [
                { value: 'new', label: 'New / Under Review' },
                { value: 'awaiting_approval', label: 'Awaiting Budget Approval' },
                { value: 'in_progress', label: 'In Progress / PO Raised' },
                { value: 'closed_complete', label: 'Closed Complete / Resolved' }
            ]},
            { name: 'assigned_to', label: 'Assigned Specialist', type: 'reference', refTable: 'sys_user' }
        ],
        records: [
            {
                number: 'REM000401',
                license_metric_result: 'REC0001091 - MS SQL 2019 Standard',
                software_model: 'Microsoft SQL Server 2019 Standard',
                option_type: 'purchase_rights',
                short_description: 'Procure 16 additional SQL Server Core rights under Enterprise Agreement',
                rights_needed: 16,
                cost_estimate: 29600,
                state: 'awaiting_approval',
                assigned_to: 'Alex Mercer'
            },
            {
                number: 'REM000402',
                license_metric_result: 'REC0001091 - MS SQL 2019 Standard',
                software_model: 'Microsoft SQL Server 2019 Standard',
                option_type: 'remove_unlicensed_installs',
                short_description: 'Decommission unapproved Dev database instance DB-DEV-SQL99 to avoid procurement',
                rights_needed: 16,
                cost_estimate: 0,
                state: 'in_progress',
                assigned_to: 'David Kross'
            },
            {
                number: 'REM000403',
                license_metric_result: 'REC0001089 - Adobe Acrobat Pro DC',
                software_model: 'Adobe Acrobat Pro DC',
                option_type: 'apply_available_allocations',
                short_description: 'Reallocate 8 surplus cloud licenses to pending employee Service Catalog requests',
                rights_needed: 8,
                cost_estimate: 0,
                state: 'closed_complete',
                assigned_to: 'Sarah Jenkins'
            },
            {
                number: 'REM000404',
                license_metric_result: 'REC0001091 - Windows Server 2022',
                software_model: 'Microsoft Windows Server 2022 Datacenter',
                option_type: 'upgrade_via_maintenance',
                short_description: 'Cascade downgrade rights from active Software Assurance contract to older servers',
                rights_needed: 32,
                cost_estimate: 0,
                state: 'closed_complete',
                assigned_to: 'Alex Mercer'
            }
        ],
        processExplanation: {
            title: 'Actionable Remediation Workflows',
            steps: [
                {
                    heading: '1. Automated Strategic Option Generation',
                    content: 'SAM Pro does not merely alert on compliance failures; it formulates actionable business options: Purchase Rights, Remove Unlicensed Software, or Create Allocations.'
                },
                {
                    heading: '2. Integration with Procurement (PO Creation)',
                    content: 'Selecting "Purchase Rights" automatically generates a Purchase Request in the Service Catalog or creates a Purchase Order line in <code>proc_po_item</code> for vendor procurement.'
                },
                {
                    heading: '3. Technical Decommissioning Workflow',
                    content: 'Selecting "Remove Unlicensed Installs" spawns an automated SCCM or Jamf uninstall task, stripping the software from unauthorized testing or development servers to eliminate financial risk.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 11: Software Reclamation Rules (samp_sw_reclamation_rule)
    // -----------------------------------------------
    'samp_sw_reclamation_rule': {
        label: 'Reclamation Rules',
        table: 'samp_sw_reclamation_rule',
        description: 'Corporate governance policies establishing inactivity days and launch duration thresholds to trigger automated license reclamation.',
        fields: [
            { name: 'name', label: 'Rule Name', type: 'string' },
            { name: 'software_model', label: 'Target Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'days_unused', label: 'Inactivity Days Threshold', type: 'number' },
            { name: 'total_usage_threshold_hours', label: 'Minimum Usage Hours', type: 'number' },
            { name: 'notify_user', label: 'Notify User First', type: 'choice', choices: [
                { value: 'true', label: 'Yes (Send Notification)' },
                { value: 'false', label: 'No (Silent Harvest)' }
            ]},
            { name: 'auto_reclamation', label: 'Automated Uninstall Workflow', type: 'choice', choices: [
                { value: 'true', label: 'Enabled (Zero-Touch Client)' },
                { value: 'false', label: 'Disabled (Manual Approval)' }
            ]},
            { name: 'user_notification_lead_time_days', label: 'Employee Grace Period Days', type: 'number' },
            { name: 'active', label: 'Rule Active', type: 'choice', choices: [
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' }
            ]},
            { name: 'action', label: 'Enforcement Action', type: 'choice', choices: [
                { value: 'revoke_subscription', label: 'Revoke Cloud Subscription' },
                { value: 'uninstall_package', label: 'Trigger Endpoint Uninstall' },
                { value: 'reassign_license_tier', label: 'Downgrade License Tier' }
            ]}
        ],
        records: [
            {
                name: 'Adobe Acrobat Pro DC - Inactivity 90 Days',
                software_model: 'Adobe Acrobat Pro DC',
                days_unused: 90,
                total_usage_threshold_hours: 5,
                notify_user: 'true',
                auto_reclamation: 'false',
                user_notification_lead_time_days: 14,
                active: 'true',
                action: 'revoke_subscription'
            },
            {
                name: 'Microsoft Visio Professional - Inactivity 60 Days',
                software_model: 'Microsoft Visio Professional',
                days_unused: 60,
                total_usage_threshold_hours: 3,
                notify_user: 'true',
                auto_reclamation: 'true',
                user_notification_lead_time_days: 7,
                active: 'true',
                action: 'uninstall_package'
            },
            {
                name: 'Microsoft Project Professional - Inactivity 60 Days',
                software_model: 'Microsoft Project Professional',
                days_unused: 60,
                total_usage_threshold_hours: 4,
                notify_user: 'true',
                auto_reclamation: 'true',
                user_notification_lead_time_days: 7,
                active: 'true',
                action: 'uninstall_package'
            },
            {
                name: 'JetBrains IntelliJ IDEA Ultimate - Inactivity 45 Days',
                software_model: 'JetBrains IntelliJ IDEA Ultimate',
                days_unused: 45,
                total_usage_threshold_hours: 10,
                notify_user: 'true',
                auto_reclamation: 'false',
                user_notification_lead_time_days: 5,
                active: 'true',
                action: 'uninstall_package'
            }
        ],
        processExplanation: {
            title: 'Automated License Harvesting Governance',
            steps: [
                {
                    heading: '1. Policy Definition per Product Model',
                    content: 'Reclamation rules set the criteria for license harvesting. Expensive software (like MS Visio or Project) typically has shorter inactivity thresholds (60 days) to recover capital faster.'
                },
                {
                    heading: '2. Usage Hours Evaluation',
                    content: 'Beyond last-launched dates, rules evaluate cumulative hours of active foreground execution. An app launched once for 2 minutes over 90 days still qualifies for reclamation.'
                },
                {
                    heading: '3. Employee Notification Grace Period',
                    content: 'When a candidate is identified, Flow Designer automatically sends an email or Microsoft Teams prompt giving the employee 7 to 14 days to justify retaining the software before revocation.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 12: Reclamation Candidates (samp_sw_reclamation_candidate)
    // -----------------------------------------------
    'samp_sw_reclamation_candidate': {
        label: 'Reclamation Candidates',
        table: 'samp_sw_reclamation_candidate',
        description: 'Granular workflow records tracking individual employee installations or subscriptions flagged for automated harvesting.',
        fields: [
            { name: 'number', label: 'Candidate Number', type: 'string' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'user', label: 'Targeted Employee', type: 'reference', refTable: 'sys_user' },
            { name: 'device', label: 'Targeted Computer CI', type: 'reference', refTable: 'cmdb_ci_computer' },
            { name: 'reclamation_rule', label: 'Governing Rule', type: 'reference', refTable: 'samp_sw_reclamation_rule' },
            { name: 'state', label: 'Workflow State', type: 'choice', choices: [
                { value: 'attention_required', label: 'Attention Required' },
                { value: 'user_notified', label: 'User Notified (Grace Period)' },
                { value: 'awaiting_approval', label: 'Awaiting Manager Approval' },
                { value: 'removal_in_progress', label: 'Removal in Progress' },
                { value: 'closed_complete', label: 'Closed Complete (Reclaimed)' }
            ]},
            { name: 'potential_savings', label: 'Annual Savings Value (USD)', type: 'number' },
            { name: 'days_since_last_use', label: 'Days Inactive', type: 'number' },
            { name: 'justification_status', label: 'Employee Response', type: 'choice', choices: [
                { value: 'pending_response', label: 'Pending Response' },
                { value: 'business_need_confirmed', label: 'Business Need Confirmed' },
                { value: 'approved_for_harvest', label: 'Approved for Harvest' },
                { value: 'no_response_timeout', label: 'No Response (Timeout Expired)' }
            ]},
            { name: 'updated', label: 'Last Workflow Update', type: 'datetime' }
        ],
        records: [
            {
                number: 'REC-CAND-00412',
                software_model: 'Adobe Acrobat Pro DC',
                user: 'Marcus Vance',
                device: 'WS-ENG-088',
                reclamation_rule: 'Adobe Acrobat Pro DC - Inactivity 90 Days',
                state: 'user_notified',
                potential_savings: 240,
                days_since_last_use: 98,
                justification_status: 'pending_response',
                updated: '2026-08-02 11:20:00'
            },
            {
                number: 'REC-CAND-00413',
                software_model: 'Microsoft Visio Professional',
                user: 'Rachel Wei',
                device: 'LT-FIN-1044',
                reclamation_rule: 'Microsoft Visio Professional - Inactivity 60 Days',
                state: 'awaiting_approval',
                potential_savings: 360,
                days_since_last_use: 114,
                justification_status: 'no_response_timeout',
                updated: '2026-08-01 09:45:00'
            },
            {
                number: 'REC-CAND-00414',
                software_model: 'Microsoft Project Professional',
                user: 'Liam O Connor',
                device: 'LT-CORP-4091',
                reclamation_rule: 'Microsoft Project Professional - Inactivity 60 Days',
                state: 'removal_in_progress',
                potential_savings: 650,
                days_since_last_use: 78,
                justification_status: 'approved_for_harvest',
                updated: '2026-08-03 14:10:00'
            },
            {
                number: 'REC-CAND-00415',
                software_model: 'JetBrains IntelliJ IDEA Ultimate',
                user: 'Daniel Craig',
                device: 'WS-DEV-0012',
                reclamation_rule: 'JetBrains IntelliJ IDEA Ultimate - Inactivity 45 Days',
                state: 'closed_complete',
                potential_savings: 300,
                days_since_last_use: 62,
                justification_status: 'approved_for_harvest',
                updated: '2026-07-29 16:30:00'
            }
        ],
        processExplanation: {
            title: 'End-to-End Reclamation Lifecycle & Client Orchestration',
            steps: [
                {
                    heading: '1. Scheduled Reclamation Job',
                    content: 'The scheduled job <code>SAM - Update Reclamation Candidates</code> runs nightly. It scans usage tables against active Reclamation Rules and inserts candidates into <code>samp_sw_reclamation_candidate</code>.'
                },
                {
                    heading: '2. Multi-Channel Employee Engagement',
                    content: 'Flow Designer triggers an interactive notification. The employee can click "I Still Need This" (with business justification) or "Reclaim License Now" directly in their Slack, Teams, or Service Portal workspace.'
                },
                {
                    heading: '3. Zero-Touch Client Execution',
                    content: 'If approved or if timeout expires, Flow Designer invokes the Client Software Distribution (CSD) framework. It commands SCCM, Intune, or Jamf to silently uninstall the application and reclaims the entitlement right.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 13: SaaS Subscriptions (samp_sw_subscription)
    // -----------------------------------------------
    'samp_sw_subscription': {
        label: 'SaaS Subscriptions',
        table: 'samp_sw_subscription',
        description: 'Direct cloud tenant API integrations (M365, Adobe, Salesforce, Zoom) evaluating user license activity and tier downgrade opportunities.',
        fields: [
            { name: 'subscription_id', label: 'Cloud Subscription ID', type: 'string' },
            { name: 'software_model', label: 'Cloud Product Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'user_email', label: 'Assigned User Email', type: 'string' },
            { name: 'assigned_user', label: 'Matched ServiceNow User', type: 'reference', refTable: 'sys_user' },
            { name: 'service_provider', label: 'Cloud Provider', type: 'choice', choices: [
                { value: 'microsoft_365', label: 'Microsoft 365 Tenant' },
                { value: 'adobe_admin_console', label: 'Adobe Admin Console' },
                { value: 'salesforce', label: 'Salesforce Enterprise' },
                { value: 'zoom_video', label: 'Zoom Video Communications' },
                { value: 'okta_identity', label: 'Okta Universal Directory' }
            ]},
            { name: 'plan_name', label: 'Subscription Tier', type: 'string' },
            { name: 'status', label: 'Subscription Status', type: 'choice', choices: [
                { value: 'active', label: 'Active / Assigned' },
                { value: 'suspended', label: 'Suspended' },
                { value: 'unassigned', label: 'Unassigned Pool' }
            ]},
            { name: 'last_login_date', label: 'Last Cloud Login', type: 'datetime' },
            { name: 'activity_status', label: 'Activity Classification', type: 'choice', choices: [
                { value: 'active_daily', label: 'Active Daily User' },
                { value: 'active_weekly', label: 'Active Weekly User' },
                { value: 'dormant_30_days', label: 'Dormant (> 30 Days)' },
                { value: 'inactive_60_days', label: 'Inactive (> 60 Days - Downgrade Candidate)' }
            ]},
            { name: 'monthly_cost', label: 'Monthly Seat Cost (USD)', type: 'number' }
        ],
        records: [
            {
                subscription_id: 'SUB-M365-99214',
                software_model: 'Microsoft 365 E5 Suite',
                user_email: 'emily.watson@enterprise.com',
                assigned_user: 'Emily Watson',
                service_provider: 'microsoft_365',
                plan_name: 'Microsoft 365 E5 Complete',
                status: 'active',
                last_login_date: '2026-08-04 12:45:00',
                activity_status: 'active_daily',
                monthly_cost: 38
            },
            {
                subscription_id: 'SUB-M365-99215',
                software_model: 'Microsoft 365 E5 Suite',
                user_email: 'kevin.baker@enterprise.com',
                assigned_user: 'Kevin Baker',
                service_provider: 'microsoft_365',
                plan_name: 'Microsoft 365 E5 Complete',
                status: 'active',
                last_login_date: '2026-05-18 09:20:00',
                activity_status: 'inactive_60_days',
                monthly_cost: 38
            },
            {
                subscription_id: 'SUB-ADOBE-8812',
                software_model: 'Adobe Creative Cloud All Apps',
                user_email: 'jessica.alba@enterprise.com',
                assigned_user: 'Jessica Alba',
                service_provider: 'adobe_admin_console',
                plan_name: 'Creative Cloud All Apps Enterprise',
                status: 'active',
                last_login_date: '2026-07-15 14:10:00',
                activity_status: 'dormant_30_days',
                monthly_cost: 85
            },
            {
                subscription_id: 'SUB-ZOOM-7731',
                software_model: 'Zoom Workplace Enterprise',
                user_email: 'carlos.mendez@enterprise.com',
                assigned_user: 'Carlos Mendez',
                service_provider: 'zoom_video',
                plan_name: 'Zoom Workplace Enterprise Plus',
                status: 'active',
                last_login_date: '2026-08-04 15:30:00',
                activity_status: 'active_daily',
                monthly_cost: 15
            }
        ],
        processExplanation: {
            title: 'SaaS License Management & Cloud Spend Optimization',
            steps: [
                {
                    heading: '1. Direct Cloud Tenant API Ingestion',
                    content: 'ServiceNow SaaS License Management connects via IntegrationHub spokes directly to vendor cloud APIs (Microsoft Graph, Salesforce, Adobe, Zoom, Google Workspace). It synchronizes active user assignments without needing desktop client agents.'
                },
                {
                    heading: '2. Deep Feature Usage vs Simple Login',
                    content: 'Traditional SSO only knows if a user authenticated. SAM Pro inspects granular feature activity (e.g. did this M365 E5 user actually launch Power BI Pro, Teams Phone, or Defender for Endpoint?).'
                },
                {
                    heading: '3. Automated License Tier Downgrades',
                    content: 'If an employee only utilizes standard email and Office apps, SAM recommends a License Tier Downgrade from E5 ($38/mo) to E3 ($23/mo), capturing immediate recurring operational expenditure savings.'
                }
            ]
        }
    }
};

if (typeof window !== 'undefined') {
    window.SamSimulatorData = SamSimulatorData;
}
