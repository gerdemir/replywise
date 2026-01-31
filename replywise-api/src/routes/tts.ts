import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for TTS requests
const ttsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many TTS requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to TTS endpoint
router.use('/tts', ttsLimiter);

router.post('/tts', async (req, res) => {
  try {
    const { text, voice_id = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    // ElevenLabs TTS API call
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`,
      {
        text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
        },
        responseType: 'arraybuffer',
        timeout: 30000, // 30 second timeout
      }
    );

    // Set appropriate headers for audio response
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': response.data.length,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    });

    res.send(response.data);
  } catch (error: any) {
    console.error('TTS Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid ElevenLabs API key' });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ error: 'ElevenLabs API rate limit exceeded' });
    }

    res.status(500).json({
      error: 'Failed to generate speech',
      details: error.message
    });
  }
});

export default router;
