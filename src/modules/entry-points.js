
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel, showModal, hideModal, clearForm } from './navigation.js';

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
          <td class="px-6 py-4 text-sm text-gray-500">${entryPoint.ip_address || 'Not set'}</td>
          <td class="px-6 py-4 text-sm text-gray-500">${roomsHtml}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button class="text-blue-600 hover:text-blue-800 mr-2 edit-entry-point-btn" data-entry-point='${JSON.stringify(entryPoint)}'>
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="text-red-600 hover:text-red-800 delete-entry-point-btn" data-id="${entryPoint.id}" data-name="${entryPoint.name}">
              <i class="fas fa-trash-alt"></i> Delete
            </button>
          </td>
        `;
        
        tableBody.appendChild(row);
      }
      
      // Add event listeners to the new buttons
      addEntryPointEventListeners();
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-gray-500">No entry points found</td>
        </tr>
      `;
    }
  } catch (error) {
    logError(error, 'Loading Entry Points');
    showToast('Failed to load entry points', 'error');
  }
};

// Add event listeners to entry point buttons
const addEntryPointEventListeners = () => {
  // Add entry point button
  document.getElementById('add-entry-point-btn').addEventListener('click', () => {
    clearForm('entry-point-form');
    document.getElementById('entry-point-form-title').textContent = 'Add New Entry Point';
    document.getElementById('entry-point-id').readOnly = false;
    document.getElementById('entry-point-form').setAttribute('data-mode', 'add');
    showModal('entry-point-modal');
  });
  
  // Edit entry point buttons
  document.querySelectorAll('.edit-entry-point-btn').forEach(button => {
    button.addEventListener('click', () => {
      const entryPoint = JSON.parse(button.getAttribute('data-entry-point'));
      document.getElementById('entry-point-form-title').textContent = 'Edit Entry Point';
      document.getElementById('entry-point-id').value = entryPoint.id;
      document.getElementById('entry-point-id').readOnly = true;
      document.getElementById('entry-point-name').value = entryPoint.name;
      document.getElementById('entry-point-description').value = entryPoint.description || '';
      document.getElementById('entry-point-ip-address').value = entryPoint.ip_address || '';
      document.getElementById('entry-point-form').setAttribute('data-mode', 'edit');
      showModal('entry-point-modal');
    });
  });
  
  // Delete entry point buttons
  document.querySelectorAll('.delete-entry-point-btn').forEach(button => {
    button.addEventListener('click', () => {
      const entryPointId = button.getAttribute('data-id');
      const entryPointName = button.getAttribute('data-name');
      if (confirm(`Are you sure you want to delete entry point "${entryPointName}" (${entryPointId})?`)) {
        deleteEntryPoint(entryPointId);
      }
    });
  });
  
  // Save entry point button
  document.getElementById('save-entry-point-btn').addEventListener('click', saveEntryPoint);
  
  // Close modal buttons
  document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
      hideModal('entry-point-modal');
    });
  });
};

// Save entry point (add or edit)
const saveEntryPoint = async () => {
  try {
    const mode = document.getElementById('entry-point-form').getAttribute('data-mode');
    const entryPointId = document.getElementById('entry-point-id').value.trim();
    const entryPointName = document.getElementById('entry-point-name').value.trim();
    const entryPointDescription = document.getElementById('entry-point-description').value.trim();
    const entryPointIpAddress = document.getElementById('entry-point-ip-address').value.trim();
    
    if (!entryPointId || !entryPointName) {
      showToast('Entry Point ID and Name are required', 'error');
      return;
    }
    
    const entryPointData = {
      id: entryPointId,
      name: entryPointName,
      description: entryPointDescription,
      ip_address: entryPointIpAddress
    };
    
    const endpoint = mode === 'add' ? '/api/add_entry_point.php' : '/api/update_entry_point.php';
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify(entryPointData),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast(`Entry Point ${mode === 'add' ? 'added' : 'updated'} successfully`, 'success');
      hideModal('entry-point-modal');
      loadEntryPoints();
    } else {
      throw new Error(data.message || `Failed to ${mode} entry point`);
    }
  } catch (error) {
    logError(error, 'Save Entry Point');
    showToast(`Error: ${error.message}`, 'error');
  }
};

// Delete entry point
const deleteEntryPoint = async (entryPointId) => {
  try {
    const response = await fetch('/api/delete_entry_point.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
      body: JSON.stringify({ id: entryPointId }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      showToast('Entry Point deleted successfully', 'success');
      loadEntryPoints();
    } else {
      throw new Error(data.message || 'Failed to delete entry point');
    }
  } catch (error) {
    logError(error, 'Delete Entry Point');
    showToast(`Error: ${error.message}`, 'error');
  }
};

// Initialize entry point module
const initEntryPointsModule = () => {
  // Add event listener to the nav link to load entry points
  document.getElementById('nav-entry-points').addEventListener('click', loadEntryPoints);
  
  // Initialize add entry point button event
  document.getElementById('add-entry-point-btn').addEventListener('click', () => {
    clearForm('entry-point-form');
    document.getElementById('entry-point-form-title').textContent = 'Add New Entry Point';
    document.getElementById('entry-point-id').readOnly = false;
    document.getElementById('entry-point-form').setAttribute('data-mode', 'add');
    showModal('entry-point-modal');
  });
};

// Export functions
export { loadEntryPoints, initEntryPointsModule, saveEntryPoint, deleteEntryPoint };
