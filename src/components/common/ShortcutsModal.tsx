/**
 * Markdown Viewer Pro - Keyboard Shortcuts Help Modal
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React from 'react';
import { Modal } from './Modal';
import { Keyboard, Command, Sparkles, Layout, Folder, Eye, Search, Layers } from 'lucide-react';
import { DocumentTheme } from '../../types';

interface ShortcutsModalProps {
  isOpen: boolean;
  theme: DocumentTheme;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation & Workspace' | 'Tabs' | 'Popups & Modals' | 'Editor & Export';
}

const SHORTCUTS: ShortcutItem[] = [
  // Navigation & Workspace
  { keys: ['Cmd/Ctrl', 'B'], description: 'Toggle File Explorer Sidebar', category: 'Navigation & Workspace' },
  { keys: ['Cmd/Ctrl', 'E'], description: 'Cycle View Modes (View / Split / Edit)', category: 'Navigation & Workspace' },
  { keys: ['?'], description: 'Open Keyboard Shortcuts Cheat Sheet', category: 'Navigation & Workspace' },
  { keys: ['Cmd/Ctrl', '/'], description: 'Open Keyboard Shortcuts Cheat Sheet', category: 'Navigation & Workspace' },
  { keys: ['Space'], description: 'QuickLook File Preview (File list item focused/hovered)', category: 'Navigation & Workspace' },

  // Tabs
  { keys: ['Ctrl', 'Tab'], description: 'Switch to Next Open Tab', category: 'Tabs' },
  { keys: ['Ctrl', 'Shift', 'Tab'], description: 'Switch to Previous Open Tab', category: 'Tabs' },
  { keys: ['Cmd/Ctrl', 'W'], description: 'Close Active Tab', category: 'Tabs' },
  { keys: ['Cmd/Ctrl', 'Alt', 'N'], description: 'Create New Document Tab', category: 'Tabs' },
  { keys: ['Cmd/Ctrl', '1..9'], description: 'Jump Directly to Tab #1 to #9', category: 'Tabs' },
  { keys: ['Middle Click'], description: 'Close Clicked Tab', category: 'Tabs' },

  // Popups & Modals
  { keys: ['Esc'], description: 'Close any active popup, modal, zoom inspector or QuickLook', category: 'Popups & Modals' },
  { keys: ['Enter'], description: 'Confirm deletion, save rename, or open document from QuickLook', category: 'Popups & Modals' },
  { keys: ['&larr;', '&rarr;'], description: 'Cycle through files in QuickLook preview', category: 'Popups & Modals' },
  { keys: ['+', '-'], description: 'Zoom In / Zoom Out in Interactive Inspector', category: 'Popups & Modals' },
  { keys: ['0'], description: 'Reset Zoom (100%) in Interactive Inspector', category: 'Popups & Modals' },

  // Editor & Export
  { keys: ['Cmd/Ctrl', 'S'], description: 'Download / Export Markdown file', category: 'Editor & Export' },
  { keys: ['Cmd/Ctrl', 'P'], description: 'Print or Save as PDF', category: 'Editor & Export' },
  { keys: ['Cmd/Ctrl', 'B (in editor)'], description: 'Toggle Bold Formatting', category: 'Editor & Export' },
  { keys: ['Cmd/Ctrl', 'I (in editor)'], description: 'Toggle Italic Formatting', category: 'Editor & Export' },
  { keys: ['Cmd/Ctrl', 'K (in editor)'], description: 'Insert Markdown Link', category: 'Editor & Export' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, theme, onClose }) => {
  const categories = ['Tabs', 'Popups & Modals', 'Navigation & Workspace', 'Editor & Export'] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onClose}
      title="Keyboard Shortcuts"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div
          className="p-4 rounded-xl border flex items-center justify-between"
          style={{
            backgroundColor: `${theme.surface}95`,
            borderColor: theme.surfaceBorder,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-lg border"
              style={{
                backgroundColor: `${theme.accent}20`,
                borderColor: `${theme.accent}40`,
                color: theme.accent,
              }}
            >
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-tight">Full Keyboard Accessibility</div>
              <div className="text-xs" style={{ color: theme.textMuted }}>
                Navigate tabs, dismiss popups with <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Esc</kbd>, and confirm with <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Enter</kbd>.
              </div>
            </div>
          </div>
          <span
            className="text-xs font-mono px-2.5 py-1 rounded-full border hidden sm:inline"
            style={{
              backgroundColor: theme.codeBg,
              borderColor: theme.surfaceBorder,
              color: theme.textMuted,
            }}
          >
            Press Esc / Enter to close
          </span>
        </div>

        {/* Shortcuts Grid by Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat);
            return (
              <div
                key={cat}
                className="p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: `${theme.surface}80`,
                  borderColor: theme.surfaceBorder,
                }}
              >
                <h4
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  style={{ color: theme.accent }}
                >
                  {cat === 'Tabs' ? (
                    <Layers className="w-3.5 h-3.5" />
                  ) : cat === 'Popups & Modals' ? (
                    <Sparkles className="w-3.5 h-3.5" />
                  ) : cat === 'Navigation & Workspace' ? (
                    <Layout className="w-3.5 h-3.5" />
                  ) : (
                    <Command className="w-3.5 h-3.5" />
                  )}
                  {cat}
                </h4>

                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 border-b last:border-b-0"
                      style={{ borderColor: `${theme.surfaceBorder}60` }}
                    >
                      <span style={{ color: theme.text }} className="pr-2 leading-tight">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border shadow-xs"
                            style={{
                              backgroundColor: theme.codeBg,
                              borderColor: theme.surfaceBorder,
                              color: theme.heading,
                            }}
                            dangerouslySetInnerHTML={{ __html: k }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Dismiss Button */}
        <div
          className="pt-3 border-t flex items-center justify-between text-xs"
          style={{ borderColor: theme.surfaceBorder }}
        >
          <span style={{ color: theme.textMuted }}>
            Tip: You can press <kbd className="px-1.5 py-0.5 bg-slate-800 text-slate-300 font-mono rounded text-[10px]">?</kbd> anywhere to re-open this guide.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
          >
            Got it (Esc / Enter)
          </button>
        </div>
      </div>
    </Modal>
  );
};
