
// Initialize bookings data and UI elements
let bookingsData = [];
let selectedDate = new Date().toISOString().split('T')[0];
let selectedRoom = 'all';
let searchTerm = '';

function initBookingsSection() {
  // If section already initialized, just refresh data
  if (document.getElementById('bookingsTable')) {
    fetchBookings();
    return;
  }
  
  // Create bookings UI from template
  const bookingsContainer = document.getElementById('bookingsSection');
  bookingsContainer.innerHTML = `
    <div class="backdrop-blur-sm bg-white/90 border shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="bg-blue-50 border-b p-6">
        <h2 class="text-xl font-semibold">Bookings Summary</h2>
        <p class="text-sm text-gray-500 mt-1">View and manage all bookings for the selected date</p>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <!-- Date Selection -->
          <div class="space-y-2">
            <label for="date" class="block text-sm font-medium text-gray-700">Select Date</label>
            <input type="text" id="date" class="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          
          <!-- Room Selection -->
          <div class="space-y-2">
            <label for="room-filter" class="block text-sm font-medium text-gray-700">Filter by Room</label>
            <select id="room-filter" class="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">All Rooms</option>
              <option value="room1">Room 1</option>
              <option value="room2">Room 2</option>
              <option value="room3">Room 3</option>
              <option value="room4">Room 4</option>
              <option value="room5">Room 5</option>
            </select>
          </div>
          
          <!-- Search -->
          <div class="space-y-2">
            <label for="search" class="block text-sm font-medium text-gray-700">Search by Name or Code</label>
            <div class="relative">
              <svg xmlns="http://www.w3.org/2000/svg" class="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" id="search" class="w-full h-11 pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search bookings...">
            </div>
          </div>
        </div>
        
        <div class="flex justify-end mb-4">
          <button id="refreshButton" class="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <svg id="refreshIcon" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
        
        <div id="bookingsContainer" class="rounded-md border overflow-hidden">
          <table id="bookingsTable" class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Contact</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Access Code</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Check-in</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Check-out</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody id="bookingsTableBody" class="bg-white divide-y divide-gray-200">
              <!-- Bookings will be populated here by JavaScript -->
            </tbody>
          </table>
        </div>
        
        <!-- Empty state -->
        <div id="emptyState" class="hidden flex flex-col items-center justify-center py-12 text-center">
          <div class="rounded-full bg-blue-100 p-3 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium mb-1">No bookings found</h3>
          <p class="text-gray-500 mb-4">
            There are no bookings for the selected date and filters.
          </p>
          <button id="refreshEmptyButton" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
            Refresh Data
          </button>
        </div>
        
        <!-- Loading state -->
        <div id="loadingState" class="hidden h-[300px] flex items-center justify-center">
          <div class="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-blue-600 animate-spin mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p class="text-gray-500">Loading bookings...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Initialize date picker
  if (typeof flatpickr !== 'undefined') {
    flatpickr('#date', {
      dateFormat: 'Y-m-d',
      defaultDate: selectedDate,
      onChange: function(selectedDates, dateStr) {
        selectedDate = dateStr;
        fetchBookings();
      }
    });
  } else {
    // Fallback if flatpickr not loaded
    const dateInput = document.getElementById('date');
    dateInput.value = selectedDate;
    dateInput.addEventListener('change', function() {
      selectedDate = this.value;
      fetchBookings();
    });
  }
  
  // Initialize room filter
  const roomFilter = document.getElementById('room-filter');
  roomFilter.addEventListener('change', function() {
    selectedRoom = this.value;
    renderBookings();
  });
  
  // Initialize search
  const searchInput = document.getElementById('search');
  searchInput.addEventListener('input', function() {
    searchTerm = this.value.toLowerCase();
    renderBookings();
  });
  
  // Initialize refresh button
  const refreshButton = document.getElementById('refreshButton');
  refreshButton.addEventListener('click', fetchBookings);
  
  const refreshEmptyButton = document.getElementById('refreshEmptyButton');
  if (refreshEmptyButton) {
    refreshEmptyButton.addEventListener('click', fetchBookings);
  }
  
  // Fetch initial bookings data
  fetchBookings();
}

// Fetch bookings from API or mock data
async function fetchBookings() {
  showLoadingState();
  
  try {
    // For demonstration purposes, we'll use mock data
    // In production, replace this with a real API call
    // const response = await apiCall('/api/get_bookings.php?date=' + selectedDate);
    // bookingsData = response.bookings;
    
    // Mock data
    setTimeout(() => {
      bookingsData = [
        {
          id: 1,
          room: 'Room 1',
          roomId: 'room1',
          guestName: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567',
          arrivalDateTime: '2023-08-01 14:00:00',
          departureDateTime: '2023-08-03 11:00:00',
          accessCode: '123456'
        },
        {
          id: 2,
          room: 'Room 2',
          roomId: 'room2',
          guestName: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+1 (555) 987-6543',
          arrivalDateTime: '2023-08-01 15:00:00',
          departureDateTime: '2023-08-02 10:00:00',
          accessCode: '654321'
        },
        {
          id: 3,
          room: 'Room 3',
          roomId: 'room3',
          guestName: 'Robert Johnson',
          email: 'robert.j@example.com',
          phone: '+1 (555) 456-7890',
          arrivalDateTime: '2023-08-01 16:00:00',
          departureDateTime: '2023-08-05 09:00:00',
          accessCode: '987654'
        }
      ];
      
      renderBookings();
    }, 1000); // Simulate API delay
  } catch (error) {
    showEmptyState();
    showToast('Error', 'Failed to fetch bookings data', 'error');
  }
}

// Render bookings table
function renderBookings() {
  // Filter bookings
  let filteredBookings = bookingsData;
  
  if (selectedRoom !== 'all') {
    filteredBookings = filteredBookings.filter(booking => booking.roomId === selectedRoom);
  }
  
  if (searchTerm) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.guestName.toLowerCase().includes(searchTerm) || 
      booking.accessCode.toLowerCase().includes(searchTerm)
    );
  }
  
  const tableBody = document.getElementById('bookingsTableBody');
  const emptyState = document.getElementById('emptyState');
  const bookingsContainer = document.getElementById('bookingsContainer');
  const loadingState = document.getElementById('loadingState');
  
  // Hide loading state
  loadingState.classList.add('hidden');
  
  // Show empty state if no bookings
  if (filteredBookings.length === 0) {
    bookingsContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  
  // Show bookings table
  bookingsContainer.classList.remove('hidden');
  emptyState.classList.add('hidden');
  
  // Render bookings
  tableBody.innerHTML = '';
  
  filteredBookings.forEach(booking => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    row.innerHTML = `
      <td class="px-4 py-3 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${booking.room}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${booking.guestName}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap hidden md:table-cell">
        <div class="text-sm text-gray-500">${booking.email}</div>
        <div class="text-sm text-gray-500">${booking.phone}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <span class="px-2 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          ${booking.accessCode}
        </span>
      </td>
      <td class="px-4 py-3 whitespace-nowrap hidden md:table-cell">
        <div class="text-sm text-gray-500">${formatDate(booking.arrivalDateTime)}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap hidden md:table-cell">
        <div class="text-sm text-gray-500">${formatDate(booking.departureDateTime)}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div class="flex justify-end space-x-2">
          <button 
            data-booking-id="${booking.id}" 
            class="edit-booking-btn text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-md hover:bg-indigo-50"
          >
            Edit
          </button>
          <button 
            data-booking-id="${booking.id}" 
            class="resend-code-btn text-green-600 hover:text-green-900 px-2 py-1 rounded-md hover:bg-green-50"
          >
            Resend Code
          </button>
          <button 
            data-booking-id="${booking.id}" 
            class="delete-booking-btn text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.edit-booking-btn').forEach(button => {
    button.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      editBooking(bookingId);
    });
  });
  
  document.querySelectorAll('.resend-code-btn').forEach(button => {
    button.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      resendCode(bookingId);
    });
  });
  
  document.querySelectorAll('.delete-booking-btn').forEach(button => {
    button.addEventListener('click', function() {
      const bookingId = this.getAttribute('data-booking-id');
      deleteBooking(bookingId);
    });
  });
}

