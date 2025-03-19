// Booking form functionality
document.addEventListener('DOMContentLoaded', function() {
  console.log("Booking form script loaded");
  
  // Wait a bit to ensure all components are loaded
  setTimeout(function() {
    // Initialize date inputs with default values
    initializeDateInputs();
    
    // Load rooms from API
    loadRooms();
    
    // Set up event listeners
    setupEventListeners();
  }, 1000); // Give components more time to load
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
  const roomsContainer = document.getElementById('roomsContainer');
  const roomSelect = document.getElementById('room');
  
  if (!roomSelect) {
    console.log("Room select element not found, will try again later");
    setTimeout(loadRooms, 500);
    return;
  }
  
  // Use the populateRoomSelects function from rooms-data.js if available
  if (typeof window.populateRoomSelects === 'function') {
    window.populateRoomSelects();
    return;
  }
  
  // Use the fetchRoomsData function from rooms-data.js if available
  if (typeof window.fetchRoomsData === 'function') {
    window.fetchRoomsData()
      .then(rooms => {
        if (Array.isArray(rooms) && rooms.length > 0) {
          populateRooms(rooms);
        } else {
          console.error('No rooms returned from API');
          if (window.showToastMessage) {
            window.showToastMessage('error', 'Failed to load rooms. Please try again later.');
          }
          if (roomsContainer) {
            roomsContainer.innerHTML = 
              '<div class="col-span-full text-center text-red-500">Failed to load rooms. Please refresh the page.</div>';
          }
        }
      })
      .catch(error => {
        console.error('Error loading rooms:', error);
        if (window.showToastMessage) {
          window.showToastMessage('error', 'Failed to load rooms. Please try again later.');
        }
        if (roomsContainer) {
          roomsContainer.innerHTML = 
            '<div class="col-span-full text-center text-red-500">Failed to load rooms. Please refresh the page.</div>';
        }
        
        // Provide fallback demo room data
        const fallbackRooms = [
          {
            id: 'demo1',
            name: 'Demo Single Room',
            description: 'A comfortable single room perfect for solo travelers.'
          },
          {
            id: 'demo2',
            name: 'Demo Double Room',
            description: 'Spacious double room with king-size bed.'
          },
          {
            id: 'demo3',
            name: 'Demo Suite',
            description: 'Luxury suite with separate living area and bedroom.'
          }
        ];
        
        populateRooms(fallbackRooms);
      });
  } else {
    // Fallback to direct API call if fetchRoomsData is not available
    fetch('/api/get_rooms.php')
      .then(response => {
        console.log("Room API response status:", response.status);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.text().then(text => {
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error("Invalid JSON response:", text);
            throw new Error("Server returned invalid JSON response");
          }
        });
      })
      .then(data => {
        console.log("Room API data:", data);
        if (data.success && data.rooms) {
          populateRooms(data.rooms);
        } else {
          console.error('Failed to load rooms:', data.message);
          if (window.showToastMessage) {
            window.showToastMessage('error', 'Failed to load rooms. Please try again later.');
          }
          if (roomsContainer) {
            roomsContainer.innerHTML = 
              '<div class="col-span-full text-center text-red-500">Failed to load rooms. Please refresh the page.</div>';
          }
        }
      })
      .catch(error => {
        console.error('Error loading rooms:', error);
        if (window.showToastMessage) {
          window.showToastMessage('error', 'Failed to load rooms. Please try again later.');
        }
        if (roomsContainer) {
          roomsContainer.innerHTML = 
            '<div class="col-span-full text-center text-red-500">Failed to load rooms. Please refresh the page.</div>';
        }
        
        // Provide fallback demo room data
        const fallbackRooms = [
          {
            id: 'demo1',
            name: 'Demo Single Room',
            description: 'A comfortable single room perfect for solo travelers.'
          },
          {
            id: 'demo2',
            name: 'Demo Double Room',
            description: 'Spacious double room with king-size bed.'
          },
          {
            id: 'demo3',
            name: 'Demo Suite',
            description: 'Luxury suite with separate living area and bedroom.'
          }
        ];
        
        populateRooms(fallbackRooms);
      });
  }
}

