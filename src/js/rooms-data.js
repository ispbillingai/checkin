
/**
 * Room data fetching and rendering utility - No logging version
 */

// Store rooms data globally to share between components
window.roomsData = window.roomsData || {
  rooms: null,
  isLoading: false,
  hasLoaded: false,
  error: null
};

// Function to fetch rooms data with enhanced error handling
function fetchRoomsData() {
  // If we're already loading, return the existing promise
  if (window.roomsData.isLoading) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!window.roomsData.isLoading) {
          clearInterval(checkInterval);
          resolve(window.roomsData.rooms || getDemoRooms());
        }
      }, 100);
    });
  }
  
  // If we already have rooms data, return it
  if (window.roomsData.hasLoaded && window.roomsData.rooms) {
    return Promise.resolve(window.roomsData.rooms);
  }
  
  // Set loading state
  window.roomsData.isLoading = true;
  
  return fetch('/api/get_rooms.php')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      try {
        // Try to parse as JSON
        const data = JSON.parse(text);
        if (data.success) {
          window.roomsData.rooms = data.rooms;
          window.roomsData.hasLoaded = true;
          return data.rooms;
        } else {
          // If API returns an error message
          throw new Error(data.message || 'Failed to load rooms data');
        }
      } catch (e) {
        // If parsing fails, throw an error
        throw new Error("Server returned invalid JSON response");
      }
    })
    .catch(error => {
      window.roomsData.error = error.message;
      
      // Return demo data as fallback
      const demoRooms = getDemoRooms();
      window.roomsData.rooms = demoRooms;
      window.roomsData.hasLoaded = true;
      
      return demoRooms;
    })
    .finally(() => {
      window.roomsData.isLoading = false;
    });
}

// Function to get demo rooms data
function getDemoRooms() {
  return [
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
}

// Function to render rooms into the container
function renderRooms(rooms) {
  const roomsContainer = document.getElementById('roomsContainer');
  if (!roomsContainer) {
    // Try again after a short delay if possible
    setTimeout(() => {
      const retryContainer = document.getElementById('roomsContainer');
      if (retryContainer) {
        renderRoomsToContainer(retryContainer, rooms);
      }
    }, 500);
    return;
  }
  
  renderRoomsToContainer(roomsContainer, rooms);
}

function renderRoomsToContainer(container, rooms) {
  if (!rooms || rooms.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center text-gray-500">No rooms available at the moment.</div>';
    return;
  }
  
  container.innerHTML = '';
  
  rooms.forEach(room => {
    const roomCard = document.createElement('div');
    roomCard.className = "bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1";
    
    roomCard.innerHTML = `
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">${room.name}</h3>
        <p class="text-gray-600 mb-4">${room.description || 'No description available'}</p>
        <button 
          class="book-room-btn bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors w-full" 
          data-room-id="${room.id}" 
          data-room-name="${room.name}"
        >
          Book Now
        </button>
      </div>
    `;
    
    container.appendChild(roomCard);
  });
  
  // Add event listeners to book now buttons
  document.querySelectorAll('.book-room-btn').forEach(button => {
    button.addEventListener('click', function() {
      const roomId = this.getAttribute('data-room-id');
      const roomName = this.getAttribute('data-room-name');
      
      // Scroll to booking form
      const bookingForm = document.getElementById('bookingForm');
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: 'smooth' });
        
        // If there's a room select dropdown, set its value
        const roomSelect = document.getElementById('room');
        if (roomSelect) {
          roomSelect.value = roomId;
          
          // Trigger change event to load entry points if needed
          const event = new Event('change');
          roomSelect.dispatchEvent(event);
        }
      }
      
      // Show toast notification
      if (window.showToast) {
        window.showToast('success', 'Room Selected', `${roomName} selected. Please complete the booking form.`);
      } else if (window.showToastMessage) {
        window.showToastMessage('success', `${roomName} selected. Please complete the booking form.`);
      }
    });
  });
}

// Initialize rooms section
function initRoomsSection() {
  // Fetch and render rooms
  fetchRoomsData()
    .then(rooms => {
      renderRooms(rooms);
    });
}

// Populate room select dropdowns from cached data
function populateRoomSelects() {
  const roomSelects = document.querySelectorAll('select[id="room"]');
  if (!roomSelects.length) {
    return;
  }
  
  // Use cached rooms data or fetch new data
  const getRooms = window.roomsData.hasLoaded 
    ? Promise.resolve(window.roomsData.rooms || getDemoRooms())
    : fetchRoomsData();
  
  getRooms.then(rooms => {
    roomSelects.forEach(select => {
      // Clear any existing options except the first placeholder
      while (select.options.length > 1) {
        select.remove(1);
      }
      
      // Add room options
      rooms.forEach(room => {
        const option = document.createElement('option');
        option.value = room.id;
        option.textContent = room.name;
        select.appendChild(option);
      });
    });
  });
}

// Export functions
window.initRoomsSection = initRoomsSection;
window.fetchRoomsData = fetchRoomsData;
window.renderRooms = renderRooms;
window.populateRoomSelects = populateRoomSelects;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on a page with the rooms section
  if (document.getElementById('roomsContainer')) {
    initRoomsSection();
  }
  
  // Check for and populate room select dropdowns
  populateRoomSelects();
});