// Show loading state
function showLoadingState() {
  document.getElementById('loadingState').classList.remove('hidden');
  document.getElementById('bookingsContainer').classList.add('hidden');
  document.getElementById('emptyState').classList.add('hidden');
}

// Show empty state
function showEmptyState() {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('bookingsContainer').classList.add('hidden');
  document.getElementById('emptyState').classList.remove('hidden');
}

// Edit booking
function editBooking(bookingId) {
  // Find booking
  const booking = bookingsData.find(b => b.id == bookingId);
  if (!booking) return;
  
  // Show success toast
  showToast(
    'Edit Booking', 
    `Editing booking for ${booking.guestName}`,
    'info'
  );
}

// Resend code
function resendCode(bookingId) {
  // Find booking
  const booking = bookingsData.find(b => b.id == bookingId);
  if (!booking) return;
  
  // Show success toast
  showToast(
    'Code Resent', 
    `Passcode ${booking.accessCode} has been resent to ${booking.guestName}`,
    'success'
  );
}

// Delete booking
function deleteBooking(bookingId) {
  // Find booking
  const booking = bookingsData.find(b => b.id == bookingId);
  if (!booking) return;
  
  // Confirm deletion
  if (confirm(`Are you sure you want to delete the booking for ${booking.guestName}?`)) {
    // Remove from array
    bookingsData = bookingsData.filter(b => b.id != bookingId);
    
    // Re-render
    renderBookings();
    
    // Show success toast
    showToast(
      'Booking Deleted', 
      `Booking for ${booking.guestName} has been deleted`,
      'success'
    );
  }
}
