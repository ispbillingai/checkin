
document.addEventListener('DOMContentLoaded', function() {
  // Initialize bookings section
  initBookingsSection();
  
  function initBookingsSection() {
    // Get template content
    const template = document.getElementById('bookingsTemplate');
    const bookingsSection = document.getElementById('bookingsSection');
    
    // Clone template content and append to section
    const content = template.content.cloneNode(true);
    bookingsSection.appendChild(content);
    
    // Initialize date picker after content is appended
    const datePicker = flatpickr("#date", {
      dateFormat: "Y-m-d",
      defaultDate: "today",
      onChange: function(selectedDates) {
        loadBookings();
      }
    });
    
    // DOM elements
    const roomFilter = document.getElementById('room-filter');
    const searchInput = document.getElementById('search');
    const refreshButton = document.getElementById('refreshButton');
    const refreshEmptyButton = document.getElementById('refreshEmptyButton');
    const bookingsContainer = document.getElementById('bookingsContainer');
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    
    // Event listeners
    refreshButton.addEventListener('click', loadBookings);
    refreshEmptyButton.addEventListener('click', loadBookings);
    roomFilter.addEventListener('change', filterBookings);
    searchInput.addEventListener('input', filterBookings);
    
    // Initial load
    loadBookings();
    
    // Load bookings function
    function loadBookings() {
      // Show loading state
      bookingsContainer.classList.add('hidden');
      emptyState.classList.add('hidden');
      loadingState.classList.remove('hidden');
      
      // Start spinner animation
      const refreshIcon = document.getElementById('refreshIcon');
      refreshIcon.classList.add('animate-spin');
      
      // Get selected date
      const selectedDate = datePicker.selectedDates[0];
      const formattedDate = selectedDate ? formatDate(selectedDate) : formatDate(new Date());
      
      // Simulate API call (replace with actual fetch to PHP backend)
      setTimeout(() => {
        // Generate mock bookings
        const bookings = generateMockBookings(selectedDate || new Date());
        
        // Update UI with bookings
        updateBookingsTable(bookings);
        
        // Stop spinner animation
        refreshIcon.classList.remove('animate-spin');
        
        // Show toast notification
        showToast('success', 'Data refreshed', 'Booking data has been updated.');
      }, 1000);
    }
    
    // Filter bookings function
    function filterBookings() {
      const selectedRoom = roomFilter.value;
      const searchQuery = searchInput.value.toLowerCase();
      
      // Get all rows
      const rows = bookingsTableBody.querySelectorAll('tr');
      
      let visibleCount = 0;
      
      // Filter rows
      rows.forEach(row => {
        const roomId = row.getAttribute('data-room-id');
        const guestName = row.getAttribute('data-guest-name').toLowerCase();
        const accessCode = row.getAttribute('data-access-code');
        
        const matchesRoom = selectedRoom === 'all' || roomId === selectedRoom;
        const matchesSearch = searchQuery === '' || 
          guestName.includes(searchQuery) || 
          accessCode.includes(searchQuery);
        
        if (matchesRoom && matchesSearch) {
          row.classList.remove('hidden');
          visibleCount++;
        } else {
          row.classList.add('hidden');
        }
      });
      
      // Show empty state if no visible bookings
      if (visibleCount === 0) {
        bookingsContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
      } else {
        bookingsContainer.classList.remove('hidden');
        emptyState.classList.add('hidden');
      }
    }
    
    // Update bookings table
    function updateBookingsTable(bookings) {
      // Clear table
      bookingsTableBody.innerHTML = '';
      
      // Hide loading state
      loadingState.classList.add('hidden');
      
      // Check if empty
      if (bookings.length === 0) {
        bookingsContainer.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
      }
      
      // Show table and hide empty state
      bookingsContainer.classList.remove('hidden');
      emptyState.classList.add('hidden');
      
      // Add bookings to table
      bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        row.setAttribute('data-room-id', booking.roomId);
        row.setAttribute('data-guest-name', booking.guestName);
        row.setAttribute('data-access-code', booking.accessCode);
        
        row.innerHTML = `
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="font-medium text-gray-900">${booking.room}</div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="text-gray-900">${booking.guestName}</div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap hidden md:table-cell">
            <div class="text-sm text-gray-500">
              <div>${booking.email}</div>
              <div>${booking.phone}</div>
            </div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap">
            <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ${booking.accessCode}
            </div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap hidden md:table-cell">
            <div class="text-sm text-gray-500">${formatTime(booking.arrivalDateTime)}</div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap hidden md:table-cell">
            <div class="text-sm text-gray-500">${formatTime(booking.departureDateTime)}</div>
          </td>
          <td class="px-4 py-4 whitespace-nowrap text-right">
            <button class="text-gray-400 hover:text-gray-500 focus:outline-none" onclick="printBooking('${booking.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </td>
        `;
        
        bookingsTableBody.appendChild(row);
      });
    }
  }
  
  // Helper functions for bookings
  // Generate mock bookings
  window.generateMockBookings = function(date) {
    const roomNames = ["Room 1", "Room 2", "Room 3", "Room 4", "Room 5"];
    const formattedDate = formatDate(date);
    
    return Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => {
      const roomIndex = Math.floor(Math.random() * roomNames.length);
      const arrivalHour = Math.floor(Math.random() * 12) + 8;
      const departureHour = arrivalHour + Math.floor(Math.random() * 8) + 2;
      
      return {
        id: `booking-${i}-${formattedDate}`,
        room: roomNames[roomIndex],
        roomId: `room${roomIndex + 1}`,
        guestName: `Guest ${i + 1}`,
        email: `guest${i + 1}@example.com`,
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        arrivalDateTime: `${formattedDate} ${arrivalHour < 10 ? `0${arrivalHour}` : arrivalHour}:00`,
        departureDateTime: `${formattedDate} ${departureHour < 10 ? `0${departureHour}` : departureHour}:00`,
        accessCode: Math.floor(100000 + Math.random() * 900000).toString(),
      };
    });
  };
  
  // Print booking function
  window.printBooking = function(bookingId) {
    // In a real implementation, you would fetch the booking details from the server
    // For demo purposes, we'll just show a success message
    showToast('success', 'Printing booking details...', 'The booking information has been sent to the printer.');
    console.log("Printing booking:", bookingId);
  };
});
