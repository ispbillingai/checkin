
document.addEventListener('DOMContentLoaded', function() {
  // Sidebar toggle functionality
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', function() {
      sidebar.classList.toggle('w-64');
      sidebar.classList.toggle('w-16');
      
      // Toggle visibility of text in sidebar
      const textElements = sidebar.querySelectorAll('span');
      textElements.forEach(el => {
        el.classList.toggle('hidden');
      });
    });
  }
  
  // Section navigation
  const sectionButtons = document.querySelectorAll('[data-section]');
  const sections = document.querySelectorAll('.section-content');
  
  sectionButtons.forEach(button => {
    button.addEventListener('click', function() {
      const sectionId = this.getAttribute('data-section');
      const targetSection = document.getElementById(`${sectionId}Section`);
      
      // Hide all sections
      sections.forEach(section => {
        section.classList.add('hidden');
      });
      
      // Show target section
      if (targetSection) {
        targetSection.classList.remove('hidden');
      }
      
      // Update active button
      sectionButtons.forEach(btn => {
        btn.classList.remove('bg-blue-100', 'text-blue-600');
        btn.classList.add('hover:bg-gray-100');
      });
      
      this.classList.add('bg-blue-100', 'text-blue-600');
      this.classList.remove('hover:bg-gray-100');
    });
  });
});
