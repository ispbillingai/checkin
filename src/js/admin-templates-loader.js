
// Admin Templates Loader
console.log("Loading admin-templates-loader.js");

// Function to load all admin templates
window.loadAdminTemplates = function() {
    console.log("Loading admin templates");
    
    // Load templates in sequence
    loadTemplate('sidebar-template', '/src/pages/templates/sidebar-template.html', 'sidebar-content')
        .then(() => loadTemplate('bookings-template', '/src/pages/templates/bookings-template.html', 'bookingsSection'))
        .then(() => loadTemplate('rooms-template', '/src/pages/templates/rooms-template.html', 'roomsSection'))
        .then(() => loadTemplate('passcodes-template', '/src/pages/templates/passcodes-template.html', 'passcodesSection'))
        .then(() => loadTemplate('database-template', '/src/pages/templates/database-template.html', 'databaseSection'))
        .then(() => loadTemplate('admin-header-template', '/src/pages/templates/admin-header-template.html', 'admin-header'))
        .then(() => loadTemplate('users-template', '/src/pages/templates/users-template.html', 'usersSection'))
        .then(() => loadTemplate('settings-template', '/src/pages/templates/settings-template.html', 'settingsSection'))
        .then(() => loadTemplate('email-templates-template', '/src/pages/templates/email-templates-template.html', 'emailTemplatesSection'))
        .then(() => loadTemplate('sms-templates-template', '/src/pages/templates/sms-templates-template.html', 'smsTemplatesSection'))
        .then(() => {
            console.log("All templates loaded successfully");
            // Initialize sidebar functionality
            if (window.initializeSidebar) {
                window.initializeSidebar();
            }
        })
        .catch(error => {
            console.error("Error loading templates:", error);
            if (window.errorLogger) {
                window.errorLogger.logError("Template loading error", error);
            }
        });
};

// Function to load a single template
function loadTemplate(templateName, templateUrl, targetElementId) {
    return new Promise((resolve, reject) => {
        console.log(`Loading template: ${templateName} from ${templateUrl}`);
        
        const targetElement = document.getElementById(targetElementId);
        if (!targetElement) {
            console.warn(`Target element ${targetElementId} not found in the DOM`);
            resolve(); // Continue even if element not found
            return;
        }
        
        fetch(templateUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                targetElement.innerHTML = html;
                console.log(`Template ${templateName} loaded successfully`);
                
                // Add class to indicate template is loaded
                targetElement.classList.add('template-loaded');
                
                // Dispatch a custom event to notify that the template has been loaded
                document.dispatchEvent(new CustomEvent('templateLoaded', {
                    detail: {
                        templateName: templateName,
                        targetElementId: targetElementId
                    }
                }));
                
                resolve();
            })
            .catch(error => {
                console.error(`Error loading template ${templateName}:`, error);
                if (window.errorLogger) {
                    window.errorLogger.logError(`Template loading error: ${templateName}`, error);
                }
                reject(error);
            });
    });
}

// Listen for the 'templateLoaded' event for debugging purposes
document.addEventListener('templateLoaded', function(e) {
    console.log(`Template loaded event: ${e.detail.templateName} loaded into ${e.detail.targetElementId}`);
});

// Make loadTemplate function available globally for debugging
window.loadAdminTemplate = loadTemplate;
