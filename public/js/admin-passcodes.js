
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if passcodes section exists
  if (!document.getElementById('passcodesSection')) return;
  
  // Clone the template content to the passcodes section
  const passcodesTemplate = document.getElementById('passcodesTemplate');
  const passcodesSection = document.getElementById('passcodesSection');
  if (passcodesTemplate && passcodesSection) {
    passcodesSection.appendChild(passcodesTemplate.content.cloneNode(true));
  }
  
  // Save settings button
  const saveSettingsButton = document.getElementById('saveSettings');
  if (saveSettingsButton) {
    saveSettingsButton.addEventListener('click', savePasscodeSettings);
  }
  
  // Load rooms and their settings
  loadRoomPasscodeSettings();
  
  // Functions
  function loadRoomPasscodeSettings() {
    const roomSettingsContainer = document.getElementById('roomSettingsContainer');
    if (!roomSettingsContainer) return;
    
    // Simulate API call to get rooms
    setTimeout(() => {
      const rooms = [
        { id: 'room1', name: 'Room 1', customPasscode: '', resetHours: 2 },
        { id: 'room2', name: 'Room 2', customPasscode: '123456', resetHours: 1 },
        { id: 'room3', name: 'Room 3', customPasscode: '', resetHours: 3 },
        { id: 'room4', name: 'Room 4', customPasscode: '', resetHours: 2 },
        { id: 'room5', name: 'Room 5', customPasscode: '654321', resetHours: 0 }
      ];
      
      // Add room settings
      rooms.forEach(room => {
        addRoomSetting(roomSettingsContainer, room);
      });
    }, 500);
  }
  
  function addRoomSetting(container, room) {
    const template = document.getElementById('roomSettingTemplate');
    if (!template) return;
    
    const roomSetting = template.content.cloneNode(true);
    
    // Set room name
    roomSetting.querySelector('.room-name').textContent = room.name;
    
    // Set custom passcode
    const passcodeInput = roomSetting.querySelector('.custom-passcode');
    passcodeInput.value = room.customPasscode;
    passcodeInput.setAttribute('data-room-id', room.id);
    
    // Set reset hours
    const resetHoursInput = roomSetting.querySelector('.reset-hours');
    resetHoursInput.value = room.resetHours;
    resetHoursInput.setAttribute('data-room-id', room.id);
    
    container.appendChild(roomSetting);
  }
  
  function savePasscodeSettings() {
    const passcodeLength = document.getElementById('passcode-length').value;
    const passcodeType = document.getElementById('passcode-type').value;
    const emailNotification = document.getElementById('email-notification').checked;
    const smsNotification = document.getElementById('sms-notification').checked;
    
    // Get all room-specific settings
    const customPasscodes = {};
    const resetHours = {};
    
    document.querySelectorAll('.custom-passcode').forEach(input => {
      const roomId = input.getAttribute('data-room-id');
      customPasscodes[roomId] = input.value;
    });
    
    document.querySelectorAll('.reset-hours').forEach(input => {
      const roomId = input.getAttribute('data-room-id');
      resetHours[roomId] = input.value;
    });
    
    // Simulate API call to save settings
    setTimeout(() => {
      // Combine all settings
      const settings = {
        passcodeLength,
        passcodeType,
        notifications: {
          email: emailNotification,
          sms: smsNotification
        },
        rooms: Object.keys(customPasscodes).map(roomId => ({
          id: roomId,
          customPasscode: customPasscodes[roomId],
          resetHours: resetHours[roomId]
        }))
      };
      
      console.log('Saving passcode settings:', settings);
      
      showToast('success', 'Settings Saved', 'Passcode settings have been saved successfully');
    }, 500);
  }
});
