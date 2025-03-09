
// Admin Bookings JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log("admin-bookings.js loaded");
    initializeBookingsPage();
});

// Initialize the bookings page component
function initializeBookingsPage() {
    // Wait until the bookings template is loaded
    console.log("Waiting for bookings template to load...");
    
    if (document.getElementById('bookingsSection')) {
        if (document.getElementById('bookingsSection').childElementCount > 0) {
            console.log("Bookings template already loaded, initializing...");
            setupBookingsPage();
        } else {
            console.log("Bookings section exists but template not loaded yet, waiting...");
            // Wait for template to be loaded
            const observer = new MutationObserver(function(mutations) {
                if (document.getElementById('bookingsSection').childElementCount > 0) {
                    console.log("Bookings template loaded, initializing...");
                    observer.disconnect();
                    setupBookingsPage();
                }
            });
            
            observer.observe(document.getElementById('bookingsSection'), { childList: true });
        }
    } else {
        console.warn("Bookings section not found in the DOM");
    }
    
    // Add a global event listener for template loaded events
    window.addEventListener('templateLoaded', function(e) {
        if (e.detail && e.detail.templateId === 'bookings-template') {
            console.log("Bookings template loaded event received, initializing...");
            setupBookingsPage();
        }
    });
}

// Setup the bookings page functionality
function setupBookingsPage() {
    console.log("Setting up bookings page...");
    
    // Get elements
    const dateInput = document.getElementById('booking-date');
    const roomFilter = document.getElementById('room-filter');
    const searchInput = document.getElementById('booking-search');
    const refreshButton = document.getElementById('refreshButton');
    const refreshEmptyButton = document.getElementById('refreshEmptyButton');
    
    if (!dateInput) {
        console.error("Date input element not found!");
        return;
    }
    
    // Set date input to today by default
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    dateInput.value = todayFormatted;
    console.log("Set default date to today:", todayFormatted);
    
    // Load rooms for filter dropdown
    loadRooms();
    
    // Load initial bookings
    loadBookings(todayFormatted, 'all');
    
    // Add event listeners
    if (dateInput) {
        dateInput.addEventListener('change', function() {
            const selectedDate = dateInput.value;
            console.log("Date changed to:", selectedDate);
            loadBookings(selectedDate, roomFilter.value);
        });
    }
    
    if (roomFilter) {
        roomFilter.addEventListener('change', function() {
            const selectedRoom = roomFilter.value;
            console.log("Room filter changed to:", selectedRoom);
            loadBookings(dateInput.value, selectedRoom);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterBookings(searchInput.value);
        });
    }
    
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            console.log("Refresh button clicked");
            loadBookings(dateInput.value, roomFilter.value, true);
        });
    }
    
    if (refreshEmptyButton) {
        refreshEmptyButton.addEventListener('click', function() {
            console.log("Empty state refresh button clicked");
            loadBookings(dateInput.value, roomFilter.value, true);
        });
    }
    
    console.log("Bookings page setup complete");
}

// Load rooms for the filter dropdown
function loadRooms() {
    console.log("Loading rooms for filter dropdown...");
    const roomFilter = document.getElementById('room-filter');
    
    if (!roomFilter) {
        console.error("Room filter element not found!");
        return;
    }
    
    // Show loading state
    roomFilter.innerHTML = '<option value="all">Loading rooms...</option>';
    
    // Fetch rooms from API
    fetch('/api/get_all_rooms.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Rooms loaded:", data);
            
            if (data.success) {
                // Start with the "All Rooms" option
                let options = '<option value="all">All Rooms</option>';
                
                // Add each room as an option
                data.rooms.forEach(room => {
                    options += `<option value="${room.id}">${room.name}</option>`;
                });
                
                // Update the dropdown
                roomFilter.innerHTML = options;
            } else {
                console.error("Error loading rooms:", data.message);
                showToast('error', 'Error', 'Failed to load rooms: ' + data.message);
                roomFilter.innerHTML = '<option value="all">All Rooms</option>';
            }
        })
        .catch(error => {
            console.error("Error fetching rooms:", error);
            showToast('error', 'Error', 'Failed to load rooms');
            roomFilter.innerHTML = '<option value="all">All Rooms</option>';
        });
}

