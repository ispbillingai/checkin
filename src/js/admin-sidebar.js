
// Sidebar initialization and management
let sidebarInitialized = false;

function initializeSidebar() {
  if (sidebarInitialized) {
    return;
  }
  
  // Get all section buttons in the sidebar
  const sectionButtons = document.querySelectorAll('[data-section]');
  
  if (sectionButtons.length === 0) {
    // Set up a MutationObserver to detect when sidebar content is loaded
    const sidebarContent = document.getElementById('sidebar-content');
    
    if (sidebarContent) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
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
  sidebarInitialized = true;
}

function attachSidebarEventListeners() {
  const sectionButtons = document.querySelectorAll('[data-section]');
  
  if (sectionButtons.length === 0) {
    return;
  }
  
  // Attach click event to each button
  sectionButtons.forEach(button => {
    // Remove any existing event listeners first to prevent duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      const sectionName = this.getAttribute('data-section');
      
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
      initializeSidebar();
    }
  }, 1000);
});

// Export for external use
window.initializeSidebar = initializeSidebar;
window.attachSidebarEventListeners = attachSidebarEventListeners;
window.sidebarInitialized = false;
