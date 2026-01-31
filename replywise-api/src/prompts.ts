/**
 * Prompt templates for Gemini API
 */

export function generatePrompt(emailText: string, context?: string): string {
  const contextInstruction = context 
    ? `\n\nUser Context/Instructions: ${context}\nPlease follow these instructions when generating replies.`
    : '';

  return `You are an AI email assistant that helps users draft professional email replies. Analyze the following email and return ONLY valid JSON (no markdown, no code blocks, no commentary).

Email to analyze:
${emailText}
${contextInstruction}

Return a JSON object with this exact structure:
{
  "intent_summary": ["bullet 1", "bullet 2", "bullet 3"],
  "reply_drafts": {
    "short": {
      "subject": "Re: [original subject]",
      "body": "Brief, concise reply (2-3 sentences max)"
    },
    "friendly": {
      "subject": "Re: [original subject]",
      "body": "Warm, casual but professional reply (3-5 sentences)"
    },
    "formal": {
      "subject": "Re: [original subject]",
      "body": "Formal, professional reply (4-6 sentences)"
    }
  },
  "questions_to_ask": ["question 1", "question 2", "question 3"],
  "risk": {
    "flags": ["flag1", "flag2"],
    "notes": ["note 1", "note 2"],
    "confidence": 0.75
  }
}

Requirements:
- intent_summary: 2-5 bullet points summarizing what the sender wants
- reply_drafts: Three versions (short, friendly, formal) - keep them practical and email-safe
- questions_to_ask: 2-6 relevant questions the user might want to ask
- risk.flags: Array of risk indicators (e.g., "urgency", "commitment", "financial", "sensitive", "phishing")
- risk.notes: Array of risk-related notes or warnings
- risk.confidence: Number between 0 and 1 indicating confidence in risk assessment

IMPORTANT: Return ONLY valid JSON. No markdown formatting. No code blocks. No explanatory text. Just the JSON object.`;
}

export function rewritePrompt(
  action: 'shorter' | 'more_formal' | 'regenerate',
  selectedDraftBody: string,
  originalEmail: string,
  context?: string
): string {
  const contextInstruction = context 
    ? `\n\nUser Context: ${context}`
    : '';

  const actionInstructions = {
    shorter: 'Make this email reply significantly shorter while keeping the key message. Aim for 2-3 sentences maximum.',
    more_formal: 'Rewrite this email reply in a more formal, professional tone. Use formal language and structure.',
    regenerate: 'Regenerate this email reply with a fresh approach while maintaining the same intent and key points.'
  };

  return `You are an AI email assistant. ${actionInstructions[action]}

Original email:
${originalEmail}

Current draft to modify:
${selectedDraftBody}
${contextInstruction}

Return ONLY valid JSON with this structure:
{
  "subject": "Re: [subject]",
  "body": "[rewritten email body]"
}

IMPORTANT: Return ONLY valid JSON. No markdown. No code blocks. No commentary. Just the JSON object.`;
}
