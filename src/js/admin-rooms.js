
// Initialize Room Management Module
console.log("Initializing rooms management");

// Function to initialize room management
function initRoomsManagement() {
    console.log("Loading rooms data");
    loadRooms();
    setupRoomEventListeners();
}

// Event listener to initialize after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // We'll check if the template is loaded first
    if (document.getElementById('roomsTableBody')) {
        initRoomsManagement();
    }
});

// Event listener for template loaded event
document.addEventListener('templateLoaded', function(e) {
    if (e.detail.templateId === 'rooms-template') {
        console.log("Rooms template loaded, initializing room management");
        setTimeout(initRoomsManagement, 100); // Small delay to ensure DOM is ready
    }
});

// Function to load rooms data from API
function loadRooms() {
    console.log("Fetching rooms data");
    fetch('/api/get_all_rooms.php', {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Rooms data loaded:", data);
        if (data.success) {
            displayRooms(data.rooms);
            updateRoomStats(data.stats);
        } else {
            showToast('error', 'Failed to load rooms: ' + data.message);
        }
    })
    .catch(error => {
        console.error("Error loading rooms:", error);
        showToast('error', 'Error loading rooms. Please try again.');
    });
}

// Function to display rooms in the table
function displayRooms(rooms) {
    const tableBody = document.getElementById('roomsTableBody');
    if (!tableBody) {
        console.error("roomsTableBody element not found");
        return;
    }
    
    tableBody.innerHTML = '';
    
    if (rooms.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
                    No rooms found. Add a room to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    rooms.forEach(room => {
        const passcodeDisplay = room.fixed_passcode ? room.fixed_passcode : '<span class="text-gray-400">Auto-generated</span>';
        
        tableBody.innerHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-500">${room.id}</td>
                <td class="px-6 py-4 text-sm font-medium text-gray-900">${room.name}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${room.description || '-'}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${passcodeDisplay}</td>
                <td class="px-6 py-4 text-sm text-gray-500">${room.reset_hours || '2'}</td>
                <td class="px-6 py-4 text-sm text-right space-x-2">
                    <button class="edit-room-btn text-blue-600 hover:text-blue-800" data-room-id="${room.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button class="delete-room-btn text-red-600 hover:text-red-800" data-room-id="${room.id}" data-room-name="${room.name}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            </tr>
        `;
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-room-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.getAttribute('data-room-id');
            editRoom(roomId);
        });
    });
    
    document.querySelectorAll('.delete-room-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.getAttribute('data-room-id');
            const roomName = this.getAttribute('data-room-name');
            showDeleteConfirmation(roomId, roomName);
        });
    });
}

// Function to update room statistics
function updateRoomStats(stats) {
    if (stats) {
        document.getElementById('totalRoomsCount').textContent = stats.total_rooms;
        document.getElementById('fixedPasscodeCount').textContent = stats.fixed_passcode_count;
        document.getElementById('activeBookingsCount').textContent = stats.active_bookings;
    }
}

// Function to set up event listeners for room management
function setupRoomEventListeners() {
    console.log("Setting up room event listeners");
    
    // Add Room button
    const addRoomBtn = document.getElementById('addRoomBtn');
    if (!addRoomBtn) {
        console.error("addRoomBtn element not found");
    } else {
        addRoomBtn.addEventListener('click', function() {
            showAddRoomModal();
        });
    }
    
    // Room form submission
    const roomForm = document.getElementById('roomForm');
    if (!roomForm) {
        console.error("roomForm element not found");
    } else {
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRoom();
        });
    }
    
    // Close modal button
    const closeRoomModal = document.getElementById('closeRoomModal');
    if (!closeRoomModal) {
        console.error("closeRoomModal element not found");
    } else {
        closeRoomModal.addEventListener('click', function() {
            hideRoomModal();
        });
    }
    
    // Cancel button in add/edit modal
    const cancelRoomBtn = document.getElementById('cancelRoomBtn');
    if (!cancelRoomBtn) {
        console.error("cancelRoomBtn element not found");
    } else {
        cancelRoomBtn.addEventListener('click', function() {
            hideRoomModal();
        });
    }
    
    // Cancel delete button
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (!cancelDeleteBtn) {
        console.error("cancelDeleteBtn element not found");
    } else {
        cancelDeleteBtn.addEventListener('click', function() {
            hideDeleteModal();
        });
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (!confirmDeleteBtn) {
        console.error("confirmDeleteBtn element not found");
    } else {
        confirmDeleteBtn.addEventListener('click', function() {
            deleteRoom();
        });
    }
}

// Function to show the add room modal
function showAddRoomModal() {
    const modal = document.getElementById('roomModal');
    const modalTitle = document.getElementById('roomModalTitle');
    const form = document.getElementById('roomForm');
    
    if (!modal || !modalTitle || !form) {
        console.error("Modal elements not found");
        return;
    }
    
    // Reset form and set title
    form.reset();
    modalTitle.textContent = 'Add New Room';
    
    // Clear hidden roomId field
    document.getElementById('roomId').value = '';
    
    // Enable room ID input for new rooms
    const roomIdInput = document.getElementById('roomIdInput');
    if (roomIdInput) {
        roomIdInput.removeAttribute('disabled');
    }
    
    // Show modal
    modal.classList.remove('hidden');
}

// Function to hide the room modal
function hideRoomModal() {
    const modal = document.getElementById('roomModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Function to edit a room
function editRoom(roomId) {
    fetch(`/api/get_room.php?id=${roomId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const room = data.room;
                
                // Set form fields
                document.getElementById('roomId').value = room.id;
                document.getElementById('roomIdInput').value = room.id;
                document.getElementById('roomIdInput').setAttribute('disabled', 'disabled');
                document.getElementById('roomName').value = room.name;
                document.getElementById('roomDescription').value = room.description || '';
                document.getElementById('fixedPasscode').value = room.fixed_passcode || '';
                document.getElementById('resetHours').value = room.reset_hours || '2';
                
                // Set modal title
                document.getElementById('roomModalTitle').textContent = 'Edit Room';
                
                // Show modal
                document.getElementById('roomModal').classList.remove('hidden');
            } else {
                showToast('error', 'Failed to load room details: ' + data.message);
            }
        })
        .catch(error => {
            console.error("Error loading room details:", error);
            showToast('error', 'Error loading room details. Please try again.');
        });
}

// Function to save a room (create or update)
function saveRoom() {
    const roomId = document.getElementById('roomId').value;
    const roomIdInput = document.getElementById('roomIdInput').value;
    const roomName = document.getElementById('roomName').value;
    const roomDescription = document.getElementById('roomDescription').value;
    const fixedPasscode = document.getElementById('fixedPasscode').value;
    const resetHours = document.getElementById('resetHours').value;
    
    // Use the roomId if editing an existing room, otherwise use the roomIdInput for new rooms
    const id = roomId || roomIdInput;
    
    // Validation
    if (!id) {
        showToast('error', 'Room ID is required');
        return;
    }
    
    if (!roomName) {
        showToast('error', 'Room name is required');
        return;
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('action', roomId ? 'update' : 'create');
    formData.append('id', id);
    formData.append('name', roomName);
    formData.append('description', roomDescription);
    formData.append('fixed_passcode', fixedPasscode);
    formData.append('reset_hours', resetHours);
    
    // Send data to API
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hideRoomModal();
            loadRooms(); // Reload rooms list
            showToast('success', `Room ${roomId ? 'updated' : 'added'} successfully`);
        } else {
            showToast('error', `Failed to ${roomId ? 'update' : 'add'} room: ${data.message}`);
        }
    })
    .catch(error => {
        console.error(`Error ${roomId ? 'updating' : 'adding'} room:`, error);
        showToast('error', `Error ${roomId ? 'updating' : 'adding'} room. Please try again.`);
    });
}

