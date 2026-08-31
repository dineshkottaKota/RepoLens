'use client';

import React from 'react';
import { 
  GitBranch, 
  FolderGit2, 
  ShieldAlert, 
  TestTube2, 
  Network, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  ArrowRight,
  Loader2,
  Play,
  Link2,
  Terminal,
  Layers
} from 'lucide-react';

export default function DashboardView({
  result,
  loading,
  pipelineStage,
  setActiveTab,
  setSelectedVulnerability,
  setSelectedTestSuite
}) {
  const stageDefinitions = [
    { stage: 1, title: 'Repository Ingestion', desc: result ? `${result.repository.totalDiscoveredFiles} files discovered` : 'Downloading archive...' },
    { stage: 2, title: 'AST Parsing', desc: result ? `${result.summary.totalLOC} Lines of Code` : 'Parsing symbols & LOC...' },
    { stage: 3, title: 'Knowledge Graph', desc: result ? `${result.graphData.nodes.length} Nodes & Edges` : 'Building Neo4j graph...' },
    { stage: 4, title: 'OWASP Security Scan', desc: result ? `${result.summary.securityVulnerabilities} Findings` : 'Scanning OWASP flaws...' },
    { stage: 5, title: 'Test Synthesis', desc: result ? `${result.summary.unitTestsGenerated} Test Suites` : 'Synthesizing test suites...' }
  ];

  // CLEAN MINIMAL INITIAL EMPTY STATE (Before execution)
  if (!result && !loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1000px', margin: '1.5rem auto' }}>
        
        {/* HEADER BRANDING BANNER */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(79, 140, 255, 0.1)', border: '1px solid rgba(79, 140, 255, 0.3)',
            color: '#4F8CFF', padding: '0.35rem 0.9rem', borderRadius: '999px',
            fontSize: '0.78rem', fontWeight: 700, marginBottom: '1rem'
          }}>
            <span style={{ height: '7px', width: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
            Enterprise Code Intelligence & Security Orchestrator
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
            GitHub AI Agent Platform
          </h2>

          <p style={{ color: '#94A3B8', fontSize: '0.95rem', maxWidth: '680px', margin: '0.6rem auto 0 auto', lineHeight: 1.6 }}>
            Ingests repositories, parses Abstract Syntax Trees (AST), constructs code Knowledge Graphs, audits OWASP security vulnerabilities, and synthesizes runnable test suites.
          </p>
        </div>

        {/* 3-STEP WORKFLOW GUIDE */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
          
          <div style={{
            background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(79, 140, 255, 0.12)', border: '1px solid rgba(79, 140, 255, 0.3)',
              color: '#4F8CFF', fontWeight: 800, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              01
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
              Enter Repository URL
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Paste any public GitHub repository link into the top toolbar search field.
            </p>
          </div>

          <div style={{
            background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#A855F7', fontWeight: 800, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              02
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
              Select Target Branch
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Specify the target git branch (defaults to <code style={{ color: '#4F8CFF' }}>main</code> or <code style={{ color: '#4F8CFF' }}>master</code>).
            </p>
          </div>

          <div style={{
            background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10B981', fontWeight: 800, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              03
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
              Click Execute Pipeline
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              Click <strong>Execute Pipeline</strong> in the top toolbar to start automated multi-agent analysis.
            </p>
          </div>

        </div>

      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
            Executive Dashboard
          </h1>
          {result && (
            <p style={{ color: '#94A3B8', fontSize: '0.92rem', marginTop: '0.2rem' }}>
              Overview for repository <strong style={{ color: '#4F8CFF' }}>{result.repository.owner}/{result.repository.repo}</strong> ({result.repository.branch} branch)
            </p>
          )}
        </div>

        {result && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setActiveTab('security')}
              style={{
                background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171', padding: '0.55rem 1.1rem', borderRadius: '9px',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.45rem'
              }}
            >
              <ShieldAlert size={17} />
              {result.summary.securityVulnerabilities} Vulnerabilities
            </button>

            <button
              onClick={() => setActiveTab('tests')}
              style={{
                background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34D399', padding: '0.55rem 1.1rem', borderRadius: '9px',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.45rem'
              }}
            >
              <TestTube2 size={17} />
              {result.summary.unitTestsGenerated} Test Suites
            </button>
          </div>
        )}
      </div>

      {/* PIPELINE REAL-TIME STATUS PROGRESS TRACKER */}
      <div style={{
        background: '#1A2234', border: '1px solid #293548', borderRadius: '16px', padding: '1.75rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#F9FAFB', margin: 0 }}>
              AI Orchestration Pipeline Status
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0.25rem 0 0 0' }}>
              Real-time multi-agent execution pipeline progress
            </p>
          </div>

          {loading ? (
            <span style={{
              fontSize: '0.8rem', fontWeight: 700, color: '#4F8CFF',
              background: 'rgba(79, 140, 255, 0.12)', padding: '0.35rem 0.85rem', borderRadius: '7px',
              border: '1px solid rgba(79, 140, 255, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <Loader2 size={15} className="animate-spin" /> Execution in Progress...
            </span>
          ) : (
            <span style={{
              fontSize: '0.8rem', fontWeight: 700, color: '#10B981',
              background: 'rgba(16, 185, 129, 0.12)', padding: '0.35rem 0.85rem', borderRadius: '7px',
              border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.4rem'
            }}>
              <CheckCircle2 size={15} /> Pipeline Completed
            </span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {stageDefinitions.map((stageItem) => {
            const isCompleted = result || pipelineStage > stageItem.stage;
            const isCurrent = loading && pipelineStage === stageItem.stage;

            return (
              <div key={stageItem.stage} style={{
                background: isCurrent ? 'rgba(79, 140, 255, 0.1)' : '#111827',
                border: isCurrent ? '1px solid #4F8CFF' : isCompleted ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #293548',
                borderRadius: '12px', padding: '1.1rem',
                display: 'flex', flexDirection: 'column', gap: '0.5rem',
                boxShadow: isCurrent ? '0 0 16px rgba(79, 140, 255, 0.3)' : 'none',
                transition: 'all 0.25s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isCurrent ? '#4F8CFF' : isCompleted ? '#10B981' : '#64748B', textTransform: 'uppercase' }}>
                    Stage 0{stageItem.stage}
                  </span>
                  {isCompleted ? (
                    <CheckCircle2 size={18} color="#10B981" />
                  ) : isCurrent ? (
                    <Loader2 size={18} color="#4F8CFF" className="animate-spin" />
                  ) : (
                    <Clock size={18} color="#64748B" />
                  )}
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isCurrent || isCompleted ? '#F9FAFB' : '#64748B' }}>
                  {stageItem.title}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                  {stageItem.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI METRICS CARDS */}
      {result && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem' }}>
            
            <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.35rem' }} className="card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Repository
                </span>
                <FolderGit2 size={20} color="#4F8CFF" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F9FAFB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {result.repository.repo}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem' }}>
                Discovered {result.repository.totalDiscoveredFiles} files • {result.repository.indexedFilesCount} indexed
              </div>
            </div>

            <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.35rem' }} className="card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Code Knowledge Graph
                </span>
                <Network size={20} color="#A855F7" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F9FAFB' }}>
                {result.graphData.nodes.length} <span style={{ fontSize: '0.85rem', color: '#A855F7', fontWeight: 600 }}>Nodes</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem' }}>
                {result.graphData.edges.length} Edges • {result.summary.totalLOC} LOC
              </div>
            </div>

            <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.35rem' }} className="card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Security Audit
                </span>
                <ShieldAlert size={20} color={result.summary.securityVulnerabilities > 0 ? '#EF4444' : '#10B981'} />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F9FAFB' }}>
                {result.summary.securityVulnerabilities} <span style={{ fontSize: '0.85rem', color: result.summary.securityVulnerabilities > 0 ? '#EF4444' : '#10B981', fontWeight: 600 }}>Flaws</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem' }}>
                {result.securityAudit.criticalCount} Critical • {result.securityAudit.highCount} High
              </div>
            </div>

            <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.35rem' }} className="card-hover">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Synthesized Tests
                </span>
                <TestTube2 size={20} color="#10B981" />
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F9FAFB' }}>
                {result.summary.unitTestsGenerated} <span style={{ fontSize: '0.85rem', color: '#10B981', fontWeight: 600 }}>Suites</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem' }}>
                Covering {result.summary.totalFunctions} AST Functions
              </div>
            </div>

          </div>

          {/* QUICK DRILL-DOWN TILES */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F9FAFB', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldAlert size={18} color="#EF4444" /> Top OWASP Security Findings
                </h3>
                <button onClick={() => setActiveTab('security')} style={{ background: 'none', border: 'none', color: '#4F8CFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  View All <ArrowRight size={14} />
                </button>
              </div>

              {result.securityAudit.vulnerabilities.length === 0 ? (
                <div style={{ color: '#10B981', fontSize: '0.9rem', fontWeight: 600, padding: '1.5rem 0' }}>
                  🎉 Zero vulnerabilities detected!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.securityAudit.vulnerabilities.slice(0, 3).map((v, idx) => (
                    <div
                      key={idx}
                      onClick={() => { setSelectedVulnerability(v); }}
                      style={{
                        background: '#111827', border: '1px solid #293548', borderRadius: '8px', padding: '0.85rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                      }}
                      className="card-hover"
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F9FAFB' }}>
                          {v.type}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                          <code>{v.filePath}:{v.line}</code>
                        </div>
                      </div>

                      <span style={{
                        background: v.severity === 'CRITICAL' ? '#EF4444' : '#F97316',
                        color: '#FFF', fontWeight: 800, fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px'
                      }}>
                        {v.severity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: '#1A2234', border: '1px solid #293548', borderRadius: '14px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F9FAFB', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TestTube2 size={18} color="#10B981" /> Synthesized Test Suites
                </h3>
                <button onClick={() => setActiveTab('tests')} style={{ background: 'none', border: 'none', color: '#4F8CFF', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  View All <ArrowRight size={14} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.testSuites.unitTests.slice(0, 3).map((ts, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setSelectedTestSuite(ts); }}
                    style={{
                      background: '#111827', border: '1px solid #293548', borderRadius: '8px', padding: '0.85rem',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                    className="card-hover"
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#F9FAFB' }}>
                        {ts.testFile}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                        Target: <code>{ts.targetFile}</code>
                      </div>
                    </div>

                    <span style={{ background: '#10B981', color: '#FFF', fontWeight: 800, fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      {ts.testCount} Assertions
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
