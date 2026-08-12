const HamSimulatorData = {
    // -----------------------------------------------
    // TAB 0: Model Categories (cmdb_model_category)
    // -----------------------------------------------
    'cmdb_model_category': {
        label: 'Model Categories',
        table: 'cmdb_model_category',
        icon: '🏷️',
        description: 'Defines how assets and CIs are classified and linked.',
        fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'asset_class', label: 'Asset Class', type: 'string' },
            { name: 'ci_class', label: 'CI Class', type: 'string' },
            { name: 'enforce_verification', label: 'Enforce CI Verification', type: 'choice', choices: [
                { value: 'true', label: 'True', color: 'blue' },
                { value: 'false', label: 'False', color: 'gray' }
            ]}
        ],
        records: [
            { name: 'Computer', asset_class: 'alm_hardware', ci_class: 'cmdb_ci_computer', enforce_verification: 'true' },
            { name: 'Server', asset_class: 'alm_hardware', ci_class: 'cmdb_ci_server', enforce_verification: 'true' },
            { name: 'Keyboard', asset_class: 'alm_consumable', ci_class: '', enforce_verification: 'false' }
        ],
        processExplanation: {
            title: 'The Bridge',
            steps: [
                { heading: 'Classification', content: 'Model Categories dictate whether a newly procured item should become a tracked Asset, a Configuration Item, or both.' }
            ]
        }
    },
    // -----------------------------------------------
    // TAB 0.5: Hardware Models (cmdb_hardware_product_model)
    // -----------------------------------------------
    'cmdb_hardware_product_model': {
        label: 'Hardware Models',
        table: 'cmdb_hardware_product_model',
        icon: '📋',
        description: 'Specific types of hardware manufactured by a vendor.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'manufacturer', label: 'Manufacturer', type: 'reference', refTable: 'core_company' },
            { name: 'model_category', label: 'Model Category', type: 'reference', refTable: 'cmdb_model_category' },
            { name: 'cost', label: 'Cost', type: 'string' },
            { name: 'status', label: 'Status', type: 'choice', choices: [
                { value: 'in_production', label: 'In Production', color: 'green' },
                { value: 'retired', label: 'Retired', color: 'red' }
            ]}
        ],
        records: [
            { display_name: 'Apple MacBook Pro 14"', manufacturer: 'Apple Inc.', model_category: 'Computer', cost: '$1,999.00', status: 'in_production' },
            { display_name: 'Dell XPS 15', manufacturer: 'Dell Technologies', model_category: 'Computer', cost: '$1,499.00', status: 'in_production' },
            { display_name: 'Logitech MX Master 3', manufacturer: 'Logitech', model_category: 'Keyboard', cost: '$99.00', status: 'in_production' }
        ],
        processExplanation: {
            title: 'Standardization',
            steps: [
                { heading: 'Normalization', content: 'Hardware Models ensure that you don\'t have 5 different spellings of a MacBook Pro in your database. All assets link back to a single normalized model record.' }
            ]
        }
    },
    // -----------------------------------------------
    // TAB 1.5: Consumables (alm_consumable)
    // -----------------------------------------------
    'alm_consumable': {
        label: 'Consumables',
        table: 'alm_consumable',
        icon: '🖱️',
        description: 'Assets tracked by quantity instead of individual serial numbers.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'model', label: 'Model', type: 'reference', refTable: 'cmdb_hardware_product_model' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'in_stock', label: 'In Stock', color: 'green' },
                { value: 'consumed', label: 'Consumed', color: 'gray' }
            ]},
            { name: 'quantity', label: 'Quantity', type: 'string' },
            { name: 'stockroom', label: 'Stockroom', type: 'reference', refTable: 'alm_stockroom' }
        ],
        records: [
            { display_name: 'Logitech MX Master 3 - In Stock', model: 'Logitech MX Master 3', state: 'in_stock', quantity: '45', stockroom: 'San Diego IT Warehouse' },
            { display_name: 'USB-C Cables - In Stock', model: 'Generic USB-C Cable', state: 'in_stock', quantity: '200', stockroom: 'London HQ Storage' },
            { display_name: 'Logitech MX Master 3 - Consumed', model: 'Logitech MX Master 3', state: 'consumed', quantity: '5', stockroom: '' }
        ],
        processExplanation: {
            title: 'Bulk Tracking',
            steps: [
                { heading: 'Quantity Management', content: 'Unlike Hardware Assets which have a 1-to-1 relationship with a physical device, Consumables are tracked in bulk. When you give a mouse to a user, the "In Stock" quantity decreases, and a "Consumed" record is generated for that user.' }
            ]
        }
    },
    // -----------------------------------------------
    // TAB 1: Hardware Assets (alm_hardware)
    // -----------------------------------------------
    'alm_hardware': {
        label: 'Hardware Assets',
        table: 'alm_hardware',
        icon: '💻',
        description: 'The primary financial and logical record for a physical device.',
        fields: [
            { name: 'display_name', label: 'Display Name', type: 'string' },
            { name: 'model', label: 'Model', type: 'reference', refTable: 'cmdb_hardware_product_model' },
            { name: 'ci', label: 'Configuration Item', type: 'reference', refTable: 'cmdb_ci_computer' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'on_order', label: 'On Order', color: 'blue' },
                { value: 'in_transit', label: 'In Transit', color: 'orange' },
                { value: 'in_stock', label: 'In Stock', color: 'green' },
                { value: 'in_use', label: 'In Use', color: 'purple' },
                { value: 'retired', label: 'Retired', color: 'gray' }
            ]},
            { name: 'substatus', label: 'Substate', type: 'choice', choices: [
                { value: 'pending_install', label: 'Pending Install' },
                { value: 'available', label: 'Available' },
                { value: 'reserved', label: 'Reserved' },
                { value: 'disposed', label: 'Disposed' }
            ]},
            { name: 'stockroom', label: 'Stockroom', type: 'reference', refTable: 'alm_stockroom' },
            { name: 'assigned_to', label: 'Assigned to', type: 'reference', refTable: 'sys_user' },
            { name: 'po_number', label: 'Purchase Order', type: 'reference', refTable: 'proc_po' },
            { name: 'cost', label: 'Cost', type: 'string' }
        ],
        records: [
            {
                display_name: 'Apple MacBook Pro 14" - AST0001001',
                model: 'Apple MacBook Pro 14"',
                ci: 'Mac-JDOE-01',
                state: 'in_use',
                substatus: '',
                stockroom: '',
                assigned_to: 'Jane Doe',
                po_number: 'PO0001001',
                cost: '$1,999.00'
            },
            {
                display_name: 'Dell XPS 15 - AST0001002',
                model: 'Dell XPS 15',
                ci: '',
                state: 'in_stock',
                substatus: 'available',
                stockroom: 'London HQ Storage',
                assigned_to: '',
                po_number: 'PO0001001',
                cost: '$1,499.00'
            },
            {
                display_name: 'Cisco Meraki MX64 - AST0001003',
                model: 'Cisco Meraki MX64',
                ci: '',
                state: 'in_transit',
                substatus: '',
                stockroom: 'San Diego IT Warehouse',
                assigned_to: '',
                po_number: 'PO0001003',
                cost: '$599.00'
            },
            {
                display_name: 'Lenovo ThinkPad T14 - AST0001004',
                model: 'Lenovo ThinkPad T14',
                ci: 'LNV-JS-04',
                state: 'retired',
                substatus: 'disposed',
                stockroom: '',
                assigned_to: '',
                po_number: 'PO0000950',
                cost: '$1,299.00'
            }
        ],
        processExplanation: {
            title: 'The Financial Record',
            steps: [
                {
                    heading: '1. Creation',
                    content: 'Hardware Assets are typically created automatically when a Receiving Slip is processed against a Purchase Order, or via discovery integrations if no procurement data exists.'
                },
                {
                    heading: '2. Asset vs CI',
                    content: 'The Asset record holds the financial (Cost, Purchase Date) and logistical (Stockroom, Assigned To) data. It links to a CI (Configuration Item), which holds the operational and technical data.'
                }
            ]
        }
    },
    // -----------------------------------------------
    // TAB 2: Configuration Items (cmdb_ci_computer)
    // -----------------------------------------------
    'cmdb_ci_computer': {
        label: 'Configuration Items',
        table: 'cmdb_ci_computer',
        icon: '🖥️',
        description: 'The operational and technical record stored in the CMDB.',
        fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'asset', label: 'Asset', type: 'reference', refTable: 'alm_hardware' },
            { name: 'model_id', label: 'Model', type: 'reference', refTable: 'cmdb_hardware_product_model' },
            { name: 'install_status', label: 'Install Status', type: 'choice', choices: [
                { value: '1', label: 'Installed', color: 'green' },
                { value: '2', label: 'On Order', color: 'blue' },
                { value: '6', label: 'In Stock', color: 'purple' },
                { value: '7', label: 'Retired', color: 'gray' }
            ]},
            { name: 'os', label: 'Operating System', type: 'string' },
            { name: 'ram', label: 'RAM (MB)', type: 'string' }
        ],
        records: [
            {
                name: 'Mac-JDOE-01',
                asset: 'AST0001001',
                model_id: 'Apple MacBook Pro 14"',
                install_status: '1', // Installed
                os: 'macOS 14 Sonoma',
                ram: '16384'
            },
            {
                name: 'LNV-JS-04',
                asset: 'AST0001004',
                model_id: 'Lenovo ThinkPad T14',
                install_status: '7', // Retired
                os: 'Windows 10 Pro',
                ram: '8192'
            }
        ],
        processExplanation: {
            title: 'The Operational Record',
            steps: [
                {
                    heading: '1. Synchronization',
                    content: 'When an Asset\'s State changes (e.g., from In Stock to In Use), a Business Rule automatically updates the corresponding CI\'s Install Status (e.g., from In Stock to Installed).'
                },
                {
                    heading: '2. Discovery',
                    content: 'ServiceNow Discovery populates the technical fields on the CI, such as OS, RAM, and Disk Space, which are not tracked on the Asset record.'
                }
            ]
        }
    },
    // -----------------------------------------------
    // TAB 3: Stockrooms (alm_stockroom)
    // -----------------------------------------------
    'alm_stockroom': {
        label: 'Stockrooms',
        table: 'alm_stockroom',
        icon: '🏭',
        description: 'Physical or logical locations where inventory is managed.',
        fields: [
            { name: 'name', label: 'Name', type: 'string' },
            { name: 'type', label: 'Type', type: 'choice', choices: [
                { value: 'warehouse', label: 'Warehouse', color: 'blue' },
                { value: 'local_office', label: 'Local Office', color: 'green' },
                { value: 'repair_center', label: 'Repair Center', color: 'red' }
            ]},
            { name: 'location', label: 'Location', type: 'string' },
            { name: 'manager', label: 'Manager', type: 'reference', refTable: 'sys_user' }
        ],
        records: [
            {
                name: 'San Diego IT Warehouse',
                type: 'warehouse',
                location: 'San Diego, CA',
                manager: 'John Smith'
            },
            {
                name: 'London HQ Storage',
                type: 'local_office',
                location: 'London, UK',
                manager: 'Sarah Jones'
            },
            {
                name: 'Texas Repair Depot',
                type: 'repair_center',
                location: 'Austin, TX',
                manager: 'Mike Davis'
            }
        ],
        processExplanation: {
            title: 'Inventory Management',
            steps: [
                {
                    heading: '1. Stock Rules',
                    content: 'You can define Stock Rules for a Stockroom. If the count of a specific model drops below a threshold, the system can automatically reorder from a vendor or transfer from another stockroom.'
                }
            ]
        }
    },
    // -----------------------------------------------
    // TAB 4: Purchase Orders (proc_po)
    // -----------------------------------------------
    'proc_po': {
        label: 'Purchase Orders',
        table: 'proc_po',
        icon: '🛒',
        description: 'Formal procurement requests sent to vendors to buy hardware.',
        fields: [
            { name: 'number', label: 'PO Number', type: 'string' },
            { name: 'vendor', label: 'Vendor', type: 'reference', refTable: 'core_company' },
            { name: 'status', label: 'Status', type: 'choice', choices: [
                { value: 'requested', label: 'Requested', color: 'gray' },
                { value: 'ordered', label: 'Ordered', color: 'blue' },
                { value: 'pending_delivery', label: 'Pending Delivery', color: 'orange' },
                { value: 'received', label: 'Received', color: 'green' }
            ]},
            { name: 'total_cost', label: 'Total Cost', type: 'string' },
            { name: 'ship_to', label: 'Ship To', type: 'reference', refTable: 'alm_stockroom' }
        ],
        records: [
            {
                number: 'PO0001001',
                vendor: 'Apple Inc.',
                status: 'received',
                total_cost: '$49,975.00',
                ship_to: 'San Diego IT Warehouse'
            },
            {
                number: 'PO0001003',
                vendor: 'Cisco Systems',
                status: 'ordered',
                total_cost: '$5,990.00',
                ship_to: 'London HQ Storage'
            },
            {
                number: 'PO0001004',
                vendor: 'Dell Technologies',
                status: 'pending_delivery',
                total_cost: '$14,990.00',
                ship_to: 'San Diego IT Warehouse'
            }
        ],
        processExplanation: {
            title: 'Procurement to Asset',
            steps: [
                {
                    heading: '1. Ordering',
                    content: 'Purchase Orders group multiple PO Line Items (e.g., 25 Laptops, 25 Docks). Once ordered, they move to Pending Delivery.'
                },
                {
                    heading: '2. Receiving Slips',
                    content: 'When the shipment arrives, a Receiving Slip is created. Processing the slip automatically generates the alm_hardware Asset records in the target Stockroom.'
                }
            ]
        }
    },
    // -----------------------------------------------
    // TAB 5: Contracts (ast_contract)
    // -----------------------------------------------
    'ast_contract': {
        label: 'Contracts',
        table: 'ast_contract',
        icon: '📜',
        description: 'Legal warranties, leases, and maintenance agreements linked to assets.',
        fields: [
            { name: 'number', label: 'Contract Number', type: 'string' },
            { name: 'short_description', label: 'Description', type: 'string' },
            { name: 'contract_model', label: 'Contract Model', type: 'choice', choices: [
                { value: 'warranty', label: 'Warranty', color: 'green' },
                { value: 'maintenance', label: 'Maintenance', color: 'blue' },
                { value: 'lease', label: 'Lease', color: 'purple' }
            ]},
            { name: 'vendor', label: 'Vendor', type: 'reference', refTable: 'core_company' },
            { name: 'ends', label: 'End Date', type: 'string' },
            { name: 'state', label: 'State', type: 'choice', choices: [
                { value: 'active', label: 'Active', color: 'green' },
                { value: 'expired', label: 'Expired', color: 'red' }
            ]}
        ],
        records: [
            {
                number: 'CON000841',
                short_description: 'AppleCare+ for Enterprise (3 Years)',
                contract_model: 'warranty',
                vendor: 'Apple Inc.',
                ends: '2029-08-01',
                state: 'active'
            },
            {
                number: 'CON000842',
                short_description: 'Dell ProSupport Plus (5 Years)',
                contract_model: 'maintenance',
                vendor: 'Dell Technologies',
                ends: '2031-08-01',
                state: 'active'
            },
            {
                number: 'CON000800',
                short_description: 'Lenovo Standard Depot Warranty',
                contract_model: 'warranty',
                vendor: 'Lenovo',
                ends: '2024-01-01',
                state: 'expired'
            }
        ],
        processExplanation: {
            title: 'Contract Management',
            steps: [
                {
                    heading: '1. Coverage',
                    content: 'Assets are directly linked to Contracts via the Assets Covered related list. This ensures you know exactly which devices have active warranties before attempting a repair or replacement.'
                }
            ]
        }
    }
};