// Function to show the delete confirmation modal
function showDeleteConfirmation(roomId, roomName) {
    const modal = document.getElementById('deleteRoomModal');
    const roomNameElement = document.getElementById('deleteRoomName');
    const roomIdElement = document.getElementById('deleteRoomId');
    
    if (!modal || !roomNameElement || !roomIdElement) {
        console.error("Delete modal elements not found");
        return;
    }
    
    roomNameElement.textContent = roomName;
    roomIdElement.value = roomId;
    
    modal.classList.remove('hidden');
}

// Function to hide the delete modal
function hideDeleteModal() {
    const modal = document.getElementById('deleteRoomModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Function to delete a room
function deleteRoom() {
    const roomId = document.getElementById('deleteRoomId').value;
    
    if (!roomId) {
        showToast('error', 'Room ID is missing');
        return;
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', roomId);
    
    // Send data to API
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            hideDeleteModal();
            loadRooms(); // Reload rooms list
            showToast('success', 'Room deleted successfully');
        } else {
            showToast('error', 'Failed to delete room: ' + data.message);
        }
    })
    .catch(error => {
        console.error("Error deleting room:", error);
        showToast('error', 'Error deleting room. Please try again.');
    });
}

// Helper function to show toast messages
function showToast(type, message) {
    if (window.showToastMessage) {
        window.showToastMessage(type, message);
    } else {
        alert(message);
    }
}

// Export functions for global use
window.initRoomsManagement = initRoomsManagement;
window.loadRooms = loadRooms;
