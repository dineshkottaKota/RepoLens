'use client';

import React, { useState } from 'react';

export default function PlatformDashboard() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/expressjs/express');
  const [branch, setBranch] = useState('main');
  const [maxTokenBudget, setMaxTokenBudget] = useState(6000);
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tests'); // Default to Tests tab for review
  const [copiedId, setCopiedId] = useState(null);

  const handleIngest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agent/ingest-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl, branch, maxTokenBudget: parseInt(maxTokenBudget), openaiApiKey })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        if (!response.ok) {
          throw new Error(`Scan request returned HTTP ${response.status}. ${responseText ? responseText.substring(0, 150) : 'Server timeout or gateway error.'}`);
        }
        throw new Error(`Server Response Error: ${responseText.substring(0, 100)}`);
      }

      if (data.success === false) {
        setError(data.message || 'Error processing GitHub repository scan.');
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f19', color: '#f8fafc', fontFamily: 'Inter, sans-serif', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600 }}>
            🚀 GitHub Multi-Agent Platform
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginTop: '0.75rem', marginBottom: '0.5rem' }}>
            GitHub AI Code Scanning & Test Suite Synthesizer
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '750px', margin: '0 auto' }}>
            Ingests any public or private GitHub repository, extracts multi-language AST symbols into a Code Knowledge Graph, performs OWASP security vulnerability auditing, and synthesizes ready-to-run unit/integration test suites.
          </p>
        </div>

        {/* Input Form */}
        <div style={{ background: '#1e293b', padding: '1.75rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '2rem' }}>
          <form onSubmit={handleIngest} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                GitHub Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                required
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Target Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '0.4rem' }}>
                Graph-RAG Token Limit
              </label>
              <select
                value={maxTokenBudget}
                onChange={(e) => setMaxTokenBudget(e.target.value)}
                style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: '#fff' }}
              >
                <option value={4000}>4,000 Tokens (Strict)</option>
                <option value={6000}>6,000 Tokens (Standard)</option>
                <option value={12000}>12,000 Tokens (Extended)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ padding: '0.75rem', borderRadius: '6px', background: loading ? '#64748b' : '#2563eb', color: '#fff', fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '⏳ Analyzing Code...' : '⚡ Run Agent Pipeline'}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
            ⚠️ Ingestion Error: {error}
          </div>
        )}

        {/* Results Overview */}
        {result && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Repository Scanned</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.2rem' }}>
                  {result.repository.owner}/{result.repository.repo}
                </div>
              </div>
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Knowledge Graph Nodes</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>
                  {result.graphData.nodes.length} Nodes ({result.graphData.edges.length} Edges)
                </div>
              </div>
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Security Vulnerabilities</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>
                  {result.summary.securityVulnerabilities} Found
                </div>
              </div>
              <div style={{ background: '#1e293b', padding: '1.25rem', borderRadius: '8px', border: '1px solid #334155', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Unit Tests Generated</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#4ade80', marginTop: '0.2rem' }}>
                  {result.summary.unitTestsGenerated} Test Suites
                </div>
              </div>
            </div>

            {/* Tab Controls */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #334155', marginBottom: '1.5rem' }}>
              <button
                onClick={() => setActiveTab('tests')}
                style={{ padding: '0.6rem 1.2rem', background: 'none', border: 'none', borderBottom: activeTab === 'tests' ? '3px solid #3b82f6' : '3px solid transparent', color: activeTab === 'tests' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer' }}
              >
                🧪 Synthesized Test Cases ({result.testSuites.unitTests.length})
              </button>
              <button
                onClick={() => setActiveTab('security')}
                style={{ padding: '0.6rem 1.2rem', background: 'none', border: 'none', borderBottom: activeTab === 'security' ? '3px solid #3b82f6' : '3px solid transparent', color: activeTab === 'security' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer' }}
              >
                🛡️ Security Vulnerabilities ({result.securityAudit.totalFound})
              </button>
              <button
                onClick={() => setActiveTab('graph')}
                style={{ padding: '0.6rem 1.2rem', background: 'none', border: 'none', borderBottom: activeTab === 'graph' ? '3px solid #3b82f6' : '3px solid transparent', color: activeTab === 'graph' ? '#fff' : '#94a3b8', fontWeight: 700, cursor: 'pointer' }}
              >
                🌐 Code Knowledge Graph ({result.graphData.nodes.length})
              </button>
            </div>

            {/* TAB 1: TESTS (UNDERSTANDABLE & ACTIONABLE GUIDE) */}
            {activeTab === 'tests' && (
              <div style={{ background: '#1e293b', padding: '1.75rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  Synthesized Unit Test Suites & Execution Guide
                </h3>

                {/* Step-by-Step Explanation Banner */}
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '1.2rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 700, color: '#60a5fa', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                    📖 How to Use Generated Test Cases in Your Project (3-Step Guide):
                  </div>
                  <ol style={{ marginLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.6 }}>
                    <li><strong>Step 1 (Copy Code)</strong>: Click the <code>📋 Copy Code</code> button on any generated test file below.</li>
                    <li><strong>Step 2 (Create Test File)</strong>: Inside your local project directory, create a new file named after the suggested test path (e.g., <code>backend/init_mysql.test.js</code>).</li>
                    <li><strong>Step 3 (Run Tests)</strong>: Open your terminal and run the test command shown below for that framework:
                      <ul style={{ marginTop: '0.3rem', marginLeft: '1rem', fontFamily: 'monospace', color: '#4ade80' }}>
                        <li>JavaScript / Node.js: <code>npx jest backend/init_mysql.test.js</code></li>
                        <li>Python: <code>pytest services/payment_service_test.py</code></li>
                        <li>Java: <code>mvn test -Dtest=UserControllerTest</code></li>
                      </ul>
                    </li>
                  </ol>
                </div>

                {/* Generated Test Files List */}
                {result.testSuites.unitTests.map((ts, idx) => (
                  <div key={idx} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#60a5fa' }}>
                          📄 Suggested Test File: <code>{ts.testFile}</code>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Target Source File: <code>{ts.targetFile}</code> • Tests Generated: <strong>{ts.testCount} Unit Tests</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyCode(ts.code, ts.id)}
                        style={{
                          background: copiedId === ts.id ? '#22c55e' : '#2563eb',
                          color: '#fff',
                          border: 'none',
                          padding: '0.45rem 0.9rem',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedId === ts.id ? '✅ Copied to Clipboard!' : '📋 Copy Test Code'}
                      </button>
                    </div>

                    <div style={{ background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #22c55e', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', color: '#4ade80', fontFamily: 'monospace', marginBottom: '0.75rem' }}>
                      ⚡ Terminal Run Command: <code>{ts.frameworkRunner || `npx jest ${ts.testFile}`}</code>
                    </div>

                    <pre style={{ background: '#0b0f19', border: '1px solid #1e293b', padding: '1rem', borderRadius: '6px', color: '#38bdf8', fontSize: '0.8rem', fontFamily: 'monospace', maxHeight: '250px', overflowY: 'auto' }}>
                      {ts.code}
                    </pre>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: SECURITY VULNERABILITIES */}
            {activeTab === 'security' && (
              <div style={{ background: '#1e293b', padding: '1.75rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    OWASP Security Audit Findings & Auto-Fix Patches
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Total Detected: <strong style={{ color: '#f87171' }}>{result.securityAudit.totalFound}</strong>
                  </span>
                </div>

                {result.securityAudit.vulnerabilities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    🎉 No security vulnerabilities detected in the scanned source files!
                  </div>
                ) : (
                  result.securityAudit.vulnerabilities.map((v, idx) => (
                    <div key={idx} style={{
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderLeft: v.severity === 'CRITICAL' ? '5px solid #ef4444' : v.severity === 'HIGH' ? '5px solid #f97316' : '5px solid #eab308',
                      borderRadius: '10px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            background: v.severity === 'CRITICAL' ? '#ef4444' : v.severity === 'HIGH' ? '#f97316' : '#eab308',
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px'
                          }}>
                            {v.severity}
                          </span>
                          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                            {v.type}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: '#1e293b', padding: '0.25rem 0.6rem', borderRadius: '4px', border: '1px solid #334155' }}>
                          {v.owasp}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                        📍 <strong>File Location:</strong> <code style={{ background: '#1e293b', color: '#60a5fa', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{v.filePath}:{v.line}</code>
                      </div>

                      <div style={{
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '6px',
                        padding: '0.85rem 1rem',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        color: '#93c5fd'
                      }}>
                        💡 <strong>Why is this a security risk?</strong><br />
                        {v.explanation || 'This pattern exposes sensitive logic or credentials to potential unauthorized access or injection attacks.'}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '0.4rem' }}>
                            🔴 Vulnerable Code (Current File)
                          </div>
                          <pre style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid #ef4444',
                            color: '#fca5a5',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            margin: 0
                          }}>
                            {v.codeSnippet || v.patch.original}
                          </pre>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80', marginBottom: '0.4rem' }}>
                            🟢 Suggested Security Fix (Recommended Patch)
                          </div>
                          <pre style={{
                            background: 'rgba(74, 222, 128, 0.1)',
                            border: '1px solid #22c55e',
                            color: '#86efac',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            margin: 0
                          }}>
                            {v.patch.fix}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: KNOWLEDGE GRAPH */}
            {activeTab === 'graph' && (
              <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', border: '1px solid #334155' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Code Knowledge Graph Representation (Nodes & Relationship Edges)</h3>
                <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.85rem', maxHeight: '350px', overflowY: 'auto' }}>
                  <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '0.5rem' }}>// Indexed Graph Nodes:</div>
                  {result.graphData.nodes.map(n => (
                    <div key={n.data.id} style={{ marginBottom: '0.3rem' }}>
                      <span style={{ color: '#c084fc' }}>[{n.data.type}]</span> {n.data.id}
                    </div>
                  ))}
                  <div style={{ color: '#60a5fa', fontWeight: 700, marginTop: '1rem', marginBottom: '0.5rem' }}>// Graph Edges (Dependencies & Coverage):</div>
                  {result.graphData.edges.map(e => (
                    <div key={e.data.id} style={{ marginBottom: '0.3rem' }}>
                      <span style={{ color: '#f472b6' }}>{e.data.source}</span> --[ <span style={{ color: '#4ade80' }}>{e.data.label}</span> ]--&gt; <span style={{ color: '#60a5fa' }}>{e.data.target}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
