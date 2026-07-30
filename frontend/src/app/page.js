'use client';

import React, { useState } from 'react';

import TopNav from '../components/layout/TopNav';
import Sidebar from '../components/layout/Sidebar';
import RightDrawer from '../components/layout/RightDrawer';

import DashboardView from '../components/views/DashboardView';
import RepositoryView from '../components/views/RepositoryView';
import SecurityView from '../components/views/SecurityView';
import TestGenerationView from '../components/views/TestGenerationView';
import KnowledgeGraphView from '../components/views/KnowledgeGraphView';
import ReportsView from '../components/views/ReportsView';
import SettingsView from '../components/views/SettingsView';

import { AlertCircle } from 'lucide-react';

export default function PlatformDashboard() {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [maxTokenBudget, setMaxTokenBudget] = useState(6000);
  const [openaiApiKey, setOpenaiApiKey] = useState('');

  const [loading, setLoading] = useState(false);
  const [pipelineStage, setPipelineStage] = useState(0); // 0=Idle, 1..5=Stages, 6=Complete
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Drawer Inspection States
  const [selectedVulnerability, setSelectedVulnerability] = useState(null);
  const [selectedTestSuite, setSelectedTestSuite] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleIngestInternal = async (overrideUrl, overrideBranch) => {
    const targetUrl = overrideUrl || repoUrl;
    const targetBranch = overrideBranch || branch;

    if (!targetUrl || !targetUrl.trim()) {
      setError('Please enter a GitHub repository URL (e.g. https://github.com/expressjs/express).');
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedVulnerability(null);
    setSelectedTestSuite(null);
    setSelectedNode(null);
    setPipelineStage(1);

    // Simulate real-time progress stage progression while scan request is executing
    const stageTimer = setInterval(() => {
      setPipelineStage(prev => (prev < 5 ? prev + 1 : prev));
    }, 1200);

    try {
      const response = await fetch('/api/agent/ingest-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          repoUrl: targetUrl, 
          branch: targetBranch, 
          maxTokenBudget: parseInt(maxTokenBudget), 
          openaiApiKey 
        })
      });

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        if (!response.ok) {
          throw new Error(`Scan request returned HTTP ${response.status}. ${responseText ? responseText.substring(0, 150) : 'Server timeout or gateway error.'}`);
        }
        throw new Error(`Server Response Error: ${responseText.substring(0, 100)}`);
      }

      if (data.success === false) {
        setError(data.message || 'Error processing GitHub repository scan.');
      } else {
        setResult(data);
        setPipelineStage(6);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(stageTimer);
      setLoading(false);
    }
  };

  const handleIngest = (e) => {
    if (e) e.preventDefault();
    handleIngestInternal();
  };

  const isDrawerOpen = Boolean(selectedVulnerability || selectedTestSuite || selectedNode);

  return (
    <div style={{ minHeight: '100vh', background: '#0B1220', color: '#F9FAFB' }}>
      
      {/* TOP NAVIGATION HEADER */}
      <TopNav
        repoUrl={repoUrl}
        setRepoUrl={setRepoUrl}
        branch={branch}
        setBranch={setBranch}
        loading={loading}
        handleIngest={handleIngest}
        result={result}
      />

      <div style={{ display: 'flex' }}>
        
        {/* LEFT FIXED SIDEBAR */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          result={result}
        />

        {/* MAIN DYNAMIC WORKSPACE */}
        <main style={{
          marginLeft: '260px',
          flex: 1,
          padding: '2rem 2.5rem',
          maxWidth: '1380px',
          marginRight: isDrawerOpen ? '820px' : '0px',
          transition: 'margin-right 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          {/* PIPELINE ERROR DISPLAY */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              padding: '1.1rem 1.25rem',
              borderRadius: '12px',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              fontWeight: 600
            }}>
              <AlertCircle size={22} color="#EF4444" />
              <div>
                <div style={{ fontWeight: 800, color: '#FCA5A5' }}>Pipeline Notification</div>
                <div style={{ fontSize: '0.88rem', marginTop: '0.2rem' }}>{error}</div>
              </div>
            </div>
          )}

          {/* ACTIVE VIEW ROUTER */}
          {activeTab === 'dashboard' && (
            <DashboardView
              result={result}
              loading={loading}
              pipelineStage={pipelineStage}
              handleIngest={handleIngest}
              setActiveTab={setActiveTab}
              setSelectedVulnerability={setSelectedVulnerability}
              setSelectedTestSuite={setSelectedTestSuite}
            />
          )}

          {activeTab === 'repository' && (
            <RepositoryView result={result} />
          )}

          {activeTab === 'security' && (
            <SecurityView
              result={result}
              setSelectedVulnerability={setSelectedVulnerability}
            />
          )}

          {activeTab === 'tests' && (
            <TestGenerationView
              result={result}
              setSelectedTestSuite={setSelectedTestSuite}
            />
          )}

          {activeTab === 'graph' && (
            <KnowledgeGraphView
              result={result}
              setSelectedNode={setSelectedNode}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView result={result} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              openaiApiKey={openaiApiKey}
              setOpenaiApiKey={setOpenaiApiKey}
              maxTokenBudget={maxTokenBudget}
              setMaxTokenBudget={setMaxTokenBudget}
            />
          )}

        </main>

        {/* RIGHT SLIDE-OVER INSPECTOR DRAWER */}
        <RightDrawer
          selectedVulnerability={selectedVulnerability}
          setSelectedVulnerability={setSelectedVulnerability}
          selectedTestSuite={selectedTestSuite}
          setSelectedTestSuite={setSelectedTestSuite}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />

      </div>

    </div>
  );
}
