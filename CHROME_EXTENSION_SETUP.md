# ReplyWise Chrome Extension Setup Guide

## What's Fixed ✅

### 1. **Scroll Issues**
   - Fixed popup container to properly scroll when content exceeds 700px max-height
   - Sections now use flexbox for proper content layout
   - Loading spinner and result sections display correctly without cutting off content

### 2. **API Integration**
   - Added your Gemini API key to `.env` file (local only, not committed to Git)
   - Backend server configured and running on `http://localhost:8080`
   - Extension properly communicates with the backend via `background.js`

### 3. **UI/UX Improvements**
   - Fixed section visibility toggle (loading → result → form transitions)
   - Proper scrolling for long replies and multiple alternatives
   - Loading spinner now displays centered during API calls
   - All buttons and interactive elements properly styled

## How to Use the Extension

### Step 1: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Navigate to and select: `/Users/toluhinifemi/Documents/Hackhive 2026 hackathon/Replywise/chrome-extension`
5. The ReplyWise extension should now appear in your extensions list

### Step 2: Make Sure the Backend is Running

The backend server needs to be running for the extension to work:

```bash
cd /Users/toluhinifemi/Documents/Hackhive\ 2026\ hackathon/Replywise/replywise-api
npm start
```

**Server will be available at:** `http://localhost:8080`

To verify the server is running:
```bash
curl http://localhost:8080/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Step 3: Use the Extension

1. **Open Gmail** at `https://mail.google.com`
2. Find an email you want to reply to
3. You'll see a **✨ ReplyWise** button appear in the compose toolbar
4. Click it to open the extension popup
5. **Paste the email text** and optionally add context
6. **Select a tone** (Professional, Casual, Friendly, or Formal)
7. Click **Generate Reply**
8. The extension will:
   - Show a loading spinner while the AI generates replies
   - Display the main reply with alternatives
   - Show intent summary, risk analysis, and questions to ask
   - Allow you to copy, edit, or share the reply

## Extension Features

- **Multiple Reply Drafts**: Get different writing styles (professional, casual, friendly, formal)
- **Intent Summary**: Understand what the sender needs
- **Risk Analysis**: Flagged potentially problematic language or tone issues
- **Questions to Ask**: Suggested follow-up questions for better replies
- **Edit & Customize**: Modify the AI-generated reply before using it
- **Share for Review**: Share draft with colleagues for feedback
- **Local Storage**: Your drafts are saved locally in the extension

## File Structure

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Extension UI
├── popup.js              # UI logic & API communication
├── popup.css             # Styling (FIXED: scroll issues)
├── background.js         # Service Worker (handles API calls)
├── content-script.js     # Injects button into Gmail
├── content-style.css     # Styling for Gmail integration
└── README.md
```

## Environment Variables

The API key is stored in `.env` (never committed to Git):

```
GEMINI_API_KEY=AIzaSyC8FVcmSHgr4UjIfCfND6Q2jpRiYardZ2E
PORT=8080
```

## Troubleshooting

### Extension Shows but Nothing Happens
- ✅ Verify backend server is running: `curl http://localhost:8080/health`
- Check Chrome DevTools (right-click extension → Inspect popup)
- Look for console errors

### API Errors
- Backend must be running on `http://localhost:8080`
- Ensure `.env` file exists in `replywise-api/` folder
- Check that Gemini API key is valid

### Gmail Integration Not Working
- Make sure you're on `https://mail.google.com` (not other Gmail interfaces)
- Reload the page after adding extension
- Check that content script permissions are correct in manifest.json

### Scrolling Issues (Fixed)
- All scroll issues should now be resolved
- If content is still cut off, check browser zoom (should be 100%)

## API Endpoints

The extension communicates with these backend endpoints:

- **POST** `/api/generate` - Generate email replies
  ```json
  {
    "emailText": "Email content to reply to",
    "context": "Optional context about the sender",
    "tone": "professional|casual|friendly|formal"
  }
  ```

- **GET** `/health` - Check server health

## Notes

- The extension runs **locally only** (not published to Chrome Web Store)
- API key is stored in environment variables, never hardcoded
- Each email reply generates 3-4 different drafts in various styles
- Extension uses Chrome Service Workers (Manifest V3 standard)

## Support

For issues or questions about the extension setup, check:
1. Console logs in extension DevTools
2. Backend server logs in terminal
3. Chrome network tab for failed API calls
