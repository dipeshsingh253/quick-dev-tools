import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ConfigFormatter } from './components/ConfigFormatter/ConfigFormatter';
import { MarkdownPreview } from './components/MarkdownPreview/MarkdownPreview';
import { GitDiff } from './components/GitDiff/GitDiff';
import { ImageBeautifier } from './components/ImageBeautifier/ImageBeautifier';
import { RegexChecker } from './components/RegexChecker/RegexChecker';
import { Decoder } from './components/Decoder/Decoder';
import { TimestampConverter } from './components/TimestampConverter/TimestampConverter';
import { UuidHashGenerator } from './components/UuidHashGenerator/UuidHashGenerator';
import { TextCaseConverter } from './components/TextCaseConverter/TextCaseConverter';
import { UrlInspector } from './components/UrlInspector/UrlInspector';
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

      // Ctrl/Cmd + 1-9 and 0 to switch tools
      if ((e.ctrlKey || e.metaKey) && (e.key >= '1' && e.key <= '9' || e.key === '0')) {
        e.preventDefault();
        const tools: ToolType[] = ['config', 'markdown', 'diff', 'image', 'regex', 'decoder', 'timestamp', 'generator', 'case', 'url'];
        const toolIndex = e.key === '0' ? 9 : parseInt(e.key) - 1;
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
      case 'regex':
        return <RegexChecker />;
      case 'decoder':
        return <Decoder />;
      case 'timestamp':
        return <TimestampConverter />;
      case 'generator':
        return <UuidHashGenerator />;
      case 'case':
        return <TextCaseConverter />;
      case 'url':
        return <UrlInspector />;
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
