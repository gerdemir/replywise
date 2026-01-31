# ReplyWise API

Backend API for ReplyWise - AI-powered email reply assistant using Google Gemini.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Add your API keys:
     ```
     GEMINI_API_KEY=your_api_key_here
     ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
     ELEVENLABS_VOICE_ID=21m00Tcm4TlvDq8ikWAM
     PORT=8080
     ```

3. **Get Gemini API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env` file

## Running

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

The API will run on `http://localhost:8080`

## API Endpoints

### POST /api/generate

Generate email reply analysis and drafts.

**Request:**
```json
{
  "emailText": "Email content here...",
  "context": "Optional context/instructions"
}
```

**Response:**
```json
{
  "intent_summary": ["bullet 1", "bullet 2"],
  "reply_drafts": [
    { "style": "short", "subject": "...", "body": "..." },
    { "style": "friendly", "subject": "...", "body": "..." },
    { "style": "formal", "subject": "...", "body": "..." }
  ],
  "questions_to_ask": ["question 1", "question 2"],
  "risk": {
    "flags": ["urgency", "financial"],
    "notes": ["Warning note"],
    "confidence": 0.75
  }
}
```

### POST /api/rewrite

Rewrite an existing draft.

**Request:**
```json
{
  "action": "shorter" | "more_formal" | "regenerate",
  "selectedDraftBody": "Current draft body...",
  "originalEmail": "Original email...",
  "context": "Optional context"
}
```

**Response:**
```json
{
  "subject": "Re: Subject",
  "body": "Rewritten body..."
}
```

### POST /api/tts

Convert text to speech using ElevenLabs.

**Request:**
```json
{
  "text": "Text to convert to speech",
  "voice_id": "optional_voice_id"
}
```

**Response:**
Audio stream with `Content-Type: audio/mpeg`

## Features

- ✅ Google Gemini AI integration
- ✅ ElevenLabs Text-to-Speech
- ✅ Request/response validation with Zod
- ✅ Security middleware (Helmet, CORS)
- ✅ Risk analysis heuristics
- ✅ JSON-only responses with retry logic
- ✅ TypeScript support
- ✅ Error handling
- ✅ Rate limiting for TTS requests

## Project Structure

```
src/
  ├── server.ts      # Express server setup
  ├── gemini.ts      # Gemini API client
  ├── prompts.ts     # Prompt templates
  ├── schemas.ts     # Zod validation schemas
  └── risk.ts        # Risk analysis heuristics
```

## CORS

CORS is configured to allow requests from `http://localhost:4200` (frontend).

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Validation error
- `500` - Server error
