'use client';

import React, { useState, useMemo } from 'react';

export default function PlatformDashboard() {
  const [repoUrl, setRepoUrl] = useState('https://github.com/expressjs/express');
  const [branch, setBranch] = useState('master');
  const [maxTokenBudget, setMaxTokenBudget] = useState(6000);
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tests');
  const [copiedId, setCopiedId] = useState(null);

  // Graph Filter State
  const [nodeFilter, setNodeFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);

  const handleIngest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSelectedNode(null);

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

  // Filter Graph Nodes
  const filteredNodes = useMemo(() => {
    if (!result || !result.graphData) return [];
    if (nodeFilter === 'ALL') return result.graphData.nodes;
    return result.graphData.nodes.filter(n => n.data.type === nodeFilter);
  }, [result, nodeFilter]);

  // Color Mapping Helper
  const getNodeColor = (type) => {
    switch (type) {
      case 'FileNode': return '#3b82f6';
      case 'FunctionNode': return '#a855f7';
      case 'EndpointNode': return '#06b6d4';
      case 'VulnerabilityNode': return '#ef4444';
      case 'TestCaseNode': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #111827 0%, #030712 100%)',
      color: '#f3f4f6',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '2.5rem 1.5rem',
      position: 'relative'
    }}>
      {/* Background Ambient Glows */}
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: '1000px', height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 50%, transparent 100%)',
        pointerEvents: 'none', filter: 'blur(80px)', zIndex: 0
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* HEADER BRANDING */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)',
            color: '#818cf8', padding: '0.4rem 1rem', borderRadius: '999px',
            fontSize: '0.85rem', fontWeight: 600, backdropFilter: 'blur(10px)', marginBottom: '1rem'
          }}>
            <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 10px #22c55e' }} />
            Enterprise Code Intelligence & Security Orchestrator
          </div>

          <h1 style={{
            fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            margin: '0.5rem 0 1rem 0', lineHeight: 1.15
          }}>
            GitHub AI Agent Platform
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
            Ingests GitHub repositories, builds an Abstract Syntax Tree (AST) Code Knowledge Graph, executes Graph-RAG token management, runs OWASP security auditing, and synthesizes runnable unit & integration test suites.
          </p>
        </div>

        {/* REPOSITORY SCAN INPUT CARD */}
        <div style={{
          background: 'rgba(17, 24, 39, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          padding: '1.75rem',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          marginBottom: '2.5rem'
        }}>
          <form onSubmit={handleIngest} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1.5fr 1.2fr 1.2fr', gap: '1.2rem', alignItems: 'end' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem' }}>
                🔗 GitHub Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                required
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                  border: '1px solid #374151', background: '#090d16', color: '#fff',
                  fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem' }}>
                🌿 Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                  border: '1px solid #374151', background: '#090d16', color: '#fff',
                  fontSize: '0.9rem', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem' }}>
                🔑 OpenAI API Key (Optional)
              </label>
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                  border: '1px solid #374151', background: '#090d16', color: '#fff',
                  fontSize: '0.9rem', outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.5rem' }}>
                ⚡ Graph-RAG Limit
              </label>
              <select
                value={maxTokenBudget}
                onChange={(e) => setMaxTokenBudget(e.target.value)}
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                  border: '1px solid #374151', background: '#090d16', color: '#fff',
                  fontSize: '0.9rem', outline: 'none', cursor: 'pointer'
                }}
              >
                <option value={4000}>4,000 Tokens (Strict)</option>
                <option value={6000}>6,000 Tokens (Standard)</option>
                <option value={12000}>12,000 Tokens (Extended)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.85rem 1.2rem', borderRadius: '10px',
                background: loading ? '#4b5563' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem', border: 'none',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99, 102, 241, 0.4)',
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'transform 0.1s'
              }}
            >
              {loading ? '⏳ Ingesting Repository...' : '🚀 Execute Agent Pipeline'}
            </button>
          </form>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171', padding: '1.25rem', borderRadius: '12px', marginBottom: '2rem',
            display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600
          }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, color: '#fca5a5' }}>Pipeline Error</div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.2rem' }}>{error}</div>
            </div>
          </div>
        )}

        {/* RESULTS SECTION */}
        {result && (
          <div>
            {/* STAT CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
              
              <div style={{
                background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.3)',
                borderTop: '4px solid #3b82f6', borderRadius: '14px', padding: '1.4rem', backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Repository
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '0.4rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {result.repository.owner}/{result.repository.repo}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  Discovered {result.repository.totalDiscoveredFiles} files • {result.repository.indexedFilesCount} indexed
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(168, 85, 247, 0.3)',
                borderTop: '4px solid #a855f7', borderRadius: '14px', padding: '1.4rem', backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Code Knowledge Graph
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginTop: '0.3rem' }}>
                  {result.graphData.nodes.length} <span style={{ fontSize: '0.9rem', color: '#c084fc', fontWeight: 600 }}>Nodes</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  {result.graphData.edges.length} Dependency Edges • {result.summary.totalLOC} LOC
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(239, 68, 68, 0.3)',
                borderTop: '4px solid #ef4444', borderRadius: '14px', padding: '1.4rem', backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Security Audit Findings
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginTop: '0.3rem' }}>
                  {result.summary.securityVulnerabilities} <span style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: 600 }}>Vulnerabilities</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  {result.securityAudit.criticalCount} Critical • {result.securityAudit.highCount} High Severity
                </div>
              </div>

              <div style={{
                background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(16, 185, 129, 0.3)',
                borderTop: '4px solid #10b981', borderRadius: '14px', padding: '1.4rem', backdropFilter: 'blur(10px)'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Synthesized Test Suites
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', marginTop: '0.3rem' }}>
                  {result.summary.unitTestsGenerated} <span style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600 }}>Test Suites</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  Generated for {result.summary.totalFunctions} discovered AST functions
                </div>
              </div>

            </div>

            {/* SEGMENTED TAB CONTROLS */}
            <div style={{
              display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '0.4rem',
              borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '2rem'
            }}>
              <button
                onClick={() => setActiveTab('tests')}
                style={{
                  flex: 1, padding: '0.75rem 1.2rem', borderRadius: '8px', border: 'none',
                  background: activeTab === 'tests' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                  color: activeTab === 'tests' ? '#ffffff' : '#94a3b8', fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'tests' ? '0 4px 15px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                🧪 Synthesized Unit Test Cases ({result.testSuites.unitTests.length})
              </button>

              <button
                onClick={() => setActiveTab('security')}
                style={{
                  flex: 1, padding: '0.75rem 1.2rem', borderRadius: '8px', border: 'none',
                  background: activeTab === 'security' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                  color: activeTab === 'security' ? '#ffffff' : '#94a3b8', fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'security' ? '0 4px 15px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                🛡️ OWASP Security Findings ({result.securityAudit.totalFound})
              </button>

              <button
                onClick={() => setActiveTab('graph')}
                style={{
                  flex: 1, padding: '0.75rem 1.2rem', borderRadius: '8px', border: 'none',
                  background: activeTab === 'graph' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'transparent',
                  color: activeTab === 'graph' ? '#ffffff' : '#94a3b8', fontWeight: 700, fontSize: '0.9rem',
                  cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'graph' ? '0 4px 15px rgba(37, 99, 235, 0.3)' : 'none'
                }}
              >
                🌐 Code Knowledge Graph ({result.graphData.nodes.length})
              </button>
            </div>

            {/* TAB 1: SYNTHESIZED TESTS */}
            {activeTab === 'tests' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(20px)' }}>
                
                {/* Developer Instructions Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem'
                }}>
                  <div style={{ fontWeight: 800, color: '#818cf8', fontSize: '1rem', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>📖</span> Developer Execution Guide: How to run generated tests in your project
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <strong style={{ color: '#60a5fa' }}>1. Copy Code:</strong> Click <code>📋 Copy Code</code> on any synthesized test suite below.
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <strong style={{ color: '#60a5fa' }}>2. Save File:</strong> Create the file at the suggested path in your repo.
                    </div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <strong style={{ color: '#60a5fa' }}>3. Execute:</strong> Run <code>npx jest &lt;path&gt;</code> or <code>pytest</code> in terminal.
                    </div>
                  </div>
                </div>

                {/* TEST SUITES CARDS */}
                {result.testSuites.unitTests.map((ts, idx) => (
                  <div key={idx} style={{
                    background: '#090d16', border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px', padding: '1.5rem', marginBottom: '1.75rem', overflow: 'hidden'
                  }}>
                    
                    {/* Header Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span>📄</span> Suggested Test File: <code style={{ color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>{ts.testFile}</code>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                          Target Source File: <code>{ts.targetFile}</code> • Tested AST Symbols: <strong>{ts.functionsTested.join(', ') || 'All Functions'}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopyCode(ts.code, ts.id)}
                        style={{
                          background: copiedId === ts.id ? '#16a34a' : '#2563eb',
                          color: '#fff', border: 'none', padding: '0.55rem 1.1rem',
                          borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
                          cursor: 'pointer', boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
                          transition: 'all 0.2s'
                        }}
                      >
                        {copiedId === ts.id ? '✅ Copied to Clipboard!' : '📋 Copy Test Code'}
                      </button>
                    </div>

                    {/* Terminal Command Runner Box */}
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)',
                      padding: '0.65rem 1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#34d399',
                      fontFamily: "'Fira Code', monospace", marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <span>⚡</span> Terminal Command: <code>{ts.frameworkRunner || `npx jest ${ts.testFile}`}</code>
                    </div>

                    {/* Styled IDE Code Block */}
                    <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #1e293b' }}>
                      <div style={{ background: '#1e293b', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
                        <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
                        <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                        <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontFamily: 'monospace', marginLeft: '0.5rem' }}>{ts.testFile}</span>
                      </div>
                      <pre style={{
                        background: '#030712', color: '#38bdf8', padding: '1.25rem', margin: 0,
                        fontSize: '0.85rem', fontFamily: "'Fira Code', monospace", lineHeight: 1.5,
                        maxHeight: '300px', overflowY: 'auto'
                      }}>
                        {ts.code}
                      </pre>
                    </div>

                  </div>
                ))}

              </div>
            )}

            {/* TAB 2: OWASP SECURITY FINDINGS */}
            {activeTab === 'security' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(20px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    🛡️ OWASP Security Findings & Auto-Fix Git Patches
                  </h3>
                  <span style={{ fontSize: '0.9rem', color: '#94a3b8', background: '#0f172a', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    Total Identified: <strong style={{ color: '#f87171' }}>{result.securityAudit.totalFound} Findings</strong>
                  </span>
                </div>

                {result.securityAudit.vulnerabilities.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8', background: '#090d16', borderRadius: '12px', border: '1px dashed #334155' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>Zero Security Vulnerabilities Detected!</div>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.4rem' }}>No hardcoded secrets, SQL injections, or OWASP flaws found in scanned files.</div>
                  </div>
                ) : (
                  result.securityAudit.vulnerabilities.map((v, idx) => (
                    <div key={idx} style={{
                      background: '#090d16',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderLeft: v.severity === 'CRITICAL' ? '5px solid #ef4444' : v.severity === 'HIGH' ? '5px solid #f97316' : '5px solid #eab308',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      marginBottom: '1.75rem'
                    }}>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          <span style={{
                            background: v.severity === 'CRITICAL' ? '#ef4444' : v.severity === 'HIGH' ? '#f97316' : '#eab308',
                            color: '#fff', fontWeight: 900, fontSize: '0.75rem', padding: '0.25rem 0.75rem',
                            borderRadius: '6px', letterSpacing: '0.05em'
                          }}>
                            {v.severity}
                          </span>
                          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f3f4f6' }}>
                            {v.type}
                          </span>
                        </div>

                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', background: '#1e293b', padding: '0.3rem 0.7rem', borderRadius: '6px', border: '1px solid #334155' }}>
                          {v.owasp}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                        📍 <strong>Vulnerable File Location:</strong> <code style={{ background: '#1e293b', color: '#60a5fa', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>{v.filePath}:{v.line}</code>
                      </div>

                      <div style={{
                        background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#93c5fd', lineHeight: 1.5
                      }}>
                        💡 <strong>Security Risk Explanation:</strong><br />
                        {v.explanation || 'Exposes sensitive application logic or authentication credentials to potential unauthorized access or injection attacks.'}
                      </div>

                      {/* SIDE-BY-SIDE DIFF COMPARISON */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        
                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>🔴</span> Vulnerable Code Snippet (Current File)
                          </div>
                          <pre style={{
                            background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444',
                            color: '#fca5a5', padding: '1rem', borderRadius: '8px',
                            fontFamily: "'Fira Code', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap', margin: 0
                          }}>
                            {v.codeSnippet || v.patch.original}
                          </pre>
                        </div>

                        <div>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>🟢</span> Recommended Auto-Fix Patch (Security Patch)
                          </div>
                          <pre style={{
                            background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10b981',
                            color: '#6ee7b7', padding: '1rem', borderRadius: '8px',
                            fontFamily: "'Fira Code', monospace", fontSize: '0.85rem', whiteSpace: 'pre-wrap', margin: 0
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

            {/* TAB 3: VISUAL CODE KNOWLEDGE GRAPH */}
            {activeTab === 'graph' && (
              <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '2rem', backdropFilter: 'blur(20px)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                      🌐 Visual Code Knowledge Graph Canvas
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0.3rem 0 0 0' }}>
                      Interactive topological graph displaying file structure, AST symbols, REST endpoint routes, and security risk nodes.
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div style={{ display: 'flex', gap: '0.5rem', background: '#090d16', padding: '0.3rem', borderRadius: '8px', border: '1px solid #334155' }}>
                    {['ALL', 'FileNode', 'FunctionNode', 'EndpointNode', 'VulnerabilityNode', 'TestCaseNode'].map(filter => (
                      <button
                        key={filter}
                        onClick={() => setNodeFilter(filter)}
                        style={{
                          background: nodeFilter === filter ? '#2563eb' : 'transparent',
                          color: nodeFilter === filter ? '#fff' : '#94a3b8',
                          border: 'none', padding: '0.35rem 0.7rem', borderRadius: '6px',
                          fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                        }}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GRAPH VISUAL CANVAS */}
                <div style={{
                  background: '#030712', border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px', padding: '1.5rem', minHeight: '400px',
                  display: 'grid', gridTemplateColumns: selectedNode ? '2.5fr 1fr' : '1fr', gap: '1.5rem'
                }}>
                  
                  {/* Visual Node Grid Canvas */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignContent: 'flex-start', maxHeight: '450px', overflowY: 'auto', padding: '0.5rem' }}>
                    {filteredNodes.map(node => {
                      const color = getNodeColor(node.data.type);
                      const isSelected = selectedNode?.data.id === node.data.id;

                      return (
                        <div
                          key={node.data.id}
                          onClick={() => setSelectedNode(node)}
                          style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            border: isSelected ? `2px solid ${color}` : '1px solid rgba(255, 255, 255, 0.1)',
                            borderLeft: `5px solid ${color}`,
                            borderRadius: '10px',
                            padding: '0.85rem 1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? `0 0 20px ${color}66` : 'none',
                            maxWidth: '300px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: color }} />
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color, textTransform: 'uppercase' }}>
                              {node.data.type}
                            </span>
                          </div>

                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f3f4f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {node.data.name || node.data.path || node.data.id}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                            {node.data.file ? `File: ${node.data.file}` : node.data.language ? `Lang: ${node.data.language}` : `ID: ${node.data.id}`}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Node Inspector Side Panel */}
                  {selectedNode && (
                    <div style={{
                      background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px', padding: '1.25rem', fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div style={{ fontWeight: 800, color: getNodeColor(selectedNode.data.type) }}>
                          {selectedNode.data.type} Inspector
                        </div>
                        <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
                      </div>

                      <pre style={{
                        background: '#030712', color: '#38bdf8', padding: '1rem',
                        borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem',
                        whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto'
                      }}>
                        {JSON.stringify(selectedNode.data, null, 2)}
                      </pre>
                    </div>
                  )}

                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
