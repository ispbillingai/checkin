
// Function to load templates
async function loadTemplates() {
  try {
    // Load sidebar template
    const sidebarResponse = await fetch('../pages/templates/sidebar-template.html');
    const sidebarTemplate = await sidebarResponse.text();
    document.getElementById('sidebar-template-container').innerHTML = sidebarTemplate;
    document.getElementById('sidebar-content').innerHTML = sidebarTemplate;
    
    // Load bookings template
    const bookingsResponse = await fetch('../pages/templates/bookings-template.html');
    const bookingsTemplate = await bookingsResponse.text();
    document.getElementById('bookings-template-container').innerHTML = bookingsTemplate;
    document.getElementById('bookingsSection').innerHTML = bookingsTemplate;
    
    // Load rooms template
    const roomsResponse = await fetch('../pages/templates/rooms-template.html');
    const roomsTemplate = await roomsResponse.text();
    document.getElementById('rooms-template-container').innerHTML = roomsTemplate;
    document.getElementById('roomsSection').innerHTML = roomsTemplate;
    
    // Load entry points template
    const entryPointsResponse = await fetch('../pages/templates/entry-points-template.html');
    const entryPointsTemplate = await entryPointsResponse.text();
    document.getElementById('entry-points-template-container').innerHTML = entryPointsTemplate;
    document.getElementById('entryPointsSection').innerHTML = entryPointsTemplate;
    
    // Load passcodes template
    const passcodesResponse = await fetch('../pages/templates/passcodes-template.html');
    const passcodesTemplate = await passcodesResponse.text();
    document.getElementById('passcodes-template-container').innerHTML = passcodesTemplate;
    document.getElementById('passcodesSection').innerHTML = passcodesTemplate;
    
    // Load database template
    const databaseResponse = await fetch('../pages/templates/database-template.html');
    const databaseTemplate = await databaseResponse.text();
    document.getElementById('database-template-container').innerHTML = databaseTemplate;
    document.getElementById('databaseSection').innerHTML = databaseTemplate;
    
    // Load room setting template
    const roomSettingResponse = await fetch('../pages/templates/room-setting-template.html');
    const roomSettingTemplate = await roomSettingResponse.text();
    document.getElementById('room-setting-template-container').innerHTML = roomSettingTemplate;
    
    // Load database table template
    const databaseTableResponse = await fetch('../pages/templates/database-table-template.html');
    const databaseTableTemplate = await databaseTableResponse.text();
    document.getElementById('database-table-template-container').innerHTML = databaseTableTemplate;
    
    // Initialize all components after templates are loaded
    initializeComponents();
  } catch (error) {
    // Silent error
  }
}

// Function to initialize components after templates are loaded
function initializeComponents() {
  // Initialize bookings functionality if the script is loaded
  if (typeof initializeBookings === 'function') {
    initializeBookings();
  }
  
  // Initialize rooms functionality if the script is loaded
  if (typeof initializeRooms === 'function') {
    initializeRooms();
  }
  
  // Initialize entry points functionality if the script is loaded
  if (typeof initEntryPointsManagement === 'function') {
    initEntryPointsManagement();
  }
  
  // Initialize passcodes functionality if the script is loaded
  if (typeof initializePasscodes === 'function') {
    initializePasscodes();
  }
  
  // Initialize database functionality if the script is loaded
  if (typeof initializeDatabase === 'function') {
    initializeDatabase();
  }
}

// Load templates when the DOM content is loaded
document.addEventListener('DOMContentLoaded', loadTemplates);
