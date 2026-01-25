import React, { useState, useEffect, useRef } from 'react';
import { Copy, Check, X } from 'lucide-react';
import clsx from 'clsx';
import type { RegexCheckerState } from '../../types';

export const RegexChecker: React.FC = () => {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState<RegexCheckerState['flags']>({
    g: false,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  });
  const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('regexChecker');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPattern(data.pattern || '');
        setTestString(data.testString || '');
        setFlags(data.flags || flags);
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('regexChecker', JSON.stringify({ pattern, testString, flags }));
  }, [pattern, testString, flags]);

  useEffect(() => {
    // Debounced regex matching
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!pattern) {
        setMatches([]);
        setError(null);
        return;
      }

      try {
        const flagString = Object.entries(flags)
          .filter(([_, enabled]) => enabled)
          .map(([flag]) => flag)
          .join('');

        // Always use global flag internally for finding all matches
        const searchFlagString = flagString.includes('g') ? flagString : flagString + 'g';
        const regex = new RegExp(pattern, searchFlagString);
        const allMatches: RegExpMatchArray[] = [];

        let match;
        while ((match = regex.exec(testString)) !== null) {
          allMatches.push(match);
          // Prevent infinite loop on zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }
        }

        setMatches(allMatches);
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setMatches([]);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [pattern, testString, flags]);

  const handleFlagToggle = (flag: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderHighlightedText = () => {
    if (!pattern || error || matches.length === 0) {
      return <div className="text-gray-400 dark:text-[#484f58] whitespace-pre-wrap">{testString || 'Enter test string to see matches...'}</div>;
    }

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((match, matchIndex) => {
      const matchIndexPos = match.index ?? 0;
      // Add text before match
      if (matchIndexPos > lastIndex) {
        parts.push(
        <span key={`pre-${matchIndex}`} className="text-gray-900 dark:text-[#c9d1d9]">
          {testString.substring(lastIndex, matchIndexPos)}
        </span>
        );
      }

      // Add highlighted match
      parts.push(
        <mark
          key={`match-${matchIndex}`}
          className="bg-yellow-400 dark:bg-yellow-500/50 text-black px-0.5 rounded"
        >
          {match[0]}
        </mark>
      );

      lastIndex = matchIndexPos + match[0].length;
    });

    // Add remaining text
    if (lastIndex < testString.length) {
      parts.push(
        <span key="post" className="text-gray-900 dark:text-[#c9d1d9]">
          {testString.substring(lastIndex)}
        </span>
      );
    }

    return <div className="whitespace-pre-wrap">{parts}</div>;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1117]">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0">
          {/* Input Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Input</span>
          </div>

          {/* Pattern Input */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-1 block">Regex Pattern</label>
              <textarea
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Enter regex pattern (e.g., \\b\\w+\\b)"
                className="w-full h-24 px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9] resize-none"
                spellCheck={false}
              />
            </div>

            {/* Flags */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">Flags</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(flags).map(([flag, enabled]) => (
                  <button
                    key={flag}
                    onClick={() => handleFlagToggle(flag as keyof typeof flags)}
                    className={clsx(
                      'px-3 py-1.5 rounded text-xs font-mono font-medium transition-colors border',
                      enabled
                        ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                        : 'text-[#8b949e] border-[#30363d] hover:text-[#c9d1d9] hover:border-[#8b949e]'
                    )}
                    title={getFlagDescription(flag)}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>

            {/* Test String */}
            <div className="flex-1 flex flex-col min-h-0 px-4 py-2">
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-1 block">Test String</label>
              <textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="Enter text to test against the regex pattern..."
                className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9] resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Output Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Results</span>
            {matches.length > 0 && (
              <span className="text-xs text-gray-600 dark:text-[#8b949e]">
                {matches.length} match{matches.length !== 1 ? 'es' : ''} found
              </span>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <X size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-600 dark:text-red-400">
                  <span className="font-medium">Invalid regex:</span> {error}
                </div>
              </div>
            </div>
          )}

          {/* Highlighted Text */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-[#30363d]">
            <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">Highlighted Matches</label>
            <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d] min-h-[100px] max-h-[200px] overflow-auto">
              {renderHighlightedText()}
            </div>
          </div>

          {/* Match Details */}
          <div className="flex-1 overflow-auto px-4 py-3">
            <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">Match Details</label>
            {matches.length === 0 ? (
              <div className="text-sm text-gray-400 dark:text-[#484f58]">
                {pattern && !error ? 'No matches found' : 'Enter a pattern and test string to see matches'}
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((match, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-[#8b949e]">Match #{index + 1}</span>
                      <button
                        onClick={() => handleCopy(match[0])}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]"
                        title="Copy match"
                      >
                        {copied ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-[#6e7681]">Full match:</span>
                      <div className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] mt-1 bg-white dark:bg-[#0d1117] p-2 rounded border border-gray-200 dark:border-[#30363d]">
                        {match[0]}
                      </div>
                    </div>
                    {match.length > 1 && (
                      <div>
                        <span className="text-xs text-gray-500 dark:text-[#6e7681]">Captured groups:</span>
                        <div className="mt-1 space-y-1">
                          {match.slice(1).map((group, groupIndex) => (
                            <div key={groupIndex} className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] bg-white dark:bg-[#0d1117] p-2 rounded border border-gray-200 dark:border-[#30363d]">
                              <span className="text-gray-500 dark:text-[#6e7681]">${groupIndex + 1}: </span>
                              {group || '<empty>'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-[#6e7681] mt-2">
                      Position: {match.index}, Length: {match[0].length}
                    </div>
                  </div>
                ))}
              </div>
            )}
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

function getFlagDescription(flag: string): string {
  const descriptions: Record<string, string> = {
    g: 'Global - find all matches',
    i: 'Case insensitive',
    m: 'Multiline - ^ and $ match line breaks',
    s: 'Dot matches newline',
    u: 'Unicode',
    y: 'Sticky - match at lastIndex',
  };
  return descriptions[flag] || flag;
}
