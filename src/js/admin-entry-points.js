
// Initialize Entry Points Management
document.addEventListener('DOMContentLoaded', function() {
    console.log("Initializing entry points management");
    
    // Check if the entry points template is loaded
    if (document.getElementById('entryPointsTableBody')) {
        initEntryPointsManagement();
    }
});

// Listen for template loaded event
document.addEventListener('templateLoaded', function(e) {
    if (e.detail && e.detail.templateId === 'entry-points-template') {
        console.log("Entry points template loaded, initializing management");
        setTimeout(initEntryPointsManagement, 100);
    }
});

// Main initialization function
function initEntryPointsManagement() {
    console.log("Setting up entry points management");
    loadEntryPoints();
    setupEntryPointEventListeners();
}

// Load all entry points
function loadEntryPoints() {
    console.log("Loading entry points data");
    const tableBody = document.getElementById('entryPointsTableBody');
    
    if (!tableBody) {
        console.error("Entry points table body element not found");
        return;
    }
    
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Loading entry points...</td></tr>';
    
    fetch('/api/get_entry_points.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                displayEntryPoints(data.entry_points);
            } else {
                showEntryPointsError('Error: ' + (data.message || 'Failed to load entry points'));
            }
        })
        .catch(error => {
            console.error("Error loading entry points:", error);
            showEntryPointsError('Error loading entry points. Please try again.');
        });
}

