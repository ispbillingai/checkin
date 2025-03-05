
// Initialize passcodes data and UI
let roomsData = [];

function initPasscodesSection() {
  // If section already initialized, just refresh data
  if (document.getElementById('passcodesSectionContent')) {
    return;
  }
  
  // Create passcodes UI
  const passcodesContainer = document.getElementById('passcodesSection');
  passcodesContainer.innerHTML = `
    <div id="passcodesSectionContent" class="backdrop-blur-sm bg-white/90 border shadow-lg rounded-lg overflow-hidden mb-8">
      <div class="bg-blue-50 border-b p-6">
        <h2 class="text-xl font-semibold">Room Passcodes</h2>
        <p class="text-sm text-gray-500 mt-1">
          Manage passcodes for rooms and notification settings
        </p>
      </div>
      <div class="p-6">
        <div class="space-y-6">
          <div class="grid gap-4">
            <h3 class="text-lg font-medium">Default Passcode Settings</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <label for="passcode-length" class="block text-sm font-medium text-gray-700">Passcode Length</label>
                <select id="passcode-length" class="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="4">4 digits</option>
                  <option value="6" selected>6 digits</option>
                  <option value="8">8 digits</option>
                </select>
              </div>
              <div class="space-y-2">
                <label for="passcode-type" class="block text-sm font-medium text-gray-700">Passcode Type</label>
                <select id="passcode-type" class="w-full h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="numeric" selected>Numeric only</option>
                  <option value="alphanumeric">Alphanumeric</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="grid gap-4">
            <h3 class="text-lg font-medium">Notification Settings</h3>
            <div class="grid grid-cols-1 gap-4">
              <div class="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="email-notification"
                  class="mt-1"
                  checked
                />
                <div class="space-y-1">
                  <label for="email-notification" class="block text-sm font-medium text-gray-700">Email Notification</label>
                  <p class="text-sm text-gray-500">Send passcode to guest via email when booking is confirmed</p>
                </div>
              </div>
              <div class="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="sms-notification"
                  class="mt-1"
                />
                <div class="space-y-1">
                  <label for="sms-notification" class="block text-sm font-medium text-gray-700">SMS Notification</label>
                  <p class="text-sm text-gray-500">Send passcode to guest via SMS when booking is confirmed</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="grid gap-4" id="roomSettingsContainer">
            <h3 class="text-lg font-medium">Room-Specific Settings</h3>
            <!-- Room settings will be populated here by JavaScript -->
          </div>
          
          <div class="flex justify-end">
            <button id="saveSettings" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load mock room data
  roomsData = [
    { id: 'room1', name: 'Room 1', customPasscode: '', resetHours: 2 },
    { id: 'room2', name: 'Room 2', customPasscode: '123456', resetHours: 3 },
    { id: 'room3', name: 'Room 3', customPasscode: '', resetHours: 2 },
    { id: 'room4', name: 'Room 4', customPasscode: '', resetHours: 2 },
    { id: 'room5', name: 'Room 5', customPasscode: '987654', resetHours: 1 }
  ];
  
  // Render room settings
  renderRoomSettings();
  
  // Add event listeners
  document.getElementById('saveSettings').addEventListener('click', savePasscodeSettings);
}

// Render room settings
function renderRoomSettings() {
  const container = document.getElementById('roomSettingsContainer');
  if (!container) return;
  
  roomsData.forEach(room => {
    const roomElement = document.createElement('div');
    roomElement.className = 'border rounded-md overflow-hidden mb-4';
    roomElement.innerHTML = `
      <div class="bg-gray-50 py-3 px-4 border-b">
        <h4 class="text-base font-medium">${room.name}</h4>
      </div>
      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label for="custom-passcode-${room.id}" class="block text-sm font-medium text-gray-700">Custom Fixed Passcode (Optional)</label>
            <input 
              type="text" 
              id="custom-passcode-${room.id}" 
              class="custom-passcode w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="Leave empty for auto-generated"
              value="${room.customPasscode}"
            >
            <p class="text-xs text-gray-500">If set, this fixed passcode will be used for all bookings</p>
          </div>
          <div class="space-y-2">
            <label for="reset-hours-${room.id}" class="block text-sm font-medium text-gray-700">Auto Reset (hours after checkout)</label>
            <input 
              type="number" 
              id="reset-hours-${room.id}" 
              min="0" 
              value="${room.resetHours}" 
              class="reset-hours w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>
    `;
    
    container.appendChild(roomElement);
  });
}

// Save passcode settings
function savePasscodeSettings() {
  // Get global settings
  const passcodeLength = document.getElementById('passcode-length').value;
  const passcodeType = document.getElementById('passcode-type').value;
  const emailNotification = document.getElementById('email-notification').checked;
  const smsNotification = document.getElementById('sms-notification').checked;
  
  // Get room-specific settings
  roomsData.forEach(room => {
    room.customPasscode = document.getElementById(`custom-passcode-${room.id}`).value;
    room.resetHours = document.getElementById(`reset-hours-${room.id}`).value;
  });
  
  // Prepare data for API
  const settings = {
    passcodeLength,
    passcodeType,
    notifications: {
      email: emailNotification,
      sms: smsNotification
    },
    rooms: roomsData
  };
  
  console.log('Saved settings:', settings);
  
  // In a real app, you would send this to the server
  // For now, just show a success toast
  showToast('Settings Saved', 'Passcode settings have been successfully updated', 'success');
}
