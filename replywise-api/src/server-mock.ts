import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors({
  origin: /localhost/,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

// Mock API - generates realistic demo responses
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { emailText } = req.body;
    
    console.log('Received email:', emailText.substring(0, 50) + '...');
    
    // Mock response
    const mockResponse = {
      intent_summary: 'Office hours schedule announcement',
      reply_drafts: [
        {
          style: 'short',
          subject: 'Re: Office hours update',
          body: 'Thank you for the update. I will check the course outline for the new schedule.'
        },
        {
          style: 'friendly',
          subject: 'Re: Office hours schedule change',
          body: 'Thanks for letting us know! I appreciate you updating us on the schedule change. I\'ll make sure to check the course outline for the new times.'
        },
        {
          style: 'formal',
          subject: 'RE: Office Hours Schedule Modification',
          body: 'Thank you for notifying us of the schedule modification. I acknowledge the change and will review the updated course outline to obtain the new office hours information.'
        }
      ],
      questions_to_ask: [
        'Are there any alternative office hours available?',
        'Will office hours be held in the same location?',
        'When will the updated schedule be posted?'
      ],
      risk: {
        severity: 'low',
        confidence: 0.95,
        flags: [],
        notes: []
      }
    };
    
    res.json(mockResponse);
  } catch (error: any) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ReplyWise API server running on http://localhost:' + PORT);
  console.log('📡 CORS enabled for localhost');
  console.log('⚠️  MOCK MODE - Using hardcoded responses (not calling Gemini API)');
});
