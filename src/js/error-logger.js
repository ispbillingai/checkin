
/**
 * Basic error logger for the admin dashboard - Only logs entry points related messages
 */
window.errorLogger = {
    logs: [],
    
    /**
     * Log an info message - entry points only
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    info: function(message, context = {}) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            console.log(`[INFO - ENTRY POINTS LOG] ${message}`, context);
            this.logMessage('info', message, context);
        }
    },
    
    /**
     * Log a warning message - entry points only
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    warn: function(message, context = {}) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            console.warn(`[WARN - ENTRY POINTS LOG] ${message}`, context);
            this.logMessage('warning', message, context);
        }
    },
    
    /**
     * Log an error message - entry points only
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    error: function(message, context = {}) {
        if (typeof message === 'string' && message.toLowerCase().includes('entry points')) {
            console.error(`[ERROR - ENTRY POINTS LOG] ${message}`, context);
            this.logMessage('error', message, context);
            
            // Send PHP error logs for entry points
            this.sendPHPErrorLog(message, context);
        }
    },
    
    /**
     * Log a message with specified level - entry points only
     * @param {string} level - The log level (info, warning, error)
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    logMessage: function(level, message, context = {}) {
        if (typeof message !== 'string' || !message.toLowerCase().includes('entry points')) {
            return;
        }
        
        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            context: context
        };
        
        this.logs.push(entry);
        this.updateLogDisplay();
    },
    
    /**
     * Send PHP error log - specifically for entry points
     * @param {string} message - Error message
     * @param {object} context - Error context
     */
    sendPHPErrorLog: function(message, context = {}) {
        // Only log entry points errors to PHP
        if (typeof message !== 'string' || !message.toLowerCase().includes('entry points')) {
            return;
        }
        
        fetch('/api/log_client_error.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                level: 'error',
                message: `ENTRY POINTS ERROR: ${message}`,
                details: context,
                timestamp: new Date().toISOString()
            })
        })
        .then(response => {
            console.log(`PHP Error logging response: ${response.status} - ENTRY POINTS LOG`);
            return response.json();
        })
        .then(data => {
            console.log(`PHP Error log stored: ${data.success} - ENTRY POINTS LOG`);
        })
        .catch(error => {
            console.error(`Failed to send PHP error log: ${error} - ENTRY POINTS LOG`);
        });
    },
    
    /**
     * Update the log display if the container exists
     */
    updateLogDisplay: function() {
        const container = document.getElementById('log-entries');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Only display entry points logs
        const entryPointsLogs = this.logs.filter(log => 
            typeof log.message === 'string' && 
            log.message.toLowerCase().includes('entry points')
        );
        
        entryPointsLogs.slice(-50).forEach(log => {
            const logItem = document.createElement('div');
            logItem.className = 'mb-2 p-2 border-l-4 text-sm';
            
            // Set color based on log level
            if (log.level === 'error') {
                logItem.className += ' border-red-500 bg-red-50';
            } else if (log.level === 'warning') {
                logItem.className += ' border-yellow-500 bg-yellow-50';
            } else {
                logItem.className += ' border-blue-500 bg-blue-50';
            }
            
            // Format timestamp
            const time = new Date(log.timestamp).toLocaleTimeString();
            
            // Create log content
            logItem.innerHTML = `
                <div class="flex items-center justify-between">
                    <span class="font-medium">${log.level.toUpperCase()} - ENTRY POINTS</span>
                    <span class="text-xs text-gray-500">${time}</span>
                </div>
                <div>${log.message}</div>
                ${Object.keys(log.context).length ? `<pre class="text-xs mt-1 bg-gray-100 p-1 rounded">${JSON.stringify(log.context, null, 2)}</pre>` : ''}
            `;
            
            container.appendChild(logItem);
        });
    },
    
    /**
     * Download logs as a JSON file - only entry points logs
     */
    downloadLogs: function() {
        // Filter for entry points logs only
        const entryPointsLogs = this.logs.filter(log => 
            typeof log.message === 'string' && 
            log.message.toLowerCase().includes('entry points')
        );
        
        const data = JSON.stringify(entryPointsLogs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'entry-points-logs.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

// Set up global error handler for entry points only
window.addEventListener('error', function(event) {
    // Only log errors from entry points related scripts
    const isEntryPointsRelated = 
        (event.filename && event.filename.toLowerCase().includes('entry-points')) ||
        (event.message && event.message.toLowerCase().includes('entry points'));
    
    if (window.errorLogger && isEntryPointsRelated) {
        window.errorLogger.error(`Uncaught JavaScript error in entry points: ${event.message}`, {
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
            stack: event.error ? event.error.stack : ''
        });
    }
});
