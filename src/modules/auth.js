
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { loadDashboard } from './dashboard.js';

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

export { checkAuthStatus, login, logout };
