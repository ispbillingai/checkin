
import './styles.css';

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
      } else {
        dbStatus.textContent = `Connection failed: ${data.message}`;
        dbStatus.className = 'status-message error';
      }
    } catch (error) {
      dbStatus.textContent = `Error: ${error.message}`;
      dbStatus.className = 'status-message error';
    }
  });
});
