/**
 * backend/src/services/llm_service.js
 * OpenAI API Integration Service for AI Security Auditing & Test Generation.
 */

export async function callOpenAI({ prompt, systemPrompt = 'You are an expert AI security and test engineering agent.', apiKey, model = 'gpt-4o-mini' }) {
  const effectiveKey = apiKey || process.env.OPENAI_API_KEY;
  if (!effectiveKey || typeof effectiveKey !== 'string' || !effectiveKey.trim()) return null;

  console.log(`[LLM Service] Calling OpenAI API model ${model}...`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${effectiveKey.trim()}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorPayload = await response.text().catch(() => '');
      console.log(`[LLM Service] OpenAI API returned HTTP ${response.status}: ${errorPayload.substring(0, 200)}. Falling back to rule-based engine.`);
      return null;
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;
  } catch (err) {
    console.error('[OpenAI API Exception]:', err.name === 'AbortError' ? 'Request timed out after 12s' : err.message);
    return null;
  }
}
