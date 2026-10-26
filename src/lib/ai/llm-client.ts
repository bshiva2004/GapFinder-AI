/**
 * Unified LLM client for Google Gemini & OpenAI with strict grounding.
 */

export function getAiConfigStatus() {
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);

  return {
    isConfigured: hasGemini || hasOpenAI,
    provider: hasGemini ? 'Google Gemini' : hasOpenAI ? 'OpenAI' : 'None (Deterministic RAG Mode)',
    hasGemini,
    hasOpenAI,
  };
}

export async function callGroundedLLM({
  systemInstruction,
  prompt,
  temperature = 0.2,
}: {
  systemInstruction: string;
  prompt: string;
  temperature?: number;
}): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nTask:\n${prompt}` }],
            },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini API returned error HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!outputText) {
        throw new Error('Gemini API returned empty response.');
      }
      return outputText;
    } catch (err: any) {
      console.error('Gemini API execution error:', err.message);
      throw err;
    }
  }

  if (openaiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          temperature,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`OpenAI API returned error HTTP ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err: any) {
      console.error('OpenAI API execution error:', err.message);
      throw err;
    }
  }

  return null;
}
