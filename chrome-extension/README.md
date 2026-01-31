# ReplyWise Chrome Extension

AI-powered email reply assistant integrated directly into Gmail with tone matching and collaborative drafts.

## Features

- **Instant Reply Generation** - Click the ReplyWise button to generate AI responses
- **Tone Matching** - Choose from Professional, Casual, Friendly, or Formal tones
- **Risk Analysis** - Automatic detection of potentially problematic phrases
- **Alternative Options** - Get multiple reply suggestions
- **Collaborative Review** - Share drafts with team members for approval
- **Smart Drafts** - Edit and refine replies before sending
- **Right-click Integration** - Generate replies from any selected text

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. ReplyWise will now appear in your Chrome toolbar

## Usage

### Gmail Integration
1. Open Gmail and start composing a reply
2. Look for the "✨ ReplyWise" button in the toolbar
3. Click it to extract the email context
4. The ReplyWise popup will open with the email pre-filled

### From Extension Popup
1. Click the ReplyWise icon in your Chrome toolbar
2. Paste or type the email you received
3. Add optional context about your relationship
4. Select your desired tone
5. Click "Generate Reply"
6. Review, edit, or share the generated response

### Right-Click Context Menu
1. Select any text in Gmail
2. Right-click and choose "Generate Reply with ReplyWise"
3. The selected text will be pre-filled in the popup

## Configuration

Make sure your backend API is running on `http://localhost:8080`. Update the API_URL in `popup.js` if using a different port.

## Architecture

- **manifest.json** - Extension configuration
- **popup.html/css/js** - Main UI interface
- **background.js** - Service worker for context menu and messaging
- **content-script.js** - Integrates with Gmail page
- **content-style.css** - Styling for Gmail integration

## Backend Requirements

- Gemini API key configured in `.env`
- Backend running on port 8080
- CORS configured to accept requests from Chrome extension

## Future Enhancements

- [ ] Cloud sync for drafts across devices
- [ ] Team collaboration with real-time comments
- [ ] Template management and saved replies
- [ ] Analytics on response patterns
- [ ] Integration with Outlook
- [ ] Local storage of previous successful replies
