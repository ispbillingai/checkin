
// admin-sidebar.js
document.addEventListener('DOMContentLoaded', function() {
    console.log("admin-sidebar.js loaded");
    
    // Function to initialize sidebar functionality
    function initializeSidebar() {
        console.log("Initializing sidebar from admin-sidebar.js");
        
        // Get all sidebar section buttons
        const sectionButtons = document.querySelectorAll('[data-section]');
        console.log("Found section buttons:", sectionButtons.length);
        
        if (sectionButtons.length === 0) {
            console.warn("No section buttons found yet, will try again when sidebar is loaded");
            return; // Wait for sidebar to load
        }
        
        // Add click event listeners to each button
        sectionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const sectionName = this.getAttribute('data-section');
                console.log("Section button clicked:", sectionName);
                
                // Remove active class from all buttons
                sectionButtons.forEach(btn => {
                    btn.classList.remove('bg-blue-100', 'text-blue-600');
                    btn.classList.add('hover:bg-gray-100');
                });
                
                // Add active class to clicked button
                this.classList.add('bg-blue-100', 'text-blue-600');
                this.classList.remove('hover:bg-gray-100');
                
                // Hide all sections
                document.querySelectorAll('.section-content').forEach(section => {
                    section.classList.add('hidden');
                });
                
                // Show the selected section
                const selectedSection = document.getElementById(sectionName + 'Section');
                if (selectedSection) {
                    selectedSection.classList.remove('hidden');
                    console.log("Showing section:", sectionName);
                } else {
                    console.error("Section not found:", sectionName + 'Section');
                }
            });
        });
        
        // Toggle sidebar functionality
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', function() {
                console.log("Sidebar toggle clicked");
                sidebar.classList.toggle('w-64');
                sidebar.classList.toggle('w-0');
            });
        }
    }
    
    // Listen for the custom event that indicates the sidebar is loaded
    document.addEventListener('sidebarLoaded', function() {
        console.log("sidebarLoaded event received in admin-sidebar.js");
        initializeSidebar();
    });
    
    // Also listen for the initialization event
    document.addEventListener('initializeSidebar', function() {
        console.log("initializeSidebar event received in admin-sidebar.js");
        initializeSidebar();
    });
    
    // Initial check if DOM is already loaded with sidebar content
    if (document.querySelector('#sidebar-content') && 
        document.querySelector('#sidebar-content').children.length > 0) {
        console.log("Sidebar content already loaded, initializing");
        initializeSidebar();
    } else {
        console.log("Waiting for sidebar content to load...");
        // Will be initialized via event listeners
    }
});
