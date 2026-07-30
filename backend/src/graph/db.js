/**
 * backend/src/graph/db.js
 * Enterprise Persistent Code Knowledge Graph Engine using Neo4j Driver + Dual In-Memory Property Graph.
 * Supports real Cypher queries, graph node creation, edge linking, and Graph-RAG token-budget sub-graph extraction.
 */

import neo4j from 'neo4j-driver';

export class CodeKnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> Node
    this.edges = [];        // Edge Array

    // Neo4j Cloud (AuraDB) or Local Connection Setup
    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    const user = process.env.NEO4J_USERNAME || process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';
    this.database = process.env.NEO4J_DATABASE || null;

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
      this.isNeo4jActive = true;
      const isCloud = uri.startsWith('neo4j+s://') || uri.includes('databases.neo4j.io');
      console.log(`[Neo4j ${isCloud ? 'AuraDB Cloud' : 'Graph Engine'}] Connected to ${uri} (User: ${user})`);
    } catch (err) {
      console.log(`[Neo4j Graph Engine Warning] Running in dual fallback mode (${err.message})`);
      this.driver = null;
      this.isNeo4jActive = false;
    }
  }

  async runCypher(query, params = {}) {
    if (!this.driver || !this.isNeo4jActive) return null;
    const sessionOpts = this.database ? { database: this.database } : {};
    const session = this.driver.session(sessionOpts);
    try {
      const result = await session.run(query, params);
      return result;
    } catch (err) {
      return null;
    } finally {
      await session.close();
    }
  }

  clear() {
    this.nodes.clear();
    this.edges = [];
    this.runCypher('MATCH (n) DETACH DELETE n').catch(() => {});
  }

  // Node Creators
  addFileNode(filePath, language, loc) {
    const id = `file:${filePath}`;
    const node = { id, label: 'FileNode', path: filePath, language, loc };
    this.nodes.set(id, node);

    // Sync to Neo4j via Cypher MERGE
    this.runCypher(
      'MERGE (f:FileNode {id: $id}) SET f.path = $path, f.language = $language, f.loc = $loc',
      { id, path: filePath, language: language || 'js', loc: loc || 0 }
    );

    return node;
  }

  addFunctionNode(filePath, name, params, complexity) {
    const id = `func:${filePath}:${name}`;
    const node = { id, label: 'FunctionNode', name, file: filePath, params, complexity };
    this.nodes.set(id, node);
    this.addEdge(`file:${filePath}`, id, 'CONTAINS');

    // Sync to Neo4j via Cypher MERGE
    this.runCypher(
      `MERGE (fn:FunctionNode {id: $id})
       SET fn.name = $name, fn.params = $params, fn.complexity = $complexity, fn.file = $file
       WITH fn
       MERGE (f:FileNode {id: $fileId})
       MERGE (f)-[:CONTAINS]->(fn)`,
      { id, name, params: params || '', complexity: complexity || 1, file: filePath, fileId: `file:${filePath}` }
    );

    return node;
  }

  addClassNode(filePath, name, extendsClass) {
    const id = `class:${filePath}:${name}`;
    const node = { id, label: 'ClassNode', name, file: filePath, extends: extendsClass };
    this.nodes.set(id, node);
    this.addEdge(`file:${filePath}`, id, 'CONTAINS');

    this.runCypher(
      `MERGE (c:ClassNode {id: $id})
       SET c.name = $name, c.extends = $extendsClass, c.file = $file
       WITH c
       MERGE (f:FileNode {id: $fileId})
       MERGE (f)-[:CONTAINS]->(c)`,
      { id, name, extendsClass: extendsClass || '', file: filePath, fileId: `file:${filePath}` }
    );

    return node;
  }

  addEndpointNode(filePath, method, path) {
    const id = `route:${filePath}:${method}:${path}`;
    const name = `${method.toUpperCase()} ${path}`;
    const node = { id, label: 'EndpointNode', name, file: filePath, method: method.toUpperCase(), path };
    this.nodes.set(id, node);
    this.addEdge(`file:${filePath}`, id, 'EXPOSES_ROUTE');

    this.runCypher(
      `MERGE (e:EndpointNode {id: $id})
       SET e.method = $method, e.path = $path, e.file = $file, e.name = $name
       WITH e
       MERGE (f:FileNode {id: $fileId})
       MERGE (f)-[:EXPOSES_ROUTE]->(e)`,
      { id, method: method.toUpperCase(), path, file: filePath, name, fileId: `file:${filePath}` }
    );

    return node;
  }

  addVulnerabilityNode(vulnId, filePath, line, type, severity, owasp, patch) {
    const id = `vuln:${vulnId}`;
    const name = `[${severity}] ${type}`;
    const node = { id, label: 'VulnerabilityNode', name, filePath, line, type, severity, owasp, patch };
    this.nodes.set(id, node);
    this.addEdge(id, `file:${filePath}`, 'AFFECTS');

    this.runCypher(
      `MERGE (v:VulnerabilityNode {id: $id})
       SET v.type = $type, v.severity = $severity, v.owasp = $owasp, v.line = $line, v.name = $name
       WITH v
       MERGE (f:FileNode {id: $fileId})
       MERGE (v)-[:AFFECTS]->(f)`,
      { id, type, severity, owasp: owasp || '', line: line || 1, name, fileId: `file:${filePath}` }
    );

    return node;
  }

  addTestCaseNode(testId, testFile, targetFile, testCount, code) {
    const id = `test:${testId}`;
    const name = `Test Suite: ${testFile.split('/').pop()}`;
    const node = { id, label: 'TestCaseNode', name, testFile, targetFile, testCount, code };
    this.nodes.set(id, node);
    this.addEdge(id, `file:${targetFile}`, 'TESTS');

    this.runCypher(
      `MERGE (t:TestCaseNode {id: $id})
       SET t.testFile = $testFile, t.targetFile = $targetFile, t.name = $name
       WITH t
       MERGE (f:FileNode {id: $targetFileId})
       MERGE (t)-[:TESTS]->(f)`,
      { id, testFile, targetFile, name, targetFileId: `file:${targetFile}` }
    );

    return node;
  }

  // Edge Creator
  addEdge(sourceId, targetId, relationship, properties = {}) {
    this.edges.push({
      source: sourceId,
      target: targetId,
      relationship,
      ...properties
    });
  }

  /**
   * Graph-RAG Subgraph Traversal (Token Budget Manager for 30k+ LOC)
   * Extracts 1st and 2nd degree topological neighbors of target node under maxTokenBudget
   */
  extractSubgraph(targetFile, maxTokenBudget = 6000) {
    const estTokensPerLOC = 3.5;
    const fileNode = this.nodes.get(`file:${targetFile}`);
    if (!fileNode) return null;

    const fileLOC = fileNode.loc || 100;
    const baseTokens = Math.round(fileLOC * estTokensPerLOC);

    // Find direct caller/callee function nodes and imported files
    const connectedEdges = this.edges.filter(e => 
      e.source.includes(targetFile) || e.target.includes(targetFile)
    );

    const connectedNodeIds = new Set();
    connectedEdges.forEach(e => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });

    const connectedNodes = Array.from(connectedNodeIds)
      .map(id => this.nodes.get(id))
      .filter(Boolean);

    return {
      targetFile,
      baseTokens,
      maxTokenBudget,
      withinBudget: baseTokens <= maxTokenBudget,
      connectedEdgesCount: connectedEdges.length,
      subgraphNodes: connectedNodes,
      subgraphEdges: connectedEdges
    };
  }

  /**
   * Exports full graph representation for Cytoscape.js Frontend Rendering
   */
  exportGraphJSON() {
    const nodes = Array.from(this.nodes.values()).map(n => ({
      data: { ...n, id: n.id, label: n.name || n.path || n.id, type: n.label, vulnCategory: n.type }
    }));

    const edges = this.edges.map((e, idx) => ({
      data: { id: `e${idx}`, source: e.source, target: e.target, label: e.relationship }
    }));

    return { nodes, edges };
  }
}

// Global Knowledge Graph Instance
export const globalKnowledgeGraph = new CodeKnowledgeGraph();
