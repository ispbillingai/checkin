
// Admin Rooms Management JS
console.log("Loading admin-rooms.js");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded in admin-rooms.js");
    // Initialize rooms functionality if we're on the admin dashboard
    if (document.getElementById('roomsSection')) {
        initRoomsManagement();
    }
});

// Main initialization function for rooms management
function initRoomsManagement() {
    console.log("Initializing rooms management");
    
    // Load rooms data
    loadRooms();
    
    // Set up event listeners for room actions
    setupRoomEventListeners();
}

// Load rooms data from the API
function loadRooms() {
    console.log("Loading rooms data");
    
    fetch('/api/get_all_rooms.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log("Rooms data received:", data);
            if (data.success) {
                // Update stats
                updateRoomStats(data.stats);
                
                // Populate rooms table
                populateRoomsTable(data.rooms);
            } else {
                showError('Failed to load rooms: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching rooms:', error);
            showError('Error loading rooms. Please try again.');
        });
}

// Update room statistics display
function updateRoomStats(stats) {
    console.log("Updating room stats:", stats);
    
    document.getElementById('totalRoomsCount').textContent = stats.total_rooms;
    document.getElementById('fixedPasscodeCount').textContent = stats.fixed_passcode_count;
    document.getElementById('activeBookingsCount').textContent = stats.active_bookings;
}

// Populate the rooms table with data
function populateRoomsTable(rooms) {
    console.log("Populating rooms table with", rooms.length, "rooms");
    
    const tableBody = document.getElementById('roomsTableBody');
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    if (rooms.length === 0) {
        // Display no rooms message
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
                ${room.fixed_passcode ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Fixed: ${room.fixed_passcode}
                </span>` : '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${room.reset_hours} hours
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3 edit-room-btn" data-room-id="${room.id}">
                    Edit
                </button>
                <button class="text-red-600 hover:text-red-900 delete-room-btn" data-room-id="${room.id}" data-room-name="${room.name}">
                    Delete
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Set up event listeners for room management actions
function setupRoomEventListeners() {
    console.log("Setting up room event listeners");
    
    // Add Room button
    document.getElementById('addRoomBtn').addEventListener('click', () => {
        resetRoomForm();
        document.getElementById('roomModalTitle').textContent = 'Add New Room';
        document.getElementById('roomIdInput').disabled = false;
        document.getElementById('roomId').value = '';
        document.getElementById('roomModal').classList.remove('hidden');
    });
    
    // Close modal buttons
    document.getElementById('closeRoomModal').addEventListener('click', () => {
        document.getElementById('roomModal').classList.add('hidden');
    });
    
    document.getElementById('cancelRoomBtn').addEventListener('click', () => {
        document.getElementById('roomModal').classList.add('hidden');
    });
    
    // Delete modal close button
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteRoomModal').classList.add('hidden');
    });
    
    // Room form submission
    document.getElementById('roomForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveRoom();
    });
    
    // Confirm delete button
    document.getElementById('confirmDeleteBtn').addEventListener('click', function() {
        deleteRoom();
    });
    
    // Set up delegation for edit and delete buttons (these buttons are dynamically created)
    document.getElementById('roomsTableBody').addEventListener('click', function(e) {
        // Edit room button
        if (e.target.classList.contains('edit-room-btn')) {
            const roomId = e.target.getAttribute('data-room-id');
            editRoom(roomId);
        }
        
        // Delete room button
        if (e.target.classList.contains('delete-room-btn')) {
            const roomId = e.target.getAttribute('data-room-id');
            const roomName = e.target.getAttribute('data-room-name');
            confirmDeleteRoom(roomId, roomName);
        }
    });
}

// Reset the room form
function resetRoomForm() {
    document.getElementById('roomForm').reset();
    document.getElementById('roomId').value = '';
    document.getElementById('roomIdInput').value = '';
    document.getElementById('roomName').value = '';
    document.getElementById('roomDescription').value = '';
    document.getElementById('fixedPasscode').value = '';
    document.getElementById('resetHours').value = '2';
}

// Edit room - fetch and populate form
function editRoom(roomId) {
    console.log("Editing room:", roomId);
    
    fetch(`/api/get_room.php?id=${roomId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const room = data.room;
                
                // Set form fields
                document.getElementById('roomId').value = room.id;
                document.getElementById('roomIdInput').value = room.id;
                document.getElementById('roomIdInput').disabled = true;
                document.getElementById('roomName').value = room.name;
                document.getElementById('roomDescription').value = room.description || '';
                document.getElementById('fixedPasscode').value = room.fixed_passcode || '';
                document.getElementById('resetHours').value = room.reset_hours;
                
                // Update modal title
                document.getElementById('roomModalTitle').textContent = 'Edit Room';
                
                // Show the modal
                document.getElementById('roomModal').classList.remove('hidden');
            } else {
                showError('Failed to load room details: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching room details:', error);
            showError('Error loading room details. Please try again.');
        });
}

// Show delete confirmation
function confirmDeleteRoom(roomId, roomName) {
    console.log("Confirming delete for room:", roomId);
    
    document.getElementById('deleteRoomId').value = roomId;
    document.getElementById('deleteRoomName').textContent = roomName;
    document.getElementById('deleteRoomModal').classList.remove('hidden');
}

// Save room (create or update)
function saveRoom() {
    console.log("Saving room");
    
    const roomId = document.getElementById('roomId').value;
    const mode = roomId ? 'update' : 'create';
    const roomIdInput = document.getElementById('roomIdInput').value;
    
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('id', roomId || roomIdInput);
    formData.append('roomIdInput', roomIdInput);
    formData.append('roomName', document.getElementById('roomName').value);
    formData.append('roomDescription', document.getElementById('roomDescription').value);
    formData.append('fixedPasscode', document.getElementById('fixedPasscode').value);
    formData.append('resetHours', document.getElementById('resetHours').value);
    
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close modal and refresh
            document.getElementById('roomModal').classList.add('hidden');
            
            // Show success notification
            showSuccess(mode === 'create' ? 'Room created successfully' : 'Room updated successfully');
            
            // Reload rooms
            loadRooms();
        } else {
            showError('Failed to save room: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error saving room:', error);
        showError('Error saving room. Please try again.');
    });
}

// Delete room
function deleteRoom() {
    console.log("Deleting room");
    
    const roomId = document.getElementById('deleteRoomId').value;
    
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
            // Close modal
            document.getElementById('deleteRoomModal').classList.add('hidden');
            
            // Show success notification
            showSuccess('Room deleted successfully');
            
            // Reload rooms
            loadRooms();
        } else {
            document.getElementById('deleteRoomModal').classList.add('hidden');
            showError('Failed to delete room: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error deleting room:', error);
        document.getElementById('deleteRoomModal').classList.add('hidden');
        showError('Error deleting room. Please try again.');
    });
}

// Show success message
function showSuccess(message) {
    console.log("Success:", message);
    
    if (window.showToast) {
        window.showToast(message, 'success');
    } else {
        alert(message);
    }
}

// Show error message
function showError(message) {
    console.error("Error:", message);
    
    if (window.showToast) {
        window.showToast(message, 'error');
    } else {
        alert(message);
    }
}

// Expose functions to global scope (for debugging)
window.adminRooms = {
    loadRooms,
    editRoom,
    deleteRoom,
    saveRoom
};
