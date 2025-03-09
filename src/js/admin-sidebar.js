
/**
 * Admin Sidebar
 * Handles sidebar functionality for the admin dashboard
 */
(function() {
    console.log("Admin sidebar initialized");
    
    // Initialize sidebar functionality
    function initSidebar() {
        console.log("Setting up admin sidebar interactions");
        
        try {
            // Toggle sidebar visibility
            const sidebarToggle = document.getElementById('sidebarToggle');
            const sidebar = document.getElementById('sidebar');
            
            if (sidebarToggle && sidebar) {
                sidebarToggle.addEventListener('click', function() {
                    console.log("Toggling sidebar visibility");
                    sidebar.classList.toggle('w-0');
                    sidebar.classList.toggle('w-64');
                });
            } else {
                console.error("Sidebar elements not found");
                if (window.logClientError) {
                    window.logClientError("Sidebar elements not found", "error");
                }
            }
            
            // Set up section navigation
            const sectionButtons = document.querySelectorAll('[data-section]');
            const sections = document.querySelectorAll('.section-content');
            
            sectionButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const sectionName = this.getAttribute('data-section');
                    console.log(`Navigating to section: ${sectionName}`);
                    
                    // Update active button styling
                    sectionButtons.forEach(btn => {
                        btn.classList.remove('bg-blue-100', 'text-blue-600');
                        btn.classList.add('hover:bg-gray-100');
                    });
                    this.classList.add('bg-blue-100', 'text-blue-600');
                    this.classList.remove('hover:bg-gray-100');
                    
                    // Show the selected section, hide others
                    sections.forEach(section => {
                        section.classList.add('hidden');
                    });
                    
                    const targetSection = document.getElementById(`${sectionName}Section`);
                    if (targetSection) {
                        targetSection.classList.remove('hidden');
                    } else {
                        console.error(`Section not found: ${sectionName}Section`);
                        if (window.logClientError) {
                            window.logClientError(`Section not found: ${sectionName}Section`, "error");
                        }
                    }
                });
            });
            
            console.log("Admin sidebar setup complete");
        } catch (error) {
            console.error("Error initializing sidebar:", error);
            if (window.logClientError) {
                window.logClientError(`Error initializing sidebar: ${error.message}`, "error", {
                    stack: error.stack
                });
            }
        }
    }
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM loaded, initializing admin sidebar");
        setTimeout(initSidebar, 200); // Small delay to ensure DOM elements are available
    });
})();
