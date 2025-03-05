
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if rooms section exists
  if (!document.getElementById('roomsSection')) return;
  
  // Clone the template content to the rooms section
  const roomsTemplate = document.getElementById('roomsTemplate');
  const roomsSection = document.getElementById('roomsSection');
  if (roomsTemplate && roomsSection) {
    roomsSection.appendChild(roomsTemplate.content.cloneNode(true));
  }
  
  // Get DOM elements
  const addRoomButton = document.getElementById('addRoomButton');
  const addRoomModal = document.getElementById('addRoomModal');
  const closeRoomModal = document.getElementById('closeRoomModal');
  const cancelRoomButton = document.getElementById('cancelRoomButton');
  const roomForm = document.getElementById('roomForm');
  const roomModalTitle = document.getElementById('roomModalTitle');
  
  // Room modal open/close
  if (addRoomButton && addRoomModal) {
    addRoomButton.addEventListener('click', function() {
      openRoomModal('add');
    });
  }
  
  if (closeRoomModal && addRoomModal) {
    closeRoomModal.addEventListener('click', function() {
      addRoomModal.classList.add('hidden');
    });
  }
  
  if (cancelRoomButton && addRoomModal) {
    cancelRoomButton.addEventListener('click', function() {
      addRoomModal.classList.add('hidden');
    });
  }
  
  // Form submission
  if (roomForm) {
    roomForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const roomId = document.getElementById('roomId').value;
      const roomName = document.getElementById('roomName').value;
      const roomDescription = document.getElementById('roomDescription').value;
      const roomStatus = document.getElementById('roomStatus').value;
      
      if (!roomName) {
        showToast('error', 'Validation Error', 'Room name is required');
        return;
      }
      
      // Simulate API call
      setTimeout(() => {
        if (roomId) {
          // Update existing room
          updateRoomInTable(roomId, roomName, roomDescription, roomStatus);
          showToast('success', 'Room Updated', `Room "${roomName}" has been updated`);
        } else {
          // Add new room
          const newId = 'room' + (Date.now() % 10000);
          addRoomToTable(newId, roomName, roomDescription, roomStatus);
          showToast('success', 'Room Added', `Room "${roomName}" has been added`);
        }
        
        // Close modal and reset form
        addRoomModal.classList.add('hidden');
        roomForm.reset();
      }, 500);
    });
  }
  
  // Load initial rooms
  loadRooms();
  
  // Functions
  function openRoomModal(mode, roomData = null) {
    const roomId = document.getElementById('roomId');
    const roomName = document.getElementById('roomName');
    const roomDescription = document.getElementById('roomDescription');
    const roomStatus = document.getElementById('roomStatus');
    
    if (mode === 'edit' && roomData) {
      // Edit mode
      if (roomModalTitle) roomModalTitle.textContent = 'Edit Room';
      if (roomId) roomId.value = roomData.id;
      if (roomName) roomName.value = roomData.name;
      if (roomDescription) roomDescription.value = roomData.description;
      if (roomStatus) roomStatus.value = roomData.status;
    } else {
      // Add mode
      if (roomModalTitle) roomModalTitle.textContent = 'Add New Room';
      if (roomId) roomId.value = '';
      if (roomForm) roomForm.reset();
    }
    
    addRoomModal.classList.remove('hidden');
  }
  
  function loadRooms() {
    const roomsTableBody = document.getElementById('roomsTableBody');
    if (!roomsTableBody) return;
    
    // Clear previous rooms
    roomsTableBody.innerHTML = '';
    
    // Simulate API call to get rooms
    setTimeout(() => {
      const rooms = [
        { id: 'room1', name: 'Room 1', description: 'Standard room with one bed', status: 'active' },
        { id: 'room2', name: 'Room 2', description: 'Standard room with two beds', status: 'active' },
        { id: 'room3', name: 'Room 3', description: 'Suite with kitchenette', status: 'active' },
        { id: 'room4', name: 'Room 4', description: 'Executive suite', status: 'maintenance' },
        { id: 'room5', name: 'Room 5', description: 'Conference room', status: 'active' }
      ];
      
      // Add rooms to table
      rooms.forEach(room => {
        addRoomToTable(room.id, room.name, room.description, room.status);
      });
    }, 500);
  }
  
  function addRoomToTable(id, name, description, status) {
    const roomsTableBody = document.getElementById('roomsTableBody');
    if (!roomsTableBody) return;
    
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td class="px-4 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-900">${id}</div>
      </td>
      <td class="px-4 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${name}</div>
      </td>
      <td class="px-4 py-4">
        <div class="text-sm text-gray-900">${description || 'No description'}</div>
      </td>
      <td class="px-4 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}">
          ${status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </td>
      <td class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button class="text-blue-600 hover:text-blue-900 mr-2 edit-room-button" data-room-id="${id}">Edit</button>
        <button class="text-red-600 hover:text-red-900 delete-room-button" data-room-id="${id}">Delete</button>
      </td>
    `;
    
    roomsTableBody.appendChild(row);
    
    // Add event listeners to new buttons
    const editButton = row.querySelector('.edit-room-button');
    const deleteButton = row.querySelector('.delete-room-button');
    
    if (editButton) {
      editButton.addEventListener('click', function() {
        const roomId = this.getAttribute('data-room-id');
        const roomData = {
          id: roomId,
          name: row.cells[1].querySelector('div').textContent,
          description: row.cells[2].querySelector('div').textContent === 'No description' ? '' : row.cells[2].querySelector('div').textContent,
          status: row.cells[3].querySelector('span').textContent.toLowerCase()
        };
        
        openRoomModal('edit', roomData);
      });
    }
    
    if (deleteButton) {
      deleteButton.addEventListener('click', function() {
        const roomId = this.getAttribute('data-room-id');
        const roomName = row.cells[1].querySelector('div').textContent;
        
        if (confirm(`Are you sure you want to delete room "${roomName}"?`)) {
          // Simulate API call to delete room
          setTimeout(() => {
            row.remove();
            showToast('success', 'Room Deleted', `Room "${roomName}" has been deleted`);
          }, 500);
        }
      });
    }
  }
  
  function updateRoomInTable(id, name, description, status) {
    const roomsTableBody = document.getElementById('roomsTableBody');
    if (!roomsTableBody) return;
    
    const rows = roomsTableBody.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const roomId = row.querySelector('[data-room-id]').getAttribute('data-room-id');
      
      if (roomId === id) {
        row.cells[1].querySelector('div').textContent = name;
        row.cells[2].querySelector('div').textContent = description || 'No description';
        
        const statusElement = row.cells[3].querySelector('span');
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusElement.className = `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(status)}`;
        
        break;
      }
    }
  }
  
  function getStatusClass(status) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
});
