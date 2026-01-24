import React, { useState, useEffect } from 'react';
import { Copy, Check, X, LockOpen, FileJson, Globe, Lock } from 'lucide-react';
import clsx from 'clsx';

type Mode = 'decode' | 'encode';
type EncodingType = 'base64' | 'url' | 'auto';

export const Decoder: React.FC = () => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<Mode>('decode');
  const [encodingType, setEncodingType] = useState<EncodingType>('auto');
  const [detectedType, setDetectedType] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('decoder');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInput(data.input || '');
        setMode(data.mode || 'decode');
        setEncodingType(data.encodingType || 'auto');
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('decoder', JSON.stringify({ input, mode, encodingType }));
  }, [input, mode, encodingType]);

  useEffect(() => {
    if (!input.trim()) {
      setDetectedType(null);
      setOutput('');
      setError(null);
      return;
    }

    if (mode === 'encode') {
      // ENCODE MODE
      try {
        if (encodingType === 'base64' || encodingType === 'auto') {
          const encoded = btoa(input);
          setDetectedType('Base64');
          setOutput(encoded);
          setError(null);
        } else if (encodingType === 'url') {
          const encoded = encodeURIComponent(input);
          setDetectedType('URL-encoded');
          setOutput(encoded);
          setError(null);
        }
      } catch (e) {
        setError('Failed to encode. Make sure the input contains valid characters.');
        setOutput('');
        setDetectedType(null);
      }
    } else {
      // DECODE MODE
      // Try to decode as JWT first (has 3 parts separated by dots)
      if (input.split('.').length === 3) {
        try {
          const parts = input.split('.');
          const header = JSON.parse(atob(parts[0]));
          const payload = JSON.parse(atob(parts[1]));
          
          setDetectedType('JWT (JSON Web Token)');
          setOutput(JSON.stringify({ header, payload }, null, 2));
          setError(null);
          return;
        } catch (e) {
          // Not a valid JWT, continue to other decoders
        }
      }

      // Try Base64
      try {
        const decoded = atob(input);
        // Check if it looks like valid text (no control characters except newline/tab)
        if (/^[\x20-\x7E\n\r\t]*$/.test(decoded)) {
          setDetectedType('Base64');
          setOutput(decoded);
          setError(null);
          return;
        }
      } catch (e) {
        // Not valid Base64, continue
      }

      // Try URL-encoded
      try {
        const decoded = decodeURIComponent(input);
        if (decoded !== input) {
          setDetectedType('URL-encoded');
          setOutput(decoded);
          setError(null);
          return;
        }
      } catch (e) {
        // Not valid URL encoding, continue
      }

      // Try double URL-encoded
      try {
        const decoded = decodeURIComponent(decodeURIComponent(input));
        if (decoded !== input) {
          setDetectedType('URL-encoded (double)');
          setOutput(decoded);
          setError(null);
          return;
        }
      } catch (e) {
        // Not valid
      }

      // If nothing worked
      setDetectedType(null);
      setOutput('');
      setError('Unable to detect encoding type. Try Base64, URL-encoded, or JWT format.');
    }
  }, [input, mode, encodingType]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getTypeIcon = () => {
    if (detectedType?.includes('JWT')) return <FileJson size={16} />;
    if (detectedType?.includes('URL')) return <Globe size={16} />;
    return mode === 'encode' ? <Lock size={16} /> : <LockOpen size={16} />;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1117]">
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Input Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0">
          {/* Input Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Input</span>
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#21262d] rounded-lg p-0.5">
              <button
                onClick={() => setMode('decode')}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  mode === 'decode'
                    ? 'bg-white dark:bg-[#30363d] text-gray-900 dark:text-[#c9d1d9] shadow-sm'
                    : 'text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-[#c9d1d9]'
                )}
              >
                Decode
              </button>
              <button
                onClick={() => setMode('encode')}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  mode === 'encode'
                    ? 'bg-white dark:bg-[#30363d] text-gray-900 dark:text-[#c9d1d9] shadow-sm'
                    : 'text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-[#c9d1d9]'
                )}
              >
                Encode
              </button>
            </div>
          </div>

          {/* Encoding Type Selector (only for encode mode) */}
          {mode === 'encode' && (
            <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">Encoding Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setEncodingType('base64')}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium rounded border transition-colors',
                    encodingType === 'base64' || encodingType === 'auto'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-[#8b949e] border-gray-200 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-[#8b949e]'
                  )}
                >
                  Base64
                </button>
                <button
                  onClick={() => setEncodingType('url')}
                  className={clsx(
                    'px-3 py-1.5 text-xs font-medium rounded border transition-colors',
                    encodingType === 'url'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'text-gray-600 dark:text-[#8b949e] border-gray-200 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-[#8b949e]'
                  )}
                >
                  URL
                </button>
              </div>
            </div>
          )}

          {/* Input Textarea */}
          <div className="flex-1 flex flex-col px-4 py-3">
            <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">
              {mode === 'encode' ? 'Plain Text' : 'Encoded String'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste your encoded string here (Base64, URL-encoded, or JWT)...'}
              className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9] resize-none"
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-[#6e7681]">
              {mode === 'encode' ? 'Select encoding type above' : 'Supports: Base64, URL-encoded, JWT (auto-detects format)'}
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Output Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Output</span>
            {output && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <Check size={16} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={16} />}
              </button>
            )}
          </div>

          {/* Detected Type */}
          {detectedType && (
            <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2">
                {getTypeIcon()}
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  <span className="font-medium">{mode === 'encode' ? 'Encoding:' : 'Detected:'}</span> {detectedType}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <div className="flex items-start gap-2">
                <X size={16} className="text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
              </div>
            </div>
          )}

          {/* Output */}
          <div className="flex-1 overflow-auto px-4 py-3">
            <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">
              {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
            </label>
            {output ? (
              <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d] min-h-[200px]">
                {detectedType?.includes('JWT') ? (
                  <pre className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] whitespace-pre-wrap overflow-auto">
                    {output}
                  </pre>
                ) : (
                  <div className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] whitespace-pre-wrap break-all">
                    {output}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d] min-h-[200px] flex items-center justify-center">
                <div className="text-sm text-gray-400 dark:text-[#484f58]">
                  {input 
                    ? (mode === 'encode' ? 'Unable to encode input' : 'Unable to decode input') 
                    : (mode === 'encode' ? 'Enter text to see the encoded result' : 'Enter an encoded string to see the decoded result')}
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
