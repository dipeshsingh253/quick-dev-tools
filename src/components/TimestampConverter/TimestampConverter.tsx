import React, { useState, useEffect } from 'react';
import { Copy, Check, X, Clock } from 'lucide-react';
import type { TimestampConverterState } from '../../types';

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'local', label: 'Local Time' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

export const TimestampConverter: React.FC = () => {
  const [input, setInput] = useState('');
  const [targetFormat, setTargetFormat] = useState<TimestampConverterState['targetFormat']>('human');
  const [targetTimezone, setTargetTimezone] = useState<string>('local');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem('timestampConverter');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setInput(data.input || '');
        setTargetFormat(data.targetFormat || 'human');
        setTargetTimezone(data.targetTimezone || 'local');
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('timestampConverter', JSON.stringify({ input, targetFormat, targetTimezone }));
  }, [input, targetFormat, targetTimezone]);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }

    try {
      let date: Date;

      // Try parsing as number (Unix timestamp in milliseconds or seconds)
      const numValue = Number(input);
      if (!isNaN(numValue)) {
        // Check if it's seconds (10 digits) or milliseconds (13 digits)
        if (numValue > 1000000000000) {
          date = new Date(numValue);
        } else {
          date = new Date(numValue * 1000);
        }
      } else {
        // Try parsing as ISO string or other formats
        const parsed = Date.parse(input);
        if (!isNaN(parsed)) {
          date = new Date(parsed);
        } else {
          throw new Error('Unsupported timestamp format');
        }
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      // Format the output based on target format and timezone
      const timezone = targetTimezone === 'local' ? undefined : targetTimezone;
      let formattedOutput = '';

      switch (targetFormat) {
        case 'unix':
          formattedOutput = Math.floor(date.getTime() / 1000).toString();
          break;
        case 'iso':
          formattedOutput = date.toISOString();
          break;
        case 'rfc':
          formattedOutput = date.toUTCString();
          break;
        case 'human':
          formattedOutput = formatHumanReadable(date, timezone);
          break;
      }

      setOutput(formattedOutput);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setOutput('');
    }
  }, [input, targetFormat, targetTimezone]);

  const formatHumanReadable = (date: Date, timezone?: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: timezone,
      timeZoneName: 'short',
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
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
              Timestamp
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter timestamp (Unix, ISO, RFC 2822, etc.)..."
              className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9] resize-none"
              spellCheck={false}
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-[#6e7681]">
              Supports: Unix (seconds/ms), ISO 8601, RFC 2822, and other date formats
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

          {/* Format and Timezone Selectors */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-[#30363d] space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-1 block">
                Target Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as TimestampConverterState['targetFormat'])}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9]"
              >
                <option value="unix">Unix Timestamp (seconds)</option>
                <option value="iso">ISO 8601</option>
                <option value="rfc">RFC 2822</option>
                <option value="human">Human Readable</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-1 block">
                Target Timezone
              </label>
              <select
                value={targetTimezone}
                onChange={(e) => setTargetTimezone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9]"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
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

          {/* Converted Output */}
          <div className="flex-1 overflow-auto px-4 py-3">
            <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">
              Converted Timestamp
            </label>
            {output ? (
              <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d] min-h-[100px] flex items-center">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-500 dark:text-[#6e7681] flex-shrink-0" />
                  <span className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] break-all">
                    {output}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d] min-h-[100px] flex items-center justify-center">
                <div className="text-sm text-gray-400 dark:text-[#484f58]">
                  {input ? 'Unable to convert timestamp' : 'Enter a timestamp to see the converted result'}
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
