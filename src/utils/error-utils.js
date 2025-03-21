
// Setup error logging
const logError = (error, context = '') => {
  console.error(`[ADMIN ERROR] ${context}:`, error);
};

// Set up global error handlers
const setupGlobalErrorHandlers = () => {
  // Set up global error handler
  window.addEventListener('error', (event) => {
    logError(event.error, 'Uncaught Exception');
  });

  // Set up promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, 'Unhandled Promise Rejection');
  });
};

export { logError, setupGlobalErrorHandlers };
