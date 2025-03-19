
// Admin Entry Point PINs JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log("admin-entry-pins.js loaded");
    initializeEntryPinsPage();
});

// Initialize the entry pins page
function initializeEntryPinsPage() {
    // Wait until the entry pins template is loaded
    console.log("Waiting for entry pins template to load...");
    
    if (document.getElementById('entryPinsSection')) {
        if (document.getElementById('entryPinsSection').childElementCount > 0) {
            console.log("Entry pins template already loaded, initializing...");
            setupEntryPinsPage();
        } else {
            console.log("Entry pins section exists but template not loaded yet, waiting...");
            // Wait for template to be loaded
            const observer = new MutationObserver(function(mutations) {
                if (document.getElementById('entryPinsSection').childElementCount > 0) {
                    console.log("Entry pins template loaded, initializing...");
                    observer.disconnect();
                    setupEntryPinsPage();
                }
            });
            
            observer.observe(document.getElementById('entryPinsSection'), { childList: true });
        }
    } else {
        console.warn("Entry pins section not found in the DOM");
    }
    
    // Add a global event listener for template loaded events
    window.addEventListener('templateLoaded', function(e) {
        if (e.detail && e.detail.templateId === 'entry-pins-template') {
            console.log("Entry pins template loaded event received, initializing...");
            setupEntryPinsPage();
        }
    });
}

// Setup the entry pins page functionality
function setupEntryPinsPage() {
    console.log("Setting up entry pins page...");
    
    // Get elements
    const entryPointFilter = document.getElementById('entryPointFilterSelect');
    const refreshButton = document.getElementById('refreshPinsBtn');
    const assignNewPinButton = document.getElementById('assignNewPinBtn');
    const assignPinModal = document.getElementById('assignPinModal');
    const closeAssignPinModal = document.getElementById('closeAssignPinModal');
    const cancelAssignPinBtn = document.getElementById('cancelAssignPinBtn');
    const assignPinForm = document.getElementById('assignPinForm');
    const emptyStateAssignBtn = document.getElementById('emptyStateAssignBtn');
    
    // Load entry points for filter and form
    loadEntryPoints();
    
    // Load bookings for the form
    loadActiveBookings();
    
    // Load initial PIN assignments
    loadPinAssignments();
    
    // Add event listeners
    if (entryPointFilter) {
        entryPointFilter.addEventListener('change', function() {
            const selectedEntryPoint = entryPointFilter.value;
            console.log("Entry point filter changed to:", selectedEntryPoint);
            loadPinAssignments(selectedEntryPoint);
        });
    }
    
    if (refreshButton) {
        refreshButton.addEventListener('click', function() {
            console.log("Refresh button clicked");
            loadPinAssignments(entryPointFilter.value);
        });
    }
    
    // Handle showing the assign PIN modal
    if (assignNewPinButton) {
        assignNewPinButton.addEventListener('click', function() {
            console.log("Assign new PIN button clicked");
            showAssignPinModal();
        });
    }
    
    if (emptyStateAssignBtn) {
        emptyStateAssignBtn.addEventListener('click', function() {
            console.log("Empty state assign button clicked");
            showAssignPinModal();
        });
    }
    
    // Handle closing the assign PIN modal
    if (closeAssignPinModal) {
        closeAssignPinModal.addEventListener('click', function() {
            console.log("Close assign PIN modal button clicked");
            hideAssignPinModal();
        });
    }
    
    if (cancelAssignPinBtn) {
        cancelAssignPinBtn.addEventListener('click', function() {
            console.log("Cancel assign PIN button clicked");
            hideAssignPinModal();
        });
    }
    
    // Handle PIN assignment form submission
    if (assignPinForm) {
        assignPinForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Assign PIN form submitted");
            handleAssignPin();
        });
    }
    
    // Setup delete PIN event delegation
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('delete-pin-btn')) {
            const pinId = e.target.getAttribute('data-pin-id');
            const entryName = e.target.getAttribute('data-entry-name');
            const position = e.target.getAttribute('data-position');
            const pinCode = e.target.getAttribute('data-pin-code');
            
            console.log("Delete PIN button clicked for PIN ID:", pinId);
            showDeletePinModal(pinId, entryName, position, pinCode);
        }
    });
    
    // Handle delete PIN confirmation
    const confirmDeletePinBtn = document.getElementById('confirmDeletePinBtn');
    if (confirmDeletePinBtn) {
        confirmDeletePinBtn.addEventListener('click', function() {
            const pinId = document.getElementById('deletePinId').value;
            console.log("Confirm delete PIN button clicked for PIN ID:", pinId);
            deletePin(pinId);
        });
    }
    
    // Handle cancel delete PIN
    const cancelDeletePinBtn = document.getElementById('cancelDeletePinBtn');
    if (cancelDeletePinBtn) {
        cancelDeletePinBtn.addEventListener('click', function() {
            console.log("Cancel delete PIN button clicked");
            hideDeletePinModal();
        });
    }
    
    console.log("Entry pins page setup complete");
}

