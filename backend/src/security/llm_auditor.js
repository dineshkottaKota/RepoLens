/**
 * backend/src/security/llm_auditor.js
 * AI Security Auditor Agent: Uses OpenAI API to perform deep contextual security logic checks
 * on actual source code files fetched from GitHub.
 */

import { callOpenAI } from '../services/llm_service.js';

export async function runLLMSecurityAudit(fileList, apiKey) {
  if (!apiKey && !process.env.OPENAI_API_KEY) {
    return null;
  }

  // Combine top code files for AI analysis
  const codePromptContext = fileList.slice(0, 5).map(f => `--- FILE: ${f.path} ---\n${f.content.substring(0, 1500)}`).join('\n\n');

  const prompt = `Analyze the following source code files from a GitHub repository for security vulnerabilities (OWASP Top 10, CWE, logic flaws, hardcoded credentials, SQL injection, XSS, insecure auth).
  
${codePromptContext}

Respond ONLY with a valid JSON array of vulnerability objects in the following format:
[
  {
    "filePath": "path/to/file",
    "line": 10,
    "codeSnippet": "vulnerable code line",
    "type": "Vulnerability Name",
    "severity": "CRITICAL|HIGH|MEDIUM|LOW",
    "owasp": "OWASP Category",
    "description": "Explanation of vulnerability",
    "suggestedFix": "Corrected code snippet"
  }
]`;

  try {
    const rawResponse = await callOpenAI({
      prompt,
      systemPrompt: 'You are an elite static application security testing (SAST) and code auditing AI agent. Return ONLY raw JSON array without markdown backticks.',
      apiKey
    });

    if (!rawResponse) return null;

    // Clean JSON response
    const cleaned = rawResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
    let vulnerabilities = null;
    try {
      vulnerabilities = JSON.parse(cleaned);
    } catch (pErr) {
      console.error('[LLM Auditor] Failed to parse JSON response from OpenAI:', pErr.message);
      return null;
    }

    return Array.isArray(vulnerabilities) ? vulnerabilities : null;
  } catch (err) {
    console.error('[LLM Auditor Exception]:', err.message);
    return null;
  }
}
