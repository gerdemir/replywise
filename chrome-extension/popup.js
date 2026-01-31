const API_URL = 'http://localhost:8080/api';
let currentReply = null;
let currentRiskAnalysis = null;
let selectedTone = 'professional';

// DOM Elements
const emailTextArea = document.getElementById('emailText');
const contextArea = document.getElementById('context');
const generateBtn = document.getElementById('generateBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const editBtn = document.getElementById('editBtn');
const backBtn = document.getElementById('backBtn');
const sendShareBtn = document.getElementById('sendShareBtn');
const saveEditBtn = document.getElementById('saveEditBtn');

// Sections
const formSection = document.getElementById('form-section');
const loadingSection = document.getElementById('loading-section');
const resultSection = document.getElementById('result-section');
const shareSection = document.getElementById('share-section');
const editSection = document.getElementById('edit-section');
const errorSection = document.getElementById('error-section');

// Tone selection
document.querySelectorAll('.tone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTone = btn.dataset.tone;
  });
});

generateBtn.addEventListener('click', generateReply);
copyBtn.addEventListener('click', copyReply);
shareBtn.addEventListener('click', showShareSection);
editBtn.addEventListener('click', showEditSection);
backBtn.addEventListener('click', showFormSection);
sendShareBtn.addEventListener('click', sendForReview);
saveEditBtn.addEventListener('click', saveEdit);
document.getElementById('backFromShareBtn').addEventListener('click', showResultSection);
document.getElementById('backFromEditBtn').addEventListener('click', showResultSection);
document.getElementById('closeErrorBtn').addEventListener('click', showFormSection);

async function generateReply() {
  const emailText = emailTextArea.value.trim();
  const context = contextArea.value.trim();

  if (!emailText) {
    showError('Please enter the email text');
    return;
  }

  console.log('Generate button clicked');
  showLoadingSection();
  console.log('Loading section shown');

  try {
    const payload = {
      emailText,
      context: context || undefined,
      tone: selectedTone
    };
    
    console.log('Sending to background service worker:', payload);
    
    // Use chrome.runtime.sendMessage to communicate with background service worker
    // This is the proper way for Manifest V3 extensions
    chrome.runtime.sendMessage(
      {
        type: 'GENERATE_REPLY',
        data: payload
      },
      (response) => {
        console.log('Response from background:', response);
        
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          showError(`Extension error: ${chrome.runtime.lastError.message}`);
          return;
        }
        
        if (response.success) {
          const data = response.data;
          console.log('API success:', data);
          
          // Get the reply based on selected tone
          const toneMap = {
            'professional': 'formal',
            'casual': 'short',
            'friendly': 'friendly',
            'formal': 'formal'
          };
          const style = toneMap[selectedTone] || 'friendly';
          const selectedDraft = data.reply_drafts?.find(d => d.style === style) || data.reply_drafts?.[0];
          currentReply = selectedDraft?.body || 'No reply generated';
          currentRiskAnalysis = data.risk || {};
          
          displayResult(data);
          console.log('displayResult complete, calling showResultSection');
          showResultSection();
        } else {
          console.error('API error:', response.error);
          showError(`Failed to generate reply: ${response.error}`);
        }
      }
    );
  } catch (error) {
    console.error('API call error:', error.message);
    showError(`Failed to generate reply: ${error.message}`);
  }
}

