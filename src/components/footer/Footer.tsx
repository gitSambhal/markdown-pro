/**
 * Markdown Viewer Pro - Status Bar & Attribution Footer
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React from 'react';
import { DocumentStats, MarkdownFile } from '../../types';
import { Sparkles, Radio, CheckCircle, Clock, FileText } from 'lucide-react';

interface FooterProps {
  stats: DocumentStats;
  activeFile: MarkdownFile;
  onOpenChangelog: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  stats,
  activeFile,
  onOpenChangelog,
}) => {
  return (
    <footer
      id="app-footer"
      className="h-8 border-t border-slate-800 bg-[#0D0E12] px-4 flex items-center justify-between text-[10px] tracking-widest text-slate-500 uppercase font-medium z-30 select-none shrink-0"
    >
      {/* Left: Operational Metrics */}
      <div className="flex items-center space-x-4">
        {/* Live sync status */}
        <div className="flex items-center space-x-2">
          {activeFile.isExternalFile ? (
            <span className="flex items-center space-x-1.5 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE FILE SYNC</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>LOCAL SYNCED</span>
            </span>
          )}
        </div>

        <div className="hidden sm:flex items-center space-x-3 border-l border-slate-800 pl-3">
          <span>{stats.wordCount.toLocaleString()} WORDS</span>
          <span>&bull;</span>
          <span>{stats.readingTimeMinutes} MIN READ</span>
          <span>&bull;</span>
          <span>{stats.characterCount.toLocaleString()} CHARS</span>
        </div>
      </div>

      {/* Right: Mandatory Developer Attribution & Semantic Version */}
      <div className="flex items-center space-x-3 lowercase normal-case text-[11px] text-slate-400">
        <div>
          Created by{' '}
          <a
            href="https://suhail.top"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-indigo-400 font-semibold transition-colors underline underline-offset-2"
          >
            Suhail Akhtar
          </a>
        </div>

        <button
          id="version-changelog-btn"
          onClick={onOpenChangelog}
          className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-mono text-[10px] border border-indigo-500/20 transition-colors"
          title="View Changelog & Release Notes"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>v1.1.0</span>
        </button>
      </div>
    </footer>
  );
};
