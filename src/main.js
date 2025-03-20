
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

// Generate a random PIN code
const generatePinCode = (length = 6) => {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

// Set minimum departure date based on arrival date
const updateDepartureDateMin = () => {
  const arrivalDateInput = document.getElementById('arrival-date');
  const departureDateInput = document.getElementById('departure-date');
  
  if (arrivalDateInput && departureDateInput && arrivalDateInput.value) {
    departureDateInput.min = arrivalDateInput.value;
    
    // If departure date is before arrival date, update it
    if (departureDateInput.value && departureDateInput.value < arrivalDateInput.value) {
      departureDateInput.value = arrivalDateInput.value;
    }
  }
};

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

  // Handle room selection to show position input
  const roomSelect = document.getElementById('room');
  const roomPositionInput = document.getElementById('room-position-input');
  
  if (roomSelect && roomPositionInput) {
    roomSelect.addEventListener('change', function() {
      if (this.value) {
        roomPositionInput.classList.remove('hidden');
      } else {
        roomPositionInput.classList.add('hidden');
        const roomPositionField = document.getElementById('room-position');
        if (roomPositionField) {
          roomPositionField.value = '';
        }
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

  // Handle PIN code generation
  const generatePinBtn = document.getElementById('generate-pin');
  const pinCodeInput = document.getElementById('pin-code');
  
  if (generatePinBtn && pinCodeInput) {
    generatePinBtn.addEventListener('click', () => {
      pinCodeInput.value = generatePinCode(6);
    });
  }

  // Handle arrival date changes
  const arrivalDateInput = document.getElementById('arrival-date');
  if (arrivalDateInput) {
    arrivalDateInput.addEventListener('change', updateDepartureDateMin);
    
    // Set minimum arrival date to today
    const today = new Date().toISOString().split('T')[0];
    arrivalDateInput.min = today;
  }

  // Handle booking form submission
  const bookingForm = document.getElementById('booking-form');
  const bookingStatus = document.getElementById('booking-status');

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      
      try {
        // Validate room selection and position
        const roomSelect = document.getElementById('room');
        const roomPosition = document.getElementById('room-position');
        
        if (!roomSelect.value) {
          throw new Error('Please select a room');
        }
        
        if (!roomPosition.value) {
          throw new Error('Please provide a position for the room');
        }
        
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
        
        // Validate dates and times
        const arrivalDate = document.getElementById('arrival-date').value;
        const arrivalTime = document.getElementById('arrival-time').value;
        const departureDate = document.getElementById('departure-date').value;
        const departureTime = document.getElementById('departure-time').value;
        
        if (!arrivalDate || !arrivalTime) {
          throw new Error('Please specify arrival date and time');
        }
        
        if (!departureDate || !departureTime) {
          throw new Error('Please specify departure date and time');
        }
        
        const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`);
        const departureDateTime = new Date(`${departureDate}T${departureTime}`);
        
        if (departureDateTime <= arrivalDateTime) {
          throw new Error('Departure time must be after arrival time');
        }
        
        // Validate PIN code
        const pinCode = document.getElementById('pin-code').value;
        if (!pinCode) {
          throw new Error('Please provide a PIN code or generate one');
        }
        
        if (!/^\d{4,6}$/.test(pinCode)) {
          throw new Error('PIN code must be 4-6 digits');
        }
        
        bookingStatus.textContent = 'Submitting booking...';
        bookingStatus.className = 'mt-4 p-3 rounded bg-gray-100 text-gray-600';
        
        // Get form data
        const formData = new FormData(bookingForm);
        
        // Add arrival and departure datetime
        formData.append('arrival_datetime', `${arrivalDate} ${arrivalTime}:00`);
        formData.append('departure_datetime', `${departureDate} ${departureTime}:00`);
        
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
        
        // Add entry points data as JSON
        formData.append('entry_points_data', JSON.stringify(entryPoints));
        formData.append('room_position', roomPosition.value);
        
        // Submit the booking to our new PHP endpoint
        const response = await fetch('/api/submit_booking.php', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          bookingStatus.textContent = result.message || 'Booking submitted successfully!';
          bookingStatus.className = 'mt-4 p-3 rounded bg-green-100 text-green-700';
          console.log('[SUCCESS] Booking completed:', result);
          bookingForm.reset();
          
          // Reset position inputs to hidden
          document.querySelectorAll('.position-input').forEach(div => {
            div.classList.add('hidden');
          });
          // Reset room position input to hidden
          roomPositionInput.classList.add('hidden');
        } else {
          throw new Error(result.message || 'Failed to submit booking');
        }
      } catch (error) {
        bookingStatus.textContent = `Error: ${error.message}`;
        bookingStatus.className = 'mt-4 p-3 rounded bg-red-100 text-red-700';
        logError(error, 'Booking Submission');
      }
    });
  }
});
