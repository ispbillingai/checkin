
// Template loader utility
const loadTemplates = async () => {
  try {
    const templates = [
      { id: 'login-template', path: '/src/templates/login.html' },
      { id: 'sidebar-template', path: '/src/templates/sidebar.html' },
      { id: 'dashboard-template', path: '/src/templates/dashboard.html' },
      { id: 'bookings-template', path: '/src/templates/bookings.html' },
      { id: 'rooms-template', path: '/src/templates/rooms.html' },
      { id: 'entry-points-template', path: '/src/templates/entry-points.html' },
      { id: 'settings-template', path: '/src/templates/settings.html' },
      { id: 'staff-template', path: '/src/templates/staff.html' }
    ];
    
    for (const template of templates) {
      const response = await fetch(template.path);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${template.path}`);
      }
      
      const html = await response.text();
      
      // Create a placeholder element in the DOM
      const placeholder = document.getElementById(template.id);
      if (placeholder) {
        placeholder.innerHTML = html;
      } else {
        console.error(`Template placeholder not found: ${template.id}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error loading templates:', error);
    return false;
  }
};

export { loadTemplates };
