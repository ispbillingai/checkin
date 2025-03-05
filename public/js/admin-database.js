
// Initialize database schema UI
function initDatabaseSection() {
  // If section already initialized, just return
  if (document.getElementById('databaseSectionContent')) {
    return;
  }
  
  // Create database UI
  const databaseContainer = document.getElementById('databaseSection');
  databaseContainer.innerHTML = `
    <div id="databaseSectionContent" class="backdrop-blur-sm bg-white/90 border shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="bg-blue-50 border-b p-6">
        <h2 class="text-xl font-semibold">Database Schema</h2>
        <p class="text-sm text-gray-500 mt-1">
          Overview of the database structure for this application
        </p>
      </div>
      <div class="p-6">
        <div class="space-y-8" id="database-tables">
          <!-- Database tables will be populated here by JavaScript -->
        </div>
      </div>
    </div>
  `;
  
  // Render database tables
  renderDatabaseTables();
}

// Render database tables
function renderDatabaseTables() {
  const container = document.getElementById('database-tables');
  if (!container) return;
  
  // Mock database schema
  const tables = [
    {
      name: 'bookings',
      columns: [
        { name: 'id', type: 'INT', description: 'Primary key, auto-increment' },
        { name: 'room_id', type: 'VARCHAR(50)', description: 'Foreign key to rooms table' },
        { name: 'guest_name', type: 'VARCHAR(255)', description: 'Full name of the guest' },
        { name: 'email', type: 'VARCHAR(255)', description: 'Email address for notifications' },
        { name: 'phone', type: 'VARCHAR(20)', description: 'Phone number for SMS notifications' },
        { name: 'arrival_datetime', type: 'DATETIME', description: 'Check-in date and time' },
        { name: 'departure_datetime', type: 'DATETIME', description: 'Check-out date and time' },
        { name: 'access_code', type: 'VARCHAR(10)', description: 'Room access code for the booking' },
        { name: 'created_at', type: 'TIMESTAMP', description: 'When the booking was created' },
        { name: 'updated_at', type: 'TIMESTAMP', description: 'When the booking was last updated' }
      ]
    },
    {
      name: 'rooms',
      columns: [
        { name: 'id', type: 'VARCHAR(50)', description: 'Primary key' },
        { name: 'name', type: 'VARCHAR(100)', description: 'Room name or number' },
        { name: 'fixed_passcode', type: 'VARCHAR(10)', description: 'Optional fixed passcode for the room' },
        { name: 'reset_hours', type: 'INT', description: 'Hours after checkout to reset access code' },
        { name: 'created_at', type: 'TIMESTAMP', description: 'When the room was added' },
        { name: 'updated_at', type: 'TIMESTAMP', description: 'When the room was last updated' }
      ]
    },
    {
      name: 'notification_settings',
      columns: [
        { name: 'id', type: 'INT', description: 'Primary key, auto-increment' },
        { name: 'email_enabled', type: 'BOOLEAN', description: 'Whether email notifications are enabled' },
        { name: 'email_template', type: 'TEXT', description: 'HTML template for email notifications' },
        { name: 'sms_enabled', type: 'BOOLEAN', description: 'Whether SMS notifications are enabled' },
        { name: 'sms_template', type: 'TEXT', description: 'Template for SMS notifications' },
        { name: 'passcode_length', type: 'INT', description: 'Default length for generated passcodes' },
        { name: 'passcode_type', type: 'VARCHAR(20)', description: 'Type of passcodes (numeric/alphanumeric)' },
        { name: 'updated_at', type: 'TIMESTAMP', description: 'When the settings were last updated' }
      ]
    },
    {
      name: 'users',
      columns: [
        { name: 'id', type: 'INT', description: 'Primary key, auto-increment' },
        { name: 'username', type: 'VARCHAR(50)', description: 'Login username' },
        { name: 'password_hash', type: 'VARCHAR(255)', description: 'Hashed password' },
        { name: 'email', type: 'VARCHAR(255)', description: 'User email address' },
        { name: 'is_admin', type: 'BOOLEAN', description: 'Whether the user has admin privileges' },
        { name: 'created_at', type: 'TIMESTAMP', description: 'When the user was created' },
        { name: 'last_login', type: 'TIMESTAMP', description: 'When the user last logged in' }
      ]
    }
  ];
  
  // Render each table
  tables.forEach(table => {
    const tableElement = document.createElement('div');
    
    tableElement.innerHTML = `
      <h3 class="text-lg font-medium mb-3">${table.name}</h3>
      <div class="rounded-md border overflow-x-auto">
        <table class="w-full border-collapse">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Column</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            ${table.columns.map(column => `
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">${column.name}</td>
                <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">${column.type}</td>
                <td class="px-4 py-2 text-sm text-gray-500">${column.description}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    container.appendChild(tableElement);
  });
}

