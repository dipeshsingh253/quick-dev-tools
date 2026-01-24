import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Columns, AlignJustify, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import type { DiffView, DiffMode } from '../../types';

const defaultContent = `# Sample Python Code
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Call the function
result = fibonacci(10)
print(f"Result: {result}")
`;

// Token types for syntax highlighting
type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'function' | 'operator' | 'punctuation' | 'text';

interface Token {
  type: TokenType;
  value: string;
}

// Color map for tokens
const tokenColors: Record<TokenType, string> = {
  keyword: '#ff7b72',    // Red/orange for keywords
  string: '#a5d6ff',     // Light blue for strings
  number: '#79c0ff',     // Cyan for numbers
  comment: '#8b949e',    // Gray for comments
  function: '#d2a8ff',   // Purple for functions
  operator: '#ff7b72',   // Red for operators
  punctuation: '#c9d1d9', // Light gray for punctuation
  text: '#c9d1d9',       // Default text color
};

// Keywords for different languages
const keywords = new Set([
  // Python
  'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
  'with', 'as', 'import', 'from', 'return', 'yield', 'raise', 'pass', 'break',
  'continue', 'lambda', 'and', 'or', 'not', 'in', 'is', 'None', 'True', 'False',
  'async', 'await', 'self',
  // JavaScript/TypeScript
  'function', 'const', 'let', 'var', 'return', 'if', 'else', 'for', 'while',
  'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally', 'throw',
  'new', 'this', 'class', 'extends', 'import', 'export', 'default', 'from',
  'async', 'await', 'typeof', 'instanceof', 'null', 'undefined', 'true', 'false',
  'interface', 'type', 'enum', 'implements', 'private', 'public', 'protected',
  // Java/C++/C
  'public', 'private', 'protected', 'static', 'void', 'int', 'float', 'double',
  'char', 'boolean', 'string', 'String', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'class', 'struct', 'enum',
  'interface', 'extends', 'implements', 'new', 'this', 'super', 'null', 'true', 'false',
  'try', 'catch', 'finally', 'throw', 'throws', 'import', 'package', 'include',
  'using', 'namespace', 'template', 'typename', 'virtual', 'override', 'const',
  'final', 'abstract', 'synchronized', 'volatile', 'transient', 'native',
  // HTML/CSS
  'html', 'head', 'body', 'div', 'span', 'script', 'style', 'link', 'meta',
]);

// Tokenize a line of code
const tokenizeLine = (line: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  
  while (i < line.length) {
    // Skip whitespace but preserve it
    if (/\s/.test(line[i])) {
      let ws = '';
      while (i < line.length && /\s/.test(line[i])) {
        ws += line[i];
        i++;
      }
      tokens.push({ type: 'text', value: ws });
      continue;
    }
    
    // Comments (Python # and // and /* */)
    if (line[i] === '#' || (line[i] === '/' && line[i + 1] === '/')) {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }
    
    // Strings
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\' && i + 1 < line.length) {
          str += line[i] + line[i + 1];
          i += 2;
        } else {
          str += line[i];
          i++;
        }
      }
      if (i < line.length) {
        str += line[i];
        i++;
      }
      tokens.push({ type: 'string', value: str });
      continue;
    }
    
    // Numbers
    if (/\d/.test(line[i])) {
      let num = '';
      while (i < line.length && /[\d.xXa-fA-F]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ type: 'number', value: num });
      continue;
    }
    
    // Identifiers and keywords
    if (/[a-zA-Z_]/.test(line[i])) {
      let ident = '';
      while (i < line.length && /[a-zA-Z0-9_]/.test(line[i])) {
        ident += line[i];
        i++;
      }
      
      // Check if it's a function call
      let isFunction = false;
      let j = i;
      while (j < line.length && /\s/.test(line[j])) j++;
      if (line[j] === '(') {
        isFunction = true;
      }
      
      if (keywords.has(ident)) {
        tokens.push({ type: 'keyword', value: ident });
      } else if (isFunction) {
        tokens.push({ type: 'function', value: ident });
      } else {
        tokens.push({ type: 'text', value: ident });
      }
      continue;
    }
    
    // Operators
    if (/[+\-*/%=<>!&|^~]/.test(line[i])) {
      let op = line[i];
      i++;
      // Handle multi-char operators
      if (i < line.length && /[=<>&|]/.test(line[i])) {
        op += line[i];
        i++;
      }
      tokens.push({ type: 'operator', value: op });
      continue;
    }
    
    // Punctuation
    if (/[()[\]{},;:.]/.test(line[i])) {
      tokens.push({ type: 'punctuation', value: line[i] });
      i++;
      continue;
    }
    
    // Default: single character
    tokens.push({ type: 'text', value: line[i] });
    i++;
  }
  
  return tokens;
};

