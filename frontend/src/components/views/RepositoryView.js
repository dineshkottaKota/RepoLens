'use client';

import React, { useState, useMemo } from 'react';
import { 
  FolderGit2, 
  FileCode2, 
  Search, 
  Code2, 
  Layers, 
  Route, 
  Hash,
  ExternalLink
} from 'lucide-react';

export default function RepositoryView({ result }) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!result) {
    return <div style={{ color: '#94A3B8', padding: '3rem', textAlign: 'center' }}>No repository scan data available. Run a scan from the Top Navigation bar.</div>;
  }

  // Extract file list from graph nodes
  const fileNodes = useMemo(() => {
    return result.graphData.nodes
      .filter(n => n.data.type === 'FileNode')
      .map(n => n.data);
  }, [result]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return fileNodes;
    const q = searchQuery.toLowerCase();
    return fileNodes.filter(f => f.path.toLowerCase().includes(q));
  }, [fileNodes, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB' }}>
            Repository Explorer
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Indexed files in <strong style={{ color: '#4F8CFF' }}>{result.repository.owner}/{result.repository.repo}</strong>
          </p>
        </div>

        {/* SEARCH BAR */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repository files..."
            style={{
              width: '100%', padding: '0.5rem 0.85rem 0.5rem 2.2rem',
              borderRadius: '8px', border: '1px solid #293548',
              background: '#090E18', color: '#F9FAFB', fontSize: '0.82rem', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* REPOSITORY METRICS BAR */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem',
        background: '#1A2234', border: '1px solid #293548', borderRadius: '12px', padding: '1.25rem'
      }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Total Discovered Files</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F9FAFB', marginTop: '0.2rem' }}>
            {result.repository.totalDiscoveredFiles}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Indexed Source Code Files</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4F8CFF', marginTop: '0.2rem' }}>
            {result.repository.indexedFilesCount}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Total Lines of Code (LOC)</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginTop: '0.2rem' }}>
            {result.summary.totalLOC}
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div style={{
        background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#111827', borderBottom: '1px solid #293548', color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>File Path</th>
              <th style={{ padding: '1rem 1.25rem' }}>Language</th>
              <th style={{ padding: '1rem 1.25rem' }}>Line Count (LOC)</th>
              <th style={{ padding: '1rem 1.25rem' }}>AST Symbols</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #293548', transition: 'background 0.15s' }} className="card-hover">
                <td style={{ padding: '0.85rem 1.25rem', fontWeight: 600, color: '#F9FAFB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FileCode2 size={16} color="#4F8CFF" />
                  <code>{file.path}</code>
                </td>

                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <span style={{
                    background: '#111827', border: '1px solid #293548', color: '#A855F7',
                    fontWeight: 700, fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '4px', textTransform: 'uppercase'
                  }}>
                    {file.language || 'JS'}
                  </span>
                </td>

                <td style={{ padding: '0.85rem 1.25rem', color: '#94A3B8', fontWeight: 600 }}>
                  {file.loc} LOC
                </td>

                <td style={{ padding: '0.85rem 1.25rem' }}>
                  <span style={{ color: '#10B981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                    Indexed
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
