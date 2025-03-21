
// Import modules
import { loadTemplates } from './templates/template-loader.js';
import { setupGlobalErrorHandlers } from './utils/error-utils.js';
import { showToast } from './utils/toast-utils.js';
import { checkAuthStatus, login, logout } from './modules/auth.js';
import { loadDashboard } from './modules/dashboard.js';
import { loadBookings, viewBooking, cancelBooking } from './modules/bookings.js';
import { loadRooms, editRoom, deleteRoom } from './modules/rooms.js';
import { loadEntryPoints, editEntryPoint, deleteEntryPoint } from './modules/entry-points.js';
import { 
  loadSettings, 
  saveCompanySettings, 
  saveBookingSettings, 
  saveAppearanceSettings, 
  saveEmailSettings 
} from './modules/settings.js';

// Initialize app
document.addEventListener('DOMContentLoaded', async () => {
  // Setup global error handlers
  setupGlobalErrorHandlers();
  
  // First load all templates
  const templatesLoaded = await loadTemplates();
  
  if (!templatesLoaded) {
    showToast('Failed to load templates. Please refresh the page.', 'error');
    return;
  }
  
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
window.viewBooking = viewBooking;
window.cancelBooking = cancelBooking;
window.editRoom = editRoom;
window.deleteRoom = deleteRoom;
window.editEntryPoint = editEntryPoint;
window.deleteEntryPoint = deleteEntryPoint;