function displayResult(data) {
  console.log('displayResult called with:', data);
  
  // Main reply is already set via currentReply
  document.getElementById('mainReply').textContent = currentReply;
  console.log('Set main reply to:', currentReply);

  // Intent Summary
  const intentList = document.getElementById('intentList');
  intentList.innerHTML = '';
  if (data.intent_summary && data.intent_summary.length > 0) {
    data.intent_summary.forEach(intent => {
      const li = document.createElement('li');
      li.textContent = intent;
      intentList.appendChild(li);
    });
  }

  // Risk badge
  const riskBadge = document.getElementById('riskBadge');
  const riskLevel = data.risk?.severity || 'low';
  riskBadge.className = `risk-badge ${riskLevel}`;
  riskBadge.textContent = riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1);

  // Risk flags
  const riskFlags = document.getElementById('riskFlags');
  riskFlags.innerHTML = '';
  if (data.risk?.flags) {
    // Handle both array format and object format
    const flagsArray = Array.isArray(data.risk.flags) 
      ? data.risk.flags 
      : Object.entries(data.risk.flags)
          .filter(([key, value]) => value === true)
          .map(([key]) => key);
    
    flagsArray.forEach(flag => {
      const span = document.createElement('span');
      span.className = 'risk-flag';
      span.textContent = flag;
      riskFlags.appendChild(span);
    });
  }

  // Risk notes
  const riskNotes = data.risk?.notes || [];
  const notesText = Array.isArray(riskNotes) ? riskNotes.join(' ') : riskNotes;
  document.getElementById('riskNotes').textContent = notesText || 'No issues detected';

  // Alternatives - show other reply_drafts
  const alternativesList = document.getElementById('alternativesList');
  alternativesList.innerHTML = '';
  
  if (data.reply_drafts && data.reply_drafts.length > 0) {
    data.reply_drafts.forEach((draft) => {
      // Skip the currently displayed draft
      if (draft.body !== currentReply && draft.body) {
        const div = document.createElement('div');
        div.className = 'alternative-item';
        
        // Add a label for the style
        const label = document.createElement('strong');
        label.textContent = draft.style.charAt(0).toUpperCase() + draft.style.slice(1) + ': ';
        label.style.color = '#667eea';
        
        const text = document.createTextNode(draft.body);
        div.appendChild(label);
        div.appendChild(text);
        
        div.addEventListener('click', () => {
          currentReply = draft.body;
          document.getElementById('mainReply').textContent = draft.body;
          // Refresh alternatives to update which one is selected
          displayResult(data);
        });
        alternativesList.appendChild(div);
      }
    });
  }
  
  // Questions to Ask
  const questionsList = document.getElementById('questionsList');
  questionsList.innerHTML = '';
  if (data.questions_to_ask && data.questions_to_ask.length > 0) {
    data.questions_to_ask.forEach(question => {
      const li = document.createElement('li');
      li.textContent = question;
      li.title = 'Click to copy';
      li.addEventListener('click', () => {
        navigator.clipboard.writeText(question).then(() => {
          const originalText = li.textContent;
          li.textContent = '✓ Copied!';
          setTimeout(() => {
            li.textContent = originalText;
          }, 1500);
        });
      });
      questionsList.appendChild(li);
    });
  }
  
  console.log('displayResult finished');
}

function copyReply() {
  if (currentReply) {
    navigator.clipboard.writeText(currentReply).then(() => {
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.textContent = '📋 Copy';
      }, 2000);
    });
  }
}

function showShareSection() {
  document.getElementById('shareEmail').value = '';
  document.getElementById('shareMessage').value = '';
  hideAllSections();
  shareSection.classList.add('active');
  setTimeout(() => {
    document.getElementById('shareEmail').focus();
  }, 100);
}

function showEditSection() {
  document.getElementById('editText').value = currentReply;
  hideAllSections();
  editSection.classList.add('active');
  setTimeout(() => {
    document.getElementById('editText').focus();
  }, 100);
}

function showFormSection() {
  hideAllSections();
  formSection.classList.add('active');
}

function showResultSection() {
  console.log('showResultSection called');
  hideAllSections();
  console.log('Sections hidden');
  resultSection.classList.add('active');
  console.log('Result section displayed');
}

function showLoadingSection() {
  hideAllSections();
  loadingSection.classList.add('active');
}

function showError(message) {
  document.getElementById('errorMessage').textContent = message;
  hideAllSections();
  errorSection.classList.add('active');
}

function hideAllSections() {
  formSection.classList.remove('active');
  loadingSection.classList.remove('active');
  resultSection.classList.remove('active');
  shareSection.classList.remove('active');
  editSection.classList.remove('active');
  errorSection.classList.remove('active');
}

function sendForReview() {
  const email = document.getElementById('shareEmail').value;
  const message = document.getElementById('shareMessage').value;

  if (!email) {
    alert('Please enter an email address');
    return;
  }

  // TODO: Implement backend sharing functionality
  alert(`Draft shared with ${email}`);
  showResultSection();
}

function saveEdit() {
  currentReply = document.getElementById('editText').value;
  document.getElementById('mainReply').textContent = currentReply;
  showResultSection();
}

// Load saved draft on popup open
window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['lastEmail', 'lastContext'], (result) => {
    if (result.lastEmail) {
      emailTextArea.value = result.lastEmail;
    }
    if (result.lastContext) {
      contextArea.value = result.lastContext;
    }
  });

  // Save draft on input
  emailTextArea.addEventListener('change', () => {
    chrome.storage.local.set({ lastEmail: emailTextArea.value });
  });

  contextArea.addEventListener('change', () => {
    chrome.storage.local.set({ lastContext: contextArea.value });
  });
});
