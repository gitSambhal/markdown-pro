/**
 * Markdown Viewer Pro - Syntax Highlighted Code Block Component
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-markdown';

import { Copy, Check, Maximize2, Hash } from 'lucide-react';
import { DocumentTheme, ZoomTargetData } from '../../types';
import { copyTextNative } from '../../services/neutralino';

interface CodeBlockProps {
  language?: string;
  code: string;
  theme: DocumentTheme;
  onOpenZoom: (data: ZoomTargetData) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language = 'text',
  code,
  theme,
  onOpenZoom,
  onToast,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showLineNumbers, setShowLineNumbers] = useState<boolean>(true);

  const cleanLang = (language || 'text').replace(/^language-/, '').toLowerCase();

  const highlightedHtml = useMemo(() => {
    try {
      const grammar = Prism.languages[cleanLang] || Prism.languages.text || Prism.languages.plain;
      if (grammar) {
        return Prism.highlight(code.trim(), grammar, cleanLang);
      }
      return code.trim();
    } catch {
      return code.trim();
    }
  }, [code, cleanLang]);

  const handleCopy = async () => {
    await copyTextNative(code);
    setCopied(true);
    onToast('success', 'Code copied', 'Snippet copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoom = () => {
    onOpenZoom({
      type: 'code',
      title: `${cleanLang.toUpperCase()} Code Block`,
      content: code,
      language: cleanLang,
    });
  };

  const lines = code.trim().split('\n');

  return (
    <div
      id={`code-block-${cleanLang}`}
      data-block-type="code"
      data-language={cleanLang}
      className="code-block-wrapper group relative my-6 rounded-xl border transition-all duration-200 overflow-hidden shadow-sm"
      style={{
        backgroundColor: theme.codeBg,
        borderColor: theme.codeBorder,
      }}
    >
      {/* Code Block Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 text-xs border-b select-none"
        style={{
          borderColor: theme.codeBorder,
          backgroundColor: theme.surface,
          color: theme.textMuted,
        }}
      >
        <div className="flex items-center space-x-2.5">
          {/* macOS window dots */}
          <div className="flex items-center space-x-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#BF616A] inline-block opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#EBCB8B] inline-block opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#A3BE8C] inline-block opacity-80" />
          </div>

          <span className="px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[10px] bg-black/20 text-indigo-400 border border-black/10">
            {cleanLang}
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline font-mono">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Toggle line numbers */}
          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`p-1.5 rounded hover:bg-black/10 transition-colors ${
              showLineNumbers ? 'text-indigo-400' : 'text-slate-400'
            }`}
            title="Toggle Line Numbers"
          >
            <Hash className="w-3.5 h-3.5" />
          </button>

          {/* Copy code */}
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 rounded hover:bg-black/10 transition-colors"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Zoom / Fullscreen */}
          <button
            onClick={handleZoom}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors ml-1 font-medium"
            title="Zoom & Inspect Code"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Zoom</span>
          </button>
        </div>
      </div>

      {/* Code Content with Line Numbers */}
      <div className="code-block-body overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <div className="code-block-row flex min-w-full items-start">
          {showLineNumbers && (
            <div
              className="code-line-numbers select-none pr-4 text-right border-r font-mono text-[13px] opacity-40 shrink-0"
              style={{
                borderColor: theme.codeBorder,
                color: theme.textMuted,
              }}
            >
              {lines.map((_, i) => (
                <div key={i} className="line-number leading-relaxed">
                  {i + 1}
                </div>
              ))}
            </div>
          )}
          <pre
            className={`code-block-pre flex-1 m-0 p-0 overflow-x-auto ${showLineNumbers ? 'pl-4' : ''}`}
            style={{
              color: theme.codeText,
            }}
          >
            <code
              className={`language-${cleanLang}`}
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
};
