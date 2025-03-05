
document.addEventListener('DOMContentLoaded', function() {
  // Initialize database section
  initDatabaseSection();
  
  function initDatabaseSection() {
    // Get template content
    const template = document.getElementById('databaseTemplate');
    const databaseSection = document.getElementById('databaseSection');
    
    // Clone template content and append to section
    const content = template.content.cloneNode(true);
    databaseSection.appendChild(content);
    
    // Database tables
    const tables = [
      {
        name: "Users Table",
        columns: [
          { name: "id", type: "INT", description: "Primary key, auto-increment" },
          { name: "username", type: "VARCHAR(50)", description: "Unique username for login" },
          { name: "password", type: "VARCHAR(255)", description: "Hashed password" },
          { name: "is_admin", type: "TINYINT(1)", description: "Flag for admin privilege" },
          { name: "created_at", type: "TIMESTAMP", description: "Account creation timestamp" },
        ]
      },
      {
        name: "Rooms Table",
        columns: [
          { name: "id", type: "VARCHAR(20)", description: "Primary key (e.g., \"room1\")" },
          { name: "name", type: "VARCHAR(100)", description: "Display name for the room" },
          { name: "fixed_passcode", type: "VARCHAR(10)", description: "Optional fixed passcode for this room" },
          { name: "reset_hours", type: "INT", description: "Hours after checkout to reset passcode" },
        ]
      },
      {
        name: "Bookings Table",
        columns: [
          { name: "id", type: "INT", description: "Primary key, auto-increment" },
          { name: "room_id", type: "VARCHAR(20)", description: "Foreign key to rooms.id" },
          { name: "guest_name", type: "VARCHAR(100)", description: "Name of the guest" },
          { name: "email", type: "VARCHAR(100)", description: "Email address of the guest" },
          { name: "phone", type: "VARCHAR(20)", description: "Phone number of the guest" },
          { name: "arrival_datetime", type: "DATETIME", description: "Check-in date and time" },
          { name: "departure_datetime", type: "DATETIME", description: "Check-out date and time" },
          { name: "access_code", type: "VARCHAR(10)", description: "Room access code for this booking" },
          { name: "created_at", type: "TIMESTAMP", description: "Booking creation timestamp" },
        ]
      },
      {
        name: "Notification Settings Table",
        columns: [
          { name: "id", type: "INT", description: "Primary key, auto-increment" },
          { name: "email_enabled", type: "TINYINT(1)", description: "Whether email notifications are enabled" },
          { name: "sms_enabled", type: "TINYINT(1)", description: "Whether SMS notifications are enabled" },
          { name: "email_template", type: "TEXT", description: "HTML template for email notifications" },
          { name: "sms_template", type: "VARCHAR(255)", description: "Template for SMS notifications" },
          { name: "smtp_host", type: "VARCHAR(100)", description: "SMTP server host" },
          { name: "smtp_port", type: "INT", description: "SMTP server port" },
          { name: "smtp_username", type: "VARCHAR(100)", description: "SMTP username" },
          { name: "smtp_password", type: "VARCHAR(100)", description: "SMTP password (stored encrypted)" },
          { name: "sms_api_key", type: "VARCHAR(100)", description: "API key for SMS service" },
        ]
      }
    ];
    
    // Add tables to the section
    const tablesContainer = databaseSection.querySelector('.space-y-8');
    
    tables.forEach(table => {
      const tableTemplate = document.getElementById('databaseTableTemplate');
      const tableElement = tableTemplate.content.cloneNode(true);
      
      // Update table name
      tableElement.querySelector('h3').textContent = table.name;
      
      // Add table columns
      const tableBody = tableElement.querySelector('.table-body');
      
      table.columns.forEach(column => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="px-4 py-4 whitespace-nowrap font-medium">${column.name}</td>
          <td class="px-4 py-4 whitespace-nowrap">${column.type}</td>
          <td class="px-4 py-4">${column.description}</td>
        `;
        tableBody.appendChild(row);
      });
      
      tablesContainer.appendChild(tableElement);
    });
  }
});
