
/**
 * Enhanced client-side error logging for admin dashboard
 */
class ErrorLogger {
    constructor() {
        this.logs = [];
        this.logLevel = 'debug'; // 'debug', 'info', 'warn', 'error'
        this.maxLogs = 100;
        this.initialized = false;
        
        // Setup global error handler
        this.setupGlobalErrorHandling();
    }
    
    /**
     * Initialize the error logger
     */
    init() {
        if (this.initialized) return;
        
        console.log('Initializing error logger');
        
        // Create log display container if it doesn't exist
        if (!document.getElementById('error-log-container')) {
            const logContainer = document.createElement('div');
            logContainer.id = 'error-log-container';
            logContainer.className = 'fixed bottom-0 right-0 z-50 max-w-md w-full p-4 transform transition-transform duration-300';
            logContainer.style.maxHeight = '300px';
            logContainer.style.overflow = 'auto';
            logContainer.style.display = 'none';
            
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Toggle Error Logs';
            toggleButton.className = 'absolute top-2 right-2 px-2 py-1 text-xs bg-red-600 text-white rounded';
            toggleButton.onclick = () => this.toggleLogDisplay();
            
            document.body.appendChild(logContainer);
            document.body.appendChild(toggleButton);
        }
        
        this.initialized = true;
        this.log('ErrorLogger initialized', 'info');
    }
    
    /**
     * Set up global error handling
     */
    setupGlobalErrorHandling() {
        // Capture all uncaught errors
        window.onerror = (message, source, lineno, colno, error) => {
            this.log(`Global Error: ${message} at ${source}:${lineno}:${colno}`, 'error', error);
            return false; // Let the default handler run as well
        };
        
        // Capture all unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.log(`Unhandled Promise Rejection: ${event.reason}`, 'error', event.reason);
        });
        
        // Capture all console.error calls
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.log(`Console Error: ${args.join(' ')}`, 'error');
            originalConsoleError.apply(console, args);
        };
        
        // Capture all console.warn calls
        const originalConsoleWarn = console.warn;
        console.warn = (...args) => {
            this.log(`Console Warning: ${args.join(' ')}`, 'warn');
            originalConsoleWarn.apply(console, args);
        };
    }
    
    /**
     * Log a message with a specific level
     * @param {string} message - The message to log
     * @param {string} level - The log level (debug, info, warn, error)
     * @param {object} details - Additional details to log
     */
    log(message, level = 'debug', details = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            message,
            level,
            details: details ? (details.stack || JSON.stringify(details)) : null
        };
        
        // Add to internal log storage
        this.logs.unshift(logEntry);
        
        // Trim logs if they exceed max size
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(0, this.maxLogs);
        }
        
        // Add to log display if it exists
        this.updateLogDisplay();
        
        // Send to server (if implemented)
        this.sendToServer(logEntry);
        
        return logEntry;
    }
    
    /**
     * Log debug message
     * @param {string} message - The message to log
     * @param {object} details - Additional details
     */
    debug(message, details = null) {
        return this.log(message, 'debug', details);
    }
    
    /**
     * Log info message
     * @param {string} message - The message to log
     * @param {object} details - Additional details
     */
    info(message, details = null) {
        return this.log(message, 'info', details);
    }
    
    /**
     * Log warning message
     * @param {string} message - The message to log
     * @param {object} details - Additional details
     */
    warn(message, details = null) {
        return this.log(message, 'warn', details);
    }
    
    /**
     * Log error message
     * @param {string} message - The message to log
     * @param {object} details - Additional details
     */
    error(message, details = null) {
        return this.log(message, 'error', details);
    }
    
    /**
     * Update the log display
     */
    updateLogDisplay() {
        const container = document.getElementById('error-log-container');
        if (!container) return;
        
        // Clear current logs
        container.innerHTML = '';
        
        // Add each log entry
        this.logs.forEach(log => {
            const entryDiv = document.createElement('div');
            entryDiv.className = 'mb-2 p-2 rounded text-sm';
            
            // Set background color based on log level
            switch (log.level) {
                case 'error':
                    entryDiv.className += ' bg-red-100 border-l-4 border-red-500';
                    break;
                case 'warn':
                    entryDiv.className += ' bg-yellow-100 border-l-4 border-yellow-500';
                    break;
                case 'info':
                    entryDiv.className += ' bg-blue-100 border-l-4 border-blue-500';
                    break;
                default:
                    entryDiv.className += ' bg-gray-100 border-l-4 border-gray-500';
            }
            
            // Format log entry
            const timeString = new Date(log.timestamp).toLocaleTimeString();
            const messageHTML = `
                <div class="font-bold">${log.level.toUpperCase()} [${timeString}]</div>
                <div>${log.message}</div>
                ${log.details ? `<div class="text-xs mt-1 text-gray-700 overflow-auto" style="max-height: 100px">${log.details}</div>` : ''}
            `;
            
            entryDiv.innerHTML = messageHTML;
            container.appendChild(entryDiv);
        });
    }
    
    /**
     * Toggle the display of logs
     */
    toggleLogDisplay() {
        const container = document.getElementById('error-log-container');
        if (!container) return;
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            this.updateLogDisplay();
        } else {
            container.style.display = 'none';
        }
    }
    
    /**
     * Send log to server
     * @param {object} logEntry - The log entry to send
     */
    sendToServer(logEntry) {
        // Skip if we're not on the admin dashboard
        if (!window.location.href.includes('AdminDashboard')) {
            return;
        }
        
        // Send log to server via fetch
        fetch('/api/log_client_error.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(logEntry)
        }).catch(err => {
            // Don't log this error to avoid recursion
            console.warn('Failed to send log to server:', err);
        });
    }
    
    /**
     * Get logs as JSON string
     */
    getLogsJson() {
        return JSON.stringify(this.logs);
    }
    
    /**
     * Download logs as a file
     */
    downloadLogs() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(this.getLogsJson());
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "admin_dashboard_logs.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }
}

// Create global instance
window.errorLogger = new ErrorLogger();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.errorLogger.init();
    window.errorLogger.info('DOM Content Loaded');
    
    // Log navigation information
    window.errorLogger.info(`Page loaded: ${window.location.href}`, {
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash
    });
    
    // Log browser information
    window.errorLogger.info('Browser info', {
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        platform: navigator.platform
    });
});

// Add page visibility change logging
document.addEventListener('visibilitychange', () => {
    if (window.errorLogger) {
        window.errorLogger.info(`Page visibility changed: ${document.visibilityState}`);
    }
});

// Export the logger
export default window.errorLogger;
