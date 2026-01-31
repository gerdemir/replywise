# ReplyWise - Frontend ↔ Backend Connection Guide

## Quick Start

### 1. Backend Setup

```bash
cd replywise-api

# Install dependencies (if not done)
npm install

# Set up your Gemini API key
# Edit .env file and add:
GEMINI_API_KEY=your_actual_api_key_here
PORT=8080

# Run backend
npm run dev
```

Backend will run on: `http://localhost:8080`

### 2. Frontend Setup

```bash
# In the root directory
cd ..  # (if you're in replywise-api)

# Frontend should already be running
# If not, start it:
ng serve
```

Frontend runs on: `http://localhost:4200`

## API Endpoints

### POST /api/generate
- **URL**: `http://localhost:8080/api/generate`
- **Body**: 
  ```json
  {
    "emailText": "Email content...",
    "context": "Optional instructions"
  }
  ```
- **Response**: Matches frontend `GenerateResponse` interface

### POST /api/rewrite
- **URL**: `http://localhost:8080/api/rewrite`
- **Body**:
  ```json
  {
    "action": "shorter" | "more_formal" | "regenerate",
    "selectedDraftBody": "Current draft...",
    "originalEmail": "Original email...",
    "context": "Optional"
  }
  ```
- **Response**: `{ subject?: string; body: string }`

## Testing Connection

1. **Start Backend**: `cd replywise-api && npm run dev`
2. **Start Frontend**: `ng serve` (in root directory)
3. **Test in Browser**: 
   - Go to `http://localhost:4200`
   - Toggle OFF "Demo Mode"
   - Paste an email and click "Generate Reply"

## Demo Mode

- **ON**: Uses mock data (works without backend)
- **OFF**: Calls real backend API

## CORS Configuration

Backend is configured to allow requests from `http://localhost:4200`.

## Environment Variables

**Backend (.env):**
```
GEMINI_API_KEY=your_key_here
PORT=8080
```

**Frontend (src/environments/environment.ts):**
```typescript
apiBaseUrl: 'http://localhost:8080/api'
```

## Troubleshooting

1. **Backend not responding**: Check if port 8080 is available
2. **CORS errors**: Verify backend CORS allows `http://localhost:4200`
3. **Gemini API errors**: Check your API key in `.env`
4. **Frontend can't connect**: Ensure backend is running on port 8080

## Project Structure

```
Replywise/
├── replywise-api/          # Backend (Node/Express + Gemini)
│   ├── src/
│   │   ├── server.ts
│   │   ├── gemini.ts
│   │   ├── prompts.ts
│   │   ├── schemas.ts
│   │   └── risk.ts
│   └── .env
└── src/                    # Frontend (Angular 21)
    └── app/
        ├── services/
        │   └── replywise-api.service.ts
        └── ...
```
