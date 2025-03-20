
// Minimal index.js - only redirects to HomePage.html if not in iframe
document.addEventListener('DOMContentLoaded', function() {
  console.log("Index.js loaded - checking if in iframe");
  
  // Check if we're in an iframe
  if (window.self === window.top) {
    console.log("Not in iframe, redirecting to HomePage.html");
    // If not in iframe, redirect to HomePage
    window.location.href = '/src/pages/HomePage.html';
  } else {
    console.log("Running in iframe, not redirecting");
  }
});
