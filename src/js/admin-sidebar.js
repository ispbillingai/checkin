
// Sidebar initialization and management
let sidebarInitialized = false;

function initializeSidebar() {
  if (sidebarInitialized) {
    console.log('Sidebar already initialized, skipping');
    return;
  }
  
  console.log('Initializing sidebar');
  
  // Get all section buttons in the sidebar
  const sectionButtons = document.querySelectorAll('[data-section]');
  
  if (sectionButtons.length === 0) {
    console.log('No section buttons found, waiting for sidebar content to load');
    // Set up a MutationObserver to detect when sidebar content is loaded
    const sidebarContent = document.getElementById('sidebar-content');
    
    if (sidebarContent) {
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Attempt to attach event listeners after content is loaded
            console.log('Sidebar content loaded via mutation, attaching event listeners');
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
  console.log('Attaching sidebar event listeners');
  const sectionButtons = document.querySelectorAll('[data-section]');
  
  if (sectionButtons.length === 0) {
    console.log('No section buttons found when attaching listeners');
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
      console.log(`Switching to section: ${sectionName}`);
      
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
        console.log(`Section ${sectionName} displayed`);
      } else {
        console.warn(`Section with ID ${sectionName}Section not found`);
      }
    });
  });
  
  // Handle sidebar toggle if present
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    console.log('Setting up sidebar toggle');
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('w-64');
      sidebar.classList.toggle('w-16');
      
      // Toggle visibility of text in sidebar
      const textElements = sidebar.querySelectorAll('.sidebar-item-text');
      textElements.forEach(el => {
        el.classList.toggle('hidden');
      });
    });
  }
  
  // Mark sidebar as initialized
  sidebarInitialized = true;
  console.log('Sidebar initialization complete');
  
  // Trigger custom event for other components
  document.dispatchEvent(new CustomEvent('sidebarLoaded'));
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded fired in admin-sidebar.js');
  // Try to initialize the sidebar right away
  initializeSidebar();
  
  // Fallback initialization after a delay in case templates are loaded async
  setTimeout(function() {
    if (!sidebarInitialized) {
      console.log('Sidebar not initialized after timeout, trying again');
      initializeSidebar();
    }
  }, 1000);
});

// Export for external use
window.initializeSidebar = initializeSidebar;
window.attachSidebarEventListeners = attachSidebarEventListeners;
window.sidebarInitialized = false;
