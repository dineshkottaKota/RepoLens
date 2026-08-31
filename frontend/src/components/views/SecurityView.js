'use client';

import React from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  ArrowUpRight, 
  FileCode2, 
  CheckCircle2
} from 'lucide-react';

export default function SecurityView({ result, setSelectedVulnerability }) {
  if (!result) {
    return <div style={{ color: '#94A3B8', padding: '3rem', textAlign: 'center' }}>No security audit data available. Run a scan from the Top Navigation bar.</div>;
  }

  const { securityAudit } = result;
  const vulnerabilities = securityAudit.vulnerabilities || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB' }}>
            OWASP Security Audit & Vulnerabilities
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Static analysis SAST auditing and AI contextual risk detection
          </p>
        </div>

        <div style={{
          background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '0.4rem 0.85rem', borderRadius: '8px', color: '#34D399', fontSize: '0.82rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: '0.4rem'
        }}>
          <ShieldCheck size={16} /> OWASP Top 10 Coverage Enforced
        </div>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
        
        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Critical Flaws
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.3rem' }}>
            {securityAudit.criticalCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Immediate remediation required</div>
        </div>

        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#F97316', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            High Severity
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.3rem' }}>
            {securityAudit.highCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Potential security exploit risks</div>
        </div>

        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#F59E0B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Medium Severity
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB', marginTop: '0.3rem' }}>
            {securityAudit.mediumCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Configuration misalignments</div>
        </div>

        <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Security Score
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10B981', marginTop: '0.3rem' }}>
            {securityAudit.totalFound === 0 ? '100 / 100' : `${Math.max(40, 100 - securityAudit.totalFound * 15)} / 100`}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>Automated health rating</div>
        </div>

      </div>

      {/* VULNERABILITY DATA TABLE */}
      <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', overflow: 'hidden' }}>
        
        {vulnerabilities.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94A3B8' }}>
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F9FAFB' }}>Zero Security Vulnerabilities Detected!</h3>
            <p style={{ fontSize: '0.88rem', marginTop: '0.3rem' }}>No hardcoded secrets, SQL injections, or OWASP flaws found in scanned files.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#111827', borderBottom: '1px solid #293548', color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '1rem 1.25rem' }}>Severity</th>
                <th style={{ padding: '1rem 1.25rem' }}>Vulnerability Rule</th>
                <th style={{ padding: '1rem 1.25rem' }}>File & Location</th>
                <th style={{ padding: '1rem 1.25rem' }}>OWASP Category</th>
                <th style={{ padding: '1rem 1.25rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vulnerabilities.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #293548', transition: 'background 0.15s' }} className="card-hover">
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{
                      background: v.severity === 'CRITICAL' ? '#EF4444' : v.severity === 'HIGH' ? '#F97316' : '#F59E0B',
                      color: '#FFF', fontWeight: 900, fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '4px'
                    }}>
                      {v.severity}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem', fontWeight: 700, color: '#F9FAFB' }}>
                    {v.type}
                  </td>

                  <td style={{ padding: '1rem 1.25rem', color: '#94A3B8' }}>
                    <code>{v.filePath}:{v.line}</code>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', background: '#111827', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #293548' }}>
                      {v.owasp}
                    </span>
                  </td>

                  <td style={{ padding: '1rem 1.25rem' }}>
                    <button
                      onClick={() => setSelectedVulnerability(v)}
                      style={{
                        background: 'rgba(79, 140, 255, 0.12)', border: '1px solid rgba(79, 140, 255, 0.3)',
                        color: '#4F8CFF', fontWeight: 700, fontSize: '0.78rem', padding: '0.35rem 0.8rem',
                        borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem'
                      }}
                    >
                      Inspect & Fix <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

    </div>
  );
}
