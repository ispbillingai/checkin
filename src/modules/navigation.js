
// Navigation functions
const showPanel = (panelId) => {
  // Hide all panels
  document.querySelectorAll('.admin-panel').forEach(panel => {
    panel.classList.add('hidden');
  });
  
  // Remove active class from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('bg-blue-100', 'text-blue-600', 'active');
  });
  
  // Show selected panel
  const panel = document.getElementById(`panel-${panelId}`);
  if (panel) {
    panel.classList.remove('hidden');
  }
  
  // Add active class to selected nav link
  const navLink = document.getElementById(`nav-${panelId}`);
  if (navLink) {
    navLink.classList.add('bg-blue-100', 'text-blue-600', 'active');
  }
};

export { showPanel };
