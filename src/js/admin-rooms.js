
// Room management functionality
(function() {
    // Check if we're on the admin dashboard
    if (!document.getElementById('roomsSection')) {
        console.log('Not on admin dashboard, rooms functionality not initialized');
        return;
    }

    // Initialize when document is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing rooms management');
        initRoomsManagement();
    });

    // Wait for template to load before initializing
    document.addEventListener('template-loaded', function(e) {
        if (e.detail && e.detail.template === 'rooms-template') {
            console.log('Rooms template loaded, initializing rooms management');
            initRoomsManagement();
        }
    });

    function initRoomsManagement() {
        console.log('Loading rooms data');
        loadRooms();
        setupRoomEventListeners();
    }

    // Function to fetch and load all rooms
    function loadRooms() {
        fetch('/api/get_all_rooms.php')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Rooms data loaded:', data);
                if (data.success) {
                    displayRooms(data.rooms);
                    updateRoomStats(data.stats);
                } else {
                    showError(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error fetching rooms:', error);
                showError('Error loading rooms. Please try again.');
            });
    }

    // Function to display rooms in the table
    function displayRooms(rooms) {
        const tableBody = document.getElementById('roomsTableBody');
        if (!tableBody) {
            console.error('roomsTableBody element not found');
            return;
        }

        // Clear existing content
        tableBody.innerHTML = '';

        if (rooms.length === 0) {
            tableBody.innerHTML = `
                <tr class="text-center">
                    <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
                        No rooms found. Click "Add New Room" to create one.
                    </td>
                </tr>
            `;
            return;
        }

        // Add rooms to table
        rooms.forEach(room => {
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${room.id}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${room.name}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    ${room.description || '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${room.fixed_passcode ? `<span class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">${room.fixed_passcode}</span>` : '-'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${room.reset_hours} hours
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div class="flex space-x-2">
                        <button data-room-id="${room.id}" class="edit-room-btn text-blue-600 hover:text-blue-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button data-room-id="${room.id}" data-room-name="${room.name}" class="delete-room-btn text-red-600 hover:text-red-900">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        // Add event listeners to the newly created buttons
        setupRoomButtonListeners();
    }

    // Function to update room stats
    function updateRoomStats(stats) {
        if (!stats) return;
        
        const totalRoomsCount = document.getElementById('totalRoomsCount');
        const fixedPasscodeCount = document.getElementById('fixedPasscodeCount');
        const activeBookingsCount = document.getElementById('activeBookingsCount');
        
        if (totalRoomsCount) totalRoomsCount.textContent = stats.total_rooms || 0;
        if (fixedPasscodeCount) fixedPasscodeCount.textContent = stats.fixed_passcode_count || 0;
        if (activeBookingsCount) activeBookingsCount.textContent = stats.active_bookings || 0;
    }

    // Setup event listeners for room management buttons
    function setupRoomEventListeners() {
        console.log('Setting up room event listeners');
        
        // Add Room button
        const addRoomBtn = document.getElementById('addRoomBtn');
        if (addRoomBtn) {
            addRoomBtn.addEventListener('click', showAddRoomModal);
        } else {
            console.error('addRoomBtn element not found');
        }
        
        // Room form
        const roomForm = document.getElementById('roomForm');
        if (roomForm) {
            roomForm.addEventListener('submit', handleRoomFormSubmit);
        } else {
            console.error('roomForm element not found');
        }
        
        // Close modal buttons
        const closeRoomModal = document.getElementById('closeRoomModal');
        if (closeRoomModal) {
            closeRoomModal.addEventListener('click', hideRoomModal);
        } else {
            console.error('closeRoomModal element not found');
        }
        
        const cancelRoomBtn = document.getElementById('cancelRoomBtn');
        if (cancelRoomBtn) {
            cancelRoomBtn.addEventListener('click', hideRoomModal);
        } else {
            console.error('cancelRoomBtn element not found');
        }
        
        // Delete room modal buttons
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', hideDeleteModal);
        } else {
            console.error('cancelDeleteBtn element not found');
        }
        
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', deleteRoom);
        } else {
            console.error('confirmDeleteBtn element not found');
        }
    }

    // Setup event listeners for dynamic room buttons (edit/delete)
    function setupRoomButtonListeners() {
        // Edit room buttons
        document.querySelectorAll('.edit-room-btn').forEach(button => {
            button.addEventListener('click', function() {
                const roomId = this.getAttribute('data-room-id');
                editRoom(roomId);
            });
        });
        
        // Delete room buttons
        document.querySelectorAll('.delete-room-btn').forEach(button => {
            button.addEventListener('click', function() {
                const roomId = this.getAttribute('data-room-id');
                const roomName = this.getAttribute('data-room-name');
                showDeleteModal(roomId, roomName);
            });
        });
    }

    // Show Add Room modal
    function showAddRoomModal() {
        const roomModal = document.getElementById('roomModal');
        const modalTitle = document.getElementById('roomModalTitle');
        const roomForm = document.getElementById('roomForm');
        const roomIdInput = document.getElementById('roomIdInput');
        
        if (!roomModal || !modalTitle || !roomForm || !roomIdInput) {
            console.error('Some modal elements not found');
            return;
        }
        
        // Set modal for adding new room
        modalTitle.textContent = 'Add New Room';
        roomForm.reset();
        
        // Clear hidden ID field
        document.getElementById('roomId').value = '';
        
        // Enable room ID input for new rooms
        roomIdInput.removeAttribute('disabled');
        roomIdInput.classList.remove('bg-gray-100');
        
        // Show the modal
        roomModal.classList.remove('hidden');
    }

    // Hide Room modal
    function hideRoomModal() {
        const roomModal = document.getElementById('roomModal');
        if (roomModal) {
            roomModal.classList.add('hidden');
        }
    }

    // Show Delete confirmation modal
    function showDeleteModal(roomId, roomName) {
        const deleteModal = document.getElementById('deleteRoomModal');
        const deleteRoomId = document.getElementById('deleteRoomId');
        const deleteRoomName = document.getElementById('deleteRoomName');
        
        if (!deleteModal || !deleteRoomId || !deleteRoomName) {
            console.error('Delete modal elements not found');
            return;
        }
        
        deleteRoomId.value = roomId;
        deleteRoomName.textContent = `Room: ${roomName}`;
        deleteModal.classList.remove('hidden');
    }

    // Hide Delete modal
    function hideDeleteModal() {
        const deleteModal = document.getElementById('deleteRoomModal');
        if (deleteModal) {
            deleteModal.classList.add('hidden');
        }
    }

    // Handle room form submission
    function handleRoomFormSubmit(e) {
        e.preventDefault();
        
        const roomId = document.getElementById('roomId').value;
        const mode = roomId ? 'update' : 'create';
        
        // Get form data
        const formData = new FormData(document.getElementById('roomForm'));
        formData.append('mode', mode);
        
        if (mode === 'update') {
            formData.append('id', roomId);
        }
        
        // Send request to server
        fetch('/api/manage_rooms.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message);
                hideRoomModal();
                loadRooms(); // Reload rooms list
            } else {
                showError(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error saving room:', error);
            showError('An error occurred. Please try again.');
        });
    }

    // Edit room
    function editRoom(roomId) {
        fetch(`/api/get_room.php?id=${roomId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showEditRoomModal(data.room);
                } else {
                    showError(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error fetching room details:', error);
                showError('Failed to load room details.');
            });
    }

    // Show Edit Room modal with room data
    function showEditRoomModal(room) {
        const roomModal = document.getElementById('roomModal');
        const modalTitle = document.getElementById('roomModalTitle');
        const roomIdInput = document.getElementById('roomIdInput');
        const roomNameInput = document.getElementById('roomName');
        const roomDescriptionInput = document.getElementById('roomDescription');
        const fixedPasscodeInput = document.getElementById('fixedPasscode');
        const resetHoursInput = document.getElementById('resetHours');
        const roomIdHidden = document.getElementById('roomId');
        
        if (!roomModal || !modalTitle || !roomIdInput || !roomNameInput || 
            !roomDescriptionInput || !fixedPasscodeInput || !resetHoursInput || !roomIdHidden) {
            console.error('Some modal elements not found for editing');
            return;
        }
        
        // Set modal for editing
        modalTitle.textContent = `Edit Room: ${room.name}`;
        
        // Fill form with room data
        roomIdInput.value = room.id;
        roomNameInput.value = room.name;
        roomDescriptionInput.value = room.description || '';
        fixedPasscodeInput.value = room.fixed_passcode || '';
        resetHoursInput.value = room.reset_hours || 2;
        roomIdHidden.value = room.id;
        
        // Disable room ID for existing rooms
        roomIdInput.setAttribute('disabled', 'disabled');
        roomIdInput.classList.add('bg-gray-100');
        
        // Show the modal
        roomModal.classList.remove('hidden');
    }

    // Delete room
    function deleteRoom() {
        const roomId = document.getElementById('deleteRoomId').value;
        
        if (!roomId) {
            showError('Room ID is missing.');
            return;
        }
        
        const formData = new FormData();
        formData.append('mode', 'delete');
        formData.append('id', roomId);
        
        fetch('/api/manage_rooms.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showSuccess(data.message);
                hideDeleteModal();
                loadRooms(); // Reload rooms list
            } else {
                showError(`Error: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Error deleting room:', error);
            showError('An error occurred while deleting the room.');
        });
    }

    // Helper function to show success message
    function showSuccess(message) {
        // Check if toast functionality exists
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            // Fallback to alert
            alert(message);
        }
    }

    // Helper function to show error message
    function showError(message) {
        // Check if toast functionality exists
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            // Fallback to console and alert
            console.error(message);
            alert(message);
        }
    }

    // Make functions available in global scope if needed
    window.roomsModule = {
        loadRooms,
        addRoom: showAddRoomModal,
        editRoom,
        deleteRoom
    };
})();
