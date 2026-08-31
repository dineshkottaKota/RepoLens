'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ShieldAlert, 
  TestTube2, 
  Network, 
  Terminal, 
  Download,
  Maximize2,
  Minimize2,
  FileCode2,
  Code2,
  Layers,
  Route,
  ChevronRight
} from 'lucide-react';

export default function RightDrawer({
  selectedVulnerability,
  setSelectedVulnerability,
  selectedTestSuite,
  setSelectedTestSuite,
  selectedNode,
  setSelectedNode
}) {
  const [copied, setCopied] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename, content) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const closeDrawer = () => {
    setSelectedVulnerability(null);
    setSelectedTestSuite(null);
    setSelectedNode(null);
    setIsMaximized(false);
    setShowRawJson(false);
  };

  const isOpen = Boolean(selectedVulnerability || selectedTestSuite || selectedNode);

  if (!isOpen) return null;

  // Determine Node Category for selectedNode
  const isTestCaseNode = selectedNode && (selectedNode.data.type === 'TestCaseNode' || selectedNode.data.code);
  const isVulnNode = selectedNode && (selectedNode.data.type === 'VulnerabilityNode' || selectedNode.data.severity);

  // Normalize test suite data whether from selectedTestSuite OR selectedNode (TestCaseNode)
  const activeTestObj = selectedTestSuite || (isTestCaseNode ? {
    testFile: selectedNode.data.testFile || selectedNode.data.name || 'test_suite.test.js',
    targetFile: selectedNode.data.targetFile || selectedNode.data.file || 'source_file.js',
    code: selectedNode.data.code || '// No test code available',
    testCount: selectedNode.data.testCount || 1,
    frameworkRunner: (selectedNode.data.testFile || '').endsWith('.py') 
      ? `pytest ${selectedNode.data.testFile}` 
      : (selectedNode.data.testFile || '').endsWith('.java')
      ? `mvn test -Dtest=${selectedNode.data.testFile}`
      : `npx jest ${selectedNode.data.testFile || 'test.js'}`
  } : null);

  // Normalize vulnerability data whether from selectedVulnerability OR selectedNode (VulnerabilityNode)
  const activeVulnObj = selectedVulnerability || (isVulnNode ? {
    vulnId: selectedNode.data.vulnId || selectedNode.data.id || 'vuln-1',
    type: selectedNode.data.vulnCategory || selectedNode.data.name?.replace(/^\[[^\]]+\]\s*/, '') || selectedNode.data.type || 'Security Vulnerability Risk',
    severity: selectedNode.data.severity || 'HIGH',
    owasp: selectedNode.data.owasp || 'A00:2021-Security Risk',
    filePath: selectedNode.data.filePath || selectedNode.data.file || 'source_file',
    line: selectedNode.data.line || 1,
    explanation: selectedNode.data.explanation || 'Exposes sensitive application logic or authentication credentials to potential unauthorized access or injection attacks.',
    codeSnippet: selectedNode.data.codeSnippet || (typeof selectedNode.data.patch === 'object' ? selectedNode.data.patch?.original : '') || selectedNode.data.name || '// Vulnerable code snippet',
    patch: typeof selectedNode.data.patch === 'object' && selectedNode.data.patch !== null ? selectedNode.data.patch : {
      original: selectedNode.data.codeSnippet || selectedNode.data.name || '// Vulnerable code snippet',
      fix: typeof selectedNode.data.patch === 'string' ? selectedNode.data.patch : '// Recommended Auto-Fix Patch'
    }
  } : null);

  const drawerWidth = isMaximized ? 'calc(100vw - 280px)' : '820px';

  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      right: 0,
      width: drawerWidth,
      height: 'calc(100vh - 60px)',
      background: '#111827',
      borderLeft: '1px solid #293548',
      boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.65)',
      zIndex: 50,
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    }} className="animate-slide-in">
      
      {/* DRAWER HEADER */}
      <div style={{
        padding: '1.25rem 1.75rem',
        borderBottom: '1px solid #293548',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        background: '#1A2234'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeVulnObj && <ShieldAlert size={22} color="#EF4444" />}
          {activeTestObj && <TestTube2 size={22} color="#10B981" />}
          {selectedNode && !isTestCaseNode && !isVulnNode && <Network size={22} color="#4F8CFF" />}

          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F9FAFB' }}>
            {activeVulnObj && 'Vulnerability Risk & Patch Remediation'}
            {activeTestObj && `Generated Code Viewer: ${activeTestObj.testFile}`}
            {selectedNode && !isTestCaseNode && !isVulnNode && `${selectedNode.data.type} Inspector`}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Maximize / Restore Toggle */}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            title={isMaximized ? 'Restore Drawer' : 'Expand Fullscreen'}
            style={{
              background: '#090E18',
              border: '1px solid #293548',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}
          >
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>

          <button
            onClick={closeDrawer}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* DRAWER CONTENT */}
      <div style={{ padding: '1.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* 1. VULNERABILITY DRAWER VIEW (from selectedVulnerability OR VulnerabilityNode) */}
        {activeVulnObj && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{
                background: activeVulnObj.severity === 'CRITICAL' ? '#EF4444' : activeVulnObj.severity === 'HIGH' ? '#F97316' : '#F59E0B',
                color: '#FFFFFF', fontWeight: 900, fontSize: '0.8rem', padding: '0.3rem 0.85rem',
                borderRadius: '6px', letterSpacing: '0.05em'
              }}>
                {activeVulnObj.severity} SEVERITY
              </span>

              <span style={{ fontSize: '0.82rem', color: '#94A3B8', background: '#1A2234', padding: '0.35rem 0.85rem', borderRadius: '6px', border: '1px solid #293548' }}>
                {activeVulnObj.owasp}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F9FAFB', marginBottom: '0.35rem' }}>
                {activeVulnObj.type}
              </h4>
              <div style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                📍 File Location: <code style={{ color: '#4F8CFF', background: '#1A2234', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{activeVulnObj.filePath}:{activeVulnObj.line}</code>
              </div>
            </div>

            <div style={{
              background: 'rgba(79, 140, 255, 0.08)', border: '1px solid rgba(79, 140, 255, 0.25)',
              borderRadius: '10px', padding: '1.15rem', fontSize: '0.92rem', color: '#93C5FD', lineHeight: 1.6
            }}>
              <strong style={{ color: '#F9FAFB', display: 'block', marginBottom: '0.4rem' }}>💡 Risk Explanation:</strong>
              {activeVulnObj.explanation}
            </div>

            {/* SIDE BY SIDE PATCH COMPARISON */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EF4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>🔴</span> Vulnerable Source Code
                </div>
                <pre style={{
                  background: 'rgba(239, 68, 68, 0.08)', border: '1px solid #EF4444',
                  color: '#FCA5A5', padding: '1.1rem', borderRadius: '8px',
                  fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', minHeight: '160px'
                }}>
                  {activeVulnObj.codeSnippet || (typeof activeVulnObj.patch === 'object' ? activeVulnObj.patch?.original : activeVulnObj.patch) || '// Vulnerable code snippet'}
                </pre>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10B981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span>🟢</span> Recommended Auto-Fix Patch
                </div>
                <pre style={{
                  background: 'rgba(16, 185, 129, 0.08)', border: '1px solid #10B981',
                  color: '#6EE7B7', padding: '1.1rem', borderRadius: '8px',
                  fontFamily: 'monospace', fontSize: '0.85rem', whiteSpace: 'pre-wrap', minHeight: '160px'
                }}>
                  {typeof activeVulnObj.patch === 'string' ? activeVulnObj.patch : (activeVulnObj.patch?.fix || '// Recommended Auto-Fix Patch')}
                </pre>
              </div>

            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => handleCopy(typeof activeVulnObj.patch === 'string' ? activeVulnObj.patch : (activeVulnObj.patch?.fix || ''))}
                style={{
                  flex: 1, padding: '0.8rem', borderRadius: '9px', border: 'none',
                  background: copied ? '#10B981' : '#4F8CFF', color: '#FFFFFF',
                  fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                }}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Patch Copied to Clipboard!' : 'Copy Fix Patch'}
              </button>

              <button
                onClick={() => handleDownload(`${activeVulnObj.vulnId || 'vuln'}-fix.patch`, typeof activeVulnObj.patch === 'string' ? activeVulnObj.patch : (activeVulnObj.patch?.fix || ''))}
                style={{
                  padding: '0.8rem 1.25rem', borderRadius: '9px', border: '1px solid #293548',
                  background: '#1A2234', color: '#F9FAFB', fontWeight: 600, fontSize: '0.9rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <Download size={18} />
                Download Patch
              </button>
            </div>

          </div>
        )}

        {/* 2. TEST SUITE / TEST CASE NODE DRAWER VIEW (from selectedTestSuite OR TestCaseNode) */}
        {!activeVulnObj && activeTestObj && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>
                  Synthesized Unit Test Suite
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#F9FAFB' }}>
                  {activeTestObj.testFile}
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                  Target Source File: <code style={{ color: '#4F8CFF' }}>{activeTestObj.targetFile}</code>
                </div>
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', color: '#34D399',
                fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}>
                <Terminal size={15} /> CLI Runner: <code>{activeTestObj.frameworkRunner}</code>
              </div>
            </div>

            {/* VS CODE CODE EDITOR CONTAINER */}
            <div style={{
              borderRadius: '12px', overflow: 'hidden', border: '1px solid #293548',
              flex: 1, display: 'flex', flexDirection: 'column'
            }}>
              <div style={{ background: '#1A2234', padding: '0.65rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                  <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
                  <span style={{ height: '10px', width: '10px', borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ color: '#94A3B8', fontSize: '0.82rem', fontFamily: 'monospace', marginLeft: '0.5rem' }}>
                    {activeTestObj.testFile}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleCopy(activeTestObj.code)}
                    style={{
                      background: copied ? '#10B981' : '#4F8CFF', color: '#FFFFFF',
                      border: 'none', padding: '0.4rem 0.85rem', borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.35rem'
                    }}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Code'}
                  </button>

                  <button
                    onClick={() => handleDownload(activeTestObj.testFile.split('/').pop(), activeTestObj.code)}
                    style={{
                      background: '#090E18', border: '1px solid #293548', color: '#F9FAFB',
                      padding: '0.4rem 0.85rem', borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.35rem'
                    }}
                  >
                    <Download size={15} />
                    Download File
                  </button>
                </div>
              </div>

              <pre style={{
                background: '#060A12', color: '#38BDF8', padding: '1.5rem', margin: 0,
                fontSize: '0.88rem', fontFamily: 'monospace', lineHeight: 1.6,
                flex: 1, minHeight: '450px', overflowY: 'auto'
              }}>
                {activeTestObj.code}
              </pre>
            </div>

          </div>
        )}

        {/* 3. OTHER KNOWLEDGE GRAPH NODES (FileNode, FunctionNode, EndpointNode, ClassNode) */}
        {!activeVulnObj && !activeTestObj && selectedNode && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{
                  fontSize: '0.78rem', fontWeight: 800, color: '#4F8CFF', textTransform: 'uppercase',
                  background: 'rgba(79, 140, 255, 0.12)', padding: '0.25rem 0.7rem', borderRadius: '5px'
                }}>
                  {selectedNode.data.type}
                </span>
                <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#F9FAFB', marginTop: '0.45rem' }}>
                  {selectedNode.data.name || selectedNode.data.path || selectedNode.data.id}
                </h4>
              </div>

              <button
                onClick={() => setShowRawJson(!showRawJson)}
                style={{
                  background: '#1A2234', border: '1px solid #293548', color: '#94A3B8',
                  padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {showRawJson ? 'Hide JSON' : 'Inspect Raw JSON'}
              </button>
            </div>

            {/* STRUCTURED NODE DETAILS CARD */}
            <div style={{
              background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.35rem',
              display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>
              {selectedNode.data.file && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#94A3B8' }}>File Path:</span>
                  <code style={{ color: '#4F8CFF' }}>{selectedNode.data.file || selectedNode.data.path}</code>
                </div>
              )}

              {selectedNode.data.language && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#94A3B8' }}>Language:</span>
                  <span style={{ color: '#A855F7', fontWeight: 700, textTransform: 'uppercase' }}>{selectedNode.data.language}</span>
                </div>
              )}

              {selectedNode.data.loc !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#94A3B8' }}>Lines of Code (LOC):</span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>{selectedNode.data.loc} LOC</span>
                </div>
              )}

              {selectedNode.data.complexity !== undefined && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#94A3B8' }}>Cyclomatic Complexity:</span>
                  <span style={{ color: selectedNode.data.complexity > 5 ? '#F59E0B' : '#10B981', fontWeight: 700 }}>
                    {selectedNode.data.complexity} ({selectedNode.data.complexity > 5 ? 'Moderate' : 'Low Complexity'})
                  </span>
                </div>
              )}

              {selectedNode.data.params !== undefined && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.88rem' }}>
                  <span style={{ color: '#94A3B8' }}>Parameter Signature:</span>
                  <code style={{ background: '#090E18', padding: '0.5rem 0.75rem', borderRadius: '6px', color: '#38BDF8' }}>
                    ({selectedNode.data.params || 'void'})
                  </code>
                </div>
              )}

              {selectedNode.data.method && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#94A3B8' }}>HTTP Method:</span>
                  <span style={{ background: '#06B6D4', color: '#FFF', fontWeight: 900, fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                    {selectedNode.data.method}
                  </span>
                </div>
              )}

              {selectedNode.data.path && selectedNode.data.type === 'EndpointNode' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: '#94A3B8' }}>Route Endpoint:</span>
                  <code style={{ color: '#34D399' }}>{selectedNode.data.path}</code>
                </div>
              )}
            </div>

            {/* RAW JSON TOGGLE */}
            {showRawJson && (
              <pre style={{
                background: '#060A12', border: '1px solid #293548', color: '#38BDF8',
                padding: '1.35rem', borderRadius: '10px', fontFamily: 'monospace',
                fontSize: '0.85rem', whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto'
              }}>
                {JSON.stringify(selectedNode.data, null, 2)}
              </pre>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
