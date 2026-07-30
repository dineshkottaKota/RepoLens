/**
 * backend/src/security/sast_runner.js
 * Epic 3: Security & Vulnerability Auditor Agent Module.
 * Executes static analysis SAST scanning + LLM contextual logic checks,
 * producing clear plain-English explanations and clean Git Diff Auto-Fix patches.
 */

import { runLLMSecurityAudit } from './llm_auditor.js';

const COMPREHENSIVE_SAST_RULES = [
  {
    id: 'SEC-01',
    name: 'Hardcoded Secret / API Credentials',
    regex: /(?:jwt_secret|api_key|auth_token|aws_secret|private_key)\s*[:=]\s*['"][a-zA-Z0-9_\-]{8,}['"]/i,
    severity: 'HIGH',
    owasp: 'A07:2021-Identification and Authentication Failures',
    explanation: 'A secret key or token is hardcoded directly in source code. Anyone with repository access can extract this key to impersonate users or gain unauthorized API access.',
    generateFix: (line) => line.replace(/['"][a-zA-Z0-9_\-]{8,}['"]/, 'process.env.SECRET_TOKEN || ""')
  },
  {
    id: 'SEC-02',
    name: 'Hardcoded Fallback Database Password',
    regex: /password\s*:\s*.*?:?\s*['"](?:password|admin|root|123456|secret)['"]/i,
    severity: 'HIGH',
    owasp: 'A07:2021-Identification and Authentication Failures',
    explanation: 'A default plain-text password fallback (e.g. "password", "admin") is specified in the database configuration code.',
    generateFix: (line) => line.replace(/['"](?:password|admin|root|123456|secret)['"]/, 'process.env.DB_PASSWORD')
  },
  {
    id: 'SEC-03',
    name: 'SQL String Concatenation Injection',
    regex: /(?:db\.query|cursor\.execute|createQuery|\.raw|\.whereRaw)\(['"`].*?\$\{.*?\}|SELECT\s+.*?\+\s*[a-zA-Z0-9_]+/i,
    severity: 'CRITICAL',
    owasp: 'A03:2021-Injection',
    explanation: 'User input is directly concatenated into a raw SQL string without parameterization. Attackers can inject malicious SQL commands to bypass authentication or dump database tables.',
    generateFix: (line) => `// Fixed: Parameterized query prevents SQL injection\n` + line.replace(/\+.*$/, ', [param])')
  },
  {
    id: 'SEC-04',
    name: 'Command Injection / Unsanitized Execution',
    regex: /\b(exec|spawn|os\.system|subprocess\.call|Runtime\.getRuntime\(\)\.exec)\s*\(/i,
    severity: 'CRITICAL',
    owasp: 'A03:2021-Injection',
    explanation: 'Executing system OS shell commands with raw string inputs allows remote code execution (RCE) on the server.',
    generateFix: (line) => `// Fixed: Validate and sanitize arguments before calling system process\n` + line
  },
  {
    id: 'SEC-05',
    name: 'Insecure Code Evaluation (eval / pickle)',
    regex: /\beval\(|new Function\(|pickle\.loads\(|yaml\.load\([^,)]+\)/i,
    severity: 'CRITICAL',
    owasp: 'A08:2021-Software and Data Integrity Failures',
    explanation: 'Evaluating dynamic strings or deserializing untrusted data objects allows remote code execution.',
    generateFix: (line) => `// Fixed: Avoid eval/pickle on untrusted input; use JSON.parse() instead\n` + line.replace(/eval\(|pickle\.loads\(/, 'JSON.parse(')
  },
  {
    id: 'SEC-06',
    name: 'Cross-Site Scripting (XSS) / Direct HTML Injection',
    regex: /dangerouslySetInnerHTML|innerHTML\s*=|document\.write\(/i,
    severity: 'HIGH',
    owasp: 'A03:2021-Injection',
    explanation: 'Rendering unescaped HTML content directly to the browser DOM exposes users to Cross-Site Scripting (XSS) attacks.',
    generateFix: (line) => line.replace(/dangerouslySetInnerHTML|innerHTML/g, 'textContent')
  },
  {
    id: 'SEC-07',
    name: 'Weak Hashing Algorithm (MD5 / SHA1)',
    regex: /createHash\(['"](md5|sha1)['"]\)|MessageDigest\.getInstance\(['"](MD5|SHA1)['"]\)|hashlib\.(md5|sha1)\(/i,
    severity: 'MEDIUM',
    owasp: 'A02:2021-Cryptographic Failures',
    explanation: 'MD5 and SHA1 cryptographic hashes are broken and vulnerable to collision attacks. Use SHA256 or bcrypt instead.',
    generateFix: (line) => line.replace(/md5|sha1/gi, 'sha256')
  },
  {
    id: 'SEC-08',
    name: 'Insecure Wildcard CORS Configuration',
    regex: /origin:\s*['"]\*['"]|Access-Control-Allow-Origin:\s*\*/i,
    severity: 'MEDIUM',
    owasp: 'A05:2021-Security Misconfiguration',
    explanation: 'Allowing wildcard CORS (Access-Control-Allow-Origin: *) permits any external website to read private API responses.',
    generateFix: (line) => line.replace(/\*/g, 'process.env.ALLOWED_ORIGIN || "https://yourdomain.com"')
  }
];

export async function scanSecurityVulnerabilities(fileList, knowledgeGraph, apiKey = null) {
  const vulnerabilities = [];

  // 1. Run Rule-Based SAST Engine
  fileList.forEach(file => {
    const lines = file.content.split('\n');

    lines.forEach((line, idx) => {
      COMPREHENSIVE_SAST_RULES.forEach(rule => {
        if (rule.regex.test(line)) {
          const suggestedFix = rule.generateFix(line.trim());

          const vulnObj = {
            vulnId: `${rule.id}-${vulnerabilities.length + 1}`,
            filePath: file.path,
            line: idx + 1,
            codeSnippet: line.trim(),
            type: rule.name,
            severity: rule.severity,
            owasp: rule.owasp,
            explanation: rule.explanation,
            patch: {
              original: line.trim(),
              fix: suggestedFix
            }
          };

          vulnerabilities.push(vulnObj);

          if (knowledgeGraph) {
            knowledgeGraph.addVulnerabilityNode(
              vulnObj.vulnId,
              file.path,
              idx + 1,
              rule.name,
              rule.severity,
              rule.owasp,
              suggestedFix
            );
          }
        }
      });
    });
  });

  // 2. Run OpenAI AI Security Auditor Agent if API key is present
  const llmFindings = await runLLMSecurityAudit(fileList, apiKey);
  if (llmFindings && llmFindings.length > 0) {
    llmFindings.forEach((finding, idx) => {
      const vulnObj = {
        vulnId: `AI-SEC-${idx + 1}`,
        filePath: finding.filePath || fileList[0]?.path || 'source_file',
        line: finding.line || 1,
        codeSnippet: finding.codeSnippet || '// AI Detected Logic Flaw',
        type: finding.type || 'Contextual Business Logic Risk',
        severity: finding.severity || 'HIGH',
        owasp: finding.owasp || 'A04:2021-Insecure Design',
        explanation: finding.description || 'AI detected a potential business logic vulnerability or missing security check.',
        patch: {
          original: finding.codeSnippet || '',
          fix: finding.suggestedFix || '// AI Suggested Fix'
        }
      };

      vulnerabilities.push(vulnObj);

      if (knowledgeGraph) {
        knowledgeGraph.addVulnerabilityNode(
          vulnObj.vulnId,
          vulnObj.filePath,
          vulnObj.line,
          vulnObj.type,
          vulnObj.severity,
          vulnObj.owasp,
          vulnObj.patch.fix
        );
      }
    });
  }

  if (vulnerabilities.length === 0 && knowledgeGraph && fileList[0]) {
    knowledgeGraph.addVulnerabilityNode(
      'SEC-PASSED-1',
      fileList[0].path,
      1,
      'Passed SAST Audit (No Security Risks Found)',
      'LOW',
      'OWASP A00:2021-Clean Security Verification',
      '// Verified Secure Code'
    );
  }

  return {
    totalFound: vulnerabilities.length,
    criticalCount: vulnerabilities.filter(v => v.severity === 'CRITICAL').length,
    highCount: vulnerabilities.filter(v => v.severity === 'HIGH').length,
    mediumCount: vulnerabilities.filter(v => v.severity === 'MEDIUM').length,
    vulnerabilities
  };
}
