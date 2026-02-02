import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY!;
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'Rachel'; // default

//////////////////////////////////////////////////
// Helper: sleep for retry
//////////////////////////////////////////////////

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//////////////////////////////////////////////////
// ElevenLabs call with retry + timeout
//////////////////////////////////////////////////

async function callElevenLabs(text: string) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🔊 ElevenLabs attempt ${attempt}`);

      const response = await axios.post(
        url,
        {
          text,
          model_id: 'eleven_multilingual_v2',
        },
        {
          headers: {
            'xi-api-key': ELEVEN_API_KEY,
            'Content-Type': 'application/json',
            Accept: 'audio/mpeg',
          },
          responseType: 'arraybuffer',
          timeout: 15000, // 15s timeout protection
        }
      );

      return response.data;
    } catch (err: any) {
      console.error('❌ ElevenLabs error:', err.response?.status, err.message);

      // if last attempt → throw
      if (attempt === 3) throw err;

      await sleep(1500); // retry delay
    }
  }
}

//////////////////////////////////////////////////
// ROUTE
//////////////////////////////////////////////////

router.post('/', async (req: Request, res: Response) => {
  try {
    if (!ELEVEN_API_KEY) {
      return res.status(500).json({
        error: 'ELEVENLABS_API_KEY missing on server',
      });
    }

    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        error: 'Text required',
      });
    }

    const audioBuffer = await callElevenLabs(text);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    res.send(audioBuffer);
  } catch (err: any) {
    console.error('🔥 TTS failed:', err.message);

    const status = err.response?.status;

    if (status === 401) {
      return res.status(401).json({
        error: 'Invalid ElevenLabs API key',
      });
    }

    if (status === 429) {
      return res.status(429).json({
        error: 'ElevenLabs quota exceeded',
      });
    }

    res.status(500).json({
      error: 'Audio generation failed',
      message: err.message,
    });
  }
});

export default router;
