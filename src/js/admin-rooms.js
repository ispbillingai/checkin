
/**
 * Room Management JavaScript
 * Handles room data loading, creation, editing, and deletion
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Rooms JS loaded');
    initRoomsSection();
});

/**
 * Initialize the rooms management section
 */
function initRoomsSection() {
    // Only initialize if we're on the rooms section
    if (!document.getElementById('roomsSection')) return;
    
    // Load rooms data when section becomes visible
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.classList && !mutation.target.classList.contains('hidden')) {
                loadRooms();
                setupEventListeners();
                observer.disconnect();
            }
        });
    });
    
    observer.observe(document.getElementById('roomsSection'), { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
    
    // If section is already visible, load rooms immediately
    if (!document.getElementById('roomsSection').classList.contains('hidden')) {
        loadRooms();
        setupEventListeners();
    }
}

/**
 * Load rooms data from the server
 */
function loadRooms() {
    const tableBody = document.getElementById('roomsTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr class="text-center">
            <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
                Loading rooms...
            </td>
        </tr>
    `;
    
    fetch('/api/get_rooms.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayRooms(data.rooms);
            } else {
                console.error('Error loading rooms:', data.message);
                tableBody.innerHTML = `
                    <tr class="text-center">
                        <td colspan="6" class="px-6 py-4 text-sm text-red-500">
                            Error: ${data.message || 'Failed to load rooms'}
                        </td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error('Error fetching rooms:', error);
            tableBody.innerHTML = `
                <tr class="text-center">
                    <td colspan="6" class="px-6 py-4 text-sm text-red-500">
                        Error: Failed to load rooms. Please try again.
                    </td>
                </tr>
            `;
        });
}

/**
 * Display rooms in the table
 */
