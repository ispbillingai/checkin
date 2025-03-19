
// Booking form functionality
document.addEventListener('DOMContentLoaded', function() {
  // Initialize date inputs with default values
  initializeDateInputs();
  
  // Load rooms from API
  loadRooms();
  
  // Set up event listeners
  setupEventListeners();
});

function initializeDateInputs() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDateTimeForInput = (date) => {
    return date.toISOString().slice(0, 16);
  };
  
  const arrivalInput = document.getElementById('arrivalDateTime');
  const departureInput = document.getElementById('departureDateTime');
  
  if (arrivalInput && departureInput) {
    arrivalInput.min = formatDateTimeForInput(today);
    departureInput.min = formatDateTimeForInput(tomorrow);
    
    arrivalInput.value = formatDateTimeForInput(today);
    departureInput.value = formatDateTimeForInput(tomorrow);
  }
}

function loadRooms() {
  console.log("Loading rooms from API");
  
  fetch('/api/get_rooms.php')
    .then(response => {
      console.log("Room API response status:", response.status);
      return response.json();
    })
    .then(data => {
      console.log("Room API data:", data);
      if (data.success && data.rooms) {
        populateRooms(data.rooms);
      } else {
        console.error('Failed to load rooms:', data.message);
        showToast('error', 'Error', 'Failed to load rooms. Please try again later.');
        document.getElementById('roomsContainer').innerHTML = 
          '<div class="col-span-full text-center text-red-500">Failed to load rooms. Please refresh the page.</div>';
      }
    })
    .catch(error => {
      console.error('Error loading rooms:', error);
      showToast('error', 'Error', 'Failed to load rooms. Please try again later.');
      document.getElementById('roomsContainer').innerHTML = 
        '<div class="col-span-full text-center text-red-500">Failed to load rooms. Please refresh the page.</div>';
    });
}

function populateRooms(rooms) {
  const roomSelect = document.getElementById('room');
  const roomsContainer = document.getElementById('roomsContainer');
  
  roomsContainer.innerHTML = '';
  
  if (rooms.length === 0) {
    roomsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500">No rooms available at the moment.</div>';
    return;
  }
  
  const roomDescriptions = {};
  
  rooms.forEach(room => {
    // Add to select dropdown
    const option = document.createElement('option');
    option.value = room.id;
    option.textContent = room.name;
    roomSelect.appendChild(option);
    
    roomDescriptions[room.id] = room.description || '';
    
    // Create room card
    const roomCard = document.createElement('div');
    roomCard.className = 'bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 room-card';
    roomCard.innerHTML = `
      <div class="h-48 bg-gray-200 travel-image" 
            style="background-image: url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80&random=${Math.random()}')">
      </div>
      <div class="p-4">
        <h3 class="font-semibold text-lg text-gray-800">${room.name}</h3>
        <p class="text-gray-600 text-sm mt-1">${room.description || 'Comfortable accommodation with all the amenities you need.'}</p>
        <button 
          class="mt-4 w-full py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium" 
          onclick="selectRoom('${room.id}')">
          Select Room
        </button>
      </div>
    `;
    roomsContainer.appendChild(roomCard);
  });
  
  // Add room selection handler
  roomSelect.addEventListener('change', function() {
    handleRoomSelection(this.value, roomDescriptions);
  });
  
  // Make select room function available globally
  window.selectRoom = function(roomId) {
    roomSelect.value = roomId;
    roomSelect.dispatchEvent(new Event('change'));
    
    document.querySelector('.booking-form').scrollIntoView({ behavior: 'smooth' });
  };
}

function handleRoomSelection(roomId, roomDescriptions) {
  const description = roomDescriptions[roomId] || '';
  const descriptionElement = document.getElementById('roomDescription');
  
  if (description) {
    descriptionElement.textContent = description;
    descriptionElement.classList.remove('hidden');
  } else {
    descriptionElement.classList.add('hidden');
  }
  
  if (roomId) {
    loadEntryPoints(roomId);
  } else {
    const entrySelect = document.getElementById('entryPoint');
    entrySelect.innerHTML = '<option value="" disabled selected>Select an entry point</option>';
  }
}

