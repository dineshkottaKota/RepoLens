/**
 * backend/server.js
 * Fresh GitHub AI Agent Platform Orchestrator Server.
 * Connects GitHub Ingestion, AST Parsing, Code Knowledge Graph Engine, Security SAST, and Test Synthesizer.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { parseGitHubUrl, fetchGitHubRepoTree, fetchFileContent } from './src/ingestion/github_fetcher.js';
import { parseFileAST } from './src/parsers/ast_parser.js';
import { globalKnowledgeGraph } from './src/graph/db.js';
import { scanSecurityVulnerabilities } from './src/security/sast_runner.js';
import { generateTestSuites } from './src/testing/unit_test_generator.js';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'GitHub AI Agent Platform' });
});

// POST /api/agent/ingest-github
app.post('/api/agent/ingest-github', async (req, res) => {
  try {
    const { repoUrl, branch = 'main', maxTokenBudget = 6000, openaiApiKey } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ message: 'GitHub repository URL (repoUrl) is required.' });
    }

    const activeApiKey = openaiApiKey || process.env.OPENAI_API_KEY || null;
    console.log(`[Agent Server] Processing scan for ${repoUrl} (OpenAI Key: ${activeApiKey ? 'PRESENT' : 'NOT PROVIDED'})...`);

    const { owner, repo } = parseGitHubUrl(repoUrl);
    
    // 1. Fetch Repository Tree
    const tree = await fetchGitHubRepoTree(owner, repo, branch);
    
    // Fetch all main source files for comprehensive graph indexing (prioritizing code logic files)
    const isCodeFile = (path) => /\.(js|ts|jsx|tsx|py|java|go|cs|cpp|c|rs|php|sql)$/i.test(path) && !/(package|tsconfig|config|\.min\.|\.d\.ts)/i.test(path);
    const sortedTree = [...tree].sort((a, b) => (isCodeFile(b.path) ? 1 : 0) - (isCodeFile(a.path) ? 1 : 0));
    const targetFiles = sortedTree.slice(0, 50);

    const loadedFiles = await Promise.all(targetFiles.map(async item => {
      const content = await fetchFileContent(owner, repo, item.path, branch);
      return { path: item.path, content };
    }));

    const validLoadedFiles = loadedFiles.filter(f => f.content.length > 0);

    // 2. Clear & Rebuild Knowledge Graph
    globalKnowledgeGraph.clear();
    const astSummaries = [];

    validLoadedFiles.forEach(file => {
      const ast = parseFileAST(file.path, file.content);
      astSummaries.push(ast);

      // Populate Knowledge Graph
      globalKnowledgeGraph.addFileNode(file.path, ast.language, ast.loc);
      ast.functions.forEach(f => {
        globalKnowledgeGraph.addFunctionNode(file.path, f.name, f.params, f.complexity);
      });
      ast.classes.forEach(c => {
        globalKnowledgeGraph.addClassNode(file.path, c.name, c.extends);
      });
      ast.routes.forEach(r => {
        globalKnowledgeGraph.addEndpointNode(file.path, r.method, r.path);
      });
    });

    // 3. Security Vulnerability Scan
    const securityAudit = await scanSecurityVulnerabilities(validLoadedFiles, globalKnowledgeGraph, activeApiKey);

    // 4. Unit & Integration Test Case Synthesis
    const testSuites = await generateTestSuites(astSummaries, validLoadedFiles, globalKnowledgeGraph, activeApiKey);

    // 5. Graph-RAG Subgraph Traversal (30k+ LOC Management)
    const primaryFile = validLoadedFiles[0]?.path || 'index.js';
    const subgraphData = globalKnowledgeGraph.extractSubgraph(primaryFile, maxTokenBudget);

    // 6. Export Full Cytoscape.js Graph Data
    const graphData = globalKnowledgeGraph.exportGraphJSON();

    return res.json({
      success: true,
      repository: { owner, repo, branch, totalDiscoveredFiles: tree.length, indexedFilesCount: validLoadedFiles.length },
      summary: {
        totalLOC: astSummaries.reduce((acc, a) => acc + a.loc, 0),
        totalFunctions: astSummaries.reduce((acc, a) => acc + a.functions.length, 0),
        securityVulnerabilities: securityAudit.totalFound,
        unitTestsGenerated: testSuites.unitTests.length
      },
      graphData,
      subgraphData,
      securityAudit,
      testSuites
    });

  } catch (error) {
    console.error('[Agent Pipeline Ingestion Error]:', error.message);
    return res.json({
      success: false,
      message: error.message || 'Error ingesting GitHub repository. Please check the repository URL or branch name.',
      repository: { owner: 'repository', repo: 'scanned', branch: 'main', totalDiscoveredFiles: 0, indexedFilesCount: 0 },
      summary: { totalLOC: 0, totalFunctions: 0, securityVulnerabilities: 0, unitTestsGenerated: 0 },
      graphData: { nodes: [], edges: [] },
      subgraphData: null,
      securityAudit: { totalFound: 0, criticalCount: 0, highCount: 0, mediumCount: 0, vulnerabilities: [] },
      testSuites: { unitTests: [], integrationTests: [] }
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 GitHub AI Agent Platform Server running on port ${PORT}`);
});

export default app;
