
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
  
  if (checkDbBtn) {
    checkDbBtn.addEventListener('click', async () => {
      try {
        dbStatus.textContent = 'Checking connection...';
        dbStatus.className = 'p-3 rounded bg-gray-100 text-gray-600';
        
        const response = await fetch('/api/db_check.php');
        const data = await response.json();
        
        if (data.success) {
          dbStatus.textContent = 'Database connected successfully!';
          dbStatus.className = 'p-3 rounded bg-green-100 text-green-700';
          console.log('[SUCCESS] Database connection verified:', data);
        } else {
          dbStatus.textContent = `Connection failed: ${data.message}`;
          dbStatus.className = 'p-3 rounded bg-red-100 text-red-700';
          logError(new Error(data.message), 'Database Connection');
        }
      } catch (error) {
        dbStatus.textContent = `Error: ${error.message}`;
        dbStatus.className = 'p-3 rounded bg-red-100 text-red-700';
        logError(error, 'Database Check Request');
      }
    });
  }

  // Handle booking form entry points and positions
  const entryPointCheckboxes = document.querySelectorAll('.entry-point-checkbox');
  
  entryPointCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const positionInput = this.parentElement.querySelector('.position-input');
      if (this.checked) {
        positionInput.classList.remove('hidden');
      } else {
        positionInput.classList.add('hidden');
        // Clear the position value when unchecked
        const positionField = positionInput.querySelector('input[type="number"]');
        if (positionField) {
          positionField.value = '';
        }
      }
    });
  });

  // Handle booking form submission
  const bookingForm = document.getElementById('booking-form');
  const bookingStatus = document.getElementById('booking-status');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      try {
        // Validate that at least one entry point is selected
        const selectedEntryPoints = document.querySelectorAll('.entry-point-checkbox:checked');
        if (selectedEntryPoints.length === 0) {
          throw new Error('Please select at least one entry point');
        }
        
        // Validate that all selected entry points have a position
        let hasEmptyPosition = false;
        selectedEntryPoints.forEach(entryPoint => {
          const positionInput = entryPoint.parentElement.querySelector('input[type="number"]');
          if (!positionInput.value) {
            hasEmptyPosition = true;
          }
        });
        
        if (hasEmptyPosition) {
          throw new Error('Please provide a position for each selected entry point');
        }
        
        bookingStatus.textContent = 'Submitting booking...';
        bookingStatus.className = 'mt-4 p-3 rounded bg-gray-100 text-gray-600';
        
        // In a real application, you would send this data to your server
        const formData = new FormData(bookingForm);
        const bookingData = Object.fromEntries(formData.entries());
        
        // Get selected entry points and their positions
        const entryPoints = [];
        selectedEntryPoints.forEach(checkbox => {
          const entryId = checkbox.value;
          const positionInput = document.querySelector(`input[name="positions[${entryId}]"]`);
          entryPoints.push({
            id: entryId,
            position: positionInput.value
          });
        });
        
        // Add entry points data to booking data
        bookingData.entryPointsData = entryPoints;
        
        console.log('[INFO] Booking data:', bookingData);
        
        // Simulate a successful booking for now
        setTimeout(() => {
          bookingStatus.textContent = 'Booking submitted successfully!';
          bookingStatus.className = 'mt-4 p-3 rounded bg-green-100 text-green-700';
          console.log('[SUCCESS] Booking completed:', bookingData);
          bookingForm.reset();
          
          // Reset position inputs to hidden
          document.querySelectorAll('.position-input').forEach(div => {
            div.classList.add('hidden');
          });
        }, 1500);
      } catch (error) {
        bookingStatus.textContent = `Error: ${error.message}`;
        bookingStatus.className = 'mt-4 p-3 rounded bg-red-100 text-red-700';
        logError(error, 'Booking Submission');
      }
    });
  }
});
