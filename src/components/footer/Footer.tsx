/**
 * Markdown Viewer Pro - Status Bar & Attribution Footer
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React from 'react';
import { DocumentStats, MarkdownFile, DocumentTheme } from '../../types';
import { Sparkles, Radio, CheckCircle, Clock, FileText } from 'lucide-react';

interface FooterProps {
  stats: DocumentStats;
  activeFile: MarkdownFile | null;
  theme: DocumentTheme;
  onOpenChangelog: () => void;
  onOpenDefaultAppModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  stats,
  activeFile,
  theme,
  onOpenChangelog,
  onOpenDefaultAppModal,
}) => {
  return (
    <footer
      id="app-footer"
      className="h-8 border-t px-4 flex items-center justify-between text-[10px] tracking-widest uppercase font-medium z-30 select-none shrink-0 transition-colors duration-150"
      style={{
        backgroundColor: theme.surface,
        borderColor: theme.surfaceBorder,
        color: theme.textMuted,
      }}
    >
      {/* Left: Operational Metrics */}
      <div className="flex items-center space-x-4">
        {/* Live sync status */}
        <div className="flex items-center space-x-2">
          {activeFile?.isExternalFile ? (
            <span className="flex items-center space-x-1.5 text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE FILE SYNC</span>
            </span>
          ) : activeFile ? (
            <span
              className="flex items-center space-x-1.5 font-mono"
              style={{ color: theme.textMuted }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: theme.accent }}
              />
              <span>LOCAL SYNCED</span>
            </span>
          ) : (
            <span
              className="flex items-center space-x-1.5 font-mono"
              style={{ color: theme.textMuted }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span>WORKSPACE IDLE</span>
            </span>
          )}
        </div>

        {activeFile && (
          <div
            className="hidden sm:flex items-center space-x-3 border-l pl-3"
            style={{ borderColor: theme.surfaceBorder }}
          >
            <span>{stats.wordCount.toLocaleString()} WORDS</span>
            <span>&bull;</span>
            <span>{stats.readingTimeMinutes} MIN READ</span>
            <span>&bull;</span>
            <span>{stats.characterCount.toLocaleString()} CHARS</span>
          </div>
        )}
      </div>

      {/* Right: Mandatory Developer Attribution & Semantic Version */}
      <div className="flex items-center space-x-3 lowercase normal-case text-[11px]">
        <div>
          Created by{' '}
          <a
            href="https://suhail.top"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-colors underline underline-offset-2"
            style={{ color: theme.heading }}
          >
            Suhail Akhtar
          </a>
        </div>

        {onOpenDefaultAppModal && (
          <button
            id="set-default-app-footer-btn"
            onClick={onOpenDefaultAppModal}
            className="hidden md:flex items-center space-x-1 px-1.5 py-0.5 rounded font-mono text-[10px] border transition-colors hover:opacity-80 cursor-pointer"
            style={{
              backgroundColor: theme.codeBg,
              borderColor: theme.surfaceBorder,
              color: theme.heading,
            }}
            title="Set as Default Application for .md files"
          >
            <span>Set Default .md App</span>
          </button>
        )}

        <button
          id="version-changelog-btn"
          onClick={onOpenChangelog}
          className="flex items-center space-x-1 px-1.5 py-0.5 rounded font-mono text-[10px] border transition-colors"
          style={{
            backgroundColor: `${theme.accent}18`,
            borderColor: `${theme.accent}35`,
            color: theme.accent,
          }}
          title="View Changelog & Release Notes"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>v1.3.0</span>
        </button>
      </div>
    </footer>
  );
};