// Load entry points for filter and form
function loadEntryPoints() {
    console.log("Loading entry points...");
    
    // Get entry point filter and form select elements
    const entryPointFilter = document.getElementById('entryPointFilterSelect');
    const pinEntryPoint = document.getElementById('pinEntryPoint');
    
    if (!entryPointFilter || !pinEntryPoint) {
        console.error("Entry point select elements not found!");
        return;
    }
    
    // Fetch entry points from API
    fetch('/api/get_all_entry_points.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Entry points loaded:", data);
            
            if (data.success) {
                // Update the filter dropdown
                let filterOptions = '<option value="all">All Entry Points</option>';
                let formOptions = '<option value="" disabled selected>Select entry point</option>';
                
                // Add each entry point as an option
                data.entry_points.forEach(entry => {
                    filterOptions += `<option value="${entry.id}">${entry.name}</option>`;
                    formOptions += `<option value="${entry.id}">${entry.name}</option>`;
                });
                
                // Update the dropdowns
                entryPointFilter.innerHTML = filterOptions;
                pinEntryPoint.innerHTML = formOptions;
            } else {
                console.error("Error loading entry points:", data.message);
                showToast('error', 'Error', 'Failed to load entry points: ' + data.message);
            }
        })
        .catch(error => {
            console.error("Error fetching entry points:", error);
            showToast('error', 'Error', 'Failed to load entry points');
        });
}

// Load active bookings for the form
function loadActiveBookings() {
    console.log("Loading active bookings...");
    
    // Get booking select element
    const pinBooking = document.getElementById('pinBooking');
    
    if (!pinBooking) {
        console.error("Booking select element not found!");
        return;
    }
    
    // Fetch active bookings from API
    fetch('/api/get_active_bookings.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("Active bookings loaded:", data);
            
            if (data.success) {
                let options = '<option value="" disabled selected>Select booking</option>';
                
                // Add each booking as an option
                data.bookings.forEach(booking => {
                    options += `<option value="${booking.id}">${booking.guest_name} - ${booking.room_name} (${booking.access_code})</option>`;
                });
                
                // Update the dropdown
                pinBooking.innerHTML = options;
            } else {
                console.error("Error loading bookings:", data.message);
                showToast('error', 'Error', 'Failed to load bookings: ' + data.message);
                pinBooking.innerHTML = '<option value="" disabled selected>Error loading bookings</option>';
            }
        })
        .catch(error => {
            console.error("Error fetching bookings:", error);
            showToast('error', 'Error', 'Failed to load bookings');
            pinBooking.innerHTML = '<option value="" disabled selected>Error loading bookings</option>';
        });
}

// Load PIN assignments
function loadPinAssignments(entryPointId = 'all') {
    console.log(`Loading PIN assignments for entry point: ${entryPointId}...`);
    
    // Get elements
    const pinsTableBody = document.getElementById('entryPinsTableBody');
    const noPinsState = document.getElementById('noPinsState');
    
    if (!pinsTableBody) {
        console.error("Pins table body element not found!");
        return;
    }
    
    // Show loading state
    pinsTableBody.innerHTML = '<tr><td colspan="7" class="px-6 py-4 text-center text-gray-500">Loading PIN assignments...</td></tr>';
    
    // Construct URL with parameters
    let url = `/api/get_entry_pins.php`;
    if (entryPointId !== 'all') {
        url += `?entry_point_id=${entryPointId}`;
    }
    
    // Fetch PIN assignments from API
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("PIN assignments loaded:", data);
            
            if (data.success) {
                const pins = data.pins;
                
                // Check if we have any PIN assignments
                if (pins.length > 0) {
                    // Build table rows for each PIN
                    let rows = '';
                    
                    pins.forEach(pin => {
                        // Format dates
                        const validUntil = new Date(pin.valid_until);
                        const validUntilFormatted = formatDateTime(validUntil);
                        
                        // Build row
                        rows += `
                            <tr>
                                <td class="px-6 py-4">${pin.entry_point_name}</td>
                                <td class="px-6 py-4">${pin.position}</td>
                                <td class="px-6 py-4">
                                    <span class="font-mono bg-gray-100 px-2 py-1 rounded">${pin.pin_code}</span>
                                </td>
                                <td class="px-6 py-4">${pin.guest_name}</td>
                                <td class="px-6 py-4">${pin.room_name}</td>
                                <td class="px-6 py-4">${validUntilFormatted}</td>
                                <td class="px-6 py-4 text-right">
                                    <button 
                                        class="delete-pin-btn px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                        data-pin-id="${pin.id}"
                                        data-entry-name="${pin.entry_point_name}"
                                        data-position="${pin.position}"
                                        data-pin-code="${pin.pin_code}"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        `;
                    });
                    
                    // Update table
                    pinsTableBody.innerHTML = rows;
                    
                    // Show table, hide empty state
                    if (noPinsState) {
                        noPinsState.classList.add('hidden');
                    }
                } else {
                    // No PIN assignments found
                    console.log("No PIN assignments found");
                    
                    // Show empty state
                    pinsTableBody.innerHTML = '';
                    if (noPinsState) {
                        noPinsState.classList.remove('hidden');
                    }
                }
            } else {
                // Error loading PIN assignments
                console.error("Error loading PIN assignments:", data.message);
                showToast('error', 'Error', 'Failed to load PIN assignments: ' + data.message);
                
                // Show error in table
                pinsTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="px-6 py-4 text-center text-red-500">
                            Error loading PIN assignments: ${data.message}
                        </td>
                    </tr>
                `;
                
                // Hide empty state
                if (noPinsState) {
                    noPinsState.classList.add('hidden');
                }
            }
        })
        .catch(error => {
            console.error("Error fetching PIN assignments:", error);
            showToast('error', 'Error', 'Failed to load PIN assignments');
            
            // Show error in table
            pinsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-red-500">
                        Error loading PIN assignments: ${error.message}
                    </td>
                </tr>
            `;
            
            // Hide empty state
            if (noPinsState) {
                noPinsState.classList.add('hidden');
            }
        });
}

