
/**
 * Admin Templates Loader
 * Loads all template files for the admin dashboard
 */

console.log("Admin templates loader initialized");

// Templates to load
const templateList = [
  { name: 'sidebar', containerId: 'sidebar-template-container', path: '/src/pages/templates/sidebar-template.html' },
  { name: 'bookings', containerId: 'bookings-template-container', path: '/src/pages/templates/bookings-template.html' },
  { name: 'passcodes', containerId: 'passcodes-template-container', path: '/src/pages/templates/passcodes-template.html' },
  { name: 'database', containerId: 'database-template-container', path: '/src/pages/templates/database-template.html' },
  { name: 'room-setting', containerId: 'room-setting-template-container', path: '/src/pages/templates/room-setting-template.html' },
  { name: 'database-table', containerId: 'database-table-template-container', path: '/src/pages/templates/database-table-template.html' },
  { name: 'admin-header', containerId: 'admin-header-template-container', path: '/src/pages/templates/admin-header-template.html' },
  { name: 'users', containerId: 'users-template-container', path: '/src/pages/templates/users-template.html' },
  { name: 'settings', containerId: 'settings-template-container', path: '/src/pages/templates/settings-template.html' },
  { name: 'toast', containerId: 'toast-template-container', path: '/src/pages/templates/toast-template.html' },
  { name: 'email-templates', containerId: 'email-templates-template-container', path: '/src/pages/templates/email-templates-template.html' },
  { name: 'sms-templates', containerId: 'sms-templates-template-container', path: '/src/pages/templates/sms-templates-template.html' }
];

// Create a hidden status element to track template loading
document.addEventListener('DOMContentLoaded', function() {
  const statusElement = document.createElement('div');
  statusElement.id = 'templates-loader-status';
  statusElement.style.display = 'none';
  document.body.appendChild(statusElement);
  
  // Load all templates
  loadAllTemplates();
});

/**
 * Loads all templates in the list
 */
function loadAllTemplates() {
  let loaded = 0;
  let failed = 0;
  
  // Update the status element
  const updateStatus = () => {
    const statusElement = document.getElementById('templates-loader-status');
    if (statusElement) {
      statusElement.textContent = `Templates: ${loaded}/${templateList.length} loaded, ${failed} failed`;
    }
  };
  
  // For each template in the list
  templateList.forEach((template) => {
    loadTemplate(template.path)
      .then(content => {
        // Create a container for the template if it doesn't exist
        const container = document.getElementById(template.containerId);
        if (container) {
          container.innerHTML = content;
          loaded++;
          console.log(`Loaded template: ${template.name}`);
        } else {
          console.warn(`Container ${template.containerId} not found for template ${template.name}`);
          failed++;
        }
        updateStatus();
      })
      .catch(error => {
        console.error(`No template content found in ${template.path}`);
        if (window.errorLogger && window.errorLogger.error) {
          window.errorLogger.error(`No template content found in ${template.path}`);
        }
        failed++;
        updateStatus();
      });
  });
}

/**
 * Loads a template from the given path
 * @param {string} path - Path to the template file
 * @returns {Promise<string>} - Promise resolving to the template content
 */
function loadTemplate(path) {
  return new Promise((resolve, reject) => {
    fetch(path)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load template: ${path}`);
        }
        return response.text();
      })
      .then(content => {
        if (!content || content.trim() === '') {
          reject(new Error(`Empty template content: ${path}`));
        } else {
          resolve(content);
        }
      })
      .catch(error => {
        if (window.handleTemplateLoadError) {
          window.handleTemplateLoadError(path, error);
        }
        reject(error);
      });
  });
}

/**
 * Updates a section with content from a template
 * @param {string} sectionId - ID of the section to update
 * @param {string} templateId - ID of the template container
 */
window.updateSectionFromTemplate = function(sectionId, templateId) {
  const section = document.getElementById(sectionId);
  const templateContainer = document.getElementById(templateId);
  
  if (section && templateContainer) {
    section.innerHTML = templateContainer.innerHTML;
    return true;
  }
  
  console.error(`Failed to update section ${sectionId} from template ${templateId}`);
  return false;
};

// Create a global object to track loaded templates
window.templatesLoaded = {};
