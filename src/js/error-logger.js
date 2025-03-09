
/**
 * Error Logger
 * Captures client-side errors and sends them to the server
 */
(function() {
    console.log("Error logger initialized");
    
    // Function to send error logs to the server
    function logError(message, level = "error", details = null) {
        console.log(`Logging ${level}: ${message}`);
        
        // Create the error payload
        const errorData = {
            message: message,
            level: level,
            details: details,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Send to server
        fetch('/api/log_client_error.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(errorData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Error logged to server:", data);
        })
        .catch(err => {
            console.error("Failed to log error to server:", err);
        });
    }
    
    // Add global error handler
    window.addEventListener('error', function(event) {
        logError(
            `${event.message} (${event.filename}:${event.lineno}:${event.colno})`,
            "error",
            {
                stack: event.error ? event.error.stack : null,
                filename: event.filename,
                lineNumber: event.lineno,
                columnNumber: event.colno
            }
        );
    });
    
    // Add global promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        logError(
            `Unhandled Promise Rejection: ${event.reason}`,
            "error",
            {
                reason: event.reason ? event.reason.toString() : null,
                stack: event.reason && event.reason.stack ? event.reason.stack : null
            }
        );
    });
    
    // Add global console error override
    const originalConsoleError = console.error;
    console.error = function() {
        // Call original console.error
        originalConsoleError.apply(console, arguments);
        
        // Log to server
        const args = Array.from(arguments).map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        logError(args, "error");
    };
    
    // Add global console warn override
    const originalConsoleWarn = console.warn;
    console.warn = function() {
        // Call original console.warn
        originalConsoleWarn.apply(console, arguments);
        
        // Log to server
        const args = Array.from(arguments).map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' ');
        
        logError(args, "warning");
    };
    
    // Expose the logError function globally
    window.logClientError = logError;
    
    // Log successful initialization
    console.log("Error logger setup complete");
})();
