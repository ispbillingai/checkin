
/**
 * Admin Entry Points Management
 */

// Global state for entry points management
let entryPoints = [];
let rooms = [];
let entryPointRooms = {};
let currentEntryPoint = null;

// Initialize entry points management
function initEntryPointsManagement() {
  console.log('Initializing entry points management');
  
  // Load entry points
  loadEntryPoints();
  
  // Set up event listeners
  setupEntryPointsEventListeners();
}

// Load all entry points
function loadEntryPoints() {
  console.log('Loading entry points');
  const entryPointsList = document.getElementById('entryPointsList');
  
  if (!entryPointsList) {
    console.error('Entry points list element not found');
    return;
  }
  
  entryPointsList.innerHTML = `
    <tr>
      <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
        <div class="flex justify-center items-center">
          <svg class="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading entry points...
        </div>
      </td>
    </tr>
  `;
  
  fetch('/api/get_all_entry_points.php')
    .then(response => {
      console.log(`Entry points API response status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Entry points data:', data);
      
      if (data.success && Array.isArray(data.entry_points)) {
        entryPoints = data.entry_points;
        renderEntryPointsList();
      } else {
        entryPointsList.innerHTML = `
          <tr>
            <td colspan="4" class="px-6 py-4 text-center text-sm text-red-500">
              Failed to load entry points: ${data.message || 'Unknown error'}
            </td>
          </tr>
        `;
        console.error('Error loading entry points:', data.message);
      }
    })
    .catch(error => {
      console.error('Error loading entry points:', error);
      entryPointsList.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-4 text-center text-sm text-red-500">
            Error loading entry points. Please try again.
          </td>
        </tr>
      `;
    });
}

// Render entry points list
function renderEntryPointsList() {
  console.log(`Rendering ${entryPoints.length} entry points`);
  const entryPointsList = document.getElementById('entryPointsList');
  
  if (!entryPointsList) {
    console.error('Entry points list element not found');
    return;
  }
  
  if (entryPoints.length === 0) {
    entryPointsList.innerHTML = `
      <tr>
        <td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">
          No entry points found. Click "Add Entry Point" to create one.
        </td>
      </tr>
    `;
    return;
  }
  
  entryPointsList.innerHTML = '';
  
  entryPoints.forEach(entryPoint => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${entryPoint.id}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
        ${entryPoint.name}
      </td>
      <td class="px-6 py-4 text-sm text-gray-500">
        ${entryPoint.description || 'No description'}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div class="flex space-x-2">
          <button class="edit-entry-point text-blue-600 hover:text-blue-900" data-id="${entryPoint.id}">
            Edit
          </button>
          <button class="assign-rooms text-green-600 hover:text-green-900" data-id="${entryPoint.id}">
            Assign Rooms
          </button>
          <button class="delete-entry-point text-red-600 hover:text-red-900" data-id="${entryPoint.id}">
            Delete
          </button>
        </div>
      </td>
    `;
    
    entryPointsList.appendChild(row);
  });
  
  // Add event listeners to action buttons
  document.querySelectorAll('.edit-entry-point').forEach(button => {
    button.addEventListener('click', handleEditEntryPoint);
  });
  
  document.querySelectorAll('.assign-rooms').forEach(button => {
    button.addEventListener('click', handleAssignRooms);
  });
  
  document.querySelectorAll('.delete-entry-point').forEach(button => {
    button.addEventListener('click', handleDeleteEntryPoint);
  });
}

// Set up event listeners
function setupEntryPointsEventListeners() {
  console.log('Setting up entry points event listeners');
  
  // Add entry point button
  const addEntryPointBtn = document.getElementById('addEntryPointBtn');
  if (addEntryPointBtn) {
    addEntryPointBtn.addEventListener('click', () => {
      showEntryPointForm();
    });
  }
  
  // Cancel entry point form button
  const cancelEntryPointBtn = document.getElementById('cancelEntryPointBtn');
  if (cancelEntryPointBtn) {
    cancelEntryPointBtn.addEventListener('click', () => {
      hideEntryPointForm();
    });
  }
  
  // Save entry point form
  const saveEntryPointForm = document.getElementById('saveEntryPointForm');
  if (saveEntryPointForm) {
    saveEntryPointForm.addEventListener('submit', handleSaveEntryPoint);
  }
  
  // Cancel rooms form button
  const cancelRoomsBtn = document.getElementById('cancelRoomsBtn');
  if (cancelRoomsBtn) {
    cancelRoomsBtn.addEventListener('click', () => {
      hideRoomsForm();
    });
  }
  
  // Save rooms assignments form
  const assignRoomsForm = document.getElementById('assignRoomsForm');
  if (assignRoomsForm) {
    assignRoomsForm.addEventListener('submit', handleSaveRoomAssignments);
  }
  
  // Confirmation dialog buttons
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      hideConfirmationDialog();
    });
  }
  
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', confirmDeleteEntryPoint);
  }
}

// Show entry point form for adding or editing
function showEntryPointForm(entryPoint = null) {
  console.log('Showing entry point form', entryPoint);
  currentEntryPoint = entryPoint;
  
  const entryPointForm = document.getElementById('entryPointForm');
  const formTitle = document.getElementById('formTitle');
  const entryPointId = document.getElementById('entryPointId');
  const entryPointName = document.getElementById('entryPointName');
  const entryPointDescription = document.getElementById('entryPointDescription');
  
  // Hide rooms form if it's open
  hideRoomsForm();
  
  if (entryPoint) {
    // Editing existing entry point
    formTitle.textContent = 'Edit Entry Point';
    entryPointId.value = entryPoint.id;
    entryPointName.value = entryPoint.name;
    entryPointDescription.value = entryPoint.description || '';
  } else {
    // Adding new entry point
    formTitle.textContent = 'Add New Entry Point';
    entryPointId.value = '';
    entryPointName.value = '';
    entryPointDescription.value = '';
  }
  
  entryPointForm.classList.remove('hidden');
  entryPointName.focus();
}

// Hide entry point form
function hideEntryPointForm() {
  console.log('Hiding entry point form');
  const entryPointForm = document.getElementById('entryPointForm');
  entryPointForm.classList.add('hidden');
  currentEntryPoint = null;
}

// Handle save entry point form submission
function handleSaveEntryPoint(event) {
  event.preventDefault();
  console.log('Saving entry point');
  
  const form = event.target;
  const formData = new FormData(form);
  
  const id = formData.get('id');
  const name = formData.get('name');
  const description = formData.get('description');
  
  const entryPointData = {
    id: id || null,
    name: name,
    description: description
  };
  
  console.log('Entry point data:', entryPointData);
  
  // Simulate API call
  const action = id ? 'update' : 'create';
  
  const requestData = new FormData();
  requestData.append('action', action);
  requestData.append('entry_point', JSON.stringify(entryPointData));
  
  fetch('/api/manage_entry_points.php', {
    method: 'POST',
    body: requestData
  })
    .then(response => {
      console.log(`Entry point ${action} API response status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log(`Entry point ${action} response:`, data);
      
      if (data.success) {
        // Show success message
        showToast('success', `Entry point ${id ? 'updated' : 'created'} successfully`);
        
        // Reload entry points
        loadEntryPoints();
        
        // Hide form
        hideEntryPointForm();
      } else {
        // Show error message
        showToast('error', `Failed to ${id ? 'update' : 'create'} entry point: ${data.message}`);
      }
    })
    .catch(error => {
      console.error(`Error ${action} entry point:`, error);
      showToast('error', `Error ${id ? 'updating' : 'creating'} entry point. Please try again.`);
    });
}