// Display entry points in the table
function displayEntryPoints(entryPoints) {
    console.log("Displaying entry points, count:", entryPoints.length);
    const tableBody = document.getElementById('entryPointsTableBody');
    
    if (!tableBody) {
        console.error("Entry points table body element not found");
        return;
    }
    
    if (entryPoints.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-8">
                    <div class="flex flex-col items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p class="text-gray-500 mb-2">No entry points found</p>
                        <button id="addFirstEntryPointBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Add Your First Entry Point
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // Add event listener to the "Add First Entry Point" button
        const addFirstEntryPointBtn = document.getElementById('addFirstEntryPointBtn');
        if (addFirstEntryPointBtn) {
            addFirstEntryPointBtn.addEventListener('click', function() {
                openEntryPointModal();
            });
        }
        return;
    }
    
    let html = '';
    entryPoints.forEach(entryPoint => {
        html += `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${escapeHtml(entryPoint.id)}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${escapeHtml(entryPoint.name)}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    ${escapeHtml(entryPoint.description || 'No description')}
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">
                    <div class="connected-rooms-loading">Loading...</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-right space-x-2">
                    <button 
                        class="edit-entry-point text-blue-600 hover:text-blue-900"
                        data-entry-point-id="${escapeHtml(entryPoint.id)}">
                        Edit
                    </button>
                    <button 
                        class="delete-entry-point text-red-600 hover:text-red-900" 
                        data-entry-point-id="${escapeHtml(entryPoint.id)}"
                        data-entry-point-name="${escapeHtml(entryPoint.name)}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
    
    // Fetch and display connected rooms for each entry point
    entryPoints.forEach(entryPoint => {
        loadConnectedRoomsForEntryPoint(entryPoint.id);
    });
    
    // Add event listeners to buttons
    setupEntryPointRowEventListeners();
}

// Load connected rooms for an entry point
function loadConnectedRoomsForEntryPoint(entryPointId) {
    fetch(`/api/get_entry_point.php?id=${encodeURIComponent(entryPointId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.entry_point.connected_rooms) {
                const rows = document.querySelectorAll(`tr button[data-entry-point-id="${entryPointId}"]`);
                if (rows.length > 0) {
                    const row = rows[0].closest('tr');
                    const connectedRoomsCell = row.querySelector('.connected-rooms-loading');
                    if (connectedRoomsCell) {
                        if (data.entry_point.connected_rooms.length === 0) {
                            connectedRoomsCell.innerHTML = '<span class="text-gray-400">No connected rooms</span>';
                        } else {
                            let roomsHtml = '';
                            data.entry_point.connected_rooms.forEach((room, index) => {
                                roomsHtml += `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">${escapeHtml(room.name)}</span>`;
                            });
                            connectedRoomsCell.innerHTML = roomsHtml;
                        }
                    }
                }
            }
        })
        .catch(error => {
            console.error("Error loading connected rooms:", error);
        });
}

// Setup event listeners for rows
function setupEntryPointRowEventListeners() {
    // Edit entry point buttons
    document.querySelectorAll('.edit-entry-point').forEach(button => {
        button.addEventListener('click', function() {
            const entryPointId = this.getAttribute('data-entry-point-id');
            editEntryPoint(entryPointId);
        });
    });
    
    // Delete entry point buttons
    document.querySelectorAll('.delete-entry-point').forEach(button => {
        button.addEventListener('click', function() {
            const entryPointId = this.getAttribute('data-entry-point-id');
            const entryPointName = this.getAttribute('data-entry-point-name');
            openDeleteEntryPointModal(entryPointId, entryPointName);
        });
    });
}

// Setup event listeners for entry point management
function setupEntryPointEventListeners() {
    console.log("Setting up entry point event listeners");
    
    // Add Entry Point button
    const addEntryPointBtn = document.getElementById('addEntryPointBtn');
    if (addEntryPointBtn) {
        addEntryPointBtn.addEventListener('click', function() {
            openEntryPointModal();
        });
    }
    
    // Close modal button
    const closeEntryPointModal = document.getElementById('closeEntryPointModal');
    if (closeEntryPointModal) {
        closeEntryPointModal.addEventListener('click', closeEntryPointModals);
    }
    
    // Entry point form
    const entryPointForm = document.getElementById('entryPointForm');
    if (entryPointForm) {
        entryPointForm.addEventListener('submit', handleEntryPointSubmit);
    }
    
    // Cancel button
    const cancelEntryPointBtn = document.getElementById('cancelEntryPointBtn');
    if (cancelEntryPointBtn) {
        cancelEntryPointBtn.addEventListener('click', closeEntryPointModals);
    }
    
    // Delete modal buttons
    const confirmDeleteEntryPointBtn = document.getElementById('confirmDeleteEntryPointBtn');
    if (confirmDeleteEntryPointBtn) {
        confirmDeleteEntryPointBtn.addEventListener('click', deleteEntryPoint);
    }
    
    const cancelDeleteEntryPointBtn = document.getElementById('cancelDeleteEntryPointBtn');
    if (cancelDeleteEntryPointBtn) {
        cancelDeleteEntryPointBtn.addEventListener('click', closeEntryPointModals);
    }
    
    // Load rooms for the checkboxes
    loadRoomsForEntryPointModal();
}

// Load rooms for the checkboxes in the entry point modal
function loadRoomsForEntryPointModal() {
    const roomCheckboxes = document.getElementById('roomCheckboxes');
    if (!roomCheckboxes) return;
    
    fetch('/api/get_all_rooms.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                roomCheckboxes.innerHTML = '';
                
                if (data.rooms.length === 0) {
                    roomCheckboxes.innerHTML = '<p class="text-gray-500 text-sm">No rooms available. Please add rooms first.</p>';
                    return;
                }
                
                data.rooms.forEach(room => {
                    roomCheckboxes.innerHTML += `
                        <div class="flex items-center">
                            <input type="checkbox" id="room-${escapeHtml(room.id)}" 
                                   class="room-checkbox" value="${escapeHtml(room.id)}"
                                   name="connected_rooms[]">
                            <label for="room-${escapeHtml(room.id)}" class="ml-2 text-sm text-gray-700">
                                ${escapeHtml(room.name)}
                            </label>
                        </div>
                    `;
                });
            } else {
                roomCheckboxes.innerHTML = '<p class="text-red-500 text-sm">Error loading rooms. Please try again.</p>';
            }
        })
        .catch(error => {
            console.error("Error loading rooms:", error);
            roomCheckboxes.innerHTML = '<p class="text-red-500 text-sm">Error loading rooms. Please try again.</p>';
        });
}

