/**
 * Markdown Viewer Pro - Table of Contents Sidebar with Scroll-Spy & Search
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TocItem, DocumentStats, DocumentTheme } from '../../types';
import { Search, ListTree, Clock, FileText, Workflow, Table, X } from 'lucide-react';

interface TableOfContentsProps {
  toc: TocItem[];
  stats: DocumentStats;
  theme: DocumentTheme;
  isOpen: boolean;
  onClose?: () => void;
  onEnsureViewerVisible?: () => void;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  toc,
  stats,
  theme,
  isOpen,
  onClose,
  onEnsureViewerVisible,
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // Helper to locate heading DOM node using 5 fallback strategies
  const findHeadingElement = (item: TocItem, fallbackIdx: number): HTMLElement | null => {
    // 1. Direct ID
    let el = document.getElementById(item.id);
    if (el) return el;

    // 2. Data attribute by ID
    el = document.querySelector(`[data-toc-id="${item.id}"]`);
    if (el) return el as HTMLElement;

    // 3. Data attribute by heading index
    const targetIdx = typeof item.index === 'number' ? item.index : fallbackIdx;
    el = document.querySelector(`[data-heading-index="${targetIdx}"]`);
    if (el) return el as HTMLElement;

    // 4. Query all headings in rendered view
    const allHeadings = document.querySelectorAll(
      '#markdown-rendered-view h1, #markdown-rendered-view h2, #markdown-rendered-view h3, #markdown-rendered-view h4, #markdown-rendered-view h5, #markdown-rendered-view h6'
    );
    if (allHeadings[targetIdx]) {
      return allHeadings[targetIdx] as HTMLElement;
    }

    // 5. Fallback text match
    const targetTextClean = item.text.trim().toLowerCase();
    const headingList = Array.from(allHeadings) as HTMLElement[];
    const found = headingList.find((h) => {
      const headingClean = (h.getAttribute('data-heading-text') || h.textContent || '')
        .replace(/#/g, '')
        .trim()
        .toLowerCase();
      return headingClean === targetTextClean;
    });

    return found || null;
  };

  // Scroll spy & reading progress listener
  useEffect(() => {
    const handleScroll = () => {
      // Calculate total reading progress %
      const scrollEl = document.getElementById('document-scroll-viewport') || window;
      let scrollTop = 0;
      let scrollHeight = 0;
      let clientHeight = 0;

      if (scrollEl === window) {
        scrollTop = window.scrollY;
        scrollHeight = document.documentElement.scrollHeight;
        clientHeight = window.innerHeight;
      } else {
        const el = scrollEl as HTMLElement;
        scrollTop = el.scrollTop;
        scrollHeight = el.scrollHeight;
        clientHeight = el.clientHeight;
      }

      const totalScrollable = scrollHeight - clientHeight;
      const progress = totalScrollable > 0 ? Math.min(100, Math.round((scrollTop / totalScrollable) * 100)) : 0;
      setReadingProgress(progress);

      // Detect active heading in viewport
      const headingElements = toc
        .map((item, idx) => findHeadingElement(item, idx))
        .filter(Boolean) as HTMLElement[];

      if (headingElements.length === 0) return;

      const viewport = document.getElementById('document-scroll-viewport');
      const offsetTop = viewport ? viewport.getBoundingClientRect().top + 120 : 140;
      let currentActiveId = headingElements[0].id || toc[0]?.id || '';

      for (let i = 0; i < headingElements.length; i++) {
        const el = headingElements[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= offsetTop) {
          currentActiveId = el.id || el.getAttribute('data-toc-id') || toc[i]?.id || '';
        } else {
          break;
        }
      }

      if (currentActiveId) {
        setActiveId(currentActiveId);
      }
    };

    const targetEl = document.getElementById('document-scroll-viewport') || window;
    targetEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      targetEl.removeEventListener('scroll', handleScroll);
    };
  }, [toc]);

  const handleHeadingClick = (e: React.MouseEvent, item: TocItem, fallbackIdx: number) => {
    e.preventDefault();

    if (onEnsureViewerVisible) {
      onEnsureViewerVisible();
    }

    // Small timeout ensures document viewport is mounted and rendered if layout toggled
    setTimeout(() => {
      const el = findHeadingElement(item, fallbackIdx);
      const viewport = document.getElementById('document-scroll-viewport');

      if (el && viewport) {
        const viewportRect = viewport.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetScrollTop = viewport.scrollTop + (elRect.top - viewportRect.top) - 24;
        viewport.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
        setActiveId(item.id);
        window.history.replaceState(null, '', `#${item.id}`);
      } else if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveId(item.id);
        window.history.replaceState(null, '', `#${item.id}`);
      }
    }, 15);
  };

  const filteredToc = toc.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <aside
      id="toc-sidebar"
      className="w-72 shrink-0 border-l flex flex-col h-full overflow-hidden select-none transition-all"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.surfaceBorder,
        color: theme.text,
      }}
    >
      {/* Header with Title & Stats */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{ borderColor: theme.surfaceBorder }}
      >
        <div className="flex items-center space-x-2">
          <ListTree className="w-3.5 h-3.5" style={{ color: theme.accent }} />
          <h2
            className="text-[10px] uppercase tracking-widest font-bold"
            style={{ color: theme.textMuted }}
          >
            Table of Contents
          </h2>
        </div>
        <span
          className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border"
          style={{
            backgroundColor: theme.codeBg,
            borderColor: theme.surfaceBorder,
            color: theme.textMuted,
          }}
        >
          {toc.length} sections
        </span>
      </div>

      {/* Reading Progress Indicator */}
      <div
        className="px-4 py-2.5 border-b"
        style={{
          backgroundColor: `${theme.codeBg}80`,
          borderColor: theme.surfaceBorder,
        }}
      >
        <div
          className="flex items-center justify-between text-[10px] uppercase tracking-wider mb-1.5 font-medium"
          style={{ color: theme.textMuted }}
        >
          <span>Reading Progress</span>
          <span className="font-mono font-semibold" style={{ color: theme.accent }}>
            {readingProgress}%
          </span>
        </div>
        <div
          className="w-full h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: theme.surfaceBorder }}
        >
          <div
            className="h-full transition-all duration-150 rounded-full"
            style={{
              width: `${readingProgress}%`,
              backgroundColor: theme.accent,
            }}
          />
        </div>
      </div>

      {/* Search in TOC */}
      <div
        className="p-3 border-b"
        style={{ borderColor: theme.surfaceBorder }}
      >
        <div className="relative">
          <Search
            className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: theme.textMuted }}
          />
          <input
            id="toc-search-input"
            type="text"
            placeholder="Filter sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs border rounded-lg focus:outline-none transition-colors"
            style={{
              backgroundColor: theme.codeBg,
              borderColor: theme.surfaceBorder,
              color: theme.text,
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-80"
              style={{ color: theme.textMuted }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Headings List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredToc.length === 0 ? (
          <div className="text-center py-8 text-xs" style={{ color: theme.textMuted }}>
            {searchQuery ? 'No matching headings found' : 'No headings in document'}
          </div>
        ) : (
          filteredToc.map((item, idx) => {
            const isActive = activeId === item.id;
            const indentLevel = Math.max(0, item.level - 1);

            return (
              <a
                key={`${item.id}-${idx}`}
                href={`#${item.id}`}
                onClick={(e) => handleHeadingClick(e, item, idx)}
                style={{
                  paddingLeft: `${Math.min(indentLevel * 12 + 10, 48)}px`,
                  backgroundColor: isActive ? `${theme.accent}18` : 'transparent',
                  color: isActive ? theme.accent : theme.textMuted,
                  fontWeight: isActive ? 600 : 400,
                }}
                className="group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs transition-colors leading-snug relative hover:opacity-90"
                title={item.text}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full"
                    style={{ backgroundColor: theme.accent }}
                  />
                )}
                <span className="truncate">{item.text}</span>
                <span
                  className={`text-[10px] font-mono ml-2 opacity-0 group-hover:opacity-60 ${
                    isActive ? 'opacity-70 font-semibold' : ''
                  }`}
                  style={{ color: isActive ? theme.accent : theme.textMuted }}
                >
                  H{item.level}
                </span>
              </a>
            );
          })
        )}
      </div>

      {/* Live Sync Status Footer Card */}
      <div
        className="p-3 border-t space-y-2.5"
        style={{
          backgroundColor: `${theme.codeBg}80`,
          borderColor: theme.surfaceBorder,
        }}
      >
        <div
          className="p-2.5 border rounded-xl"
          style={{
            backgroundColor: theme.surface,
            borderColor: theme.surfaceBorder,
          }}
        >
          <div className="flex items-center space-x-2 text-xs" style={{ color: theme.text }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-medium text-[11px]">Live Sync Active</span>
          </div>
          <p className="text-[10px] mt-1 leading-normal" style={{ color: theme.textMuted }}>
            Watching for changes. Instant auto-render enabled.
          </p>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono" style={{ color: theme.textMuted }}>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" style={{ color: theme.accent }} />
            <span>{stats.readingTimeMinutes}m read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3" style={{ color: theme.accent }} />
            <span>{stats.wordCount.toLocaleString()} words</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