// Handle edit entry point button click
function handleEditEntryPoint(event) {
  const entryPointId = event.target.getAttribute('data-id');
  console.log(`Edit entry point: ${entryPointId}`);
  
  const entryPoint = entryPoints.find(ep => ep.id === entryPointId);
  
  if (entryPoint) {
    showEntryPointForm(entryPoint);
  } else {
    console.error(`Entry point with ID ${entryPointId} not found`);
    showToast('error', 'Entry point not found');
  }
}

// Handle assign rooms button click
function handleAssignRooms(event) {
  const entryPointId = event.target.getAttribute('data-id');
  console.log(`Assign rooms to entry point: ${entryPointId}`);
  
  const entryPoint = entryPoints.find(ep => ep.id === entryPointId);
  
  if (!entryPoint) {
    console.error(`Entry point with ID ${entryPointId} not found`);
    showToast('error', 'Entry point not found');
    return;
  }
  
  // Hide entry point form if it's open
  hideEntryPointForm();
  
  // Show rooms form
  const entryPointRoomsForm = document.getElementById('entryPointRoomsForm');
  const roomsFormTitle = document.getElementById('roomsFormTitle');
  const assignEntryPointId = document.getElementById('assignEntryPointId');
  const roomCheckboxes = document.getElementById('roomCheckboxes');
  
  roomsFormTitle.textContent = `Assign Rooms to ${entryPoint.name}`;
  assignEntryPointId.value = entryPoint.id;
  
  roomCheckboxes.innerHTML = `
    <div class="animate-pulse">
      <div class="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div class="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div class="h-5 bg-gray-200 rounded w-2/5 mb-2"></div>
    </div>
  `;
  
  entryPointRoomsForm.classList.remove('hidden');
  
  // Load rooms and room assignments
  loadRoomsForEntryPoint(entryPoint.id);
}