// Render highlighted line as React elements
const highlightLine = (line: string): React.ReactNode => {
  if (!line) return '\u00A0';
  
  const tokens = tokenizeLine(line);
  
  return tokens.map((token, idx) => (
    <span key={idx} style={{ color: tokenColors[token.type] }}>
      {token.value}
    </span>
  ));
};

// Diff types
type DiffLineType = 'unchanged' | 'added' | 'removed';

interface DiffLine {
  type: DiffLineType;
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

// Compute LCS-based diff
const computeDiff = (oldText: string, newText: string): DiffLine[] => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  
  // Compute LCS matrix
  const m = oldLines.length;
  const n = newLines.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldLines[i - 1] === newLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  // Backtrack to find diff
  const diff: DiffLine[] = [];
  let i = m, j = n;
  const tempDiff: DiffLine[] = [];
  
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldLines[i - 1] === newLines[j - 1]) {
      tempDiff.unshift({
        type: 'unchanged',
        content: oldLines[i - 1],
        oldLineNum: i,
        newLineNum: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tempDiff.unshift({
        type: 'added',
        content: newLines[j - 1],
        newLineNum: j,
      });
      j--;
    } else if (i > 0) {
      tempDiff.unshift({
        type: 'removed',
        content: oldLines[i - 1],
        oldLineNum: i,
      });
      i--;
    }
  }
  
  return tempDiff;
};

// Compute split diff (aligned side by side)
const computeSplitDiff = (oldText: string, newText: string): { left: DiffLine[], right: DiffLine[] } => {
  const diff = computeDiff(oldText, newText);
  const left: DiffLine[] = [];
  const right: DiffLine[] = [];
  
  for (const line of diff) {
    if (line.type === 'unchanged') {
      left.push({ ...line });
      right.push({ ...line });
    } else if (line.type === 'removed') {
      left.push({ ...line });
      right.push({ type: 'unchanged', content: '', oldLineNum: undefined, newLineNum: undefined });
    } else if (line.type === 'added') {
      left.push({ type: 'unchanged', content: '', oldLineNum: undefined, newLineNum: undefined });
      right.push({ ...line });
    }
  }
  
  return { left, right };
};

