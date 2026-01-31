import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initializeGemini, callGemini } from './gemini';
import { generatePrompt, rewritePrompt } from './prompts';
import { analyzeRisk } from './risk';
import {
  GenerateRequestSchema,
  RewriteRequestSchema,
  GenerateResponseSchema,
  RewriteResponseSchema,
  GenerateRequest,
  RewriteRequest,
  GenerateResponse,
  RewriteResponse
} from './schemas';
import ttsRouter from './routes/tts';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors({
  origin: /localhost/,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api', ttsRouter);

// Initialize Gemini
const geminiApiKey = process.env.GEMINI_API_KEY;
if (!geminiApiKey || geminiApiKey === 'YOUR_KEY_HERE') {
  console.warn('⚠️  WARNING: GEMINI_API_KEY not set or using placeholder. API will fail.');
} else {
  initializeGemini(geminiApiKey);
  console.log('✅ Gemini initialized');
}

// Initialize ElevenLabs
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
if (!elevenLabsApiKey || elevenLabsApiKey === 'YOUR_KEY_HERE') {
  console.warn('⚠️  WARNING: ELEVENLABS_API_KEY not set or using placeholder. TTS will fail.');
} else {
  console.log('✅ ElevenLabs initialized');
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /api/generate
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validatedData = GenerateRequestSchema.parse(req.body);
    const { emailText, context } = validatedData as GenerateRequest;

    // Analyze risk using heuristics
    const heuristicRisk = analyzeRisk(emailText);

    // Call Gemini
    const prompt = generatePrompt(emailText, context);
    const geminiResponse = await callGemini(prompt);
    
    // Parse Gemini response
    let geminiData: any;
    try {
      geminiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      geminiData = JSON.parse(geminiResponse);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response: ${parseError}`);
    }

    // Convert risk flags (arrays from both sources) to object format
    const geminiFlagsArray = Array.isArray(geminiData.risk?.flags) 
      ? geminiData.risk.flags 
      : [];
    const heuristicFlagsArray = heuristicRisk.flags;
    const allFlags = [...new Set([...geminiFlagsArray, ...heuristicFlagsArray])];
    
    const riskFlagsObj = {
      urgency: allFlags.includes('urgency'),
      commitment: allFlags.includes('commitment'),
      sensitive: allFlags.includes('sensitive'),
      financial: allFlags.includes('financial')
    };
    
    const mergedNotes = [
      ...(geminiData.risk?.notes || []),
      ...heuristicRisk.notes
    ];

    // Convert confidence from 0-1 to 0-100 scale
    const geminiConfidence = (geminiData.risk?.confidence || 0) * 100;
    const heuristicConfidence = heuristicRisk.confidence * 100;
    const mergedConfidence = Math.max(geminiConfidence, heuristicConfidence);

    // Transform reply_drafts to match frontend format
    const replyDrafts = geminiData.reply_drafts || {};
    const transformedDrafts = [
      {
        style: 'short' as const,
        subject: replyDrafts.short?.subject || 'Re: Email',
        body: replyDrafts.short?.body || ''
      },
      {
        style: 'friendly' as const,
        subject: replyDrafts.friendly?.subject || 'Re: Email',
        body: replyDrafts.friendly?.body || ''
      },
      {
        style: 'formal' as const,
        subject: replyDrafts.formal?.subject || 'Re: Email',
        body: replyDrafts.formal?.body || ''
      }
    ];

    // Build response
    const response: GenerateResponse = {
      intent_summary: geminiData.intent_summary || [],
      reply_drafts: transformedDrafts,
      questions_to_ask: geminiData.questions_to_ask || [],
      risk: {
        flags: riskFlagsObj,
        notes: mergedNotes,
        confidence: Math.min(Math.max(mergedConfidence, 0), 100) // Clamp 0-100
      }
    };

    // Validate response
    GenerateResponseSchema.parse(response);

    res.json(response);
  } catch (error: any) {
    console.error('Generate error:', error);
    
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        error: 'Failed to generate response',
        message: error.message
      });
    }
  }
});

// POST /api/rewrite
app.post('/api/rewrite', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validatedData = RewriteRequestSchema.parse(req.body);
    const { action, selectedDraftBody, originalEmail, context } = validatedData as RewriteRequest;

    // Call Gemini
    const prompt = rewritePrompt(action, selectedDraftBody, originalEmail, context);
    const geminiResponse = await callGemini(prompt);
    
    // Parse Gemini response
    let geminiData: any;
    try {
      geminiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      geminiData = JSON.parse(geminiResponse);
    } catch (parseError) {
      throw new Error(`Failed to parse Gemini response: ${parseError}`);
    }

    // Build response
    const response: RewriteResponse = {
      subject: geminiData.subject,
      body: geminiData.body || selectedDraftBody
    };

    // Validate response
    RewriteResponseSchema.parse(response);

    res.json(response);
  } catch (error: any) {
    console.error('Rewrite error:', error);
    
    if (error.name === 'ZodError') {
      res.status(400).json({
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        error: 'Failed to rewrite',
        message: error.message
      });
    }
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 ReplyWise API server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:4200`);
});
