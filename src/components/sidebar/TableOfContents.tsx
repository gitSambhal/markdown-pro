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
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  toc,
  stats,
  theme,
  isOpen,
  onClose,
}) => {
  const [activeId, setActiveId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [readingProgress, setReadingProgress] = useState<number>(0);

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
        .map((item) => document.getElementById(item.id))
        .filter(Boolean) as HTMLElement[];

      if (headingElements.length === 0) return;

      const offsetTop = 140;
      let currentActiveId = headingElements[0].id;

      for (const el of headingElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= offsetTop) {
          currentActiveId = el.id;
        } else {
          break;
        }
      }

      setActiveId(currentActiveId);
    };

    const targetEl = document.getElementById('document-scroll-viewport') || window;
    targetEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      targetEl.removeEventListener('scroll', handleScroll);
    };
  }, [toc]);

  const handleHeadingClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const filteredToc = toc.filter((item) =>
    item.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <aside
      id="toc-sidebar"
      className="w-72 shrink-0 border-l border-slate-800 bg-[#111318] flex flex-col h-full overflow-hidden select-none transition-all"
    >
      {/* Header with Title & Stats */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ListTree className="w-3.5 h-3.5 text-indigo-400" />
          <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
            Table of Contents
          </h2>
        </div>
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-[#0D0E12] border border-slate-800 text-slate-400">
          {toc.length} sections
        </span>
      </div>

      {/* Reading Progress Indicator */}
      <div className="px-4 py-2.5 bg-[#0D0E12]/50 border-b border-slate-800">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 mb-1.5 font-medium">
          <span>Reading Progress</span>
          <span className="font-mono text-indigo-400 font-semibold">{readingProgress}%</span>
        </div>
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 transition-all duration-150 rounded-full"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </div>

      {/* Search in TOC */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="toc-search-input"
            type="text"
            placeholder="Filter sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#0D0E12] border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Headings List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredToc.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            {searchQuery ? 'No matching headings found' : 'No headings in document'}
          </div>
        ) : (
          filteredToc.map((item) => {
            const isActive = activeId === item.id;
            const indentLevel = Math.max(0, item.level - 1);

            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleHeadingClick(e, item.id)}
                style={{ paddingLeft: `${Math.min(indentLevel * 12 + 10, 48)}px` }}
                className={`group flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs transition-colors leading-snug relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
                title={item.text}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-indigo-500 rounded-full" />
                )}
                <span className="truncate">{item.text}</span>
                <span
                  className={`text-[10px] font-mono ml-2 opacity-0 group-hover:opacity-60 ${
                    isActive ? 'opacity-70 text-indigo-400' : 'text-slate-500'
                  }`}
                >
                  H{item.level}
                </span>
              </a>
            );
          })
        )}
      </div>

      {/* Live Sync Status Footer Card */}
      <div className="p-3 bg-[#0D0E12] border-t border-slate-800 space-y-2.5">
        <div className="p-2.5 bg-[#16181D] border border-slate-800/80 rounded-xl">
          <div className="flex items-center space-x-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-medium text-[11px]">Live Sync Active</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-normal">
            Watching for changes. Instant auto-render enabled.
          </p>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-indigo-400" />
            <span>{stats.readingTimeMinutes}m read</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-indigo-400" />
            <span>{stats.wordCount.toLocaleString()} words</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
