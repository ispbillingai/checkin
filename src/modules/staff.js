import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel, showModal, hideModal, clearForm } from './navigation.js';
import { generatePinCode } from '../utils/pin-utils.js';

// Load staff data
const loadStaff = async () => {
  if (!checkAuthStatus()) return;
  
  try {
    showPanel('staff');
    
    const response = await fetch('/api/get_staff.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    
    const tableBody = document.getElementById('staff-table');
    tableBody.innerHTML = '';
    
    if (data.success && data.staff && data.staff.length > 0) {
      for (const staff of data.staff) {
        const row = document.createElement('tr');
        
        const accessInfo = staff.access_all_rooms 
          ? '<span class="text-green-600 font-medium">All Rooms</span>' 
          : `<span class="text-blue-600">${staff.rooms ? staff.rooms.split(',').length : 0} Rooms, ${staff.entry_points ? staff.entry_points.split(',').length : 0} Entry Points</span>`;
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${staff.name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${staff.email}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${staff.phone || 'Not set'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${accessInfo}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button class="text-blue-600 hover:text-blue-800 mr-2 edit-staff-btn" data-staff='${JSON.stringify(staff)}'>
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="text-red-600 hover:text-red-800 delete-staff-btn" data-id="${staff.id}" data-name="${staff.name}">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </td>
        `;
        
        tableBody.appendChild(row);
      }
      
      addStaffEventListeners();
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">No staff members found</td>
        </tr>
      `;
    }
  } catch (error) {
    logError(error, 'Loading Staff');
    showToast('Failed to load staff members', 'error');
  }
};

// Add event listeners to staff buttons
const addStaffEventListeners = () => {
  // Add staff button - moved to initStaffModule to avoid duplication
  
  // Edit staff buttons
  document.querySelectorAll('.edit-staff-btn').forEach(button => {
    button.addEventListener('click', () => {
      const staffData = JSON.parse(button.getAttribute('data-staff'));
      document.getElementById('staff-form-title').textContent = 'Edit Staff';
      document.getElementById('staff-name').value = staffData.name;
      document.getElementById('staff-email').value = staffData.email;
      document.getElementById('staff-phone').value = staffData.phone || '';
      document.getElementById('staff-password').value = ''; // Don't show PIN code
      
      // Set access_all_rooms checkbox
      const accessAllRooms = document.getElementById('access-all-rooms');
      accessAllRooms.checked = staffData.access_all_rooms == 1;
      
      // Show/hide specific rooms container based on access_all_rooms
      document.getElementById('specific-rooms-container').style.display = 
        staffData.access_all_rooms == 1 ? 'none' : 'block';
      
      // Set selected rooms and positions
      const roomIds = staffData.rooms ? staffData.rooms.split(',') : [];
      const roomPositions = staffData.room_positions ? staffData.room_positions.split(',') : [];
      
      document.querySelectorAll('.room-checkbox').forEach(checkbox => {
        const roomId = checkbox.value;
        const index = roomIds.indexOf(roomId);
        checkbox.checked = index !== -1;
        
        const positionInput = document.getElementById(`room-pos-${roomId}`);
        if (positionInput) {
          positionInput.disabled = index === -1;
          positionInput.value = index !== -1 ? (roomPositions[index] || "1") : "";
        }
      });
      
      // Set selected entry points and positions
      const entryIds = staffData.entry_points ? staffData.entry_points.split(',') : [];
      const entryPositions = staffData.entry_point_positions ? staffData.entry_point_positions.split(',') : [];
      
      document.querySelectorAll('.entry-point-checkbox').forEach(checkbox => {
        const entryId = checkbox.value;
        const index = entryIds.indexOf(entryId);
        checkbox.checked = index !== -1;
        
        const positionInput = document.getElementById(`entry-pos-${entryId}`);
        if (positionInput) {
          positionInput.disabled = index === -1;
          positionInput.value = index !== -1 ? (entryPositions[index] || "1") : "";
        }
      });
      
      // Set form mode and staff ID
      document.getElementById('staff-form').setAttribute('data-mode', 'edit');
      document.getElementById('staff-form').setAttribute('data-staff-id', staffData.id);
      
      showModal('staff-modal');
    });
  });
  
  // Delete staff buttons
  document.querySelectorAll('.delete-staff-btn').forEach(button => {
    button.addEventListener('click', () => {
      const staffId = button.getAttribute('data-id');
      const staffName = button.getAttribute('data-name');
      if (confirm(`Are you sure you want to delete staff member "${staffName}"?`)) {
        deleteStaff(staffId);
      }
    });
  });
  
  // Toggle access all rooms
  const accessAllRoomsCheckbox = document.getElementById('access-all-rooms');
  if (accessAllRoomsCheckbox) {
    accessAllRoomsCheckbox.addEventListener('change', (e) => {
      const specificRoomsContainer = document.getElementById('specific-rooms-container');
      specificRoomsContainer.style.display = e.target.checked ? 'none' : 'block';
    });
  }
};

// Get the total number of rooms for entry point position calculation
const getTotalRoomCount = async () => {
  try {
    const response = await fetch('/api/get_rooms.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.rooms) {
      return data.rooms.length;
    }
    
    return 0;
  } catch (error) {
    logError(error, 'Getting Room Count');
    return 0;
  }
};

// Get next available staff position for rooms (starting from 2, not 1)
const getNextAvailableStaffPosition = (existingPositions, startPosition = 2) => {
  // Convert positions to numbers and sort them
  const positions = existingPositions.map(pos => parseInt(pos)).sort((a, b) => a - b);
  
  // Find the first gap in the sequence, starting from startPosition
  let nextPos = startPosition;
  while (positions.includes(nextPos)) {
    nextPos++;
  }
  
  return nextPos.toString();
};

// Get currently used positions
const getCurrentPositions = async () => {
  try {
    // Fetch all staff to get their positions
    const response = await fetch('/api/get_staff.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    
    if (!data.success || !data.staff) {
      return { roomPositions: [], entryPositions: [] };
    }
    
    // Extract all room positions
    const roomPositions = [];
    // Extract all entry positions
    const entryPositions = [];
    
    data.staff.forEach(staff => {
      if (staff.room_positions) {
        const positions = staff.room_positions.split(',');
        positions.forEach(pos => {
          if (pos && !isNaN(parseInt(pos))) {
            roomPositions.push(pos);
          }
        });
      }
      
      if (staff.entry_point_positions) {
        const positions = staff.entry_point_positions.split(',');
        positions.forEach(pos => {
          if (pos && !isNaN(parseInt(pos))) {
            entryPositions.push(pos);
          }
        });
      }
    });
    
    console.log("Current room positions:", roomPositions);
    console.log("Current entry positions:", entryPositions);
    
    return { roomPositions, entryPositions };
  } catch (error) {
    logError(error, 'Getting Current Positions');
    return { roomPositions: [], entryPositions: [] };
  }
};

// Set up position auto-assignment with the new rules - prevent double triggers
const setupPositionAutoAssignment = async () => {
  // Get current positions in use
  const { roomPositions, entryPositions } = await getCurrentPositions();
  const totalRooms = await getTotalRoomCount();
  
  // Remove any existing event listeners (to prevent duplicates)
  document.querySelectorAll('.room-checkbox').forEach(checkbox => {
    const newCheckbox = checkbox.cloneNode(true);
    checkbox.parentNode.replaceChild(newCheckbox, checkbox);
  });
  
  document.querySelectorAll('.entry-point-checkbox').forEach(checkbox => {
    const newCheckbox = checkbox.cloneNode(true);
    checkbox.parentNode.replaceChild(newCheckbox, checkbox);
  });
  
  // Add event listeners to room checkboxes for real-time position assignment
  document.querySelectorAll('.room-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const roomId = e.target.value;
      const positionInput = document.getElementById(`room-pos-${roomId}`);
      
      if (positionInput) {
        positionInput.disabled = !e.target.checked;
        if (e.target.checked) {
          // Assign the next available position when checked (starting from 2)
          getCurrentPositions().then(({ roomPositions }) => {
            const nextPos = getNextAvailableStaffPosition(roomPositions, 2);
            positionInput.value = nextPos;
            console.log(`Assigned room ${roomId} to position ${nextPos}`);
          });
        } else {
          positionInput.value = "";
        }
      }
    });
  });
  
  // Add event listeners to entry point checkboxes for real-time position assignment
  document.querySelectorAll('.entry-point-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const entryId = e.target.value;
      const positionInput = document.getElementById(`entry-pos-${entryId}`);
      
      if (positionInput) {
        positionInput.disabled = !e.target.checked;
        if (e.target.checked) {
          // Assign the next available position when checked (starting after total room count)
          getCurrentPositions().then(({ entryPositions }) => {
            // Entry positions start after the total room count
            const startPos = totalRooms + 1;
            const nextPos = getNextAvailableStaffPosition(entryPositions, startPos);
            positionInput.value = nextPos;
            console.log(`Assigned entry point ${entryId} to position ${nextPos} (starting from ${startPos})`);
          });
        } else {
          positionInput.value = "";
        }
      }
    });
  });
};

