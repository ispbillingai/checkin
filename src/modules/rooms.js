
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel, showModal, hideModal, clearForm } from './navigation.js';

// Load rooms data
const loadRooms = async () => {
  if (!checkAuthStatus()) return;
  
  try {
    showPanel('rooms');
    
    const response = await fetch('/api/get_rooms.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    
    const tableBody = document.getElementById('rooms-table');
    tableBody.innerHTML = '';
    
    if (data.success && data.rooms.length > 0) {
      for (const room of data.rooms) {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${room.id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${room.name}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${room.description || 'No description'}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button class="text-blue-600 hover:text-blue-800 mr-2 edit-room-btn" data-room='${JSON.stringify(room)}'>
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="text-red-600 hover:text-red-800 delete-room-btn" data-id="${room.id}" data-name="${room.name}">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </td>
        `;
        
        tableBody.appendChild(row);
      }
      
      // Add event listeners to the new buttons
      addRoomEventListeners();
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-4 text-center text-gray-500">No rooms found</td>
        </tr>
      `;
    }
  } catch (error) {
    logError(error, 'Loading Rooms');
    showToast('Failed to load rooms', 'error');
  }
};

// Add event listeners to room buttons
const addRoomEventListeners = () => {
  // Add room button
  document.getElementById('add-room-btn').addEventListener('click', () => {
    clearForm('room-form');
    document.getElementById('room-form-title').textContent = 'Add New Room';
    document.getElementById('room-id').readOnly = false;
    document.getElementById('room-form').setAttribute('data-mode', 'add');
    showModal('room-modal');
  });
  
  // Edit room buttons
  document.querySelectorAll('.edit-room-btn').forEach(button => {
    button.addEventListener('click', () => {
      const room = JSON.parse(button.getAttribute('data-room'));
      document.getElementById('room-form-title').textContent = 'Edit Room';
      document.getElementById('room-id').value = room.id;
      document.getElementById('room-id').readOnly = true;
      document.getElementById('room-name').value = room.name;
      document.getElementById('room-description').value = room.description || '';
      document.getElementById('room-form').setAttribute('data-mode', 'edit');
      showModal('room-modal');
    });
  });
  
  // Delete room buttons
  document.querySelectorAll('.delete-room-btn').forEach(button => {
    button.addEventListener('click', () => {
      const roomId = button.getAttribute('data-id');
      const roomName = button.getAttribute('data-name');
      if (confirm(`Are you sure you want to delete room "${roomName}" (${roomId})?`)) {
        deleteRoom(roomId);
      }
    });
  });
  
  // Save room button
  document.getElementById('save-room-btn').addEventListener('click', saveRoom);
  
  // Close modal buttons
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
      hideModal('room-modal');
    });
  });
};

// Save room (add or edit)
const saveRoom = async () => {
  try {
    const mode = document.getElementById('room-form').getAttribute('data-mode');
    const roomId = document.getElementById('room-id').value.trim();
    const roomName = document.getElementById('room-name').value.trim();
    const roomDescription = document.getElementById('room-description').value.trim();
    
    if (!roomId || !roomName) {
      showToast('Room ID and Name are required', 'error');
      return;
    }
    
    const roomData = {
      id: roomId,
      name: roomName,
      description: roomDescription
    };
    
    const endpoint = mode === 'add' ? '/api/add_room.php' : '/api/update_room.php';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(roomData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast(`Room ${mode === 'add' ? 'added' : 'updated'} successfully`, 'success');
      hideModal('room-modal');
      loadRooms();
    } else {
      throw new Error(data.message || `Failed to ${mode} room`);
    }
  } catch (error) {
    logError(error, 'Save Room');
    showToast(`Error: ${error.message}`, 'error');
  }
};

// Delete room
const deleteRoom = async (roomId) => {
  try {
    const response = await fetch('/api/delete_room.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({ id: roomId }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Room deleted successfully', 'success');
      loadRooms();
    } else {
      throw new Error(data.message || 'Failed to delete room');
    }
  } catch (error) {
    logError(error, 'Delete Room');
    showToast(`Error: ${error.message}`, 'error');
  }
};

// Initialize room module
const initRoomsModule = () => {
  // Add event listener to the nav link to load rooms
  document.getElementById('nav-rooms').addEventListener('click', loadRooms);
  
  // Initialize add room button event
  document.getElementById('add-room-btn').addEventListener('click', () => {
    clearForm('room-form');
    document.getElementById('room-form-title').textContent = 'Add New Room';
    document.getElementById('room-id').readOnly = false;
    document.getElementById('room-form').setAttribute('data-mode', 'add');
    showModal('room-modal');
  });
};

// Export functions
export { loadRooms, initRoomsModule, saveRoom, deleteRoom };
