import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI: GoogleGenerativeAI | null = null;
let apiKey: string = '';

export function initializeGemini(key: string): void {
  apiKey = key;
  genAI = new GoogleGenerativeAI(key);
}

/**
 * Calls Gemini using REST API directly (more reliable for different API versions)
 */
async function callGeminiRest(prompt: string, modelName: string = 'gemini-2.5-flash'): Promise<string> {
  // Use v1beta (has more models) or v1
  const versions = ['v1beta', 'v1'];
  
  for (const version of versions) {
    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          return data.candidates[0].content.parts[0].text;
        }
        throw new Error('Unexpected response format from Gemini API');
      }
      
      // If 404, try next version
      if (response.status === 404 && versions.indexOf(version) < versions.length - 1) {
        continue;
      }
      
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    } catch (error: any) {
      // If it's a 404 and we have more versions to try, continue
      if (error.message?.includes('404') && versions.indexOf(version) < versions.length - 1) {
        continue;
      }
      // If last version or other error, throw
      if (versions.indexOf(version) === versions.length - 1) {
        throw error;
      }
    }
  }
  
  throw new Error('All API versions failed');
}

/**
 * Extracts JSON from text that might be wrapped in markdown code blocks
 */
function extractJSON(text: string): string {
  // Remove markdown code blocks
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Find JSON object boundaries
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  
  return text.trim();
}

/**
 * Calls Gemini API with a prompt and returns the response
 * Implements retry logic for JSON parsing failures
 */
export async function callGemini(prompt: string, retryOnFailure = true): Promise<string> {
  if (!genAI || !apiKey) {
    throw new Error('Gemini not initialized. Call initializeGemini first.');
  }

  // Try REST API first (more compatible with different API versions)
  // Use gemini-2.5-flash (fast and available) or gemini-2.5-pro (more capable)
  try {
    let text = await callGeminiRest(prompt, 'gemini-2.5-flash');
    
    // Try to extract JSON if wrapped in markdown
    text = extractJSON(text);

    // Validate JSON
    try {
      JSON.parse(text);
      return text;
    } catch (parseError) {
      if (retryOnFailure) {
        console.warn('JSON parsing failed, attempting to fix...');
        // Retry with a fix prompt
        const fixPrompt = `The following text should be valid JSON but has errors. Fix it and return ONLY the corrected JSON, nothing else:\n\n${text}`;
        let fixedText = await callGeminiRest(fixPrompt, 'gemini-2.5-flash');
        fixedText = extractJSON(fixedText);
        
        // Validate fixed JSON
        try {
          JSON.parse(fixedText);
          return fixedText;
        } catch (secondError) {
          throw new Error(`Failed to parse JSON after retry: ${secondError}`);
        }
      } else {
        throw new Error(`Invalid JSON response: ${parseError}`);
      }
    }
  } catch (error: any) {
    // If REST API fails, try SDK as fallback
    try {
      console.warn('REST API failed, trying SDK...', error.message);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      
      text = extractJSON(text);
      
      try {
        JSON.parse(text);
        return text;
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${parseError}`);
      }
    } catch (sdkError: any) {
      throw new Error(`Gemini API error: ${error.message || sdkError.message}`);
    }
  }
}
