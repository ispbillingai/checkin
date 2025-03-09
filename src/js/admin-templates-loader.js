
/**
 * Admin Templates Loader
 * This script loads all HTML templates for the admin dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Templates Loader initialized');
    
    // Create a status element for debugging
    const statusElement = document.createElement('div');
    statusElement.id = 'templates-loader-status';
    statusElement.style.display = 'none';
    document.body.appendChild(statusElement);
    
    // Log function that also updates status element
    function logStatus(message, isError = false) {
        console.log(message);
        if (window.errorLogger) {
            if (isError) {
                window.errorLogger.error(message);
            } else {
                window.errorLogger.info(message);
            }
        }
        
        // Update status element
        statusElement.textContent = message;
        if (isError) {
            statusElement.dataset.error = 'true';
        }
    }
    
    // Define templates to load
    const templates = [
        { name: 'sidebar', targetId: 'sidebar-content', templateId: 'sidebar-template-container' },
        { name: 'bookings', targetId: 'bookingsSection', templateId: 'bookings-template-container' },
        { name: 'rooms', targetId: 'roomsSection', templateId: 'rooms-template-container' },
        { name: 'passcodes', targetId: 'passcodesSection', templateId: 'passcodes-template-container' },
        { name: 'database', targetId: 'databaseSection', templateId: 'database-template-container' },
        { name: 'admin-header', targetId: 'admin-header', templateId: 'admin-header-template-container' },
        { name: 'users', targetId: 'usersSection', templateId: 'users-template-container' },
        { name: 'settings', targetId: 'settingsSection', templateId: 'settings-template-container' },
        { name: 'room-setting', targetId: null, templateId: 'room-setting-template-container' },
        { name: 'database-table', targetId: null, templateId: 'database-table-template-container' },
        { name: 'email-templates', targetId: 'emailTemplatesSection', templateId: 'email-templates-template-container' },
        { name: 'sms-templates', targetId: 'smsTemplatesSection', templateId: 'sms-templates-template-container' },
        { name: 'toast', targetId: 'toast-container', templateId: 'toast-template-container' }
    ];
    
    // Track loaded templates
    let loadedCount = 0;
    const totalTemplates = templates.length;
    
    // Function to load template
    function loadTemplate(template) {
        const { name, targetId, templateId } = template;
        logStatus(`Loading template: ${name}...`);
        
        // Path to template file
        const templatePath = `/src/pages/templates/${name}-template.html`;
        
        // Create a timestamp for cache busting
        const timestamp = new Date().getTime();
        const cacheBustedPath = `${templatePath}?_=${timestamp}`;
        
        // Fetch the template
        fetch(cacheBustedPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                // Store the template in the template container
                const templateContainer = document.getElementById(templateId);
                if (templateContainer) {
                    templateContainer.innerHTML = html;
                    logStatus(`Template stored in container: ${name}`);
                    
                    // If target is specified, also inject the template content
                    if (targetId) {
                        const targetElement = document.getElementById(targetId);
                        if (targetElement) {
                            targetElement.innerHTML = html;
                            logStatus(`Template injected into target: ${name} -> ${targetId}`);
                        } else {
                            const error = `Target element not found: ${targetId}`;
                            logStatus(error, true);
                            if (typeof window.handleTemplateLoadError === 'function') {
                                window.handleTemplateLoadError(name, new Error(error));
                            }
                        }
                    }
                } else {
                    const error = `Template container not found: ${templateId}`;
                    logStatus(error, true);
                    if (typeof window.handleTemplateLoadError === 'function') {
                        window.handleTemplateLoadError(name, new Error(error));
                    }
                }
                
                // Track progress
                loadedCount++;
                logStatus(`Loaded ${loadedCount}/${totalTemplates} templates`);
                
                // If all templates are loaded, initialize sidebar
                if (loadedCount === totalTemplates) {
                    logStatus('All templates loaded successfully!');
                    if (typeof window.initializeSidebar === 'function') {
                        window.initializeSidebar();
                    } else {
                        logStatus('initializeSidebar function not found!', true);
                    }
                }
            })
            .catch(error => {
                const errorMsg = `Error loading template ${name}: ${error.message}`;
                logStatus(errorMsg, true);
                console.error(errorMsg, error);
                
                if (window.errorLogger) {
                    window.errorLogger.error(`Failed to load template: ${name}`, {
                        path: templatePath,
                        error: error.message,
                        stack: error.stack
                    });
                }
                
                if (typeof window.handleTemplateLoadError === 'function') {
                    window.handleTemplateLoadError(name, error);
                }
                
                // Even on error, increment counter so we don't hang forever
                loadedCount++;
            });
    }
    
    // Load all templates
    templates.forEach(loadTemplate);
});
