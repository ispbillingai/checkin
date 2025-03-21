
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel } from './navigation.js';

// Load entry points data
const loadEntryPoints = async () => {
  if (!checkAuthStatus()) return;
  
  try {
    showPanel('entry-points');
    
    const response = await fetch('/api/get_entry_points.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    
    const tableBody = document.getElementById('entry-points-table');
    tableBody.innerHTML = '';
    
    if (data.success && data.entry_points.length > 0) {
      for (const entryPoint of data.entry_points) {
        const row = document.createElement('tr');
        
        // For each entry point, get associated rooms
        const roomsResponse = await fetch(`/api/get_entry_point_rooms.php?entry_point_id=${entryPoint.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          },
        });
        
        let roomsHtml = 'None';
        try {
          const roomsData = await roomsResponse.json();
          if (roomsData.success && roomsData.rooms.length > 0) {
            roomsHtml = roomsData.rooms.map(room => room.name).join(', ');
          }
        } catch (error) {
          console.error('Error fetching rooms for entry point:', error);
        }
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${entryPoint.id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entryPoint.name}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${entryPoint.description || 'No description'}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${roomsHtml}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button class="text-blue-600 hover:text-blue-800 mr-2" onclick="editEntryPoint('${entryPoint.id}')">Edit</button>
            <button class="text-red-600 hover:text-red-800" onclick="deleteEntryPoint('${entryPoint.id}')">Delete</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      }
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="px-6 py-4 text-center text-gray-500">No entry points found</td>
        </tr>
      `;
    }
  } catch (error) {
    logError(error, 'Loading Entry Points');
  }
};

// Entry point action handlers
const editEntryPoint = (id) => {
  showToast(`Edit entry point ${id} - Feature coming soon`, 'info');
};

const deleteEntryPoint = (id) => {
  if (confirm(`Are you sure you want to delete entry point ${id}?`)) {
    showToast(`Deleted entry point ${id}`, 'success');
  }
};

export { loadEntryPoints, editEntryPoint, deleteEntryPoint };
