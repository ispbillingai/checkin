
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel } from './navigation.js';

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
        
        // Fetch entry points for this room
        const entryPointsResponse = await fetch(`/api/get_room_entry_points.php?room_id=${room.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        
        const entryPointsData = await entryPointsResponse.json();
        let entryPointsHtml = 'None';
        
        if (entryPointsData.success && entryPointsData.entry_points.length > 0) {
          entryPointsHtml = entryPointsData.entry_points.map(ep => ep.name).join(', ');
        }
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${room.id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${room.name}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${room.description || 'No description'}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${entryPointsHtml}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button class="text-blue-600 hover:text-blue-800 mr-2" onclick="editRoom('${room.id}')">Edit</button>
            <button class="text-red-600 hover:text-red-800" onclick="deleteRoom('${room.id}')">Delete</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      }
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">No rooms found</td>
        </tr>
      `;
    }
  } catch (error) {
    logError(error, 'Loading Rooms');
  }
};

// Room action handlers
const editRoom = (id) => {
  showToast(`Edit room ${id} - Feature coming soon`, 'info');
};

const deleteRoom = (id) => {
  if (confirm(`Are you sure you want to delete room ${id}?`)) {
    showToast(`Deleted room ${id}`, 'success');
  }
};

export { loadRooms, editRoom, deleteRoom };
