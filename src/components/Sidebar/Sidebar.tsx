import React, { useState } from 'react';
import type { ToolType } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { 
  PanelLeftClose,
  PanelLeft,
  FileJson2,
  FileText,
  GitCompareArrows,
  ImageIcon,
  Moon,
  Sun,
  Github,
  Twitter,
  Regex,
  LockOpen,
  Clock,
  Key,
  Type,
  Link
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
}

const tools = [
  { id: 'config' as ToolType, name: 'Config Formatter', icon: FileJson2 },
  { id: 'markdown' as ToolType, name: 'Markdown Preview', icon: FileText },
  { id: 'diff' as ToolType, name: 'Text Diff', icon: GitCompareArrows },
  { id: 'image' as ToolType, name: 'Image Beautifier', icon: ImageIcon },
  { id: 'regex' as ToolType, name: 'Regex Checker', icon: Regex },
  { id: 'decoder' as ToolType, name: 'Decoder', icon: LockOpen },
  { id: 'timestamp' as ToolType, name: 'Timestamp', icon: Clock },
  { id: 'generator' as ToolType, name: 'UUID/Hash', icon: Key },
  { id: 'case' as ToolType, name: 'Case Converter', icon: Type },
  { id: 'url' as ToolType, name: 'URL Inspector', icon: Link },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className={clsx(
        'h-full flex flex-col bg-white dark:bg-[#0d1117] border-r border-gray-200 dark:border-[#30363d] transition-all duration-200',
        isCollapsed ? 'w-[52px]' : 'w-[200px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center px-3 py-4 border-b border-gray-200 dark:border-[#30363d]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="text-sm font-semibold text-gray-900 dark:text-[#c9d1d9]">Quick Dev Tools</h1>
              <span className="text-[10px] text-gray-500 dark:text-[#8b949e]">100% client-side</span>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsCollapsed(false)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] mx-auto"
          >
            <PanelLeft size={18} />
          </button>
        )}
      </div>

      {/* Tools */}
      <div className="flex-1 py-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 transition-colors relative',
                isActive
                  ? 'text-blue-600 dark:text-[#58a6ff] bg-blue-50 dark:bg-[#21262d]/50'
                  : 'text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d]/30 hover:text-gray-900 dark:hover:text-[#c9d1d9]'
              )}
              title={isCollapsed ? tool.name : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-blue-600 dark:bg-[#58a6ff] rounded-r" />
              )}
              <Icon size={20} />
              {!isCollapsed && <span className="text-sm">{tool.name}</span>}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-[#30363d] py-2">
        <a
          href="https://github.com/dipeshsingh253"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d]/30 hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors'
          )}
          title="GitHub"
        >
          <Github size={20} />
          {!isCollapsed && <span className="text-sm">@dipeshsingh253</span>}
        </a>
        <a
          href="https://x.com/dipeshdotdev"
          target="_blank"
          rel="noopener noreferrer"
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d]/30 hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors'
          )}
          title="Twitter"
        >
          <Twitter size={20} />
          {!isCollapsed && <span className="text-sm">@dipeshdotdev</span>}
        </a>
        <button
          onClick={toggleTheme}
          className={clsx(
            'w-full flex items-center gap-3 px-4 py-3 text-gray-500 dark:text-[#8b949e] hover:bg-gray-100 dark:hover:bg-[#21262d]/30 hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors'
          )}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {!isCollapsed && <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>

      {/* Tagline */}
      {/* {!isCollapsed && (
        <div className="px-3 py-3 border-t border-gray-200 dark:border-[#30363d]">
          <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-[#3fb950]">
            <span className="w-2 h-2 rounded-full bg-green-600 dark:bg-[#3fb950]"></span>
            Instant tools. No sign-up. No data sent to any server.
          </div>
        </div>
      )} */}
    </div>
  );
};
