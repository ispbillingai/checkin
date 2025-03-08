
// admin-sidebar.js - Handles sidebar functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin sidebar script loaded");
    
    // Wait for sidebar content to be loaded
    const initSidebarInterval = setInterval(() => {
        const sidebarButtons = document.querySelectorAll('[data-section]');
        if (sidebarButtons.length > 0) {
            clearInterval(initSidebarInterval);
            initializeSidebar(sidebarButtons);
            console.log("Sidebar initialized with buttons:", sidebarButtons.length);
        }
    }, 100);
    
    function initializeSidebar(sectionButtons) {
        // Set bookings as default active section if no other is active
        const activeButton = document.querySelector('[data-section].bg-blue-100');
        if (!activeButton) {
            const bookingsButton = document.querySelector('[data-section="bookings"]');
            if (bookingsButton) {
                bookingsButton.classList.add('bg-blue-100', 'text-blue-600');
                bookingsButton.classList.remove('hover:bg-gray-100');
                
                // Show the bookings section
                const sections = document.querySelectorAll('.section-content');
                sections.forEach(section => section.classList.add('hidden'));
                document.getElementById('bookingsSection').classList.remove('hidden');
            }
        }
        
        // Add click event to each sidebar button
        sectionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const sectionName = this.getAttribute('data-section');
                console.log(`Clicked on section: ${sectionName}`);
                
                // Remove active class from all buttons
                sectionButtons.forEach(btn => {
                    btn.classList.remove('bg-blue-100', 'text-blue-600');
                    btn.classList.add('hover:bg-gray-100');
                });
                
                // Add active class to clicked button
                this.classList.add('bg-blue-100', 'text-blue-600');
                this.classList.remove('hover:bg-gray-100');
                
                // Hide all sections
                const sections = document.querySelectorAll('.section-content');
                sections.forEach(section => section.classList.add('hidden'));
                
                // Show the selected section
                const selectedSection = document.getElementById(sectionName + 'Section');
                if (selectedSection) {
                    selectedSection.classList.remove('hidden');
                } else {
                    console.error(`Section not found: ${sectionName}Section`);
                }
            });
        });
        
        // Handle sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('w-64');
                sidebar.classList.toggle('w-0');
            });
        }
    }
});
