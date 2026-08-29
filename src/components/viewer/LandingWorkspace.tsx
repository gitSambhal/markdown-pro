/**
 * Markdown Viewer Pro - Beautiful Interactive Landing Workspace & Dropzone
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  FilePlus,
  Radio,
  FileText,
  Sparkles,
  Layers,
  Code2,
  Sigma,
  Palette,
  Download,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  FolderOpen
} from 'lucide-react';
import { DocumentTheme, MarkdownFile } from '../../types';
import { SAMPLE_DOCUMENTS } from '../../utils/samples';
import { isNativeNeutralino, showNativeOpenFileDialog } from '../../services/neutralino';

interface LandingWorkspaceProps {
  theme: DocumentTheme;
  onImportFiles: (files: FileList | File[]) => void;
  onNewFile: () => void;
  onWatchDiskFile: () => void;
  onLoadSample: (sample: MarkdownFile) => void;
  onOpenShortcuts: () => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  onOpenDefaultAppModal?: () => void;
}

export const LandingWorkspace: React.FC<LandingWorkspaceProps> = ({
  theme,
  onImportFiles,
  onNewFile,
  onWatchDiskFile,
  onLoadSample,
  onOpenShortcuts,
  onToast,
  onOpenDefaultAppModal,
}) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportFiles(e.dataTransfer.files);
    }
  };

  const handleNativeOrFileInput = async () => {
    if (isNativeNeutralino()) {
      const nativeFile = await showNativeOpenFileDialog();
      if (nativeFile) {
        onImportFiles([
          new File([nativeFile.content], nativeFile.name, { type: 'text/markdown' }),
        ]);
        onToast('success', 'Native File Loaded', nativeFile.name);
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      id="landing-workspace"
      className="flex-1 overflow-y-auto w-full h-full p-6 sm:p-10 md:p-14 transition-colors duration-150 relative select-none"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onImportFiles(e.target.files);
          }
        }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Hero Section */}
        <div className="text-center space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border shadow-xs"
            style={{
              backgroundColor: `${theme.accent}15`,
              borderColor: `${theme.accent}35`,
              color: theme.accent,
            }}
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Next-Gen Markdown & Diagram Engine</span>
            <span className="opacity-40">&bull;</span>
            <span className="font-mono text-[11px]">v1.3.0</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: theme.heading }}
          >
            Markdown Viewer Pro
          </h1>

          <p
            className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed"
            style={{ color: theme.textMuted }}
          >
            Fast, secure, and beautiful markdown reader and live editor with full support for{' '}
            <strong style={{ color: theme.heading }}>Mermaid diagrams</strong>,{' '}
            <strong style={{ color: theme.heading }}>KaTeX math</strong>, interactive zoom, and instant offline PDF/HTML export.
          </p>
        </div>

        {/* Big Interactive Drag & Drop Area */}
        <div
          onClick={handleNativeOrFileInput}
          className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all duration-200 transform ${
            isDragOver
              ? 'scale-[1.01] shadow-2xl'
              : 'hover:shadow-lg hover:border-opacity-80'
          }`}
          style={{
            backgroundColor: isDragOver ? `${theme.accent}12` : `${theme.surface}90`,
            borderColor: isDragOver ? theme.accent : theme.surfaceBorder,
          }}
        >
          {/* Animated Glow Backdrop on Drag */}
          {isDragOver && (
            <div
              className="absolute inset-0 rounded-2xl pointer-events-none opacity-20 blur-xl animate-pulse"
              style={{ backgroundColor: theme.accent }}
            />
          )}

          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-sm transition-transform duration-200 group-hover:scale-110"
              style={{
                backgroundColor: `${theme.accent}20`,
                borderColor: `${theme.accent}40`,
                color: theme.accent,
              }}
            >
              <Upload className={`w-8 h-8 ${isDragOver ? 'animate-bounce' : ''}`} />
            </div>

            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: theme.heading }}>
                {isDragOver ? 'Release to Load Document' : 'Drop your Markdown file here'}
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: theme.textMuted }}>
                Supports <span className="font-mono">.md</span>, <span className="font-mono">.markdown</span>, or <span className="font-mono">.txt</span> files with instant client-side parsing
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-opacity shadow-sm flex items-center gap-2"
                style={{ backgroundColor: theme.accent }}
              >
                <FolderOpen className="w-4 h-4" />
                <span>Browse Files</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onWatchDiskFile();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                  color: theme.text,
                }}
              >
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Live Disk Sync</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNewFile();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                  color: theme.text,
                }}
              >
                <FilePlus className="w-4 h-4 text-indigo-400" />
                <span>Create Blank Document</span>
              </button>

              {onOpenDefaultAppModal && isNativeNeutralino() && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDefaultAppModal();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-2"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.surfaceBorder,
                    color: theme.text,
                  }}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Set Default .MD App</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Load Sample Document Starters */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3
              className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
              style={{ color: theme.textMuted }}
            >
              <FileText className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span>Or Start with a Curated Document Template</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => onLoadSample(sample)}
                className="group p-4 rounded-xl border transition-all duration-150 cursor-pointer hover:shadow-md flex flex-col justify-between"
                style={{
                  backgroundColor: `${theme.surface}80`,
                  borderColor: theme.surfaceBorder,
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="p-2 rounded-lg border shrink-0"
                        style={{
                          backgroundColor: `${theme.accent}15`,
                          borderColor: `${theme.accent}30`,
                          color: theme.accent,
                        }}
                      >
                        {sample.id.includes('architecture') ? (
                          <Layers className="w-4 h-4" />
                        ) : sample.id.includes('math') ? (
                          <Sigma className="w-4 h-4" />
                        ) : sample.id.includes('showcase') ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <Code2 className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-semibold text-xs truncate" style={{ color: theme.heading }}>
                        {sample.name}
                      </span>
                    </div>
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: theme.codeBg,
                        borderColor: theme.surfaceBorder,
                        color: theme.textMuted,
                      }}
                    >
                      {(sample.content.length / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <p className="text-xs line-clamp-2" style={{ color: theme.textMuted }}>
                    {sample.content.split('\n')[0].replace(/^#+\s*/, '') || 'Comprehensive markdown starter.'}
                  </p>
                </div>

                <div className="pt-3 flex items-center justify-between text-xs mt-2 border-t" style={{ borderColor: `${theme.surfaceBorder}60` }}>
                  <span className="text-[11px] font-medium" style={{ color: theme.accent }}>
                    Load Template
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" style={{ color: theme.accent }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="space-y-4 pt-2">
          <h3
            className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
            style={{ color: theme.textMuted }}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Built-in Powerful Capabilities</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: theme.heading }}>
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Mermaid & Flowcharts</span>
              </div>
              <p style={{ color: theme.textMuted }} className="leading-relaxed text-[11px]">
                Full visual rendering for flowcharts, sequence diagrams, class models, and state charts.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: theme.heading }}>
                <Sigma className="w-4 h-4 text-emerald-400" />
                <span>KaTeX Math Typesetting</span>
              </div>
              <p style={{ color: theme.textMuted }} className="leading-relaxed text-[11px]">
                Renders inline equations and complex LaTeX display formulas with precision typography.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: theme.heading }}>
                <Palette className="w-4 h-4 text-pink-400" />
                <span>12 Curated Themes</span>
              </div>
              <p style={{ color: theme.textMuted }} className="leading-relaxed text-[11px]">
                Dark, Light, Sepia, Dracula, Tokyo Night, Nord, GitHub, and high-contrast modes.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: theme.heading }}>
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Syntax Highlighting</span>
              </div>
              <p style={{ color: theme.textMuted }} className="leading-relaxed text-[11px]">
                Code highlighting across 50+ languages with line numbers and 1-click clipboard copy.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: theme.heading }}>
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export to PDF & HTML</span>
              </div>
              <p style={{ color: theme.textMuted }} className="leading-relaxed text-[11px]">
                Generate clean, print-ready PDF files and self-contained HTML files with embedded styling.
              </p>
            </div>

            <div
              className="p-3.5 rounded-xl border space-y-1.5"
              style={{ backgroundColor: `${theme.surface}60`, borderColor: theme.surfaceBorder }}
            >
              <div className="flex items-center gap-2 font-semibold" style={{ color: theme.heading }}>
                <Eye className="w-4 h-4 text-purple-400" />
                <span>QuickLook & Zoom</span>
              </div>
              <p style={{ color: theme.textMuted }} className="leading-relaxed text-[11px]">
                Press Space for instant floating file preview, and inspect diagrams up to 400% zoom.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Strip */}
        <div
          className="p-4 rounded-xl border flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{
            backgroundColor: `${theme.surface}70`,
            borderColor: theme.surfaceBorder,
          }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold" style={{ color: theme.heading }}>Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono border" style={{ backgroundColor: theme.codeBg, borderColor: theme.surfaceBorder }}>Ctrl+B</kbd>
            <span style={{ color: theme.textMuted }}>Explorer</span>
            <span className="opacity-40">&bull;</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono border" style={{ backgroundColor: theme.codeBg, borderColor: theme.surfaceBorder }}>Space</kbd>
            <span style={{ color: theme.textMuted }}>QuickLook</span>
            <span className="opacity-40">&bull;</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono border" style={{ backgroundColor: theme.codeBg, borderColor: theme.surfaceBorder }}>Ctrl+Tab</kbd>
            <span style={{ color: theme.textMuted }}>Tabs</span>
            <span className="opacity-40">&bull;</span>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono border" style={{ backgroundColor: theme.codeBg, borderColor: theme.surfaceBorder }}>?</kbd>
            <span style={{ color: theme.textMuted }}>All Keys</span>
          </div>

          <button
            onClick={onOpenShortcuts}
            className="text-xs font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
            style={{ color: theme.accent }}
          >
            View Full Shortcuts Guide
          </button>
        </div>
      </div>
    </div>
  );
};
