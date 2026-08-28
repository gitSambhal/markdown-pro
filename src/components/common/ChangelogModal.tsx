/**
 * Markdown Viewer Pro - Changelog Modal (What's New)
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React from 'react';
import { Modal } from './Modal';
import { Sparkles, Check, Rocket, Shield, Palette, Layout } from 'lucide-react';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="What's New in v1.1.1" maxWidth="2xl">
      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        {/* Release Header */}
        <div className="flex items-center justify-between p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white">Markdown Viewer Pro v1.1.1</div>
              <div className="text-xs text-indigo-300">HTML Export Polish & TOC Smooth Scrolling</div>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-mono rounded-full border border-indigo-500/30">
            v1.1.1
          </span>
        </div>

        {/* Feature List */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Latest Fixes & Enhancements
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> HTML Export Document Polish
              </div>
              <p className="text-xs text-slate-400">
                Exported HTML files now feature clean macOS code headers, working standalone copy buttons, full syntax styles, and no unstyled React UI buttons.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Reliable TOC Heading Scroll
              </div>
              <p className="text-xs text-slate-400">
                Heading IDs now match 100% deterministically between the outline and document, scrolling smoothly directly to the selected section.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Neutralino.js Desktop Support
              </div>
              <p className="text-xs text-slate-400">
                Lightweight native desktop build pipelines across Windows (.exe), macOS, and Linux.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Zero-Config Mermaid & Math
              </div>
              <p className="text-xs text-slate-400">
                Native flowcharts, sequence diagrams, class, state, Gantt, ER diagrams, and KaTeX LaTeX math equations.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 12 Document Themes
              </div>
              <p className="text-xs text-slate-400">
                GitHub Light/Dark, Dracula, Nord, One Dark, Monokai, Sepia Editorial, Cyberpunk & more.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Interactive Zoom & Pan
              </div>
              <p className="text-xs text-slate-400">
                Inspect complex diagrams, tables, and wide code blocks with custom zoom, drag-to-pan, and SVG export.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Native Desktop Build (Neutralino.js)
              </div>
              <p className="text-xs text-slate-400">
                Package as a lightweight native desktop binary for Windows (<code className="text-indigo-300">.exe</code>), macOS (<code className="text-indigo-300">.app</code>), and Linux (<code className="text-indigo-300">x64/arm64</code>) using <code className="text-indigo-300 font-mono">npm run neu:build</code>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="font-semibold text-white text-xs flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Smart Table of Contents
              </div>
              <p className="text-xs text-slate-400">
                Auto-extracted headings with scroll-spy, search filtering, word counts, and reading progress.
              </p>
            </div>
          </div>
        </div>

        {/* Developer Attribution Card */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Crafted with precision by{' '}
            <a
              href="https://suhail.top"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
            >
              Suhail Akhtar
            </a>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors"
          >
            Got it, Let's Read
          </button>
        </div>
      </div>
    </Modal>
  );
};
