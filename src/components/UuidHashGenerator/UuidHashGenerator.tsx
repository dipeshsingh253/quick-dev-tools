import React, { useState, useEffect } from 'react';
import { Copy, Check, Key, RefreshCw, Hash } from 'lucide-react';
import clsx from 'clsx';

type HashAlgorithm = 'sha256' | 'md5';

// MD5 implementation (pure JS for browser compatibility)
function md5(string: string): string {
  function rotateLeft(x: number, n: number): number {
    return (x << n) | (x >>> (32 - n));
  }

  function addUnsigned(x: number, y: number): number {
    const x4 = x & 0x40000000;
    const y4 = y & 0x40000000;
    const x8 = x & 0x80000000;
    const y8 = y & 0x80000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) {
      if (result & 0x40000000) return result ^ 0xc0000000 ^ x8 ^ y8;
      else return result ^ 0x40000000 ^ x8 ^ y8;
    } else return result ^ x8 ^ y8;
  }

  function f(x: number, y: number, z: number): number { return (x & y) | (~x & z); }
  function g(x: number, y: number, z: number): number { return (x & z) | (y & ~z); }
  function h(x: number, y: number, z: number): number { return x ^ y ^ z; }
  function i(x: number, y: number, z: number): number { return y ^ (x | ~z); }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, ac: number): number {
    a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  function convertToWordArray(str: string): number[] {
    const bytes = new TextEncoder().encode(str);
    const numberOfWords = (((bytes.length + 8) >> 6) + 1) << 4;
    const wordArray = new Array(numberOfWords).fill(0);
    for (let i = 0; i < bytes.length; i++) {
      wordArray[i >> 2] |= bytes[i] << ((i % 4) * 8);
    }
    wordArray[bytes.length >> 2] |= 0x80 << ((bytes.length % 4) * 8);
    wordArray[numberOfWords - 2] = bytes.length << 3;
    return wordArray;
  }

  function wordToHex(value: number): string {
    let hex = '';
    for (let i = 0; i <= 3; i++) {
      hex += ((value >> (i * 8)) & 255).toString(16).padStart(2, '0');
    }
    return hex;
  }

  const x = convertToWordArray(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  const S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  const S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  const S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  const S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = ff(a, b, c, d, x[k + 0], S11, 0xd76aa478); d = ff(d, a, b, c, x[k + 1], S12, 0xe8c7b756);
    c = ff(c, d, a, b, x[k + 2], S13, 0x242070db); b = ff(b, c, d, a, x[k + 3], S14, 0xc1bdceee);
    a = ff(a, b, c, d, x[k + 4], S11, 0xf57c0faf); d = ff(d, a, b, c, x[k + 5], S12, 0x4787c62a);
    c = ff(c, d, a, b, x[k + 6], S13, 0xa8304613); b = ff(b, c, d, a, x[k + 7], S14, 0xfd469501);
    a = ff(a, b, c, d, x[k + 8], S11, 0x698098d8); d = ff(d, a, b, c, x[k + 9], S12, 0x8b44f7af);
    c = ff(c, d, a, b, x[k + 10], S13, 0xffff5bb1); b = ff(b, c, d, a, x[k + 11], S14, 0x895cd7be);
    a = ff(a, b, c, d, x[k + 12], S11, 0x6b901122); d = ff(d, a, b, c, x[k + 13], S12, 0xfd987193);
    c = ff(c, d, a, b, x[k + 14], S13, 0xa679438e); b = ff(b, c, d, a, x[k + 15], S14, 0x49b40821);
    a = gg(a, b, c, d, x[k + 1], S21, 0xf61e2562); d = gg(d, a, b, c, x[k + 6], S22, 0xc040b340);
    c = gg(c, d, a, b, x[k + 11], S23, 0x265e5a51); b = gg(b, c, d, a, x[k + 0], S24, 0xe9b6c7aa);
    a = gg(a, b, c, d, x[k + 5], S21, 0xd62f105d); d = gg(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = gg(c, d, a, b, x[k + 15], S23, 0xd8a1e681); b = gg(b, c, d, a, x[k + 4], S24, 0xe7d3fbc8);
    a = gg(a, b, c, d, x[k + 9], S21, 0x21e1cde6); d = gg(d, a, b, c, x[k + 14], S22, 0xc33707d6);
    c = gg(c, d, a, b, x[k + 3], S23, 0xf4d50d87); b = gg(b, c, d, a, x[k + 8], S24, 0x455a14ed);
    a = gg(a, b, c, d, x[k + 13], S21, 0xa9e3e905); d = gg(d, a, b, c, x[k + 2], S22, 0xfcefa3f8);
    c = gg(c, d, a, b, x[k + 7], S23, 0x676f02d9); b = gg(b, c, d, a, x[k + 12], S24, 0x8d2a4c8a);
    a = hh(a, b, c, d, x[k + 5], S31, 0xfffa3942); d = hh(d, a, b, c, x[k + 8], S32, 0x8771f681);
    c = hh(c, d, a, b, x[k + 11], S33, 0x6d9d6122); b = hh(b, c, d, a, x[k + 14], S34, 0xfde5380c);
    a = hh(a, b, c, d, x[k + 1], S31, 0xa4beea44); d = hh(d, a, b, c, x[k + 4], S32, 0x4bdecfa9);
    c = hh(c, d, a, b, x[k + 7], S33, 0xf6bb4b60); b = hh(b, c, d, a, x[k + 10], S34, 0xbebfbc70);
    a = hh(a, b, c, d, x[k + 13], S31, 0x289b7ec6); d = hh(d, a, b, c, x[k + 0], S32, 0xeaa127fa);
    c = hh(c, d, a, b, x[k + 3], S33, 0xd4ef3085); b = hh(b, c, d, a, x[k + 6], S34, 0x4881d05);
    a = hh(a, b, c, d, x[k + 9], S31, 0xd9d4d039); d = hh(d, a, b, c, x[k + 12], S32, 0xe6db99e5);
    c = hh(c, d, a, b, x[k + 15], S33, 0x1fa27cf8); b = hh(b, c, d, a, x[k + 2], S34, 0xc4ac5665);
    a = ii(a, b, c, d, x[k + 0], S41, 0xf4292244); d = ii(d, a, b, c, x[k + 7], S42, 0x432aff97);
    c = ii(c, d, a, b, x[k + 14], S43, 0xab9423a7); b = ii(b, c, d, a, x[k + 5], S44, 0xfc93a039);
    a = ii(a, b, c, d, x[k + 12], S41, 0x655b59c3); d = ii(d, a, b, c, x[k + 3], S42, 0x8f0ccc92);
    c = ii(c, d, a, b, x[k + 10], S43, 0xffeff47d); b = ii(b, c, d, a, x[k + 1], S44, 0x85845dd1);
    a = ii(a, b, c, d, x[k + 8], S41, 0x6fa87e4f); d = ii(d, a, b, c, x[k + 15], S42, 0xfe2ce6e0);
    c = ii(c, d, a, b, x[k + 6], S43, 0xa3014314); b = ii(b, c, d, a, x[k + 13], S44, 0x4e0811a1);
    a = ii(a, b, c, d, x[k + 4], S41, 0xf7537e82); d = ii(d, a, b, c, x[k + 11], S42, 0xbd3af235);
    c = ii(c, d, a, b, x[k + 2], S43, 0x2ad7d2bb); b = ii(b, c, d, a, x[k + 9], S44, 0xeb86d391);
    a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
  }

  return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
}

export const UuidHashGenerator: React.FC = () => {
  const [uuid, setUuid] = useState('');
  const [hashOutput, setHashOutput] = useState('');
  const [hashInput, setHashInput] = useState('');
  const [hashAlgorithm, setHashAlgorithm] = useState<HashAlgorithm>('sha256');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // Generate initial UUID
    generateUUID();
  }, []);

  const generateUUID = () => {
    try {
      const newUuid = crypto.randomUUID();
      setUuid(newUuid);
    } catch (err) {
      console.error('Failed to generate UUID:', err);
    }
  };

  const generateHash = async () => {
    if (!hashInput.trim()) return;

    try {
      if (hashAlgorithm === 'sha256') {
        const encoder = new TextEncoder();
        const data = encoder.encode(hashInput);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setHashOutput(hashHex);
      } else {
        // MD5
        const hashHex = md5(hashInput);
        setHashOutput(hashHex);
      }
    } catch (err) {
      console.error('Failed to generate hash:', err);
    }
  };

  useEffect(() => {
    // Auto-generate hash when input or algorithm changes
    if (hashInput.trim()) {
      generateHash();
    } else {
      setHashOutput('');
    }
  }, [hashInput, hashAlgorithm]);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
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
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Generators</span>
          </div>

          {/* UUID Generator */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-[#30363d]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e]">
                UUID v4
              </label>
              <button
                onClick={generateUUID}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors"
                title="Generate new UUID"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] break-all">
                  {uuid}
                </span>
                <button
                  onClick={() => handleCopy(uuid, 'uuid')}
                  className="ml-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors flex-shrink-0"
                  title="Copy UUID"
                >
                  {copied === 'uuid' ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Hash Generator */}
          <div className="flex-1 flex flex-col px-4 py-4 min-h-0">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] flex items-center gap-2">
                <Hash size={14} />
                Hash Generator
              </label>
            </div>
            <textarea
              value={hashInput}
              onChange={(e) => setHashInput(e.target.value)}
              placeholder="Enter text to hash..."
              className="flex-1 px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9] resize-none mb-3"
              spellCheck={false}
            />
            {/* Algorithm Selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setHashAlgorithm('sha256')}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded border transition-colors',
                  hashAlgorithm === 'sha256'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 dark:text-[#8b949e] border-gray-200 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-[#8b949e]'
                )}
              >
                SHA-256
              </button>
              <button
                onClick={() => setHashAlgorithm('md5')}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium rounded border transition-colors',
                  hashAlgorithm === 'md5'
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'text-gray-600 dark:text-[#8b949e] border-gray-200 dark:border-[#30363d] hover:border-gray-300 dark:hover:border-[#8b949e]'
                )}
              >
                MD5
              </button>
            </div>
          </div>
        </div>

        {/* Output Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Output Header */}
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d]">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Generated Values</span>
          </div>

          {/* UUID Output */}
          <div className="px-4 py-4 border-b border-gray-200 dark:border-[#30363d]">
            <div className="flex items-center gap-2 mb-2">
              <Key size={16} className="text-gray-500 dark:text-[#6e7681]" />
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e]">
                UUID v4
              </label>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] break-all">
                  {uuid}
                </span>
                <button
                  onClick={() => handleCopy(uuid, 'uuid-output')}
                  className="ml-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors flex-shrink-0"
                  title="Copy UUID"
                >
                  {copied === 'uuid-output' ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Hash Output */}
          <div className="flex-1 flex flex-col px-4 py-4 min-h-0">
            <div className="flex items-center gap-2 mb-2">
              <Key size={16} className="text-gray-500 dark:text-[#6e7681]" />
              <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e]">
                {hashAlgorithm === 'sha256' ? 'SHA-256' : 'MD5'} Hash
              </label>
            </div>
            {hashOutput ? (
              <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d]">
                <div className="flex items-start justify-between">
                  <span className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] break-all">
                    {hashOutput}
                  </span>
                  <button
                    onClick={() => handleCopy(hashOutput, 'hash')}
                    className="ml-2 p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors flex-shrink-0"
                    title="Copy hash"
                  >
                    {copied === 'hash' ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d] flex items-center justify-center min-h-[100px]">
                <div className="text-sm text-gray-400 dark:text-[#484f58]">
                  Enter text to generate {hashAlgorithm === 'sha256' ? 'SHA-256' : 'MD5'} hash
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
