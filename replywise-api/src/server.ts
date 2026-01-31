import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

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
// 🔐 CONFIG (EDIT THESE SAFELY)
//////////////////////////////////////////////////

const DAILY_GEMINI_LIMIT = Number(process.env.DAILY_GEMINI_LIMIT || 30);
const DAILY_VOICE_LIMIT = Number(process.env.DAILY_VOICE_LIMIT || 5);
const MONTHLY_GEMINI_CAP = Number(process.env.MONTHLY_GEMINI_CAP || 50000);

//////////////////////////////////////////////////
// 🔐 MEMORY TRACKERS (simple + free)
//////////////////////////////////////////////////

const dailyGeminiUsage = new Map<string, number>();
const dailyVoiceUsage = new Map<string, number>();

let monthlyGeminiCalls = 0;

//////////////////////////////////////////////////
// 🔐 RESET DAILY + MONTHLY COUNTERS
//////////////////////////////////////////////////

setInterval(() => {
  dailyGeminiUsage.clear();
  dailyVoiceUsage.clear();
  console.log('🔄 Daily quotas reset');
}, 24 * 60 * 60 * 1000);

setInterval(() => {
  monthlyGeminiCalls = 0;
  console.log('🔄 Monthly quota reset');
}, 30 * 24 * 60 * 60 * 1000);

//////////////////////////////////////////////////
// 🔐 RATE LIMIT (anti spam)
//////////////////////////////////////////////////

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many requests. Slow down.' }
});

//////////////////////////////////////////////////
// MIDDLEWARE
//////////////////////////////////////////////////

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(helmet({ contentSecurityPolicy: false }));
app.use(limiter);

//////////////////////////////////////////////////
// HEALTH
//////////////////////////////////////////////////

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

//////////////////////////////////////////////////
// GEMINI INIT
//////////////////////////////////////////////////

if (process.env.GEMINI_API_KEY) {
  initializeGemini(process.env.GEMINI_API_KEY);
  console.log('✅ Gemini initialized');
}

//////////////////////////////////////////////////
// HELPER FUNCTIONS
//////////////////////////////////////////////////

function getUserId(req: Request) {
  return req.ip || 'unknown';
}

function checkDailyGemini(userId: string) {
  const count = dailyGeminiUsage.get(userId) || 0;
  if (count >= DAILY_GEMINI_LIMIT) return false;

  dailyGeminiUsage.set(userId, count + 1);
  return true;
}

function checkDailyVoice(userId: string) {
  const count = dailyVoiceUsage.get(userId) || 0;
  if (count >= DAILY_VOICE_LIMIT) return false;

  dailyVoiceUsage.set(userId, count + 1);
  return true;
}

function checkMonthlyCap() {
  return monthlyGeminiCalls < MONTHLY_GEMINI_CAP;
}

//////////////////////////////////////////////////
// TTS ROUTER WITH VOICE PROTECTION
//////////////////////////////////////////////////

app.use('/api/tts', (req, res, next) => {
  const userId = getUserId(req);

  if (!checkDailyVoice(userId)) {
    return res.status(429).json({
      error: 'Daily voice quota reached'
    });
  }

  next();
}, ttsRouter);

//////////////////////////////////////////////////
// GENERATE
//////////////////////////////////////////////////

app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    // 🔐 DAILY LIMIT
    if (!checkDailyGemini(userId)) {
      return res.status(429).json({
        error: 'Daily free quota reached'
      });
    }

    // 🔐 MONTHLY CAP
    if (!checkMonthlyCap()) {
      return res.status(503).json({
        error: 'Service temporarily unavailable (quota exceeded)'
      });
    }

    monthlyGeminiCalls++;

    const validatedData = GenerateRequestSchema.parse(req.body);
    const { emailText, context } = validatedData as GenerateRequest;

    const heuristicRisk = analyzeRisk(emailText);

    const prompt = generatePrompt(emailText, context);
    const geminiResponse = await callGemini(prompt);

    const cleaned = geminiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');

    const geminiData = JSON.parse(cleaned);

    const geminiFlags = Array.isArray(geminiData.risk?.flags)
      ? geminiData.risk.flags
      : [];

    const allFlags = [...new Set([...geminiFlags, ...heuristicRisk.flags])];

    const drafts = geminiData.reply_drafts || {};

    const response: GenerateResponse = {
      intent_summary: geminiData.intent_summary || [],
      reply_drafts: [
        { style: 'short', subject: drafts.short?.subject || 'Re: Email', body: drafts.short?.body || '' },
        { style: 'friendly', subject: drafts.friendly?.subject || 'Re: Email', body: drafts.friendly?.body || '' },
        { style: 'formal', subject: drafts.formal?.subject || 'Re: Email', body: drafts.formal?.body || '' }
      ],
      questions_to_ask: geminiData.questions_to_ask || [],
      risk: {
        flags: {
          urgency: allFlags.includes('urgency'),
          commitment: allFlags.includes('commitment'),
          sensitive: allFlags.includes('sensitive'),
          financial: allFlags.includes('financial')
        },
        notes: geminiData.risk?.notes || [],
        confidence: 80
      }
    };

    res.json(response);

  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//////////////////////////////////////////////////
// REWRITE
//////////////////////////////////////////////////

app.post('/api/rewrite', async (req: Request, res: Response) => {
  try {
    const validatedData = RewriteRequestSchema.parse(req.body);
    const { action, selectedDraftBody, originalEmail, context } =
      validatedData as RewriteRequest;

    const prompt = rewritePrompt(action, selectedDraftBody, originalEmail, context);
    const geminiResponse = await callGemini(prompt);

    const cleaned = geminiResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '');

    const geminiData = JSON.parse(cleaned);

    const response: RewriteResponse = {
      subject: geminiData.subject,
      body: geminiData.body
    };

    res.json(response);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

//////////////////////////////////////////////////
// START
//////////////////////////////////////////////////

app.listen(PORT, () => {
  console.log(`🚀 ReplyWise API running on ${PORT}`);
});
