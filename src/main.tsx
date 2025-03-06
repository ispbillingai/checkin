
<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/var/log/php/error.log');

// Log access
error_log("Main page accessed from: " . $_SERVER['REMOTE_ADDR']);
?>

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Check if the DOM is loaded and the root element exists
if (document.getElementById('root')) {
  try {
    createRoot(document.getElementById('root')!).render(<App />)
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Failed to mount React app:", error);
    
    // Display a fallback message
    document.body.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <h1>Something went wrong</h1>
        <p>Please try refreshing the page or <a href="/src/pages/index.html">go to home page</a></p>
      </div>
    `;
  }
} else {
  console.log("Root element not found, redirecting to HTML version");
  window.location.href = "/src/pages/index.html";
}
