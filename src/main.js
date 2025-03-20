
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

  // Handle booking form submission
  const bookingForm = document.getElementById('booking-form');
  const bookingStatus = document.getElementById('booking-status');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      try {
        bookingStatus.textContent = 'Submitting booking...';
        bookingStatus.className = 'status-message loading';
        
        // In a real application, you would send this data to your server
        const formData = new FormData(bookingForm);
        const bookingData = Object.fromEntries(formData.entries());
        
        console.log('[INFO] Booking data:', bookingData);
        
        // Simulate a successful booking for now
        setTimeout(() => {
          bookingStatus.textContent = 'Booking submitted successfully!';
          bookingStatus.className = 'status-message success';
          bookingForm.reset();
        }, 1500);
        
        // In a real application, you would do something like this:
        // const response = await fetch('/api/bookings.php', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(bookingData)
        // });
        // const data = await response.json();
        // if (data.success) {
        //   bookingStatus.textContent = 'Booking submitted successfully!';
        //   bookingStatus.className = 'status-message success';
        //   bookingForm.reset();
        // } else {
        //   throw new Error(data.message);
        // }
      } catch (error) {
        bookingStatus.textContent = `Error: ${error.message}`;
        bookingStatus.className = 'status-message error';
        logError(error, 'Booking Submission');
      }
    });
  }
});
