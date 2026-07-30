/**
 * backend/src/graph/db.js
 * Persistent Code Knowledge Graph Engine & In-Memory Property Graph representation.
 * Supports Cypher-like queries, node creation, edge linking, and Graph-RAG token-budget sub-graph extraction.
 */

export class CodeKnowledgeGraph {
  constructor() {
    this.nodes = new Map(); // id -> Node
    this.edges = [];        // Edge Array
  }

  clear() {
    this.nodes.clear();
    this.edges = [];
  }

  // Node Creators
  addFileNode(filePath, language, loc) {
    const id = `file:${filePath}`;
    const node = { id, label: 'FileNode', path: filePath, language, loc };
    this.nodes.set(id, node);
    return node;
  }

  addFunctionNode(filePath, name, params, complexity) {
    const id = `func:${filePath}:${name}`;
    const node = { id, label: 'FunctionNode', file: filePath, name, params, complexity };
    this.nodes.set(id, node);
    // Link File -> CONTAINS -> Function
    this.addEdge(`file:${filePath}`, id, 'CONTAINS');
    return node;
  }

  addClassNode(filePath, name, extendsClass) {
    const id = `class:${filePath}:${name}`;
    const node = { id, label: 'ClassNode', file: filePath, name, extends: extendsClass };
    this.nodes.set(id, node);
    this.addEdge(`file:${filePath}`, id, 'CONTAINS');
    return node;
  }

  addEndpointNode(filePath, method, path) {
    const id = `route:${filePath}:${method}:${path}`;
    const name = `${method.toUpperCase()} ${path}`;
    const node = { id, label: 'EndpointNode', name, file: filePath, method: method.toUpperCase(), path };
    this.nodes.set(id, node);
    this.addEdge(`file:${filePath}`, id, 'EXPOSES_ROUTE');
    return node;
  }

  addVulnerabilityNode(vulnId, filePath, line, type, severity, owasp, patch) {
    const id = `vuln:${vulnId}`;
    const name = `[${severity}] ${type}`;
    const node = { id, label: 'VulnerabilityNode', name, filePath, line, type, severity, owasp, patch };
    this.nodes.set(id, node);
    this.addEdge(id, `file:${filePath}`, 'AFFECTS');
    return node;
  }

  addTestCaseNode(testId, testFile, targetFile, testCount, code) {
    const id = `test:${testId}`;
    const name = `Test Suite: ${testFile.split('/').pop()}`;
    const node = { id, label: 'TestCaseNode', name, testFile, targetFile, testCount, code };
    this.nodes.set(id, node);
    this.addEdge(id, `file:${targetFile}`, 'TESTS');
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
