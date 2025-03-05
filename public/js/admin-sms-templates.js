
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if SMS templates section exists
  if (!document.getElementById('smsTemplatesSection')) return;
  
  // Clone the template content to the SMS templates section
  const smsTemplatesTemplate = document.getElementById('smsTemplatesTemplate');
  const smsTemplatesSection = document.getElementById('smsTemplatesSection');
  if (smsTemplatesTemplate && smsTemplatesSection) {
    smsTemplatesSection.appendChild(smsTemplatesTemplate.content.cloneNode(true));
  }
  
  // Save template button
  const saveSmsTemplateButton = document.getElementById('saveSmsTemplate');
  if (saveSmsTemplateButton) {
    saveSmsTemplateButton.addEventListener('click', saveSmsTemplate);
  }
  
  // SMS character count
  const smsTemplate = document.getElementById('smsTemplate');
  if (smsTemplate) {
    smsTemplate.addEventListener('input', updateSmsCharCount);
    
    // Initialize character count
    updateSmsCharCount();
  }
  
  // Functions
  function updateSmsCharCount() {
    const smsTemplate = document.getElementById('smsTemplate');
    const smsCharCount = document.getElementById('smsCharCount');
    const smsCharCountBar = document.getElementById('smsCharCountBar');
    
    if (!smsTemplate || !smsCharCount || !smsCharCountBar) return;
    
    const count = smsTemplate.value.length;
    const maxCount = 160;
    const percentage = Math.min((count / maxCount) * 100, 100);
    
    smsCharCount.textContent = count;
    smsCharCountBar.style.width = `${percentage}%`;
    
    // Update bar color based on count
    if (count > maxCount) {
      smsCharCountBar.classList.remove('bg-blue-600', 'bg-yellow-500');
      smsCharCountBar.classList.add('bg-red-600');
    } else if (count > maxCount * 0.8) {
      smsCharCountBar.classList.remove('bg-blue-600', 'bg-red-600');
      smsCharCountBar.classList.add('bg-yellow-500');
    } else {
      smsCharCountBar.classList.remove('bg-yellow-500', 'bg-red-600');
      smsCharCountBar.classList.add('bg-blue-600');
    }
  }
  
  function saveSmsTemplate() {
    const smsTemplate = document.getElementById('smsTemplate').value;
    
    if (!smsTemplate) {
      showToast('error', 'Validation Error', 'Template content is required');
      return;
    }
    
    if (smsTemplate.length > 160) {
      showToast('warning', 'Character Limit', 'SMS exceeds 160 characters and may be sent as multiple messages');
    }
    
    // Simulate API call to save template
    setTimeout(() => {
      console.log('Saving SMS template:', { content: smsTemplate });
      
      showToast('success', 'Template Saved', 'SMS template has been saved successfully');
    }, 500);
  }
});
