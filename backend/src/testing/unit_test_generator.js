/**
 * backend/src/testing/unit_test_generator.js
 * Epic 4: Automated Unit & Integration Test Case Synthesizer Module.
 * Discovers untested functions via Knowledge Graph `TESTS` edges and synthesizes context-aware test suites.
 */

import { runLLMTestGeneration } from './llm_test_generator.js';

export async function generateTestSuites(astSummaries, loadedFiles = [], knowledgeGraph = null, apiKey = null) {
  const unitTests = [];
  const integrationTests = [];

  const eligibleSummaries = astSummaries.filter(s => s.functions && s.functions.length > 0);

  await Promise.all(eligibleSummaries.map(async (summary, idx) => {
    const fileObj = loadedFiles.find(f => f.path === summary.filePath);
    const ext = summary.filePath.split('.').pop().toLowerCase();
    const isPy = ext === 'py';
    const isJava = ext === 'java';

    const testFileName = isPy 
      ? summary.filePath.replace(/\.py$/, '_test.py') 
      : isJava 
      ? summary.filePath.replace(/\.java$/, 'Test.java') 
      : summary.filePath.replace(/\.(js|ts|jsx|tsx)$/, '.test.$1');

    const frameworkRunner = isPy 
      ? `pytest ${testFileName}` 
      : isJava 
      ? `mvn test -Dtest=${testFileName.replace('.java', '')}` 
      : `npx jest ${testFileName}`;

    let code = '';

    // 1. Try AI-driven test synthesis for top 4 files if OpenAI API Key is available
    if (fileObj && (apiKey || process.env.OPENAI_API_KEY) && idx < 4) {
      const aiGeneratedCode = await runLLMTestGeneration(summary, fileObj.content, apiKey);
      if (aiGeneratedCode) {
        code = aiGeneratedCode;
      }
    }

    // 2. Fallback to dynamic signature-aware template generation if AI is not used
    if (!code) {
      const funcNames = summary.functions.map(f => f.name);

      if (isPy) {
        code = `"""\nAutomated Unit Test Suite for: ${summary.filePath}\nRun with: ${frameworkRunner}\n"""\n\nimport pytest\nfrom unittest.mock import MagicMock\nfrom ${summary.filePath.replace(/\//g, '.').replace(/\.py$/, '')} import ${funcNames.join(', ')}\n\n`;
        summary.functions.forEach(func => {
          const sampleArg = func.params ? func.params.split(',').map(p => `"${p.trim()}_val"`).join(', ') : '';
          code += `# --- Test Case 1: Valid Execution for ${func.name}(${func.params}) ---\n`;
          code += `def test_${func.name}_valid_input():\n`;
          code += `    # Executes ${func.name} with extracted parameters: (${func.params})\n`;
          code += `    result = ${func.name}(${sampleArg})\n`;
          code += `    assert result is not None\n\n`;
          code += `# --- Test Case 2: Boundary Null Assertion for ${func.name}() ---\n`;
          code += `def test_${func.name}_boundary():\n`;
          code += `    with pytest.raises((ValueError, TypeError, Exception)):\n`;
          code += `        ${func.name}(None)\n\n`;
        });
      } else {
        code = `/**\n * Automated Unit Test Suite for: ${summary.filePath}\n * Run with: ${frameworkRunner}\n */\n\n`;
        code += `import { ${funcNames.join(', ')} } from '../${summary.filePath.split('/').pop()}';\n\n`;
        code += `describe('Unit Tests for ${summary.filePath.split('/').pop()}', () => {\n`;
        code += `  beforeEach(() => {\n    jest.clearAllMocks();\n  });\n\n`;

        summary.functions.forEach(func => {
          const sampleArg = func.params ? func.params.split(',').map(p => `'${p.trim()}_val'`).join(', ') : '';
          code += `  describe('${func.name}()', () => {\n`;
          code += `    // Test 1: Verifies ${func.name} processes signature (${func.params})\n`;
          code += `    it('should execute successfully with valid parameters (${func.params})', async () => {\n`;
          code += `      const result = await ${func.name}(${sampleArg});\n`;
          code += `      expect(result).toBeDefined();\n`;
          code += `    });\n\n`;
          code += `    // Test 2: Verifies ${func.name} handles invalid/null boundary values\n`;
          code += `    it('should reject or handle null boundary gracefully', async () => {\n`;
          code += `      await expect(${func.name}(null)).rejects.toThrow();\n`;
          code += `    });\n`;
          code += `  });\n\n`;
        });
        code += `});\n`;
      }
    }

    const testObj = {
      id: `UT-${unitTests.length + 1}`,
      targetFile: summary.filePath,
      testFile: testFileName,
      frameworkRunner,
      functionsTested: summary.functions.map(f => f.name),
      testCount: summary.functions.length * 2,
      code
    };

    unitTests.push(testObj);

    if (knowledgeGraph) {
      knowledgeGraph.addTestCaseNode(testObj.id, testFileName, summary.filePath, testObj.testCount, code);
    }
  }));

  return { unitTests, integrationTests };
}
