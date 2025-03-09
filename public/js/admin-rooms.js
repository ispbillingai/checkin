
// Admin Rooms Management
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Rooms JS loaded');
    initRoomsManagement();
});

// Track if the template is loaded
let roomsTemplateLoaded = false;
document.addEventListener('template-loaded', function(e) {
    if (e.detail && e.detail.templateId === 'rooms-template') {
        console.log('Rooms template loaded event received');
        roomsTemplateLoaded = true;
        // Initialize rooms management after template is loaded
        initRoomsManagement();
    }
});

function initRoomsManagement() {
    console.log('Initializing rooms management');
    if (!roomsTemplateLoaded) {
        console.log('Rooms template not loaded yet, waiting...');
        return; // Wait for template to load
    }

    loadRooms();
    setupRoomEventListeners();
}

// Function to load all rooms
function loadRooms() {
    console.log('Loading rooms data');
    document.getElementById('roomsTableBody').innerHTML = '<tr><td colspan="6" class="text-center py-4">Loading...</td></tr>';
    
    fetch('/api/get_all_rooms.php')
        .then(response => {
            console.log('Rooms API response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Rooms data received:', data);
            if (data.success) {
                displayRooms(data.rooms);
                updateRoomStats(data.stats);
            } else {
                showError('Error: ' + (data.message || 'Failed to load rooms'));
            }
        })
        .catch(error => {
            console.log('Error fetching rooms:', error);
            showError('Error loading rooms. Please try again.');
        });
}

// Function to display rooms in the table
function displayRooms(rooms) {
    console.log('Displaying rooms, count:', rooms.length);
    const tableBody = document.getElementById('roomsTableBody');
    
    if (!tableBody) {
        console.error('Rooms table body element not found');
        return;
    }
    
    if (rooms.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p class="text-gray-500 mb-2">No rooms found</p>
                        <button id="addFirstRoomBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Add Your First Room
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // Add event listener for the "Add First Room" button
        const addFirstRoomBtn = document.getElementById('addFirstRoomBtn');
        if (addFirstRoomBtn) {
            addFirstRoomBtn.addEventListener('click', () => openRoomModal());
        }
        return;
    }
    
    let html = '';
    rooms.forEach(room => {
        html += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${escapeHtml(room.id)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${escapeHtml(room.name)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    ${escapeHtml(room.description || 'No description')}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${room.fixed_passcode ? 
                        `<span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Fixed: ${escapeHtml(room.fixed_passcode)}</span>` : 
                        '<span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Auto-generated</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${room.reset_hours} ${room.reset_hours === 1 ? 'hour' : 'hours'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                    <button 
                        class="edit-room text-blue-600 hover:text-blue-900"
                        data-room-id="${escapeHtml(room.id)}">
                        Edit
                    </button>
                    <button 
                        class="delete-room text-red-600 hover:text-red-900" 
                        data-room-id="${escapeHtml(room.id)}"
                        data-room-name="${escapeHtml(room.name)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-room').forEach(button => {
        button.addEventListener('click', () => {
            const roomId = button.getAttribute('data-room-id');
            editRoom(roomId);
        });
    });
    
    document.querySelectorAll('.delete-room').forEach(button => {
        button.addEventListener('click', () => {
            const roomId = button.getAttribute('data-room-id');
            const roomName = button.getAttribute('data-room-name');
            openDeleteModal(roomId, roomName);
        });
    });
}

// Update the room stats
function updateRoomStats(stats) {
    console.log('Updating room stats:', stats);
    if (stats) {
        const totalRooms = document.getElementById('totalRoomsCount');
        const fixedPasscode = document.getElementById('fixedPasscodeCount');
        const activeBookings = document.getElementById('activeBookingsCount');
        
        if (totalRooms) totalRooms.textContent = stats.total_rooms;
        if (fixedPasscode) fixedPasscode.textContent = stats.fixed_passcode_count;
        if (activeBookings) activeBookings.textContent = stats.active_bookings;
    }
}

// Set up event listeners for the room management functionality
function setupRoomEventListeners() {
    console.log('Setting up room event listeners');
    
    // Check if elements exist before attaching event listeners
    const addRoomBtn = document.getElementById('addRoomBtn');
    const closeRoomModal = document.getElementById('closeRoomModal');
    const roomForm = document.getElementById('roomForm');
    const cancelRoomBtn = document.getElementById('cancelRoomBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    
    if (addRoomBtn) {
        console.log('Add room button found, attaching event listener');
        addRoomBtn.addEventListener('click', () => openRoomModal());
    } else {
        console.error('Add room button not found');
    }
    
    if (closeRoomModal) {
        closeRoomModal.addEventListener('click', closeModals);
    }
    
    if (roomForm) {
        roomForm.addEventListener('submit', handleRoomSubmit);
    }
    
    if (cancelRoomBtn) {
        cancelRoomBtn.addEventListener('click', closeModals);
    }
    
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteRoom);
    }
    
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeModals);
    }
}

