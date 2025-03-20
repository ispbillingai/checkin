
/**
 * Entry points functionality has been removed as requested.
 * This file contains empty placeholder functions to prevent errors.
 * PIN position and code functionality is still available.
 */

// Empty placeholder functions
window.initEntryPointsSection = function() {
  console.log('Entry points functionality has been removed');
};

window.fetchEntryPointsData = function() {
  console.log('Entry points functionality has been removed');
  return Promise.resolve([]);
};

window.renderEntryPoints = function() {
  console.log('Entry points functionality has been removed');
};

window.populateEntryPointCheckboxes = function() {
  console.log('Entry points functionality has been removed');
};

window.retryLoadEntryPoints = function() {
  console.log('Entry points functionality has been removed');
};

// PIN functionality is still available
window.generatePinCode = function(length = 4) {
  // Generate a random PIN code
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

window.validatePinPosition = function(position) {
  // Validate position is between 1 and 64
  return position >= 1 && position <= 64;
};

// Check available positions function
window.checkAvailablePositions = function(entryPointId) {
  return fetch(`/api/get_available_positions.php?entry_point_id=${entryPointId}`)
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        return data.positions;
      } else {
        console.error('Error checking available positions:', data.message);
        return [];
      }
    })
    .catch(error => {
      console.error('Error fetching available positions:', error);
      return [];
    });
};

// Notify on load
document.addEventListener('DOMContentLoaded', function() {
  console.log('entry-points-data.js: Entry points functionality has been removed, but PIN position and code functionality is available');
});
