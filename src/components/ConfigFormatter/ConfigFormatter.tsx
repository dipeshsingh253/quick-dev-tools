import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Copy, Check, X, ChevronUp, ChevronDown, Replace } from 'lucide-react';
import clsx from 'clsx';
import {
  detectFormat,
  formatJSON,
  formatYAML,
} from '../../utils/configParser';
import type { ConfigFormat } from '../../types';

type OutputFormat = 'json' | 'yaml';

interface MatchInfo {
  index: number;
  line: number;
  column: number;
  length: number;
}

export const ConfigFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<ConfigFormat>('json');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Separate search state for input and output
  const [showInputSearch, setShowInputSearch] = useState(false);
  const [showOutputSearch, setShowOutputSearch] = useState(false);
  const [inputSearchTerm, setInputSearchTerm] = useState('');
  const [outputSearchTerm, setOutputSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [inputCurrentMatchIndex, setInputCurrentMatchIndex] = useState(-1);
  const [outputCurrentMatchIndex, setOutputCurrentMatchIndex] = useState(-1);
  const [inputMatches, setInputMatches] = useState<MatchInfo[]>([]);
  const [outputMatches, setOutputMatches] = useState<MatchInfo[]>([]);
  
  // Focus tracking
  const [focusedSection, setFocusedSection] = useState<'input' | 'output'>('input');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputLineNumbersRef = useRef<HTMLDivElement>(null);
  const outputLineNumbersRef = useRef<HTMLDivElement>(null);
  const inputSearchRef = useRef<HTMLInputElement>(null);
  const outputSearchRef = useRef<HTMLInputElement>(null);
  const highlightLayerRef = useRef<HTMLDivElement>(null);
  const inputPanelRef = useRef<HTMLDivElement>(null);
  const outputPanelRef = useRef<HTMLDivElement>(null);

  const getLineCount = useCallback((text: string) => {
    if (!text) return 1;
    return text.split('\n').length;
  }, []);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      setDetectedFormat('json');
      return;
    }

    const detected = detectFormat(input);
    setDetectedFormat(detected);

    try {
      let formattedOutput = '';
      
      if (outputFormat === 'json') {
        formattedOutput = formatJSON(input);
      } else {
        formattedOutput = formatYAML(input);
      }
      
      setOutput(formattedOutput);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, outputFormat]);

  // Find matches with line/column info
  const findMatchesWithInfo = useCallback((text: string, term: string): MatchInfo[] => {
    if (!term) return [];
    const matches: MatchInfo[] = [];
    const lines = text.split('\n');
    let currentIndex = 0;
    
    lines.forEach((line, lineNum) => {
      let searchStart = 0;
      let colIndex = line.toLowerCase().indexOf(term.toLowerCase(), searchStart);
      
      while (colIndex !== -1) {
        matches.push({
          index: currentIndex + colIndex,
          line: lineNum,
          column: colIndex,
          length: term.length,
        });
        searchStart = colIndex + 1;
        colIndex = line.toLowerCase().indexOf(term.toLowerCase(), searchStart);
      }
      currentIndex += line.length + 1;
    });
    
    return matches;
  }, []);

  // JSON path search - finds all occurrences of a key path like "friends.name"
  const findJSONPathMatches = useCallback((text: string, searchTerm: string): MatchInfo[] => {
    if (!searchTerm) return [];
    
    // Check if it's a path search (contains dot)
    if (searchTerm.includes('.')) {
      const pathParts = searchTerm.split('.');
      const matches: MatchInfo[] = [];
      const lines = text.split('\n');
      
      // Search for the last part of the path in context
      const lastKey = pathParts[pathParts.length - 1];
      const parentKey = pathParts.length > 1 ? pathParts[pathParts.length - 2] : null;
      
      let inCorrectParent = parentKey === null;
      let braceDepth = 0;
      let currentIndex = 0;
      
      lines.forEach((line, lineNum) => {
        // Track parent context
        if (parentKey) {
          const parentRegex = new RegExp(`"${parentKey}"\\s*:`, 'i');
          if (parentRegex.test(line)) {
            inCorrectParent = true;
            braceDepth = 0;
          }
        }
        
        // Track brace depth
        for (const char of line) {
          if (char === '{' || char === '[') braceDepth++;
          if (char === '}' || char === ']') braceDepth--;
        }
        
        if (braceDepth < 0 && parentKey) {
          inCorrectParent = false;
          braceDepth = 0;
        }
        
        // Find key matches
        if (inCorrectParent || parentKey === null) {
          const keyRegex = new RegExp(`"(${lastKey})"\\s*:`, 'gi');
          let match;
          while ((match = keyRegex.exec(line)) !== null) {
            matches.push({
              index: currentIndex + match.index + 1,
              line: lineNum,
              column: match.index + 1,
              length: lastKey.length,
            });
          }
        }
        
        currentIndex += line.length + 1;
      });
      
      return matches;
    }
    
    // Simple key or value search
    return findMatchesWithInfo(text, searchTerm);
  }, [findMatchesWithInfo]);

  // Update input matches when search term changes
  useEffect(() => {
    if (inputSearchTerm && showInputSearch) {
      const matches = findMatchesWithInfo(input, inputSearchTerm);
      setInputMatches(matches);
      setInputCurrentMatchIndex(matches.length > 0 ? 0 : -1);
    } else {
      setInputMatches([]);
      setInputCurrentMatchIndex(-1);
    }
  }, [inputSearchTerm, input, showInputSearch, findMatchesWithInfo]);

  // Update output matches when search term changes
  useEffect(() => {
    if (outputSearchTerm && showOutputSearch) {
      const matches = findJSONPathMatches(output, outputSearchTerm);
      setOutputMatches(matches);
      setOutputCurrentMatchIndex(matches.length > 0 ? 0 : -1);
    } else {
      setOutputMatches([]);
      setOutputCurrentMatchIndex(-1);
    }
  }, [outputSearchTerm, output, showOutputSearch, findJSONPathMatches]);

  // Scroll to current match for input
  const scrollToInputMatch = useCallback((matchIndex: number) => {
    if (matchIndex < 0 || inputMatches.length === 0) return;
    
    const match = inputMatches[matchIndex];
    if (!match) return;
    
    const lineHeight = 24; // 1.5rem = 24px
    const targetLine = match.line;
    
    // Calculate scroll position to center the match
    const scrollToLine = (element: HTMLElement | null) => {
      if (!element) return;
      const containerHeight = element.clientHeight;
      const targetScrollTop = targetLine * lineHeight - containerHeight / 2 + lineHeight / 2;
      element.scrollTop = Math.max(0, targetScrollTop);
    };
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      scrollToLine(inputRef.current);
      scrollToLine(highlightLayerRef.current);
      scrollToLine(inputLineNumbersRef.current);
    }, 0);
  }, [inputMatches]);

  useEffect(() => {
    scrollToInputMatch(inputCurrentMatchIndex);
  }, [inputCurrentMatchIndex, scrollToInputMatch]);

  // Scroll to current match for output
  useEffect(() => {
    if (outputCurrentMatchIndex >= 0 && outputMatches.length > 0 && outputRef.current) {
      const match = outputMatches[outputCurrentMatchIndex];
      const lineHeight = 24;
      const scrollTop = match.line * lineHeight - outputRef.current.clientHeight / 2 + lineHeight;
      outputRef.current.scrollTop = Math.max(0, scrollTop);
    }
  }, [outputCurrentMatchIndex, outputMatches]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F to toggle search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        if (focusedSection === 'input') {
          setShowInputSearch(true);
          setShowOutputSearch(false);
          setTimeout(() => inputSearchRef.current?.focus(), 0);
        } else {
          setShowOutputSearch(true);
          setShowInputSearch(false);
          setTimeout(() => outputSearchRef.current?.focus(), 0);
        }
      }
      
      // Escape to close search
      if (e.key === 'Escape') {
        if (showInputSearch || showOutputSearch) {
          setShowInputSearch(false);
          setShowOutputSearch(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedSection, showInputSearch, showOutputSearch]);

  // Handle search input keyboard events
  const handleSearchKeyDown = (e: React.KeyboardEvent, type: 'input' | 'output') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        navigateMatch('prev', type);
      } else {
        navigateMatch('next', type);
      }
    }
    if (e.key === 'Escape') {
      if (type === 'input') {
        setShowInputSearch(false);
      } else {
        setShowOutputSearch(false);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleInputScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scrollLeft = e.currentTarget.scrollLeft;
    if (inputLineNumbersRef.current) {
      inputLineNumbersRef.current.scrollTop = scrollTop;
    }
    if (highlightLayerRef.current) {
      highlightLayerRef.current.scrollTop = scrollTop;
      highlightLayerRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleOutputScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (outputLineNumbersRef.current) {
      outputLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const renderLineNumbers = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div key={i + 1} className="text-right pr-3 text-[#6e7681] select-none">
        {i + 1}
      </div>
    ));
  };

  const inputLineCount = getLineCount(input);
  const outputLineCount = getLineCount(output);

  const handleSearchToggle = (type: 'input' | 'output') => {
    if (type === 'input') {
      const newState = !showInputSearch;
      setShowInputSearch(newState);
      setShowOutputSearch(false);
      if (newState) {
        setTimeout(() => inputSearchRef.current?.focus(), 0);
      }
      if (!newState) {
        setInputSearchTerm('');
        setInputMatches([]);
        setInputCurrentMatchIndex(-1);
      }
    } else {
      const newState = !showOutputSearch;
      setShowOutputSearch(newState);
      setShowInputSearch(false);
      if (newState) {
        setTimeout(() => outputSearchRef.current?.focus(), 0);
      }
      if (!newState) {
        setOutputSearchTerm('');
        setOutputMatches([]);
        setOutputCurrentMatchIndex(-1);
      }
    }
    setReplaceTerm('');
  };

  const navigateMatch = (direction: 'next' | 'prev', type: 'input' | 'output') => {
    if (type === 'input') {
      if (inputMatches.length === 0) return;
      if (direction === 'next') {
        setInputCurrentMatchIndex((prev) => (prev + 1) % inputMatches.length);
      } else {
        setInputCurrentMatchIndex((prev) => (prev - 1 + inputMatches.length) % inputMatches.length);
      }
    } else {
      if (outputMatches.length === 0) return;
      if (direction === 'next') {
        setOutputCurrentMatchIndex((prev) => (prev + 1) % outputMatches.length);
      } else {
        setOutputCurrentMatchIndex((prev) => (prev - 1 + outputMatches.length) % outputMatches.length);
      }
    }
  };

  const handleReplace = () => {
    if (!inputSearchTerm || inputCurrentMatchIndex === -1 || inputMatches.length === 0) return;
    
    const match = inputMatches[inputCurrentMatchIndex];
    const before = input.substring(0, match.index);
    const after = input.substring(match.index + match.length);
    const newInput = before + replaceTerm + after;
    
    setInput(newInput);
  };

  const handleReplaceAll = () => {
    if (!inputSearchTerm) return;
    
    const regex = new RegExp(inputSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const newInput = input.replace(regex, replaceTerm);
    setInput(newInput);
  };

  // Render input with highlighted matches
  const renderHighlightedInput = () => {
    const lines = input.split('\n');
    
    return lines.map((line, lineIndex) => {
      const lineMatches = inputMatches.filter(m => m.line === lineIndex);
      
      // For lines without matches, render the line content normally
      if (lineMatches.length === 0) {
        return (
          <div key={lineIndex} className="text-gray-900 dark:text-[#c9d1d9]" style={{ minHeight: '1.5rem' }}>
            {line || '\u00A0'}
          </div>
        );
      }

      const parts: React.ReactNode[] = [];
      let lastIndex = 0;

      lineMatches.forEach((match, idx) => {
        const globalMatchIndex = inputMatches.indexOf(match);
        const isCurrentMatch = globalMatchIndex === inputCurrentMatchIndex;
        
        // Add text before match
        if (match.column > lastIndex) {
          parts.push(
            <span key={`pre-${idx}`} className="text-gray-900 dark:text-[#c9d1d9]">
              {line.substring(lastIndex, match.column)}
            </span>
          );
        }
        
        // Add highlighted match
        parts.push(
          <mark
            key={`match-${idx}`}
            className={clsx(
              'rounded',
              isCurrentMatch 
                ? 'bg-orange-500 text-white font-semibold' 
                : 'bg-yellow-400 dark:bg-yellow-500 text-black'
            )}
          >
            {line.substring(match.column, match.column + match.length)}
          </mark>
        );
        
        lastIndex = match.column + match.length;
      });

      // Add remaining text
      if (lastIndex < line.length) {
        parts.push(
          <span key="post" className="text-gray-900 dark:text-[#c9d1d9]">
            {line.substring(lastIndex)}
          </span>
        );
      }

      return (
        <div key={lineIndex} style={{ minHeight: '1.5rem' }}>
          {parts.length > 0 ? parts : '\u00A0'}
        </div>
      );
    });
  };

  // Syntax highlighting for JSON with search highlighting
  const highlightJSONWithSearch = (json: string, matches: MatchInfo[], currentMatchIndex: number): React.ReactNode[] => {
    const lines = json.split('\n');
    
    return lines.map((line, lineIndex) => {
      // First apply syntax highlighting
      let highlighted = line
        .replace(/"([^"]+)":/g, '<span class="text-[#7ee787]">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="text-[#a5d6ff]">"$1"</span>')
        .replace(/: (\d+\.?\d*)/g, ': <span class="text-[#79c0ff]">$1</span>')
        .replace(/: (true|false)/g, ': <span class="text-[#ff7b72]">$1</span>')
        .replace(/: (null)/g, ': <span class="text-[#ff7b72]">$1</span>');
      
      // Then apply search highlighting
      const lineMatches = matches.filter(m => m.line === lineIndex);
      if (lineMatches.length > 0 && outputSearchTerm) {
        const searchKey = outputSearchTerm.includes('.') 
          ? outputSearchTerm.split('.').pop() || '' 
          : outputSearchTerm;
        const searchRegex = new RegExp(`(${searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        let matchCount = 0;
        highlighted = highlighted.replace(searchRegex, (match) => {
          const isCurrentMatch = matches.indexOf(lineMatches[matchCount]) === currentMatchIndex;
          matchCount++;
          return `<mark class="${isCurrentMatch ? 'bg-orange-400 dark:bg-orange-500' : 'bg-yellow-300 dark:bg-yellow-500/50'} text-black px-0.5 rounded">${match}</mark>`;
        });
      }
      
      return (
        <div key={lineIndex} dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
      );
    });
  };

  // Syntax highlighting for YAML with search highlighting
  const highlightYAMLWithSearch = (yaml: string, matches: MatchInfo[], currentMatchIndex: number): React.ReactNode[] => {
    const lines = yaml.split('\n');
    
    return lines.map((line, lineIndex) => {
      let highlighted = line;
      highlighted = highlighted.replace(/^(\s*)([^:\s][^:]*):/, '$1<span class="text-[#7ee787]">$2</span>:');
      highlighted = highlighted.replace(/: (['"]?)([^'"[\]{}\n]+)\1$/g, ': <span class="text-[#a5d6ff]">$1$2$1</span>');
      highlighted = highlighted.replace(/: (\d+\.?\d*)$/g, ': <span class="text-[#79c0ff]">$1</span>');
      highlighted = highlighted.replace(/: (true|false)$/gi, ': <span class="text-[#ff7b72]">$1</span>');
      highlighted = highlighted.replace(/: (null|~)$/gi, ': <span class="text-[#ff7b72]">$1</span>');
      highlighted = highlighted.replace(/^(\s*)- /, '$1<span class="text-[#8b949e]">-</span> ');
      
      // Apply search highlighting
      const lineMatches = matches.filter(m => m.line === lineIndex);
      if (lineMatches.length > 0 && outputSearchTerm) {
        const searchKey = outputSearchTerm.includes('.') 
          ? outputSearchTerm.split('.').pop() || '' 
          : outputSearchTerm;
        const searchRegex = new RegExp(`(${searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        let matchCount = 0;
        highlighted = highlighted.replace(searchRegex, (match) => {
          const isCurrentMatch = matches.indexOf(lineMatches[matchCount]) === currentMatchIndex;
          matchCount++;
          return `<mark class="${isCurrentMatch ? 'bg-orange-400 dark:bg-orange-500' : 'bg-yellow-300 dark:bg-yellow-500/50'} text-black px-0.5 rounded">${match}</mark>`;
        });
      }
      
      return (
        <div key={lineIndex} dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
      );
    });
  };


  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1117]">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div 
          ref={inputPanelRef}
          className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0"
          onFocus={() => setFocusedSection('input')}
          onClick={() => setFocusedSection('input')}
        >
          {/* Input Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Input</span>
              {input.trim() && (
                <span className={clsx(
                  'px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider',
                  'bg-[#388bfd]/20 text-[#58a6ff] border border-[#388bfd]/30'
                )}>
                  {detectedFormat} detected
                </span>
              )}
            </div>
            <button 
              onClick={() => handleSearchToggle('input')}
              className={clsx(
                'p-1.5 rounded transition-colors',
                showInputSearch 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
              )}
              title="Find & Replace (Ctrl+F)"
            >
              <Search size={16} />
            </button>
          </div>
          
          {/* Search Bar for Input */}
          {showInputSearch && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d] flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputSearchRef}
                  type="text"
                  value={inputSearchTerm}
                  onChange={(e) => setInputSearchTerm(e.target.value)}
                  onKeyDown={(e) => handleSearchKeyDown(e, 'input')}
                  placeholder="Find... (Enter: next, Shift+Enter: prev)"
                  className="w-full pl-8 pr-8 py-1.5 text-sm bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9]"
                />
                {inputSearchTerm && (
                  <button
                    onClick={() => setInputSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="relative">
                <Replace size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={replaceTerm}
                  onChange={(e) => setReplaceTerm(e.target.value)}
                  onKeyDown={(e) => handleSearchKeyDown(e, 'input')}
                  placeholder="Replace..."
                  className="w-32 pl-8 pr-2 py-1.5 text-sm bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9]"
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-[#8b949e] whitespace-nowrap">
                  {inputMatches.length > 0 ? `${inputCurrentMatchIndex + 1} of ${inputMatches.length}` : 'No matches'}
                </span>
                <button
                  onClick={() => navigateMatch('prev', 'input')}
                  disabled={inputMatches.length === 0}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-[#8b949e]"
                  title="Previous (Shift+Enter)"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => navigateMatch('next', 'input')}
                  disabled={inputMatches.length === 0}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-[#8b949e]"
                  title="Next (Enter)"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <button
                onClick={handleReplace}
                disabled={inputMatches.length === 0}
                className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Replace
              </button>
              <button
                onClick={handleReplaceAll}
                disabled={inputMatches.length === 0}
                className="px-3 py-1.5 text-xs font-medium bg-gray-600 hover:bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Replace All
              </button>
            </div>
          )}

          {/* Input Editor */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Line Numbers */}
            <div 
              ref={inputLineNumbersRef}
              className="py-3 bg-white dark:bg-[#0d1117] text-xs font-mono overflow-hidden min-w-[40px]"
              style={{ lineHeight: '1.5rem' }}
            >
              {renderLineNumbers(inputLineCount)}
            </div>
            
            {/* Editor Container */}
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-[#0d1117]">
              {/* Highlight Layer - only shown when searching with matches */}
              {showInputSearch && inputSearchTerm && inputMatches.length > 0 && (
                <div
                  ref={highlightLayerRef}
                  className="absolute inset-0 w-full h-full font-mono text-sm py-3 px-2 overflow-auto pointer-events-none z-0 whitespace-pre-wrap break-words"
                  style={{ lineHeight: '1.5rem', wordBreak: 'break-word' }}
                  aria-hidden="true"
                >
                  {renderHighlightedInput()}
                </div>
              )}
              
              {/* Textarea */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onScroll={handleInputScroll}
                placeholder="Paste your JSON or YAML here..."
                className={clsx(
                  "absolute inset-0 w-full h-full font-mono text-sm resize-none outline-none py-3 px-2 overflow-auto z-10 whitespace-pre-wrap break-words",
                  showInputSearch && inputSearchTerm && inputMatches.length > 0
                    ? "bg-transparent text-transparent caret-gray-900 dark:caret-white"
                    : "bg-transparent text-gray-900 dark:text-[#c9d1d9]"
                )}
                style={{ lineHeight: '1.5rem', wordBreak: 'break-word' }}
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div 
          ref={outputPanelRef}
          className="flex-1 flex flex-col min-w-0"
          onFocus={() => setFocusedSection('output')}
          onClick={() => setFocusedSection('output')}
        >
          {/* Output Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-[#0d1117] border-b border-gray-200 dark:border-[#30363d]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Output</span>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => setOutputFormat('json')}
                  className={clsx(
                    'px-3 py-1 rounded text-xs font-medium transition-colors border',
                    outputFormat === 'json'
                      ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                      : 'text-[#8b949e] border-[#30363d] hover:text-[#c9d1d9] hover:border-[#8b949e]'
                  )}
                >
                  JSON
                </button>
                <button
                  onClick={() => setOutputFormat('yaml')}
                  className={clsx(
                    'px-3 py-1 rounded text-xs font-medium transition-colors border',
                    outputFormat === 'yaml'
                      ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                      : 'text-[#8b949e] border-[#30363d] hover:text-[#c9d1d9] hover:border-[#8b949e]'
                  )}
                >
                  YAML
                </button>
              </div>
            </div>
            {/* Icons on the right - Search then Copy */}
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleSearchToggle('output')}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  showOutputSearch 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                )}
                title="Search (Ctrl+F) - Supports path search like 'friends.name'"
              >
                <Search size={16} />
              </button>
              <button
                onClick={handleCopy}
                disabled={!output}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  output
                    ? 'hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                    : 'text-gray-300 dark:text-[#30363d] cursor-not-allowed'
                )}
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Search Bar for Output */}
          {showOutputSearch && (
            <div className="px-4 py-2 bg-gray-50 dark:bg-[#161b22] border-b border-gray-200 dark:border-[#30363d] flex items-center gap-2">
              <div className="flex-1 relative">
                <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={outputSearchRef}
                  type="text"
                  value={outputSearchTerm}
                  onChange={(e) => setOutputSearchTerm(e.target.value)}
                  onKeyDown={(e) => handleSearchKeyDown(e, 'output')}
                  placeholder="Search... (e.g., 'friends' or 'friends.name')"
                  className="w-full pl-8 pr-8 py-1.5 text-sm bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9]"
                />
                {outputSearchTerm && (
                  <button
                    onClick={() => setOutputSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-[#8b949e] whitespace-nowrap">
                  {outputMatches.length > 0 ? `${outputCurrentMatchIndex + 1} of ${outputMatches.length}` : 'No matches'}
                </span>
                <button
                  onClick={() => navigateMatch('prev', 'output')}
                  disabled={outputMatches.length === 0}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-[#8b949e]"
                  title="Previous (Shift+Enter)"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  onClick={() => navigateMatch('next', 'output')}
                  disabled={outputMatches.length === 0}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-[#8b949e]"
                  title="Next (Enter)"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Output Display */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line Numbers */}
            <div 
              ref={outputLineNumbersRef}
              className="py-3 bg-white dark:bg-[#0d1117] text-xs font-mono overflow-hidden min-w-[40px]"
              style={{ lineHeight: '1.5rem' }}
            >
              {renderLineNumbers(outputLineCount)}
            </div>
            
            {/* Output Content */}
            <div
              ref={outputRef}
              onScroll={handleOutputScroll}
              className="flex-1 bg-white dark:bg-[#0d1117] font-mono text-sm py-3 px-2 overflow-auto"
              style={{ lineHeight: '1.5rem', whiteSpace: 'pre' }}
            >
              {error ? (
                <div className="text-red-600 dark:text-[#f85149]">{error}</div>
              ) : output ? (
                <div className="text-gray-900 dark:text-[#c9d1d9]">
                  {outputFormat === 'json' 
                    ? highlightJSONWithSearch(output, outputMatches, outputCurrentMatchIndex)
                    : highlightYAMLWithSearch(output, outputMatches, outputCurrentMatchIndex)
                  }
                </div>
              ) : (
                <div className="text-gray-400 dark:text-[#484f58]">Formatted output will appear here...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-start px-4 py-2 bg-white dark:bg-[#0d1117] border-t border-gray-200 dark:border-[#30363d]">
        <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-[#3fb950]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-[#3fb950]"></span>
          <span>Instant tools. No sign-up. No data sent to any server.</span>
        </div>
      </div>
    </div>
  );
};
