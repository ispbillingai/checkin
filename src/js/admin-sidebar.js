
// Sidebar initialization and management
let sidebarInitialized = false;

function initializeSidebar() {
  console.log("Initializing sidebar");
  
  if (sidebarInitialized) {
    console.log("Sidebar already initialized, skipping");
    return;
  }
  
  // Get all section buttons in the sidebar
  const sectionButtons = document.querySelectorAll('[data-section]');
  
  if (sectionButtons.length === 0) {
    console.log("No section buttons found in sidebar");
    
    // Set up a MutationObserver to detect when sidebar content is loaded
    const sidebarContent = document.getElementById('sidebar-content');
    
    if (sidebarContent) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            console.log("Sidebar content populated via MutationObserver");
            // Attempt to attach event listeners after content is loaded
            attachSidebarEventListeners();
            observer.disconnect();
          }
        });
      });
      
      observer.observe(sidebarContent, { childList: true, subtree: true });
    }
    
    return;
  }
  
  attachSidebarEventListeners();
  console.log("Sidebar initialization complete");
  sidebarInitialized = true;
}

function attachSidebarEventListeners() {
  const sectionButtons = document.querySelectorAll('[data-section]');
  
  if (sectionButtons.length === 0) {
    console.log("No section buttons found when trying to attach event listeners");
    return;
  }
  
  console.log(`Found ${sectionButtons.length} section buttons in sidebar`);
  
  // Attach click event to each button
  sectionButtons.forEach(button => {
    // Remove any existing event listeners first to prevent duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionName = this.getAttribute('data-section');
      console.log(`Sidebar button clicked: ${sectionName}`);
      
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
      sections.forEach(section => {
        section.classList.add('hidden');
      });
      
      // Show the selected section
      const targetSection = document.getElementById(`${sectionName}Section`);
      if (targetSection) {
        targetSection.classList.remove('hidden');
      } else {
        console.error(`Section ${sectionName}Section not found`);
      }
    });
  });
  
  // Mark sidebar as initialized
  sidebarInitialized = true;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Try to initialize the sidebar right away
  initializeSidebar();
  
  // Fallback initialization after a delay in case templates are loaded async
  setTimeout(function() {
    if (!sidebarInitialized) {
      console.log("Fallback sidebar initialization");
      initializeSidebar();
    }
  }, 1000);
});

// Export for external use
window.initializeSidebar = initializeSidebar;
window.attachSidebarEventListeners = attachSidebarEventListeners;
window.sidebarInitialized = false;
