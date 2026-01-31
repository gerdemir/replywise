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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

//////////////////////////////////////////////////
// ✅ Middleware order FIXED
//////////////////////////////////////////////////

// CORS FIRST
app.use(
  cors({
    origin: true, // allow all origins safely for now
    credentials: true,
  })
);

// JSON parsing
app.use(express.json());

// Helmet AFTER CORS
app.use(
  helmet({
    contentSecurityPolicy: false, // avoid CSP blocking frontend
  })
);

//////////////////////////////////////////////////
// Routes
//////////////////////////////////////////////////

app.use('/api', ttsRouter);

//////////////////////////////////////////////////
// Health check
//////////////////////////////////////////////////

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

//////////////////////////////////////////////////
// Gemini initialization
//////////////////////////////////////////////////

const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey || geminiApiKey === 'YOUR_KEY_HERE') {
  console.warn('⚠️ GEMINI_API_KEY missing.');
} else {
  initializeGemini(geminiApiKey);
  console.log('✅ Gemini initialized');
}

//////////////////////////////////////////////////
// ElevenLabs initialization
//////////////////////////////////////////////////

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

if (!elevenLabsApiKey || elevenLabsApiKey === 'YOUR_KEY_HERE') {
  console.warn('⚠️ ELEVENLABS_API_KEY missing.');
} else {
  console.log('✅ ElevenLabs initialized');
}

//////////////////////////////////////////////////
// Generate endpoint
//////////////////////////////////////////////////

app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const validatedData = GenerateRequestSchema.parse(req.body);
    const { emailText, context } = validatedData as GenerateRequest;

    const heuristicRisk = analyzeRisk(emailText);

    const prompt = generatePrompt(emailText, context);
    const geminiResponse = await callGemini(prompt);

    let cleaned = geminiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');

    const geminiData = JSON.parse(cleaned);

    const geminiFlags = Array.isArray(geminiData.risk?.flags)
      ? geminiData.risk.flags
      : [];

    const allFlags = [...new Set([...geminiFlags, ...heuristicRisk.flags])];

    const riskFlagsObj = {
      urgency: allFlags.includes('urgency'),
      commitment: allFlags.includes('commitment'),
      sensitive: allFlags.includes('sensitive'),
      financial: allFlags.includes('financial'),
    };

    const mergedNotes = [
      ...(geminiData.risk?.notes || []),
      ...heuristicRisk.notes,
    ];

    const mergedConfidence = Math.max(
      (geminiData.risk?.confidence || 0) * 100,
      heuristicRisk.confidence * 100
    );

    const drafts = geminiData.reply_drafts || {};

    const transformedDrafts = [
      { style: 'short', subject: drafts.short?.subject || 'Re: Email', body: drafts.short?.body || '' },
      { style: 'friendly', subject: drafts.friendly?.subject || 'Re: Email', body: drafts.friendly?.body || '' },
      { style: 'formal', subject: drafts.formal?.subject || 'Re: Email', body: drafts.formal?.body || '' },
    ];

    const response: GenerateResponse = {
      intent_summary: geminiData.intent_summary || [],
      reply_drafts: transformedDrafts,
      questions_to_ask: geminiData.questions_to_ask || [],
      risk: {
        flags: riskFlagsObj,
        notes: mergedNotes,
        confidence: Math.min(Math.max(mergedConfidence, 0), 100),
      },
    };

    GenerateResponseSchema.parse(response);

    res.json(response);
  } catch (error: any) {
    console.error('Generate error:', error);

    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message,
    });
  }
});

//////////////////////////////////////////////////
// Rewrite endpoint
//////////////////////////////////////////////////

app.post('/api/rewrite', async (req: Request, res: Response) => {
  try {
    const validatedData = RewriteRequestSchema.parse(req.body);
    const { action, selectedDraftBody, originalEmail, context } =
      validatedData as RewriteRequest;

    const prompt = rewritePrompt(
      action,
      selectedDraftBody,
      originalEmail,
      context
    );

    const geminiResponse = await callGemini(prompt);

    const cleaned = geminiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');

    const geminiData = JSON.parse(cleaned);

    const response: RewriteResponse = {
      subject: geminiData.subject,
      body: geminiData.body || selectedDraftBody,
    };

    RewriteResponseSchema.parse(response);

    res.json(response);
  } catch (error: any) {
    console.error('Rewrite error:', error);

    res.status(500).json({
      error: 'Failed to rewrite',
      message: error.message,
    });
  }
});

//////////////////////////////////////////////////
// Error handler
//////////////////////////////////////////////////

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);

  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

//////////////////////////////////////////////////
// Start server
//////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`🚀 ReplyWise API running on port ${PORT}`);
});
