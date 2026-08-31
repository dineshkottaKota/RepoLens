'use client';

import React from 'react';
import { 
  GitBranch, 
  Cpu, 
  Play, 
  Loader2, 
  Link2
} from 'lucide-react';

export default function TopNav({
  repoUrl,
  setRepoUrl,
  branch,
  setBranch,
  loading,
  handleIngest,
  result
}) {
  return (
    <header style={{
      height: '60px',
      background: 'rgba(17, 24, 39, 0.95)',
      borderBottom: '1px solid #293548',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      gap: '1.25rem'
    }}>
      {/* BRANDING & REPO STATUS BADGE */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #4F8CFF 0%, #3B7BF0 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(79, 140, 255, 0.35)'
          }}>
            <Cpu size={18} color="#FFFFFF" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
              RepoLens
            </span>
            <span style={{
              fontSize: '0.65rem', fontWeight: 800, color: '#4F8CFF',
              background: 'rgba(79, 140, 255, 0.12)', border: '1px solid rgba(79, 140, 255, 0.3)',
              padding: '0.12rem 0.45rem', borderRadius: '4px', textTransform: 'uppercase'
            }}>
              ENTERPRISE AI
            </span>
          </div>
        </div>

        {/* REPO STATUS BADGE */}
        {result && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.55rem',
            background: '#1A2234', border: '1px solid #293548',
            padding: '0.35rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', color: '#94A3B8'
          }}>
            <span style={{ color: '#4F8CFF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <GitBranch size={14} />
              {result.repository.owner}/{result.repository.repo}
            </span>
            <span style={{ color: '#64748B' }}>•</span>
            <span style={{ color: '#F9FAFB', fontWeight: 600 }}>{result.repository.branch}</span>
            <span style={{ color: '#64748B' }}>•</span>
            <span style={{ color: '#10B981', fontWeight: 700 }}>{result.repository.indexedFilesCount} Files</span>
          </div>
        )}
      </div>

      {/* SINGLE PRIMARY CTA TOOLBAR FORM */}
      <form onSubmit={handleIngest} style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        flex: '1 1 auto',
        justifyContent: 'flex-end',
        maxWidth: '780px'
      }}>
        
        {/* RESPONSIVE WIDE REPO URL INPUT */}
        <div style={{ position: 'relative', flex: '1 1 360px', maxWidth: '520px', minWidth: '220px' }}>
          <Link2 size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="Enter GitHub repository URL..."
            required
            style={{
              width: '100%',
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              borderRadius: '8px',
              border: '1px solid #293548',
              background: '#090E18',
              color: '#F9FAFB',
              fontSize: '0.85rem',
              outline: 'none',
              transition: 'border-color 0.15s'
            }}
          />
        </div>

        {/* COMPACT BRANCH INPUT */}
        <div style={{ width: '90px', flexShrink: 0 }}>
          <input
            type="text"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            placeholder="main"
            style={{
              width: '100%',
              padding: '0.45rem 0.65rem',
              borderRadius: '8px',
              border: '1px solid #293548',
              background: '#090E18',
              color: '#F9FAFB',
              fontSize: '0.85rem',
              outline: 'none',
              textAlign: 'center'
            }}
          />
        </div>

        {/* SINGLE PRIMARY CTA BUTTON */}
        <button
          type="submit"
          disabled={loading}
          style={{
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.48rem 1.15rem',
            borderRadius: '8px',
            background: loading ? '#374151' : 'linear-gradient(135deg, #4F8CFF 0%, #3B7BF0 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: '0.85rem',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 14px rgba(79, 140, 255, 0.35)',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease-in-out'
          }}
        >
          {loading ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Play size={15} />
              Execute Pipeline
            </>
          )}
        </button>
      </form>
    </header>
  );
}
