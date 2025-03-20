
// Function to load templates - No logging version
async function loadTemplates() {
  try {
    console.log('Loading admin templates');
    
    // Load sidebar template
    const sidebarResponse = await fetch('../pages/templates/sidebar-template.html');
    const sidebarTemplate = await sidebarResponse.text();
    document.getElementById('sidebar-template-container').innerHTML = sidebarTemplate;
    document.getElementById('sidebar-content').innerHTML = sidebarTemplate;
    console.log('Loaded sidebar template');
    
    // Load bookings template
    const bookingsResponse = await fetch('../pages/templates/bookings-template.html');
    const bookingsTemplate = await bookingsResponse.text();
    document.getElementById('bookings-template-container').innerHTML = bookingsTemplate;
    document.getElementById('bookingsSection').innerHTML = bookingsTemplate;
    console.log('Loaded bookings template');
    
    // Load rooms template
    const roomsResponse = await fetch('../pages/templates/rooms-template.html');
    const roomsTemplate = await roomsResponse.text();
    document.getElementById('rooms-template-container').innerHTML = roomsTemplate;
    document.getElementById('roomsSection').innerHTML = roomsTemplate;
    console.log('Loaded rooms template');
    
    // Load entry points template
    const entryPointsResponse = await fetch('../pages/templates/entry-points-template.html');
    const entryPointsTemplate = await entryPointsResponse.text();
    document.getElementById('entry-points-template-container').innerHTML = entryPointsTemplate;
    document.getElementById('entryPointsSection').innerHTML = entryPointsTemplate;
    console.log('Loaded entry points template');
    
    // Load passcodes template
    const passcodesResponse = await fetch('../pages/templates/passcodes-template.html');
    const passcodesTemplate = await passcodesResponse.text();
    document.getElementById('passcodes-template-container').innerHTML = passcodesTemplate;
    document.getElementById('passcodesSection').innerHTML = passcodesTemplate;
    console.log('Loaded passcodes template');
    
    // Load database template
    const databaseResponse = await fetch('../pages/templates/database-template.html');
    const databaseTemplate = await databaseResponse.text();
    document.getElementById('database-template-container').innerHTML = databaseTemplate;
    document.getElementById('databaseSection').innerHTML = databaseTemplate;
    console.log('Loaded database template');
    
    // Load room setting template
    const roomSettingResponse = await fetch('../pages/templates/room-setting-template.html');
    const roomSettingTemplate = await roomSettingResponse.text();
    document.getElementById('room-setting-template-container').innerHTML = roomSettingTemplate;
    console.log('Loaded room setting template');
    
    // Load database table template
    const databaseTableResponse = await fetch('../pages/templates/database-table-template.html');
    const databaseTableTemplate = await databaseTableResponse.text();
    document.getElementById('database-table-template-container').innerHTML = databaseTableTemplate;
    console.log('Loaded database table template');
    
    // Initialize all components after templates are loaded
    console.log('All templates loaded, initializing components');
    initializeComponents();
  } catch (error) {
    console.error('Error loading templates:', error);
  }
}

// Function to initialize components after templates are loaded
function initializeComponents() {
  console.log('Initializing components');
  
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

// Load templates when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM content loaded, loading templates');
  loadTemplates();
});