// Show the assign PIN modal
function showAssignPinModal() {
    const modal = document.getElementById('assignPinModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Hide the assign PIN modal
function hideAssignPinModal() {
    const modal = document.getElementById('assignPinModal');
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Reset the form
    const form = document.getElementById('assignPinForm');
    if (form) {
        form.reset();
    }
}

// Handle PIN assignment form submission
function handleAssignPin() {
    console.log("Handling PIN assignment...");
    
    // Get form values
    const entryPointId = document.getElementById('pinEntryPoint').value;
    const position = document.getElementById('pinPosition').value;
    const pinCode = document.getElementById('pinCode').value;
    const bookingId = document.getElementById('pinBooking').value;
    
    // Validate form values
    if (!entryPointId || !position || !pinCode || !bookingId) {
        showToast('error', 'Error', 'All fields are required');
        return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('entry_point_id', entryPointId);
    formData.append('position', position);
    formData.append('pin_code', pinCode);
    formData.append('booking_id', bookingId);
    
    // Disable submit button
    const submitButton = document.getElementById('saveAssignPinBtn');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = 'Assigning...';
    }
    
    // Send request to API
    fetch('/api/assign_pin.php', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("PIN assignment response:", data);
            
            if (data.success) {
                showToast('success', 'Success', 'PIN assigned successfully');
                hideAssignPinModal();
                loadPinAssignments(document.getElementById('entryPointFilterSelect').value);
            } else {
                showToast('error', 'Error', 'Failed to assign PIN: ' + data.message);
            }
        })
        .catch(error => {
            console.error("Error assigning PIN:", error);
            showToast('error', 'Error', 'Failed to assign PIN');
        })
        .finally(() => {
            // Re-enable submit button
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Assign PIN';
            }
        });
}

// Show the delete PIN confirmation modal
function showDeletePinModal(pinId, entryName, position, pinCode) {
    // Get modal elements
    const modal = document.getElementById('deletePinModal');
    const pinIdInput = document.getElementById('deletePinId');
    const entryNameSpan = document.getElementById('deletePinEntryName');
    const positionSpan = document.getElementById('deletePinPosition');
    const pinCodeSpan = document.getElementById('deletePinCode');
    
    if (modal && pinIdInput && entryNameSpan && positionSpan && pinCodeSpan) {
        // Set values
        pinIdInput.value = pinId;
        entryNameSpan.textContent = entryName;
        positionSpan.textContent = position;
        pinCodeSpan.textContent = pinCode;
        
        // Show modal
        modal.classList.remove('hidden');
    }
}

// Hide the delete PIN confirmation modal
function hideDeletePinModal() {
    const modal = document.getElementById('deletePinModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Delete a PIN assignment
function deletePin(pinId) {
    console.log("Deleting PIN assignment:", pinId);
    
    // Create form data
    const formData = new FormData();
    formData.append('pin_id', pinId);
    
    // Disable delete button
    const deleteButton = document.getElementById('confirmDeletePinBtn');
    if (deleteButton) {
        deleteButton.disabled = true;
        deleteButton.innerHTML = 'Deleting...';
    }
    
    // Send request to API
    fetch('/api/delete_pin.php', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log("PIN deletion response:", data);
            
            if (data.success) {
                showToast('success', 'Success', 'PIN deleted successfully');
                hideDeletePinModal();
                loadPinAssignments(document.getElementById('entryPointFilterSelect').value);
            } else {
                showToast('error', 'Error', 'Failed to delete PIN: ' + data.message);
            }
        })
        .catch(error => {
            console.error("Error deleting PIN:", error);
            showToast('error', 'Error', 'Failed to delete PIN');
        })
        .finally(() => {
            // Re-enable delete button
            if (deleteButton) {
                deleteButton.disabled = false;
                deleteButton.innerHTML = 'Delete PIN';
            }
        });
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

// Export functions for global access
window.loadPinAssignments = loadPinAssignments;
