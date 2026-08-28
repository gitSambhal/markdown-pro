/**
 * Markdown Viewer Pro - Multi-Tab Workspace Bar
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  FileText,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Keyboard,
  Radio,
  Eye,
  Check
} from 'lucide-react';
import { MarkdownFile, DocumentTheme } from '../../types';

interface TabBarProps {
  files: MarkdownFile[];
  openTabIds: string[];
  activeFileId: string;
  theme: DocumentTheme;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string, e?: React.MouseEvent) => void;
  onCloseOtherTabs: (id: string) => void;
  onCloseAllTabs: () => void;
  onNewTab: () => void;
  onOpenShortcuts: () => void;
  onQuickLook?: (file: MarkdownFile) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  files,
  openTabIds,
  activeFileId,
  theme,
  onSelectTab,
  onCloseTab,
  onCloseOtherTabs,
  onCloseAllTabs,
  onNewTab,
  onOpenShortcuts,
  onQuickLook,
}) => {
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<boolean>(false);
  const [showRightArrow, setShowRightArrow] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Map openTabIds to actual files
  const openFiles = openTabIds
    .map((id) => files.find((f) => f.id === id))
    .filter((f): f is MarkdownFile => Boolean(f));

  // Check scroll overflow
  const updateScrollButtons = () => {
    const el = tabsScrollRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 5);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [openTabIds]);

  // Scroll active tab into view smoothly
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [activeFileId]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!tabsScrollRef.current) return;
    const offset = direction === 'left' ? -200 : 200;
    tabsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // If somehow no tabs open, return empty or fallback
  if (openFiles.length === 0) {
    return null;
  }

  return (
    <div
      id="multi-tab-bar"
      className="flex items-center justify-between border-b select-none transition-colors duration-150 h-10 px-2 text-xs relative z-20"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.surfaceBorder,
      }}
    >
      {/* Scroll Left Button */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="p-1 rounded hover:opacity-80 transition-opacity shrink-0 mr-1 shadow-sm"
          style={{
            backgroundColor: theme.codeBg,
            color: theme.text,
            border: `1px solid ${theme.surfaceBorder}`,
          }}
          title="Scroll Left"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Tabs Container */}
      <div
        ref={tabsScrollRef}
        onScroll={updateScrollButtons}
        className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth h-full py-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {openFiles.map((file, index) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSelectTab(file.id)}
              onMouseDown={(e) => {
                // Middle click closes tab
                if (e.button === 1) {
                  e.preventDefault();
                  onCloseTab(file.id, e);
                }
              }}
              title={`${file.name} (Ctrl+${index + 1})`}
              className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs font-medium cursor-pointer transition-all duration-150 shrink-0 max-w-[200px] border border-b-0 ${
                isActive ? 'shadow-xs' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: isActive ? theme.bg : `${theme.codeBg}90`,
                borderColor: isActive ? theme.surfaceBorder : 'transparent',
                color: isActive ? theme.heading : theme.textMuted,
              }}
            >
              {/* Active Tab Accent Top Line */}
              {isActive && (
                <div
                  className="absolute top-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ backgroundColor: theme.accent }}
                />
              )}

              {/* Tab Icon: Disk Sync Beacon or File Icon */}
              {file.isExternalFile ? (
                <span className="relative flex h-2 w-2 shrink-0">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: theme.accent }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: theme.accent }}
                  />
                </span>
              ) : (
                <FileText
                  className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ color: isActive ? theme.accent : theme.textMuted }}
                />
              )}

              {/* File Name */}
              <span className="truncate font-sans font-medium">{file.name}</span>

              {/* Tab Number Badge on hover (for Cmd+1..9 shortcut guidance) */}
              {index < 9 && (
                <span
                  className="hidden group-hover:inline-block opacity-40 font-mono text-[9px]"
                  title={`Shortcut: Cmd/Ctrl+${index + 1}`}
                >
                  ^{index + 1}
                </span>
              )}

              {/* Close Tab Button (or Middle Click) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(file.id, e);
                }}
                className="p-0.5 rounded hover:bg-slate-700/50 transition-colors opacity-60 group-hover:opacity-100 ml-0.5"
                style={{ color: theme.textMuted }}
                title="Close Tab (Cmd/Ctrl+W or Middle-Click)"
              >
                <X className="w-3 h-3 hover:text-rose-400" />
              </button>
            </div>
          );
        })}

        {/* "+" New Document Tab Button */}
        <button
          id="new-tab-btn"
          onClick={onNewTab}
          className="flex items-center justify-center p-1.5 rounded-lg hover:opacity-100 opacity-60 transition-opacity shrink-0 ml-1"
          style={{
            color: theme.textMuted,
            backgroundColor: `${theme.codeBg}60`,
          }}
          title="New Document Tab (Cmd+Alt+N)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scroll Right Button */}
      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="p-1 rounded hover:opacity-80 transition-opacity shrink-0 ml-1 shadow-sm"
          style={{
            backgroundColor: theme.codeBg,
            color: theme.text,
            border: `1px solid ${theme.surfaceBorder}`,
          }}
          title="Scroll Right"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Right-side Quick Actions & Context Menu */}
      <div className="flex items-center gap-1.5 shrink-0 pl-2">
        {/* Keyboard Shortcuts Trigger Button */}
        <button
          onClick={onOpenShortcuts}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono transition-colors opacity-70 hover:opacity-100"
          style={{
            backgroundColor: theme.codeBg,
            borderColor: theme.surfaceBorder,
            color: theme.textMuted,
          }}
          title="Keyboard Shortcuts Guide (?)"
        >
          <Keyboard className="w-3 h-3" />
          <span className="hidden md:inline">Shortcuts</span>
        </button>

        {/* Tab Overflow / Actions Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-md hover:opacity-100 opacity-70 transition-opacity"
            style={{
              backgroundColor: theme.codeBg,
              color: theme.textMuted,
            }}
            title="Tab Actions"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1.5 w-52 rounded-xl shadow-2xl border p-1 z-50 text-xs backdrop-blur-md"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                color: theme.text,
              }}
            >
              <div
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b font-mono"
                style={{
                  borderColor: theme.surfaceBorder,
                  color: theme.textMuted,
                }}
              >
                Open Tabs ({openFiles.length})
              </div>

              <div className="max-h-48 overflow-y-auto py-1">
                {openFiles.map((file) => (
                  <button
                    key={file.id}
                    onClick={() => {
                      onSelectTab(file.id);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-colors hover:bg-slate-700/30"
                  >
                    <span className="truncate flex-1 pr-2">{file.name}</span>
                    {file.id === activeFileId && (
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: theme.accent }} />
                    )}
                  </button>
                ))}
              </div>

              <div className="border-t my-1" style={{ borderColor: theme.surfaceBorder }} />

              <button
                onClick={() => {
                  onCloseOtherTabs(activeFileId);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-colors hover:bg-slate-700/30 text-slate-300"
              >
                Close Other Tabs
              </button>

              <button
                onClick={() => {
                  onCloseAllTabs();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-1.5 rounded-lg text-left transition-colors hover:bg-rose-500/20 text-rose-300"
              >
                Close All Tabs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
