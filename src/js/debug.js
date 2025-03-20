
/**
 * Debug Utilities - Only logs entry points related messages
 * Provides debugging tools for development
 */
(function() {
    // Only enable in development environments
    const isDevelopment = window.location.hostname === 'localhost' || 
                          window.location.hostname === '127.0.0.1';
    
    if (!isDevelopment) {
        return;
    }
    
    // Original console methods
    const originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn
    };
    
    // Override console methods to filter logs
    console.log = function(message) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            originalConsole.log(message);
        }
    };
    
    console.error = function(message) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            originalConsole.error(message);
        }
    };
    
    console.warn = function(message) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            originalConsole.warn(message);
        }
    };
    
    // Create debug toolbar with focus on entry points
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
            <span>Entry Points Debug Mode | </span>
            <button id="debug-toggle-console">Toggle Entry Points Console</button> | 
            <button id="debug-check-entry-points">Check Entry Points</button> | 
            <button id="debug-reload-page">Reload Page</button>
        `;
        
        const rightSection = document.createElement('div');
        rightSection.innerHTML = `
            <span>Entry Points Path: ${window.location.pathname}</span>
        `;
        
        toolbar.appendChild(leftSection);
        toolbar.appendChild(rightSection);
        
        document.body.appendChild(toolbar);
        
        // Add event listeners
        document.getElementById('debug-toggle-console').addEventListener('click', toggleConsole);
        document.getElementById('debug-check-entry-points').addEventListener('click', checkEntryPoints);
        document.getElementById('debug-reload-page').addEventListener('click', () => window.location.reload());
    }
    
    // Toggle debug console - only for entry points
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
        
        console.innerHTML = '<div style="color: yellow">Entry Points Debug Console - Only showing Entry Points related logs</div>';
        document.body.appendChild(console);
        
        // Log entry points related messages
        appendToDebugConsole('log', ['Entry Points Debug Console Activated - ENTRY POINTS LOG']);
    }
    
    // Append message to debug console - only for entry points
    function appendToDebugConsole(type, args) {
        const message = args[0];
        if (typeof message !== 'string' || !message.toLowerCase().includes('entry points')) {
            return;
        }
        
        const console = document.getElementById('debug-console');
        if (!console) return;
        
        const logEntry = document.createElement('div');
        logEntry.style.borderLeft = '3px solid ' + (type === 'error' ? 'red' : type === 'warn' ? 'orange' : 'blue');
        logEntry.style.paddingLeft = '5px';
        logEntry.style.marginBottom = '5px';
        
        // Format the message
        let formattedMessage = typeof message === 'object' ? JSON.stringify(message) : String(message);
        
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${formattedMessage}`;
        console.appendChild(logEntry);
        
        // Auto-scroll to bottom
        console.scrollTop = console.scrollHeight;
    }
    
    // Check entry points loading
    function checkEntryPoints() {
        console.log('Checking entry points scripts and API endpoints - ENTRY POINTS LOG');
        
        // Check entry points script
        const entryPointsScript = document.querySelector('script[src*="entry-points-data.js"]');
        if (entryPointsScript) {
            console.log('Entry points script is loaded in the DOM - ENTRY POINTS LOG');
            
            // Check if the script is properly loaded
            if (typeof window.initEntryPointsSection === 'function') {
                console.log('initEntryPointsSection function is available - ENTRY POINTS LOG');
            } else {
                console.error('initEntryPointsSection function is NOT available - ENTRY POINTS LOG');
            }
        } else {
            console.error('Entry points script is NOT loaded in the DOM - ENTRY POINTS LOG');
        }
        
        // Check entry points API
        fetch('/api/get_entry_points.php?debug=true')
            .then(response => {
                console.log(`Entry points API response status: ${response.status} - ENTRY POINTS LOG`);
                return response.json();
            })
            .then(data => {
                console.log(`Entry points API data received: ${JSON.stringify(data).substring(0, 100)}... - ENTRY POINTS LOG`);
            })
            .catch(error => {
                console.error(`Entry points API error: ${error} - ENTRY POINTS LOG`);
            });
    }
    
    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        originalConsole.log('Entry Points Debug Module Loaded - ENTRY POINTS LOG');
        setTimeout(createDebugToolbar, 500);
        
        // Check entry points automatically on load
        setTimeout(checkEntryPoints, 1000);
    });
})();
