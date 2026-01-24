import React, { useState, useEffect } from 'react';
import { Copy, Check, Type } from 'lucide-react';

export const TextCaseConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('textCaseConverter');
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
    localStorage.setItem('textCaseConverter', JSON.stringify({ input }));
  }, [input]);

  const toCamelCase = (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, c => c.toLowerCase());
  };

  const toSnakeCase = (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[-\s]+/g, '_')
      .toLowerCase();
  };

  const toPascalCase = (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
      .replace(/^(.)/, c => c.toUpperCase());
  };

  const toKebabCase = (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .toLowerCase();
  };

  const toUpperCase = (str: string): string => {
    return str.toUpperCase();
  };

  const toLowerCase = (str: string): string => {
    return str.toLowerCase();
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const conversions = [
    { name: 'camelCase', value: toCamelCase(input) },
    { name: 'snake_case', value: toSnakeCase(input) },
    { name: 'PascalCase', value: toPascalCase(input) },
    { name: 'kebab-case', value: toKebabCase(input) },
    { name: 'UPPERCASE', value: toUpperCase(input) },
    { name: 'lowercase', value: toLowerCase(input) },
  ];

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

          {/* Input Textarea */}
          <div className="flex-1 flex flex-col px-4 py-3">
            <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">
              Text to Convert
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to convert to different cases..."
              className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9] resize-none"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          {/* Output Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] sticky top-0 bg-white dark:bg-[#0d1117] z-10">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Converted Cases</span>
          </div>

          {/* Conversions */}
          <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
            {conversions.map((conversion) => (
              <div key={conversion.name} className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Type size={14} className="text-gray-500 dark:text-[#6e7681]" />
                    <span className="text-xs font-medium text-gray-700 dark:text-[#8b949e]">
                      {conversion.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(conversion.value, conversion.name)}
                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors"
                    title={`Copy ${conversion.name}`}
                  >
                    {copied === conversion.name ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={14} />}
                  </button>
                </div>
                <div className="p-2 bg-white dark:bg-[#0d1117] rounded border border-gray-200 dark:border-[#30363d]">
                  <span className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] break-all">
                    {conversion.value || <span className="text-gray-400 dark:text-[#484f58] italic">Empty</span>}
                  </span>
                </div>
              </div>
            ))}
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
