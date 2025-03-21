
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel } from './navigation.js';

// Load bookings data
const loadBookings = async () => {
  if (!checkAuthStatus()) return;
  
  try {
    showPanel('bookings');
    
    const statusFilter = document.getElementById('booking-status-filter').value;
    const roomFilter = document.getElementById('booking-room-filter').value;
    
    let url = '/api/get_bookings.php';
    const queryParams = [];
    
    if (statusFilter !== 'all') {
      queryParams.push(`status=${statusFilter}`);
    }
    
    if (roomFilter !== 'all') {
      queryParams.push(`room_id=${roomFilter}`);
    }
    
    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const data = await response.json();
    
    const tableBody = document.getElementById('bookings-table');
    tableBody.innerHTML = '';
    
    if (data.success && data.bookings.length > 0) {
      data.bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.id}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.guest_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.room_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(booking.arrival_datetime)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(booking.departure_datetime)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${booking.status === 'active' ? 'bg-green-100 text-green-800' : 
            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
            'bg-red-100 text-red-800'}">
              ${booking.status}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            <button class="text-blue-600 hover:text-blue-800 mr-2" onclick="viewBooking(${booking.id})">View</button>
            <button class="text-red-600 hover:text-red-800" onclick="cancelBooking(${booking.id})">Cancel</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-4 text-center text-gray-500">No bookings found</td>
        </tr>
      `;
    }
  } catch (error) {
    logError(error, 'Loading Bookings');
  }
};

// Booking action handlers
const viewBooking = (id) => {
  showToast(`View booking ${id} - Feature coming soon`, 'info');
};

const cancelBooking = (id) => {
  if (confirm(`Are you sure you want to cancel booking #${id}?`)) {
    showToast(`Cancelled booking ${id}`, 'success');
  }
};

export { loadBookings, viewBooking, cancelBooking };
