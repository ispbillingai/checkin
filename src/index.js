
// Main entry point for the application
console.log("Application initialized");

// Redirect to the appropriate page based on URL
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  
  // Specific redirects can be handled here if needed
  console.log("Current path: " + path);
  
  // Handle admin routes
  if (path.includes('/admin')) {
    console.log("Redirecting to admin dashboard");
    window.location.href = '/src/pages/AdminDashboard.html';
  }
});
