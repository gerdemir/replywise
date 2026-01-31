const API_URL = 'https://replywise-1-yokb.onrender.com/api';

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

//////////////////////////////////////////////////
// Tone selection
//////////////////////////////////////////////////

document.querySelectorAll('.tone-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tone-btn')
      .forEach(b => b.classList.remove('active'));

    btn.classList.add('active');
    selectedTone = btn.dataset.tone;
  });
});

//////////////////////////////////////////////////
// Button handlers
//////////////////////////////////////////////////

generateBtn.addEventListener('click', generateReply);
copyBtn.addEventListener('click', copyReply);
shareBtn.addEventListener('click', showShareSection);
editBtn.addEventListener('click', showEditSection);
backBtn.addEventListener('click', showFormSection);
sendShareBtn.addEventListener('click', sendForReview);
saveEditBtn.addEventListener('click', saveEdit);

document.getElementById('backFromShareBtn')
  .addEventListener('click', showResultSection);

document.getElementById('backFromEditBtn')
  .addEventListener('click', showResultSection);

document.getElementById('closeErrorBtn')
  .addEventListener('click', showFormSection);

//////////////////////////////////////////////////
// Generate reply
//////////////////////////////////////////////////

async function generateReply() {
  const emailText = emailTextArea.value.trim();
  const context = contextArea.value.trim();

  if (!emailText) {
    showError('Please enter email text');
    return;
  }

  showLoadingSection();

  const payload = {
    emailText,
    context: context || null,
    tone: selectedTone
  };

  chrome.runtime.sendMessage(
    { type: 'GENERATE_REPLY', data: payload },
    (response) => {
      if (chrome.runtime.lastError) {
        showError(chrome.runtime.lastError.message);
        return;
      }

      if (!response || !response.success) {
        showError(response?.error || 'Generation failed');
        return;
      }

      const data = response.data;

      const toneMap = {
        professional: 'formal',
        casual: 'short',
        friendly: 'friendly',
        formal: 'formal'
      };

      const style = toneMap[selectedTone] || 'friendly';

      const selectedDraft =
        data.reply_drafts?.find(d => d.style === style)
        || data.reply_drafts?.[0];

      currentReply =
        selectedDraft?.body || 'No reply generated';

      currentRiskAnalysis = data.risk || {};

      displayResult(data);
      showResultSection();
    }
  );
}

//////////////////////////////////////////////////
// Display result
//////////////////////////////////////////////////

function displayResult(data) {
  document.getElementById('mainReply').textContent = currentReply;

  const intentList = document.getElementById('intentList');
  intentList.innerHTML = '';

  (data.intent_summary || []).forEach(intent => {
    const li = document.createElement('li');
    li.textContent = intent;
    intentList.appendChild(li);
  });

  const riskBadge = document.getElementById('riskBadge');
  riskBadge.textContent = 'Analyzed';

  const alternativesList =
    document.getElementById('alternativesList');
  alternativesList.innerHTML = '';

  (data.reply_drafts || []).forEach(draft => {
    if (draft.body === currentReply) return;

    const div = document.createElement('div');
    div.className = 'alternative-item';
    div.textContent = draft.body;

    div.addEventListener('click', () => {
      currentReply = draft.body;
      displayResult(data);
    });

    alternativesList.appendChild(div);
  });
}

//////////////////////////////////////////////////
// Copy reply
//////////////////////////////////////////////////

function copyReply() {
  if (!currentReply) return;

  navigator.clipboard.writeText(currentReply);
}

//////////////////////////////////////////////////
// Section navigation
//////////////////////////////////////////////////

function showShareSection() {
  hideAllSections();
  shareSection.classList.add('active');
}

function showEditSection() {
  document.getElementById('editText').value = currentReply;
  hideAllSections();
  editSection.classList.add('active');
}

function showFormSection() {
  hideAllSections();
  formSection.classList.add('active');
}

function showResultSection() {
  hideAllSections();
  resultSection.classList.add('active');
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
  [
    formSection,
    loadingSection,
    resultSection,
    shareSection,
    editSection,
    errorSection
  ].forEach(s => s.classList.remove('active'));
}

//////////////////////////////////////////////////
// Edit + share
//////////////////////////////////////////////////

function sendForReview() {
  alert('Share feature coming soon');
  showResultSection();
}

function saveEdit() {
  currentReply =
    document.getElementById('editText').value;

  document.getElementById('mainReply').textContent =
    currentReply;

  showResultSection();
}

//////////////////////////////////////////////////
// Load saved email from Gmail
//////////////////////////////////////////////////

window.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(
    ['selectedEmail', 'lastEmail', 'lastContext'],
    (result) => {
      if (result.selectedEmail) {
        emailTextArea.value = result.selectedEmail;
      } else if (result.lastEmail) {
        emailTextArea.value = result.lastEmail;
      }

      if (result.lastContext) {
        contextArea.value = result.lastContext;
      }
    }
  );

  emailTextArea.addEventListener('change', () => {
    chrome.storage.local.set({
      lastEmail: emailTextArea.value
    });
  });

  contextArea.addEventListener('change', () => {
    chrome.storage.local.set({
      lastContext: contextArea.value
    });
  });
});
