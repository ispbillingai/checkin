
// Room Management Script
console.log("Admin rooms JS loaded");

// Initialize once DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing rooms management");
    
    // Initialize room management when the rooms template is loaded
    window.addEventListener('templateLoaded', function(e) {
        if (e.detail.templateId === 'rooms-template') {
            console.log("Rooms template loaded, initializing room management");
            initRoomsManagement();
        }
    });
    
    // If template is already loaded, initialize now
    if (document.querySelector('#roomsSection .backdrop-blur-sm')) {
        console.log("Rooms template already present, initializing directly");
        initRoomsManagement();
    }
});

// Main initialization function
function initRoomsManagement() {
    console.log("Initializing rooms management");
    
    // Load rooms data
    loadRooms();
    
    // Set up event listeners
    setupRoomEventListeners();
}

// Function to load rooms data from API
function loadRooms() {
    console.log("Loading rooms data");
    
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
            // Update stats
            updateRoomStats(data.stats);
            
            // Populate rooms table
            populateRoomsTable(data.rooms);
        } else {
            showError("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error loading rooms:", error);
        showError("Error loading rooms: " + error.message);
    });
}

// Function to update room statistics
function updateRoomStats(stats) {
    if (!stats) return;
    
    const totalRoomsElement = document.getElementById('totalRoomsCount');
    const fixedPasscodeElement = document.getElementById('fixedPasscodeCount');
    const activeBookingsElement = document.getElementById('activeBookingsCount');
    
    if (totalRoomsElement) totalRoomsElement.textContent = stats.total_rooms;
    if (fixedPasscodeElement) fixedPasscodeElement.textContent = stats.fixed_passcode_count;
    if (activeBookingsElement) activeBookingsElement.textContent = stats.active_bookings;
}

