
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

// Modal functions
const showModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
  }
};

const hideModal = (modalId) => {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
  }
};

// Clear form fields
const clearForm = (formId) => {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    // Clear any hidden fields or custom elements
    form.querySelectorAll('input[type="hidden"]').forEach(input => {
      input.value = '';
    });
  }
};

export { showPanel, showModal, hideModal, clearForm };
