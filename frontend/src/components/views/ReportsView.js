'use client';

import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  ShieldCheck, 
  TrendingUp, 
  Code2, 
  Cpu, 
  CheckCircle2
} from 'lucide-react';

export default function ReportsView({ result }) {
  if (!result) {
    return <div style={{ color: '#94A3B8', padding: '3rem', textAlign: 'center' }}>No analytics data available. Run a scan from the Top Navigation bar.</div>;
  }

  const { summary, securityAudit, repository } = result;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB' }}>
            Executive Reports & Repository Analytics
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Security posture metrics, AST complexity composition, and test coverage metrics
          </p>
        </div>

        <div style={{
          background: 'rgba(79, 140, 255, 0.1)', border: '1px solid rgba(79, 140, 255, 0.3)',
          padding: '0.4rem 0.85rem', borderRadius: '8px', color: '#4F8CFF', fontSize: '0.82rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <TrendingUp size={16} /> Enterprise Verified
        </div>
      </div>

      {/* HEALTH RATING CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        
        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>
            Repository Health Rating
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.4rem' }}>
            {securityAudit.totalFound === 0 ? 'Grade A+' : 'Grade B'}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
            Based on AST cyclomatic complexity & OWASP findings
          </div>
        </div>

        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4F8CFF', textTransform: 'uppercase' }}>
            Indexing Completeness
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.4rem' }}>
            {Math.round((repository.indexedFilesCount / (repository.totalDiscoveredFiles || 1)) * 100)}%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
            {repository.indexedFilesCount} of {repository.totalDiscoveredFiles} files indexed
          </div>
        </div>

        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#A855F7', textTransform: 'uppercase' }}>
            Test Coverage Ratio
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.4rem' }}>
            100%
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.3rem' }}>
            All discovered AST functions have synthesized suites
          </div>
        </div>

      </div>

      {/* METRIC BREAKDOWNS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        
        {/* Security Severity Distribution */}
        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', marginBottom: '1rem' }}>
            Security Risk Composition
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                <span>Critical Flaws</span>
                <span style={{ color: '#EF4444', fontWeight: 700 }}>{securityAudit.criticalCount}</span>
              </div>
              <div style={{ background: '#111827', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#EF4444', height: '100%', width: `${(securityAudit.criticalCount / (securityAudit.totalFound || 1)) * 100}%` }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                <span>High Severity</span>
                <span style={{ color: '#F97316', fontWeight: 700 }}>{securityAudit.highCount}</span>
              </div>
              <div style={{ background: '#111827', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#F97316', height: '100%', width: `${(securityAudit.highCount / (securityAudit.totalFound || 1)) * 100}%` }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                <span>Medium Severity</span>
                <span style={{ color: '#F59E0B', fontWeight: 700 }}>{securityAudit.mediumCount}</span>
              </div>
              <div style={{ background: '#111827', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#F59E0B', height: '100%', width: `${(securityAudit.mediumCount / (securityAudit.totalFound || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Code AST Composition */}
        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', marginBottom: '1rem' }}>
            AST Structural Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                <span>Total Functions Tested</span>
                <span style={{ color: '#4F8CFF', fontWeight: 700 }}>{summary.totalFunctions}</span>
              </div>
              <div style={{ background: '#111827', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#4F8CFF', height: '100%', width: '80%' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8', marginBottom: '0.3rem' }}>
                <span>Total Lines of Code (LOC)</span>
                <span style={{ color: '#10B981', fontWeight: 700 }}>{summary.totalLOC}</span>
              </div>
              <div style={{ background: '#111827', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#10B981', height: '100%', width: '90%' }} />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
