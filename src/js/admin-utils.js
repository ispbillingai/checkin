
// admin-utils.js - Utility functions for the admin dashboard

// Toast notification function
function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');
    
    // Set content
    toastTitle.textContent = title;
    toastMessage.textContent = message;
    
    // Set icon based on type
    let iconSvg = '';
    let iconColor = '';
    
    switch(type) {
        case 'success':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>`;
            iconColor = 'text-green-500';
            break;
        case 'error':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>`;
            iconColor = 'text-red-500';
            break;
        case 'warning':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>`;
            iconColor = 'text-yellow-500';
            break;
        default: // info
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`;
            iconColor = 'text-blue-500';
    }
    
    toastIcon.innerHTML = iconSvg;
    
    // Show the toast
    toast.classList.remove('translate-x-full');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

// Format date for display
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time for display
function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr.substring(0, 5); // Take HH:MM part
}

// Create element with attributes
function createElement(tag, attributes = {}, innerHTML = '') {
    const element = document.createElement(tag);
    
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'classList' && Array.isArray(value)) {
            element.classList.add(...value);
        } else {
            element.setAttribute(key, value);
        }
    }
    
    if (innerHTML) {
        element.innerHTML = innerHTML;
    }
    
    return element;
}

// Function to handle API errors
function handleApiError(error) {
    console.error('API Error:', error);
    showToast('Error', error.message || 'An unexpected error occurred', 'error');
}

// Helper to fetch API data with error handling
async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        handleApiError(error);
        throw error;
    }
}

// Export utilities if needed
window.adminUtils = {
    showToast,
    formatDate,
    formatTime,
    createElement,
    handleApiError,
    fetchWithErrorHandling
};