function loadEntryPoints(roomId) {
  console.log("Loading entry points for room:", roomId);
  
  const entryPointContainer = document.getElementById('entryPointContainer');
  entryPointContainer.classList.add('animate-pulse');
  
  fetch(`/api/get_entry_points.php?room_id=${roomId}`)
    .then(response => {
      console.log("Entry points API response status:", response.status);
      return response.json();
    })
    .then(data => {
      console.log("Entry points API data:", data);
      entryPointContainer.classList.remove('animate-pulse');
      
      const entrySelect = document.getElementById('entryPoint');
      entrySelect.innerHTML = '<option value="" disabled selected>Select an entry point</option>';
      
      if (data.success && data.entry_points && data.entry_points.length > 0) {
        data.entry_points.forEach(entry => {
          const option = document.createElement('option');
          option.value = entry.id;
          option.textContent = entry.name;
          if (entry.description) {
            option.title = entry.description;
          }
          entrySelect.appendChild(option);
        });
        
        document.getElementById('pinPositionContainer').style.display = 'block';
        document.getElementById('pinCodeContainer').style.display = 'block';
      } else {
        console.error('No entry points found for this room');
        showToast('error', 'No Entry Points', 'No entry points available for this room.');
        
        // Add a default "No entry points available" option
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No entry points available";
        option.disabled = true;
        option.selected = true;
        entrySelect.appendChild(option);
      }
    })
    .catch(error => {
      entryPointContainer.classList.remove('animate-pulse');
      console.error('Error loading entry points:', error);
      showToast('error', 'Error', 'Failed to load entry points. Please try again.');
    });
}

function setupEventListeners() {
  // PIN position and code containers are visible by default
  document.getElementById('pinPositionContainer').style.display = 'block';
  document.getElementById('pinCodeContainer').style.display = 'block';
  
  // Generate PIN code button handler
  document.getElementById('generatePinButton').addEventListener('click', generatePinCode);
  
  // Form submission handler
  document.getElementById('bookingForm').addEventListener('submit', handleFormSubmission);
  
  // Modal close button handler
  document.getElementById('closeModal').addEventListener('click', function() {
    document.getElementById('successModal').classList.add('hidden');
  });
}

function generatePinCode() {
  console.log("Generating PIN code");
  const formData = new FormData();
  formData.append('length', '4');
  
  // Show loading state
  const button = this;
  const originalText = button.textContent;
  button.textContent = "Generating...";
  button.disabled = true;
  
  fetch('/api/generate_pin.php', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    console.log("Generate PIN API response status:", response.status);
    return response.json();
  })
  .then(data => {
    console.log("Generate PIN API data:", data);
    button.textContent = originalText;
    button.disabled = false;
    
    if (data.success) {
      document.getElementById('pinCode').value = data.pin_code;
      showToast('success', 'PIN Generated', `Your PIN code ${data.pin_code} has been generated.`);
    } else {
      // If API fails, generate a PIN locally
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
      document.getElementById('pinCode').value = pinCode;
      showToast('success', 'PIN Generated', `Your PIN code ${pinCode} has been generated.`);
    }
  })
  .catch(error => {
    console.error('Error generating PIN:', error);
    button.textContent = originalText;
    button.disabled = false;
    
    // Generate a PIN locally in case of API failure
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('pinCode').value = pinCode;
    showToast('success', 'PIN Generated', `Your PIN code ${pinCode} has been generated.`);
  });
}

function handleFormSubmission(e) {
  e.preventDefault();
  
  const submitButton = document.getElementById('submitButton');
  const formData = new FormData(this);
  
  console.log("Form submission - room:", formData.get('room'));
  console.log("Form submission - entryPoint:", formData.get('entryPoint'));
  console.log("Form submission - pinPosition:", formData.get('pinPosition'));
  console.log("Form submission - pinCode:", formData.get('pinCode'));
  
  const arrival = new Date(formData.get('arrivalDateTime'));
  const departure = new Date(formData.get('departureDateTime'));
  
  if (departure <= arrival) {
    showToast('error', 'Invalid Dates', 'Departure date must be after arrival date.');
    return;
  }
  
  if (!formData.get('entryPoint')) {
    showToast('error', 'Missing Information', 'Please select an entry point for access.');
    return;
  }
  
  if (!formData.get('pinPosition')) {
    showToast('error', 'Missing Information', 'Please select a PIN position.');
    return;
  }
  
  if (!formData.get('pinCode')) {
    showToast('error', 'Missing Information', 'Please enter or generate a PIN code.');
    return;
  }
  
  if (!/^\d{4,6}$/.test(formData.get('pinCode'))) {
    showToast('error', 'Invalid PIN', 'PIN code must be 4-6 digits.');
    return;
  }
  
  submitButton.disabled = true;
  submitButton.innerHTML = `
    <span class="mr-2">Processing</span>
    <svg class="inline-block animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `;
  
  fetch('/api/process_booking.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    submitButton.disabled = false;
    submitButton.textContent = 'Create Booking';
    
    if (data.success) {
      document.getElementById('accessCode').textContent = data.data.accessCode;
      document.getElementById('successModal').classList.remove('hidden');
      
      document.getElementById('bookingForm').reset();
      
      // Reset date inputs
      initializeDateInputs();
    } else {
      showToast('error', 'Booking Failed', data.message || 'There was an error creating your booking. Please try again.');
    }
  })
  .catch(error => {
    console.error('Error processing booking:', error);
    submitButton.disabled = false;
    submitButton.textContent = 'Create Booking';
    showToast('error', 'Error', 'There was an error processing your request. Please try again.');
  });
}
