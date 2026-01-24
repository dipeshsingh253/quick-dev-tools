import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

export const UrlInspector: React.FC = () => {
  const [input, setInput] = useState('');
  const [parsedUrl, setParsedUrl] = useState<URL | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('urlInspector');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInput(data.input || '');
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('urlInspector', JSON.stringify({ input }));
  }, [input]);

  useEffect(() => {
    if (!input.trim()) {
      setParsedUrl(null);
      setError(null);
      return;
    }

    try {
      const url = new URL(input);
      setParsedUrl(url);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setParsedUrl(null);
    }
  }, [input]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderUrlRow = (label: string, value: string | null, copyKey: string) => {
    const displayValue = value || '(none)';
    const hasValue = value && value.length > 0;

    return (
      <div className="flex border-b border-gray-200 dark:border-[#30363d] last:border-b-0">
        <div className="w-32 flex-shrink-0 px-4 py-3 bg-gray-50 dark:bg-[#161b22] border-r border-gray-200 dark:border-[#30363d]">
          <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e]">{label}</span>
        </div>
        <div className="flex-1 px-4 py-3 flex items-center justify-between min-w-0">
          <span className={clsx(
            "text-sm font-mono break-all",
            hasValue ? "text-gray-900 dark:text-[#c9d1d9]" : "text-gray-400 dark:text-[#484f58]"
          )}>
            {displayValue}
          </span>
          {hasValue && (
            <button
              onClick={() => handleCopy(value!, copyKey)}
              className="ml-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#8b949e] transition-colors flex-shrink-0"
              title={`Copy ${label}`}
            >
              {copied === copyKey ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderQueryParams = () => {
    if (!parsedUrl || parsedUrl.searchParams.size === 0) return null;

    const params = Array.from(parsedUrl.searchParams.entries());

    return (
      <div className="mt-4">
        <div className="text-xs font-medium text-gray-500 dark:text-[#8b949e] mb-2 px-1">
          Query Parameters ({params.length})
        </div>
        <div className="rounded-lg border border-gray-200 dark:border-[#30363d] overflow-hidden">
          {params.map(([key, value], index) => (
            <div key={index} className="flex border-b border-gray-200 dark:border-[#30363d] last:border-b-0">
              <div className="px-4 py-3 flex items-start gap-2 flex-1 min-w-0">
                <LinkIcon size={14} className="text-gray-400 dark:text-[#6e7681] mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-gray-500 dark:text-[#8b949e] mb-1">{key}</div>
                  <div className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] break-all">
                    {value || <span className="text-gray-400 dark:text-[#484f58]">(empty)</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleCopy(`${key}=${value}`, `param-${index}`)}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-400 dark:text-[#6e7681] hover:text-gray-600 dark:hover:text-[#8b949e] transition-colors flex-shrink-0"
                  title="Copy parameter"
                >
                  {copied === `param-${index}` ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1117]">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0">
          {/* Input Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">URL Input</span>
          </div>

          {/* Input Textarea */}
          <div className="flex-1 flex flex-col px-4 py-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com/path?param=value"
              className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9] resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {/* Output Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] sticky top-0 bg-white dark:bg-[#0d1117] z-10">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">URL Components</span>
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <X size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
              </div>
            </div>
          )}

          {/* Parsed URL Components */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {parsedUrl ? (
              <>
                {/* URL Components Table */}
                <div className="rounded-lg border border-gray-200 dark:border-[#30363d] overflow-hidden">
                  {renderUrlRow('Protocol', parsedUrl.protocol, 'protocol')}
                  {renderUrlRow('Origin', parsedUrl.origin, 'origin')}
                  {renderUrlRow('Hostname', parsedUrl.hostname, 'hostname')}
                  {renderUrlRow('Port', parsedUrl.port || '(default)', 'port')}
                  {renderUrlRow('Path', parsedUrl.pathname, 'path')}
                  {renderUrlRow('Query String', parsedUrl.search || null, 'search')}
                  {renderUrlRow('Fragment', parsedUrl.hash || null, 'fragment')}
                </div>

                {/* Query Parameters */}
                {renderQueryParams()}
              </>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d] flex items-center justify-center min-h-[200px]">
                <div className="text-sm text-gray-400 dark:text-[#484f58]">
                  {input ? 'Invalid URL format' : 'Enter a URL to see its parsed components'}
                </div>
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