function displayRooms(rooms) {
    const tableBody = document.getElementById('roomsTableBody');
    if (!tableBody) return;
    
    if (rooms.length === 0) {
        tableBody.innerHTML = `
            <tr class="text-center">
                <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
                    No rooms found. Add your first room.
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = '';
    
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
            <td class="px-6 py-4 text-sm text-gray-500">
                ${room.description || '-'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${room.fixed_passcode ? room.fixed_passcode : 'Auto-generated'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${room.reset_hours}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                    <button 
                        class="text-blue-600 hover:text-blue-900 edit-room-btn" 
                        data-id="${room.id}" 
                        data-name="${room.name}" 
                        data-description="${room.description || ''}" 
                        data-fixed-passcode="${room.fixed_passcode || ''}" 
                        data-reset-hours="${room.reset_hours}">
                        Edit
                    </button>
                    <button 
                        class="text-red-600 hover:text-red-900 delete-room-btn" 
                        data-id="${room.id}" 
                        data-name="${room.name}">
                        Delete
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Attach event listeners to the newly created buttons
    attachRoomButtonListeners();
}

/**
 * Attach event listeners to the room action buttons
 */
function attachRoomButtonListeners() {
    // Edit room buttons
    document.querySelectorAll('.edit-room-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomData = {
                id: this.getAttribute('data-id'),
                name: this.getAttribute('data-name'),
                description: this.getAttribute('data-description'),
                fixed_passcode: this.getAttribute('data-fixed-passcode'),
                reset_hours: this.getAttribute('data-reset-hours')
            };
            
            openEditRoomModal(roomData);
        });
    });
    
    // Delete room buttons
    document.querySelectorAll('.delete-room-btn').forEach(button => {
        button.addEventListener('click', function() {
            const roomId = this.getAttribute('data-id');
            const roomName = this.getAttribute('data-name');
            
            openDeleteRoomModal(roomId, roomName);
        });
    });
}

/**
 * Setup event listeners for room management
 */
function setupEventListeners() {
    // Add Room button
    const addRoomBtn = document.getElementById('addRoomBtn');
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', openAddRoomModal);
    }
    
    // Close modal buttons
    const closeModalBtns = document.querySelectorAll('#closeRoomModal, #cancelRoomBtn');
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeRoomModal);
    });
    
    // Room form submission
    const roomForm = document.getElementById('roomForm');
    if (roomForm) {
        roomForm.addEventListener('submit', handleRoomFormSubmit);
    }
    
    // Delete room modal buttons
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteRoomModal);
    }
    
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteRoom);
    }
}

/**
 * Open the modal for adding a new room
 */
function openAddRoomModal() {
    // Clear form
    document.getElementById('roomId').value = '';
    document.getElementById('roomIdInput').value = '';
    document.getElementById('roomName').value = '';
    document.getElementById('roomDescription').value = '';
    document.getElementById('fixedPasscode').value = '';
    document.getElementById('resetHours').value = '2';
    
    // Enable room ID field for new rooms
    document.getElementById('roomIdInput').disabled = false;
    
    // Update modal title
    document.getElementById('roomModalTitle').textContent = 'Add New Room';
    
    // Show the modal
    document.getElementById('roomModal').classList.remove('hidden');
}

/**
 * Open the modal for editing an existing room
 */
function openEditRoomModal(roomData) {
    // Fill form with room data
    document.getElementById('roomId').value = roomData.id;
    document.getElementById('roomIdInput').value = roomData.id;
    document.getElementById('roomName').value = roomData.name;
    document.getElementById('roomDescription').value = roomData.description;
    document.getElementById('fixedPasscode').value = roomData.fixed_passcode;
    document.getElementById('resetHours').value = roomData.reset_hours;
    
    // Disable room ID field for editing (cannot change ID)
    document.getElementById('roomIdInput').disabled = true;
    
    // Update modal title
    document.getElementById('roomModalTitle').textContent = 'Edit Room';
    
    // Show the modal
    document.getElementById('roomModal').classList.remove('hidden');
}

/**
 * Close the room modal
 */
function closeRoomModal() {
    document.getElementById('roomModal').classList.add('hidden');
}

/**
 * Handle room form submission
 */
function handleRoomFormSubmit(event) {
    event.preventDefault();
    
    const roomId = document.getElementById('roomId').value;
    const action = roomId ? 'update' : 'create';
    
    // Get form data
    const formData = new FormData();
    formData.append('action', action);
    formData.append('id', document.getElementById('roomIdInput').value);
    formData.append('name', document.getElementById('roomName').value);
    formData.append('description', document.getElementById('roomDescription').value);
    formData.append('fixed_passcode', document.getElementById('fixedPasscode').value);
    formData.append('reset_hours', document.getElementById('resetHours').value);
    
    // Disable submit button
    const saveButton = document.getElementById('saveRoomBtn');
    saveButton.disabled = true;
    saveButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saving...
    `;
    
    // Send request to server
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showToast(action === 'create' ? 'Room created successfully!' : 'Room updated successfully!', 'success');
            
            // Close modal and reload rooms
            closeRoomModal();
            loadRooms();
        } else {
            // Show error message
            showToast(`Error: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error saving room:', error);
        showToast('Error saving room. Please try again.', 'error');
    })
    .finally(() => {
        // Re-enable submit button
        saveButton.disabled = false;
        saveButton.innerHTML = 'Save Room';
    });
}

/**
 * Open the delete room confirmation modal
 */
function openDeleteRoomModal(roomId, roomName) {
    document.getElementById('deleteRoomId').value = roomId;
    document.getElementById('deleteRoomName').textContent = roomName;
    document.getElementById('deleteRoomModal').classList.remove('hidden');
}

/**
 * Close the delete room confirmation modal
 */
function closeDeleteRoomModal() {
    document.getElementById('deleteRoomModal').classList.add('hidden');
}

/**
 * Delete a room
 */
function deleteRoom() {
    const roomId = document.getElementById('deleteRoomId').value;
    
    // Disable delete button
    const deleteButton = document.getElementById('confirmDeleteBtn');
    deleteButton.disabled = true;
    deleteButton.innerHTML = `
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Deleting...
    `;
    
    // Send delete request
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', roomId);
    
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Show success message
            showToast('Room deleted successfully!', 'success');
            
            // Close modal and reload rooms
            closeDeleteRoomModal();
            loadRooms();
        } else {
            // Show error message
            showToast(`Error: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting room:', error);
        showToast('Error deleting room. Please try again.', 'error');
    })
    .finally(() => {
        // Re-enable delete button
        deleteButton.disabled = false;
        deleteButton.innerHTML = 'Delete Room';
    });
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        console.log(`Toast (${type}): ${message}`);
        alert(message);
    }
}
