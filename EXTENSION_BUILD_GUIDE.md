# ReplyWise Chrome Extension - Build & Installation Guide

## Overview

The ReplyWise Chrome Extension is now a full Angular application that matches the design and features of the base web app. It includes:

- ✨ **Header Component** - With demo mode toggle and API status
- 📧 **Email Input** - With context and sample email loading
- 📋 **Intent Summary Card** - Shows email intent analysis
- ⚠️ **Risk Panel** - Displays risk analysis and flags
- 📝 **Reply Drafts** - Multiple draft options with editing and rewriting
- 🎤 **Voice Panel** - Text-to-speech and voice commands
- ❓ **Questions Card** - Suggests questions to ask
- ✅ **Approval Bar** - Copy and open in Gmail functionality

## Building the Extension

1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Build the Extension**:
   ```bash
   npm run build:extension
   ```

   This will create the extension in `dist/extension/browser/`

## Loading the Extension in Chrome

1. **Open Chrome Extensions Page**:
   - Navigate to `chrome://extensions/`
   - Or go to Menu → Extensions → Manage Extensions

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top right

3. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `dist/extension/browser/` folder
   - The extension should now appear in your extensions list

4. **Pin the Extension** (Optional):
   - Click the puzzle icon in Chrome toolbar
   - Find "ReplyWise" and click the pin icon

## Using the Extension

1. **Open the Extension**:
   - Click the ReplyWise icon in your Chrome toolbar
   - The popup will open with the full Angular interface

2. **From Gmail**:
   - The extension includes a content script that works on Gmail
   - You can select email text and use the context menu option
   - Or use the ReplyWise button in Gmail compose area (if injected)

3. **Features**:
   - Enter email text manually or load from Gmail
   - Add context about your relationship
   - Generate AI-powered replies
   - Edit, rewrite, and customize drafts
   - Use voice commands (approve, edit, reject)
   - Copy replies or open directly in Gmail

## Development

The extension uses the same Angular components as the web app:
- All components are in `src/app/components/`
- Extension-specific component: `src/app/extension-popup.component.ts`
- Bootstrap file: `src/extension-main.ts`
- HTML template: `src/extension-popup.html`

## Configuration

- **API Endpoint**: Configured in `src/environments/environment.ts`
- **Manifest**: `chrome-extension/manifest.json`
- **Background Script**: `chrome-extension/background.js`
- **Content Script**: `chrome-extension/content-script.js`

## Notes

- The extension popup is sized at 600px width and 800px max height
- All features from the web app are available in the extension
- The extension stores email text and context in Chrome storage
- Make sure the backend API is running on `http://localhost:8080` for full functionality
