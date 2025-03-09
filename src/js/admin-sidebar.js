
/**
 * Admin Sidebar functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log("Admin sidebar JS loaded");
  
  // This function will be called by the template loader when templates are ready
  window.initializeSidebar = function() {
    console.log("Initializing sidebar");
    
    // Get all sidebar section buttons
    const sectionButtons = document.querySelectorAll('[data-section]');
    console.log(`Found ${sectionButtons.length} section buttons`);
    
    // Add click event listeners to each button
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
        document.querySelectorAll('.section-content').forEach(section => {
          section.classList.add('hidden');
        });
        
        // Show the selected section
        const selectedSection = document.getElementById(sectionName + 'Section');
        if (selectedSection) {
          selectedSection.classList.remove('hidden');
          console.log(`Showing section: ${sectionName}`);
        } else {
          console.error(`Section not found: ${sectionName}Section`);
        }
      });
    });
    
    // Toggle sidebar functionality
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
      sidebarToggle.addEventListener('click', function() {
        sidebar.classList.toggle('w-64');
        sidebar.classList.toggle('w-16');
        
        const sidebarLabels = document.querySelectorAll('.sidebar-label');
        sidebarLabels.forEach(label => {
          label.classList.toggle('hidden');
        });
      });
    }
  };
});
