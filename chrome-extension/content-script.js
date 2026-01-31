// ReplyWise Gmail Content Script

console.log("ReplyWise content script loaded");

/////////////////////////////////////////////
// Inject ReplyWise button into compose UI
/////////////////////////////////////////////

function injectReplyWiseButton() {
  const observer = new MutationObserver(() => {
    // Gmail compose window
    const composeToolbars = document.querySelectorAll('[role="toolbar"]');

    composeToolbars.forEach(toolbar => {
      if (toolbar.querySelector('#replywise-compose-btn')) return;

      const btn = document.createElement('button');
      btn.id = 'replywise-compose-btn';
      btn.textContent = '✨ ReplyWise';

      btn.style.cssText = `
        margin-left:8px;
        padding:6px 12px;
        background:linear-gradient(135deg,#667eea,#764ba2);
        color:white;
        border:none;
        border-radius:4px;
        cursor:pointer;
        font-weight:600;
        font-size:12px;
      `;

      btn.addEventListener('click', extractEmailAndOpenReplyWise);

      toolbar.appendChild(btn);
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

/////////////////////////////////////////////
// Extract email content safely
/////////////////////////////////////////////

function extractEmailAndOpenReplyWise() {
  // Gmail message bodies usually have this class
  const messageBodies = document.querySelectorAll('.a3s');

  if (!messageBodies.length) {
    alert('ReplyWise: Email content not found.');
    return;
  }

  // Usually last message is the active one
  const lastMessage = messageBodies[messageBodies.length - 1];

  const emailText =
    lastMessage.innerText ||
    lastMessage.textContent ||
    '';

  if (!emailText.trim()) {
    alert('ReplyWise: Email content empty.');
    return;
  }

  chrome.storage.local.set({ selectedEmail: emailText }, () => {
    chrome.action.openPopup();
  });
}

/////////////////////////////////////////////
// Messaging API
/////////////////////////////////////////////

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_EMAIL_CONTENT') {
    const messageBodies = document.querySelectorAll('.a3s');
    const lastMessage = messageBodies[messageBodies.length - 1];

    sendResponse({
      emailText: lastMessage?.innerText || '',
    });
  }
});

/////////////////////////////////////////////
// Init
/////////////////////////////////////////////

injectReplyWiseButton();