export const GitDiff: React.FC = () => {
  const [original, setOriginal] = useState(defaultContent);
  const [modified, setModified] = useState(defaultContent);
  const [view, setView] = useState<DiffView>('input');
  const [diffMode, setDiffMode] = useState<DiffMode>('split');
  const [language, setLanguage] = useState('Auto-detect');
  const originalRef = useRef<HTMLTextAreaElement>(null);
  const modifiedRef = useRef<HTMLTextAreaElement>(null);
  const originalLineNumbersRef = useRef<HTMLDivElement>(null);
  const modifiedLineNumbersRef = useRef<HTMLDivElement>(null);
  const leftDiffRef = useRef<HTMLDivElement>(null);
  const rightDiffRef = useRef<HTMLDivElement>(null);

  const getLineCount = useCallback((text: string) => {
    if (!text) return 1;
    return text.split('\n').length;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view === 'input') {
        if (e.ctrlKey && e.key === 'Enter') {
          e.preventDefault();
          setView('diff');
        }
      } else if (view === 'diff') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setView('input');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view]);

  const handleOriginalScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (originalLineNumbersRef.current) {
      originalLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const handleModifiedScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (modifiedLineNumbersRef.current) {
      modifiedLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Sync scroll for diff view
  const handleLeftDiffScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (rightDiffRef.current) {
      rightDiffRef.current.scrollTop = e.currentTarget.scrollTop;
      rightDiffRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleRightDiffScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (leftDiffRef.current) {
      leftDiffRef.current.scrollTop = e.currentTarget.scrollTop;
      leftDiffRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const renderLineNumbers = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div key={i + 1} className="text-right pr-3 text-[#6e7681] select-none">
        {i + 1}
      </div>
    ));
  };

  const originalLineCount = getLineCount(original);
  const modifiedLineCount = getLineCount(modified);

  // Compute diff when in diff view
  const diff = view === 'diff' ? computeDiff(original, modified) : [];
  const splitDiff = view === 'diff' && diffMode === 'split' ? computeSplitDiff(original, modified) : { left: [], right: [] };

  const getLineBackground = (type: DiffLineType) => {
    switch (type) {
      case 'added':
        return 'bg-[#2ea04326]';
      case 'removed':
        return 'bg-[#f8514926]';
      default:
        return '';
    }
  };

  const getLineNumBackground = (type: DiffLineType) => {
    switch (type) {
      case 'added':
        return 'bg-[#2ea0431a]';
      case 'removed':
        return 'bg-[#f851491a]';
      default:
        return '';
    }
  };

  const getLineNumColor = (type: DiffLineType) => {
    switch (type) {
      case 'added':
        return 'text-[#3fb950]';
      case 'removed':
        return 'text-[#f85149]';
      default:
        return 'text-[#6e7681]';
    }
  };

  const renderDiffLine = (line: DiffLine, index: number) => {
    const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
    const prefixColor = line.type === 'added' ? 'text-[#3fb950]' : line.type === 'removed' ? 'text-[#f85149]' : 'text-[#6e7681]';
    
    return (
      <div key={index} className={clsx('flex', getLineBackground(line.type))} style={{ minHeight: '1.5rem' }}>
        <div className={clsx('w-12 text-right pr-2 select-none text-xs flex-shrink-0', getLineNumBackground(line.type), getLineNumColor(line.type))}>
          {line.oldLineNum || ''}
        </div>
        <div className={clsx('w-12 text-right pr-2 select-none text-xs flex-shrink-0 border-r border-[#30363d]', getLineNumBackground(line.type), getLineNumColor(line.type))}>
          {line.newLineNum || ''}
        </div>
        <div className={clsx('w-6 text-center flex-shrink-0', prefixColor)}>{prefix}</div>
        <div 
          className="flex-1 pr-4"
          style={{ whiteSpace: 'pre' }}
        >
          {highlightLine(line.content)}
        </div>
      </div>
    );
  };

  const renderSplitDiffLine = (line: DiffLine, index: number, side: 'left' | 'right') => {
    const lineNum = side === 'left' ? line.oldLineNum : line.newLineNum;
    const isEmpty = !line.content && !lineNum;
    const bgClass = isEmpty ? 'bg-[#161b22]' : getLineBackground(line.type);
    
    return (
      <div key={index} className={clsx('flex', bgClass)} style={{ minHeight: '1.5rem' }}>
        <div className={clsx('w-12 text-right pr-2 select-none text-xs flex-shrink-0', getLineNumBackground(line.type), getLineNumColor(line.type))}>
          {lineNum || ''}
        </div>
        <div 
          className="flex-1 pl-2 pr-4"
          style={{ whiteSpace: 'pre' }}
        >
          {highlightLine(line.content)}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#30363d]">
        <div className="flex items-center gap-4">
          {view === 'input' ? (
            <h2 className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Text Diff</h2>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('input')}
                className="flex items-center gap-1 text-xs text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Edit inputs</span>
              </button>
              <span className="text-gray-300 dark:text-[#30363d]">|</span>
              <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Diff Result</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {view === 'input' ? (
            <>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded text-xs text-gray-900 dark:text-[#c9d1d9] bg-gray-100 dark:bg-[#21262d] border border-gray-300 dark:border-[#30363d] hover:border-gray-400 dark:hover:border-[#8b949e] transition-colors">
                <span>{language}</span>
                <ChevronDown size={14} />
              </button>
              <button
                onClick={() => setView('diff')}
                className="flex items-center gap-2 px-4 py-1.5 rounded text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] transition-colors"
              >
                <span>Compare</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDiffMode('split')}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors border',
                  diffMode === 'split'
                    ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                    : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
                )}
              >
                <Columns size={14} />
                <span>Split</span>
              </button>
              <button
                onClick={() => setDiffMode('unified')}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors border',
                  diffMode === 'unified'
                    ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                    : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
                )}
              >
                <AlignJustify size={14} />
                <span>Unified</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {view === 'input' ? (
          <>
            {/* Original Panel */}
            <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
                <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Original</span>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div 
                  ref={originalLineNumbersRef}
                  className="py-3 bg-white dark:bg-[#0d1117] text-xs font-mono overflow-hidden min-w-[40px]"
                  style={{ lineHeight: '1.5rem' }}
                >
                  {renderLineNumbers(originalLineCount)}
                </div>
                <textarea
                  ref={originalRef}
                  value={original}
                  onChange={(e) => setOriginal(e.target.value)}
                  onScroll={handleOriginalScroll}
                  className="flex-1 bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-mono text-sm resize-none outline-none py-3 px-2 overflow-auto"
                  style={{ lineHeight: '1.5rem' }}
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Modified Panel */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
                <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Modified</span>
              </div>
              <div className="flex-1 flex overflow-hidden">
                <div 
                  ref={modifiedLineNumbersRef}
                  className="py-3 bg-white dark:bg-[#0d1117] text-xs font-mono overflow-hidden min-w-[40px]"
                  style={{ lineHeight: '1.5rem' }}
                >
                  {renderLineNumbers(modifiedLineCount)}
                </div>
                <textarea
                  ref={modifiedRef}
                  value={modified}
                  onChange={(e) => setModified(e.target.value)}
                  onScroll={handleModifiedScroll}
                  className="flex-1 bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-mono text-sm resize-none outline-none py-3 px-2 overflow-auto"
                  style={{ lineHeight: '1.5rem' }}
                  spellCheck={false}
                />
              </div>
            </div>
          </>
        ) : diffMode === 'split' ? (
          <>
            {/* Split Diff - Left (Original) */}
            <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#161b22]">
                <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e]">Original</span>
              </div>
              <div 
                ref={leftDiffRef}
                onScroll={handleLeftDiffScroll}
                className="flex-1 overflow-auto font-mono text-sm"
                style={{ lineHeight: '1.5rem' }}
              >
                {splitDiff.left.map((line, i) => renderSplitDiffLine(line, i, 'left'))}
              </div>
            </div>

            {/* Split Diff - Right (Modified) */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] bg-gray-100 dark:bg-[#161b22]">
                <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e]">Modified</span>
              </div>
              <div 
                ref={rightDiffRef}
                onScroll={handleRightDiffScroll}
                className="flex-1 overflow-auto font-mono text-sm"
                style={{ lineHeight: '1.5rem' }}
              >
                {splitDiff.right.map((line, i) => renderSplitDiffLine(line, i, 'right'))}
              </div>
            </div>
          </>
        ) : (
          // Unified Diff
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-auto font-mono text-sm" style={{ lineHeight: '1.5rem' }}>
              {diff.map((line, i) => renderDiffLine(line, i))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="flex items-center justify-center px-4 py-2 bg-white dark:bg-[#0d1117] border-t border-gray-200 dark:border-[#30363d]">
        <span className="text-xs text-gray-400 dark:text-[#6e7681]">
          {view === 'input' ? (
            <>Press <kbd className="px-1.5 py-0.5 mx-1 rounded bg-gray-100 dark:bg-[#21262d] border border-gray-300 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e]">Ctrl+Enter</kbd> to compare</>
          ) : (
            <>Press <kbd className="px-1.5 py-0.5 mx-1 rounded bg-gray-100 dark:bg-[#21262d] border border-gray-300 dark:border-[#30363d] text-gray-500 dark:text-[#8b949e]">Esc</kbd> to return to input</>
          )}
        </span>
      </div>
    </div>
  );
};
