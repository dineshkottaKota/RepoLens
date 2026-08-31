'use client';

import React from 'react';
import { 
  Settings, 
  Key, 
  Database, 
  Cpu, 
  Server, 
  CheckCircle2, 
  Save
} from 'lucide-react';

export default function SettingsView({
  openaiApiKey,
  setOpenaiApiKey,
  maxTokenBudget,
  setMaxTokenBudget
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      
      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F9FAFB' }}>
          Platform Settings & Integration Config
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '0.88rem', marginTop: '0.2rem' }}>
          Manage LLM API credentials, Graph-RAG token budget limits, and database connections
        </p>
      </div>

      {/* OPENAI API KEY CARD */}
      <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <Key size={20} color="#4F8CFF" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
            OpenAI API Key Credentials
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
          Optional API key used for deep AI security logic audits and contextual LLM test case synthesis. If not specified, RepoLens runs in local deterministic AST rule mode.
        </p>

        <input
          type="password"
          value={openaiApiKey}
          onChange={(e) => setOpenaiApiKey(e.target.value)}
          placeholder="sk-..."
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
            border: '1px solid #293548', background: '#090E18', color: '#F9FAFB',
            fontSize: '0.9rem', outline: 'none'
          }}
        />
      </div>

      {/* GRAPH-RAG TOKEN BUDGET CARD */}
      <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <Cpu size={20} color="#A855F7" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
            Graph-RAG Subgraph Token Budget
          </h3>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem', lineHeight: 1.5 }}>
          Controls the maximum token budget allocation during Graph-RAG subgraph context extraction for large repositories (30k+ LOC).
        </p>

        <select
          value={maxTokenBudget}
          onChange={(e) => setMaxTokenBudget(e.target.value)}
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
            border: '1px solid #293548', background: '#090E18', color: '#F9FAFB',
            fontSize: '0.9rem', outline: 'none', cursor: 'pointer'
          }}
        >
          <option value={4000}>4,000 Tokens (Strict Budget)</option>
          <option value={6000}>6,000 Tokens (Standard Budget - Recommended)</option>
          <option value={12000}>12,000 Tokens (Extended Budget)</option>
        </select>
      </div>

      {/* NEO4J ENGINE STATUS CARD */}
      <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <Database size={20} color="#10B981" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
            Neo4j Database Engine Status
          </h3>
        </div>

        <div style={{
          background: '#111827', border: '1px solid #293548', borderRadius: '10px', padding: '1rem',
          display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8' }}>Engine Protocol:</span>
            <span style={{ color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <CheckCircle2 size={14} /> Dual Engine (Bolt & HTTPS REST)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8' }}>Bulk Sync Method:</span>
            <span style={{ color: '#4F8CFF', fontWeight: 700 }}>UNWIND Parameterized Batching</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#94A3B8' }}>Target URI:</span>
            <code>neo4j://127.0.0.1:7687</code>
          </div>
        </div>
      </div>

    </div>
  );
}
