
console.log("Admin templates loader initialized");

// Array of template names that need to be loaded
const templateNames = [
  'sidebar',
  'bookings',
  'passcodes',
  'database',
  'room-setting',
  'database-table',
  'admin-header',
  'users',
  'settings',
  'toast',
  'email-templates',
  'sms-templates'
];

// Track loading status
let templatesLoaded = 0;
let templatesFailed = 0;
let templatesTotal = templateNames.length;

// Status for debugging
const getTemplateStatus = () => {
  if (templatesLoaded === 0 && templatesFailed === 0) return '';
  return `Templates: ${templatesLoaded}/${templatesTotal} loaded, ${templatesFailed} failed`;
};

// Function to create a status element in the DOM
const createStatusElement = () => {
  const statusElem = document.createElement('div');
  statusElem.id = 'templates-loader-status';
  statusElem.style.display = 'none';
  statusElem.textContent = getTemplateStatus();
  document.body.appendChild(statusElem);
  return statusElem;
};

// Get or create status element
let statusElement = document.getElementById('templates-loader-status');
if (!statusElement) {
  statusElement = createStatusElement();
}

// Store loaded templates content
const loadedTemplates = {};

// Load templates on page load
document.addEventListener('DOMContentLoaded', function() {
  console.log("Loading admin templates");
  
  // Load each template
  templateNames.forEach(loadTemplate);
});

// Function to load a template file
function loadTemplate(templateName) {
  const templatePath = `/src/pages/templates/${templateName}-template.html`;
  
  fetch(templatePath)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status} for ${templatePath}`);
      }
      return response.text();
    })
    .then(html => {
      if (!html || html.trim() === '') {
        console.log(`No template content found in ${templatePath}`);
        throw new Error('Empty template content');
      }
      
      // Store template content
      loadedTemplates[templateName] = html;
      
      // Insert into container
      const containerName = `${templateName}-template-container`;
      const container = document.getElementById(containerName);
      if (container) {
        container.innerHTML = html;
      }
      
      // Insert into corresponding section if needed
      if (templateName === 'sidebar') {
        const sidebarContent = document.getElementById('sidebar-content');
        if (sidebarContent) {
          sidebarContent.innerHTML = html;
          // Trigger sidebar initialization
          if (window.initializeSidebar) {
            setTimeout(window.initializeSidebar, 0);
          }
        }
      } else if (templateName === 'bookings') {
        const bookingsSection = document.getElementById('bookingsSection');
        if (bookingsSection) {
          bookingsSection.innerHTML = html;
        }
      } else if (templateName === 'admin-header') {
        const headerContainer = document.getElementById('admin-header');
        if (headerContainer) {
          headerContainer.innerHTML = html;
        }
      }
      
      // Update template loading status
      templatesLoaded++;
      statusElement.textContent = getTemplateStatus();
      
      console.log(`Loaded template: ${templateName}`);
      
      // If all templates are loaded, trigger a custom event
      if (templatesLoaded + templatesFailed === templatesTotal) {
        const event = new CustomEvent('adminTemplatesLoaded', {
          detail: { loadedCount: templatesLoaded, failedCount: templatesFailed }
        });
        document.dispatchEvent(event);
      }
    })
    .catch(error => {
      console.log(`No template content found in ${templatePath}`);
      if (window.errorLogger) {
        window.errorLogger.error(`No template content found in ${templatePath}`);
      }
      
      if (window.handleTemplateLoadError) {
        window.handleTemplateLoadError(templateName, error);
      }
      
      // Update failure count
      templatesFailed++;
      statusElement.textContent = getTemplateStatus();
    });
}

// Expose the status and loadTemplate function globally
window.adminTemplateLoader = {
  getStatus: getTemplateStatus,
  loadTemplate: loadTemplate,
  getLoadedTemplates: () => loadedTemplates
};
