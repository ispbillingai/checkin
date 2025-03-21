
// Import modules
import { loadTemplates } from './templates/template-loader.js';
import { setupGlobalErrorHandlers } from './utils/error-utils.js';
import { showToast } from './utils/toast-utils.js';
import { checkAuthStatus, login, logout } from './modules/auth.js';
import { loadDashboard } from './modules/dashboard.js';
import { loadBookings, viewBooking, cancelBooking } from './modules/bookings.js';
import { loadRooms, initRoomsModule, saveRoom, deleteRoom } from './modules/rooms.js';
import { loadEntryPoints, initEntryPointsModule, saveEntryPoint, deleteEntryPoint } from './modules/entry-points.js';
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
  
  // Initialize room and entry point modules
  initRoomsModule();
  initEntryPointsModule();
  
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
window.editRoom = (roomId) => {
  const roomData = document.querySelector(`.edit-room-btn[data-room]`);
  if (roomData) {
    const room = JSON.parse(roomData.getAttribute('data-room'));
    document.getElementById('room-form-title').textContent = 'Edit Room';
    document.getElementById('room-id').value = room.id;
    document.getElementById('room-id').readOnly = true;
    document.getElementById('room-name').value = room.name;
    document.getElementById('room-description').value = room.description || '';
    document.getElementById('room-ip-address').value = room.ip_address || '';
    document.getElementById('room-form').setAttribute('data-mode', 'edit');
    document.getElementById('room-modal').classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
};
window.deleteRoom = deleteRoom;
window.editEntryPoint = (entryPointId) => {
  const entryPointData = document.querySelector(`.edit-entry-point-btn[data-entry-point]`);
  if (entryPointData) {
    const entryPoint = JSON.parse(entryPointData.getAttribute('data-entry-point'));
    document.getElementById('entry-point-form-title').textContent = 'Edit Entry Point';
    document.getElementById('entry-point-id').value = entryPoint.id;
    document.getElementById('entry-point-id').readOnly = true;
    document.getElementById('entry-point-name').value = entryPoint.name;
    document.getElementById('entry-point-description').value = entryPoint.description || '';
    document.getElementById('entry-point-ip-address').value = entryPoint.ip_address || '';
    document.getElementById('entry-point-form').setAttribute('data-mode', 'edit');
    document.getElementById('entry-point-modal').classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
};
window.deleteEntryPoint = deleteEntryPoint;
