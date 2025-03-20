
/**
 * Debug Utilities - All logging disabled
 * Provides debugging tools for development
 */
(function() {
    // Only enable in development environments
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    if (!isDevelopment) {
        return;
    }
    
    // Create debug toolbar
    function createDebugToolbar() {
        const toolbar = document.createElement('div');
        toolbar.id = 'debug-toolbar';
        toolbar.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            display: flex;
            justify-content: space-between;
        `;
        
        const leftSection = document.createElement('div');
        leftSection.innerHTML = `
            <span>Debug Mode | </span>
            <button id="debug-toggle-console">Toggle Console</button> | 
            <button id="debug-check-scripts">Check Scripts</button> | 
            <button id="debug-reload-page">Reload Page</button>
        `;
        
        const rightSection = document.createElement('div');
        rightSection.innerHTML = `
            <span>Path: ${window.location.pathname}</span>
        `;
        
        toolbar.appendChild(leftSection);
        toolbar.appendChild(rightSection);
        
        document.body.appendChild(toolbar);
        
        // Add event listeners
        document.getElementById('debug-toggle-console').addEventListener('click', toggleConsole);
        document.getElementById('debug-check-scripts').addEventListener('click', checkScripts);
        document.getElementById('debug-reload-page').addEventListener('click', () => window.location.reload());
    }
    
    // Toggle debug console - no logging
    function toggleConsole() {
        let console = document.getElementById('debug-console');
        
        if (console) {
            console.style.display = console.style.display === 'none' ? 'block' : 'none';
            return;
        }
        
        // Create console if it doesn't exist
        console = document.createElement('div');
        console.id = 'debug-console';
        console.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 0;
            right: 0;
            height: 200px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            font-family: monospace;
            font-size: 12px;
            overflow-y: auto;
            z-index: 9998;
            padding: 10px;
        `;
        
        document.body.appendChild(console);
        
        // Override console methods with empty functions
        const noOp = function() {};
        window.console.log = noOp;
        window.console.error = noOp;
        window.console.warn = noOp;
    }
    
    // Append message to debug console - disabled
    function appendToDebugConsole(type, args) {
        // Function disabled - no console output
    }
    
    // Check script loading - no logging
    function checkScripts() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const src = script.src;
            
            if (!src) continue;
            
            fetch(src, { method: 'HEAD' })
                .catch(error => {
                    // Silent error handling
                });
        }
        
        // Also check for external resources
        const links = document.getElementsByTagName('link');
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            const href = link.href;
            
            if (!href || link.rel !== 'stylesheet') continue;
            
            fetch(href, { method: 'HEAD' })
                .catch(error => {
                    // Silent error handling
                });
        }
    }
    
    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(createDebugToolbar, 500);
    });
})();