// Create a new function to handle the Rooms section
function initRoomsSection() {
  // If section already initialized, just return
  if (document.getElementById('roomsSectionContent')) {
    return;
  }
  
  // Create rooms management UI
  const roomsContainer = document.getElementById('roomsSection');
  roomsContainer.innerHTML = `
    <div id="roomsSectionContent" class="backdrop-blur-sm bg-white/90 border shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="bg-blue-50 border-b p-6">
        <h2 class="text-xl font-semibold">Manage Rooms</h2>
        <p class="text-sm text-gray-500 mt-1">
          Add, edit or remove rooms from the system
        </p>
      </div>
      <div class="p-6">
        <div class="flex justify-end mb-4">
          <button id="addRoomBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add New Room
          </button>
        </div>
        
        <div class="overflow-x-auto rounded-md border">
          <table class="w-full border-collapse">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room ID</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Name</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fixed Passcode</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody id="roomsTableBody" class="bg-white divide-y divide-gray-200">
              <!-- Rooms will be populated here -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Room Modal -->
    <div id="roomModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b">
          <h3 id="roomModalTitle" class="text-lg font-medium">Add New Room</h3>
        </div>
        <div class="p-6">
          <form id="roomForm" class="space-y-4">
            <input type="hidden" id="roomId">
            <div class="space-y-2">
              <label for="roomName" class="block text-sm font-medium text-gray-700">Room Name</label>
              <input type="text" id="roomName" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="space-y-2">
              <label for="roomPasscode" class="block text-sm font-medium text-gray-700">Fixed Passcode (Optional)</label>
              <input type="text" id="roomPasscode" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Leave empty for auto-generated codes">
            </div>
          </form>
        </div>
        <div class="px-6 py-4 border-t bg-gray-50 flex justify-end space-x-2">
          <button id="cancelRoomBtn" class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button id="saveRoomBtn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Room</button>
        </div>
      </div>
    </div>
  `;
  
  // Load and render rooms
  loadRooms();
  
  // Add event listeners
  document.getElementById('addRoomBtn').addEventListener('click', showAddRoomModal);
  document.getElementById('cancelRoomBtn').addEventListener('click', hideRoomModal);
  document.getElementById('saveRoomBtn').addEventListener('click', saveRoom);
}

// Load rooms data
function loadRooms() {
  // Mock rooms data - in a real app this would come from the server
  const rooms = [
    { id: 'room1', name: 'Room 1', fixedPasscode: '' },
    { id: 'room2', name: 'Room 2', fixedPasscode: '123456' },
    { id: 'room3', name: 'Room 3', fixedPasscode: '' },
    { id: 'room4', name: 'Room 4', fixedPasscode: '' },
    { id: 'room5', name: 'Room 5', fixedPasscode: '987654' }
  ];
  
  renderRooms(rooms);
}

