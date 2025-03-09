
console.log("Admin sidebar JS loaded");

// Global variable to track if sidebar has been initialized
window.sidebarInitialized = false;

// Initialize the sidebar functionality
window.initializeSidebar = function() {
  // Prevent multiple initializations
  if (window.sidebarInitialized) {
    console.log("Sidebar already initialized, skipping");
    return;
  }
  
  console.log("Initializing sidebar");
  
  // Mark as initialized
  window.sidebarInitialized = true;
  
  // Get sidebar element
  const sidebar = document.getElementById('sidebar');
  const sidebarContent = document.getElementById('sidebar-content');
  
  if (!sidebar || !sidebarContent) {
    console.error("Sidebar elements not found");
    return;
  }
  
  // Get all section links
  const sectionLinks = sidebarContent.querySelectorAll('.section-link');
  
  // Default active section
  let activeSection = "bookingsSection";
  
  // Function to show a section and hide others
  const showSection = function(sectionId) {
    console.log("Showing section:", sectionId);
    
    // Update active section
    activeSection = sectionId;
    
    // Hide all sections
    document.querySelectorAll('.section-content').forEach(section => {
      section.classList.add('hidden');
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
      selectedSection.classList.remove('hidden');
    } else {
      console.error("Section not found:", sectionId);
    }
    
    // Update active link styles
    sectionLinks.forEach(link => {
      const linkSectionId = link.getAttribute('data-section');
      
      if (linkSectionId === sectionId) {
        link.classList.add('bg-blue-100', 'text-blue-800');
        link.classList.remove('hover:bg-gray-100');
      } else {
        link.classList.remove('bg-blue-100', 'text-blue-800');
        link.classList.add('hover:bg-gray-100');
      }
    });
  };
  
  // Add click handlers to section links
  sectionLinks.forEach(link => {
    const sectionId = link.getAttribute('data-section');
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(sectionId);
    });
  });
  
  // Initialize the default section
  showSection(activeSection);
  
  console.log("Sidebar initialization complete");
};

// Set up a MutationObserver to watch for sidebar content changes
document.addEventListener('DOMContentLoaded', function() {
  const sidebarContent = document.getElementById('sidebar-content');
  
  if (sidebarContent) {
    // Check if sidebar content already has children (templates might be loaded)
    if (sidebarContent.children.length > 0) {
      console.log("Sidebar content already populated, initializing now");
      window.initializeSidebar();
      return;
    }
    
    // Set up observer to watch for changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && sidebarContent.children.length > 0) {
          console.log("Sidebar content populated via MutationObserver");
          window.initializeSidebar();
          observer.disconnect(); // Stop observing once initialized
        }
      });
    });
    
    // Start observing
    observer.observe(sidebarContent, { childList: true });
    console.log("MutationObserver started for sidebar content");
  } else {
    console.error("Sidebar content element not found");
  }
});
