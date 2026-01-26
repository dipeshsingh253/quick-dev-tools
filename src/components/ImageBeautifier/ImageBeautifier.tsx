import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Image as ImageIcon, RefreshCw, Copy } from 'lucide-react';
import clsx from 'clsx';

const gradientPresets = [
  { start: '#667eea', end: '#764ba2' }, // Blue to Purple
  { start: '#f093fb', end: '#f5576c' }, // Pink to Red
  { start: '#4facfe', end: '#00f2fe' }, // Blue to Cyan
  { start: '#43e97b', end: '#38f9d7' }, // Green to Cyan
  { start: '#fa709a', end: '#fee140' }, // Pink to Yellow
  { start: '#30cfd0', end: '#330867' }, // Cyan to Purple
  { start: '#a8eb12', end: '#00d4ff' }, // Green to Blue
  { start: '#ff0844', end: '#ffb199' }, // Red to Peach
];

const anglePresets = [0, 45, 90, 135, 180, 225, 270, 315];
const paddingPresets = [32, 48, 64, 96, 128];

export const ImageBeautifier: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#667eea');
  const [gradientColor1, setGradientColor1] = useState('#667eea');
  const [gradientColor2, setGradientColor2] = useState('#764ba2');
  const [useGradient, setUseGradient] = useState(true);
  const [gradientRotation, setGradientRotation] = useState(135);
  const [borderRadius, setBorderRadius] = useState(12);
  const [padding, setPadding] = useState(64);
  const [shadow, setShadow] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageUpload(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImage(event.target?.result as string);
          };
          reader.readAsDataURL(blob);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste]);

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = 'beautified-image.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopy = async () => {
    if (!canvasRef.current || !image) return;

    try {
      // Check if Clipboard API is supported
      if (!navigator.clipboard || !ClipboardItem) {
        alert('Copy to clipboard is not supported in this browser. Please use the Download button instead.');
        return;
      }

      const canvas = canvasRef.current;
      
      // Convert canvas to blob using Promise-based approach
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });

      if (!blob) {
        throw new Error('Failed to create blob from canvas');
      }
      
      // Use Clipboard API to copy the image
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);
    } catch (err) {
      console.error('Failed to copy image:', err);
      alert('Failed to copy image to clipboard. Please try downloading instead.');
    }
  };

  const swapColors = () => {
    const temp = gradientColor1;
    setGradientColor1(gradientColor2);
    setGradientColor2(temp);
  };

  const getGradientStyle = (start: string, end: string, angle: number = gradientRotation) => {
    return `linear-gradient(${angle}deg, ${start}, ${end})`;
  };

  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new window.Image();
    img.onload = () => {
      const paddingValue = padding;
      const borderRadiusValue = borderRadius;
      
      canvas.width = img.width + paddingValue * 2;
      canvas.height = img.height + paddingValue * 2;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (useGradient) {
        const angle = gradientRotation * Math.PI / 180;
        const x1 = canvas.width / 2 - Math.cos(angle) * canvas.width;
        const y1 = canvas.height / 2 - Math.sin(angle) * canvas.height;
        const x2 = canvas.width / 2 + Math.cos(angle) * canvas.width;
        const y2 = canvas.height / 2 + Math.sin(angle) * canvas.height;
        
        const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
        gradient.addColorStop(0, gradientColor1);
        gradient.addColorStop(1, gradientColor2);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = backgroundColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw shadow if enabled - draw a shadow rectangle first
      if (shadow) {
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 40;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 15;
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.beginPath();
        ctx.roundRect(
          paddingValue,
          paddingValue,
          img.width,
          img.height,
          borderRadiusValue
        );
        ctx.fill();
        ctx.restore();
      }

      // Draw image with rounded corners
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(
        paddingValue,
        paddingValue,
        img.width,
        img.height,
        borderRadiusValue
      );
      ctx.clip();
      ctx.drawImage(img, paddingValue, paddingValue);
      ctx.restore();
    };
    img.src = image;
  }, [image, backgroundColor, gradientColor1, gradientColor2, useGradient, gradientRotation, borderRadius, padding, shadow]);

  return (
    <div className="h-full flex bg-white dark:bg-[#0d1117]">
      {/* Controls Panel */}
      <div className="w-[540px] flex-shrink-0 border-r border-gray-200 dark:border-[#30363d] overflow-y-auto">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#30363d]">
          <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Controls</span>
        </div>
        
        <div className="p-4 space-y-6">
          {/* Upload Image */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider mb-3">
              Upload Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div
              ref={dropZoneRef}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-[#30363d] hover:border-blue-500 dark:hover:border-[#58a6ff] transition-colors cursor-pointer"
            >
              <Upload size={24} className="text-gray-500 dark:text-[#8b949e]" />
              <span className="text-sm text-gray-500 dark:text-[#8b949e]">Drop an image here, click to upload, or paste from clipboard</span>
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider mb-3">
              Background
            </label>
            
            {/* Gradient/Solid Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-[#30363d] mb-4">
              <button
                onClick={() => setUseGradient(true)}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium transition-colors',
                  useGradient
                    ? 'bg-gray-100 dark:bg-[#21262d] text-gray-900 dark:text-[#c9d1d9]'
                    : 'bg-transparent text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                )}
              >
                Gradient
              </button>
              <button
                onClick={() => setUseGradient(false)}
                className={clsx(
                  'flex-1 py-2 text-sm font-medium transition-colors',
                  !useGradient
                    ? 'bg-gray-100 dark:bg-[#21262d] text-gray-900 dark:text-[#c9d1d9]'
                    : 'bg-transparent text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                )}
              >
                Solid
              </button>
            </div>

            {/* Current Gradient/Color Preview */}
            <div
              className="w-full h-12 rounded-lg mb-4"
              style={{
                background: useGradient
                  ? getGradientStyle(gradientColor1, gradientColor2)
                  : backgroundColor
              }}
            />

            {useGradient && (
              <>
                {/* Presets */}
                <label className="block text-xs text-gray-500 dark:text-[#8b949e] mb-2">Presets</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {gradientPresets.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setGradientColor1(preset.start);
                        setGradientColor2(preset.end);
                      }}
                      className="h-14 rounded-lg transition-transform hover:scale-105"
                      style={{ background: getGradientStyle(preset.start, preset.end) }}
                    />
                  ))}
                </div>

                {/* Start/End Color Pickers */}
                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-[#8b949e] mb-1">Start Color</label>
                    <input
                      type="color"
                      value={gradientColor1}
                      onChange={(e) => setGradientColor1(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-[#8b949e] mb-1">End Color</label>
                    <input
                      type="color"
                      value={gradientColor2}
                      onChange={(e) => setGradientColor2(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                  <button
                    onClick={swapColors}
                    className="mt-4 p-2 rounded-lg bg-gray-100 dark:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9] transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>

                {/* Angle */}
                <div className="mb-4">
                  <label className="block text-xs text-gray-500 dark:text-[#8b949e] mb-2">Angle: {gradientRotation}°</label>
                  <div className="flex gap-1 mb-2">
                    {anglePresets.map((angle) => (
                      <button
                        key={angle}
                        onClick={() => setGradientRotation(angle)}
                        className={clsx(
                          'flex-1 py-1.5 text-xs rounded transition-colors',
                          gradientRotation === angle
                            ? 'bg-blue-100 dark:bg-[#388bfd]/20 text-blue-600 dark:text-[#58a6ff]'
                            : 'bg-gray-100 dark:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                        )}
                      >
                        {angle}°
                      </button>
                    ))}
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={gradientRotation}
                    onChange={(e) => setGradientRotation(Number(e.target.value))}
                    className="w-full accent-[#58a6ff]"
                  />
                </div>
              </>
            )}

            {!useGradient && (
              <div>
                <label className="block text-xs text-gray-500 dark:text-[#8b949e] mb-2">Color</label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
                />
              </div>
            )}
          </div>

          {/* Padding */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider mb-3">
              Padding
            </label>
            <div className="flex gap-1">
              {paddingPresets.map((p) => (
                <button
                  key={p}
                  onClick={() => setPadding(p)}
                  className={clsx(
                    'flex-1 py-2 text-xs rounded transition-colors',
                    padding === p
                      ? 'bg-blue-100 dark:bg-[#388bfd]/20 text-blue-600 dark:text-[#58a6ff]'
                      : 'bg-gray-100 dark:bg-[#21262d] text-gray-500 dark:text-[#8b949e] hover:text-gray-900 dark:hover:text-[#c9d1d9]'
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Corner Radius */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider mb-3">
              Corner Radius: {borderRadius}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full accent-[#58a6ff]"
            />
          </div>

          {/* Shadow Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">
              Shadow
            </label>
            <button
              onClick={() => setShadow(!shadow)}
              className={clsx(
                'w-12 h-6 rounded-full transition-colors relative',
                shadow ? 'bg-blue-500 dark:bg-[#58a6ff]' : 'bg-gray-300 dark:bg-[#30363d]'
              )}
            >
              <div
                className={clsx(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
                  shadow ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#30363d] flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500 dark:text-[#8b949e] uppercase tracking-wider">Preview</span>
          {image && (
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] transition-colors"
              >
                <Copy size={14} />
                <span>Copy</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium text-white bg-[#238636] hover:bg-[#2ea043] transition-colors"
              >
                <Download size={14} />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-[#0d1117] overflow-auto p-8">
          {image ? (
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full"
              style={{ boxShadow: shadow ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : 'none' }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-[#8b949e]">
              <ImageIcon size={64} className="mb-4 opacity-30" strokeWidth={1} />
              <p className="text-sm">Upload an image to see the preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
