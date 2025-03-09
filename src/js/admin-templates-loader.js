
/**
 * Admin Templates Loader
 * Loads templates for the admin dashboard
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin templates loader initialized");
    
    // Track loading status
    const loadingStatus = document.createElement('div');
    loadingStatus.id = 'templates-loader-status';
    loadingStatus.style.display = 'none';
    document.body.appendChild(loadingStatus);
    
    // Template files to load
    const templates = [
        { id: 'sidebar-template-container', file: '/src/pages/templates/sidebar-template.html' },
        { id: 'bookings-template-container', file: '/src/pages/templates/bookings-template.html' },
        { id: 'passcodes-template-container', file: '/src/pages/templates/passcodes-template.html' },
        { id: 'database-template-container', file: '/src/pages/templates/database-template.html' },
        { id: 'room-setting-template-container', file: '/src/pages/templates/room-setting-template.html' },
        { id: 'database-table-template-container', file: '/src/pages/templates/database-table-template.html' },
        { id: 'admin-header-template-container', file: '/src/pages/templates/admin-header-template.html' },
        { id: 'users-template-container', file: '/src/pages/templates/users-template.html' },
        { id: 'settings-template-container', file: '/src/pages/templates/settings-template.html' },
        { id: 'toast-template-container', file: '/src/pages/templates/toast-template.html' },
        { id: 'email-templates-template-container', file: '/src/pages/templates/email-templates-template.html' },
        { id: 'sms-templates-template-container', file: '/src/pages/templates/sms-templates-template.html' }
    ];
    
    // Load status tracking
    let loaded = 0;
    let failed = 0;
    
    function updateStatus() {
        const total = templates.length;
        const complete = loaded + failed;
        loadingStatus.textContent = `Templates: ${loaded}/${total} loaded, ${failed} failed`;
        
        if (complete === total) {
            console.log(`All templates processed. Loaded: ${loaded}, Failed: ${failed}`);
            if (window.errorLogger) {
                window.errorLogger.info(`All templates processed. Loaded: ${loaded}, Failed: ${failed}`);
            }
            
            // Trigger sidebar initialization if it exists
            if (window.initializeSidebar) {
                window.initializeSidebar();
            }
        }
    }
    
    // Load each template
    templates.forEach(template => {
        const container = document.getElementById(template.id);
        if (!container) {
            console.error(`Container not found: ${template.id}`);
            if (window.errorLogger) {
                window.errorLogger.error(`Template container not found: ${template.id}`);
            }
            failed++;
            updateStatus();
            return;
        }
        
        fetch(template.file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;
                
                // Extract content from template and insert into the main section
                const templateId = template.id.replace('-container', '');
                const templateContent = container.querySelector('template')?.innerHTML;
                
                if (templateContent) {
                    // For sidebar, put directly into sidebar-content
                    if (templateId === 'sidebar-template') {
                        const sidebarContent = document.getElementById('sidebar-content');
                        if (sidebarContent) {
                            sidebarContent.innerHTML = templateContent;
                            console.log("Sidebar template loaded");
                            if (window.errorLogger) {
                                window.errorLogger.info("Sidebar template loaded");
                            }
                        } else {
                            console.error("Sidebar content container not found");
                            if (window.errorLogger) {
                                window.errorLogger.error("Sidebar content container not found");
                            }
                        }
                    } 
                    // For admin header, put into admin-header
                    else if (templateId === 'admin-header-template') {
                        const adminHeader = document.getElementById('admin-header');
                        if (adminHeader) {
                            adminHeader.innerHTML = templateContent;
                            console.log("Admin header template loaded");
                            if (window.errorLogger) {
                                window.errorLogger.info("Admin header template loaded");
                            }
                        } else {
                            console.error("Admin header container not found");
                            if (window.errorLogger) {
                                window.errorLogger.error("Admin header container not found");
                            }
                        }
                    }
                    // For all other templates, put into their corresponding sections
                    else {
                        const sectionId = templateId.replace('-template', 'Section');
                        const section = document.getElementById(sectionId);
                        
                        if (section) {
                            section.innerHTML = templateContent;
                            console.log(`${templateId} loaded into ${sectionId}`);
                            if (window.errorLogger) {
                                window.errorLogger.info(`${templateId} loaded into ${sectionId}`);
                            }
                        } else {
                            console.error(`Section not found: ${sectionId}`);
                            if (window.errorLogger) {
                                window.errorLogger.error(`Section container not found: ${sectionId}`);
                            }
                        }
                    }
                } else {
                    console.error(`No template content found in ${template.file}`);
                    if (window.errorLogger) {
                        window.errorLogger.error(`No template content found in ${template.file}`);
                    }
                    failed++;
                    updateStatus();
                    return;
                }
                
                loaded++;
                updateStatus();
            })
            .catch(error => {
                console.error(`Failed to load template ${template.file}:`, error);
                if (window.errorLogger) {
                    window.errorLogger.error(`Failed to load template: ${template.file}`, {
                        error: error.message,
                        stack: error.stack
                    });
                }
                
                // If there's a global handler for template errors, call it
                if (window.handleTemplateLoadError) {
                    window.handleTemplateLoadError(template.id.replace('-container', ''), error);
                }
                
                failed++;
                updateStatus();
            });
    });
});
