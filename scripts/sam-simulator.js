const SamSimulatorData = {
    // -----------------------------------------------
    // TAB 1: Software Installations (cmdb_sam_sw_install)
    // -----------------------------------------------
    'cmdb_sam_sw_install': {
        label: 'Installations',
        table: 'cmdb_sam_sw_install',
        icon: '💻',
        description: 'Raw installation data discovered on a device (e.g., via ServiceNow Discovery, SCCM, or Intune).',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'publisher', label: 'Publisher', type: 'string' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'installed_on', label: 'Installed On', type: 'reference', refTable: 'cmdb_ci_computer' },
            { name: 'discovery_model', label: 'Discovery Model', type: 'reference', refTable: 'cmdb_sam_sw_discovery_model' },
            { name: 'install_status', label: 'Install Status', type: 'choice', choices: [
                { value: 'installed', label: 'Installed' },
                { value: 'absent', label: 'Absent' }
            ]}
        ],
        records: [
            {
                display_name: 'Microsoft SQL Server 2019 Standard Edition',
                publisher: 'Microsoft Corporation',
                version: '15.0.2000.5',
                installed_on: 'DB-SERVER-01',
                discovery_model: 'Microsoft SQL Server 2019 Standard',
                install_status: 'installed'
            },
            {
                display_name: 'AdobeAcrobatSTDdc 2020',
                publisher: 'Adobe Systems',
                version: '2020.001.30002',
                installed_on: 'DESKTOP-US-482',
                discovery_model: 'Adobe Acrobat DC Standard 2020',
                install_status: 'installed'
            }
        ],
        processExplanation: {
            title: 'How Installations Work',
            steps: [
                {
                    heading: '1. Raw Discovery',
                    content: 'The journey of Software Asset Management begins with Discovery. Tools like Microsoft Endpoint Configuration Manager (SCCM), Jamf, or ServiceNow Discovery actively scan the devices in your network. They pull raw strings directly from the Windows Registry or macOS file system. Because this data is entered by the software vendor at compile time, it is often incredibly messy, inconsistent, and filled with typos (e.g., "Microsoft Corp", "Microsoft Corporation", "MSFT").'
                },
                {
                    heading: '2. Creating the Install Record',
                    content: 'Once the data is ingested, a record is created in the <code>cmdb_sam_sw_install</code> table. This table is pivotal because it explicitly links the raw software string to the specific hardware Configuration Item (CI) where it was found (the <code>installed_on</code> reference field). This physical mapping is what allows the system to later calculate complex metrics like "Per Core" licensing, where the hardware specs of the CI dictate how many software rights are required.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 2: Discovery Models (cmdb_sam_sw_discovery_model)
    // -----------------------------------------------
    'cmdb_sam_sw_discovery_model': {
        label: 'Discovery Models',
        table: 'cmdb_sam_sw_discovery_model',
        icon: '🔍',
        description: 'A normalized grouping of identical software installations, regardless of minor version differences or messy strings.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'norm_publisher', label: 'Normalized Publisher', type: 'string' },
            { name: 'norm_product', label: 'Normalized Product', type: 'string' },
            { name: 'norm_version', label: 'Normalized Version', type: 'string' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'normalization_status', label: 'Normalization Status', type: 'choice', choices: [
                { value: 'normalized', label: 'Normalized' },
                { value: 'partially_normalized', label: 'Partially Normalized' },
                { value: 'publisher_normalized', label: 'Publisher Normalized' },
                { value: 'match_not_found', label: 'Match Not Found' }
            ]}
        ],
        records: [
            {
                display_name: 'Microsoft SQL Server 2019 Standard',
                norm_publisher: 'Microsoft',
                norm_product: 'SQL Server',
                norm_version: '2019',
                software_model: 'SM-SQL-SERVER-2019-STD',
                normalization_status: 'normalized'
            },
            {
                display_name: 'Adobe Acrobat DC Standard 2020',
                norm_publisher: 'Adobe Systems',
                norm_product: 'Acrobat DC Standard',
                norm_version: '2020',
                software_model: 'SM-ADOBE-ACROBAT-DC-STD-2020',
                normalization_status: 'normalized'
            }
        ],
        processExplanation: {
            title: 'The Normalization Engine',
            steps: [
                {
                    heading: '1. Finding Patterns',
                    content: 'You cannot calculate compliance if your database has 50 different variations of "Adobe Acrobat". To solve this, ServiceNow runs the Normalization Engine against every new record in the <code>cmdb_sam_sw_install</code> table. The engine compares the raw publisher, product, and version strings against the massive, cloud-hosted ServiceNow Content Library, which contains millions of known software signatures.'
                },
                {
                    heading: '2. Grouping the Chaos',
                    content: 'If it finds a match in the library, it creates or links to a Discovery Model and sets the status to "Normalized". It populates the clean, canonical publisher, product, and version fields. This process effectively groups thousands of messy, localized install records into a single, clean Discovery Model, making it possible for the Reconciliation engine to accurately count how many instances of the software actually exist in your environment.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 3: Software Models (cmdb_software_product_model)
    // -----------------------------------------------
    'cmdb_software_product_model': {
        label: 'Software Models',
        table: 'cmdb_software_product_model',
        icon: '📦',
        description: 'The critical bridge. It represents the specific software product you manage from a business perspective.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'publisher', label: 'Publisher', type: 'reference', refTable: 'core_company' },
            { name: 'product', label: 'Product', type: 'string' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'lifecycle_phase', label: 'Lifecycle Phase', type: 'choice', choices: [
                { value: 'pre_release', label: 'Pre-release' },
                { value: 'general_availability', label: 'General Availability' },
                { value: 'end_of_life', label: 'End of Life' },
                { value: 'end_of_support', label: 'End of Support' }
            ]}
        ],
        records: [
            {
                display_name: 'Microsoft SQL Server 2019 Standard',
                publisher: 'Microsoft',
                product: 'SQL Server',
                version: '2019',
                lifecycle_phase: 'general_availability'
            }
        ],
        processExplanation: {
            title: 'Connecting Tech to Finance',
            steps: [
                {
                    heading: '1. The Crucial Bridge',
                    content: 'The Software Model is arguably the most important table in SAM because it acts as the translator between two entirely different departments. IT speaks in Discovery Models (what is technically installed on servers). Finance and Procurement speak in Entitlements (what was legally purchased on a contract). The Software Model sits in the middle, connecting multiple Discovery Models to multiple Entitlements.'
                },
                {
                    heading: '2. Lifecycle Management',
                    content: 'Beyond just linking records, the Software Model tracks the business lifecycle of the product. The ServiceNow Content Library automatically populates dates for "End of Life" (EOL) or "End of Support" (EOS). This allows Enterprise Architects to run reports to see if mission-critical servers are running software that will lose security support next month, enabling proactive upgrades.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 4: Entitlements (alm_license)
    // -----------------------------------------------
    'alm_license': {
        label: 'Entitlements',
        table: 'alm_license',
        icon: '📜',
        description: 'The rights to use a software product, typically acquired via a purchase order or contract.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'license_metric', label: 'License Metric', type: 'choice', choices: [
                { value: 'per_user', label: 'Per User' },
                { value: 'per_device', label: 'Per Device' },
                { value: 'per_core', label: 'Per Core' },
                { value: 'per_processor', label: 'Per Processor' }
            ]},
            { name: 'purchased_rights', label: 'Purchased Rights', type: 'number' },
            { name: 'allocated_rights', label: 'Allocated Rights', type: 'number' },
            { name: 'cost', label: 'Total Cost ($)', type: 'number' }
        ],
        records: [
            {
                display_name: 'ENT-MS-SQL-2019-STD-CORE',
                software_model: 'Microsoft SQL Server 2019 Standard',
                license_metric: 'per_core',
                purchased_rights: 16,
                allocated_rights: 8,
                cost: 25000
            },
            {
                display_name: 'ENT-ADOBE-ACROBAT-DC',
                software_model: 'Adobe Acrobat DC Standard 2020',
                license_metric: 'per_user',
                purchased_rights: 50,
                allocated_rights: 50,
                cost: 15000
            }
        ],
        processExplanation: {
            title: 'Managing What You Own',
            steps: [
                {
                    heading: '1. Defining Rights and Metrics',
                    content: 'Entitlements represent the legal rights your organization has purchased. When entering an entitlement, you must specify the License Metric. A "Per User" metric means the system only cares about how many unique humans are using the software. A "Per Core" metric (common for databases like SQL Server) forces the system to look at the hardware specs of the server where the software is installed to calculate how many rights are consumed.'
                },
                {
                    heading: '2. The ELP Calculation',
                    content: 'During the Reconciliation process, the SAM engine runs massive background scripts to compare your Entitlements (what you own) against your Discovery Models (what you use). It takes into account downgrade rights and complex suite logic. The output is the Effective License Position (ELP), which definitively answers whether you are compliant, or if you owe the publisher money in a true-up.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 5: Software Allocations (alm_entitlement_user)
    // -----------------------------------------------
    'alm_entitlement_user': {
        label: 'Allocations',
        table: 'alm_entitlement_user',
        icon: '👤',
        description: 'Assigning a specific software right from an Entitlement to a user or device.',
        fields: [
            { name: 'license', label: 'Entitlement', type: 'reference', refTable: 'alm_license' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'allocated_condition', label: 'Allocated Condition', type: 'choice', choices: [
                { value: 'in_use', label: 'In Use' },
                { value: 'not_in_use', label: 'Not in Use' }
            ]}
        ],
        records: [
            {
                license: 'ENT-ADOBE-ACROBAT-DC',
                assigned_to: 'Elena Rostova',
                allocated_condition: 'in_use'
            }
        ],
        processExplanation: {
            title: 'Distributing Licenses',
            steps: [
                {
                    heading: '1. Reserving Rights',
                    content: 'By allocating a right to a specific user (or device), you are effectively reserving a slice of the Entitlement pool. This ensures that the user is legally allowed to use the software and prevents the system from accidentally assigning that license to someone else during reconciliation.'
                },
                {
                    heading: '2. The Foundation for Harvesting',
                    content: 'Allocations are the foundation of Software Reclamation. If a user is allocated a license but SCCM metering data shows they have not opened the application in 90 days, the system can target that specific allocation to be revoked and harvested, immediately saving the company money.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 6: Reclamation Rules (samp_sw_reclamation_rule)
    // -----------------------------------------------
    'samp_sw_reclamation_rule': {
        label: 'Reclamation Rules',
        table: 'samp_sw_reclamation_rule',
        icon: '♻️',
        description: 'Rules defining when unused software should be automatically uninstalled to save money.',
        fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'days_unused', label: 'Days Unused', type: 'number' },
            { name: 'active', label: 'Active', type: 'choice', choices: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ]}
        ],
        records: [
            {
                name: 'Adobe Acrobat DC - 90 Days Inactive',
                software_model: 'Adobe Acrobat DC Standard 2020',
                days_unused: 90,
                active: 'true'
            }
        ],
        processExplanation: {
            title: 'Automated Cost Savings',
            steps: [
                {
                    heading: '1. Defining the Triggers',
                    content: 'Reclamation Rules allow administrators to set thresholds for software usage. By specifying a "Days Unused" limit, the system continuously monitors SCCM software metering data. If a user does not launch the target software within that timeframe, the rule triggers a Remediation workflow.'
                },
                {
                    heading: '2. The Automated Workflow',
                    content: 'Once triggered, the system can automatically send an email to the user asking if they still need the software. If they ignore it or say no, Flow Designer kicks in, sends an automated uninstall command to the client management tool (like Jamf or SCCM), removes the software, and returns the license back to the available pool.'
                }
            ]
        }
    }
};

