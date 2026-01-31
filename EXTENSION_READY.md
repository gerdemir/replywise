# ✅ Angular Chrome Extension - Complete Setup

## 🎉 What's Ready

Your Chrome extension is now **fully built with Angular** and includes:

### ✨ Features
- **Same UI/UX as web app** - Using all Angular Material components
- **Full API integration** - Connects to your backend at `http://localhost:8080`
- **Email drafting** - Multiple reply options with different tones
- **Risk analysis** - Flags sensitive language
- **Intent detection** - Summarizes what the sender wants
- **Question suggestions** - Helps you ask relevant follow-ups
- **Chrome storage** - Saves your drafts automatically

### 📦 What Was Built

The extension is in: `/Users/toluhinifemi/Documents/Hackhive 2026 hackathon/Replywise/dist/extension`

It contains:
```
dist/extension/
├── index.html              # Main popup UI
├── main.js                 # Angular compiled app
├── styles.css              # Styling
├── manifest.json           # Extension config
├── background.js           # Service worker
├── content-script.js       # Gmail integration
├── content-style.css       # Gmail styling
└── (other supporting files)
```

## 🚀 How to Load It in Chrome

### Step 1: Open Extensions Manager
1. Go to `chrome://extensions/`
2. Toggle **Developer mode** (top right)

### Step 2: Load the Extension
1. Click **Load unpacked**
2. Select the folder: `/Users/toluhinifemi/Documents/Hackhive 2026 hackathon/Replywise/dist/extension`
3. Click **Open**

The ReplyWise extension should now appear in your extensions list and toolbar!

### Step 3: Make Sure Backend is Running
```bash
cd /Users/toluhinifemi/Documents/Hackhive\ 2026\ hackathon/Replywise/replywise-api
npm run dev
```

Server should be running on `http://localhost:8080`

## 📝 How to Use

1. **Open Gmail** - Navigate to `https://mail.google.com`
2. **Click extension icon** - Find ReplyWise in your toolbar
3. **Paste email** - Copy the email you want to reply to
4. **Generate reply** - Click "Generate Reply"
5. **Choose tone** - Pick professional, casual, friendly, or formal
6. **Copy & use** - Copy the reply and paste it in Gmail

## 🔄 If You Need to Rebuild

After making changes to the Angular code:

```bash
cd /Users/toluhinifemi/Documents/Hackhive\ 2026\ hackathon/Replywise

# Build the extension
npm run build:extension

# Copy files to the root of dist/extension
cp -r dist/extension/browser/* dist/extension/

# Reload extension in Chrome
# Go to chrome://extensions/ and click the refresh button
```

## 📚 Components Used

The extension reuses your existing Angular components:

- `EmailInputComponent` - Email text input form
- `ReplyDraftsComponent` - Multiple reply options with tabs
- `IntentSummaryCardComponent` - Summary of email intent
- `RiskPanelComponent` - Risk analysis and flags
- `QuestionsCardComponent` - Suggested questions

All these are **shared** between the web app and extension!

## 🎨 Styling

The extension uses:
- **SCSS** - Preprocessed CSS with variables
- **Angular Material** - Professional Material Design
- **Responsive layout** - Works on different screen sizes
- **Smooth animations** - Fade-in and slide-in effects

## 🔌 API Integration

The extension communicates with your backend via:
- `ReplywiseApiService` - HTTP service for API calls
- Base URL: `http://localhost:8080`
- Endpoints:
  - `POST /api/generate` - Generate email reply
  - `GET /health` - Server health check

## 📱 Architecture

```
Chrome Extension
    ↓
content-script.js (Gmail injection)
    ↓
Service Worker (background.js)
    ↓
Angular Popup (ExtensionPopupComponent)
    ↓
ReplywiseApiService
    ↓
Backend (Node.js + Gemini API)
```

## 🛠️ Troubleshooting

### Extension doesn't appear
- Make sure you loaded the `dist/extension` folder, not the root
- Check that you're using the latest build (rebuild if needed)
- Check extension popup for errors: right-click extension → Inspect

### API errors
- Start backend: `npm run dev` in `replywise-api` folder
- Check backend is running: `curl http://localhost:8080/health`
- Check `.env` file has your Gemini API key

### CSS/Styling issues
- The styles are bundled in `styles.css`
- If you change component styles, rebuild with `npm run build:extension`
- Check browser DevTools for CSS conflicts

### Gmail integration not working
- Make sure you're on `https://mail.google.com`
- Check `content-script.js` has permission to run (in manifest.json)
- Reload the page after adding extension

## 🎯 Next Steps

You can now:

1. **Test the extension** - Try it with different emails
2. **Customize** - Modify components to match your needs
3. **Add features** - Integrate it with your backend
4. **Deploy** - Later, publish to Chrome Web Store

## 📞 Quick Commands

```bash
# Start web app (if needed)
npm start

# Start backend server
cd replywise-api && npm run dev

# Build extension
npm run build:extension

# Copy to root (if needed)
cp -r dist/extension/browser/* dist/extension/

# Test with npm scripts
npm test

# Build for production (web app)
npm run build
```

## ✅ Status

✅ Angular extension built successfully
✅ All components integrated
✅ API connectivity ready
✅ Chrome extension ready to load
✅ Backend API running

**You're all set! Go load the extension and start testing!** 🚀
