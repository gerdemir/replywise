// Service Worker for ReplyWise Extension

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SELECTED_TEXT') {
    // This will be handled by content script
    sendResponse({ status: 'received' });
  }
});

// Context menu for right-click integration
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.contextMenus.create({
      id: 'replywise-context',
      title: 'Generate Reply with ReplyWise',
      contexts: ['selection']
    });
  } catch (error) {
    console.log('Context menu creation error:', error);
  }
});

// Handle context menu clicks
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'replywise-context') {
      // Open popup with selected text
      const selectedText = info.selectionText;
      
      // Store selected text and open popup
      chrome.storage.local.set({ selectedText: selectedText }, () => {
        chrome.action.openPopup();
      });
    }
  });
}