// Open the entry point modal
function openEntryPointModal(entryPoint = null) {
    console.log("Opening entry point modal", entryPoint);
    
    const modal = document.getElementById('entryPointModal');
    const modalTitle = document.getElementById('entryPointModalTitle');
    const entryPointId = document.getElementById('entryPointId');
    const entryPointIdInput = document.getElementById('entryPointIdInput');
    const entryPointName = document.getElementById('entryPointName');
    const entryPointDescription = document.getElementById('entryPointDescription');
    const entryPointMode = document.getElementById('entryPointMode');
    
    if (!modal) {
        console.error("Entry point modal not found");
        return;
    }
    
    // Reset form
    document.getElementById('entryPointForm').reset();
    
    // Uncheck all room checkboxes
    document.querySelectorAll('.room-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    if (entryPoint) {
        // Edit existing entry point
        if (modalTitle) modalTitle.textContent = 'Edit Entry Point';
        if (entryPointId) entryPointId.value = entryPoint.id;
        if (entryPointIdInput) {
            entryPointIdInput.value = entryPoint.id;
            entryPointIdInput.readOnly = true;
        }
        if (entryPointName) entryPointName.value = entryPoint.name;
        if (entryPointDescription) entryPointDescription.value = entryPoint.description || '';
        if (entryPointMode) entryPointMode.value = 'update';
        
        // Check the connected rooms
        if (entryPoint.connected_rooms) {
            entryPoint.connected_rooms.forEach(room => {
                const checkbox = document.getElementById(`room-${room.id}`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } else {
        // Add new entry point
        if (modalTitle) modalTitle.textContent = 'Add New Entry Point';
        if (entryPointIdInput) entryPointIdInput.readOnly = false;
        if (entryPointMode) entryPointMode.value = 'create';
    }
    
    // Show modal
    modal.classList.remove('hidden');
}

// Close all entry point modals
function closeEntryPointModals() {
    const entryPointModal = document.getElementById('entryPointModal');
    const deleteEntryPointModal = document.getElementById('deleteEntryPointModal');
    
    if (entryPointModal) entryPointModal.classList.add('hidden');
    if (deleteEntryPointModal) deleteEntryPointModal.classList.add('hidden');
}

// Open delete entry point confirmation modal
function openDeleteEntryPointModal(entryPointId, entryPointName) {
    const modal = document.getElementById('deleteEntryPointModal');
    const nameElement = document.getElementById('deleteEntryPointName');
    const idInput = document.getElementById('deleteEntryPointId');
    
    if (!modal) {
        console.error("Delete entry point modal not found");
        return;
    }
    
    if (nameElement) nameElement.textContent = entryPointName;
    if (idInput) idInput.value = entryPointId;
    
    modal.classList.remove('hidden');
}

// Handle entry point form submission
function handleEntryPointSubmit(event) {
    event.preventDefault();
    
    const entryPointId = document.getElementById('entryPointId').value;
    const entryPointIdInput = document.getElementById('entryPointIdInput').value;
    const entryPointName = document.getElementById('entryPointName').value;
    const entryPointDescription = document.getElementById('entryPointDescription').value;
    const entryPointMode = document.getElementById('entryPointMode').value;
    
    // Get selected rooms
    const selectedRooms = [];
    document.querySelectorAll('.room-checkbox:checked').forEach(checkbox => {
        selectedRooms.push(checkbox.value);
    });
    
    // Validate inputs
    if (!entryPointIdInput || !entryPointName) {
        showEntryPointsError('ID and Name are required fields');
        return;
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('action', entryPointMode);
    formData.append('id', entryPointId || entryPointIdInput);
    formData.append('name', entryPointName);
    formData.append('description', entryPointDescription);
    formData.append('connected_rooms', JSON.stringify(selectedRooms));
    
    // Send request to the server
    fetch('/api/manage_entry_points.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showEntryPointsSuccess(`Entry point ${entryPointMode === 'update' ? 'updated' : 'created'} successfully`);
            closeEntryPointModals();
            loadEntryPoints();
        } else {
            showEntryPointsError('Error: ' + (data.message || `Failed to ${entryPointMode} entry point`));
        }
    })
    .catch(error => {
        console.error("Error saving entry point:", error);
        showEntryPointsError('An unexpected error occurred. Please try again.');
    });
}

// Edit an entry point
function editEntryPoint(entryPointId) {
    console.log("Editing entry point:", entryPointId);
    
    fetch(`/api/get_entry_point.php?id=${encodeURIComponent(entryPointId)}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                openEntryPointModal(data.entry_point);
            } else {
                showEntryPointsError('Error: ' + (data.message || 'Failed to load entry point details'));
            }
        })
        .catch(error => {
            console.error("Error fetching entry point details:", error);
            showEntryPointsError('An error occurred while loading entry point details. Please try again.');
        });
}

// Delete an entry point
function deleteEntryPoint() {
    const entryPointId = document.getElementById('deleteEntryPointId').value;
    
    if (!entryPointId) {
        showEntryPointsError('Entry point ID is required for deletion');
        return;
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', entryPointId);
    
    // Send request to the server
    fetch('/api/manage_entry_points.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showEntryPointsSuccess('Entry point deleted successfully');
            closeEntryPointModals();
            loadEntryPoints();
        } else {
            showEntryPointsError('Error: ' + (data.message || 'Failed to delete entry point'));
        }
    })
    .catch(error => {
        console.error("Error deleting entry point:", error);
        showEntryPointsError('An unexpected error occurred. Please try again.');
    });
}

// Show success message
function showEntryPointsSuccess(message) {
    if (typeof showToast === 'function') {
        showToast('success', message);
    } else {
        alert(message);
    }
}

// Show error message
function showEntryPointsError(message) {
    if (typeof showToast === 'function') {
        showToast('error', message);
    } else {
        alert(message);
    }
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

// Export functions for global use
window.initEntryPointsManagement = initEntryPointsManagement;
window.loadEntryPoints = loadEntryPoints;
