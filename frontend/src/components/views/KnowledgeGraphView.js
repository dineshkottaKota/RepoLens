'use client';

import React, { useState, useMemo } from 'react';
import { 
  Network, 
  Search, 
  Filter, 
  FileCode2, 
  Code2, 
  ShieldAlert, 
  TestTube2, 
  Layers,
  ArrowUpRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

export default function KnowledgeGraphView({ result, setSelectedNode }) {
  const [nodeFilter, setNodeFilter] = useState('ALL');
  const [nodeSearch, setNodeSearch] = useState('');

  if (!result) {
    return <div style={{ color: '#94A3B8', padding: '3rem', textAlign: 'center' }}>No Knowledge Graph data available. Run a scan from the Top Navigation bar.</div>;
  }

  const nodes = result.graphData.nodes || [];

  const filteredNodes = useMemo(() => {
    let list = nodes;
    if (nodeFilter !== 'ALL') {
      list = list.filter(n => n.data.type === nodeFilter);
    }
    if (nodeSearch.trim()) {
      const q = nodeSearch.toLowerCase();
      list = list.filter(n => 
        (n.data.name && n.data.name.toLowerCase().includes(q)) ||
        (n.data.file && n.data.file.toLowerCase().includes(q)) ||
        (n.data.path && n.data.path.toLowerCase().includes(q)) ||
        (n.data.id && n.data.id.toLowerCase().includes(q))
      );
    }
    return list;
  }, [nodes, nodeFilter, nodeSearch]);

  const getNodeColor = (type) => {
    switch (type) {
      case 'FileNode': return '#4F8CFF';
      case 'FunctionNode': return '#A855F7';
      case 'EndpointNode': return '#06B6D4';
      case 'VulnerabilityNode': return '#EF4444';
      case 'TestCaseNode': return '#10B981';
      default: return '#64748B';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB' }}>
            Visual Code Knowledge Graph
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Topological canvas displaying file hierarchy, AST symbols, API routes, security risks, and test suites
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={nodeSearch}
              onChange={(e) => setNodeSearch(e.target.value)}
              placeholder="Search graph nodes..."
              style={{
                width: '100%', padding: '0.45rem 0.85rem 0.45rem 2.1rem',
                borderRadius: '8px', border: '1px solid #293548',
                background: '#090E18', color: '#F9FAFB', fontSize: '0.8rem', outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.3rem', background: '#090E18', padding: '0.25rem', borderRadius: '8px', border: '1px solid #293548' }}>
            {['ALL', 'FileNode', 'FunctionNode', 'EndpointNode', 'VulnerabilityNode', 'TestCaseNode'].map(filter => (
              <button
                key={filter}
                onClick={() => setNodeFilter(filter)}
                style={{
                  background: nodeFilter === filter ? '#4F8CFF' : 'transparent',
                  color: nodeFilter === filter ? '#FFFFFF' : '#94A3B8',
                  border: 'none', padding: '0.3rem 0.65rem', borderRadius: '6px',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRAPH CANVAS & GRID CONTAINER */}
      <div style={{
        background: '#060A12', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem',
        minHeight: '500px'
      }}>
        
        {/* LEGEND BAR */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #293548', paddingBottom: '1rem' }}>
          {[
            { label: 'FileNode', color: '#4F8CFF' },
            { label: 'FunctionNode', color: '#A855F7' },
            { label: 'EndpointNode', color: '#06B6D4' },
            { label: 'VulnerabilityNode', color: '#EF4444' },
            { label: 'TestCaseNode', color: '#10B981' }
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#94A3B8' }}>
              <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: item.color }} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* NODES VISUAL GRID */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignContent: 'flex-start', maxHeight: '600px', overflowY: 'auto' }}>
          {filteredNodes.map(node => {
            const color = getNodeColor(node.data.type);

            return (
              <div
                key={node.data.id}
                onClick={() => setSelectedNode(node)}
                style={{
                  background: '#1A2234',
                  border: '1px solid #293548',
                  borderLeft: `4px solid ${color}`,
                  borderRadius: '10px',
                  padding: '0.85rem 1.1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  maxWidth: '300px',
                  flex: '1 1 240px'
                }}
                className="card-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color, textTransform: 'uppercase' }}>
                    {node.data.type}
                  </span>
                  <ArrowUpRight size={14} color={color} />
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#F9FAFB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {node.data.name || node.data.path || node.data.id}
                </div>

                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.3rem' }}>
                  {node.data.file ? `File: ${node.data.file}` : node.data.language ? `Lang: ${node.data.language}` : `ID: ${node.data.id}`}
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}
