
/**
 * Entry points data fetching and rendering utility
 */

// Store entry points data globally to share between components
window.entryPointsData = window.entryPointsData || {
  entryPoints: null,
  isLoading: false,
  hasLoaded: false,
  error: null
};

// Function to fetch entry points data with enhanced error handling
function fetchEntryPointsData() {
  console.log('fetchEntryPointsData: Starting to fetch entry points');
  
  // If we're already loading, return the existing promise
  if (window.entryPointsData.isLoading) {
    console.log('fetchEntryPointsData: Already loading, waiting for completion');
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (!window.entryPointsData.isLoading) {
          clearInterval(checkInterval);
          console.log('fetchEntryPointsData: Previous load completed, returning cached data');
          resolve(window.entryPointsData.entryPoints || getDemoEntryPoints());
        }
      }, 100);
    });
  }
  
  // If we already have entry points data, return it
  if (window.entryPointsData.hasLoaded && window.entryPointsData.entryPoints) {
    console.log('fetchEntryPointsData: Using cached entry points data');
    return Promise.resolve(window.entryPointsData.entryPoints);
  }
  
  // Set loading state
  window.entryPointsData.isLoading = true;
  console.log('fetchEntryPointsData: Fetching entry points from API');
  
  return fetch('/api/get_all_entry_points.php')
    .then(response => {
      console.log(`fetchEntryPointsData: API response status: ${response.status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      try {
        // Try to parse as JSON
        const data = JSON.parse(text);
        console.log('fetchEntryPointsData: Successfully parsed API response', data);
        if (data.success) {
          window.entryPointsData.entryPoints = data.entry_points;
          window.entryPointsData.hasLoaded = true;
          return data.entry_points;
        } else {
          // If API returns an error message
          throw new Error(data.message || 'Failed to load entry points data');
        }
      } catch (e) {
        console.error('fetchEntryPointsData: JSON parsing error', e);
        // If parsing fails, throw an error
        throw new Error("Server returned invalid JSON response");
      }
    })
    .catch(error => {
      console.error('fetchEntryPointsData: Error fetching entry points', error);
      window.entryPointsData.error = error.message;
      
      // Return demo data as fallback
      const demoEntryPoints = getDemoEntryPoints();
      console.log('fetchEntryPointsData: Using demo entry points as fallback', demoEntryPoints);
      window.entryPointsData.entryPoints = demoEntryPoints;
      window.entryPointsData.hasLoaded = true;
      
      return demoEntryPoints;
    })
    .finally(() => {
      window.entryPointsData.isLoading = false;
      console.log('fetchEntryPointsData: Completed loading entry points');
    });
}

// Function to get demo entry points data
function getDemoEntryPoints() {
  console.log('getDemoEntryPoints: Returning demo entry points data');
  return [
    {
      id: 'entry1',
      name: 'Main Entrance',
      description: 'Front door at the main lobby'
    },
    {
      id: 'entry2',
      name: 'Side Entrance',
      description: 'Side entrance near the parking lot'
    },
    {
      id: 'entry3',
      name: 'Back Entrance',
      description: 'Back entrance near the garden'
    }
  ];
}

// Function to render entry points into the container
function renderEntryPoints(entryPoints, containerId = 'entryPointsContainer') {
  console.log(`renderEntryPoints: Rendering ${entryPoints?.length || 0} entry points to ${containerId}`);
  const entryPointsContainer = document.getElementById(containerId);
  if (!entryPointsContainer) {
    console.error(`renderEntryPoints: Container #${containerId} not found`);
    // Try again after a short delay if possible
    setTimeout(() => {
      const retryContainer = document.getElementById(containerId);
      if (retryContainer) {
        console.log(`renderEntryPoints: Found container #${containerId} after delay`);
        renderEntryPointsToContainer(retryContainer, entryPoints);
      }
    }, 500);
    return;
  }
  
  renderEntryPointsToContainer(entryPointsContainer, entryPoints);
}

function renderEntryPointsToContainer(container, entryPoints) {
  console.log(`renderEntryPointsToContainer: Starting to render ${entryPoints?.length || 0} entry points`);
  
  if (!entryPoints || entryPoints.length === 0) {
    console.warn('renderEntryPointsToContainer: No entry points to render');
    container.innerHTML = '<div class="col-span-full text-center text-gray-500">No entry points available at the moment.</div>';
    return;
  }
  
  container.innerHTML = '';
  
  entryPoints.forEach(entryPoint => {
    console.log(`renderEntryPointsToContainer: Rendering entry point: ${entryPoint.name}`);
    const entryPointCard = document.createElement('div');
    entryPointCard.className = "bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1";
    
    entryPointCard.innerHTML = `
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">${entryPoint.name}</h3>
        <p class="text-gray-600 mb-4">${entryPoint.description || 'No description available'}</p>
        <button 
          class="select-entry-point-btn bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors w-full" 
          data-entry-id="${entryPoint.id}" 
          data-entry-name="${entryPoint.name}"
        >
          Select Entry Point
        </button>
      </div>
    `;
    
    container.appendChild(entryPointCard);
  });
  
  // Add event listeners to select entry point buttons
  document.querySelectorAll('.select-entry-point-btn').forEach(button => {
    button.addEventListener('click', function() {
      const entryId = this.getAttribute('data-entry-id');
      const entryName = this.getAttribute('data-entry-name');
      console.log(`Entry point selected: ${entryName} (${entryId})`);
      
      // Scroll to booking form
      const bookingForm = document.getElementById('bookingForm');
      if (bookingForm) {
        bookingForm.scrollIntoView({ behavior: 'smooth' });
        
        // If there are entry point checkboxes, check the selected one
        const entryCheckbox = document.getElementById(`entryPoint_${entryId}`);
        if (entryCheckbox) {
          entryCheckbox.checked = true;
          
          // Trigger change event if needed
          const event = new Event('change');
          entryCheckbox.dispatchEvent(event);
        }
      }
      
      // Show toast notification
      if (window.showToast) {
        window.showToast('success', 'Entry Point Selected', `${entryName} selected. Please complete the booking form.`);
      } else if (window.showToastMessage) {
        window.showToastMessage('success', `${entryName} selected. Please complete the booking form.`);
      }
    });
  });
  
  console.log('renderEntryPointsToContainer: Finished rendering entry points');
}

// Initialize entry points section
function initEntryPointsSection() {
  console.log('initEntryPointsSection: Initializing entry points section');
  // Fetch and render entry points
  fetchEntryPointsData()
    .then(entryPoints => {
      renderEntryPoints(entryPoints);
    });
}

// Populate entry point checkboxes from cached data
function populateEntryPointCheckboxes() {
  const entryPointsCheckboxes = document.getElementById('entryPointsCheckboxes');
  if (!entryPointsCheckboxes) {
    console.log('populateEntryPointCheckboxes: Checkboxes container not found');
    return;
  }
  
  console.log('populateEntryPointCheckboxes: Populating entry point checkboxes');
  
  // Use cached entry points data or fetch new data
  const getEntryPoints = window.entryPointsData.hasLoaded 
    ? Promise.resolve(window.entryPointsData.entryPoints || getDemoEntryPoints())
    : fetchEntryPointsData();
  
  getEntryPoints.then(entryPoints => {
    console.log(`populateEntryPointCheckboxes: Got ${entryPoints.length} entry points`);
    entryPointsCheckboxes.innerHTML = '';
    
    // Add entry point checkboxes
    entryPoints.forEach(entry => {
      const checkboxId = `entryPoint_${entry.id}`;
      
      const div = document.createElement('div');
      div.className = 'flex items-start mb-2';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = checkboxId;
      checkbox.name = 'entryPoints[]';
      checkbox.value = entry.id;
      checkbox.className = 'mt-1 mr-2';
      
      const label = document.createElement('label');
      label.htmlFor = checkboxId;
      label.className = 'text-sm';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'font-medium block';
      nameSpan.textContent = entry.name;
      
      const descSpan = document.createElement('span');
      descSpan.className = 'text-xs text-gray-500';
      descSpan.textContent = entry.description || 'No description available';
      
      label.appendChild(nameSpan);
      label.appendChild(descSpan);
      div.appendChild(checkbox);
      div.appendChild(label);
      entryPointsCheckboxes.appendChild(div);
    });
    
    console.log('populateEntryPointCheckboxes: Completed populating checkboxes');
  });
}

// Export functions
window.initEntryPointsSection = initEntryPointsSection;
window.fetchEntryPointsData = fetchEntryPointsData;
window.renderEntryPoints = renderEntryPoints;
window.populateEntryPointCheckboxes = populateEntryPointCheckboxes;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded: Entry points data script loaded');
  
  // Check if we're on a page with the entry points section
  if (document.getElementById('entryPointsContainer')) {
    console.log('DOMContentLoaded: Found entry points container, initializing section');
    initEntryPointsSection();
  }
  
  // Check for and populate entry point checkboxes
  if (document.getElementById('entryPointsCheckboxes')) {
    console.log('DOMContentLoaded: Found entry points checkboxes, populating');
    populateEntryPointCheckboxes();
  }
});
