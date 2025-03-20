
import './styles.css';

// Setup error logging
const logError = (error, context = '') => {
  console.error(`[ERROR] ${context}:`, error);
  
  // You could also send errors to a server endpoint
  // fetch('/api/log-error', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ error: error.message, context, timestamp: new Date().toISOString() })
  // }).catch(e => console.error('Failed to send error log:', e));
};

// Set up global error handler
window.addEventListener('error', (event) => {
  logError(event.error, 'Uncaught Exception');
});

// Set up promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, 'Unhandled Promise Rejection');
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const appElement = document.getElementById('app');
  
  // Render our simple homepage
  appElement.innerHTML = `
    <div class="container">
      <header class="header">
        <h1>Welcome to Our Booking System</h1>
        <p class="subtitle">A simple way to manage your bookings</p>
      </header>
      
      <main class="main-content">
        <div class="card">
          <h2>Our Services</h2>
          <p>We provide an easy way to manage room bookings and access codes.</p>
          <button class="btn" id="check-db-btn">Check Database Connection</button>
          <div id="db-status" class="status-message"></div>
        </div>
      </main>
      
      <footer class="footer">
        <p>&copy; ${new Date().getFullYear()} Booking System. All rights reserved.</p>
      </footer>
    </div>
  `;
  
  // Add database connection check functionality
  const checkDbBtn = document.getElementById('check-db-btn');
  const dbStatus = document.getElementById('db-status');
  
  checkDbBtn.addEventListener('click', async () => {
    try {
      dbStatus.textContent = 'Checking connection...';
      dbStatus.className = 'status-message loading';
      
      const response = await fetch('/api/db_check.php');
      const data = await response.json();
      
      if (data.success) {
        dbStatus.textContent = 'Database connected successfully!';
        dbStatus.className = 'status-message success';
        console.log('[SUCCESS] Database connection verified:', data);
      } else {
        dbStatus.textContent = `Connection failed: ${data.message}`;
        dbStatus.className = 'status-message error';
        logError(new Error(data.message), 'Database Connection');
      }
    } catch (error) {
      dbStatus.textContent = `Error: ${error.message}`;
      dbStatus.className = 'status-message error';
      logError(error, 'Database Check Request');
    }
  });
});
