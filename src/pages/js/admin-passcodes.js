
document.addEventListener('DOMContentLoaded', function() {
  // Initialize passcodes section
  initPasscodesSection();
  
  function initPasscodesSection() {
    // Get template content
    const template = document.getElementById('passcodesTemplate');
    const passcodesSection = document.getElementById('passcodesSection');
    
    // Clone template content and append to section
    const content = template.content.cloneNode(true);
    passcodesSection.appendChild(content);
    
    // Room settings
    const roomSettingsContainer = document.getElementById('roomSettingsContainer');
    const rooms = [
      { id: "room1", name: "Room 1" },
      { id: "room2", name: "Room 2" },
      { id: "room3", name: "Room 3" },
      { id: "room4", name: "Room 4" },
      { id: "room5", name: "Room 5" },
    ];
    
    // Add room settings
    rooms.forEach(room => {
      const roomTemplate = document.getElementById('roomSettingTemplate');
      const roomElement = roomTemplate.content.cloneNode(true);
      
      // Update room name
      roomElement.querySelector('h4').textContent = room.name;
      
      // Update IDs and labels
      const customPasscodeLabel = roomElement.querySelector('.custom-passcode-label');
      const customPasscodeInput = roomElement.querySelector('.custom-passcode');
      const resetHoursLabel = roomElement.querySelector('.reset-hours-label');
      const resetHoursInput = roomElement.querySelector('.reset-hours');
      
      customPasscodeLabel.setAttribute('for', `${room.id}-custom-passcode`);
      customPasscodeInput.setAttribute('id', `${room.id}-custom-passcode`);
      resetHoursLabel.setAttribute('for', `${room.id}-reset-hours`);
      resetHoursInput.setAttribute('id', `${room.id}-reset-hours`);
      
      roomSettingsContainer.appendChild(roomElement);
    });
    
    // Save settings button
    const saveSettingsButton = document.getElementById('saveSettings');
    saveSettingsButton.addEventListener('click', function() {
      // Simulate saving settings
      showToast('success', 'Settings saved', 'Passcode settings have been saved successfully.');
    });
  }
});
