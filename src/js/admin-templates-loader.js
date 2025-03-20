
// Admin templates loader
window.loadAdminTemplates = function() {
  const templates = [
    { id: 'sidebar-template', url: '/src/pages/templates/sidebar-template.html', targetId: 'sidebar-content' },
    { id: 'bookings-template', url: '/src/pages/templates/bookings-template.html', targetId: 'bookingsSection' },
    { id: 'rooms-template', url: '/src/pages/templates/rooms-template.html', targetId: 'roomsSection' },
    { id: 'passcodes-template', url: '/src/pages/templates/passcodes-template.html', targetId: 'passcodesSection' },
    { id: 'database-template', url: '/src/pages/templates/database-template.html', targetId: 'databaseSection' },
    { id: 'admin-header-template', url: '/src/pages/templates/admin-header-template.html', targetId: 'admin-header' },
    { id: 'users-template', url: '/src/pages/templates/users-template.html', targetId: 'usersSection' },
    { id: 'settings-template', url: '/src/pages/templates/settings-template.html', targetId: 'settingsSection' },
    { id: 'email-templates-template', url: '/src/pages/templates/email-templates-template.html', targetId: 'emailTemplatesSection' },
    { id: 'sms-templates-template', url: '/src/pages/templates/sms-templates-template.html', targetId: 'smsTemplatesSection' }
  ];
  
  let loadedCount = 0;
  
  templates.forEach(template => {
    loadTemplate(template.id, template.url, template.targetId);
  });
  
  function loadTemplate(templateId, url, targetId) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      // Get the target element to insert the template
      const targetElement = document.getElementById(targetId);
      
      if (!targetElement) {
        return;
      }
      
      // Set the HTML content
      targetElement.innerHTML = html;
      
      // Increment the counter
      loadedCount++;
      
      // Dispatch a custom event to notify that the template has been loaded
      const event = new CustomEvent('templateLoaded', { 
        detail: { 
          templateId: templateId,
          targetId: targetId
        },
        bubbles: true 
      });
      document.dispatchEvent(event);
      
      // If the template is the sidebar, explicitly initialize it
      if (templateId === 'sidebar-template') {
        setTimeout(function() {
          if (window.attachSidebarEventListeners) {
            window.attachSidebarEventListeners();
          } else if (window.initializeSidebar) {
            window.initializeSidebar();
          }
        }, 200);
      }
      
      // Check if all templates have been loaded
      if (loadedCount === templates.length) {
        // Dispatch a custom event to notify that all templates have been loaded
        const allLoadedEvent = new CustomEvent('allTemplatesLoaded');
        document.dispatchEvent(allLoadedEvent);
      }
    })
    .catch(error => {
      // Error handled silently
    });
  }
};

// Export for external use
window.loadAdminTemplates = window.loadAdminTemplates || function() {
  // Admin templates loader not properly initialized
};
