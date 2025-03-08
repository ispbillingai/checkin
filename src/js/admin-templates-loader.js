
// admin-templates-loader.js - Loads the template content into the admin dashboard

document.addEventListener('DOMContentLoaded', function() {
    console.log("Templates loader initialized");
    
    // Load sidebar template
    fetch('/src/pages/templates/sidebar-template.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load sidebar template: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById('sidebar-content').innerHTML = data;
            console.log("Sidebar template loaded");
        })
        .catch(error => {
            console.error("Error loading sidebar template:", error);
            document.getElementById('sidebar-content').innerHTML = `
                <div class="p-4">
                    <p class="text-red-500">Error loading sidebar: ${error.message}</p>
                </div>
            `;
        });
    
    // Load bookings template
    fetch('/src/pages/templates/bookings-template.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('bookingsSection').innerHTML = data;
            console.log("Bookings template loaded");
        })
        .catch(error => {
            console.error("Error loading bookings template:", error);
            document.getElementById('bookingsSection').innerHTML = `
                <div class="p-4">
                    <p class="text-red-500">Error loading bookings section: ${error.message}</p>
                </div>
            `;
        });
    
    // Load rooms template
    fetch('/src/pages/templates/rooms-template.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('roomsSection').innerHTML = data;
            console.log("Rooms template loaded");
        })
        .catch(error => {
            console.error("Error loading rooms template:", error);
        });
    
    // Load passcodes template
    fetch('/src/pages/templates/passcodes-template.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('passcodesSection').innerHTML = data;
            console.log("Passcodes template loaded");
        })
        .catch(error => {
            console.error("Error loading passcodes template:", error);
        });
    
    // Load database template
    fetch('/src/pages/templates/database-template.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('databaseSection').innerHTML = data;
            console.log("Database template loaded");
        })
        .catch(error => {
            console.error("Error loading database template:", error);
        });
});
