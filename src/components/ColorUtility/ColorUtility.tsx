import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Palette } from 'lucide-react';
import clsx from 'clsx';

type Mode = 'convert' | 'picker';

interface ColorValues {
  r: number;
  g: number;
  b: number;
  a: number;
  format: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0').toUpperCase();

const formatAlpha = (value: number) => Number(clamp(value, 0, 1).toFixed(2)).toString();

const normalizeAlpha = (value: number) => {
  if (Number.isNaN(value)) return null;
  if (value > 1 && value <= 100) return value / 100;
  if (value < 0 || value > 1) return null;
  return value;
};

const parseHex = (value: string): ColorValues | null => {
  const match = value.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);
  if (!match) return null;

  const hex = match[1];
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 1;

  if (hex.length === 3 || hex.length === 4) {
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
    if (hex.length === 4) {
      a = parseInt(hex[3] + hex[3], 16) / 255;
    }
  } else {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
    if (hex.length === 8) {
      a = parseInt(hex.slice(6, 8), 16) / 255;
    }
  }

  return { r, g, b, a, format: hex.length === 4 || hex.length === 8 ? 'HEXA' : 'HEX' };
};

const hslToRgb = (h: number, s: number, l: number) => {
  const hue = ((h % 360) + 360) % 360;
  const saturation = clamp(s, 0, 1);
  const lightness = clamp(l, 0, 1);
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hueSegment = hue / 60;
  const x = chroma * (1 - Math.abs((hueSegment % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hueSegment >= 0 && hueSegment < 1) {
    r1 = chroma;
    g1 = x;
  } else if (hueSegment >= 1 && hueSegment < 2) {
    r1 = x;
    g1 = chroma;
  } else if (hueSegment >= 2 && hueSegment < 3) {
    g1 = chroma;
    b1 = x;
  } else if (hueSegment >= 3 && hueSegment < 4) {
    g1 = x;
    b1 = chroma;
  } else if (hueSegment >= 4 && hueSegment < 5) {
    r1 = x;
    b1 = chroma;
  } else {
    r1 = chroma;
    b1 = x;
  }

  const m = lightness - chroma / 2;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const red = clamp(r / 255, 0, 1);
  const green = clamp(g / 255, 0, 1);
  const blue = clamp(b / 255, 0, 1);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case red:
        h = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / delta + 2;
        break;
      default:
        h = (red - green) / delta + 4;
        break;
    }
    h *= 60;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
};

const parseColorInput = (value: string): ColorValues | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const hexValue = parseHex(trimmed);
  if (hexValue) return hexValue;

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)\s*(?:,\s*([+-]?\d*\.?\d+)\s*)?\)$/i
  );

  if (rgbMatch) {
    const r = Number(rgbMatch[1]);
    const g = Number(rgbMatch[2]);
    const b = Number(rgbMatch[3]);
    const alphaRaw = rgbMatch[4];
    const a = alphaRaw !== undefined ? normalizeAlpha(Number(alphaRaw)) : 1;
    if (a === null || [r, g, b].some((channel) => channel < 0 || channel > 255)) {
      return null;
    }
    return {
      r: Math.round(r),
      g: Math.round(g),
      b: Math.round(b),
      a,
      format: alphaRaw !== undefined ? 'RGBA' : 'RGB',
    };
  }

  const hslMatch = trimmed.match(
    /^hsla?\(\s*([+-]?\d*\.?\d+)\s*,\s*([+-]?\d*\.?\d+)%\s*,\s*([+-]?\d*\.?\d+)%\s*(?:,\s*([+-]?\d*\.?\d+)\s*)?\)$/i
  );

  if (hslMatch) {
    const h = Number(hslMatch[1]);
    const s = Number(hslMatch[2]);
    const l = Number(hslMatch[3]);
    const alphaRaw = hslMatch[4];
    const a = alphaRaw !== undefined ? normalizeAlpha(Number(alphaRaw)) : 1;
    if (a === null || s < 0 || s > 100 || l < 0 || l > 100) {
      return null;
    }
    const rgb = hslToRgb(h, s / 100, l / 100);
    return {
      ...rgb,
      a,
      format: alphaRaw !== undefined ? 'HSLA' : 'HSL',
    };
  }

  return null;
};

