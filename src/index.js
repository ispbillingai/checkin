
// Main entry point for the application
console.log("Application initialized");

// Redirect to the appropriate page based on URL
document.addEventListener('DOMContentLoaded', function() {
  const path = window.location.pathname;
  
  // Specific redirects can be handled here if needed
  console.log("Current path: " + path);
  
  // Log all paths for debugging
  console.log({
    currentUrl: window.location.href,
    origin: window.location.origin,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash
  });
  
  try {
    // Handle admin routes
    if (path.includes('/admin')) {
      console.log("Admin path detected, redirecting to admin dashboard");
      window.location.href = '/src/pages/AdminDashboard.html';
    } else if (path === '/' || path === '') {
      console.log("Root path detected, ensuring we load HomePage");
      // Check if we're in an iframe
      if (window.self !== window.top) {
        console.log("We're in an iframe, no need to redirect");
      } else {
        // If not in iframe, we should redirect to HomePage
        console.log("Not in iframe, redirecting to HomePage");
        window.location.href = '/src/pages/HomePage.html';
      }
    }
  } catch (error) {
    console.error("Error in page routing:", error);
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
  console.log("Development environment detected, enabling detailed logging");
  
  // Add a check for JS files loading
  function checkScriptLoading() {
    console.log("Checking for script loading issues");
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src) {
        console.log(`Script ${i+1}/${scripts.length}: ${src}`);
        // Create a test request to check if the script exists
        fetch(src, { method: 'HEAD' })
          .then(response => {
            if (!response.ok) {
              console.error(`Script not found: ${src}`);
            }
          })
          .catch(error => {
            console.error(`Error loading script ${src}:`, error);
          });
      }
    }
  }
  
  // Run the check after a delay to ensure page has loaded
  setTimeout(checkScriptLoading, 1000);
}
