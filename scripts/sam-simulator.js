// ============================================
// SAM PROCESS SIMULATOR — Data & Logic
// Enterprise Software Asset Management Pro (SAM Pro)
// ============================================

const SamSimulatorData = {
    // -----------------------------------------------
    // TAB 1: Software Installations (cmdb_sam_sw_install)
    // -----------------------------------------------
    'cmdb_sam_sw_install': {
        label: 'Installations',
        table: 'cmdb_sam_sw_install',
        icon: '',
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
                { value: 'absent', label: 'Absent' }
            ]},
            { name: 'install_date', label: 'Install Date', type: 'datetime' },
            { name: 'last_used', label: 'Last Used Date', type: 'datetime' },
            { name: 'usage_status', label: 'Usage Status', type: 'choice', choices: [
                { value: 'active_usage', label: 'Active Usage (< 30 days)' },
                { value: 'low_usage', label: 'Low Usage (30-60 days)' },
                { value: 'inactive_90_days', label: 'Inactive (> 90 days)' },
                { value: 'not_tracked', label: 'Not Tracked' }
            ]},
            { name: 'uninstall_string', label: 'Uninstall String', type: 'string' }
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
                uninstall_string: 'MsiExec.exe /X{87B9F100-34A1-4F29-92DF-39F224BC1900}'
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
                uninstall_string: 'MsiExec.exe /I{AC76BA86-1033-FFFF-7760-0C0F074E4100}'
            },
            {
                display_name: 'Microsoft 365 Apps for enterprise - en-us',
                publisher: 'Microsoft Corporation',
                version: '16.0.17126.20132',
                edition: 'Enterprise',
                installed_on: 'LAP-EXEC-012',
                discovery_model: 'Microsoft 365 Apps for enterprise',
                install_status: 'installed',
                install_date: '2024-03-02 09:30:00',
                last_used: '2026-08-04 09:12:45',
                usage_status: 'active_usage',
                uninstall_string: 'C:\\Program Files\\Common Files\\Microsoft Shared\\ClickToRun\\OfficeClickToRun.exe scenario=install'
            },
            {
                display_name: 'Oracle Database 19c Enterprise Edition Release 19.0.0.0.0',
                publisher: 'Oracle America Inc.',
                version: '19.3.0.0',
                edition: 'Enterprise',
                installed_on: 'SRV-ORA-PRD02',
                discovery_model: 'Oracle Database 19c Enterprise Edition',
                install_status: 'installed',
                install_date: '2022-11-05 16:45:10',
                last_used: '2026-08-04 07:55:00',
                usage_status: 'active_usage',
                uninstall_string: '/u01/app/oracle/product/19.3.0/dbhome_1/deinstall/deinstall'
            },
            {
                display_name: 'VMware vSphere ESXi 8.0 Update 2b',
                publisher: 'VMware Inc.',
                version: '8.0.2-23305545',
                edition: 'Enterprise Plus',
                installed_on: 'HOST-BLADE-04',
                discovery_model: 'VMware vSphere 8.0 Enterprise Plus',
                install_status: 'installed',
                install_date: '2023-09-15 13:00:00',
                last_used: '2026-08-04 09:20:00',
                usage_status: 'active_usage',
                uninstall_string: 'esxcli software profile install'
            }
        ],
        processExplanation: {
            title: 'How Raw Installations Ingestion Works',
            steps: [
                {
                    heading: '1. Multi-Source Ingestion & IRE Pipeline',
                    content: 'Software installation records enter ServiceNow through various discovery channels: Service Graph Connectors (SCCM, Jamf, Microsoft Intune, Tanium, BigFix), Agent Client Collector for Visibility (ACC-V), or Agentless IP Discovery. In modern architectures, all records pass through the Identification and Reconciliation Engine (IRE) to prevent duplicate Configuration Items (CIs) before populating <code>cmdb_sam_sw_install</code>.'
                },
                {
                    heading: '2. The Physical/Virtual Host Binding',
                    content: 'The <code>installed_on</code> reference links the software string directly to a hardware CI (e.g., physical server, ESXi host, or virtual machine). This relationship is critical for Reconciliation: server license calculations (such as Microsoft SQL Server or Oracle Database) require knowing the host CPU sockets, physical cores, and hyperthreading configurations to determine exact license liability.'
                },
                {
                    heading: '3. Usage Metering & Last Used Timestamp',
                    content: 'SAM Pro integrates with client management metering (SCCM software metering, Jamf application usage, ACC-V process monitoring) to record the <code>last_used</code> timestamp and <code>usage_status</code>. When usage falls below policy thresholds (e.g., > 90 days inactive), the system flags the installation as an automatic target for Software Reclamation.'
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
        icon: '',
        description: 'Normalized grouping of software installations into standard Publisher, Product, Version, and Edition signatures using the Content Delivery Service (CDS).',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'norm_publisher', label: 'Normalized Publisher', type: 'string' },
            { name: 'norm_product', label: 'Normalized Product', type: 'string' },
            { name: 'norm_version', label: 'Normalized Version', type: 'string' },
            { name: 'norm_edition', label: 'Normalized Edition', type: 'string' },
            { name: 'norm_platform', label: 'Normalized Platform', type: 'choice', choices: [
                { value: 'windows', label: 'Windows' },
                { value: 'macos', label: 'macOS' },
                { value: 'linux', label: 'Linux' },
                { value: 'unix', label: 'UNIX' },
                { value: 'multi_platform', label: 'Multi-Platform' }
            ]},
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'normalization_status', label: 'Normalization Status', type: 'choice', choices: [
                { value: 'normalized', label: 'Normalized' },
                { value: 'partially_normalized', label: 'Partially Normalized' },
                { value: 'publisher_normalized', label: 'Publisher Normalized' },
                { value: 'match_not_found', label: 'Match Not Found' },
                { value: 'manually_normalized', label: 'Manually Normalized' }
            ]},
            { name: 'normalization_rule', label: 'Applied Rule', type: 'string' },
            { name: 'in_content_library', label: 'In Content Library', type: 'choice', choices: [
                { value: 'true', label: 'Yes (Content Service)' },
                { value: 'false', label: 'No (Custom/In-House)' }
            ]},
            { name: 'last_normalized', label: 'Last Normalized', type: 'datetime' }
        ],
        records: [
            {
                display_name: 'Microsoft SQL Server 2019 Standard',
                norm_publisher: 'Microsoft',
                norm_product: 'SQL Server',
                norm_version: '2019',
                norm_edition: 'Standard',
                norm_platform: 'windows',
                software_model: 'SM-MS-SQL-2019-STD',
                normalization_status: 'normalized',
                normalization_rule: 'CDS Pattern: Microsoft SQL Server 2019*',
                in_content_library: 'true',
                last_normalized: '2026-08-01 02:30:15'
            },
            {
                display_name: 'Adobe Acrobat Pro DC 2023',
                norm_publisher: 'Adobe',
                norm_product: 'Acrobat Pro DC',
                norm_version: '2023',
                norm_edition: 'Pro',
                norm_platform: 'windows',
                software_model: 'SM-ADOBE-ACROBAT-PRO-DC',
                normalization_status: 'normalized',
                normalization_rule: 'CDS Pattern: Adobe Acrobat Pro DC*',
                in_content_library: 'true',
                last_normalized: '2026-08-01 02:32:00'
            },
            {
                display_name: 'Microsoft 365 Apps for enterprise',
                norm_publisher: 'Microsoft',
                norm_product: 'Microsoft 365 Apps',
                norm_version: '16.0',
                norm_edition: 'Enterprise',
                norm_platform: 'windows',
                software_model: 'SM-MS-365-E5-SUITE',
                normalization_status: 'normalized',
                normalization_rule: 'CDS Pattern: Microsoft 365 Apps*',
                in_content_library: 'true',
                last_normalized: '2026-08-01 02:33:45'
            },
            {
                display_name: 'Oracle Database 19c Enterprise Edition',
                norm_publisher: 'Oracle',
                norm_product: 'Database',
                norm_version: '19c',
                norm_edition: 'Enterprise',
                norm_platform: 'linux',
                software_model: 'SM-ORA-DB-19C-EE',
                normalization_status: 'normalized',
                normalization_rule: 'CDS Pattern: Oracle Database 19c*',
                in_content_library: 'true',
                last_normalized: '2026-08-01 02:35:10'
            },
            {
                display_name: 'Acme InHouse Billing System Client v4.2',
                norm_publisher: 'Acme Corporation',
                norm_product: 'Billing System Client',
                norm_version: '4.2',
                norm_edition: 'Standard',
                norm_platform: 'windows',
                software_model: 'SM-ACME-BILLING-CLIENT-4',
                normalization_status: 'manually_normalized',
                normalization_rule: 'Custom Normalization Rule: AcmeBilling_*',
                in_content_library: 'false',
                last_normalized: '2026-07-15 14:10:00'
            }
        ],
        processExplanation: {
            title: 'The Normalization Engine & Content Library',
            steps: [
                {
                    heading: '1. The 4-Tier Match Engine',
                    content: 'Whenever a record in <code>cmdb_sam_sw_install</code> is created or updated, the SAM Normalization Engine executes. It attempts to resolve four discrete attributes: Publisher, Product, Version, and Edition. It checks against the Central Content Library, which is updated weekly from ServiceNow CDN servers.'
                },
                {
                    heading: '2. Normalization Statuses & Meaning',
                    content: 'A record with status <code>Normalized</code> has achieved a definitive 4-tier match. <code>Partially Normalized</code> means Publisher and Product matched, but version/edition requires clarification. <code>Match Not Found</code> represents custom or proprietary apps not present in ServiceNow global catalog, which require Custom Normalization Rules.'
                },
                {
                    heading: '3. Grouping Thousands into One',
                    content: 'The Discovery Model creates an essential many-to-one abstraction. Five thousand machines each reporting slight variations like "Adobe Acrobat 2023.001" or "Adobe Acrobat DC Pro 23" all map to a single clean Discovery Model, enabling accurate aggregation for licensing.'
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
        icon: '',
        description: 'The critical business bridge. Connects normalized technical installations to commercial purchase entitlements and vendor support lifecycles.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'publisher', label: 'Publisher', type: 'reference', refTable: 'core_company' },
            { name: 'product', label: 'Product', type: 'string' },
            { name: 'version', label: 'Version', type: 'string' },
            { name: 'edition', label: 'Edition', type: 'string' },
            { name: 'platform', label: 'Platform', type: 'choice', choices: [
                { value: 'multi_platform', label: 'Multi-Platform' },
                { value: 'windows', label: 'Windows' },
                { value: 'linux', label: 'Linux' }
            ]},
            { name: 'lifecycle_phase', label: 'Lifecycle Phase', type: 'choice', choices: [
                { value: 'general_availability', label: 'General Availability (GA)' },
                { value: 'end_of_support', label: 'End of Support (EOS)' },
                { value: 'end_of_extended_support', label: 'End of Extended Support (EOES)' },
                { value: 'end_of_life', label: 'End of Life (EOL)' }
            ]},
            { name: 'general_availability', label: 'GA Date', type: 'datetime' },
            { name: 'end_of_support', label: 'EOS Date', type: 'datetime' },
            { name: 'end_of_life', label: 'EOL Date', type: 'datetime' },
            { name: 'is_suite', label: 'Is Suite Parent', type: 'choice', choices: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ]},
            { name: 'discovery_map', label: 'Discovery Map (DMAP)', type: 'string' }
        ],
        records: [
            {
                display_name: 'Microsoft SQL Server 2019 Standard',
                publisher: 'Microsoft',
                product: 'SQL Server',
                version: '2019',
                edition: 'Standard',
                platform: 'windows',
                lifecycle_phase: 'general_availability',
                general_availability: '2019-11-04 00:00:00',
                end_of_support: '2025-01-07 00:00:00',
                end_of_life: '2030-01-08 00:00:00',
                is_suite: 'false',
                discovery_map: 'DMAP-MS-SQL-2019-STD-64'
            },
            {
                display_name: 'Adobe Acrobat Pro DC',
                publisher: 'Adobe',
                product: 'Acrobat Pro DC',
                version: 'Continuous',
                edition: 'Pro',
                platform: 'multi_platform',
                lifecycle_phase: 'general_availability',
                general_availability: '2015-04-07 00:00:00',
                end_of_support: '2027-12-31 00:00:00',
                end_of_life: '2029-12-31 00:00:00',
                is_suite: 'false',
                discovery_map: 'DMAP-ADOBE-ACROBAT-PRO-DC'
            },
            {
                display_name: 'Microsoft 365 E5 Enterprise Suite',
                publisher: 'Microsoft',
                product: 'Microsoft 365',
                version: 'Cloud',
                edition: 'Enterprise E5',
                platform: 'multi_platform',
                lifecycle_phase: 'general_availability',
                general_availability: '2017-08-01 00:00:00',
                end_of_support: '2099-12-31 00:00:00',
                end_of_life: '2099-12-31 00:00:00',
                is_suite: 'true',
                discovery_map: 'DMAP-MS-365-E5-SUITE'
            },
            {
                display_name: 'Oracle Database 19c Enterprise Edition',
                publisher: 'Oracle',
                product: 'Database',
                version: '19c',
                edition: 'Enterprise',
                platform: 'linux',
                lifecycle_phase: 'general_availability',
                general_availability: '2019-04-25 00:00:00',
                end_of_support: '2027-04-30 00:00:00',
                end_of_life: '2029-04-30 00:00:00',
                is_suite: 'false',
                discovery_map: 'DMAP-ORA-DB-19C-EE'
            },
            {
                display_name: 'Microsoft Windows Server 2012 R2 Standard',
                publisher: 'Microsoft',
                product: 'Windows Server',
                version: '2012 R2',
                edition: 'Standard',
                platform: 'windows',
                lifecycle_phase: 'end_of_life',
                general_availability: '2013-10-18 00:00:00',
                end_of_support: '2018-10-09 00:00:00',
                end_of_life: '2023-10-10 00:00:00',
                is_suite: 'false',
                discovery_map: 'DMAP-MS-WIN-SVR-2012R2-STD'
            }
        ],
        processExplanation: {
            title: 'Software Models: The Bridge & Lifecycle Sentinel',
            steps: [
                {
                    heading: '1. The Commercial-to-Technical Translator',
                    content: 'IT discovery discovers software strings, but Procurement buys contracts and SKUs. The Software Model is the Rosetta Stone of SAM: it links multiple Discovery Models to commercial Software Entitlements (<code>alm_license</code>).'
                },
                {
                    heading: '2. Discovery Maps (DMAPs)',
                    content: 'Pre-configured Discovery Maps (DMAPs) maintained by ServiceNow automatically connect Discovery Models to Software Models without manual mapping. When you select a Publisher Part Number (PPN), the DMAP automatically configures the appropriate version, edition, and platform rules.'
                },
                {
                    heading: '3. Technical Debt & EOL Risk Monitoring',
                    content: 'Software Models track publisher lifecycle milestones: General Availability (GA), End of Support (EOS), and End of Life (EOL). Software running past EOL (like Windows Server 2012 R2 above) receives no security patches, creating critical compliance and cybersecurity risks visible in the SAM and SecOps workspaces.'
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
        icon: '',
        description: 'Purchased software license rights, contracts, metrics, unit costs, and maintenance terms governing legal usage.',
        fields: [
            { name: 'asset_tag', label: 'Asset Tag', type: 'string' },
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'license_metric', label: 'License Metric', type: 'choice', choices: [
                { value: 'per_core', label: 'Per Core (Physical/Virtual)' },
                { value: 'per_user', label: 'Per User' },
                { value: 'per_device', label: 'Per Device' },
                { value: 'per_processor', label: 'Per Processor' },
                { value: 'user_subscription', label: 'User Subscription (SaaS)' }
            ]},
            { name: 'purchased_rights', label: 'Purchased Rights', type: 'number' },
            { name: 'active_rights', label: 'Active Rights', type: 'number' },
            { name: 'allocated_rights', label: 'Allocated Rights', type: 'number' },
            { name: 'unit_cost', label: 'Unit Cost ($)', type: 'number' },
            { name: 'total_cost', label: 'Total Cost ($)', type: 'number' },
            { name: 'po_number', label: 'PO Number', type: 'string' },
            { name: 'agreement_type', label: 'Agreement Type', type: 'choice', choices: [
                { value: 'enterprise_agreement', label: 'Enterprise Agreement (EA)' },
                { value: 'volume_licensing', label: 'Volume Licensing' },
                { value: 'subscription', label: 'Subscription' },
                { value: 'retail', label: 'Retail / Perpetual' }
            ]},
            { name: 'maintenance_vendor', label: 'Maintenance Vendor', type: 'reference', refTable: 'core_company' },
            { name: 'start_date', label: 'Start Date', type: 'datetime' },
            { name: 'end_date', label: 'End Date', type: 'datetime' },
            { name: 'downgrade_rights', label: 'Downgrade Rights', type: 'choice', choices: [
                { value: 'true', label: 'Enabled' },
                { value: 'false', label: 'Disabled' }
            ]}
        ],
        records: [
            {
                asset_tag: 'ENT-2024-MS-SQL-CORE',
                display_name: 'Microsoft SQL Server 2019 Standard - 64 Core Pack',
                software_model: 'Microsoft SQL Server 2019 Standard',
                license_metric: 'per_core',
                purchased_rights: 64,
                active_rights: 64,
                allocated_rights: 48,
                unit_cost: 1795,
                total_cost: 114880,
                po_number: 'PO-2024-09881',
                agreement_type: 'enterprise_agreement',
                maintenance_vendor: 'Microsoft Corporation',
                start_date: '2024-01-01 00:00:00',
                end_date: '2027-01-01 00:00:00',
                downgrade_rights: 'true'
            },
            {
                asset_tag: 'ENT-2023-ADOBE-ACRO-PRO',
                display_name: 'Adobe Acrobat Pro DC - 250 Named User Subscription',
                software_model: 'Adobe Acrobat Pro DC',
                license_metric: 'per_user',
                purchased_rights: 250,
                active_rights: 250,
                allocated_rights: 218,
                unit_cost: 179,
                total_cost: 44750,
                po_number: 'PO-2023-04112',
                agreement_type: 'subscription',
                maintenance_vendor: 'Adobe Systems Inc.',
                start_date: '2023-11-01 00:00:00',
                end_date: '2026-11-01 00:00:00',
                downgrade_rights: 'false'
            },
            {
                asset_tag: 'ENT-2024-M365-E5-USL',
                display_name: 'Microsoft 365 E5 User Subscription - 1,200 Seats',
                software_model: 'Microsoft 365 E5 Enterprise Suite',
                license_metric: 'user_subscription',
                purchased_rights: 1200,
                active_rights: 1200,
                allocated_rights: 1185,
                unit_cost: 684,
                total_cost: 820800,
                po_number: 'PO-2024-01004',
                agreement_type: 'enterprise_agreement',
                maintenance_vendor: 'Microsoft Corporation',
                start_date: '2024-03-01 00:00:00',
                end_date: '2027-03-01 00:00:00',
                downgrade_rights: 'true'
            },
            {
                asset_tag: 'ENT-2022-ORA-19C-EE',
                display_name: 'Oracle Database Enterprise Edition - 16 Processor License',
                software_model: 'Oracle Database 19c Enterprise Edition',
                license_metric: 'per_processor',
                purchased_rights: 16,
                active_rights: 16,
                allocated_rights: 16,
                unit_cost: 47500,
                total_cost: 760000,
                po_number: 'PO-2022-08834',
                agreement_type: 'volume_licensing',
                maintenance_vendor: 'Oracle America Inc.',
                start_date: '2022-09-01 00:00:00',
                end_date: '2028-09-01 00:00:00',
                downgrade_rights: 'true'
            },
            {
                asset_tag: 'ENT-2021-MS-WIN-SVR-STD',
                display_name: 'Microsoft Windows Server 2022 Standard - 128 Core License',
                software_model: 'Microsoft Windows Server 2012 R2 Standard',
                license_metric: 'per_core',
                purchased_rights: 128,
                active_rights: 128,
                allocated_rights: 112,
                unit_cost: 150,
                total_cost: 19200,
                po_number: 'PO-2021-06721',
                agreement_type: 'enterprise_agreement',
                maintenance_vendor: 'Microsoft Corporation',
                start_date: '2021-10-01 00:00:00',
                end_date: '2026-10-01 00:00:00',
                downgrade_rights: 'true'
            }
        ],
        processExplanation: {
            title: 'Entitlement Management & Complex Metrics',
            steps: [
                {
                    heading: '1. Defining Metrics & Licensing Conditions',
                    content: 'An entitlement is an asset record extending <code>alm_asset</code>. It defines how rights are consumed. Per User/Subscription counts distinct human beings. Per Core or Per Processor requires the engine to inspect physical/virtual server topology, sockets, and hardware partitioning.'
                },
                {
                    heading: '2. Downgrade Rights & Upgrades',
                    content: 'When <code>downgrade_rights</code> is enabled (common in Microsoft and Oracle Enterprise Agreements), an entitlement for a newer product (e.g., Windows Server 2022) automatically cascades down during Reconciliation to cover legacy installs (such as Windows Server 2012 R2), avoiding false non-compliance alerts.'
                },
                {
                    heading: '3. Financial Liability Tracking',
                    content: 'The Entitlement captures purchase order numbers, unit costs, and active maintenance dates. When reconciliation discovers an under-licensed deficit, it uses the Entitlement unit cost to calculate the exact financial true-up liability facing the organization.'
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
        icon: '',
        description: 'Direct assignments reserving purchased rights for specific users or devices, prioritizing license consumption during reconciliation.',
        fields: [
            { name: 'license', label: 'Entitlement', type: 'reference', refTable: 'alm_license' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'department', label: 'Department', type: 'string' },
            { name: 'allocation_type', label: 'Allocation Type', type: 'choice', choices: [
                { value: 'user_allocation', label: 'User Allocation' },
                { value: 'device_allocation', label: 'Device Allocation' }
            ]},
            { name: 'allocated_condition', label: 'Condition', type: 'choice', choices: [
                { value: 'in_use', label: 'In Use / Verified' },
                { value: 'reserved', label: 'Reserved / Staged' },
                { value: 'pending_harvest', label: 'Pending Harvest (Inactive)' }
            ]},
            { name: 'allocated_date', label: 'Allocated Date', type: 'datetime' },
            { name: 'last_activity_date', label: 'Last Activity Date', type: 'datetime' },
            { name: 'compliance_status', label: 'Status', type: 'choice', choices: [
                { value: 'compliant', label: 'Compliant' },
                { value: 'inactive_flagged', label: 'Inactive Flagged' },
                { value: 'over_allocated', label: 'Over-Allocated' }
            ]}
        ],
        records: [
            {
                license: 'ENT-2023-ADOBE-ACRO-PRO',
                assigned_to: 'Elena Rostova',
                department: 'Legal & Compliance',
                allocation_type: 'user_allocation',
                allocated_condition: 'in_use',
                allocated_date: '2023-11-15 10:00:00',
                last_activity_date: '2026-08-03 16:45:00',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2024-M365-E5-USL',
                assigned_to: 'Marcus Vance',
                department: 'Software Engineering',
                allocation_type: 'user_allocation',
                allocated_condition: 'in_use',
                allocated_date: '2024-03-05 09:00:00',
                last_activity_date: '2026-08-04 08:30:00',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2023-ADOBE-ACRO-PRO',
                assigned_to: 'Priya Sharma',
                department: 'Business Intelligence',
                allocation_type: 'user_allocation',
                allocated_condition: 'pending_harvest',
                allocated_date: '2024-01-20 14:30:00',
                last_activity_date: '2026-04-29 10:11:00',
                compliance_status: 'inactive_flagged'
            },
            {
                license: 'ENT-2024-MS-SQL-CORE',
                assigned_to: 'David Chen',
                department: 'Cloud Infrastructure',
                allocation_type: 'device_allocation',
                allocated_condition: 'in_use',
                allocated_date: '2024-01-10 11:15:00',
                last_activity_date: '2026-08-04 07:12:00',
                compliance_status: 'compliant'
            },
            {
                license: 'ENT-2024-M365-E5-USL',
                assigned_to: 'Chloe Dubois',
                department: 'Strategic Procurement',
                allocation_type: 'user_allocation',
                allocated_condition: 'in_use',
                allocated_date: '2024-03-08 15:45:00',
                last_activity_date: '2026-08-02 11:20:00',
                compliance_status: 'compliant'
            }
        ],
        processExplanation: {
            title: 'Allocations & Consumption Hierarchy',
            steps: [
                {
                    heading: '1. Priority Right Reservation',
                    content: 'Allocating an entitlement specifically reserves that right for a named employee or CI. During Reconciliation, the engine consumes allocated rights first. This ensures legitimate licensed employees are never marked non-compliant by rogue secondary installations.'
                },
                {
                    heading: '2. Target for Automated Reclamation',
                    content: 'Allocations act as the anchor point for reclamation. When client metering confirms that an assigned user (e.g., Priya Sharma above) has not launched the software in 90+ days, SAM creates a Reclamation Candidate linked directly to this allocation record for revocation.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 6: Reconciliation Results / ELP (samp_reconciliation_result)
    // -----------------------------------------------
    'samp_reconciliation_result': {
        label: 'Reconciliation (ELP)',
        table: 'samp_reconciliation_result',
        icon: '',
        description: 'The definitive Effective License Position (ELP) comparing purchased rights against consumed rights, calculating financial true-up risks and shelfware surplus.',
        fields: [
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'publisher', label: 'Publisher', type: 'string' },
            { name: 'license_metric', label: 'Metric', type: 'choice', choices: [
                { value: 'per_core', label: 'Per Core' },
                { value: 'per_user', label: 'Per User' },
                { value: 'user_subscription', label: 'User Subscription' },
                { value: 'per_processor', label: 'Per Processor' }
            ]},
            { name: 'rights_owned', label: 'Rights Owned', type: 'number' },
            { name: 'rights_used', label: 'Rights Used', type: 'number' },
            { name: 'over_under', label: 'Over / Under (Delta)', type: 'number' },
            { name: 'compliance_status', label: 'Status', type: 'choice', choices: [
                { value: 'compliant', label: 'Compliant' },
                { value: 'non_compliant', label: 'Non-Compliant (Shortfall)' },
                { value: 'over_licensed', label: 'Over-Licensed (Shelfware)' }
            ]},
            { name: 'true_up_cost', label: 'True-Up Liability ($)', type: 'number' },
            { name: 'over_licensed_cost', label: 'Shelfware Waste ($)', type: 'number' },
            { name: 'reconciliation_run_date', label: 'Run Date', type: 'datetime' }
        ],
        records: [
            {
                software_model: 'Microsoft SQL Server 2019 Standard',
                publisher: 'Microsoft',
                license_metric: 'per_core',
                rights_owned: 64,
                rights_used: 72,
                over_under: -8,
                compliance_status: 'non_compliant',
                true_up_cost: 14360,
                over_licensed_cost: 0,
                reconciliation_run_date: '2026-08-01 04:00:00'
            },
            {
                software_model: 'Adobe Acrobat Pro DC',
                publisher: 'Adobe',
                license_metric: 'per_user',
                rights_owned: 250,
                rights_used: 218,
                over_under: 32,
                compliance_status: 'over_licensed',
                true_up_cost: 0,
                over_licensed_cost: 5728,
                reconciliation_run_date: '2026-08-01 04:00:00'
            },
            {
                software_model: 'Microsoft 365 E5 Enterprise Suite',
                publisher: 'Microsoft',
                license_metric: 'user_subscription',
                rights_owned: 1200,
                rights_used: 1185,
                over_under: 15,
                compliance_status: 'compliant',
                true_up_cost: 0,
                over_licensed_cost: 10260,
                reconciliation_run_date: '2026-08-01 04:00:00'
            },
            {
                software_model: 'Oracle Database 19c Enterprise Edition',
                publisher: 'Oracle',
                license_metric: 'per_processor',
                rights_owned: 16,
                rights_used: 20,
                over_under: -4,
                compliance_status: 'non_compliant',
                true_up_cost: 190000,
                over_licensed_cost: 0,
                reconciliation_run_date: '2026-08-01 04:00:00'
            }
        ],
        processExplanation: {
            title: 'Effective License Position (ELP) Mathematics',
            steps: [
                {
                    heading: '1. The Automated Calculation Engine',
                    content: 'Reconciliation executes as a scheduled weekly job or on demand. It evaluates software installations, applies metric rules (e.g., Microsoft 4-core VM minimums or Oracle core factor multipliers), walks downgrade trees, and subtracts consumed rights from owned rights.'
                },
                {
                    heading: '2. Under-Licensed (Audit True-Up Risk)',
                    content: 'When <code>over_under</code> is negative, the organization is legally non-compliant. The <code>true_up_cost</code> calculates the immediate financial penalty required to purchase missing licenses before a publisher audit occurs.'
                },
                {
                    heading: '3. Over-Licensed (Shelfware Waste)',
                    content: 'When <code>over_under</code> is positive, the company is overpaying for unused licenses. The <code>over_licensed_cost</code> highlights annual renewal waste, indicating opportunities to reduce contract commitments at renewal.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 7: Reclamation Candidates (samp_sw_reclamation_candidate)
    // -----------------------------------------------
    'samp_sw_reclamation_candidate': {
        label: 'Reclamation Candidates',
        table: 'samp_sw_reclamation_candidate',
        icon: '',
        description: 'Underutilized or inactive software identified by usage metering for automated de-provisioning and cost harvesting.',
        fields: [
            { name: 'number', label: 'Candidate ID', type: 'string' },
            { name: 'user', label: 'Target User', type: 'reference', refTable: 'sys_user' },
            { name: 'device', label: 'Target Device', type: 'reference', refTable: 'cmdb_ci_computer' },
            { name: 'software_model', label: 'Software Model', type: 'reference', refTable: 'cmdb_software_product_model' },
            { name: 'reclamation_rule', label: 'Triggering Rule', type: 'reference', refTable: 'samp_sw_reclamation_rule' },
            { name: 'days_inactive', label: 'Days Inactive', type: 'number' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'attention_required', label: 'Attention Required' },
                { value: 'user_notified', label: 'User Notified (Pending Response)' },
                { value: 'awaiting_approval', label: 'Awaiting Manager Approval' },
                { value: 'approved_for_removal', label: 'Approved for Removal' },
                { value: 'removal_in_progress', label: 'Removal in Progress (Client Task)' },
                { value: 'closed_complete', label: 'Closed Complete (Reclaimed)' },
                { value: 'closed_skipped', label: 'Closed Skipped (User Retained)' }
            ]},
            { name: 'potential_savings', label: 'Potential Savings ($)', type: 'number' },
            { name: 'action_taken', label: 'Action Taken', type: 'choice', choices: [
                { value: 'uninstall_requested', label: 'Uninstall Requested' },
                { value: 'user_retained', label: 'User Retained with Justification' },
                { value: 'license_harvested', label: 'License Revoked & Harvested' },
                { value: 'pending_user_response', label: 'Pending User Response' }
            ]},
            { name: 'assigned_to', label: 'Assigned SAM Analyst', type: 'reference', refTable: 'sys_user' },
            { name: 'justification', label: 'Justification / Audit Trail', type: 'textarea' }
        ],
        records: [
            {
                number: 'REC0001042',
                user: 'Priya Sharma',
                device: 'WS-ENG-088',
                software_model: 'Adobe Acrobat Pro DC',
                reclamation_rule: 'Adobe Acrobat - 90 Days Inactive',
                days_inactive: 94,
                state: 'approved_for_removal',
                potential_savings: 179,
                action_taken: 'uninstall_requested',
                assigned_to: 'Alex Morgan',
                justification: 'SCCM software metering shows zero launches since April 29. Employee confirmed via automated notification that Acrobat Pro is no longer needed.'
            },
            {
                number: 'REC0001043',
                user: 'Thomas Wright',
                device: 'LAP-FIN-104',
                software_model: 'Microsoft Visio Professional',
                reclamation_rule: 'MS Visio - 60 Days Inactive',
                days_inactive: 112,
                state: 'user_notified',
                potential_savings: 580,
                action_taken: 'pending_user_response',
                assigned_to: 'Alex Morgan',
                justification: 'Automated Teams notification sent to employee asking to confirm continued business requirement. Awaiting 5-day response timeout.'
            },
            {
                number: 'REC0001044',
                user: 'Samantha Cole',
                device: 'DESK-MKT-022',
                software_model: 'Microsoft Project Standard',
                reclamation_rule: 'MS Project - 60 Days Inactive',
                days_inactive: 68,
                state: 'removal_in_progress',
                potential_savings: 720,
                action_taken: 'uninstall_requested',
                assigned_to: 'Sarah Chen',
                justification: 'Manager approved license harvesting. Flow Designer dispatched automated PowerShell uninstall action to Intune Spoke.'
            },
            {
                number: 'REC0001045',
                user: 'Liam Gallagher',
                device: 'WS-DEV-007',
                software_model: 'Autodesk AutoCAD',
                reclamation_rule: 'AutoCAD - 90 Days Inactive',
                days_inactive: 130,
                state: 'closed_complete',
                potential_savings: 1950,
                action_taken: 'license_harvested',
                assigned_to: 'Sarah Chen',
                justification: 'Software successfully uninstalled via Jamf Pro. License allocation revoked; 1 right returned to active entitlement pool.'
            },
            {
                number: 'REC0001046',
                user: 'Nina Patel',
                device: 'LAP-SALES-49',
                software_model: 'Tableau Desktop',
                reclamation_rule: 'Tableau Desktop - 90 Days Inactive',
                days_inactive: 91,
                state: 'attention_required',
                potential_savings: 840,
                action_taken: 'pending_user_response',
                assigned_to: 'Alex Morgan',
                justification: 'New candidate identified in today weekly reclamation run. High-cost license priority.'
            }
        ],
        processExplanation: {
            title: 'Automated Reclamation & Cost Harvesting Workflow',
            steps: [
                {
                    heading: '1. Inactivity Detection',
                    content: 'A scheduled background job (<code>SAM - Create Reclamation Candidates</code>) executes daily. It queries software metering logs against active <code>samp_sw_reclamation_rule</code> records to identify software with zero launches past threshold limits.'
                },
                {
                    heading: '2. Multi-Channel User Engagement',
                    content: 'Before forcefully uninstalling software, SAM triggers an automated workflow via Email, Virtual Agent, or Microsoft Teams asking: "Do you still need this software?" If the user confirms they do, the candidate transitions to <code>Closed Skipped</code>. If they ignore or click "No", the approval is forwarded to their manager.'
                },
                {
                    heading: '3. Zero-Touch Client Removal & Right Harvesting',
                    content: 'Upon approval, Flow Designer calls an IntegrationHub spoke (SCCM, Jamf, Intune, or Tanium) to silently uninstall the package. Once confirmed uninstalled by discovery, SAM automatically revokes the allocation record, returning the license right back to the available entitlement pool.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 8: SaaS Subscriptions (samp_sw_subscription)
    // -----------------------------------------------
    'samp_sw_subscription': {
        label: 'SaaS Subscriptions',
        table: 'samp_sw_subscription',
        icon: '',
        description: 'Direct API integrations monitoring cloud user accounts, login frequency, feature consumption, and tier downgrade optimization (e.g., M365 E5 to E3).',
        fields: [
            { name: 'subscription_profile', label: 'Subscription Profile', type: 'string' },
            { name: 'publisher', label: 'Publisher', type: 'string' },
            { name: 'user_email', label: 'User Email', type: 'string' },
            { name: 'department', label: 'Department', type: 'string' },
            { name: 'assigned_plan', label: 'Assigned Plan', type: 'choice', choices: [
                { value: 'm365_e5', label: 'Microsoft 365 E5' },
                { value: 'salesforce_enterprise', label: 'Salesforce Enterprise' },
                { value: 'adobe_all_apps', label: 'Adobe CC All Apps' },
                { value: 'zoom_enterprise', label: 'Zoom Enterprise' }
            ]},
            { name: 'cost_per_month', label: 'Monthly Cost ($)', type: 'number' },
            { name: 'last_login_date', label: 'Last Login Date', type: 'datetime' },
            { name: 'activity_status', label: 'Activity Status', type: 'choice', choices: [
                { value: 'active', label: 'Active Daily/Weekly' },
                { value: 'dormant_30_days', label: 'Dormant (30-60 Days)' },
                { value: 'inactive_90_days', label: 'Inactive (> 90 Days)' },
                { value: 'duplicate_account', label: 'Duplicate Account Detected' }
            ]},
            { name: 'optimization_action', label: 'Recommended Action', type: 'choice', choices: [
                { value: 'downgrade_to_e3', label: 'Downgrade to M365 E3 (Save $21/mo)' },
                { value: 'revoke_inactive_seat', label: 'Revoke Inactive Seat (Save $150/mo)' },
                { value: 'downgrade_to_single_app', label: 'Downgrade to Single App (Save $59/mo)' },
                { value: 'reassign_to_basic_zoom', label: 'Reassign to Basic Free Host (Save $20/mo)' },
                { value: 'keep_plan', label: 'Keep Current Plan' }
            ]}
        ],
        records: [
            {
                subscription_profile: 'SUB-M365-8831',
                publisher: 'Microsoft',
                user_email: 'jordan.miller@acme.corp',
                department: 'Customer Support',
                assigned_plan: 'm365_e5',
                cost_per_month: 57,
                last_login_date: '2026-08-04 07:15:00',
                activity_status: 'active',
                optimization_action: 'downgrade_to_e3'
            },
            {
                subscription_profile: 'SUB-SFDC-4412',
                publisher: 'Salesforce',
                user_email: 'karen.black@acme.corp',
                department: 'Product Marketing',
                assigned_plan: 'salesforce_enterprise',
                cost_per_month: 150,
                last_login_date: '2026-04-18 11:30:00',
                activity_status: 'inactive_90_days',
                optimization_action: 'revoke_inactive_seat'
            },
            {
                subscription_profile: 'SUB-ADOBE-9021',
                publisher: 'Adobe',
                user_email: 'm.vance@acme.corp',
                department: 'Software Engineering',
                assigned_plan: 'adobe_all_apps',
                cost_per_month: 89,
                last_login_date: '2026-08-03 14:10:00',
                activity_status: 'active',
                optimization_action: 'downgrade_to_single_app'
            },
            {
                subscription_profile: 'SUB-ZOOM-1109',
                publisher: 'Zoom',
                user_email: 'alex.mercer@acme.corp',
                department: 'Human Resources',
                assigned_plan: 'zoom_enterprise',
                cost_per_month: 20,
                last_login_date: '2026-07-22 09:00:00',
                activity_status: 'dormant_30_days',
                optimization_action: 'reassign_to_basic_zoom'
            }
        ],
        processExplanation: {
            title: 'SaaS License Management & Tier Optimization',
            steps: [
                {
                    heading: '1. Direct Cloud API Integration',
                    content: 'ServiceNow SAM connects directly to SaaS vendor APIs (Microsoft Graph, Salesforce, Adobe Admin Console, Zoom, Google Workspace, Okta) via IntegrationHub. It automatically syncs cloud user subscriptions without needing local agent software.'
                },
                {
                    heading: '2. Deep Activity Monitoring vs Simple Login',
                    content: 'Traditional SSO only knows if a user logged in. ServiceNow SaaS License Management analyzes granular feature usage (e.g., did this M365 E5 user actually use Power BI Pro, Advanced eDiscovery, or Teams Phone System?).'
                },
                {
                    heading: '3. License Tier Optimization',
                    content: 'If an employee only uses Word, Excel, and Email, SAM recommends a License Tier Downgrade from E5 ($57/mo) to E3 ($36/mo), instantly capturing $252/year in savings per employee without impacting productivity.'
                }
            ]
        }
    }
};

if (typeof window !== 'undefined') {
    window.SamSimulatorData = SamSimulatorData;
}
