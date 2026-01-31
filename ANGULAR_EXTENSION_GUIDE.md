# ReplyWise Angular Chrome Extension - Setup Guide

## ✅ What's Been Done

I've rebuilt the Chrome extension using Angular, matching the web app design and functionality:

### **Angular Extension Features:**
- Same UI/UX as the web app
- Uses all the same Angular components (Email Input, Reply Drafts, Intent Summary, Risk Panel, Questions Card)
- Connects to the same backend API (`http://localhost:8080`)
- Smooth animations and Material Design
- Automatic storage of email drafts in Chrome local storage

### **Build Configuration:**
- Added `build:extension` script to package.json
- Created Angular build config for Chrome extension in angular.json
- Extension outputs to `dist/extension/` folder

## How to Use the Angular Extension

### Step 1: Build the Extension

```bash
cd /Users/toluhinifemi/Documents/Hackhive\ 2026\ hackathon/Replywise
npm run build:extension
```

This builds the extension to `/Users/toluhinifemi/Documents/Hackhive 2026 hackathon/Replywise/dist/extension`

### Step 2: Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Navigate to and select: `/Users/toluhinifemi/Documents/Hackhive 2026 hackathon/Replywise/dist/extension`
5. The ReplyWise extension should now appear

### Step 3: Make Sure Backend is Running

Your backend server needs to be running:

```bash
cd /Users/toluhinifemi/Documents/Hackhive\ 2026\ hackathon/Replywise/replywise-api
npm run dev
```

### Step 4: Use the Extension

1. Click the ReplyWise extension icon in Chrome
2. The Angular popup will open with the same UI as the web app
3. Paste email text, add context (optional), and click "Generate Reply"
4. Get AI-powered replies with intent summary, risk analysis, and questions

## What Changed from Plain HTML/JS Version

| Feature | Old Extension | New Angular Extension |
|---------|--------------|----------------------|
| **Framework** | Plain HTML/CSS/JS | Angular 21 with Material Design |
| **Components** | Single popup.html | Modular Angular components |
| **Styling** | Custom CSS | SCSS + Angular Material |
| **API Calls** | Via background.js | Via ReplywiseApiService |
| **State Management** | Manual DOM manipulation | Angular signals & reactivity |
| **Animations** | Basic CSS transitions | Angular animations (fadeIn, slideIn) |
| **Build Process** | Direct files | Angular build with optimization |

## File Structure

```
src/
├── extension-main.ts                    # Extension bootstrap file
├── extension-popup.html                 # Extension popup HTML
├── app/
│   ├── extension-popup.component.ts     # Main extension popup component
│   ├── components/                      # Reused from web app
│   │   ├── email-input/
│   │   ├── reply-drafts/
│   │   ├── intent-summary-card/
│   │   ├── risk-panel/
│   │   └── questions-card/
│   ├── services/
│   │   └── replywise-api.service.ts     # API service
│   └── models/
│       └── replywise.models.ts          # TypeScript models

dist/extension/                          # Built extension
├── index.html                           # Built popup HTML
├── main.js                              # Compiled Angular app
├── styles.css                           # Compiled styles
├── manifest.json                        # Extension manifest
├── background.js                        # Service worker
├── content-script.js                    # Gmail integration
└── content-style.css                    # Gmail styling
```

## Rebuilding After Changes

Whenever you make changes to the Angular components or extension:

```bash
npm run build:extension
```

Then reload the extension in Chrome:
1. Go to `chrome://extensions/`
2. Find ReplyWise
3. Click the **Reload** button (circular arrow)

## Development Tips

### Watch Mode for Development
If you want to develop with auto-rebuild:
```bash
ng build:extension --watch
```

### Testing the Web App
To test the full web app (not extension):
```bash
npm start
```
Then open `http://localhost:4200`

### Backend API
Always keep the backend running:
```bash
cd replywise-api
npm run dev
```

## Troubleshooting

### Extension Not Loading
- Make sure you selected the `dist/extension` folder, not the root folder
- Check that the build completed successfully
- Look for errors in Chrome DevTools (right-click extension → Inspect)

### API Errors
- Ensure backend is running on `http://localhost:8080`
- Check browser console for CORS or network errors
- Verify API key is in `replywise-api/.env`

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check that TypeScript version is compatible
- Look at the error output for specific file/line issues

## Benefits of Angular Extension

1. **Code Reuse**: Same components as web app
2. **Type Safety**: TypeScript catches errors at compile time
3. **Better UX**: Smooth animations and transitions
4. **Maintainability**: Easier to update and add features
5. **Modern Stack**: Angular 21, Material Design, RxJS
6. **Scalability**: Easy to add new features

## Next Steps

You can now:
- Use the extension in Gmail
- Modify components and rebuild
- Add new features to both web app and extension
- Deploy the web app separately
- Publish extension to Chrome Web Store (when ready)
