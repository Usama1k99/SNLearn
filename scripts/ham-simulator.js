// ============================================
// HAM PROCESS SIMULATOR — Data & Logic
// Enterprise Hardware Asset Management Pro (HAM Pro)
// ============================================

const HamSimulatorData = {
    // -----------------------------------------------
    // TAB 1: Model Categories (cmdb_model_category)
    // -----------------------------------------------
    'cmdb_model_category': {
        label: 'Model Categories',
        table: 'cmdb_model_category',
        icon: '',
        description: 'The architectural bridge linking the financial Asset repository (alm_asset) with the operational CMDB (cmdb_ci).',
        fields: [
            { name: 'name', label: 'Category Name', type: 'string' },
            { name: 'asset_class', label: 'Asset Class', type: 'string' },
            { name: 'ci_class', label: 'CI Class', type: 'string' },
            { name: 'enforce_verification', label: 'Enforce CI Verification', type: 'choice', choices: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ]},
            { name: 'allow_as_master', label: 'Allow As Master Category', type: 'choice', choices: [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ]},
            { name: 'description', label: 'Operational Role & Purpose', type: 'string' }
        ],
        records: [
            {
                name: 'Computer',
                asset_class: 'alm_hardware',
                ci_class: 'cmdb_ci_computer',
                enforce_verification: 'true',
                allow_as_master: 'true',
                description: 'End-user client hardware (laptops, desktops, workstations) requiring serialized asset tracking and software discovery.'
            },
            {
                name: 'Server',
                asset_class: 'alm_hardware',
                ci_class: 'cmdb_ci_server',
                enforce_verification: 'true',
                allow_as_master: 'true',
                description: 'Enterprise data center compute infrastructure (bare-metal, blade, rack servers) supporting critical business applications.'
            },
            {
                name: 'IP Network Switch',
                asset_class: 'alm_hardware',
                ci_class: 'cmdb_ci_ip_switch',
                enforce_verification: 'false',
                allow_as_master: 'true',
                description: 'Core and access layer networking hardware requiring port configuration and topology relationship mapping.'
            },
            {
                name: 'Consumable Peripheral',
                asset_class: 'alm_consumable',
                ci_class: '',
                enforce_verification: 'false',
                allow_as_master: 'false',
                description: 'Bulk hardware items (keyboards, cables, mice) tracked by quantity in stockrooms without individual CMDB CI records.'
            }
        ],
        processExplanation: {
            title: 'The Asset-CI Bridging Mechanism',
            steps: [
                {
                    heading: '1. Class Resolution Contract',
                    content: 'Model Categories dictate whether incoming hardware creates an Asset, a CI, or both. If both asset_class and ci_class are populated, the AssetAndCISynchronizer maintains strict bi-directional synchronization.'
                },
                {
                    heading: '2. Enforce Verification Protection',
                    content: 'When enforce_verification is true, newly generated CIs enter state "Pending Verification", preventing unverified physical equipment from polluting production CMDB service dependency maps.'
                },
                {
                    heading: '3. Noise Suppression',
                    content: 'For consumable items like cables or docks, leaving ci_class empty ensures the CMDB remains focused strictly on operational assets without bogging down query engines with minor peripherals.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 2: Hardware Models (cmdb_hardware_product_model)
    // -----------------------------------------------
    'cmdb_hardware_product_model': {
        label: 'Hardware Models',
        table: 'cmdb_hardware_product_model',
        icon: '',
        description: 'Standardized hardware product specifications enriched with Content Service normalization and OEM lifecycle milestones.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'manufacturer', label: 'Manufacturer', type: 'reference', refTable: 'core_company' },
            { name: 'model_number', label: 'Model Number / Chassis', type: 'string' },
            { name: 'device_type', label: 'Device Type', type: 'choice', choices: [
                { value: 'computer', label: 'Computer / Laptop' },
                { value: 'server', label: 'Server / Compute' },
                { value: 'network', label: 'Network Device' },
                { value: 'peripheral', label: 'Peripheral' }
            ]},
            { name: 'cost', label: 'Standard MSRP Cost', type: 'currency' },
            { name: 'useful_life', label: 'Useful Life (Months)', type: 'string' },
            { name: 'status', label: 'Production Status', type: 'choice', choices: [
                { value: 'in_production', label: 'In Production' },
                { value: 'retired', label: 'Retired / EOL' }
            ]},
            { name: 'eom_date', label: 'End of Manufacturing (EOM)', type: 'date' },
            { name: 'eos_date', label: 'End of Sale (EOS)', type: 'date' },
            { name: 'eol_date', label: 'End of Life (EOL)', type: 'date' },
            { name: 'eoes_date', label: 'End of Extended Support', type: 'date' },
            { name: 'normalization_status', label: 'HAM Normalization Status', type: 'choice', choices: [
                { value: 'normalized', label: 'Normalized' },
                { value: 'partially_normalized', label: 'Partially Normalized' },
                { value: 'match_not_found', label: 'Match Not Found' }
            ]}
        ],
        records: [
            {
                display_name: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
                manufacturer: 'Apple Inc.',
                model_number: 'A2991-MBP16',
                device_type: 'computer',
                cost: '$3,499.00',
                useful_life: '36',
                status: 'in_production',
                eom_date: '2026-11-30',
                eos_date: '2026-10-15',
                eol_date: '2029-10-15',
                eoes_date: '2031-10-15',
                normalization_status: 'normalized'
            },
            {
                display_name: 'Dell PowerEdge R750xs Rack Server (2U)',
                manufacturer: 'Dell Technologies',
                model_number: 'PER750xs-2U-NVME',
                device_type: 'server',
                cost: '$8,850.00',
                useful_life: '60',
                status: 'in_production',
                eom_date: '2027-05-15',
                eos_date: '2026-12-31',
                eol_date: '2031-12-31',
                eoes_date: '2033-12-31',
                normalization_status: 'normalized'
            },
            {
                display_name: 'Cisco Catalyst 9300-48P Managed PoE Switch',
                manufacturer: 'Cisco Systems Inc.',
                model_number: 'C9300-48P-A',
                device_type: 'network',
                cost: '$4,620.00',
                useful_life: '48',
                status: 'in_production',
                eom_date: '2028-01-31',
                eos_date: '2027-08-31',
                eol_date: '2032-08-31',
                eoes_date: '2034-08-31',
                normalization_status: 'normalized'
            },
            {
                display_name: 'HP EliteBook 840 G8 Notebook PC',
                manufacturer: 'HP Inc.',
                model_number: 'EB840G8-i7',
                device_type: 'computer',
                cost: '$1,280.00',
                useful_life: '36',
                status: 'retired',
                eom_date: '2023-08-01',
                eos_date: '2023-02-15',
                eol_date: '2026-02-15',
                eoes_date: '2027-02-15',
                normalization_status: 'normalized'
            }
        ],
        processExplanation: {
            title: 'Content Delivery Service Normalization',
            steps: [
                {
                    heading: '1. Standardization of Raw Strings',
                    content: 'Incoming discovery feeds often report fragmented strings like "Dell Inc.", "DELL", or "Dell Computer Corp". HAM Pro normalizes these into a single canonical manufacturer and model record.'
                },
                {
                    heading: '2. Lifecycle Milestone Governance',
                    content: 'Milestones (EOM, EOS, EOL, EOES) are automatically synchronized from the ServiceNow Hardware Content Library, allowing asset managers to foresee replacement cycles 24 months before support expiration.'
                },
                {
                    heading: '3. Useful Life & Refresh Triggers',
                    content: 'The useful_life field is evaluated by the scheduled job "SAM - Calculate Asset Refresh Eligibility" to flag active devices for automated refresh orders once their operating threshold has passed.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 3: Hardware Assets (alm_hardware)
    // -----------------------------------------------
    'alm_hardware': {
        label: 'Hardware Assets',
        table: 'alm_hardware',
        icon: '',
        description: 'Physical enterprise equipment tracking financial acquisition, custody, warranty dates, and CSDM 4.0 lifecycle stages.',
        fields: [
            { name: 'asset_tag', label: 'Asset Tag', type: 'string' },
            { name: 'serial_number', label: 'Serial Number', type: 'string' },
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'model', label: 'Model', type: 'reference', refTable: 'cmdb_hardware_product_model' },
            { name: 'model_category', label: 'Model Category', type: 'reference', refTable: 'cmdb_model_category' },
            { name: 'install_status', label: 'State (Status)', type: 'choice', choices: [
                { value: 'in_use', label: 'In Use (1)' },
                { value: 'in_stock', label: 'In Stock (6)' },
                { value: 'in_transit', label: 'In Transit (9)' },
                { value: 'retired', label: 'Retired (7)' }
            ]},
            { name: 'substatus', label: 'Substatus', type: 'choice', choices: [
                { value: 'available', label: 'Available' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'pending_disposal', label: 'Pending Disposal' },
                { value: 'disposed', label: 'Disposed' },
                { value: 'none', label: '—' }
            ]},
            { name: 'lifecycle_stage', label: 'CSDM Lifecycle Stage', type: 'string' },
            { name: 'lifecycle_stage_status', label: 'CSDM Stage Status', type: 'string' },
            { name: 'stockroom', label: 'Stockroom', type: 'reference', refTable: 'alm_stockroom' },
            { name: 'assigned_to', label: 'Assigned To', type: 'reference', refTable: 'sys_user' },
            { name: 'cost', label: 'Acquisition Cost', type: 'currency' },
            { name: 'purchase_date', label: 'Purchase Date', type: 'date' },
            { name: 'warranty_expiration', label: 'Warranty Expiration', type: 'date' },
            { name: 'ci', label: 'Linked CI Pointer', type: 'reference', refTable: 'cmdb_ci_computer' }
        ],
        records: [
            {
                asset_tag: 'AST-LON-001094',
                serial_number: 'C02GM443MD6T',
                display_name: 'Apple MacBook Pro 16" - Sarah Chen',
                model: 'Apple MacBook Pro 16" M3 Max (36GB / 1TB)',
                model_category: 'Computer',
                install_status: 'in_use',
                substatus: 'none',
                lifecycle_stage: 'Operational',
                lifecycle_stage_status: 'In Use',
                stockroom: '',
                assigned_to: 'Sarah Chen (Senior Principal Architect)',
                cost: '$3,499.00',
                purchase_date: '2024-03-10',
                warranty_expiration: '2027-03-10',
                ci: 'LAPTOP-LON-084'
            },
            {
                asset_tag: 'AST-CHI-008492',
                serial_number: '4F92KL3-PER750',
                display_name: 'Dell PowerEdge R750xs - Production App Node',
                model: 'Dell PowerEdge R750xs Rack Server (2U)',
                model_category: 'Server',
                install_status: 'in_use',
                substatus: 'none',
                lifecycle_stage: 'Operational',
                lifecycle_stage_status: 'In Service',
                stockroom: '',
                assigned_to: 'Infrastructure Engineering Pool',
                cost: '$8,850.00',
                purchase_date: '2023-06-20',
                warranty_expiration: '2028-06-20',
                ci: 'SRV-PROD-APP02'
            },
            {
                asset_tag: 'AST-CHI-009104',
                serial_number: 'FOC244837XY',
                display_name: 'Cisco Catalyst 9300 - Staging Reserve',
                model: 'Cisco Catalyst 9300-48P Managed PoE Switch',
                model_category: 'IP Network Switch',
                install_status: 'in_stock',
                substatus: 'available',
                lifecycle_stage: 'Staging',
                lifecycle_stage_status: 'In Stockroom',
                stockroom: 'Global Distribution Hub Chicago',
                assigned_to: '',
                cost: '$4,620.00',
                purchase_date: '2024-08-01',
                warranty_expiration: '2029-08-01',
                ci: 'SW-CORE-CHI01'
            },
            {
                asset_tag: 'AST-LON-000412',
                serial_number: '5CG12489KL',
                display_name: 'HP EliteBook 840 G8 - Scheduled for E-Waste',
                model: 'HP EliteBook 840 G8 Notebook PC',
                model_category: 'Computer',
                install_status: 'in_stock',
                substatus: 'pending_disposal',
                lifecycle_stage: 'Retirement',
                lifecycle_stage_status: 'Pending Disposal',
                stockroom: 'London Tech Depot',
                assigned_to: '',
                cost: '$1,280.00',
                purchase_date: '2021-04-15',
                warranty_expiration: '2024-04-15',
                ci: 'LAPTOP-RET-019'
            }
        ],
        processExplanation: {
            title: 'Physical & Financial Custody Tracking',
            steps: [
                {
                    heading: '1. Custody vs Location Synchronization',
                    content: 'When an asset transitions to In Use, the assigned_to field documents individual custody. The AssetAndCISynchronizer immediately updates the linked CI and synchronizes department and location.'
                },
                {
                    heading: '2. Stockroom Staging Mechanics',
                    content: 'When an asset enters In Stock, it must point to a valid alm_stockroom. Substates like Available vs Reserved prevent inventory race conditions during high-volume catalog onboarding.'
                },
                {
                    heading: '3. Financial Depreciation Basis',
                    content: 'The cost field represents the unadjusted acquisition basis from the purchase order line, utilized by monthly depreciation schedules to determine real-time Net Book Value.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 4: Configuration Items (cmdb_ci_computer)
    // -----------------------------------------------
    'cmdb_ci_computer': {
        label: 'Configuration Items',
        table: 'cmdb_ci_computer',
        icon: '',
        description: 'Operational and technical device records discovered on corporate networks and bound to financial assets.',
        fields: [
            { name: 'name', label: 'Hostname / CI Name', type: 'string' },
            { name: 'ip_address', label: 'Primary IPv4 Address', type: 'string' },
            { name: 'mac_address', label: 'MAC Address', type: 'string' },
            { name: 'os', label: 'Operating System', type: 'string' },
            { name: 'cpu_count', label: 'CPU Cores', type: 'string' },
            { name: 'ram_mb', label: 'RAM (MB)', type: 'string' },
            { name: 'install_status', label: 'CI Install Status', type: 'choice', choices: [
                { value: 'installed', label: 'Installed (1)' },
                { value: 'in_stock', label: 'In Stock (6)' },
                { value: 'retired', label: 'Retired (7)' }
            ]},
            { name: 'operational_status', label: 'Operational Status', type: 'choice', choices: [
                { value: 'operational', label: 'Operational (1)' },
                { value: 'non_operational', label: 'Non-Operational (2)' }
            ]},
            { name: 'asset', label: 'Linked Financial Asset', type: 'reference', refTable: 'alm_hardware' },
            { name: 'assigned_to', label: 'Assigned User', type: 'reference', refTable: 'sys_user' },
            { name: 'discovery_source', label: 'Discovery Source', type: 'string' }
        ],
        records: [
            {
                name: 'LAPTOP-LON-084',
                ip_address: '10.24.112.44',
                mac_address: '3C:06:30:4A:12:88',
                os: 'macOS Sonoma 14.4.1',
                cpu_count: '16 Cores',
                ram_mb: '36864 MB',
                install_status: 'installed',
                operational_status: 'operational',
                asset: 'AST-LON-001094',
                assigned_to: 'Sarah Chen',
                discovery_source: 'Agent Client Collector (ACC)'
            },
            {
                name: 'SRV-PROD-APP02',
                ip_address: '172.16.40.18',
                mac_address: '00:50:56:B2:44:91',
                os: 'Red Hat Enterprise Linux 9.3',
                cpu_count: '64 Cores',
                ram_mb: '262144 MB',
                install_status: 'installed',
                operational_status: 'operational',
                asset: 'AST-CHI-008492',
                assigned_to: 'Infrastructure Engineering Pool',
                discovery_source: 'ServiceNow IP Discovery'
            },
            {
                name: 'SW-CORE-CHI01',
                ip_address: '172.16.0.2',
                mac_address: 'F4:0F:1B:32:9A:01',
                os: 'Cisco IOS-XE 17.9.4',
                cpu_count: '4 Cores',
                ram_mb: '16384 MB',
                install_status: 'in_stock',
                operational_status: 'non_operational',
                asset: 'AST-CHI-009104',
                assigned_to: '',
                discovery_source: 'Service Graph Connector'
            },
            {
                name: 'LAPTOP-RET-019',
                ip_address: '0.0.0.0',
                mac_address: 'D8:F8:83:92:4B:20',
                os: 'Windows 11 Enterprise 22H2',
                cpu_count: '8 Cores',
                ram_mb: '16384 MB',
                install_status: 'in_stock',
                operational_status: 'non_operational',
                asset: 'AST-LON-000412',
                assigned_to: '',
                discovery_source: 'ServiceNow Discovery'
            }
        ],
        processExplanation: {
            title: 'Technical CI Telemetry Synchronization',
            steps: [
                {
                    heading: '1. Identification & Reconciliation Engine (IRE)',
                    content: 'When Discovery runs, it matches physical serial numbers and MAC addresses against existing CIs. Once identified, IRE binds the operational CI to the financial Asset.'
                },
                {
                    heading: '2. Incident & Change Binding',
                    content: 'ITSM incidents and changes bind to the CI record (cmdb_ci_computer). Because the CI points directly to alm_hardware, asset managers can immediately trace warranty and vendor contract SLA commitments.'
                },
                {
                    heading: '3. Technical Decommissioning',
                    content: 'When an asset enters Retirement, its CI operational_status shifts to Non-Operational / Retired, automatically removing it from active monitoring alerts and vulnerability scanner sweeps.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 5: Stockrooms (alm_stockroom)
    // -----------------------------------------------
    'alm_stockroom': {
        label: 'Stockrooms',
        table: 'alm_stockroom',
        icon: '',
        description: 'Multi-echelon storage network including central warehouses, regional hubs, office supply closets, and loaner pools.',
        fields: [
            { name: 'name', label: 'Stockroom Name', type: 'string' },
            { name: 'type', label: 'Facility Type', type: 'choice', choices: [
                { value: 'central', label: 'Central Distribution Hub' },
                { value: 'regional', label: 'Regional Office Hub' },
                { value: 'closet', label: 'Office Supply Closet' },
                { value: 'loaner', label: 'Loaner Depot' },
                { value: 'virtual', label: 'In-Transit Virtual' }
            ]},
            { name: 'location', label: 'Physical Location', type: 'string' },
            { name: 'manager', label: 'Stockroom Manager', type: 'reference', refTable: 'sys_user' },
            { name: 'assignment_group', label: 'Fulfillment Assignment Group', type: 'reference', refTable: 'sys_user_group' },
            { name: 'parent', label: 'Parent Warehouse', type: 'reference', refTable: 'alm_stockroom' },
            { name: 'ship_to_address', label: 'Formal Loading Dock Address', type: 'string' }
        ],
        records: [
            {
                name: 'Global Distribution Hub Chicago',
                type: 'central',
                location: 'Chicago Distribution Center, Bldg B',
                manager: 'Marcus Vance (Director of Logistics)',
                assignment_group: 'Global Logistics Depot Team',
                parent: 'None (Global Tier 1 Master)',
                ship_to_address: '4200 Logistics Way, Dock 14, Chicago, IL 60666, USA'
            },
            {
                name: 'London Tech Depot',
                type: 'regional',
                location: 'London Canary Wharf Campus, Level -1',
                manager: 'Alistair Davies',
                assignment_group: 'EMEA Asset Fulfillment',
                parent: 'Global Distribution Hub Chicago',
                ship_to_address: '25 Bank Street, Goods Inward, London E14 5JP, UK'
            },
            {
                name: 'Tokyo Regional IT Closet',
                type: 'closet',
                location: 'Tokyo Roppongi Office, Floor 18 IT Room',
                manager: 'Kenji Sato',
                assignment_group: 'APAC Desktop Support',
                parent: 'Global Distribution Hub Chicago',
                ship_to_address: 'Roppongi Hills Mori Tower, 6-10-1 Roppongi, Tokyo, Japan'
            },
            {
                name: 'NYC Executive Loaner Depot',
                type: 'loaner',
                location: 'New York Manhattan HQ, Room 402',
                manager: 'Elena Rostova',
                assignment_group: 'VIP Desktop Services NYC',
                parent: 'Global Distribution Hub Chicago',
                ship_to_address: '350 5th Avenue, Delivery Entrance, New York, NY 10118, USA'
            }
        ],
        processExplanation: {
            title: 'Hub-and-Spoke Inventory Architecture',
            steps: [
                {
                    heading: '1. Multi-Tier Warehousing',
                    content: 'Central Hubs hold large quantities of bulk boxed equipment received directly from manufacturers. Regional Hubs and Closets hold lean, pre-configured inventory for rapid local dispatch.'
                },
                {
                    heading: '2. Replenishment Parent Binding',
                    content: 'The parent field establishes the logistical replenishment hierarchy. When a regional office closet drops below its safety threshold, stock rules automatically pull replenishment stock from its parent warehouse.'
                },
                {
                    heading: '3. Task Routing & Governance',
                    content: 'Catalog pick tasks and transfer receiving tasks route automatically to the assignment_group specified on the stockroom, ensuring local teams receive immediate work notifications.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 6: Transfer Orders (alm_transfer_order)
    // -----------------------------------------------
    'alm_transfer_order': {
        label: 'Transfer Orders',
        table: 'alm_transfer_order',
        icon: '',
        description: 'Inter-facility logistics tracking chain of custody across Draft, Requested, Shipment Prep, In Transit, and Delivered.',
        fields: [
            { name: 'number', label: 'Order Number', type: 'string' },
            { name: 'from_stockroom', label: 'Source Stockroom', type: 'reference', refTable: 'alm_stockroom' },
            { name: 'to_stockroom', label: 'Destination Stockroom', type: 'reference', refTable: 'alm_stockroom' },
            { name: 'stage', label: 'Transfer Stage', type: 'choice', choices: [
                { value: 'draft', label: 'Draft' },
                { value: 'requested', label: 'Requested' },
                { value: 'shipment_prep', label: 'Shipment Preparation' },
                { value: 'in_transit', label: 'In Transit' },
                { value: 'received', label: 'Received' },
                { value: 'delivered', label: 'Delivered' }
            ]},
            { name: 'carrier', label: 'Freight Logistics Carrier', type: 'string' },
            { name: 'tracking_number', label: 'Waybill / Tracking Number', type: 'string' },
            { name: 'requested_by', label: 'Requested By', type: 'reference', refTable: 'sys_user' },
            { name: 'delivery_date', label: 'Estimated Delivery Date', type: 'date' },
            { name: 'line_count', label: 'Total Units Transferred', type: 'string' }
        ],
        records: [
            {
                number: 'TO100084',
                from_stockroom: 'Global Distribution Hub Chicago',
                to_stockroom: 'London Tech Depot',
                stage: 'in_transit',
                carrier: 'FedEx International Priority Freight',
                tracking_number: '7849-2049-1182',
                requested_by: 'Alistair Davies',
                delivery_date: '2026-10-24',
                line_count: '8 Units (Apple MacBook Pro 16)'
            },
            {
                number: 'TO100085',
                from_stockroom: 'Global Distribution Hub Chicago',
                to_stockroom: 'Tokyo Regional IT Closet',
                stage: 'delivered',
                carrier: 'DHL Express Worldwide',
                tracking_number: '9284-1104-9920',
                requested_by: 'Kenji Sato',
                delivery_date: '2026-10-18',
                line_count: '15 Units (Cisco PoE Switches & Peripherals)'
            },
            {
                number: 'TO100086',
                from_stockroom: 'Global Distribution Hub Chicago',
                to_stockroom: 'NYC Executive Loaner Depot',
                stage: 'shipment_prep',
                carrier: 'UPS Ground Commercial',
                tracking_number: '1Z9999999999999999',
                requested_by: 'Elena Rostova',
                delivery_date: '2026-10-26',
                line_count: '5 Units (Executive Loaner Laptops)'
            }
        ],
        processExplanation: {
            title: 'Transfer Order Chain of Custody',
            steps: [
                {
                    heading: '1. Asset Reservation at Source',
                    content: 'Advancing an order to Requested reserves specific serialized assets at the source stockroom, immediately removing them from available pool calculations.'
                },
                {
                    heading: '2. The In-Transit State Transition',
                    content: 'When the warehouse ships the box and advances the order to In Transit, ServiceNow updates asset install_status to In Transit (9) and reassigns stockroom to the virtual in-transit container.'
                },
                {
                    heading: '3. Receiving & Put-Away',
                    content: 'Upon arrival, the destination warehouse scans the incoming package. Marking lines Received shifts the assets into state In Stock / Available at the destination stockroom.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 7: Purchase Orders (proc_po)
    // -----------------------------------------------
    'proc_po': {
        label: 'Purchase Orders',
        table: 'proc_po',
        icon: '',
        description: 'Vendor procurement contracts tracking budget authorization, lines, unit pricing, and loading dock receiving slips.',
        fields: [
            { name: 'number', label: 'PO Number', type: 'string' },
            { name: 'vendor', label: 'Hardware Vendor', type: 'reference', refTable: 'core_company' },
            { name: 'ship_to', label: 'Ship-to Stockroom', type: 'reference', refTable: 'alm_stockroom' },
            { name: 'status', label: 'PO Status', type: 'choice', choices: [
                { value: 'requested', label: 'Requested' },
                { value: 'approved', label: 'Approved' },
                { value: 'ordered', label: 'Ordered' },
                { value: 'received', label: 'Received' },
                { value: 'canceled', label: 'Canceled' }
            ]},
            { name: 'total_cost', label: 'Total Purchase Amount', type: 'currency' },
            { name: 'ordered_by', label: 'Buyer / Procurement Agent', type: 'reference', refTable: 'sys_user' },
            { name: 'order_date', label: 'PO Execution Date', type: 'date' },
            { name: 'expected_delivery', label: 'Expected Delivery Date', type: 'date' },
            { name: 'payment_terms', label: 'Payment Terms', type: 'string' }
        ],
        records: [
            {
                number: 'PO-2026-0842',
                vendor: 'Dell Technologies Inc.',
                ship_to: 'Global Distribution Hub Chicago',
                status: 'received',
                total_cost: '$88,500.00',
                ordered_by: 'Rachel Green (Senior IT Buyer)',
                order_date: '2026-09-10',
                expected_delivery: '2026-09-28',
                payment_terms: 'Net 45 Enterprise Contract'
            },
            {
                number: 'PO-2026-0843',
                vendor: 'Apple Inc.',
                ship_to: 'London Tech Depot',
                status: 'ordered',
                total_cost: '$34,990.00',
                ordered_by: 'Rachel Green (Senior IT Buyer)',
                order_date: '2026-10-12',
                expected_delivery: '2026-10-25',
                payment_terms: 'Net 30 Direct Corporate'
            },
            {
                number: 'PO-2026-0844',
                vendor: 'Cisco Systems Inc.',
                ship_to: 'Global Distribution Hub Chicago',
                status: 'approved',
                total_cost: '$23,100.00',
                ordered_by: 'David Chen (Network Procurement)',
                order_date: '2026-10-19',
                expected_delivery: '2026-11-05',
                payment_terms: 'Net 60 Partner Tier 1'
            }
        ],
        processExplanation: {
            title: 'Procurement & Automated Asset Generation',
            steps: [
                {
                    heading: '1. Sourcing Request Execution',
                    content: 'When the Sourcing Engine determines central buffer inventory is depleted, it auto-generates purchase order lines linked to approved vendor master contracts.'
                },
                {
                    heading: '2. The Receiving Dock Trigger',
                    content: 'Technicians process shipments via Receiving Slips (proc_rec_slip). When lines are received, ServiceNow automatically generates the alm_hardware records.'
                },
                {
                    heading: '3. Financial Cost Stamping',
                    content: 'The contracted unit price from proc_po_item is stamped directly into alm_hardware.cost, providing the permanent basis for asset depreciation schedules.'
                }
            ]
        }
    },

    // -----------------------------------------------
    // TAB 8: Disposal Orders (sn_hamp_disposal_order)
    // -----------------------------------------------
    'sn_hamp_disposal_order': {
        label: 'Disposal Orders (HADO)',
        table: 'sn_hamp_disposal_order',
        icon: '',
        description: 'End-of-life hardware disposition workflow enforcing 6 mandatory stages from Verify to Certificate of Destruction.',
        fields: [
            { name: 'number', label: 'Disposal Order Number', type: 'string' },
            { name: 'vendor', label: 'Certified ITAD Vendor', type: 'reference', refTable: 'core_company' },
            { name: 'stockroom', label: 'Staging Stockroom', type: 'reference', refTable: 'alm_stockroom' },
            { name: 'stage', label: 'Order Stage', type: 'choice', choices: [
                { value: 'verify', label: '1. Verify Assets' },
                { value: 'schedule', label: '2. Schedule Pickup' },
                { value: 'transit', label: '3. Asset Departure' },
                { value: 'confirmation', label: '4. Vendor Confirmation' },
                { value: 'documentation', label: '5. Disposal Documentation' },
                { value: 'completed', label: '6. Completed' }
            ]},
            { name: 'scheduled_date', label: 'Scheduled Pickup Date', type: 'date' },
            { name: 'disposal_type', label: 'Disposition Strategy', type: 'choice', choices: [
                { value: 'recycle', label: 'Certified E-Waste Recycling (Shred)' },
                { value: 'resale', label: 'Secondary Market Resale' },
                { value: 'donation', label: 'Charitable Educational Donation' }
            ]},
            { name: 'cod_attached', label: 'Certificate of Destruction (CoD)', type: 'choice', choices: [
                { value: 'verified', label: 'Attached & Verified' },
                { value: 'pending', label: 'Pending Vendor Documentation' }
            ]},
            { name: 'total_assets', label: 'Total Units in Batch', type: 'string' },
            { name: 'short_description', label: 'Scope & Audit Description', type: 'string' }
        ],
        records: [
            {
                number: 'HADO000104',
                vendor: 'Iron Mountain ITAD Services',
                stockroom: 'London Tech Depot',
                stage: 'completed',
                scheduled_date: '2026-09-15',
                disposal_type: 'recycle',
                cod_attached: 'verified',
                total_assets: '34 Units (Laptops & Storage Drives)',
                short_description: 'Q3 EMEA Decommissioned Laptops - NIST 800-88 Certified Shredding'
            },
            {
                number: 'HADO000105',
                vendor: 'Sims Lifecycle Services (SLS)',
                stockroom: 'Global Distribution Hub Chicago',
                stage: 'confirmation',
                scheduled_date: '2026-10-14',
                disposal_type: 'resale',
                cod_attached: 'pending',
                total_assets: '65 Units (Aged Rack Servers)',
                short_description: 'Data Center Compute Refresh Batch - Off-Lease Resale Valuation'
            },
            {
                number: 'HADO000106',
                vendor: 'Apto Solutions E-Waste',
                stockroom: 'Tokyo Regional IT Closet',
                stage: 'schedule',
                scheduled_date: '2026-10-28',
                disposal_type: 'recycle',
                cod_attached: 'pending',
                total_assets: '18 Units (Obsolete Access Points)',
                short_description: 'Roppongi Office Network Decommissioning - Basel Convention Recycling'
            }
        ],
        processExplanation: {
            title: 'Hardware Asset Disposal Order (HADO) Governance',
            steps: [
                {
                    heading: '1. The 6-Stage Mandatory Sequence',
                    content: 'Each stage in the HADO workflow auto-generates a task that must be closed complete. Skipping stages is locked out by system business rules.'
                },
                {
                    heading: '2. Cancellation Lockout Past Departure',
                    content: 'Once the Asset Departure task is closed and assets are loaded onto the vendor truck, order cancellation is permanently locked out to enforce chain of custody compliance.'
                },
                {
                    heading: '3. Certificate of Destruction & Write-Off',
                    content: 'Closing the Disposal Documentation task requires a certified CoD document attachment. The system automatically shifts all child assets into state Retired / Disposed and writes off Net Book Value.'
                }
            ]
        }
    }
};

// Export for browser environment
if (typeof window !== 'undefined') {
    window.HamSimulatorData = HamSimulatorData;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HamSimulatorData;
}