// Load rooms for staff form
const loadRoomsForStaffForm = async () => {
  try {
    const response = await fetch('/api/get_rooms.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    const roomsContainer = document.getElementById('rooms-selection');
    
    if (data.success && data.rooms.length > 0) {
      roomsContainer.innerHTML = '';
      
      for (const room of data.rooms) {
        const roomDiv = document.createElement('div');
        roomDiv.className = 'flex items-center justify-between border-b last:border-0 py-2';
        
        roomDiv.innerHTML = `
          <div class="flex items-center">
            <input type="checkbox" id="room-${room.id}" name="rooms[]" value="${room.id}" class="room-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="room-${room.id}" class="ml-2 block text-sm text-gray-700">${room.name}</label>
          </div>
          <div class="flex items-center">
            <label for="room-pos-${room.id}" class="mr-2 text-xs text-gray-600">Position:</label>
            <input type="number" id="room-pos-${room.id}" name="room-positions[]" min="2" max="99" class="room-position w-16 px-2 py-1 text-sm border border-gray-300 rounded" disabled>
            <span class="tooltip ml-1">
              <i class="fas fa-info-circle text-gray-500"></i>
              <span class="tooltiptext">Staff positions start at 2 (position 1 is for guests)</span>
            </span>
          </div>
        `;
        
        roomsContainer.appendChild(roomDiv);
      }
      
      // Set up auto-assignment after rendering all rooms
      setupPositionAutoAssignment();
    } else {
      roomsContainer.innerHTML = '<p class="text-gray-500 text-sm">No rooms available</p>';
    }
  } catch (error) {
    logError(error, 'Loading Rooms for Staff Form');
    document.getElementById('rooms-selection').innerHTML = '<p class="text-red-500 text-sm">Failed to load rooms</p>';
  }
};

// Load entry points for staff form
const loadEntryPointsForStaffForm = async () => {
  try {
    // Clear any existing entry points first to prevent duplicates
    const entryPointsContainer = document.getElementById('entry-points-selection');
    if (entryPointsContainer) {
      entryPointsContainer.innerHTML = '<p class="text-gray-500 text-sm">Loading entry points...</p>';
    } else {
      console.error("Entry points container not found in the DOM");
      return;
    }
    
    const response = await fetch('/api/get_entry_points.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    
    if (data.success && data.entry_points.length > 0) {
      // Clear the container again before adding new elements
      entryPointsContainer.innerHTML = '';
      const totalRooms = await getTotalRoomCount();
      
      // Add a tracking set to prevent duplicates
      const addedEntryPointIds = new Set();
      
      for (const entryPoint of data.entry_points) {
        // Skip if this entry point was already added
        if (addedEntryPointIds.has(entryPoint.id)) {
          console.log(`Skipping duplicate entry point: ${entryPoint.id}`);
          continue;
        }
        
        // Mark this entry point as added
        addedEntryPointIds.add(entryPoint.id);
        
        const entryPointDiv = document.createElement('div');
        entryPointDiv.className = 'flex items-center justify-between border-b last:border-0 py-2';
        
        entryPointDiv.innerHTML = `
          <div class="flex items-center">
            <input type="checkbox" id="entry-${entryPoint.id}" name="entry-points[]" value="${entryPoint.id}" class="entry-point-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
            <label for="entry-${entryPoint.id}" class="ml-2 block text-sm text-gray-700">${entryPoint.name}</label>
          </div>
          <div class="flex items-center">
            <label for="entry-pos-${entryPoint.id}" class="mr-2 text-xs text-gray-600">Position:</label>
            <input type="number" id="entry-pos-${entryPoint.id}" name="entry-point-positions[]" min="${totalRooms + 1}" max="99" class="entry-position w-16 px-2 py-1 text-sm border border-gray-300 rounded" disabled>
            <span class="tooltip ml-1">
              <i class="fas fa-info-circle text-gray-500"></i>
              <span class="tooltiptext">Entry positions start at position ${totalRooms + 1} (after all rooms)</span>
            </span>
          </div>
        `;
        
        entryPointsContainer.appendChild(entryPointDiv);
      }
      
      console.log(`Added ${addedEntryPointIds.size} unique entry points`);
      
      // After adding all entry points to the DOM, set up the position auto-assignment
      // With a longer delay to ensure everything is rendered
      setTimeout(() => {
        setupPositionAutoAssignment();
      }, 200);
    } else {
      entryPointsContainer.innerHTML = '<p class="text-gray-500 text-sm">No entry points available</p>';
    }
  } catch (error) {
    logError(error, 'Loading Entry Points for Staff Form');
    document.getElementById('entry-points-selection').innerHTML = '<p class="text-red-500 text-sm">Failed to load entry points</p>';
  }
};

// Auto-assign positions to new staff selections with new rules
const autoAssignPositions = async () => {
  // Get current positions in use
  const { roomPositions, entryPositions } = await getCurrentPositions();
  const totalRooms = await getTotalRoomCount();
  
  // Get all checked rooms without positions
  const roomsWithoutPosition = [];
  document.querySelectorAll('.room-checkbox:checked').forEach(checkbox => {
    const roomId = checkbox.value;
    const posInput = document.getElementById(`room-pos-${roomId}`);
    if (posInput && (posInput.value === "" || isNaN(parseInt(posInput.value)))) {
      roomsWithoutPosition.push({ id: roomId, input: posInput });
    }
  });
  
  // Get all checked entry points without positions
  const entriesWithoutPosition = [];
  document.querySelectorAll('.entry-point-checkbox:checked').forEach(checkbox => {
    const entryId = checkbox.value;
    const posInput = document.getElementById(`entry-pos-${entryId}`);
    if (posInput && (posInput.value === "" || isNaN(parseInt(posInput.value)))) {
      entriesWithoutPosition.push({ id: entryId, input: posInput });
    }
  });
  
  console.log("Rooms without position:", roomsWithoutPosition.length);
  console.log("Entries without position:", entriesWithoutPosition.length);
  
  // Assign positions sequentially, filling gaps, starting at 2 for rooms
  let usedRoomPositions = [...roomPositions]; // Copy to avoid modifying the original
  roomsWithoutPosition.forEach(item => {
    const nextPos = getNextAvailableStaffPosition(usedRoomPositions, 2);
    item.input.value = nextPos;
    usedRoomPositions.push(nextPos); // Add to used positions for next item
    console.log(`Auto-assigned room ${item.id} to position ${nextPos}`);
  });
  
  // Entry positions start after total room count
  const entryStartPos = totalRooms + 1;
  let usedEntryPositions = [...entryPositions]; // Copy to avoid modifying the original
  entriesWithoutPosition.forEach(item => {
    const nextPos = getNextAvailableStaffPosition(usedEntryPositions, entryStartPos);
    item.input.value = nextPos;
    usedEntryPositions.push(nextPos); // Add to used positions for next item
    console.log(`Auto-assigned entry ${item.id} to position ${nextPos} (starting from ${entryStartPos})`);
  });
};

// Save staff (add or edit)
const saveStaff = async () => {
  try {
    const mode = document.getElementById('staff-form').getAttribute('data-mode');
    const staffId = mode === 'edit' ? document.getElementById('staff-form').getAttribute('data-staff-id') : null;
    const staffName = document.getElementById('staff-name').value.trim();
    const staffEmail = document.getElementById('staff-email').value.trim();
    const staffPhone = document.getElementById('staff-phone').value.trim();
    const staffPinCode = document.getElementById('staff-password').value.trim();
    const accessAllRooms = document.getElementById('access-all-rooms').checked;
    
    if (!staffName || !staffEmail) {
      showToast('Name and Email are required', 'error');
      return;
    }
    
    if (mode === 'add' && !staffPinCode) {
      showToast('PIN code is required for new staff members', 'error');
      return;
    }
    
    // For new staff, auto-assign positions before saving
    if (mode === 'add') {
      await autoAssignPositions();
    }
    
    // Get selected rooms and positions
    const selectedRooms = [];
    const roomPositions = [];
    
    if (!accessAllRooms) {
      document.querySelectorAll('.room-checkbox:checked').forEach(checkbox => {
        const roomId = checkbox.value;
        selectedRooms.push(roomId);
        
        const positionInput = document.getElementById(`room-pos-${roomId}`);
        roomPositions.push(positionInput ? positionInput.value || "1" : "1");
      });
    }
    
    // Get selected entry points and positions
    const selectedEntryPoints = [];
    const entryPositions = [];
    
    document.querySelectorAll('.entry-point-checkbox:checked').forEach(checkbox => {
      const entryId = checkbox.value;
      selectedEntryPoints.push(entryId);
      
      const positionInput = document.getElementById(`entry-pos-${entryId}`);
      entryPositions.push(positionInput ? positionInput.value || "1" : "1");
    });
    
    console.log("Saving staff with room positions:", roomPositions);
    console.log("Saving staff with entry positions:", entryPositions);
    
    const staffData = {
      id: staffId,
      name: staffName,
      email: staffEmail,
      phone: staffPhone,
      password: staffPinCode,
      access_all_rooms: accessAllRooms ? 1 : 0,
      rooms: selectedRooms.join(','),
      room_positions: roomPositions.join(','),
      entry_points: selectedEntryPoints.join(','),
      entry_point_positions: entryPositions.join(',')
    };
    
    // Remove password if empty (for edit mode)
    if (!staffData.password) {
      delete staffData.password;
    }
    
    const endpoint = mode === 'add' ? '/api/add_staff.php' : '/api/update_staff.php';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(staffData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast(`Staff member ${mode === 'add' ? 'added' : 'updated'} successfully`, 'success');
      hideModal('staff-modal');
      loadStaff();
    } else {
      throw new Error(data.message || `Failed to ${mode} staff member`);
    }
  } catch (error) {
    logError(error, 'Save Staff');
    showToast(`Error: ${error.message}`, 'error');
  }
};

// Delete staff
const deleteStaff = async (staffId) => {
  try {
    const response = await fetch('/api/delete_staff.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({ id: staffId }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Staff member deleted successfully', 'success');
      loadStaff();
    } else {
      throw new Error(data.message || 'Failed to delete staff member');
    }
  } catch (error) {
    logError(error, 'Delete Staff');
    showToast(`Error: ${error.message}`, 'error');
  }
};

// Initialize staff module with improved loading logic
const initStaffModule = () => {
  // Add event listener to the nav link to load staff
  document.getElementById('nav-staff').addEventListener('click', async () => {
    await loadStaff();
    // First load rooms, then load entry points sequentially
    await loadRoomsForStaffForm();
    await loadEntryPointsForStaffForm();
  });
  
  // Add event listener for the save staff button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'save-staff-btn') {
      saveStaff();
    }
  });
  
  // Add event listener for the add staff button directly on the button
  const addStaffBtn = document.getElementById('add-staff-btn');
  if (addStaffBtn) {
    addStaffBtn.addEventListener('click', async () => {
      clearForm('staff-form');
      document.getElementById('staff-form-title').textContent = 'Add New Staff';
      document.getElementById('staff-form').setAttribute('data-mode', 'add');
      document.getElementById('access-all-rooms').checked = false;
      document.getElementById('specific-rooms-container').style.display = 'block';
      
      // Auto-generate a PIN code for new staff
      document.getElementById('staff-password').value = generatePinCode(5);
      
      // Reset room and entry point checkboxes
      document.querySelectorAll('.room-checkbox, .entry-point-checkbox').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      document.querySelectorAll('[id^="room-pos-"], [id^="entry-pos-"]').forEach(posInput => {
        posInput.disabled = true;
        posInput.value = "";
      });
      
      // Load rooms and entry points sequentially to avoid conflicts
      await loadRoomsForStaffForm();
      await loadEntryPointsForStaffForm();
      
      showModal('staff-modal');
    });
  }
  
  // Also add a global event listener for the add staff button
  // This helps when the button is dynamically added to the DOM after the page loads
  document.addEventListener('click', (e) => {
    if (e.target.id === 'add-staff-btn' || 
        (e.target.parentElement && e.target.parentElement.id === 'add-staff-btn')) {
      (async () => {
        clearForm('staff-form');
        document.getElementById('staff-form-title').textContent = 'Add New Staff';
        document.getElementById('staff-form').setAttribute('data-mode', 'add');
        document.getElementById('access-all-rooms').checked = false;
        document.getElementById('specific-rooms-container').style.display = 'block';
        
        // Auto-generate a PIN code for new staff
        document.getElementById('staff-password').value = generatePinCode(5);
        
        // Reset room and entry point checkboxes
        document.querySelectorAll('.room-checkbox, .entry-point-checkbox').forEach(checkbox => {
          checkbox.checked = false;
        });
        
        document.querySelectorAll('[id^="room-pos-"], [id^="entry-pos-"]').forEach(posInput => {
          posInput.disabled = true;
          posInput.value = "";
        });
        
        // Load rooms and entry points sequentially to avoid conflicts
        await loadRoomsForStaffForm();
        await loadEntryPointsForStaffForm();
        
        showModal('staff-modal');
      })();
    }
  });
  
  // Close modal buttons
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
      hideModal('staff-modal');
    });
  });
  
  // Add event listener for PIN code generation
  document.addEventListener('click', (e) => {
    if (e.target.id === 'generate-pin-btn' || 
        (e.target.parentElement && e.target.parentElement.id === 'generate-pin-btn')) {
      const pinInput = document.getElementById('staff-password');
      pinInput.value = generatePinCode(5);
    }
  });
};

// Export functions
export { loadStaff, initStaffModule, saveStaff, deleteStaff };
