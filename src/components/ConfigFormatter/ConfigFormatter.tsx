import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import {
  detectFormat,
  formatJSON,
  formatYAML,
  convertToYAML,
  convertToJSON,
} from '../../utils/configParser';
import type { ConfigFormat } from '../../types';

type OutputFormat = 'json' | 'yaml';

// Syntax highlighting for JSON
const highlightJSON = (json: string): React.ReactNode[] => {
  const lines = json.split('\n');
  return lines.map((line, index) => {
    const highlighted = line
      .replace(/"([^"]+)":/g, '<span class="text-[#7ee787]">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="text-[#a5d6ff]">"$1"</span>')
      .replace(/: (\d+\.?\d*)/g, ': <span class="text-[#79c0ff]">$1</span>')
      .replace(/: (true|false)/g, ': <span class="text-[#ff7b72]">$1</span>')
      .replace(/: (null)/g, ': <span class="text-[#ff7b72]">$1</span>');
    
    return (
      <div key={index} dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
    );
  });
};

// Syntax highlighting for YAML
const highlightYAML = (yaml: string): React.ReactNode[] => {
  const lines = yaml.split('\n');
  return lines.map((line, index) => {
    let highlighted = line;
    // Keys (before colon)
    highlighted = highlighted.replace(/^(\s*)([^:\s][^:]*):/, '$1<span class="text-[#7ee787]">$2</span>:');
    // String values
    highlighted = highlighted.replace(/: (['"]?)([^'"[\]{}\n]+)\1$/g, ': <span class="text-[#a5d6ff]">$1$2$1</span>');
    // Numbers
    highlighted = highlighted.replace(/: (\d+\.?\d*)$/g, ': <span class="text-[#79c0ff]">$1</span>');
    // Booleans
    highlighted = highlighted.replace(/: (true|false)$/gi, ': <span class="text-[#ff7b72]">$1</span>');
    // Null
    highlighted = highlighted.replace(/: (null|~)$/gi, ': <span class="text-[#ff7b72]">$1</span>');
    // List items
    highlighted = highlighted.replace(/^(\s*)- /, '$1<span class="text-[#8b949e]">-</span> ');
    
    return (
      <div key={index} dangerouslySetInnerHTML={{ __html: highlighted || '&nbsp;' }} />
    );
  });
};

export const ConfigFormatter: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<ConfigFormat>('json');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('json');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputLineNumbersRef = useRef<HTMLDivElement>(null);
  const outputLineNumbersRef = useRef<HTMLDivElement>(null);

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
      
      // Format to the desired output format
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
    if (inputLineNumbersRef.current) {
      inputLineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
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

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1117]">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0">
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
            <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors">
              <Search size={16} />
            </button>
          </div>
          
          {/* Input Editor */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line Numbers */}
            <div 
              ref={inputLineNumbersRef}
              className="py-3 bg-white dark:bg-[#0d1117] text-xs font-mono overflow-hidden min-w-[40px]"
              style={{ lineHeight: '1.5rem' }}
            >
              {renderLineNumbers(inputLineCount)}
            </div>
            
            {/* Textarea */}
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onScroll={handleInputScroll}
              placeholder="Paste your JSON or YAML here..."
              className="flex-1 bg-white dark:bg-[#0d1117] text-gray-900 dark:text-[#c9d1d9] font-mono text-sm resize-none outline-none py-3 px-2 overflow-auto"
              style={{ lineHeight: '1.5rem' }}
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-w-0">
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
            <button
              onClick={handleCopy}
              disabled={!output}
              className={clsx(
                'p-1.5 rounded transition-colors',
                output
                  ? 'hover:bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9]'
                  : 'text-[#30363d] cursor-not-allowed'
              )}
              title="Copy to clipboard"
            >
              {copied ? <Check size={16} className="text-[#3fb950]" /> : <Copy size={16} />}
            </button>
          </div>

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
                  {outputFormat === 'json' ? highlightJSON(output) : highlightYAML(output)}
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
          <span>Instant tools. No sign-up. No data sent.</span>
        </div>
      </div>
    </div>
  );
};
