// =====================================
// ReplyWise Background Service Worker
// Stores email + handles API calls
// =====================================

let latestEmail = "";

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  //////////////////////////////////////////////////
  // 1. Gmail → store latest email in memory
  //////////////////////////////////////////////////

  if (message.type === "EMAIL_CAPTURED") {
    latestEmail = message.emailText;
    console.log("Email stored in background:", latestEmail.slice(0, 50));
  }

  //////////////////////////////////////////////////
  // 2. Popup → request latest email
  //////////////////////////////////////////////////

  if (message.type === "GET_LATEST_EMAIL") {
    sendResponse({ emailText: latestEmail });
  }

  //////////////////////////////////////////////////
  // 3. Popup → generate reply (API call)
  //////////////////////////////////////////////////

  if (message.type === "GENERATE_REPLY") {

    fetch("https://replywise-1-yokb.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.data)
    })
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true; // keep channel open (async)
  }
});
