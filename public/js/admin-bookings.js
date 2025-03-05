document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if bookings section exists
  if (!document.getElementById('bookingsSection')) return;
  
  // Clone the template content to the bookings section
  const bookingsTemplate = document.getElementById('bookingsTemplate');
  const bookingsSection = document.getElementById('bookingsSection');
  if (bookingsTemplate && bookingsSection) {
    bookingsSection.appendChild(bookingsTemplate.content.cloneNode(true));
  }
  
  // Initialize date picker
  const datePicker = document.getElementById('date');
  if (datePicker && window.flatpickr) {
    flatpickr(datePicker, {
      dateFormat: "Y-m-d",
      defaultDate: new Date(),
      onChange: function(selectedDates) {
        loadBookings(selectedDates[0]);
      }
    });
  }
  
  // Refresh buttons
  const refreshButton = document.getElementById('refreshButton');
  const refreshEmptyButton = document.getElementById('refreshEmptyButton');
  
  if (refreshButton) {
    refreshButton.addEventListener('click', function() {
      const date = document.getElementById('date').value;
      loadBookings(new Date(date));
    });
  }
  
  if (refreshEmptyButton) {
    refreshEmptyButton.addEventListener('click', function() {
      const date = document.getElementById('date').value;
      loadBookings(new Date(date));
    });
  }
  
  // Room filter change
  const roomFilter = document.getElementById('room-filter');
  if (roomFilter) {
    roomFilter.addEventListener('change', function() {
      const date = document.getElementById('date').value;
      loadBookings(new Date(date));
    });
    
    // Load available rooms into filter
    loadRooms();
  }
  
  // Search input
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const date = document.getElementById('date').value;
      loadBookings(new Date(date));
    });
  }
  
  // Load initial bookings
  loadBookings(new Date());
  
  // Functions
  function loadRooms() {
    // Simulating API call to get rooms
    setTimeout(() => {
      const rooms = [
        { id: 'room1', name: 'Room 1' },
        { id: 'room2', name: 'Room 2' },
        { id: 'room3', name: 'Room 3' },
        { id: 'room4', name: 'Room 4' },
        { id: 'room5', name: 'Room 5' }
      ];
      
      const roomFilter = document.getElementById('room-filter');
      if (roomFilter) {
        // Keep the "All Rooms" option
        roomFilter.innerHTML = '<option value="all">All Rooms</option>';
        
        // Add room options
        rooms.forEach(room => {
          const option = document.createElement('option');
          option.value = room.id;
          option.textContent = room.name;
          roomFilter.appendChild(option);
        });
      }
    }, 500);
  }
  
  function loadBookings(date) {
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const bookingsContainer = document.getElementById('bookingsContainer');
    const roomFilter = document.getElementById('room-filter');
    const searchInput = document.getElementById('search');
    
    if (!bookingsTableBody || !emptyState || !loadingState || !bookingsContainer) return;
    
    // Show loading state
    bookingsContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    // Get filter values
    const roomId = roomFilter ? roomFilter.value : 'all';
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';
    
    // Simulate API call to get bookings
    setTimeout(() => {
      // Sample bookings data
      const allBookings = [
        {
          id: 1,
          roomId: 'room1',
          roomName: 'Room 1',
          guestName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          accessCode: '123456',
          checkIn: '2023-06-15 14:00',
          checkOut: '2023-06-17 10:00'
        },
        {
          id: 2,
          roomId: 'room2',
          roomName: 'Room 2',
          guestName: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 987-6543',
          accessCode: '654321',
          checkIn: '2023-06-16 15:00',
          checkOut: '2023-06-18 11:00'
        },
        {
          id: 3,
          roomId: 'room3',
          roomName: 'Room 3',
          guestName: 'Bob Johnson',
          email: 'bob.johnson@example.com',
          phone: '+1 (555) 555-5555',
          accessCode: '112233',
          checkIn: '2023-06-17 13:00',
          checkOut: '2023-06-19 09:00'
        }
      ];
      
      // Filter bookings based on room and search
      let filteredBookings = allBookings;
      
      if (roomId !== 'all') {
        filteredBookings = filteredBookings.filter(booking => booking.roomId === roomId);
      }
      
      if (searchQuery) {
        filteredBookings = filteredBookings.filter(booking => 
          booking.guestName.toLowerCase().includes(searchQuery) || 
          booking.accessCode.includes(searchQuery)
        );
      }
      
      // Hide loading state
      loadingState.classList.add('hidden');
      
      if (filteredBookings.length === 0) {
        // Show empty state
        emptyState.classList.remove('hidden');
      } else {
        // Show bookings and populate table
        bookingsContainer.classList.remove('hidden');
        
        // Clear previous bookings
        bookingsTableBody.innerHTML = '';
        
        // Add bookings to table
        filteredBookings.forEach(booking => {
          const row = document.createElement('tr');
          
          row.innerHTML = `
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">${booking.roomName}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">${booking.guestName}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap hidden md:table-cell">
              <div class="text-sm text-gray-900">${booking.email}</div>
              <div class="text-sm text-gray-500">${booking.phone}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                ${booking.accessCode}
              </span>
            </td>
            <td class="px-4 py-4 whitespace-nowrap hidden md:table-cell">
              <div class="text-sm text-gray-900">${booking.checkIn}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap hidden md:table-cell">
              <div class="text-sm text-gray-900">${booking.checkOut}</div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-blue-600 hover:text-blue-900 mr-2" data-booking-id="${booking.id}" data-action="edit">Edit</button>
              <button class="text-red-600 hover:text-red-900" data-booking-id="${booking.id}" data-action="delete">Delete</button>
            </td>
          `;
          
          bookingsTableBody.appendChild(row);
        });
        
        // Add event listeners to edit and delete buttons
        const actionButtons = bookingsTableBody.querySelectorAll('[data-action]');
        actionButtons.forEach(button => {
          button.addEventListener('click', function() {
            const bookingId = this.getAttribute('data-booking-id');
            const action = this.getAttribute('data-action');
            
            if (action === 'edit') {
              // Edit booking logic
              showToast('info', 'Edit Booking', `Editing booking #${bookingId}`);
            } else if (action === 'delete') {
              // Delete booking logic
              if (confirm('Are you sure you want to delete this booking?')) {
                showToast('success', 'Booking Deleted', `Booking #${bookingId} has been deleted`);
                
                // Remove the row from the table
                const row = this.closest('tr');
                if (row) {
                  row.remove();
                }
                
                // If no more bookings, show empty state
                if (bookingsTableBody.children.length === 0) {
                  bookingsContainer.classList.add('hidden');
                  emptyState.classList.remove('hidden');
                }
              }
            }
          });
        });
      }
    }, 1000); // Simulate loading delay
  }
});
