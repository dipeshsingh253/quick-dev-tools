import React, { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Edit, Eye, Columns } from 'lucide-react';
import clsx from 'clsx';
import type { MarkdownMode } from '../../types';

const defaultContent = `# Welcome to Markdown Preview

This is a **live preview** of your Markdown content.

## Features

- Real-time rendering
- GitHub Flavored Markdown support
- Syntax highlighting for code
- Synchronized scrolling in split view

## Code Example

\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## Table Example

| Feature | Status |
|---------|--------|
| Tables | ✅ |
| Lists | ✅ |
| Links | ✅ |
| Code Highlighting | ✅ |

> "Markdown is intended to be as easy-to-read and easy-to-write as is feasible."

---

Happy writing! ✍

**test**
\`code\`
`;

export const MarkdownPreview: React.FC = () => {
  const [content, setContent] = useState(defaultContent);
  const [mode, setMode] = useState<MarkdownMode>('split');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const getLineCount = useCallback((text: string) => {
    if (!text) return 1;
    return text.split('\n').length;
  }, []);

  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    
    if (mode === 'split' && previewRef.current && editorRef.current) {
      const editor = e.currentTarget;
      const scrollPercentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      const previewScrollTop = scrollPercentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
      previewRef.current.scrollTop = previewScrollTop;
    }
  };

  const renderLineNumbers = (count: number) => {
    return Array.from({ length: count }, (_, i) => (
      <div key={i + 1} className="text-right pr-3 text-[#6e7681] select-none">
        {i + 1}
      </div>
    ));
  };

  const lineCount = getLineCount(content);

  return (
    <div className="h-full flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#30363d]">
        <h2 className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Markdown Preview</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode('edit')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-xs font-medium border',
              mode === 'edit'
                ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
            )}
            title="Edit mode"
          >
            <Edit size={14} />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMode('split')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-xs font-medium border',
              mode === 'split'
                ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
            )}
            title="Split mode"
          >
            <Columns size={14} />
            <span>Split</span>
          </button>
          <button
            onClick={() => setMode('preview')}
            className={clsx(
              'flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors text-xs font-medium border',
              mode === 'preview'
                ? 'bg-[#388bfd]/20 text-[#58a6ff] border-[#388bfd]/50'
                : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
            )}
            title="Preview mode"
          >
            <Eye size={14} />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Panel */}
        {(mode === 'edit' || mode === 'split') && (
          <div className={clsx(
            'flex flex-col min-w-0',
            mode === 'split' ? 'flex-1 border-r border-[#30363d]' : 'flex-1'
          )}>
            {/* Editor Header */}
            <div className="px-4 py-2 border-b border-[#30363d]">
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Editor</span>
            </div>
            
            {/* Editor Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Line Numbers */}
              <div 
                ref={lineNumbersRef}
                className="py-3 bg-[#0d1117] text-xs font-mono overflow-hidden min-w-[40px]"
                style={{ lineHeight: '1.5rem' }}
              >
                {renderLineNumbers(lineCount)}
              </div>
              
              {/* Textarea */}
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onScroll={handleEditorScroll}
                className="flex-1 bg-[#0d1117] text-[#c9d1d9] font-mono text-sm resize-none outline-none py-3 px-2 overflow-auto"
                style={{ lineHeight: '1.5rem' }}
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {(mode === 'preview' || mode === 'split') && (
          <div className={clsx(
            'flex flex-col min-w-0',
            mode === 'split' ? 'flex-1' : 'flex-1'
          )}>
            {/* Preview Header */}
            <div className="px-4 py-2 border-b border-[#30363d]">
              <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">Preview</span>
            </div>
            
            {/* Preview Content */}
            <div
              ref={previewRef}
              className="flex-1 overflow-auto p-6 bg-[#0d1117]"
            >
              <div className="markdown-preview">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({children}) => <h1 className="text-3xl font-bold text-[#c9d1d9] mb-4 pb-2 border-b border-[#30363d]">{children}</h1>,
                    h2: ({children}) => <h2 className="text-xl font-semibold text-[#c9d1d9] mt-6 mb-3">{children}</h2>,
                    h3: ({children}) => <h3 className="text-lg font-semibold text-[#c9d1d9] mt-4 mb-2">{children}</h3>,
                    p: ({children}) => <p className="text-[#c9d1d9] mb-4 leading-relaxed">{children}</p>,
                    strong: ({children}) => <strong className="text-[#58a6ff] font-semibold">{children}</strong>,
                    em: ({children}) => <em className="text-[#c9d1d9] italic">{children}</em>,
                    ul: ({children}) => <ul className="list-disc list-inside mb-4 text-[#c9d1d9] space-y-1">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside mb-4 text-[#c9d1d9] space-y-1">{children}</ol>,
                    li: ({children}) => <li className="text-[#c9d1d9]">{children}</li>,
                    a: ({href, children}) => <a href={href} className="text-[#58a6ff] hover:underline">{children}</a>,
                    blockquote: ({children}) => <blockquote className="border-l-4 border-[#30363d] pl-4 my-4 text-[#8b949e] italic">{children}</blockquote>,
                    code: ({className, children}) => {
                      const isBlock = className?.includes('language-');
                      if (isBlock) {
                        const language = className?.replace('language-', '') || '';
                        return (
                          <div className="my-4 rounded-md overflow-hidden bg-[#161b22] border border-[#30363d]">
                            <pre className="p-4 overflow-x-auto">
                              <code className="text-sm font-mono text-[#c9d1d9]">{children}</code>
                            </pre>
                          </div>
                        );
                      }
                      return <code className="bg-[#161b22] text-[#f97583] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
                    },
                    pre: ({children}) => <>{children}</>,
                    hr: () => <hr className="my-6 border-[#30363d]" />,
                    table: ({children}) => (
                      <div className="my-4 overflow-x-auto">
                        <table className="w-full border-collapse border border-[#30363d]">{children}</table>
                      </div>
                    ),
                    thead: ({children}) => <thead className="bg-[#161b22]">{children}</thead>,
                    tbody: ({children}) => <tbody>{children}</tbody>,
                    tr: ({children}) => <tr className="border-b border-[#30363d]">{children}</tr>,
                    th: ({children}) => <th className="px-4 py-2 text-left text-[#c9d1d9] font-semibold border-r border-[#30363d] last:border-r-0">{children}</th>,
                    td: ({children}) => <td className="px-4 py-2 text-[#c9d1d9] border-r border-[#30363d] last:border-r-0">{children}</td>,
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
