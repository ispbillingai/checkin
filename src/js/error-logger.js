
/**
 * Basic error logger for the admin dashboard
 */
window.errorLogger = {
    logs: [],
    /**
     * Log an info message
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    info: function(message, context = {}) {
        this.logMessage('info', message, context);
    },
    
    /**
     * Log a warning message
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    warn: function(message, context = {}) {
        this.logMessage('warning', message, context);
    },
    
    /**
     * Log an error message
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    error: function(message, context = {}) {
        this.logMessage('error', message, context);
    },
    
    /**
     * Log a message with specified level
     * @param {string} level - The log level (info, warning, error)
     * @param {string} message - The message to log
     * @param {object} context - Additional context for the log
     */
    logMessage: function(level, message, context = {}) {
        const entry = {
            timestamp: new Date().toISOString(),
            level: level,
            message: message,
            context: context
        };
        
        this.logs.push(entry);
        this.updateLogDisplay();
        
        // Send error to server if it's an error
        if (level === 'error') {
            this.sendToServer(entry);
        }
    },
    
    /**
     * Update the log display if the container exists
     */
    updateLogDisplay: function() {
        const container = document.getElementById('log-entries');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.logs.slice(-50).forEach(log => {
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
                    <span class="font-medium">${log.level.toUpperCase()}</span>
                    <span class="text-xs text-gray-500">${time}</span>
                </div>
                <div>${log.message}</div>
                ${Object.keys(log.context).length ? `<pre class="text-xs mt-1 bg-gray-100 p-1 rounded">${JSON.stringify(log.context, null, 2)}</pre>` : ''}
            `;
            
            container.appendChild(logItem);
        });
    },
    
    /**
     * Send a log entry to the server
     * @param {object} entry - The log entry to send
     */
    sendToServer: function(entry) {
        // Only if we're in a real browser environment
        if (typeof fetch !== 'undefined') {
            fetch('/api/log_client_error.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entry)
            }).catch(err => {
                // Silently handle error
            });
        }
    },
    
    /**
     * Download logs as a JSON file
     */
    downloadLogs: function() {
        const data = JSON.stringify(this.logs, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'admin-dashboard-logs.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
};

// Set up global error handler
window.addEventListener('error', function(event) {
    if (window.errorLogger) {
        window.errorLogger.error('Uncaught JavaScript error: ' + event.message, {
            filename: event.filename,
            line: event.lineno,
            column: event.colno,
            stack: event.error ? event.error.stack : ''
        });
    }
});
