/**
 * Markdown Viewer Pro - Native Zero-Config Mermaid Renderer
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';
import { Maximize2, Copy, Check, AlertCircle, Download } from 'lucide-react';
import { DocumentTheme, ZoomTargetData } from '../../types';

interface MermaidRendererProps {
  code: string;
  theme: DocumentTheme;
  onOpenZoom: (data: ZoomTargetData) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const MermaidRenderer: React.FC<MermaidRendererProps> = ({
  code,
  theme,
  onOpenZoom,
  onToast,
}) => {
  const [svgHtml, setSvgHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueIdRef = useRef<string>(
    'mermaid-' + Math.random().toString(36).substring(2, 9)
  );

  useEffect(() => {
    let isMounted = true;
    setIsRendering(true);
    setError(null);

    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme.mermaidTheme,
        themeVariables: {
          ...theme.mermaidVars,
          fontFamily: theme.fontFamily || 'inherit',
          fontSize: '14px',
        },
        securityLevel: 'loose',
      });

      const elementId = uniqueIdRef.current;
      
      // Clean diagram code
      const cleanCode = code.trim();

      mermaid
        .render(elementId, cleanCode)
        .then(({ svg }) => {
          if (isMounted) {
            setSvgHtml(svg);
            setIsRendering(false);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.warn('Mermaid syntax render error:', err);
            setError(err?.message || 'Invalid Mermaid syntax');
            setIsRendering(false);
          }
        });
    } catch (err: any) {
      if (isMounted) {
        setError(err?.message || 'Failed to initialize Mermaid');
        setIsRendering(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [code, theme]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onToast('success', 'Diagram source copied', 'Mermaid code ready to paste.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgHtml) return;
    const blob = new Blob([svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mermaid-diagram.svg';
    a.click();
    URL.revokeObjectURL(url);
    onToast('success', 'Exported SVG', 'Vector diagram downloaded.');
  };

  const handleZoom = () => {
    onOpenZoom({
      type: 'mermaid',
      title: 'Mermaid Diagram Inspector',
      content: code,
      svgHtml,
    });
  };

  if (error) {
    return (
      <div
        id={`mermaid-error-${uniqueIdRef.current}`}
        className="my-6 rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 text-rose-200"
      >
        <div className="flex items-center gap-2 font-semibold text-rose-300 text-sm mb-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          Mermaid Syntax Error
        </div>
        <p className="text-xs text-rose-300/80 mb-3 font-mono">{error}</p>
        <div className="rounded-lg bg-black/40 p-3 font-mono text-xs text-slate-300 overflow-x-auto">
          <code>{code}</code>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`mermaid-container-${uniqueIdRef.current}`}
      className="group relative my-6 rounded-xl border transition-all duration-200 overflow-hidden shadow-sm"
      style={{
        backgroundColor: theme.codeBg,
        borderColor: theme.codeBorder,
      }}
    >
      {/* Header Toolbar */}
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

          <span className="font-mono font-medium flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block animate-pulse" />
            <span>mermaid diagram</span>
          </span>

          <span className="px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider text-[10px] bg-black/20 text-indigo-400 border border-black/10 hidden sm:inline">
            auto-render
          </span>
        </div>

        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1 px-2.5 py-1 rounded hover:bg-black/10 transition-colors"
            title="Copy Mermaid Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          
          <button
            onClick={handleDownloadSvg}
            className="flex items-center space-x-1 px-2.5 py-1 rounded hover:bg-black/10 transition-colors"
            title="Download Vector SVG"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">SVG</span>
          </button>

          <button
            onClick={handleZoom}
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors ml-1 font-medium"
            title="Zoom & Pan Diagram"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Zoom</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        className="p-6 flex items-center justify-center overflow-x-auto min-h-[140px]"
      >
        {isRendering ? (
          <div className="flex items-center gap-2 text-xs text-slate-400 py-6">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Rendering diagram...</span>
          </div>
        ) : (
          <div
            className="mermaid-rendered-svg max-w-full overflow-x-auto flex justify-center py-2"
            dangerouslySetInnerHTML={{ __html: svgHtml }}
          />
        )}
      </div>
    </div>
  );
};
