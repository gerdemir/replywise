// ============================================
// ReplyWise Gmail Integration (PRO VERSION)
// Opens full web app instead of popup
// ============================================

console.log("ReplyWise Gmail integration loaded");

////////////////////////////////////////////////////
// Inject ReplyWise button into Gmail compose UI
////////////////////////////////////////////////////

function injectReplyWiseButton() {

  const observer = new MutationObserver(() => {

    const toolbars = document.querySelectorAll('[role="toolbar"]');

    toolbars.forEach(toolbar => {

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

      btn.addEventListener('click', openReplyWiseWebApp);

      toolbar.appendChild(btn);
    });

  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

////////////////////////////////////////////////////
// Extract email and open web app
////////////////////////////////////////////////////

function openReplyWiseWebApp() {

  const messageBodies = document.querySelectorAll('.a3s');

  if (!messageBodies.length) {
    alert('ReplyWise: Email not found');
    return;
  }

  const lastMessage = messageBodies[messageBodies.length - 1];

  const emailText =
    lastMessage.innerText ||
    lastMessage.textContent ||
    '';

  if (!emailText.trim()) {
    alert('ReplyWise: Email empty');
    return;
  }

  // Encode email safely for URL
  const encoded = encodeURIComponent(emailText);

  // Open your deployed Angular web app
  const url =
    `https://replywise-topaz.vercel.app?email=${encoded}`;

  window.open(url, '_blank');
}

////////////////////////////////////////////////////
// Init
////////////////////////////////////////////////////

injectReplyWiseButton();
