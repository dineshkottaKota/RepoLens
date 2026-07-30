'use client';

import React from 'react';
import { 
  TestTube2, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  ArrowUpRight
} from 'lucide-react';

export default function TestGenerationView({ result, setSelectedTestSuite }) {
  if (!result) {
    return <div style={{ color: '#94A3B8', padding: '3rem', textAlign: 'center' }}>No test generation data available. Run a scan from the Top Navigation bar.</div>;
  }

  const { testSuites } = result;
  const unitTests = testSuites.unitTests || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB' }}>
            Synthesized Test Suites
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Automated unit and integration test synthesis targeting AST functions
          </p>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.4rem 0.85rem', borderRadius: '8px', color: '#34D399', fontSize: '0.82rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <CheckCircle2 size={16} /> Ready for Execution
        </div>
      </div>

      {/* KPI METRICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        
        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Generated Test Suites
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.3rem' }}>
            {unitTests.length}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Executable unit test files</div>
        </div>

        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#4F8CFF', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            AST Functions Covered
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.3rem' }}>
            {result.summary.totalFunctions}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Extracted methods tested</div>
        </div>

        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#A855F7', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Test Assertions
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.3rem' }}>
            {unitTests.reduce((acc, ts) => acc + ts.testCount, 0)}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Valid & boundary null assertions</div>
        </div>

      </div>

      {/* TEST SUITES LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {unitTests.map((ts, idx) => (
          <div
            key={idx}
            style={{
              background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
            className="card-hover"
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                <TestTube2 size={20} color="#10B981" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
                  {ts.testFile}
                </h3>
              </div>

              <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                Target Source File: <code style={{ color: '#4F8CFF' }}>{ts.targetFile}</code> • Tested Functions: <strong>{ts.functionsTested.join(', ') || 'All Functions'}</strong>
              </div>

              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.75rem',
                background: '#111827', border: '1px solid #293548', padding: '0.35rem 0.75rem',
                borderRadius: '6px', fontSize: '0.8rem', color: '#34D399', fontFamily: 'monospace'
              }}>
                <Terminal size={14} /> CLI Runner: <code>{ts.frameworkRunner}</code>
              </div>
            </div>

            <button
              onClick={() => setSelectedTestSuite(ts)}
              style={{
                background: 'linear-gradient(135deg, #4F8CFF 0%, #3B7BF0 100%)',
                color: '#FFFFFF', border: 'none', padding: '0.65rem 1.25rem',
                borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                boxShadow: '0 4px 12px rgba(79, 140, 255, 0.3)'
              }}
            >
              Open Editor <ArrowUpRight size={16} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
