
document.addEventListener('DOMContentLoaded', function() {
  // Sidebar toggle
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebarToggle');
  
  sidebarToggle.addEventListener('click', function() {
    if (sidebar.classList.contains('w-64')) {
      sidebar.classList.remove('w-64');
      sidebar.classList.add('w-0', 'overflow-hidden', 'opacity-0');
    } else {
      sidebar.classList.add('w-64');
      sidebar.classList.remove('w-0', 'overflow-hidden', 'opacity-0');
    }
  });
  
  // Section navigation
  const sectionButtons = document.querySelectorAll('[data-section]');
  const sections = document.querySelectorAll('.section-content');
  
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
      
      // Hide all sections
      sections.forEach(section => {
        section.classList.add('hidden');
      });
      
      // Show the selected section
      const selectedSection = document.getElementById(`${sectionName}Section`);
      if (selectedSection) {
        selectedSection.classList.remove('hidden');
      }
    });
  });
});
