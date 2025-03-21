
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel } from './navigation.js';

// Data loading functions
const loadDashboard = async () => {
  if (!checkAuthStatus()) return;
  
  try {
    showPanel('dashboard');
    
    // Load booking statistics
    const statsResponse = await fetch('/api/get_booking_stats.php', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const statsData = await statsResponse.json();
    
    if (statsData.success) {
      document.getElementById('total-bookings').textContent = statsData.total_bookings;
      document.getElementById('active-bookings').textContent = statsData.active_bookings;
      document.getElementById('rooms-booked').textContent = statsData.rooms_booked;
    }
    
    // Load recent bookings
    const bookingsResponse = await fetch('/api/get_bookings.php?limit=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      },
    });
    
    const bookingsData = await bookingsResponse.json();
    
    if (bookingsData.success && bookingsData.bookings.length > 0) {
      const tableBody = document.getElementById('recent-bookings-table');
      tableBody.innerHTML = '';
      
      bookingsData.bookings.forEach(booking => {
        const row = document.createElement('tr');
        
        const formatDate = (dateString) => {
          const date = new Date(dateString);
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };
        
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${booking.guest_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${booking.room_name}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(booking.arrival_datetime)}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
            ${booking.status === 'active' ? 'bg-green-100 text-green-800' : 
            booking.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
            'bg-red-100 text-red-800'}">
              ${booking.status}
            </span>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
    } else {
      document.getElementById('recent-bookings-table').innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-4 text-center text-gray-500">No recent bookings found</td>
        </tr>
      `;
    }
  } catch (error) {
    logError(error, 'Loading Dashboard');
    showToast('Error loading dashboard data', 'error');
  }
};

export { loadDashboard };