// Load bookings for a specific date and room
function loadBookings(date, roomId = 'all', showLoadingAnimation = false) {
    console.log(`Loading bookings for date: ${date}, room: ${roomId}...`);
    
    // Get elements
    const bookingsTableBody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const bookingsContainer = document.getElementById('bookingsContainer');
    const refreshIcon = document.getElementById('refreshIcon');
    
    if (!bookingsTableBody) {
        console.error("Bookings table body not found!");
        return;
    }
    
    // Show loading state
    if (loadingState && bookingsContainer && emptyState) {
        if (showLoadingAnimation) {
            bookingsContainer.classList.add('hidden');
            emptyState.classList.add('hidden');
            loadingState.classList.remove('hidden');
            
            if (refreshIcon) {
                refreshIcon.classList.add('animate-spin');
            }
        } else {
            bookingsTableBody.innerHTML = '<tr><td colspan="7" class="px-4 py-3 text-center text-gray-500">Loading bookings...</td></tr>';
        }
    }
    
    // Construct URL with parameters
    let url = `/api/get_bookings.php?date=${date}`;
    if (roomId !== 'all') {
        url += `&room=${roomId}`;
    }
    
    console.log("Fetching bookings from URL:", url);
    
    // Fetch bookings from API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Bookings loaded:", data);
            
            // Clear loading animation
            if (refreshIcon) {
                refreshIcon.classList.remove('animate-spin');
            }
            
            if (data.success) {
                const bookings = data.bookings;
                
                // Check if we have bookings
                if (bookings.length > 0) {
                    // Build table rows for each booking
                    let rows = '';
                    
                    bookings.forEach(booking => {
                        // Format dates
                        const arrivalDate = new Date(booking.arrivalDateTime);
                        const departureDate = new Date(booking.departureDateTime);
                        
                        const arrivalFormatted = formatDateTime(arrivalDate);
                        const departureFormatted = formatDateTime(departureDate);
                        
                        // Build row
                        rows += `
                            <tr>
                                <td class="px-4 py-3 whitespace-nowrap">${booking.room}</td>
                                <td class="px-4 py-3">${booking.guestName}</td>
                                <td class="px-4 py-3 hidden md:table-cell">
                                    <div class="text-sm">${booking.email}</div>
                                    <div class="text-sm text-gray-500">${booking.phone || 'N/A'}</div>
                                </td>
                                <td class="px-4 py-3">
                                    <span class="font-mono bg-gray-100 px-2 py-1 rounded">${booking.accessCode}</span>
                                </td>
                                <td class="px-4 py-3 hidden md:table-cell">${arrivalFormatted}</td>
                                <td class="px-4 py-3 hidden md:table-cell">${departureFormatted}</td>
                                <td class="px-4 py-3 text-right space-x-2">
                                    <button 
                                        class="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                        data-booking-id="${booking.id}"
                                        onclick="viewBookingDetails('${booking.id}')"
                                    >
                                        View
                                    </button>
                                    <button 
                                        class="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        data-booking-id="${booking.id}"
                                        onclick="cancelBooking('${booking.id}')"
                                    >
                                        Cancel
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    
                    // Update table
                    bookingsTableBody.innerHTML = rows;
                    
                    // Show table, hide empty and loading states
                    if (bookingsContainer && emptyState && loadingState) {
                        bookingsContainer.classList.remove('hidden');
                        emptyState.classList.add('hidden');
                        loadingState.classList.add('hidden');
                    }
                } else {
                    // No bookings found
                    console.log("No bookings found for the selected date and filters");
                    
                    // Show empty state, hide table and loading state
                    if (bookingsContainer && emptyState && loadingState) {
                        bookingsContainer.classList.add('hidden');
                        emptyState.classList.remove('hidden');
                        loadingState.classList.add('hidden');
                    }
                }
            } else {
                // Error loading bookings
                console.error("Error loading bookings:", data.message);
                showToast('error', 'Error', 'Failed to load bookings: ' + data.message);
                
                // Show error in table
                bookingsTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-4 py-3 text-center text-red-500">
                            Error loading bookings: ${data.message}
                        </td>
                    </tr>
                `;
                
                // Show table, hide empty and loading states
                if (bookingsContainer && emptyState && loadingState) {
                    bookingsContainer.classList.remove('hidden');
                    emptyState.classList.add('hidden');
                    loadingState.classList.add('hidden');
                }
            }
        })
        .catch(error => {
            // Clear loading animation
            if (refreshIcon) {
                refreshIcon.classList.remove('animate-spin');
            }
            
            console.error("Error fetching bookings:", error);
            showToast('error', 'Error', 'Failed to load bookings');
            
            // Show error in table
            if (bookingsTableBody) {
                bookingsTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-4 py-3 text-center text-red-500">
                            Error loading bookings: ${error.message}
                        </td>
                    </tr>
                `;
            }
            
            // Show table, hide empty and loading states
            if (bookingsContainer && emptyState && loadingState) {
                bookingsContainer.classList.remove('hidden');
                emptyState.classList.add('hidden');
                loadingState.classList.add('hidden');
            }
        });
}

// Filter bookings based on search input
function filterBookings(searchTerm) {
    console.log("Filtering bookings with search term:", searchTerm);
    
    // Convert search term to lowercase for case-insensitive matching
    searchTerm = searchTerm.toLowerCase();
    
    // Get all booking rows
    const rows = document.querySelectorAll('#bookingsTableBody tr');
    
    // Track if we have visible rows
    let hasVisibleRows = false;
    
    // Check each row
    rows.forEach(row => {
        // Skip rows with colspan (loading or error messages)
        if (row.querySelector('td[colspan]')) {
            return;
        }
        
        // Get text content to search through
        const text = row.textContent.toLowerCase();
        
        // Check if row should be visible
        if (text.includes(searchTerm)) {
            row.style.display = '';
            hasVisibleRows = true;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Show empty state if no matches
    const emptyState = document.getElementById('emptyState');
    const bookingsContainer = document.getElementById('bookingsContainer');
    
    if (emptyState && bookingsContainer) {
        if (!hasVisibleRows && searchTerm) {
            bookingsContainer.classList.add('hidden');
            emptyState.classList.remove('hidden');
            document.querySelector('#emptyState h3').textContent = 'No matching bookings';
            document.querySelector('#emptyState p').textContent = 'No bookings match your search criteria.';
        } else {
            bookingsContainer.classList.remove('hidden');
            emptyState.classList.add('hidden');
        }
    }
}

// Format date and time for display
function formatDateTime(date) {
    // Check if date is valid
    if (isNaN(date.getTime())) {
        return 'Invalid date';
    }
    
    // Format date as "Mar 15, 2025 at 2:30 PM"
    const options = { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    };
    
    return date.toLocaleDateString('en-US', options).replace(',', ' at');
}

// Show a toast message
function showToast(type, title, message) {
    // Check if we have window.showToast function available
    if (typeof window.showToast === 'function') {
        window.showToast(type, title, message);
    } else {
        // Fallback alert if toast function not available
        console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    }
}

// View booking details (placeholder function)
function viewBookingDetails(bookingId) {
    console.log("View booking details:", bookingId);
    showToast('info', 'View Booking', `Viewing booking ${bookingId}`);
    // TODO: Implement view booking details
}

// Cancel booking (placeholder function)
function cancelBooking(bookingId) {
    console.log("Cancel booking:", bookingId);
    showToast('warning', 'Cancel Booking', `Cancelling booking ${bookingId}`);
    // TODO: Implement cancel booking
}

// Export functions for global access
window.loadBookings = loadBookings;
window.viewBookingDetails = viewBookingDetails;
window.cancelBooking = cancelBooking;
