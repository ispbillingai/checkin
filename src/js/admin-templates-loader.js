
document.addEventListener('DOMContentLoaded', function() {
  console.log("Admin templates loader initialized");
  
  // Load sidebar template
  fetch('/src/pages/templates/sidebar-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('sidebar-content').innerHTML = html;
      console.log("Sidebar template loaded");
    })
    .catch(error => console.error("Error loading sidebar template:", error));
  
  // Load admin header template
  fetch('/src/pages/templates/admin-header-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('admin-header').innerHTML = html;
      console.log("Admin header template loaded");
    })
    .catch(error => console.error("Error loading admin header template:", error));
  
  // Load toast template
  fetch('/src/pages/templates/toast-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('toast-container').innerHTML = html;
      console.log("Toast template loaded");
    })
    .catch(error => console.error("Error loading toast template:", error));
  
  // Load bookings template
  fetch('/src/pages/templates/bookings-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('bookingsSection').innerHTML = html;
      console.log("Bookings template loaded");
    })
    .catch(error => console.error("Error loading bookings template:", error));
  
  // Load rooms template
  fetch('/src/pages/templates/rooms-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('roomsSection').innerHTML = html;
      console.log("Rooms template loaded");
    })
    .catch(error => console.error("Error loading rooms template:", error));
  
  // Load passcodes template
  fetch('/src/pages/templates/passcodes-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('passcodesSection').innerHTML = html;
      console.log("Passcodes template loaded");
    })
    .catch(error => console.error("Error loading passcodes template:", error));
  
  // Load database template
  fetch('/src/pages/templates/database-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('databaseSection').innerHTML = html;
      console.log("Database template loaded");
    })
    .catch(error => console.error("Error loading database template:", error));
  
  // Load users template
  fetch('/src/pages/templates/users-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('usersSection').innerHTML = html;
      console.log("Users template loaded");
    })
    .catch(error => console.error("Error loading users template:", error));
  
  // Load settings template
  fetch('/src/pages/templates/settings-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('settingsSection').innerHTML = html;
      console.log("Settings template loaded");
    })
    .catch(error => console.error("Error loading settings template:", error));
  
  // Load email templates template
  fetch('/src/pages/templates/email-templates-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('emailTemplatesSection').innerHTML = html;
      console.log("Email templates template loaded");
    })
    .catch(error => console.error("Error loading email templates template:", error));
  
  // Load SMS templates template
  fetch('/src/pages/templates/sms-templates-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('smsTemplatesSection').innerHTML = html;
      console.log("SMS templates template loaded");
    })
    .catch(error => console.error("Error loading SMS templates template:", error));
  
  console.log("All template fetch operations initiated");
});
