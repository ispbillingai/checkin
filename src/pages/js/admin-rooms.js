
// Initialize rooms functionality
function initializeRooms() {
  console.log("Initializing rooms functionality");
  
  // DOM Elements
  const roomsTableBody = document.getElementById('roomsTableBody');
  const addRoomBtn = document.getElementById('addRoomBtn');
  const roomModal = document.getElementById('roomModal');
  const roomForm = document.getElementById('roomForm');
  const closeRoomModal = document.getElementById('closeRoomModal');
  const cancelRoomBtn = document.getElementById('cancelRoomBtn');
  const roomModalTitle = document.getElementById('roomModalTitle');
  const roomIdInput = document.getElementById('roomIdInput');
  const roomId = document.getElementById('roomId');
  const deleteRoomModal = document.getElementById('deleteRoomModal');
  const deleteRoomName = document.getElementById('deleteRoomName');
  const deleteRoomId = document.getElementById('deleteRoomId');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  
  // Load rooms data
  loadRoomsData();
  
  // Event Listeners
  if (addRoomBtn) {
    addRoomBtn.addEventListener('click', () => {
      openRoomModal('add');
    });
  }
  
  if (closeRoomModal) {
    closeRoomModal.addEventListener('click', () => {
      roomModal.classList.add('hidden');
    });
  }
  
  if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
      roomModal.classList.add('hidden');
    });
  }
  
  if (roomForm) {
    roomForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveRoom();
    });
  }
  
  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
      deleteRoomModal.classList.add('hidden');
    });
  }
  
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      deleteRoom();
    });
  }
  
  // Functions
  async function loadRoomsData() {
    try {
      const response = await fetch('../api/get_rooms.php');
      const data = await response.json();
      
      if (data.success) {
        displayRooms(data.rooms);
      } else {
        showToast('error', 'Error', data.message || 'Failed to load rooms');
        roomsTableBody.innerHTML = `<tr><td colspan="6" class="px-6 py-4 text-sm text-center text-red-500">Error loading rooms: ${data.message}</td></tr>`;
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      roomsTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-sm text-center text-red-500">Error loading rooms. Please try again.</td></tr>';
    }
  }
  
  function displayRooms(rooms) {
    if (!roomsTableBody) return;
    
    if (rooms.length === 0) {
      roomsTableBody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-sm text-center text-gray-500">No rooms available. Add a new room to get started.</td></tr>';
      return;
    }
    
    const html = rooms.map(room => `
      <tr>
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
          ${room.fixed_passcode || 'Auto-generated'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          ${room.reset_hours}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div class="flex space-x-2 justify-end">
            <button class="text-blue-600 hover:text-blue-900" onclick="editRoom('${room.id}')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="text-red-600 hover:text-red-900" onclick="confirmDeleteRoom('${room.id}', '${room.name}')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    roomsTableBody.innerHTML = html;
  }
  
  function openRoomModal(mode, roomData = null) {
    if (mode === 'add') {
      roomModalTitle.textContent = 'Add New Room';
      roomForm.reset();
      roomIdInput.disabled = false;
      roomId.value = '';
    } else if (mode === 'edit' && roomData) {
      roomModalTitle.textContent = 'Edit Room';
      roomId.value = roomData.id;
      roomIdInput.value = roomData.id;
      roomIdInput.disabled = true; // Cannot change room ID once created
      document.getElementById('roomName').value = roomData.name;
      document.getElementById('roomDescription').value = roomData.description || '';
      document.getElementById('fixedPasscode').value = roomData.fixed_passcode || '';
      document.getElementById('resetHours').value = roomData.reset_hours;
    }
    
    roomModal.classList.remove('hidden');
  }
  
  async function saveRoom() {
    const isEdit = roomId.value !== '';
    const formData = new FormData();
    
    if (isEdit) {
      formData.append('id', roomId.value);
    } else {
      formData.append('id', roomIdInput.value);
    }
    
    formData.append('name', document.getElementById('roomName').value);
    formData.append('description', document.getElementById('roomDescription').value);
    formData.append('fixed_passcode', document.getElementById('fixedPasscode').value);
    formData.append('reset_hours', document.getElementById('resetHours').value);
    formData.append('action', isEdit ? 'update' : 'create');
    
    try {
      const response = await fetch('../api/manage_rooms.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', `Room ${isEdit ? 'updated' : 'created'} successfully`);
        roomModal.classList.add('hidden');
        loadRoomsData();
      } else {
        showToast('error', 'Error', data.message || `Failed to ${isEdit ? 'update' : 'create'} room`);
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} room:`, error);
      showToast('error', 'Error', `An error occurred while ${isEdit ? 'updating' : 'creating'} the room`);
    }
  }
  
  function confirmDeleteRoom(id, name) {
    deleteRoomId.value = id;
    deleteRoomName.textContent = name;
    deleteRoomModal.classList.remove('hidden');
  }
  
  async function deleteRoom() {
    const id = deleteRoomId.value;
    
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('action', 'delete');
      
      const response = await fetch('../api/manage_rooms.php', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        showToast('success', 'Success', 'Room deleted successfully');
        deleteRoomModal.classList.add('hidden');
        loadRoomsData();
      } else {
        showToast('error', 'Error', data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      showToast('error', 'Error', 'An error occurred while deleting the room');
    }
  }
}

// Define global functions for buttons
window.editRoom = function(roomId) {
  console.log('Edit room:', roomId);
  
  // Fetch room data
  fetch(`../api/get_room.php?id=${roomId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        openRoomModal('edit', data.room);
      } else {
        showToast('error', 'Error', data.message || 'Failed to fetch room details');
      }
    })
    .catch(error => {
      console.error('Error fetching room details:', error);
      showToast('error', 'Error', 'An error occurred while fetching room details');
    });
};

window.confirmDeleteRoom = function(roomId, roomName) {
  console.log('Delete room:', roomId);
  
  const deleteRoomModal = document.getElementById('deleteRoomModal');
  const deleteRoomName = document.getElementById('deleteRoomName');
  const deleteRoomId = document.getElementById('deleteRoomId');
  
  deleteRoomId.value = roomId;
  deleteRoomName.textContent = roomName;
  deleteRoomModal.classList.remove('hidden');
};

// Helper function to open room modal
function openRoomModal(mode, roomData = null) {
  const roomModal = document.getElementById('roomModal');
  const roomModalTitle = document.getElementById('roomModalTitle');
  const roomForm = document.getElementById('roomForm');
  const roomId = document.getElementById('roomId');
  const roomIdInput = document.getElementById('roomIdInput');
  
  if (mode === 'add') {
    roomModalTitle.textContent = 'Add New Room';
    roomForm.reset();
    roomIdInput.disabled = false;
    roomId.value = '';
  } else if (mode === 'edit' && roomData) {
    roomModalTitle.textContent = 'Edit Room';
    roomId.value = roomData.id;
    roomIdInput.value = roomData.id;
    roomIdInput.disabled = true; // Cannot change room ID once created
    document.getElementById('roomName').value = roomData.name;
    document.getElementById('roomDescription').value = roomData.description || '';
    document.getElementById('fixedPasscode').value = roomData.fixed_passcode || '';
    document.getElementById('resetHours').value = roomData.reset_hours;
  }
  
  roomModal.classList.remove('hidden');
}
