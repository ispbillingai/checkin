
document.addEventListener('DOMContentLoaded', function() {
  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      if (sidebar.classList.contains('w-64')) {
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-16');
        
        // Hide text in sidebar buttons
        document.querySelectorAll('#sidebar button span').forEach(span => {
          span.classList.add('hidden');
        });
      } else {
        sidebar.classList.remove('w-16');
        sidebar.classList.add('w-64');
        
        // Show text in sidebar buttons
        document.querySelectorAll('#sidebar button span').forEach(span => {
          span.classList.remove('hidden');
        });
      }
    });
  }
  
  // Section navigation
  const sectionButtons = document.querySelectorAll('[data-section]');
  const sectionContents = document.querySelectorAll('.section-content');
  
  sectionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const sectionName = this.getAttribute('data-section');
      
      // Update active button
      sectionButtons.forEach(btn => {
        btn.classList.remove('bg-blue-100', 'text-blue-600');
        btn.classList.add('hover:bg-gray-100');
      });
      this.classList.add('bg-blue-100', 'text-blue-600');
      this.classList.remove('hover:bg-gray-100');
      
      // Show target section, hide others
      sectionContents.forEach(section => {
        section.classList.add('hidden');
      });
      
      const targetSection = document.getElementById(sectionName + 'Section');
      if (targetSection) {
        targetSection.classList.remove('hidden');
        
        // Initialize section content if needed
        if (sectionName === 'bookings' && typeof initBookingsSection === 'function') {
          initBookingsSection();
        } else if (sectionName === 'passcodes' && typeof initPasscodesSection === 'function') {
          initPasscodesSection();
        } else if (sectionName === 'database' && typeof initDatabaseSection === 'function') {
          initDatabaseSection();
        } else if (sectionName === 'rooms' && typeof initRoomsSection === 'function') {
          initRoomsSection();
        } else if (sectionName === 'email-templates' && typeof initEmailTemplatesSection === 'function') {
          initEmailTemplatesSection();
        } else if (sectionName === 'sms-templates' && typeof initSMSTemplatesSection === 'function') {
          initSMSTemplatesSection();
        }
      }
    });
  });
  
  // Initialize first section (bookings) by default
  const bookingsButton = document.querySelector('[data-section="bookings"]');
  if (bookingsButton) {
    bookingsButton.click();
  }
});