function populateRooms(rooms) {
  const roomSelect = document.getElementById('room');
  const roomsContainer = document.getElementById('roomsContainer');
  
  if (!roomSelect) {
    console.error("Room select element not found for populating rooms");
    return;
  }
  
  // Clear any existing options except the first placeholder
  while (roomSelect.options.length > 1) {
    roomSelect.remove(1);
  }
  
  if (rooms.length === 0) {
    if (roomsContainer) {
      roomsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500">No rooms available at the moment.</div>';
    }
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
  });
  
  // Add room selection handler
  roomSelect.addEventListener('change', function() {
    handleRoomSelection(this.value, roomDescriptions);
  });
  
  // Make select room function available globally
  window.selectRoom = function(roomId) {
    roomSelect.value = roomId;
    roomSelect.dispatchEvent(new Event('change'));
    
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
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
        if (window.showToastMessage) {
          window.showToastMessage('error', 'No Entry Points', 'No entry points available for this room.');
        }
        
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
      if (window.showToastMessage) {
        window.showToastMessage('error', 'Error', 'Failed to load entry points. Please try again.');
      }
    });
}

function setupEventListeners() {
  console.log("Setting up event listeners");
  
  // Check if elements exist before adding event listeners
  const pinPositionContainer = document.getElementById('pinPositionContainer');
  const pinCodeContainer = document.getElementById('pinCodeContainer');
  const generatePinButton = document.getElementById('generatePinButton');
  const bookingForm = document.getElementById('bookingForm');
  const closeModal = document.getElementById('closeModal');
  
  // Only set display if elements exist
  if (pinPositionContainer) {
    pinPositionContainer.style.display = 'block';
  }
  
  if (pinCodeContainer) {
    pinCodeContainer.style.display = 'block';
  }
  
  // Generate PIN code button handler
  if (generatePinButton) {
    generatePinButton.addEventListener('click', generatePinCode);
  }
  
  // Form submission handler
  if (bookingForm) {
    bookingForm.addEventListener('submit', handleFormSubmission);
  }
  
  // Modal close button handler
  if (closeModal) {
    closeModal.addEventListener('click', function() {
      const successModal = document.getElementById('successModal');
      if (successModal) {
        successModal.classList.add('hidden');
      }
    });
  }
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
      if (window.showToastMessage) {
        window.showToastMessage('success', 'PIN Generated', `Your PIN code ${data.pin_code} has been generated.`);
      }
    } else {
      // If API fails, generate a PIN locally
      const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
      document.getElementById('pinCode').value = pinCode;
      if (window.showToastMessage) {
        window.showToastMessage('success', 'PIN Generated', `Your PIN code ${pinCode} has been generated.`);
      }
    }
  })
  .catch(error => {
    console.error('Error generating PIN:', error);
    button.textContent = originalText;
    button.disabled = false;
    
    // Generate a PIN locally in case of API failure
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('pinCode').value = pinCode;
    if (window.showToastMessage) {
      window.showToastMessage('success', 'PIN Generated', `Your PIN code ${pinCode} has been generated.`);
    }
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
    if (window.showToastMessage) {
      window.showToastMessage('error', 'Invalid Dates', 'Departure date must be after arrival date.');
    }
    return;
  }
  
  if (!formData.get('entryPoint')) {
    if (window.showToastMessage) {
      window.showToastMessage('error', 'Missing Information', 'Please select an entry point for access.');
    }
    return;
  }
  
  if (!formData.get('pinPosition')) {
    if (window.showToastMessage) {
      window.showToastMessage('error', 'Missing Information', 'Please select a PIN position.');
    }
    return;
  }
  
  if (!formData.get('pinCode')) {
    if (window.showToastMessage) {
      window.showToastMessage('error', 'Missing Information', 'Please enter or generate a PIN code.');
    }
    return;
  }
  
  if (!/^\d{4,6}$/.test(formData.get('pinCode'))) {
    if (window.showToastMessage) {
      window.showToastMessage('error', 'Invalid PIN', 'PIN code must be 4-6 digits.');
    }
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
      if (window.showToastMessage) {
        window.showToastMessage('error', 'Booking Failed', data.message || 'There was an error creating your booking. Please try again.');
      }
    }
  })
  .catch(error => {
    console.error('Error processing booking:', error);
    submitButton.disabled = false;
    submitButton.textContent = 'Create Booking';
    if (window.showToastMessage) {
      window.showToastMessage('error', 'Error', 'There was an error processing your request. Please try again.');
    }
  });
}