// Load rooms for assigning to entry point
function loadRoomsForEntryPoint(entryPointId) {
  console.log(`Loading rooms for entry point: ${entryPointId}`);
  
  // Load all rooms
  fetch('/api/get_all_rooms.php')
    .then(response => {
      console.log(`Rooms API response status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Rooms data:', data);
      
      if (data.success && Array.isArray(data.rooms)) {
        rooms = data.rooms;
        
        // Now load room assignments for this entry point
        loadRoomAssignments(entryPointId);
      } else {
        const roomCheckboxes = document.getElementById('roomCheckboxes');
        roomCheckboxes.innerHTML = `
          <div class="text-center text-sm text-red-500">
            Failed to load rooms: ${data.message || 'Unknown error'}
          </div>
        `;
        console.error('Error loading rooms:', data.message);
      }
    })
    .catch(error => {
      console.error('Error loading rooms:', error);
      const roomCheckboxes = document.getElementById('roomCheckboxes');
      roomCheckboxes.innerHTML = `
        <div class="text-center text-sm text-red-500">
          Error loading rooms. Please try again.
        </div>
      `;
    });
}

// Load room assignments for entry point
function loadRoomAssignments(entryPointId) {
  console.log(`Loading room assignments for entry point: ${entryPointId}`);
  
  // Simulate API call to get room assignments
  fetch(`/api/get_entry_points.php?entry_point_id=${entryPointId}`)
    .then(response => {
      console.log(`Room assignments API response status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Room assignments data:', data);
      
      let assignedRoomIds = [];
      
      if (data.success && data.room_assignments) {
        assignedRoomIds = data.room_assignments.map(ra => ra.room_id);
      }
      
      // Render room checkboxes
      renderRoomCheckboxes(assignedRoomIds);
    })
    .catch(error => {
      console.error('Error loading room assignments:', error);
      
      // Render room checkboxes without assignments
      renderRoomCheckboxes([]);
    });
}

// Render room checkboxes for assignment
function renderRoomCheckboxes(assignedRoomIds = []) {
  console.log(`Rendering room checkboxes with assigned rooms: ${assignedRoomIds.join(', ')}`);
  const roomCheckboxes = document.getElementById('roomCheckboxes');
  
  if (!roomCheckboxes) {
    console.error('Room checkboxes element not found');
    return;
  }
  
  if (rooms.length === 0) {
    roomCheckboxes.innerHTML = `
      <div class="text-center text-sm text-gray-500">
        No rooms found. Please create rooms first.
      </div>
    `;
    return;
  }
  
  roomCheckboxes.innerHTML = '';
  
  rooms.forEach(room => {
    const isChecked = assignedRoomIds.includes(room.id);
    
    const div = document.createElement('div');
    div.className = 'flex items-center';
    
    div.innerHTML = `
      <input type="checkbox" id="room_${room.id}" name="rooms[]" value="${room.id}" 
        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        ${isChecked ? 'checked' : ''}>
      <label for="room_${room.id}" class="ml-2 block text-sm text-gray-900">
        ${room.name} ${room.description ? `- ${room.description}` : ''}
      </label>
    `;
    
    roomCheckboxes.appendChild(div);
  });
}

// Hide rooms form
function hideRoomsForm() {
  console.log('Hiding rooms form');
  const entryPointRoomsForm = document.getElementById('entryPointRoomsForm');
  entryPointRoomsForm.classList.add('hidden');
}

// Handle save room assignments form submission
function handleSaveRoomAssignments(event) {
  event.preventDefault();
  console.log('Saving room assignments');
  
  const form = event.target;
  const formData = new FormData(form);
  
  const entryPointId = formData.get('entryPointId');
  const selectedRoomIds = formData.getAll('rooms[]');
  
  console.log(`Entry point ID: ${entryPointId}`);
  console.log(`Selected room IDs: ${selectedRoomIds.join(', ')}`);
  
  const requestData = new FormData();
  requestData.append('action', 'assign_rooms');
  requestData.append('entry_point_id', entryPointId);
  requestData.append('room_ids', JSON.stringify(selectedRoomIds));
  
  fetch('/api/manage_entry_points.php', {
    method: 'POST',
    body: requestData
  })
    .then(response => {
      console.log(`Assign rooms API response status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Assign rooms response:', data);
      
      if (data.success) {
        // Show success message
        showToast('success', 'Room assignments saved successfully');
        
        // Hide form
        hideRoomsForm();
      } else {
        // Show error message
        showToast('error', `Failed to save room assignments: ${data.message}`);
      }
    })
    .catch(error => {
      console.error('Error saving room assignments:', error);
      showToast('error', 'Error saving room assignments. Please try again.');
    });
}

// Handle delete entry point button click
function handleDeleteEntryPoint(event) {
  const entryPointId = event.target.getAttribute('data-id');
  console.log(`Delete entry point: ${entryPointId}`);
  
  const entryPoint = entryPoints.find(ep => ep.id === entryPointId);
  
  if (!entryPoint) {
    console.error(`Entry point with ID ${entryPointId} not found`);
    showToast('error', 'Entry point not found');
    return;
  }
  
  // Show confirmation dialog
  const confirmationDialog = document.getElementById('confirmationDialog');
  const confirmationMessage = document.getElementById('confirmationMessage');
  
  confirmationMessage.textContent = `Are you sure you want to delete the entry point "${entryPoint.name}"? This action cannot be undone.`;
  confirmDeleteBtn.setAttribute('data-id', entryPoint.id);
  
  confirmationDialog.classList.remove('hidden');
}

// Hide confirmation dialog
function hideConfirmationDialog() {
  console.log('Hiding confirmation dialog');
  const confirmationDialog = document.getElementById('confirmationDialog');
  confirmationDialog.classList.add('hidden');
}

// Confirm delete entry point
function confirmDeleteEntryPoint() {
  const entryPointId = document.getElementById('confirmDeleteBtn').getAttribute('data-id');
  console.log(`Confirming delete entry point: ${entryPointId}`);
  
  const requestData = new FormData();
  requestData.append('action', 'delete');
  requestData.append('entry_point_id', entryPointId);
  
  fetch('/api/manage_entry_points.php', {
    method: 'POST',
    body: requestData
  })
    .then(response => {
      console.log(`Delete entry point API response status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Delete entry point response:', data);
      
      if (data.success) {
        // Show success message
        showToast('success', 'Entry point deleted successfully');
        
        // Reload entry points
        loadEntryPoints();
      } else {
        // Show error message
        showToast('error', `Failed to delete entry point: ${data.message}`);
      }
      
      // Hide confirmation dialog
      hideConfirmationDialog();
    })
    .catch(error => {
      console.error('Error deleting entry point:', error);
      showToast('error', 'Error deleting entry point. Please try again.');
      
      // Hide confirmation dialog
      hideConfirmationDialog();
    });
}

// Show toast message
function showToast(type, message) {
  console.log(`Showing toast: ${type} - ${message}`);
  
  // Use global toast function if available
  if (typeof window.showToastMessage === 'function') {
    window.showToastMessage(type, message);
  } else {
    // Fallback for testing
    alert(`${type.toUpperCase()}: ${message}`);
  }
}

// Export function for use in other modules
window.initEntryPointsManagement = initEntryPointsManagement;
