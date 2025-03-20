
// Main entry point for the application

// Redirect to the appropriate page based on URL
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  
  try {
    // Handle admin routes
    if (path.includes('/admin-debug')) {
      window.location.href = '/src/pages/AdminDashboardDebug.html';
    } else if (path.includes('/admin')) {
      window.location.href = '/src/pages/AdminDashboard.html';
    } else if (path === '/' || path === '') {
      // Check if we're in an iframe
      if (window.self !== window.top) {
        // We're in an iframe, no need to redirect
      } else {
        // If not in iframe, we should redirect to HomePage
        window.location.href = '/src/pages/HomePage.html';
      }
    }
  } catch (error) {
    // Try to log the error if the logger exists
    if (window.logClientError) {
      window.logClientError(`Routing error: ${error.message}`, "error", {
        path: path,
        stack: error.stack
      });
    }
  }
});

// Add global error logging if not in production
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Add a check for JS files loading
  function checkScriptLoading() {
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src) {
        // Create a test request to check if the script exists
        fetch(src, { method: 'HEAD' })
          .catch(error => {
            // Silently catch errors
          });
      }
    }
  }
  
  // Run the check after a delay to ensure page has loaded
  setTimeout(checkScriptLoading, 1000);
}

// Debug info for the admin dashboard
window.getDashboardDebugInfo = function() {
  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    loadedScripts: Array.from(document.getElementsByTagName('script'))
      .filter(s => s.src)
      .map(s => s.src),
    templates: {
      sidebarContent: document.getElementById('sidebar-content')?.children.length || 0,
      bookingsSection: document.getElementById('bookingsSection')?.innerHTML.length || 0,
      adminHeader: document.getElementById('admin-header')?.innerHTML.length || 0
    }
  };
};
