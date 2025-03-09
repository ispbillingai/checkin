
// Global variable to track sidebar initialization
window.sidebarInitialized = false;

// Initialize sidebar functionality
function initializeSidebar() {
  // Prevent multiple initializations
  if (window.sidebarInitialized) {
    console.log("Sidebar already initialized, skipping");
    return;
  }
  
  console.log("Initializing sidebar");
  
  // Update username in header if available
  const usernameElement = document.getElementById('admin-username');
  if (usernameElement) {
    // Try to get username from session
    fetch('/api/verify_access.php')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.username) {
          usernameElement.textContent = data.username;
        }
      })
      .catch(error => console.error("Error fetching username:", error));
  }
  
  // Toggle sidebar
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('w-64');
      sidebar.classList.toggle('w-20');
      
      // Toggle text visibility
      const textElements = sidebar.querySelectorAll('span');
      textElements.forEach(el => {
        el.classList.toggle('hidden');
      });
    });
  }
  
  // Handle section navigation
  const sectionButtons = document.querySelectorAll('[data-section]');
  
  if (sectionButtons.length > 0) {
    // Show first section by default
    const firstSection = sectionButtons[0].getAttribute('data-section');
    showSection(firstSection + 'Section');
    
    // Add click event listeners to all section buttons
    sectionButtons.forEach(button => {
      button.addEventListener('click', function() {
        const sectionId = this.getAttribute('data-section') + 'Section';
        showSection(sectionId);
        
        // Update active button styling
        sectionButtons.forEach(btn => {
          btn.classList.remove('bg-blue-100', 'text-blue-600');
          btn.classList.add('hover:bg-gray-100');
        });
        
        this.classList.add('bg-blue-100', 'text-blue-600');
        this.classList.remove('hover:bg-gray-100');
      });
    });
  } else {
    console.warn("No section buttons found in sidebar");
  }
  
  // Mark sidebar as initialized
  window.sidebarInitialized = true;
  console.log("Sidebar initialization complete");
}

// Function to show a specific section and hide others
function showSection(sectionId) {
  console.log("Showing section:", sectionId);
  
  const sections = document.querySelectorAll('.section-content');
  sections.forEach(section => {
    section.classList.add('hidden');
  });
  
  const activeSection = document.getElementById(sectionId);
  if (activeSection) {
    activeSection.classList.remove('hidden');
  } else {
    console.error(`Section not found: ${sectionId}`);
  }
}

// Use MutationObserver to detect when sidebar content is loaded
function setupSidebarObserver() {
  const sidebarContent = document.getElementById('sidebar-content');
  
  if (sidebarContent) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && sidebarContent.children.length > 0) {
          console.log("Sidebar content populated via MutationObserver");
          
          // Once content is loaded, initialize the sidebar
          setTimeout(initializeSidebar, 100);
          
          // Disconnect observer once content is loaded
          observer.disconnect();
        }
      });
    });
    
    // Start observing
    observer.observe(sidebarContent, { childList: true });
    console.log("MutationObserver started for sidebar content");
  } else {
    console.error("Sidebar content element not found");
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  console.log("Admin sidebar JS loaded");
  
  // Set up the observer to detect when content loads
  setupSidebarObserver();
  
  // Expose the initialization function globally
  window.initializeSidebar = initializeSidebar;
  
  // Attempt to initialize after a delay as a fallback
  setTimeout(function() {
    if (!window.sidebarInitialized) {
      console.log("Fallback sidebar initialization");
      initializeSidebar();
    }
  }, 1000);
});
