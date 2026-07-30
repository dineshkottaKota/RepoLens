/**
 * backend/src/testing/llm_test_generator.js
 * AI Test Generator Agent: Uses OpenAI API to generate dynamic unit and integration tests.
 */

import { callOpenAI } from '../services/llm_service.js';

export async function runLLMTestGeneration(astSummary, fileContent, apiKey = null) {
  if (!apiKey && !process.env.OPENAI_API_KEY) {
    return null;
  }

  const prompt = `You are an expert software test engineering AI agent.
Synthesize a complete, production-ready unit test suite for the following source file.

Target File Path: ${astSummary.filePath}
Language: ${astSummary.language}
Functions/Methods Identified: ${JSON.stringify(astSummary.functions)}

Source Code Content:
\`\`\`
${fileContent.substring(0, 2000)}
\`\`\`

Requirements:
1. Write realistic unit tests tailored specifically to the actual function logic and signatures in the file.
2. Include parameter types, realistic mock objects for external dependencies (DB, APIs, imports), edge case assertions, and boundary checks.
3. Add inline comments explaining each test case.
4. Output ONLY the raw executable test code (no markdown text outside the code block).`;

  try {
    const rawResponse = await callOpenAI({
      prompt,
      systemPrompt: 'You are an elite automated unit test synthesis AI agent. Output executable test code only.',
      apiKey
    });

    if (!rawResponse) return null;

    return rawResponse.replace(/```[a-z]*/gi, '').trim();
  } catch (err) {
    console.error('[LLM Test Generator Error]:', err.message);
    return null;
  }
}
