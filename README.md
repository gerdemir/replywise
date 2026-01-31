# ReplyWise

An AI-powered email reply assistant that helps you craft perfect email responses with voice commands and risk analysis.

## Features

- **AI-Powered Email Analysis**: Uses Google Gemini AI to analyze incoming emails and detect potential risks
- **Smart Reply Generation**: Generates multiple reply styles (short, friendly, formal) tailored to your needs
- **Voice Commands**: Control the app with voice commands using Web Speech API
- **Text-to-Speech**: Listen to generated replies using ElevenLabs TTS
- **Risk Assessment**: Automatically identifies urgent, sensitive, financial, or commitment-related emails
- **Real-time Editing**: Edit generated replies with rewrite options (shorter, more formal, regenerate)

## Technology Stack

- **Frontend**: Angular 21, Angular Material, TypeScript, SCSS
- **Backend**: Node.js, Express, TypeScript
- **AI**: Google Gemini 2.5 Flash for email analysis and generation
- **Voice**: ElevenLabs API for text-to-speech, Web Speech API for voice recognition
- **Validation**: Zod for runtime type checking
- **Security**: Helmet, CORS protection

## Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the API directory:
```bash
cd replywise-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Add your API keys to `.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

5. Start the backend server:
```bash
npm run dev
```

The API server will run on `http://localhost:8080`.

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:4200`

## API Endpoints

- `POST /api/generate` - Analyze email and generate replies
- `POST /api/rewrite` - Rewrite existing replies
- `POST /api/tts` - Convert text to speech

## Voice Commands

- "Approve" or "Send it" - Approve and send the reply
- "Edit" or "Change it" - Edit the reply
- "Reject" or "Don't send" - Reject the reply

## Development

### Code Scaffolding

Generate new components:
```bash
ng generate component component-name
```

### Building

```bash
ng build
```

### Testing

```bash
ng test
```

## ElevenLabs Voice Setup

ReplyWise includes voice features powered by ElevenLabs for text-to-speech and voice command recognition.

### Prerequisites
1. Create an ElevenLabs account at [elevenlabs.io](https://elevenlabs.io)
2. Get your API key from the dashboard

### Configuration
1. In `replywise-api/.env`, set your ElevenLabs API key:
```
ELEVENLABS_API_KEY=sk_your_api_key_here
```

2. The default voice ID is `21m00Tcm4TlvDq8ikWAM` (Rachel voice). You can change this in the TTS route if desired.

### Voice Features
- **Text-to-Speech**: Click "Listen to Reply" to hear the generated email reply
- **Voice Commands**: Click "Speak Command" and say:
  - "Approve" or "Send it" - Approve and send the reply
  - "Edit" or "Change it" - Edit the reply  
  - "Reject" or "Don't send" - Reject the reply

### API Endpoint
- `POST /api/tts` - Converts text to speech audio
- Rate limited to 100 requests per 15 minutes per IP
- Returns audio/mpeg stream

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
