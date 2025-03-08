
/**
 * Templates Loader
 * Handles dynamic loading of HTML templates for the admin dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
  // Define templates to load
  const templates = [
    { id: 'sidebar-template-container', path: '../pages/templates/sidebar-template.html', target: '#sidebar-content' },
    { id: 'bookings-template-container', path: '../pages/templates/bookings-template.html', template: true, templateId: 'bookingsTemplate' },
    { id: 'passcodes-template-container', path: '../pages/templates/passcodes-template.html', template: true, templateId: 'passcodesTemplate' },
    { id: 'database-template-container', path: '../pages/templates/database-template.html', template: true, templateId: 'databaseTemplate' },
    { id: 'room-setting-template-container', path: '../pages/templates/room-setting-template.html', template: true, templateId: 'roomSettingTemplate' },
    { id: 'database-table-template-container', path: '../pages/templates/database-table-template.html', template: true, templateId: 'databaseTableTemplate' }
  ];

  // Load all templates
  Promise.all(templates.map(template => loadTemplate(template)))
    .then(() => {
      console.log('All templates loaded successfully');
      // Initialize the application after templates are loaded
      if (window.initAdminSidebar) {
        window.initAdminSidebar();
      }
    })
    .catch(error => {
      console.error('Error loading templates:', error);
    });
});

/**
 * Loads a template from a given path
 * @param {Object} template Template configuration object
 * @returns {Promise} Promise that resolves when the template is loaded
 */
function loadTemplate(template) {
  return new Promise((resolve, reject) => {
    fetch(template.path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load template: ${template.path}`);
        }
        return response.text();
      })
      .then(html => {
        const container = document.getElementById(template.id);
        if (!container) {
          throw new Error(`Container not found: ${template.id}`);
        }
        
        container.innerHTML = html;
        
        // If this is a template that should be added to the document
        if (template.template) {
          const templateElement = document.createElement('template');
          templateElement.id = template.templateId;
          templateElement.innerHTML = html;
          document.body.appendChild(templateElement);
        }
        
        // If there's a target element, immediately inject the content
        if (template.target) {
          const targetElement = document.querySelector(template.target);
          if (targetElement) {
            targetElement.innerHTML = html;
          }
        }
        
        resolve();
      })
      .catch(error => {
        console.error(`Error loading template ${template.path}:`, error);
        reject(error);
      });
  });
}

// Export for testing purposes
if (typeof module !== 'undefined') {
  module.exports = { loadTemplate };
}
