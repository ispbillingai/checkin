
/**
 * Admin Templates Loader
 * Loads HTML templates dynamically into the admin panel
 */
(function() {
    console.log("Admin templates loader initialized");
    
    // Function to load a template into a container
    function loadTemplate(templateId, containerId) {
        console.log(`Loading template ${templateId} into ${containerId}`);
        
        try {
            // Get the template element
            const template = document.getElementById(templateId);
            if (!template) {
                console.error(`Template not found: ${templateId}`);
                if (window.logClientError) {
                    window.logClientError(`Template not found: ${templateId}`, "error");
                }
                return false;
            }
            
            // Get the container element
            const container = document.getElementById(containerId);
            if (!container) {
                console.error(`Container not found: ${containerId}`);
                if (window.logClientError) {
                    window.logClientError(`Container not found: ${containerId}`, "error");
                }
                return false;
            }
            
            // Clone the template content and add it to the container
            const content = template.content.cloneNode(true);
            container.innerHTML = '';
            container.appendChild(content);
            
            console.log(`Successfully loaded template ${templateId} into ${containerId}`);
            return true;
        } catch (error) {
            console.error(`Error loading template ${templateId} into ${containerId}:`, error);
            if (window.logClientError) {
                window.logClientError(`Error loading template: ${error.message}`, "error", {
                    templateId,
                    containerId,
                    stack: error.stack
                });
            }
            return false;
        }
    }
    
    // Load all templates
    function loadAllTemplates() {
        console.log("Loading all admin templates");
        
        // Map of template IDs to container IDs
        const templateMappings = {
            'bookingsTemplate': 'bookingsSection',
            'roomsTemplate': 'roomsSection',
            'passcodesTemplate': 'passcodesSection',
            'databaseTemplate': 'databaseSection',
            'emailTemplatesTemplate': 'emailTemplatesSection',
            'smsTemplatesTemplate': 'smsTemplatesSection'
        };
        
        // Load each template
        let loadedCount = 0;
        for (const [templateId, containerId] of Object.entries(templateMappings)) {
            if (loadTemplate(templateId, containerId)) {
                loadedCount++;
            }
        }
        
        console.log(`Loaded ${loadedCount}/${Object.keys(templateMappings).length} templates`);
        return loadedCount;
    }
    
    // Expose functions globally
    window.adminTemplates = {
        loadTemplate,
        loadAllTemplates
    };
    
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM loaded, initializing admin templates");
        setTimeout(loadAllTemplates, 100); // Small delay to ensure templates are available
    });
    
    console.log("Admin templates loader setup complete");
})();
