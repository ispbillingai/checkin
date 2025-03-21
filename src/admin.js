// Setup error logging
const logError = (error, context = '') => {
  console.error(`[ADMIN ERROR] ${context}:`, error);
};

// Set up global error handler
window.addEventListener('error', (event) => {
  logError(event.error, 'Uncaught Exception');
});

// Set up promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, 'Unhandled Promise Rejection');
});

// Toast notifications
const showToast = (message, type = 'info') => {
  // Remove any existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  toast.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${icon} mr-2 ${type === 'info' ? 'text-blue-500' : 
                                       type === 'success' ? 'text-green-500' : 
                                       type === 'warning' ? 'text-yellow-500' : 'text-red-500'}"></i>
      <div>${message}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto remove toast after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'opacity 0.5s, transform 0.5s';
    
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 5000);
};

// Auth functions
const checkAuthStatus = () => {
  const token = localStorage.getItem('adminToken');
  const username = localStorage.getItem('adminUsername');
  
  if (token && username) {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('admin-container').classList.remove('hidden');
    document.getElementById('username').textContent = username;
    document.getElementById('sidebar-username').textContent = username;
    return true;
  } else {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('admin-container').classList.add('hidden');
    return false;
  }
};

const login = async (username, password) => {
  const loginStatus = document.getElementById('login-status');
  
  try {
    loginStatus.textContent = 'Logging in...';
    loginStatus.className = 'mt-4 p-3 rounded text-center bg-gray-100 text-gray-600';
    
    const response = await fetch('/api/admin_login.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', username);
      loginStatus.textContent = 'Login successful! Redirecting...';
      loginStatus.className = 'mt-4 p-3 rounded text-center bg-green-100 text-green-700';
      setTimeout(() => {
        checkAuthStatus();
        loadDashboard();
        showToast(`Welcome back, ${username}!`, 'success');
      }, 1000);
    } else {
      throw new Error(data.message || 'Login failed');
    }
  } catch (error) {
    loginStatus.textContent = `Error: ${error.message}`;
    loginStatus.className = 'mt-4 p-3 rounded text-center bg-red-100 text-red-700';
    logError(error, 'Login');
  }
};

const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUsername');
  showToast('You have been logged out successfully', 'info');
  checkAuthStatus();
};

// Navigation functions
const showPanel = (panelId) => {
  // Hide all panels
  document.querySelectorAll('.admin-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('bg-blue-100', 'text-blue-600', 'active');
  });
  
  // Show selected panel
  const panel = document.getElementById(`panel-${panelId}`);
  if (panel) {
    panel.classList.remove('hidden');
  }
  
  // Add active class to selected nav link
  const navLink = document.getElementById(`nav-${panelId}`);
  if (navLink) {
    navLink.classList.add('bg-blue-100', 'text-blue-600', 'active');
  }
};

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

// Settings management
const loadSettings = () => {
  if (!checkAuthStatus()) return;
  
  try {
    showPanel('settings');
    
    // Load saved settings from localStorage or use defaults
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || getDefaultSettings();
    
    // Company settings
    document.getElementById('company-name').value = settings.company.name;
    document.getElementById('company-email').value = settings.company.email;
    document.getElementById('company-phone').value = settings.company.phone;
    document.getElementById('company-address').value = settings.company.address;
    
    // Booking settings
    document.getElementById('check-in-time').value = settings.booking.checkInTime;
    document.getElementById('check-out-time').value = settings.booking.checkOutTime;
    document.getElementById('min-advance-days').value = settings.booking.minAdvanceDays;
    document.getElementById('max-advance-days').value = settings.booking.maxAdvanceDays;
    
    // Appearance settings
    document.getElementById('primary-color').value = settings.appearance.primaryColor;
    document.getElementById('primary-color-hex').value = settings.appearance.primaryColor;
    document.getElementById('secondary-color').value = settings.appearance.secondaryColor;
    document.getElementById('secondary-color-hex').value = settings.appearance.secondaryColor;
    
    // Email settings
    document.getElementById('smtp-host').value = settings.email.smtpHost;
    document.getElementById('smtp-port').value = settings.email.smtpPort;
    document.getElementById('smtp-username').value = settings.email.smtpUsername;
    document.getElementById('smtp-password').value = settings.email.smtpPassword;
    document.getElementById('email-from').value = settings.email.fromEmail;
    
  } catch (error) {
    logError(error, 'Loading Settings');
    showToast('Error loading settings', 'error');
  }
};

const getDefaultSettings = () => {
  return {
    company: {
      name: 'Booking System',
      email: 'contact@example.com',
      phone: '+1 234 567 890',
      address: '123 Main Street, City, Country'
    },
    booking: {
      checkInTime: '14:00',
      checkOutTime: '11:00',
      minAdvanceDays: 1,
      maxAdvanceDays: 90
    },
    appearance: {
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      logo: null,
      favicon: null
    },
    email: {
      smtpHost: 'smtp.example.com',
      smtpPort: 587,
      smtpUsername: 'user@example.com',
      smtpPassword: 'password',
      fromEmail: 'bookings@example.com'
    }
  };
};

const saveCompanySettings = (e) => {
  e.preventDefault();
  
  try {
    // Get current settings
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || getDefaultSettings();
    
    // Update company settings
    settings.company.name = document.getElementById('company-name').value;
    settings.company.email = document.getElementById('company-email').value;
    settings.company.phone = document.getElementById('company-phone').value;
    settings.company.address = document.getElementById('company-address').value;
    
    // Save updated settings
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    showToast('Company information saved successfully', 'success');
  } catch (error) {
    logError(error, 'Saving Company Settings');
    showToast('Error saving company settings', 'error');
  }
};

