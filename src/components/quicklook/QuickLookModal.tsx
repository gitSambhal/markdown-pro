/**
 * Markdown Viewer Pro - macOS Finder Style QuickLook Preview Modal
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MarkdownFile, DocumentTheme, ZoomTargetData } from '../../types';
import { MarkdownRenderer } from '../viewer/MarkdownRenderer';
import { computeDocumentStats } from '../../utils/toc';
import {
  X,
  FileCode,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Clock,
  FileText,
  Workflow,
  Table
} from 'lucide-react';

interface QuickLookModalProps {
  isOpen: boolean;
  file: MarkdownFile | null;
  files: MarkdownFile[];
  theme: DocumentTheme;
  onClose: () => void;
  onSelectFile: (id: string) => void;
  onOpenZoom: (data: ZoomTargetData) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const QuickLookModal: React.FC<QuickLookModalProps> = ({
  isOpen,
  file,
  files,
  theme,
  onClose,
  onSelectFile,
  onOpenZoom,
  onToast,
}) => {
  useEffect(() => {
    if (!isOpen || !file) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        onClose();
        return;
      }

      const currentIndex = files.findIndex((f) => f.id === file.id);
      if (currentIndex === -1) return;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % files.length;
        onSelectFile(files[nextIndex].id);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + files.length) % files.length;
        onSelectFile(files[prevIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, file, files, onClose, onSelectFile]);

  if (!isOpen || !file) return null;

  const stats = computeDocumentStats(file.content);
  const currentIndex = files.findIndex((f) => f.id === file.id);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIndex = (currentIndex - 1 + files.length) % files.length;
    onSelectFile(files[prevIndex].id);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIndex = (currentIndex + 1) % files.length;
    onSelectFile(files[nextIndex].id);
  };

  return (
    <AnimatePresence>
      <div
        id="quicklook-portal"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md overflow-hidden select-none"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          transition={{ type: 'spring', damping: 28, stiffness: 380 }}
          className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* macOS Title Bar Header */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950/80 border-b border-slate-800">
            {/* Left: Finder QuickLook controls & Filename */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-rose-500 hover:bg-rose-600 transition-colors flex items-center justify-center text-rose-950 opacity-80 hover:opacity-100"
                  title="Close QuickLook (Space / Esc)"
                />
                <button
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors opacity-80 hover:opacity-100"
                  title="Minimize"
                />
                <button
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors opacity-80 hover:opacity-100"
                  title="Full View"
                />
              </div>

              <div className="h-4 w-[1px] bg-slate-800" />

              <div className="flex items-center gap-2 min-w-0">
                <FileCode className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="font-semibold text-sm text-white tracking-tight truncate">
                  {file.name}
                </span>
                <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                  ({(file.content.length / 1024).toFixed(1)} KB)
                </span>
              </div>
            </div>

            {/* Right: Quick Stats & Navigation */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Previous / Next File in Folder */}
              <div className="flex items-center bg-slate-800/80 border border-slate-700/80 rounded-lg p-0.5">
                <button
                  onClick={handlePrev}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Previous File (Left Arrow)"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono text-slate-400 select-none">
                  {currentIndex + 1}/{files.length}
                </span>
                <button
                  onClick={handleNext}
                  className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                  title="Next File (Right Arrow)"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                <span>Open in Viewer</span>
                <ExternalLink className="w-3 h-3" />
              </button>

              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1"
                title="Dismiss (Space / Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{stats.readingTimeMinutes} min read</span>
              </span>
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{stats.wordCount.toLocaleString()} words</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Workflow className="w-3.5 h-3.5 text-amber-400" />
                <span>{stats.diagramsCount} diagrams</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-emerald-400" />
                <span>{stats.tablesCount} tables</span>
              </span>
            </div>

            <span className="text-[11px] text-slate-500 hidden md:inline">
              Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded">Space</kbd> or <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded">&larr;</kbd> <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded">&rarr;</kbd> to navigate
            </span>
          </div>

          {/* Rendered Document Viewport */}
          <div
            id="quicklook-viewport"
            className="flex-1 overflow-y-auto p-6 sm:p-10 select-text"
            style={{
              backgroundColor: theme.bg,
              color: theme.text,
            }}
          >
            <div className="max-w-3xl mx-auto">
              <MarkdownRenderer
                content={file.content}
                theme={theme}
                fontSize={15}
                onOpenZoom={onOpenZoom}
                onToast={onToast}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