const formatHex = (color: ColorValues) => {
  const base = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  if (color.a < 1) {
    return `${base}${toHex(color.a * 255)}`;
  }
  return base;
};

const formatRgb = (color: ColorValues) => `rgb(${color.r}, ${color.g}, ${color.b})`;

const formatRgba = (color: ColorValues) => `rgba(${color.r}, ${color.g}, ${color.b}, ${formatAlpha(color.a)})`;

const formatHsl = (color: ColorValues) => {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
};

const formatHsla = (color: ColorValues) => {
  const hsl = rgbToHsl(color.r, color.g, color.b);
  return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${formatAlpha(color.a)})`;
};

export const ColorUtility: React.FC = () => {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('colorUtility');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.mode === 'picker' || data.mode === 'convert') {
          return data.mode as Mode;
        }
      } catch (error) {
        console.error('Failed to parse saved color utility state from localStorage:', error);
      }
    }
    return 'convert';
  });
  const [input, setInput] = useState(() => {
    const saved = localStorage.getItem('colorUtility');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return typeof data.input === 'string' ? data.input : '';
      } catch (error) {
        console.error('Failed to load saved color utility input:', error);
      }
    }
    return '';
  });
  const [pickerColor, setPickerColor] = useState(() => {
    const saved = localStorage.getItem('colorUtility');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (typeof data.pickerColor === 'string') {
          const hex = parseHex(data.pickerColor);
          if (hex) {
            return formatHex(hex);
          }
        }
      } catch (error) {
        console.error('Failed to load saved color picker value:', error);
      }
    }
    return '#6366F1';
  });
  const [pickerAlpha, setPickerAlpha] = useState(() => {
    const saved = localStorage.getItem('colorUtility');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (typeof data.pickerAlpha === 'number') {
          return clamp(data.pickerAlpha, 0, 1);
        }
      } catch (error) {
        console.error('Failed to load saved color picker alpha:', error);
      }
    }
    return 1;
  });
  const [copied, setCopied] = useState<string | null>(null);

  const parsedColor = useMemo(() => parseColorInput(input), [input]);
  const pickerValues = useMemo(() => {
    const parsed = parseHex(pickerColor) ?? { r: 99, g: 102, b: 241, a: 1, format: 'HEX' };
    return { ...parsed, a: pickerAlpha };
  }, [pickerColor, pickerAlpha]);

  const conversionFormats = useMemo(() => {
    if (!parsedColor) return [];
    return [
      { name: 'HEX', value: formatHex(parsedColor) },
      { name: 'RGB', value: formatRgb(parsedColor) },
      { name: 'RGBA', value: formatRgba(parsedColor) },
      { name: 'HSL', value: formatHsl(parsedColor) },
      { name: 'HSLA', value: formatHsla(parsedColor) },
    ];
  }, [parsedColor]);

  const pickerFormats = useMemo(
    () => [
      { name: 'HEX', value: formatHex(pickerValues) },
      { name: 'RGB', value: formatRgb(pickerValues) },
      { name: 'RGBA', value: formatRgba(pickerValues) },
      { name: 'HSL', value: formatHsl(pickerValues) },
      { name: 'HSLA', value: formatHsla(pickerValues) },
    ],
    [pickerValues]
  );

  const conversionError = input.trim() && !parsedColor
    ? 'Unsupported color format. Try HEX, RGB(A), or HSL(A).'
    : null;

  useEffect(() => {
    localStorage.setItem(
      'colorUtility',
      JSON.stringify({
        mode,
        input,
        pickerColor,
        pickerAlpha,
      })
    );
  }, [mode, input, pickerColor, pickerAlpha]);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy color value:', error);
    }
  };

  const renderFormats = (formats: { name: string; value: string }[]) => {
    if (!formats.length) {
      return (
        <div className="text-sm text-gray-400 dark:text-[#6e7681] italic">
          No color detected yet.
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {formats.map((format) => (
          <div
            key={format.name}
            className="p-3 bg-gray-50 dark:bg-[#161b22] rounded border border-gray-200 dark:border-[#30363d]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Palette size={14} className="text-gray-500 dark:text-[#6e7681]" />
                <span className="text-xs font-medium text-gray-700 dark:text-[#8b949e]">
                  {format.name}
                </span>
              </div>
              <button
                onClick={() => handleCopy(format.value, `${mode}-${format.name}`)}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors"
                title={`Copy ${format.name}`}
              >
                {copied === `${mode}-${format.name}`
                  ? <Check size={14} className="text-green-600 dark:text-[#3fb950]" />
                  : <Copy size={14} />}
              </button>
            </div>
            <div className="p-2 bg-white dark:bg-[#0d1117] rounded border border-gray-200 dark:border-[#30363d]">
              <span className="text-sm font-mono text-gray-900 dark:text-[#c9d1d9] break-all">
                {format.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#0d1117]">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-[#30363d] min-w-0">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">
              Color Utility
            </span>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#21262d] rounded-lg p-0.5">
              <button
                onClick={() => setMode('convert')}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  mode === 'convert'
                    ? 'bg-white dark:bg-[#30363d] text-gray-900 dark:text-[#c9d1d9] shadow-sm'
                    : 'text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-[#c9d1d9]'
                )}
              >
                Color Conversion
              </button>
              <button
                onClick={() => setMode('picker')}
                className={clsx(
                  'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                  mode === 'picker'
                    ? 'bg-white dark:bg-[#30363d] text-gray-900 dark:text-[#c9d1d9] shadow-sm'
                    : 'text-gray-500 dark:text-[#8b949e] hover:text-gray-700 dark:hover:text-[#c9d1d9]'
                )}
              >
                Color Picker
              </button>
            </div>
          </div>

          <div className="flex-1 flex flex-col px-4 py-3 gap-4">
            {mode === 'convert' ? (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">
                    Paste a color value
                  </label>
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="e.g. #6366f1, rgb(99, 102, 241), hsl(230, 86%, 60%)"
                    className="w-full px-3 py-2 text-sm font-mono bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-[#30363d] rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-[#c9d1d9]"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#8b949e]">
                  <div
                    className="w-4 h-4 rounded border border-gray-200 dark:border-[#30363d]"
                    style={{
                      backgroundColor: parsedColor ? formatRgba(parsedColor) : 'transparent',
                    }}
                  />
                  <span>
                    {parsedColor ? `Detected: ${parsedColor.format}` : 'Paste a color to detect its format.'}
                  </span>
                </div>
                {conversionError && (
                  <div className="text-xs text-red-600 dark:text-[#f85149]">
                    {conversionError}
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs font-medium text-gray-700 dark:text-[#8b949e] mb-2 block">
                    Pick a color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={pickerColor}
                      onChange={(event) => setPickerColor(event.target.value)}
                      className="h-10 w-14 rounded border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#0d1117] cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="text-[11px] text-gray-500 dark:text-[#8b949e] mb-1">
                        Selected HEX
                      </div>
                      <div className="px-3 py-2 text-sm font-mono bg-gray-50 dark:bg-[#161b22] border border-gray-200 dark:border-[#30363d] rounded text-gray-900 dark:text-[#c9d1d9]">
                        {pickerColor.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-[#8b949e] mb-2">
                    <span>Opacity</span>
                    <span>{Math.round(pickerAlpha * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={Math.round(pickerAlpha * 100)}
                    onChange={(event) => setPickerAlpha(Number(event.target.value) / 100)}
                    className="w-full accent-blue-500"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0 overflow-auto">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-[#30363d] sticky top-0 bg-white dark:bg-[#0d1117] z-10 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">
              {mode === 'convert' ? 'Converted Formats' : 'Picked Formats'}
            </span>
            <div
              className="w-4 h-4 rounded border border-gray-200 dark:border-[#30363d]"
              style={{
                backgroundColor: mode === 'convert' && parsedColor
                  ? formatRgba(parsedColor)
                  : formatRgba(pickerValues),
              }}
            />
          </div>
          <div className="flex-1 overflow-auto px-4 py-3">
            {renderFormats(mode === 'convert' ? conversionFormats : pickerFormats)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start px-4 py-2 bg-white dark:bg-[#0d1117] border-t border-gray-200 dark:border-[#30363d]">
        <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-[#3fb950]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-[#3fb950]"></span>
          <span>Instant tools. No sign-up. No data sent to any server.</span>
        </div>
      </div>
    </div>
  );
};