const saveBookingSettings = (e) => {
  e.preventDefault();
  
  try {
    // Get current settings
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || getDefaultSettings();
    
    // Update booking settings
    settings.booking.checkInTime = document.getElementById('check-in-time').value;
    settings.booking.checkOutTime = document.getElementById('check-out-time').value;
    settings.booking.minAdvanceDays = document.getElementById('min-advance-days').value;
    settings.booking.maxAdvanceDays = document.getElementById('max-advance-days').value;
    
    // Save updated settings
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    showToast('Booking settings saved successfully', 'success');
  } catch (error) {
    logError(error, 'Saving Booking Settings');
    showToast('Error saving booking settings', 'error');
  }
};

const saveAppearanceSettings = (e) => {
  e.preventDefault();
  
  try {
    // Get current settings
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || getDefaultSettings();
    
    // Update appearance settings
    settings.appearance.primaryColor = document.getElementById('primary-color').value;
    settings.appearance.secondaryColor = document.getElementById('secondary-color').value;
    
    // Save updated settings
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    showToast('Appearance settings saved successfully', 'success');
  } catch (error) {
    logError(error, 'Saving Appearance Settings');
    showToast('Error saving appearance settings', 'error');
  }
};

const saveEmailSettings = (e) => {
  e.preventDefault();
  
  try {
    // Get current settings
    const settings = JSON.parse(localStorage.getItem('adminSettings')) || getDefaultSettings();
    
    // Update email settings
    settings.email.smtpHost = document.getElementById('smtp-host').value;
    settings.email.smtpPort = document.getElementById('smtp-port').value;
    settings.email.smtpUsername = document.getElementById('smtp-username').value;
    settings.email.smtpPassword = document.getElementById('smtp-password').value;
    settings.email.fromEmail = document.getElementById('email-from').value;
    
    // Save updated settings
    localStorage.setItem('adminSettings', JSON.stringify(settings));
    
    showToast('Email settings saved successfully', 'success');
  } catch (error) {
    logError(error, 'Saving Email Settings');
    showToast('Error saving email settings', 'error');
  }
};

// Color input synchronization
const syncColorInputs = () => {
  const primaryColor = document.getElementById('primary-color');
  const primaryColorHex = document.getElementById('primary-color-hex');
  const secondaryColor = document.getElementById('secondary-color');
  const secondaryColorHex = document.getElementById('secondary-color-hex');
  
  primaryColor.addEventListener('input', () => {
    primaryColorHex.value = primaryColor.value;
  });
  
  primaryColorHex.addEventListener('input', () => {
    primaryColor.value = primaryColorHex.value;
  });
  
  secondaryColor.addEventListener('input', () => {
    secondaryColorHex.value = secondaryColor.value;
  });
  
  secondaryColorHex.addEventListener('input', () => {
    secondaryColor.value = secondaryColorHex.value;
  });
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  if (checkAuthStatus()) {
    loadDashboard();
  }
  
  // Add event listeners
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username-input').value;
    const password = document.getElementById('password-input').value;
    login(username, password);
  });
  
  document.getElementById('logout-btn').addEventListener('click', logout);
  
  // Navigation
  document.getElementById('nav-dashboard').addEventListener('click', loadDashboard);
  document.getElementById('nav-bookings').addEventListener('click', loadBookings);
  document.getElementById('nav-rooms').addEventListener('click', loadRooms);
  document.getElementById('nav-entry-points').addEventListener('click', loadEntryPoints);
  document.getElementById('nav-settings').addEventListener('click', loadSettings);
  
  // Settings forms
  document.getElementById('company-settings-form').addEventListener('submit', saveCompanySettings);
  document.getElementById('booking-settings-form').addEventListener('submit', saveBookingSettings);
  document.getElementById('appearance-settings-form').addEventListener('submit', saveAppearanceSettings);
  document.getElementById('email-settings-form').addEventListener('submit', saveEmailSettings);
  
  // Sync color inputs
  syncColorInputs();
  
  // Bookings refresh button
  document.getElementById('refresh-bookings').addEventListener('click', loadBookings);
  
  // Add a link to the admin panel on the home page
  if (window.location.pathname === '/') {
    const footer = document.querySelector('footer');
    if (footer) {
      const adminLink = document.createElement('a');
      adminLink.href = '/admin.html';
      adminLink.className = 'text-blue-500 hover:text-blue-700';
      adminLink.textContent = 'Admin Panel';
      
      const container = document.createElement('div');
      container.className = 'text-center mt-2';
      container.appendChild(adminLink);
      
      footer.appendChild(container);
    }
  }
});

// Make functions available globally
window.viewBooking = (id) => {
  showToast(`View booking ${id} - Feature coming soon`, 'info');
};

window.cancelBooking = (id) => {
  if (confirm(`Are you sure you want to cancel booking #${id}?`)) {
    showToast(`Cancelled booking ${id}`, 'success');
  }
};

window.editRoom = (id) => {
  showToast(`Edit room ${id} - Feature coming soon`, 'info');
};

window.deleteRoom = (id) => {
  if (confirm(`Are you sure you want to delete room ${id}?`)) {
    showToast(`Deleted room ${id}`, 'success');
  }
};

window.editEntryPoint = (id) => {
  showToast(`Edit entry point ${id} - Feature coming soon`, 'info');
};

window.deleteEntryPoint = (id) => {
  if (confirm(`Are you sure you want to delete entry point ${id}?`)) {
    showToast(`Deleted entry point ${id}`, 'success');
  }
};
