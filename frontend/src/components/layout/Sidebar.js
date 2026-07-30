'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  FolderGit2, 
  ShieldAlert, 
  TestTube2, 
  Network, 
  BarChart3, 
  Settings,
  ChevronRight,
  Database,
  Lock
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, result }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'repository', label: 'Repository', icon: FolderGit2, badge: result ? `(${result.repository.indexedFilesCount})` : null },
    { id: 'security', label: 'Security Audit', icon: ShieldAlert, badge: result ? `(${result.summary.securityVulnerabilities})` : null, badgeColor: result?.summary.securityVulnerabilities > 0 ? '#EF4444' : '#10B981' },
    { id: 'tests', label: 'Test Suites', icon: TestTube2, badge: result ? `(${result.summary.unitTestsGenerated})` : null, badgeColor: '#10B981' },
    { id: 'graph', label: 'Knowledge Graph', icon: Network, badge: result ? `(${result.graphData.nodes.length})` : null, badgeColor: '#4F8CFF' },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <aside style={{
      width: '260px',
      height: 'calc(100vh - 60px)',
      background: '#111827',
      borderRight: '1px solid #293548',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      padding: '1.25rem 0.85rem',
      position: 'fixed',
      top: '60px',
      left: 0,
      zIndex: 30
    }}>
      {/* NAVIGATION ITEMS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.75rem 0.4rem 0.75rem' }}>
          Workspace
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                width: '100%',
                padding: '0.7rem 0.85rem',
                borderRadius: '9px',
                border: 'none',
                background: isActive ? 'rgba(79, 140, 255, 0.12)' : 'transparent',
                color: isActive ? '#4F8CFF' : '#94A3B8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease-in-out',
                borderLeft: isActive ? '3px solid #4F8CFF' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <Icon size={18} color={isActive ? '#4F8CFF' : '#94A3B8'} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: item.badgeColor || '#94A3B8',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* FOOTER CONNECTION STATUS */}
      <div style={{
        background: '#1A2234',
        border: '1px solid #293548',
        borderRadius: '10px',
        padding: '0.85rem',
        fontSize: '0.78rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10B981', fontWeight: 600, marginBottom: '0.2rem' }}>
          <span style={{ height: '7px', width: '7px', borderRadius: '50%', background: '#10B981', display: 'inline-block', boxShadow: '0 0 8px #10B981' }} />
          Neo4j Engine Synced
        </div>
        <div style={{ color: '#64748B', fontSize: '0.72rem' }}>
          Dual Protocol (Bolt / HTTPS REST)
        </div>
      </div>
    </aside>
  );
}
