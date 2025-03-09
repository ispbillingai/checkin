
// Room Management Functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log("Admin Rooms JS loaded");
    
    // Check if sidebar already initialized the sections
    if (window.sidebarInitialized) {
        initRoomsSection();
    } else {
        // Wait for sidebar to be initialized
        document.addEventListener('sidebarInitialized', initRoomsSection);
    }
    
    // Listen for room section activation
    document.addEventListener('sectionChanged', function(e) {
        if (e.detail.section === 'roomsSection') {
            refreshRoomsList();
        }
    });
});

function initRoomsSection() {
    console.log("Initializing rooms section");
    
    // Get DOM elements
    const roomsSection = document.getElementById('roomsSection');
    if (!roomsSection) {
        console.error("Rooms section not found in the DOM");
        return;
    }
    
    // Set up event listeners
    setupRoomEventListeners();
    
    // Load rooms data when section is initialized
    if (roomsSection.classList.contains('section-content') && !roomsSection.classList.contains('hidden')) {
        refreshRoomsList();
    }
}

function setupRoomEventListeners() {
    console.log("Setting up room event listeners");
    
    // Add room button
    document.getElementById('addRoomBtn')?.addEventListener('click', function() {
        openRoomModal('add');
    });
    
    // Close room modal buttons
    document.getElementById('closeRoomModal')?.addEventListener('click', closeRoomModal);
    document.getElementById('cancelRoomBtn')?.addEventListener('click', closeRoomModal);
    
    // Cancel delete button
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    
    // Form submission
    document.getElementById('roomForm')?.addEventListener('submit', handleRoomFormSubmit);
    
    // Confirm delete button
    document.getElementById('confirmDeleteBtn')?.addEventListener('click', confirmDeleteRoom);
}

function refreshRoomsList() {
    console.log("Refreshing rooms list");
    const tableBody = document.getElementById('roomsTableBody');
    
    if (!tableBody) {
        console.error("Rooms table body not found");
        return;
    }
    
    // Show loading state
    tableBody.innerHTML = `
        <tr class="text-center">
            <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
                Loading rooms...
            </td>
        </tr>
    `;
    
    // Fetch rooms data
    fetch('/api/get_all_rooms.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update stats
                document.getElementById('totalRoomsCount').textContent = data.stats.total_rooms;
                document.getElementById('fixedPasscodeCount').textContent = data.stats.fixed_passcode_count;
                document.getElementById('activeBookingsCount').textContent = data.stats.active_bookings;
                
                // Populate table
                if (data.rooms.length === 0) {
                    tableBody.innerHTML = `
                        <tr class="text-center">
                            <td colspan="6" class="px-6 py-4 text-sm text-gray-500">
                                No rooms found. Add your first room!
                            </td>
                        </tr>
                    `;
                } else {
                    tableBody.innerHTML = '';
                    data.rooms.forEach(room => {
                        const row = document.createElement('tr');
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
                                ${room.fixed_passcode ? 
                                    `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ${room.fixed_passcode}
                                    </span>` : 
                                    '<span class="text-gray-400">Auto-generated</span>'
                                }
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                ${room.reset_hours} hours
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    class="text-blue-600 hover:text-blue-900 mr-3 edit-room-btn" 
                                    data-room-id="${room.id}"
                                >
                                    Edit
                                </button>
                                <button 
                                    class="text-red-600 hover:text-red-900 delete-room-btn" 
                                    data-room-id="${room.id}"
                                    data-room-name="${room.name}"
                                >
                                    Delete
                                </button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    });
                    
                    // Add event listeners to edit and delete buttons
                    document.querySelectorAll('.edit-room-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const roomId = this.getAttribute('data-room-id');
                            editRoom(roomId);
                        });
                    });
                    
                    document.querySelectorAll('.delete-room-btn').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const roomId = this.getAttribute('data-room-id');
                            const roomName = this.getAttribute('data-room-name');
                            openDeleteModal(roomId, roomName);
                        });
                    });
                }
            } else {
                tableBody.innerHTML = `
                    <tr class="text-center">
                        <td colspan="6" class="px-6 py-4 text-sm text-red-500">
                            Error loading rooms: ${data.message || 'Unknown error'}
                        </td>
                    </tr>
                `;
                
                showToast('error', 'Error', 'Failed to load rooms data.');
            }
        })
        .catch(error => {
            console.error('Error fetching rooms:', error);
            tableBody.innerHTML = `
                <tr class="text-center">
                    <td colspan="6" class="px-6 py-4 text-sm text-red-500">
                        Network error. Please try again.
                    </td>
                </tr>
            `;
            
            showToast('error', 'Error', 'Network error while loading rooms.');
        });
}

