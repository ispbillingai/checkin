
import { logError } from '../utils/error-utils.js';
import { showToast } from '../utils/toast-utils.js';
import { checkAuthStatus } from './auth.js';
import { showPanel } from './navigation.js';

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
    
    // Set up color input synchronization
    syncColorInputs();
    
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

export { 
  loadSettings, 
  saveCompanySettings, 
  saveBookingSettings, 
  saveAppearanceSettings, 
  saveEmailSettings 
};
