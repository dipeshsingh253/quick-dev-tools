import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ConfigFormatter } from './components/ConfigFormatter/ConfigFormatter';
import { MarkdownPreview } from './components/MarkdownPreview/MarkdownPreview';
import { GitDiff } from './components/GitDiff/GitDiff';
import { ImageBeautifier } from './components/ImageBeautifier/ImageBeautifier';
import type { ToolType } from './types';

function AppContent() {
  const [activeTool, setActiveTool] = useState<ToolType>('config');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Ctrl/Cmd + 1-4 to switch tools
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const tools: ToolType[] = ['config', 'markdown', 'diff', 'image'];
        const toolIndex = parseInt(e.key) - 1;
        setActiveTool(tools[toolIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderActiveTool = () => {
    switch (activeTool) {
      case 'config':
        return <ConfigFormatter />;
      case 'markdown':
        return <MarkdownPreview />;
      case 'diff':
        return <GitDiff />;
      case 'image':
        return <ImageBeautifier />;
      default:
        return <ConfigFormatter />;
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activeTool={activeTool} onToolChange={setActiveTool} />
      <div className="flex-1 overflow-hidden">
        {renderActiveTool()}
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
