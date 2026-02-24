import React, { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { Workspace } from './components/Workspace';
import { Toaster } from 'sonner';
import { ThemeProvider, useTheme } from './context/ThemeContext';

export type SessionType = 'new' | 'history' | 'file-upload';

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
}

function AppContent() {
  const { theme } = useTheme();
  const [activeSessionId, setActiveSessionId] = useState<string | null>('capacity-plan');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'workspace'>('chat');
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const handleHistorySelect = (id: string) => {
    setActiveSessionId(id);
    setUploadedFile(null);
    setCurrentView('chat');
  };

  const handleSearchSent = useCallback((query: string) => {
    if (!query.trim()) return;
    const id = `search-${Date.now()}`;
    const title = query.trim().length > 60 ? query.trim().slice(0, 60) + '…' : query.trim();
    setSearchHistory((prev) => {
      const next = [{ id, query: title, timestamp: new Date().toISOString() }, ...prev];
      return next.slice(0, 50);
    });
    setActiveSessionId(id);
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setCurrentView('chat');
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setUploadedFile(null);
    setCurrentView('chat');
  };

  const handleWorkspaceSelect = () => {
      setCurrentView('workspace');
  };

  return (
    <div className={`flex h-screen w-full text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200 ${
      theme === 'dark' ? 'bg-[#0B0F19]' : 'bg-slate-50'
    }`}>
      <Sidebar 
        className="hidden md:flex shrink-0" 
        onHistorySelect={handleHistorySelect}
        onFileUpload={handleFileUpload}
        onNewChat={handleNewChat}
        onWorkspaceSelect={handleWorkspaceSelect}
        activeSessionId={activeSessionId}
        currentView={currentView}
        searchHistory={searchHistory}
      />
      <main className="flex-1 min-w-0 h-full relative z-0">
        {currentView === 'chat' ? (
             <ChatArea 
                activeSessionId={activeSessionId} 
                uploadedFile={uploadedFile}
                onSearchSent={handleSearchSent}
            />
        ) : (
            <Workspace />
        )}
      </main>
      <Toaster theme={theme} position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}