/**
 * Markdown Viewer Pro - Top Control Bar & Theme Switcher
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ThemeId,
  ViewMode,
  DocumentTheme,
  MarkdownFile,
  DocumentStats
} from '../../types';
import { THEME_LIST, DOCUMENT_THEMES } from '../../utils/themes';
import {
  Palette,
  Columns,
  Eye,
  Edit3,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Printer,
  Copy,
  Check,
  Radio,
  Menu,
  ListTree,
  ChevronDown,
  FileCode,
  Maximize,
  Minimize,
  SlidersHorizontal,
  Sparkles,
  FileDown
} from 'lucide-react';

interface TopNavbarProps {
  activeFile: MarkdownFile;
  theme: DocumentTheme;
  onThemeChange: (themeId: ThemeId) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
  containerWidth: 'narrow' | 'standard' | 'wide' | 'full';
  onContainerWidthChange: (width: 'narrow' | 'standard' | 'wide' | 'full') => void;
  isFilesOpen: boolean;
  onToggleFiles: () => void;
  isTocOpen: boolean;
  onToggleToc: () => void;
  onQuickLook: () => void;
  onExportMarkdown: () => void;
  onExportHtml: () => void;
  onPrintPdf: () => void;
  onRename: (newName: string) => void;
  stats: DocumentStats;
  isLiveSyncActive: boolean;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeFile,
  theme,
  onThemeChange,
  viewMode,
  onViewModeChange,
  fontSize,
  onFontSizeChange,
  containerWidth,
  onContainerWidthChange,
  isFilesOpen,
  onToggleFiles,
  isTocOpen,
  onToggleToc,
  onQuickLook,
  onExportMarkdown,
  onExportHtml,
  onPrintPdf,
  onRename,
  stats,
  isLiveSyncActive,
  onToast,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [isWidthMenuOpen, setIsWidthMenuOpen] = useState<boolean>(false);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [titleInput, setTitleInput] = useState<string>(activeFile.name);

  const themeMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const widthMenuRef = useRef<HTMLDivElement>(null);

  // Synchronize title on active file change
  useEffect(() => {
    setTitleInput(activeFile.name);
  }, [activeFile.name]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (widthMenuRef.current && !widthMenuRef.current.contains(e.target as Node)) {
        setIsWidthMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTitleSubmit = () => {
    if (titleInput.trim() && titleInput !== activeFile.name) {
      let finalName = titleInput.trim();
      if (!finalName.endsWith('.md') && !finalName.endsWith('.markdown')) {
        finalName += '.md';
      }
      onRename(finalName);
    }
    setIsEditingTitle(false);
  };

  return (
    <header
      id="top-navbar"
      className="h-14 border-b border-slate-800 bg-[#16181D] flex items-center justify-between px-4 sm:px-6 z-40 select-none text-slate-300 shrink-0"
    >
      {/* Left Section: Logo Badge, Sidebar Toggle & Breadcrumb Title */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        {/* Toggle File Explorer */}
        <button
          id="toggle-file-sidebar-btn"
          onClick={onToggleFiles}
          className={`p-1.5 rounded-lg transition-colors ${
            isFilesOpen
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Toggle Files Explorer (Cmd/Ctrl + B)"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand Logo Badge */}
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
          <span className="text-white font-bold text-xs tracking-tighter font-mono">M↓</span>
        </div>

        {/* Breadcrumb Navigation & Document Title */}
        <nav className="text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          <span className="text-slate-500 hidden sm:inline font-medium">Documents</span>
          <span className="text-slate-600 hidden sm:inline">/</span>
          {isEditingTitle ? (
            <input
              id="document-title-input"
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTitleInput(activeFile.name);
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              className="px-2 py-0.5 text-xs font-medium bg-[#0D0E12] border border-indigo-500 rounded text-slate-200 focus:outline-none w-36 sm:w-48"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 text-left text-xs sm:text-sm font-medium text-slate-200 hover:text-indigo-300 transition-colors truncate max-w-[140px] sm:max-w-[220px] md:max-w-[280px]"
              title="Click to rename document"
            >
              <span className="truncate">{activeFile.name}</span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-slate-500 shrink-0" />
            </button>
          )}

          {/* Live Sync Pulse Badge */}
          {activeFile.isExternalFile && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono shrink-0 ml-1">
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
              <span className="hidden lg:inline">Live Sync</span>
            </span>
          )}
        </nav>
      </div>

      {/* Center Section: View Mode Selector */}
      <div className="hidden xl:flex items-center bg-[#0D0E12] border border-slate-800 rounded-full p-1">
        <button
          onClick={() => onViewModeChange('view')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            viewMode === 'view'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Reader View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Reader</span>
        </button>

        <button
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            viewMode === 'split'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Live Split View (Side-by-Side)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split</span>
        </button>

        <button
          onClick={() => onViewModeChange('edit')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
            viewMode === 'edit'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Editor View"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
      </div>

      {/* Right Section: Theme Capsule, Zoom, QuickLook, Export, TOC Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Quick Theme Capsule */}
        <div className="hidden md:flex items-center bg-[#0D0E12] p-1 rounded-full border border-slate-800">
          <button
            onClick={() => onThemeChange('github-dark')}
            className={`px-3 py-1 text-[10px] rounded-full transition-all ${
              theme.id === 'github-dark'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub
          </button>
          <button
            onClick={() => onThemeChange('dracula')}
            className={`px-3 py-1 text-[10px] rounded-full transition-all ${
              theme.id === 'dracula'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dracula
          </button>
          <button
            onClick={() => onThemeChange('nord')}
            className={`px-3 py-1 text-[10px] rounded-full transition-all ${
              theme.id === 'nord'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Nord
          </button>
          <button
            onClick={() => onThemeChange('tokyo-night')}
            className={`px-3 py-1 text-[10px] rounded-full transition-all ${
              theme.id === 'tokyo-night'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tokyo
          </button>

          {/* More Themes Dropdown Trigger */}
          <div ref={themeMenuRef} className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="px-2 py-1 text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 rounded-full hover:bg-slate-800 transition-colors"
              title="All 12 Curated Themes"
            >
              <Palette className="w-3 h-3" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#111318] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                  <span>12 Curated Themes</span>
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                </div>
                <div className="max-h-72 overflow-y-auto py-1 space-y-0.5">
                  {THEME_LIST.map((th) => {
                    const isCurrent = theme.id === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => {
                          onThemeChange(th.id);
                          setIsThemeMenuOpen(false);
                          onToast('info', `Theme: ${th.name}`, 'Applied typography and color palette.');
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          isCurrent
                            ? 'bg-indigo-600 text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1 p-0.5 rounded-full border border-black/20">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: th.previewColors[0] }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: th.previewColors[1] }}
                            />
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: th.previewColors[2] }}
                            />
                          </div>
                          <span>{th.name}</span>
                        </div>
                        {isCurrent && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sophisticated Dark Zoom Section */}
        <div className="flex items-center space-x-2 border-l border-slate-800 pl-3 sm:pl-4">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">ZOOM</span>
          <div className="flex items-center bg-[#0D0E12] border border-slate-800 rounded-lg p-0.5 text-slate-400">
            <button
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1.5 text-xs font-mono text-indigo-400 font-semibold select-none">
              {Math.round((fontSize / 16) * 100)}%
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Increase Font Size"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* QuickLook Finder Trigger */}
        <button
          id="top-quicklook-btn"
          onClick={onQuickLook}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0D0E12] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-colors"
          title="QuickLook Spacebar Preview"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden lg:inline text-xs">QuickLook</span>
          <span className="hidden sm:inline px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-indigo-300">
            Space
          </span>
        </button>

        {/* Container Width Dropdown */}
        <div ref={widthMenuRef} className="relative hidden lg:block">
          <button
            onClick={() => setIsWidthMenuOpen(!isWidthMenuOpen)}
            className="p-2 bg-[#0D0E12] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Page Reading Width"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {isWidthMenuOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#111318] border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Container Width
              </div>
              <div className="py-1 space-y-0.5 text-xs">
                {(
                  [
                    { id: 'narrow', label: 'Narrow (720px)' },
                    { id: 'standard', label: 'Standard (860px)' },
                    { id: 'wide', label: 'Wide (1100px)' },
                    { id: 'full', label: 'Full Width' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onContainerWidthChange(item.id);
                      setIsWidthMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg ${
                      containerWidth === item.id
                        ? 'bg-indigo-600 text-white font-medium'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.label}</span>
                    {containerWidth === item.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Export Menu Dropdown */}
        <div ref={exportMenuRef} className="relative">
          <button
            id="export-menu-btn"
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-lg shadow-sm transition-colors"
            title="Export Options"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-indigo-200" />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-[#111318] border border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                Export Document
              </div>
              <div className="py-1 space-y-0.5 text-xs">
                <button
                  onClick={() => {
                    onExportMarkdown();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>Download .MD File</span>
                </button>

                <button
                  onClick={() => {
                    onExportHtml();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <FileDown className="w-4 h-4 text-indigo-400" />
                  <span>Export Standalone HTML</span>
                </button>

                <button
                  onClick={() => {
                    onPrintPdf();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Printer className="w-4 h-4 text-emerald-400" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Table of Contents Sidebar */}
        <button
          id="toggle-toc-sidebar-btn"
          onClick={onToggleToc}
          className={`p-2 rounded-lg transition-colors ${
            isTocOpen
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
          }`}
          title="Toggle Table of Contents"
        >
          <ListTree className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
