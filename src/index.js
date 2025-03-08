
// This file exists to satisfy TypeScript compilation requirements
console.log("Application initialized");

// Redirect to the main page if accessed directly
if (window.location.pathname === '/src/index.js') {
  window.location.href = '/';
}
