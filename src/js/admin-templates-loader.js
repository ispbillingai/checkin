
// Template loader script for admin dashboard
document.addEventListener('DOMContentLoaded', function() {
  console.log("Template loader script running");
  
  // Load sidebar template
  fetch('/src/pages/templates/sidebar-template.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('sidebar-content').innerHTML = html;
      console.log("Sidebar template loaded successfully");
      
      // Dispatch an event to notify that the sidebar is loaded
      const event = new CustomEvent('sidebarLoaded');
      document.dispatchEvent(event);
    })
    .catch(error => {
      console.error("Error loading sidebar template:", error);
      document.getElementById('sidebar-content').innerHTML = '<div class="p-4 text-red-500">Error loading sidebar. Please refresh or contact support.</div>';
    });
  
  // Load bookings template
  fetch('/src/pages/templates/bookings-template.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('bookingsSection').innerHTML = html;
      console.log("Bookings template loaded successfully");
    })
    .catch(error => {
      console.error("Error loading bookings template:", error);
      document.getElementById('bookingsSection').innerHTML = '<div class="p-4 text-red-500">Error loading bookings. Please refresh or contact support.</div>';
    });
  
  // Load rooms template
  fetch('/src/pages/templates/rooms-template.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('roomsSection').innerHTML = html;
      console.log("Rooms template loaded successfully");
    })
    .catch(error => {
      console.error("Error loading rooms template:", error);
      document.getElementById('roomsSection').innerHTML = '<div class="p-4 text-red-500">Error loading rooms. Please refresh or contact support.</div>';
    });
  
  // Load passcodes template
  fetch('/src/pages/templates/passcodes-template.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('passcodesSection').innerHTML = html;
      console.log("Passcodes template loaded successfully");
    })
    .catch(error => {
      console.error("Error loading passcodes template:", error);
      document.getElementById('passcodesSection').innerHTML = '<div class="p-4 text-red-500">Error loading passcodes. Please refresh or contact support.</div>';
    });
  
  // Load database template
  fetch('/src/pages/templates/database-template.html')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      document.getElementById('databaseSection').innerHTML = html;
      console.log("Database template loaded successfully");
    })
    .catch(error => {
      console.error("Error loading database template:", error);
      document.getElementById('databaseSection').innerHTML = '<div class="p-4 text-red-500">Error loading database schema. Please refresh or contact support.</div>';
    });
});
