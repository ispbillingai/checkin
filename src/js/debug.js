
/**
 * Debug Utilities
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
    
    // Toggle debug console
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
        
        // Override console.log and similar methods
        const originalLog = window.console.log;
        const originalError = window.console.error;
        const originalWarn = window.console.warn;
        
        window.console.log = function() {
            originalLog.apply(console, arguments);
            appendToDebugConsole('log', arguments);
        };
        
        window.console.error = function() {
            originalError.apply(console, arguments);
            appendToDebugConsole('error', arguments);
        };
        
        window.console.warn = function() {
            originalWarn.apply(console, arguments);
            appendToDebugConsole('warn', arguments);
        };
    }
    
    // Append message to debug console
    function appendToDebugConsole(type, args) {
        const console = document.getElementById('debug-console');
        if (!console) return;
        
        const entry = document.createElement('div');
        entry.style.borderBottom = '1px solid #333';
        entry.style.padding = '4px 0';
        
        let color = 'white';
        if (type === 'error') color = '#ff5f5f';
        if (type === 'warn') color = '#ffcf5f';
        
        entry.style.color = color;
        
        const timestamp = new Date().toLocaleTimeString();
        const argsArray = Array.from(args);
        const message = argsArray.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');
        
        entry.textContent = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        console.appendChild(entry);
        console.scrollTop = console.scrollHeight;
    }
    
    // Check script loading
    function checkScripts() {
        const scripts = document.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
            const script = scripts[i];
            const src = script.src;
            
            if (!src) continue;
            
            fetch(src, { method: 'HEAD' })
                .catch(error => {
                    // Silently catch errors
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
                    // Silently catch errors
                });
        }
    }
    
    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(createDebugToolbar, 500);
    });
})();
