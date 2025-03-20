
// Function to load templates
async function loadTemplates() {
  try {
    console.log('Starting to load admin templates');
    
    // Load sidebar template
    const sidebarResponse = await fetch('../pages/templates/sidebar-template.html');
    const sidebarTemplate = await sidebarResponse.text();
    
    const sidebarContainer = document.getElementById('sidebar-template-container');
    if (sidebarContainer) {
      sidebarContainer.innerHTML = sidebarTemplate;
      console.log('Loaded sidebar template into container');
    }
    
    const sidebarContent = document.getElementById('sidebar-content');
    if (sidebarContent) {
      sidebarContent.innerHTML = sidebarTemplate;
      console.log('Loaded sidebar template into sidebar-content');
      
      // Dispatch custom event that sidebar template is loaded
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'sidebar-template' }
      }));
    }
    
    // Load bookings template
    const bookingsResponse = await fetch('../pages/templates/bookings-template.html');
    const bookingsTemplate = await bookingsResponse.text();
    
    const bookingsContainer = document.getElementById('bookings-template-container');
    if (bookingsContainer) {
      bookingsContainer.innerHTML = bookingsTemplate;
      console.log('Loaded bookings template into container');
    }
    
    const bookingsSection = document.getElementById('bookingsSection');
    if (bookingsSection) {
      bookingsSection.innerHTML = bookingsTemplate;
      console.log('Loaded bookings template into section');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'bookings-template' }
      }));
    }
    
    // Load rooms template
    const roomsResponse = await fetch('../pages/templates/rooms-template.html');
    const roomsTemplate = await roomsResponse.text();
    
    const roomsContainer = document.getElementById('rooms-template-container');
    if (roomsContainer) {
      roomsContainer.innerHTML = roomsTemplate;
      console.log('Loaded rooms template into container');
    }
    
    const roomsSection = document.getElementById('roomsSection');
    if (roomsSection) {
      roomsSection.innerHTML = roomsTemplate;
      console.log('Loaded rooms template into section');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'rooms-template' }
      }));
    }
    
    // Load entry points template
    const entryPointsResponse = await fetch('../pages/templates/entry-points-template.html');
    const entryPointsTemplate = await entryPointsResponse.text();
    
    const entryPointsContainer = document.getElementById('entry-points-template-container');
    if (entryPointsContainer) {
      entryPointsContainer.innerHTML = entryPointsTemplate;
      console.log('Loaded entry points template into container');
    }
    
    const entryPointsSection = document.getElementById('entryPointsSection');
    if (entryPointsSection) {
      entryPointsSection.innerHTML = entryPointsTemplate;
      console.log('Loaded entry points template into section');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'entry-points-template' }
      }));
    }
    
    // Load passcodes template
    const passcodesResponse = await fetch('../pages/templates/passcodes-template.html');
    const passcodesTemplate = await passcodesResponse.text();
    
    const passcodesContainer = document.getElementById('passcodes-template-container');
    if (passcodesContainer) {
      passcodesContainer.innerHTML = passcodesTemplate;
      console.log('Loaded passcodes template into container');
    }
    
    const passcodesSection = document.getElementById('passcodesSection');
    if (passcodesSection) {
      passcodesSection.innerHTML = passcodesTemplate;
      console.log('Loaded passcodes template into section');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'passcodes-template' }
      }));
    }
    
    // Load database template
    const databaseResponse = await fetch('../pages/templates/database-template.html');
    const databaseTemplate = await databaseResponse.text();
    
    const databaseContainer = document.getElementById('database-template-container');
    if (databaseContainer) {
      databaseContainer.innerHTML = databaseTemplate;
      console.log('Loaded database template into container');
    }
    
    const databaseSection = document.getElementById('databaseSection');
    if (databaseSection) {
      databaseSection.innerHTML = databaseTemplate;
      console.log('Loaded database template into section');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'database-template' }
      }));
    }
    
    // Load room setting template
    const roomSettingResponse = await fetch('../pages/templates/room-setting-template.html');
    const roomSettingTemplate = await roomSettingResponse.text();
    
    const roomSettingContainer = document.getElementById('room-setting-template-container');
    if (roomSettingContainer) {
      roomSettingContainer.innerHTML = roomSettingTemplate;
      console.log('Loaded room setting template');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'room-setting-template' }
      }));
    }
    
    // Load database table template
    const databaseTableResponse = await fetch('../pages/templates/database-table-template.html');
    const databaseTableTemplate = await databaseTableResponse.text();
    
    const databaseTableContainer = document.getElementById('database-table-template-container');
    if (databaseTableContainer) {
      databaseTableContainer.innerHTML = databaseTableTemplate;
      console.log('Loaded database table template');
      
      // Dispatch custom event
      document.dispatchEvent(new CustomEvent('templateLoaded', {
        detail: { templateId: 'database-table-template' }
      }));
    }
    
    console.log('All templates loaded, initializing components');
    
    // After all templates are loaded, dispatch a general event
    document.dispatchEvent(new CustomEvent('allTemplatesLoaded'));
    
    // Initialize all components after templates are loaded
    initializeComponents();
  } catch (error) {
    console.error('Error loading templates:', error);
  }
}

// Function to initialize components after templates are loaded
function initializeComponents() {
  console.log('Initializing components after template loading');
  
  // Initialize sidebar
  if (typeof window.initializeSidebar === 'function') {
    console.log('Calling initializeSidebar function');
    window.initializeSidebar();
  } else {
    console.warn('initializeSidebar function not found');
  }
  
  // Initialize bookings functionality if the script is loaded
  if (typeof initializeBookings === 'function') {
    console.log('Initializing bookings');
    initializeBookings();
  } else {
    console.warn('initializeBookings function not found');
  }
  
  // Initialize rooms functionality if the script is loaded
  if (typeof initializeRooms === 'function') {
    console.log('Initializing rooms');
    initializeRooms();
  } else {
    console.warn('initializeRooms function not found');
  }
  
  // Initialize entry points functionality if the script is loaded
  if (typeof initEntryPointsManagement === 'function') {
    console.log('Initializing entry points management');
    initEntryPointsManagement();
  } else {
    console.warn('initEntryPointsManagement function not found');
    
    // Try to load the script
    const script = document.createElement('script');
    script.src = '/src/js/admin-entry-points.js';
    script.onload = function() {
      console.log('admin-entry-points.js loaded, initializing');
      if (typeof initEntryPointsManagement === 'function') {
        initEntryPointsManagement();
      }
    };
    script.onerror = function() {
      console.error('Failed to load admin-entry-points.js');
    };
    document.body.appendChild(script);
  }
  
  // Initialize passcodes functionality if the script is loaded
  if (typeof initializePasscodes === 'function') {
    console.log('Initializing passcodes');
    initializePasscodes();
  } else {
    console.warn('initializePasscodes function not found');
  }
  
  // Initialize database functionality if the script is loaded
  if (typeof initializeDatabase === 'function') {
    console.log('Initializing database');
    initializeDatabase();
  } else {
    console.warn('initializeDatabase function not found');
  }
  
  console.log('Components initialization completed');
}

// Add function to global scope for external access
window.loadAdminTemplates = loadTemplates;

// Load templates when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded in admin-templates-loader.js, loading templates');
  loadTemplates();
});
