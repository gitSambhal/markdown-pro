/**
 * Markdown Viewer Pro - Zoom & Pan Inspector Modal
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Download,
  Copy,
  Check,
  X,
  Move,
  Code,
  Table,
  Workflow
} from 'lucide-react';
import { ZoomTargetData } from '../../types';

interface ZoomModalProps {
  data: ZoomTargetData | null;
  onClose: () => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const ZoomModal: React.FC<ZoomModalProps> = ({ data, onClose, onToast }) => {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [copied, setCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 4.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.4));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.0015;
    const newScale = Math.min(Math.max(scale + delta, 0.4), 4.0);
    setScale(newScale);
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(data.content);
    setCopied(true);
    onToast('success', 'Copied to clipboard', 'Source content ready to paste.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!data.svgHtml) {
      // Fallback download text
      const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      onToast('success', 'Exported content', 'Downloaded successfully.');
      return;
    }

    const blob = new Blob([data.svgHtml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.toLowerCase().replace(/\s+/g, '-') || 'diagram'}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('success', 'Exported SVG', 'Vector diagram saved.');
  };

  const getHeaderIcon = () => {
    switch (data.type) {
      case 'mermaid':
        return <Workflow className="w-5 h-5 text-indigo-400" />;
      case 'table':
        return <Table className="w-5 h-5 text-emerald-400" />;
      case 'code':
      default:
        return <Code className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <AnimatePresence>
      <div
        id="zoom-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ type: 'spring', damping: 26, stiffness: 360 }}
          className="w-full max-w-6xl h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Top Control Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 text-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700">
                {getHeaderIcon()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight truncate">
                  {data.title || 'Interactive Zoom Inspector'}
                </h3>
                <span className="text-xs text-slate-400">
                  {data.type === 'mermaid' ? 'Mermaid SVG Canvas' : data.type === 'table' ? 'Markdown Data Table' : `Code (${data.language || 'Plain'})`}
                </span>
              </div>
            </div>

            {/* Controls Toolbar */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg p-1">
                <button
                  id="zoom-out-btn"
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="px-2 text-xs font-mono font-medium text-indigo-300 min-w-[52px] text-center select-none">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  id="zoom-in-btn"
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  id="zoom-reset-btn"
                  onClick={handleReset}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors ml-0.5"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Copy source */}
              <button
                id="zoom-copy-btn"
                onClick={handleCopyContent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                title="Copy Source"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>

              {/* Download / Export */}
              <button
                id="zoom-download-btn"
                onClick={handleDownloadSvg}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg shadow-sm shadow-indigo-900/50 transition-colors"
                title={data.type === 'mermaid' ? 'Download SVG' : 'Download Raw Content'}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{data.type === 'mermaid' ? 'Export SVG' : 'Download'}</span>
              </button>

              {/* Close Modal */}
              <button
                id="zoom-close-btn"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Interactive Pan & Zoom Canvas */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            className={`flex-1 overflow-hidden relative bg-slate-950 p-6 flex items-center justify-center select-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            {/* Visual background grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

            <div
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
              className="max-w-none transition-transform pointer-events-auto"
            >
              {data.type === 'mermaid' && data.svgHtml ? (
                <div
                  className="mermaid-zoom-svg flex items-center justify-center p-4 bg-slate-900/90 rounded-xl border border-slate-800 shadow-2xl"
                  dangerouslySetInnerHTML={{ __html: data.svgHtml }}
                />
              ) : data.type === 'table' ? (
                <div className="p-4 bg-slate-900/95 rounded-xl border border-slate-800 shadow-2xl text-slate-100 font-sans overflow-auto max-w-[85vw] max-h-[70vh]">
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: data.svgHtml || `<pre class="p-4 font-mono text-xs">${data.content}</pre>` }}
                  />
                </div>
              ) : (
                <div className="p-4 bg-slate-900/95 rounded-xl border border-slate-800 shadow-2xl font-mono text-xs text-slate-200 whitespace-pre overflow-auto max-w-[85vw] max-h-[70vh]">
                  <code>{data.content}</code>
                </div>
              )}
            </div>

            {/* Floating helper badge */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 text-slate-400 text-xs px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none shadow-lg">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              <span>Drag to pan &bull; Scroll / +/- to zoom &bull; Double click to recenter</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
