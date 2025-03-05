
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if database section exists
  if (!document.getElementById('databaseSection')) return;
  
  // Clone the template content to the database section
  const databaseTemplate = document.getElementById('databaseTemplate');
  const databaseSection = document.getElementById('databaseSection');
  if (databaseTemplate && databaseSection) {
    databaseSection.appendChild(databaseTemplate.content.cloneNode(true));
  }
  
  // Load database schema
  loadDatabaseSchema();
  
  // Functions
  function loadDatabaseSchema() {
    const dbTablesContainer = document.getElementById('dbTablesContainer');
    if (!dbTablesContainer) return;
    
    // Simulate API call to get database schema
    setTimeout(() => {
      const tables = [
        {
          name: 'bookings',
          columns: [
            { name: 'id', type: 'INT', description: 'Primary Key, Auto Increment' },
            { name: 'room_id', type: 'VARCHAR(50)', description: 'Foreign Key to rooms.id' },
            { name: 'guest_name', type: 'VARCHAR(255)', description: 'Full name of the guest' },
            { name: 'email', type: 'VARCHAR(255)', description: 'Email address of the guest' },
            { name: 'phone', type: 'VARCHAR(50)', description: 'Phone number of the guest' },
            { name: 'access_code', type: 'VARCHAR(50)', description: 'Room access code for the booking' },
            { name: 'check_in', type: 'DATETIME', description: 'Check-in date and time' },
            { name: 'check_out', type: 'DATETIME', description: 'Check-out date and time' },
            { name: 'created_at', type: 'TIMESTAMP', description: 'Time when booking was created' }
          ]
        },
        {
          name: 'rooms',
          columns: [
            { name: 'id', type: 'VARCHAR(50)', description: 'Primary Key' },
            { name: 'name', type: 'VARCHAR(255)', description: 'Room name or number' },
            { name: 'description', type: 'TEXT', description: 'Room description' },
            { name: 'status', type: 'ENUM', description: "Room status: 'active', 'maintenance', 'inactive'" },
            { name: 'custom_passcode', type: 'VARCHAR(50)', description: 'Optional fixed passcode for the room' },
            { name: 'reset_hours', type: 'INT', description: 'Hours after checkout before passcode is reset' }
          ]
        },
        {
          name: 'settings',
          columns: [
            { name: 'id', type: 'INT', description: 'Primary Key, Auto Increment' },
            { name: 'setting_key', type: 'VARCHAR(255)', description: 'Setting identifier' },
            { name: 'setting_value', type: 'TEXT', description: 'Setting value' },
            { name: 'updated_at', type: 'TIMESTAMP', description: 'Last update time' }
          ]
        },
        {
          name: 'notification_templates',
          columns: [
            { name: 'id', type: 'INT', description: 'Primary Key, Auto Increment' },
            { name: 'type', type: 'ENUM', description: "Template type: 'email', 'sms'" },
            { name: 'subject', type: 'VARCHAR(255)', description: 'Subject line for email templates' },
            { name: 'content', type: 'TEXT', description: 'Template content with variables' },
            { name: 'updated_at', type: 'TIMESTAMP', description: 'Last update time' }
          ]
        },
        {
          name: 'users',
          columns: [
            { name: 'id', type: 'INT', description: 'Primary Key, Auto Increment' },
            { name: 'username', type: 'VARCHAR(255)', description: 'Username for login' },
            { name: 'password', type: 'VARCHAR(255)', description: 'Hashed password' },
            { name: 'role', type: 'ENUM', description: "User role: 'admin', 'staff'" },
            { name: 'created_at', type: 'TIMESTAMP', description: 'Account creation time' }
          ]
        }
      ];
      
      // Add tables to container
      tables.forEach(table => {
        addTableToContainer(dbTablesContainer, table);
      });
    }, 500);
  }
  
  function addTableToContainer(container, table) {
    const template = document.getElementById('databaseTableTemplate');
    if (!template) return;
    
    const tableElement = template.content.cloneNode(true);
    
    // Set table name
    tableElement.querySelector('.table-name').textContent = `Table: ${table.name}`;
    
    // Add columns
    const tableBody = tableElement.querySelector('.table-body');
    if (tableBody) {
      table.columns.forEach(column => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">
            ${column.name}
          </td>
          <td class="px-4 py-3 whitespace-nowrap font-mono text-sm">
            ${column.type}
          </td>
          <td class="px-4 py-3 text-sm">
            ${column.description}
          </td>
        `;
        
        tableBody.appendChild(row);
      });
    }
    
    container.appendChild(tableElement);
  }
});
