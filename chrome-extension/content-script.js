// Content script for Gmail integration
// This runs on mail.google.com pages

// Inject a button in Gmail compose area
function injectReplyWiseButton() {
  // Wait for Gmail to load
  const observer = new MutationObserver(() => {
    // Look for compose area
    const composeArea = document.querySelector('[role="region"]');
    
    if (composeArea && !document.getElementById('replywise-compose-btn')) {
      // Find the compose button area and add ReplyWise button
      const toolbar = document.querySelector('[role="toolbar"]');
      
      if (toolbar) {
        const btn = document.createElement('button');
        btn.id = 'replywise-compose-btn';
        btn.innerHTML = '✨ ReplyWise';
        btn.style.cssText = `
          padding: 10px 16px;
          margin-left: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 600;
          font-size: 13px;
          transition: transform 0.2s;
        `;
        
        btn.addEventListener('mouseover', () => {
          btn.style.transform = 'scale(1.05)';
        });
        
        btn.addEventListener('mouseout', () => {
          btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => {
          extractEmailAndOpenReplyWise();
        });
        
        toolbar.appendChild(btn);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Extract the email being replied to
function extractEmailAndOpenReplyWise() {
  // Get the email content
  const emailBody = document.querySelector('[role="presentation"]');
  
  if (emailBody) {
    const emailText = emailBody.innerText || emailBody.textContent;
    
    // Send to popup
    chrome.storage.local.set({ selectedEmail: emailText }, () => {
      chrome.action.openPopup();
    });
  } else {
    alert('Could not extract email content. Please try again.');
  }
}

// Add context menu option
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_EMAIL_CONTENT') {
    const emailBody = document.querySelector('[role="presentation"]');
    const emailText = emailBody?.innerText || '';
    sendResponse({ emailText });
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  injectReplyWiseButton();
});

// Also try to inject immediately
injectReplyWiseButton();
