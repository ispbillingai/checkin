
document.addEventListener('DOMContentLoaded', function() {
  // Only initialize if email templates section exists
  if (!document.getElementById('emailTemplatesSection')) return;
  
  // Clone the template content to the email templates section
  const emailTemplatesTemplate = document.getElementById('emailTemplatesTemplate');
  const emailTemplatesSection = document.getElementById('emailTemplatesSection');
  if (emailTemplatesTemplate && emailTemplatesSection) {
    emailTemplatesSection.appendChild(emailTemplatesTemplate.content.cloneNode(true));
  }
  
  // Save template button
  const saveEmailTemplateButton = document.getElementById('saveEmailTemplate');
  if (saveEmailTemplateButton) {
    saveEmailTemplateButton.addEventListener('click', saveEmailTemplate);
  }
  
  // Editor toolbar buttons
  const editorButtons = document.querySelectorAll('.bg-gray-50.px-3.py-2.border-b button');
  if (editorButtons) {
    editorButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        const emailTemplate = document.getElementById('emailTemplate');
        
        if (!emailTemplate) return;
        
        const title = this.getAttribute('title');
        
        // Get the current selection
        const selectionStart = emailTemplate.selectionStart;
        const selectionEnd = emailTemplate.selectionEnd;
        const selectedText = emailTemplate.value.substring(selectionStart, selectionEnd);
        
        // Apply formatting based on button title
        let replacement = '';
        
        switch (title) {
          case 'Bold':
            replacement = `**${selectedText}**`;
            break;
          case 'Italic':
            replacement = `*${selectedText}*`;
            break;
          case 'Underline':
            replacement = `_${selectedText}_`;
            break;
          case 'Insert Variable':
            // Show variable selection dropdown or modal
            const variable = prompt('Select a variable:', '{guest_name}');
            if (variable) {
              replacement = variable;
            } else {
              return;
            }
            break;
          default:
            return;
        }
        
        // Replace the selected text with the formatted text
        emailTemplate.value = 
          emailTemplate.value.substring(0, selectionStart) + 
          replacement + 
          emailTemplate.value.substring(selectionEnd);
        
        // Set focus back to the textarea
        emailTemplate.focus();
      });
    });
  }
  
  // Functions
  function saveEmailTemplate() {
    const emailSubject = document.getElementById('emailSubject').value;
    const emailTemplate = document.getElementById('emailTemplate').value;
    
    if (!emailSubject || !emailTemplate) {
      showToast('error', 'Validation Error', 'Subject and template content are required');
      return;
    }
    
    // Simulate API call to save template
    setTimeout(() => {
      console.log('Saving email template:', { subject: emailSubject, content: emailTemplate });
      
      showToast('success', 'Template Saved', 'Email template has been saved successfully');
    }, 500);
  }
});
