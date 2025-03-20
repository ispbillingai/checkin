
// Minimal index.js - only redirects to HomePage.html if not in iframe
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're in an iframe
  if (window.self === window.top) {
    // If not in iframe, redirect to HomePage
    window.location.href = '/src/pages/HomePage.html';
  }
});