function editRoom(roomId) {
    console.log(`Editing room: ${roomId}`);
    
    // Fetch room details
    fetch(`/api/get_room.php?id=${roomId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                openRoomModal('edit', data.room);
            } else {
                showToast('error', 'Error', data.message || 'Failed to load room details');
            }
        })
        .catch(error => {
            console.error('Error fetching room details:', error);
            showToast('error', 'Error', 'Network error while loading room details');
        });
}

function openRoomModal(mode, roomData = null) {
    // Get modal elements
    const modal = document.getElementById('roomModal');
    const title = document.getElementById('roomModalTitle');
    const form = document.getElementById('roomForm');
    const roomIdInput = document.getElementById('roomId');
    const roomIdField = document.getElementById('roomIdInput');
    
    // Set modal title based on mode
    title.textContent = mode === 'add' ? 'Add New Room' : 'Edit Room';
    
    // Reset form
    form.reset();
    
    if (mode === 'edit' && roomData) {
        // Populate form with room data
        roomIdInput.value = roomData.id;
        roomIdField.value = roomData.id;
        roomIdField.disabled = true; // Cannot change room ID once created
        
        document.getElementById('roomName').value = roomData.name;
        document.getElementById('roomDescription').value = roomData.description || '';
        document.getElementById('fixedPasscode').value = roomData.fixed_passcode || '';
        document.getElementById('resetHours').value = roomData.reset_hours;
    } else {
        // New room, reset form
        roomIdInput.value = '';
        roomIdField.value = '';
        roomIdField.disabled = false;
    }
    
    // Show modal
    modal.classList.remove('hidden');
}

function closeRoomModal() {
    document.getElementById('roomModal').classList.add('hidden');
}

function openDeleteModal(roomId, roomName) {
    const modal = document.getElementById('deleteRoomModal');
    document.getElementById('deleteRoomId').value = roomId;
    document.getElementById('deleteRoomName').textContent = roomName;
    modal.classList.remove('hidden');
}

function closeDeleteModal() {
    document.getElementById('deleteRoomModal').classList.add('hidden');
}

function handleRoomFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const roomId = document.getElementById('roomId').value;
    const mode = roomId ? 'update' : 'create';
    
    // Add mode parameter
    formData.append('mode', mode);
    if (mode === 'update') {
        formData.append('id', roomId);
    }
    
    // Disable submit button
    const saveBtn = document.getElementById('saveRoomBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    // Submit form data to API
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Room';
            
            if (data.success) {
                closeRoomModal();
                showToast('success', 'Success', mode === 'create' ? 'Room created successfully' : 'Room updated successfully');
                refreshRoomsList();
            } else {
                showToast('error', 'Error', data.message || 'Failed to save room');
            }
        })
        .catch(error => {
            console.error('Error saving room:', error);
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Room';
            showToast('error', 'Error', 'Network error while saving room');
        });
}

function confirmDeleteRoom() {
    const roomId = document.getElementById('deleteRoomId').value;
    
    // Disable delete button
    const deleteBtn = document.getElementById('confirmDeleteBtn');
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';
    
    // Create form data with mode and id
    const formData = new FormData();
    formData.append('mode', 'delete');
    formData.append('id', roomId);
    
    // Submit to API
    fetch('/api/manage_rooms.php', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete Room';
            
            if (data.success) {
                closeDeleteModal();
                showToast('success', 'Success', 'Room deleted successfully');
                refreshRoomsList();
            } else {
                showToast('error', 'Error', data.message || 'Failed to delete room');
            }
        })
        .catch(error => {
            console.error('Error deleting room:', error);
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete Room';
            showToast('error', 'Error', 'Network error while deleting room');
        });
}

// Toast notification helper
function showToast(type, title, message) {
    if (window.showToast) {
        window.showToast(type, title, message);
    } else {
        // Fallback if toast function not available
        alert(`${title}: ${message}`);
    }
}