// Open the room modal for adding a new room
function openRoomModal(roomData = null) {
    console.log('Opening room modal', roomData);
    const modal = document.getElementById('roomModal');
    const modalTitle = document.getElementById('roomModalTitle');
    const roomIdInput = document.getElementById('roomIdInput');
    const roomId = document.getElementById('roomId');
    const roomName = document.getElementById('roomName');
    const roomDescription = document.getElementById('roomDescription');
    const fixedPasscode = document.getElementById('fixedPasscode');
    const resetHours = document.getElementById('resetHours');
    
    if (!modal) {
        console.error('Room modal not found');
        return;
    }
    
    // Reset form
    if (roomForm) roomForm.reset();
    
    if (roomData) {
        // Edit existing room
        if (modalTitle) modalTitle.textContent = 'Edit Room';
        if (roomIdInput) {
            roomIdInput.value = roomData.id;
            roomIdInput.disabled = true; // Can't change room ID once created
        }
        if (roomId) roomId.value = roomData.id;
        if (roomName) roomName.value = roomData.name;
        if (roomDescription) roomDescription.value = roomData.description || '';
        if (fixedPasscode) fixedPasscode.value = roomData.fixed_passcode || '';
        if (resetHours) resetHours.value = roomData.reset_hours || 2;
    } else {
        // Add new room
        if (modalTitle) modalTitle.textContent = 'Add New Room';
        if (roomIdInput) roomIdInput.disabled = false;
    }
    
    // Show modal
    modal.classList.remove('hidden');
}

// Close all modals
function closeModals() {
    console.log('Closing modals');
    const roomModal = document.getElementById('roomModal');
    const deleteModal = document.getElementById('deleteRoomModal');
    
    if (roomModal) roomModal.classList.add('hidden');
    if (deleteModal) deleteModal.classList.add('hidden');
}

// Open delete confirmation modal
function openDeleteModal(roomId, roomName) {
    console.log('Opening delete modal for room:', roomId, roomName);
    const modal = document.getElementById('deleteRoomModal');
    const roomNameElement = document.getElementById('deleteRoomName');
    const roomIdInput = document.getElementById('deleteRoomId');
    
    if (!modal) {
        console.error('Delete room modal not found');
        return;
    }
    
    if (roomNameElement) roomNameElement.textContent = roomName;
    if (roomIdInput) roomIdInput.value = roomId;
    
    modal.classList.remove('hidden');
}

// Handle room form submission
function handleRoomSubmit(event) {
    event.preventDefault();
    console.log('Handling room form submission');
    
    const roomId = document.getElementById('roomIdInput')?.value || '';
    const roomName = document.getElementById('roomName')?.value || '';
    const roomDescription = document.getElementById('roomDescription')?.value || '';
    const fixedPasscode = document.getElementById('fixedPasscode')?.value || '';
    const resetHours = document.getElementById('resetHours')?.value || '2';
    
    if (!roomId || !roomName) {
        showError('Room ID and name are required');
        return;
    }
    
    const roomData = {
        id: roomId,
        name: roomName,
        description: roomDescription,
        fixed_passcode: fixedPasscode,
        reset_hours: parseInt(resetHours, 10)
    };
    
    const isEdit = document.getElementById('roomIdInput')?.disabled;
    const apiUrl = '/api/manage_rooms.php';
    const method = isEdit ? 'PUT' : 'POST';
    
    console.log(`${isEdit ? 'Updating' : 'Creating'} room:`, roomData);
    
    fetch(apiUrl, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(`Room ${isEdit ? 'updated' : 'created'} successfully`);
            closeModals();
            loadRooms(); // Reload the rooms list
        } else {
            showError('Error: ' + (data.message || `Failed to ${isEdit ? 'update' : 'create'} room`));
        }
    })
    .catch(error => {
        console.error('Error saving room:', error);
        showError('An error occurred. Please try again.');
    });
}

// Delete a room
function deleteRoom() {
    const roomId = document.getElementById('deleteRoomId')?.value;
    
    if (!roomId) {
        showError('Room ID is required for deletion');
        return;
    }
    
    console.log('Deleting room:', roomId);
    
    fetch('/api/manage_rooms.php', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: roomId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess('Room deleted successfully');
            closeModals();
            loadRooms(); // Reload the rooms list
        } else {
            showError('Error: ' + (data.message || 'Failed to delete room'));
        }
    })
    .catch(error => {
        console.error('Error deleting room:', error);
        showError('An error occurred. Please try again.');
    });
}

// Edit a room
function editRoom(roomId) {
    console.log('Editing room:', roomId);
    
    fetch(`/api/get_room.php?id=${encodeURIComponent(roomId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                openRoomModal(data.room);
            } else {
                showError('Error: ' + (data.message || 'Failed to load room details'));
            }
        })
        .catch(error => {
            console.error('Error fetching room details:', error);
            showError('An error occurred. Please try again.');
        });
}

// Helper function to escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Show success message
function showSuccess(message) {
    console.log('Success:', message);
    if (typeof showToast === 'function') {
        showToast('success', 'Success', message);
    } else {
        alert(message);
    }
}

// Show error message
function showError(message) {
    console.error('Error:', message);
    if (typeof showToast === 'function') {
        showToast('error', 'Error', message);
    } else {
        alert(message);
    }
}