// Function to populate rooms table
function populateRoomsTable(rooms) {
    const tableBody = document.getElementById('roomsTableBody');
    if (!tableBody) {
        console.error("roomsTableBody element not found");
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    if (!rooms || rooms.length === 0) {
        // No rooms found
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
                    No rooms found. Add a new room to get started.
                </td>
            </tr>
        `;
        return;
    }
    
    // Add each room to the table
    rooms.forEach(room => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${escapeHtml(room.id)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${escapeHtml(room.name)}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
                ${escapeHtml(room.description || '')}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${room.fixed_passcode ? escapeHtml(room.fixed_passcode) : 
                '<span class="text-gray-400 italic">Auto-generated</span>'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${room.reset_hours || 2} hours
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3 edit-room-btn" data-room-id="${escapeHtml(room.id)}">
                    Edit
                </button>
                <button class="text-red-600 hover:text-red-900 delete-room-btn" data-room-id="${escapeHtml(room.id)}" data-room-name="${escapeHtml(room.name)}">
                    Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for edit and delete buttons
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
            confirmDeleteRoom(roomId, roomName);
        });
    });
}

// Setup all event listeners for room management
function setupRoomEventListeners() {
    console.log("Setting up room event listeners");
    
    // Get references to DOM elements
    const addRoomBtn = document.getElementById('addRoomBtn');
    const roomForm = document.getElementById('roomForm');
    const roomModal = document.getElementById('roomModal');
    const closeRoomModal = document.getElementById('closeRoomModal');
    const cancelRoomBtn = document.getElementById('cancelRoomBtn');
    const deleteRoomModal = document.getElementById('deleteRoomModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Add Room button
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', function() {
            showAddRoomModal();
        });
    } else {
        console.error("addRoomBtn element not found");
    }
    
    // Room form submission
    if (roomForm) {
        roomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveRoom();
        });
    } else {
        console.error("roomForm element not found");
    }
    
    // Close modal button
    if (closeRoomModal) {
        closeRoomModal.addEventListener('click', function() {
            hideRoomModal();
        });
    } else {
        console.error("closeRoomModal element not found");
    }
    
    // Cancel button in add/edit modal
    if (cancelRoomBtn) {
        cancelRoomBtn.addEventListener('click', function() {
            hideRoomModal();
        });
    } else {
        console.error("cancelRoomBtn element not found");
    }
    
    // Cancel button in delete modal
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', function() {
            hideDeleteModal();
        });
    } else {
        console.error("cancelDeleteBtn element not found");
    }
    
    // Confirm delete button
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function() {
            deleteRoom();
        });
    } else {
        console.error("confirmDeleteBtn element not found");
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (roomModal && event.target === roomModal) {
            hideRoomModal();
        }
        if (deleteRoomModal && event.target === deleteRoomModal) {
            hideDeleteModal();
        }
    });
}

// Function to show Add Room modal
function showAddRoomModal() {
    // Reset form
    const roomForm = document.getElementById('roomForm');
    const roomIdInput = document.getElementById('roomIdInput');
    const roomId = document.getElementById('roomId');
    const roomModalTitle = document.getElementById('roomModalTitle');
    
    if (roomForm) roomForm.reset();
    if (roomIdInput) roomIdInput.removeAttribute('disabled');
    if (roomId) roomId.value = '';
    if (roomModalTitle) roomModalTitle.textContent = 'Add New Room';
    
    // Show modal
    const roomModal = document.getElementById('roomModal');
    if (roomModal) roomModal.classList.remove('hidden');
}

// Function to hide Room modal
function hideRoomModal() {
    const roomModal = document.getElementById('roomModal');
    if (roomModal) roomModal.classList.add('hidden');
}

// Function to hide Delete confirmation modal
function hideDeleteModal() {
    const deleteRoomModal = document.getElementById('deleteRoomModal');
    if (deleteRoomModal) deleteRoomModal.classList.add('hidden');
}

// Function to edit an existing room
function editRoom(roomId) {
    fetch(`/api/get_room.php?id=${encodeURIComponent(roomId)}`, {
        method: 'GET'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const room = data.room;
            
            // Set form values
            const roomIdInput = document.getElementById('roomIdInput');
            const roomId = document.getElementById('roomId');
            const roomName = document.getElementById('roomName');
            const roomDescription = document.getElementById('roomDescription');
            const fixedPasscode = document.getElementById('fixedPasscode');
            const resetHours = document.getElementById('resetHours');
            const roomModalTitle = document.getElementById('roomModalTitle');
            
            if (roomIdInput) {
                roomIdInput.value = room.id;
                roomIdInput.setAttribute('disabled', 'disabled');
            }
            if (roomId) roomId.value = room.id;
            if (roomName) roomName.value = room.name;
            if (roomDescription) roomDescription.value = room.description || '';
            if (fixedPasscode) fixedPasscode.value = room.fixed_passcode || '';
            if (resetHours) resetHours.value = room.reset_hours || 2;
            if (roomModalTitle) roomModalTitle.textContent = 'Edit Room';
            
            // Show modal
            const roomModal = document.getElementById('roomModal');
            if (roomModal) roomModal.classList.remove('hidden');
        } else {
            showError("Error loading room details: " + data.message);
        }
    })
    .catch(error => {
        showError("Error loading room details: " + error.message);
    });
}

// Function to confirm room deletion
function confirmDeleteRoom(roomId, roomName) {
    const deleteRoomId = document.getElementById('deleteRoomId');
    const deleteRoomName = document.getElementById('deleteRoomName');
    
    if (deleteRoomId) deleteRoomId.value = roomId;
    if (deleteRoomName) deleteRoomName.textContent = roomName;
    
    // Show delete confirmation modal
    const deleteRoomModal = document.getElementById('deleteRoomModal');
    if (deleteRoomModal) deleteRoomModal.classList.remove('hidden');
}

// Function to save a room (create or update)
function saveRoom() {
    const roomId = document.getElementById('roomId');
    const roomIdInput = document.getElementById('roomIdInput');
    const roomName = document.getElementById('roomName');
    const roomDescription = document.getElementById('roomDescription');
    const fixedPasscode = document.getElementById('fixedPasscode');
    const resetHours = document.getElementById('resetHours');
    
    // Get values
    const id = roomId.value || roomIdInput.value;
    const mode = roomId.value ? 'update' : 'create';
    
    // Create form data
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('id', id);
    formData.append('roomIdInput', roomIdInput.value);
    formData.append('roomName', roomName.value);
    formData.append('roomDescription', roomDescription.value || '');
    formData.append('fixedPasscode', fixedPasscode.value || '');
    formData.append('resetHours', resetHours.value || 2);
    
    // Send request to API
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            if (window.showToast) {
                window.showToast('success', 'Room ' + (mode === 'create' ? 'created' : 'updated') + ' successfully');
            } else {
                alert('Room ' + (mode === 'create' ? 'created' : 'updated') + ' successfully');
            }
            
            // Hide modal and reload rooms
            hideRoomModal();
            loadRooms();
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        showError("Error saving room: " + error.message);
    });
}

// Function to delete a room
function deleteRoom() {
    const deleteRoomId = document.getElementById('deleteRoomId');
    
    if (!deleteRoomId || !deleteRoomId.value) {
        showError("Room ID is missing");
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('mode', 'delete');
    formData.append('id', deleteRoomId.value);
    
    // Send request to API
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            if (window.showToast) {
                window.showToast('success', 'Room deleted successfully');
            } else {
                alert('Room deleted successfully');
            }
            
            // Hide modal and reload rooms
            hideDeleteModal();
            loadRooms();
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        showError("Error deleting room: " + error.message);
    });
}

// Utility function to escape HTML
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return unsafe
        .toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Function to show errors
function showError(message) {
    console.error("Error:", message);
    
    // Use toast component if available
    if (window.showToast) {
        window.showToast('error', message);
    } else {
        alert('Error: ' + message);
    }
}

// Make functions available globally
window.initRoomsManagement = initRoomsManagement;
window.loadRooms = loadRooms;
