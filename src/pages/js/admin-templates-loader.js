
// admin-templates-loader.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("Templates loader script started");
    
    // Function to load template content
    async function loadTemplate(templatePath, containerId) {
        try {
            console.log(`Loading template from ${templatePath} into ${containerId}`);
            const response = await fetch(templatePath);
            if (!response.ok) {
                throw new Error(`Failed to load template: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = html;
                console.log(`Successfully loaded template into ${containerId}`);
                return true;
            } else {
                console.error(`Container not found: ${containerId}`);
                return false;
            }
        } catch (error) {
            console.error(`Error loading template: ${error.message}`);
            return false;
        }
    }
    
    // Load sidebar template
    loadTemplate('../pages/templates/sidebar-template.html', 'sidebar-content')
        .then(success => {
            if (success) {
                // Dispatch a custom event to notify that sidebar is loaded
                const event = new CustomEvent('sidebarLoaded');
                document.dispatchEvent(event);
                console.log("Sidebar template loaded and event dispatched");
            }
        });
    
    // Load other templates as needed
    loadTemplate('../pages/templates/bookings-template.html', 'bookingsSection');
    loadTemplate('../pages/templates/passcodes-template.html', 'passcodesSection');
    loadTemplate('../pages/templates/database-template.html', 'databaseSection');
    
    // Additional listener for the custom event
    document.addEventListener('sidebarLoaded', function() {
        console.log("sidebarLoaded event received");
        
        // This event will be used to initialize sidebar functionality
        // after the sidebar template has been loaded
        const initEvent = new CustomEvent('initializeSidebar');
        document.dispatchEvent(initEvent);
    });
});
