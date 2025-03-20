
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
    // Silent error handling
  }
});

// Debug info for the admin dashboard - no logging
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