// Render rooms table
function renderRooms(rooms) {
  const tableBody = document.getElementById('roomsTableBody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  rooms.forEach(room => {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    row.innerHTML = `
      <td class="px-4 py-3 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${room.id}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${room.name}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap">
        <div class="text-sm text-gray-500">${room.fixedPasscode || 'Auto-generated'}</div>
      </td>
      <td class="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div class="flex space-x-2">
          <button data-room-id="${room.id}" class="edit-room-btn text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded-md hover:bg-indigo-50">
            Edit
          </button>
          <button data-room-id="${room.id}" class="delete-room-btn text-red-600 hover:text-red-900 px-2 py-1 rounded-md hover:bg-red-50">
            Delete
          </button>
        </div>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
  
  // Add event listeners to buttons
  document.querySelectorAll('.edit-room-btn').forEach(button => {
    button.addEventListener('click', function() {
      const roomId = this.getAttribute('data-room-id');
      editRoom(roomId);
    });
  });
  
  document.querySelectorAll('.delete-room-btn').forEach(button => {
    button.addEventListener('click', function() {
      const roomId = this.getAttribute('data-room-id');
      deleteRoom(roomId);
    });
  });
}

// Show add room modal
function showAddRoomModal() {
  document.getElementById('roomModalTitle').textContent = 'Add New Room';
  document.getElementById('roomId').value = '';
  document.getElementById('roomName').value = '';
  document.getElementById('roomPasscode').value = '';
  document.getElementById('roomModal').classList.remove('hidden');
}

// Hide room modal
function hideRoomModal() {
  document.getElementById('roomModal').classList.add('hidden');
}

// Edit room
function editRoom(roomId) {
  // In a real app, you would fetch the room details from the server
  // For this example, we'll use mock data
  const room = {
    id: roomId,
    name: `Room ${roomId.replace('room', '')}`,
    fixedPasscode: roomId === 'room2' || roomId === 'room5' ? (roomId === 'room2' ? '123456' : '987654') : ''
  };
  
  document.getElementById('roomModalTitle').textContent = 'Edit Room';
  document.getElementById('roomId').value = room.id;
  document.getElementById('roomName').value = room.name;
  document.getElementById('roomPasscode').value = room.fixedPasscode;
  document.getElementById('roomModal').classList.remove('hidden');
}

// Save room
function saveRoom() {
  const roomId = document.getElementById('roomId').value;
  const roomName = document.getElementById('roomName').value;
  const roomPasscode = document.getElementById('roomPasscode').value;
  
  if (!roomName) {
    showToast('Error', 'Room name is required', 'error');
    return;
  }
  
  // In a real app, you would save this to the server
  // For now, just show a success message
  showToast('Success', `Room ${roomName} has been saved`, 'success');
  hideRoomModal();
  
  // Reload rooms (in a real app, this would refresh from the server)
  loadRooms();
}

// Delete room
function deleteRoom(roomId) {
  if (confirm('Are you sure you want to delete this room? This cannot be undone.')) {
    // In a real app, you would delete the room on the server
    // For now, just show a success message
    showToast('Success', `Room has been deleted`, 'success');
    
    // Reload rooms (in a real app, this would refresh from the server)
    loadRooms();
  }
}

// Create functions for email and SMS template sections
function initEmailTemplatesSection() {
  const container = document.getElementById('email-templatesSection');
  if (!container) return;
  
  container.innerHTML = `
    <div class="backdrop-blur-sm bg-white/90 border shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="bg-blue-50 border-b p-6">
        <h2 class="text-xl font-semibold">Email Templates</h2>
        <p class="text-sm text-gray-500 mt-1">
          Customize email notification templates for bookings
        </p>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <div class="grid gap-4">
            <h3 class="text-lg font-medium">Booking Confirmation Email</h3>
            <div class="space-y-2">
              <label for="email-subject" class="block text-sm font-medium text-gray-700">Subject Line</label>
              <input 
                type="text" 
                id="email-subject" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value="Your Booking Confirmation"
              >
            </div>
            <div class="space-y-2">
              <label for="email-content" class="block text-sm font-medium text-gray-700">Email Content</label>
              <p class="text-xs text-gray-500 mb-2">
                Use these placeholders: {GUEST_NAME}, {ROOM_NAME}, {ARRIVAL_DATETIME}, {DEPARTURE_DATETIME}, {ACCESS_CODE}
              </p>
              <textarea 
                id="email-content" 
                rows="10" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >Dear {GUEST_NAME},

Thank you for your booking at our property.

Booking Details:
- Room: {ROOM_NAME}
- Check-in: {ARRIVAL_DATETIME}
- Check-out: {DEPARTURE_DATETIME}

Your access code for the room is: {ACCESS_CODE}

Please keep this code safe as you will need it to access your room.
If you have any questions, please don't hesitate to contact us.

Thank you,
The Booking System Team</textarea>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button id="saveEmailTemplate" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  document.getElementById('saveEmailTemplate').addEventListener('click', function() {
    showToast('Success', 'Email template saved successfully', 'success');
  });
}

function initSMSTemplatesSection() {
  const container = document.getElementById('sms-templatesSection');
  if (!container) return;
  
  container.innerHTML = `
    <div class="backdrop-blur-sm bg-white/90 border shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="bg-blue-50 border-b p-6">
        <h2 class="text-xl font-semibold">SMS Templates</h2>
        <p class="text-sm text-gray-500 mt-1">
          Customize SMS notification templates for bookings
        </p>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <div class="grid gap-4">
            <h3 class="text-lg font-medium">Booking Confirmation SMS</h3>
            <div class="space-y-2">
              <p class="text-xs text-gray-500 mb-2">
                Use these placeholders: {GUEST_NAME}, {ROOM_NAME}, {ARRIVAL_DATETIME}, {DEPARTURE_DATETIME}, {ACCESS_CODE}
              </p>
              <textarea 
                id="sms-content" 
                rows="5" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter SMS template text"
              >Hi {GUEST_NAME}, your booking for {ROOM_NAME} is confirmed. Your access code is: {ACCESS_CODE}. Check-in: {ARRIVAL_DATETIME}, Check-out: {DEPARTURE_DATETIME}. Thank you!</textarea>
            </div>
            <div class="flex items-center justify-between">
              <div class="text-sm text-gray-500">
                <span id="sms-counter">0</span>/160 characters
              </div>
              <div class="text-sm text-gray-500">
                <span id="sms-segments">1</span> message segment(s)
              </div>
            </div>
          </div>
          
          <div class="flex justify-end">
            <button id="saveSMSTemplate" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  const smsContent = document.getElementById('sms-content');
  const smsCounter = document.getElementById('sms-counter');
  const smsSegments = document.getElementById('sms-segments');
  
  function updateSMSCounter() {
    const length = smsContent.value.length;
    smsCounter.textContent = length;
    
    // Calculate segments (1 segment = 160 chars, subsequent segments = 153 chars)
    const segments = length <= 160 ? 1 : Math.ceil((length - 160) / 153) + 1;
    smsSegments.textContent = segments;
  }
  
  smsContent.addEventListener('input', updateSMSCounter);
  updateSMSCounter(); // Initial count
  
  document.getElementById('saveSMSTemplate').addEventListener('click', function() {
    showToast('Success', 'SMS template saved successfully', 'success');
  });
}
