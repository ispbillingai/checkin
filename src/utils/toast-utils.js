
// Toast notifications
const showToast = (message, type = 'info') => {
  // Remove any existing toasts
  const existingToasts = document.querySelectorAll('.toast');
  existingToasts.forEach(toast => toast.remove());
  
  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set icon based on type
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';
  if (type === 'warning') icon = 'exclamation-triangle';
  
  toast.innerHTML = `
    <div class="flex items-center">
      <i class="fas fa-${icon} mr-2 ${type === 'info' ? 'text-blue-500' : 
                                     type === 'success' ? 'text-green-500' : 
                                     type === 'warning' ? 'text-yellow-500' : 'text-red-500'}"></i>
      <div>${message}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Auto remove toast after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'opacity 0.5s, transform 0.5s';
    
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 5000);
};

export { showToast };
