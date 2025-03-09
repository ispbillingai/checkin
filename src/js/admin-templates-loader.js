
/**
 * Admin Templates Loader
 * Loads HTML templates for the admin dashboard components
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log("Admin templates loader initialized");
  
  // Load sidebar template
  fetch('/src/pages/templates/sidebar-template.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('sidebar-content').innerHTML = html;
      console.log("Sidebar template loaded");
      
      // Initialize sidebar after loading
      if (typeof initializeSidebar === 'function') {
        initializeSidebar();
      } else {
        console.log("Waiting for sidebar initialization function");
        setTimeout(checkAndInitialize, 100);
      }
    })
    .catch(error => console.error("Error loading sidebar template:", error));
    
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
});

// Helper function to check if sidebar is initialized
function checkAndInitialize() {
  if (typeof initializeSidebar === 'function') {
    console.log("Initializing sidebar");
    initializeSidebar();
  } else {
    console.log("Still waiting for sidebar initialization");
    setTimeout(checkAndInitialize, 100);
  }
}
