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

  const isLight = theme.category === 'light' || theme.category === 'sepia';

  return (
    <header
      id="top-navbar"
      className="h-14 border-b flex items-center justify-between px-4 sm:px-6 z-40 select-none shrink-0 transition-colors duration-150"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.surfaceBorder,
        color: theme.text,
      }}
    >
      {/* Left Section: Logo Badge, Sidebar Toggle & Breadcrumb Title */}
      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
        {/* Toggle File Explorer */}
        <button
          id="toggle-file-sidebar-btn"
          onClick={onToggleFiles}
          className="p-1.5 rounded-lg transition-colors border"
          style={{
            backgroundColor: isFilesOpen ? `${theme.accent}20` : 'transparent',
            borderColor: isFilesOpen ? `${theme.accent}40` : 'transparent',
            color: isFilesOpen ? theme.accent : theme.textMuted,
          }}
          title="Toggle Files Explorer (Cmd/Ctrl + B)"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand Logo Badge */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: theme.accent }}
        >
          <span className="text-white font-bold text-xs tracking-tighter font-mono">M↓</span>
        </div>

        {/* Breadcrumb Navigation & Document Title */}
        <nav className="text-xs sm:text-sm flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          <span className="hidden sm:inline font-medium" style={{ color: theme.textMuted }}>Documents</span>
          <span className="hidden sm:inline" style={{ color: theme.textMuted, opacity: 0.6 }}>/</span>
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
              className="px-2 py-0.5 text-xs font-medium border rounded focus:outline-none w-36 sm:w-48"
              style={{
                backgroundColor: theme.codeBg,
                borderColor: theme.accent,
                color: theme.text,
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 text-left text-xs sm:text-sm font-medium transition-colors truncate max-w-[140px] sm:max-w-[220px] md:max-w-[280px]"
              style={{ color: theme.heading }}
              title="Click to rename document"
            >
              <span className="truncate">{activeFile.name}</span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0" style={{ color: theme.textMuted }} />
            </button>
          )}

          {/* Live Sync Pulse Badge */}
          {activeFile.isExternalFile && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-mono shrink-0 ml-1"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#10b981',
              }}
            >
              <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-500" />
              <span className="hidden lg:inline">Live Sync</span>
            </span>
          )}
        </nav>
      </div>

      {/* Center Section: View Mode Selector */}
      <div
        className="hidden xl:flex items-center border rounded-full p-1 transition-colors"
        style={{
          backgroundColor: theme.codeBg,
          borderColor: theme.surfaceBorder,
        }}
      >
        <button
          onClick={() => onViewModeChange('view')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: viewMode === 'view' ? theme.accent : 'transparent',
            color: viewMode === 'view' ? '#ffffff' : theme.textMuted,
            fontWeight: viewMode === 'view' ? 600 : 500,
          }}
          title="Reader View"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Reader</span>
        </button>

        <button
          onClick={() => onViewModeChange('split')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: viewMode === 'split' ? theme.accent : 'transparent',
            color: viewMode === 'split' ? '#ffffff' : theme.textMuted,
            fontWeight: viewMode === 'split' ? 600 : 500,
          }}
          title="Live Split View (Side-by-Side)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split</span>
        </button>

        <button
          onClick={() => onViewModeChange('edit')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: viewMode === 'edit' ? theme.accent : 'transparent',
            color: viewMode === 'edit' ? '#ffffff' : theme.textMuted,
            fontWeight: viewMode === 'edit' ? 600 : 500,
          }}
          title="Editor View"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
      </div>

      {/* Right Section: Theme Capsule, Zoom, QuickLook, Export, TOC Toggle */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Quick Theme Capsule */}
        <div
          className="hidden md:flex items-center p-1 rounded-full border transition-colors"
          style={{
            backgroundColor: theme.codeBg,
            borderColor: theme.surfaceBorder,
          }}
        >
          <button
            onClick={() => onThemeChange('github-light')}
            className="px-3 py-1 text-[10px] rounded-full transition-all"
            style={{
              backgroundColor: theme.id === 'github-light' ? theme.accent : 'transparent',
              color: theme.id === 'github-light' ? '#ffffff' : theme.textMuted,
              fontWeight: theme.id === 'github-light' ? 600 : 500,
            }}
          >
            Light
          </button>
          <button
            onClick={() => onThemeChange('github-dark')}
            className="px-3 py-1 text-[10px] rounded-full transition-all"
            style={{
              backgroundColor: theme.id === 'github-dark' ? theme.accent : 'transparent',
              color: theme.id === 'github-dark' ? '#ffffff' : theme.textMuted,
              fontWeight: theme.id === 'github-dark' ? 600 : 500,
            }}
          >
            Dark
          </button>
          <button
            onClick={() => onThemeChange('dracula')}
            className="px-3 py-1 text-[10px] rounded-full transition-all"
            style={{
              backgroundColor: theme.id === 'dracula' ? theme.accent : 'transparent',
              color: theme.id === 'dracula' ? '#ffffff' : theme.textMuted,
              fontWeight: theme.id === 'dracula' ? 600 : 500,
            }}
          >
            Dracula
          </button>
          <button
            onClick={() => onThemeChange('nord')}
            className="px-3 py-1 text-[10px] rounded-full transition-all"
            style={{
              backgroundColor: theme.id === 'nord' ? theme.accent : 'transparent',
              color: theme.id === 'nord' ? '#ffffff' : theme.textMuted,
              fontWeight: theme.id === 'nord' ? 600 : 500,
            }}
          >
            Nord
          </button>

          {/* More Themes Dropdown Trigger */}
          <div ref={themeMenuRef} className="relative">
            <button
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="px-2 py-1 text-[10px] flex items-center gap-0.5 rounded-full transition-colors"
              style={{
                color: theme.textMuted,
              }}
              title="All 12 Curated Themes"
            >
              <Palette className="w-3 h-3" />
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {isThemeMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 border rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                  color: theme.text,
                }}
              >
                <div
                  className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-b flex items-center justify-between"
                  style={{
                    borderColor: theme.surfaceBorder,
                    color: theme.textMuted,
                  }}
                >
                  <span>12 Curated Themes</span>
                  <Sparkles className="w-3 h-3" style={{ color: theme.accent }} />
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
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors"
                        style={{
                          backgroundColor: isCurrent ? theme.accent : 'transparent',
                          color: isCurrent ? '#ffffff' : theme.text,
                          fontWeight: isCurrent ? 600 : 400,
                        }}
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
                        {isCurrent && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Zoom Section */}
        <div
          className="flex items-center space-x-2 border-l pl-3 sm:pl-4"
          style={{ borderColor: theme.surfaceBorder }}
        >
          <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: theme.textMuted }}>ZOOM</span>
          <div
            className="flex items-center border rounded-lg p-0.5"
            style={{
              backgroundColor: theme.codeBg,
              borderColor: theme.surfaceBorder,
            }}
          >
            <button
              onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
              className="p-1 rounded transition-colors"
              style={{ color: theme.textMuted }}
              title="Decrease Font Size"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span
              className="px-1.5 text-xs font-mono font-semibold select-none"
              style={{ color: theme.accent }}
            >
              {Math.round((fontSize / 16) * 100)}%
            </span>
            <button
              onClick={() => onFontSizeChange(Math.min(26, fontSize + 1))}
              className="p-1 rounded transition-colors"
              style={{ color: theme.textMuted }}
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
          className="flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs transition-colors"
          style={{
            backgroundColor: theme.codeBg,
            borderColor: theme.surfaceBorder,
            color: theme.text,
          }}
          title="QuickLook Spacebar Preview"
        >
          <Eye className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <span className="hidden lg:inline text-xs">QuickLook</span>
          <span
            className="hidden sm:inline px-1 py-0.2 rounded border text-[10px] font-mono"
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              color: theme.accent,
            }}
          >
            Space
          </span>
        </button>

        {/* Container Width Dropdown */}
        <div ref={widthMenuRef} className="relative hidden lg:block">
          <button
            onClick={() => setIsWidthMenuOpen(!isWidthMenuOpen)}
            className="p-2 border rounded-lg transition-colors"
            style={{
              backgroundColor: theme.codeBg,
              borderColor: theme.surfaceBorder,
              color: theme.textMuted,
            }}
            title="Page Reading Width"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          {isWidthMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 border rounded-xl shadow-2xl p-1.5 z-50"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                color: theme.text,
              }}
            >
              <div
                className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b"
                style={{
                  borderColor: theme.surfaceBorder,
                  color: theme.textMuted,
                }}
              >
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
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors"
                    style={{
                      backgroundColor: containerWidth === item.id ? theme.accent : 'transparent',
                      color: containerWidth === item.id ? '#ffffff' : theme.text,
                    }}
                  >
                    <span>{item.label}</span>
                    {containerWidth === item.id && <Check className="w-3.5 h-3.5 text-white" />}
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
            className="flex items-center gap-1.5 px-3 py-1.5 font-medium text-xs rounded-lg shadow-sm transition-colors text-white"
            style={{
              backgroundColor: theme.accent,
            }}
            title="Export Options"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {isExportMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 border rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                color: theme.text,
              }}
            >
              <div
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b"
                style={{
                  borderColor: theme.surfaceBorder,
                  color: theme.textMuted,
                }}
              >
                Export Document
              </div>
              <div className="py-1 space-y-0.5 text-xs">
                <button
                  onClick={() => {
                    onExportMarkdown();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:opacity-80"
                  style={{ color: theme.text }}
                >
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>Download .MD File</span>
                </button>

                <button
                  onClick={() => {
                    onExportHtml();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:opacity-80"
                  style={{ color: theme.text }}
                >
                  <FileDown className="w-4 h-4" style={{ color: theme.accent }} />
                  <span>Export Standalone HTML</span>
                </button>

                <button
                  onClick={() => {
                    onPrintPdf();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors hover:opacity-80"
                  style={{ color: theme.text }}
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
          className="p-2 rounded-lg transition-colors border"
          style={{
            backgroundColor: isTocOpen ? `${theme.accent}20` : 'transparent',
            borderColor: isTocOpen ? `${theme.accent}40` : 'transparent',
            color: isTocOpen ? theme.accent : theme.textMuted,
          }}
          title="Toggle Table of Contents"
        >
          <ListTree className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
