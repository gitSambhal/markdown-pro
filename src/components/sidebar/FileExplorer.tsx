/**
 * Markdown Viewer Pro - File Explorer & Workspace Manager
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { MarkdownFile, DocumentTheme } from '../../types';
import {
  FolderOpen,
  FileCode,
  Plus,
  Upload,
  Radio,
  Trash2,
  Edit2,
  FileText,
  Eye,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { isNativeNeutralino, showNativeOpenFileDialog } from '../../services/neutralino';

interface FileExplorerProps {
  files: MarkdownFile[];
  activeFileId: string;
  theme: DocumentTheme;
  onSelectFile: (id: string) => void;
  onNewFile: () => void;
  onImportFiles: (files: FileList | File[]) => void;
  onWatchDiskFile: () => void;
  onRenameFile: (id: string, newName: string) => void;
  onDeleteFile: (id: string) => void;
  onQuickLook: (file: MarkdownFile) => void;
  isOpen: boolean;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
  onOpenDefaultAppModal?: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  theme,
  onSelectFile,
  onNewFile,
  onImportFiles,
  onWatchDiskFile,
  onRenameFile,
  onDeleteFile,
  onQuickLook,
  isOpen,
  onToast,
  onOpenDefaultAppModal,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<MarkdownFile | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for Spacebar QuickLook when focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input, textarea or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === 'Space' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeFile = files.find((f) => f.id === activeFileId);
        if (activeFile) {
          e.preventDefault();
          onQuickLook(activeFile);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files, activeFileId, onQuickLook]);

  const handleStartRename = (file: MarkdownFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(file.id);
    setEditingName(file.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      let finalName = editingName.trim();
      if (!finalName.endsWith('.md') && !finalName.endsWith('.markdown')) {
        finalName += '.md';
      }
      onRenameFile(id, finalName);
    }
    setEditingId(null);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteFile(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onImportFiles(e.dataTransfer.files);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <aside
        id="file-explorer-sidebar"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`w-64 shrink-0 border-r flex flex-col h-full overflow-hidden select-none transition-all relative ${
          isDragOver ? 'ring-2 ring-indigo-500 ring-inset' : ''
        }`}
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
          color: theme.text,
        }}
      >
        {/* Hidden file upload input */}
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

        {/* Drag Overlay Notice */}
        {isDragOver && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 text-center pointer-events-none"
            style={{ backgroundColor: `${theme.bg}f0` }}
          >
            <Upload className="w-10 h-10 animate-bounce mb-2" style={{ color: theme.accent }} />
            <div className="text-sm font-bold" style={{ color: theme.heading }}>Drop .MD Files Here</div>
            <div className="text-xs mt-1" style={{ color: theme.textMuted }}>Instant high-speed parsing</div>
          </div>
        )}

        {/* Workspace Header */}
        <div
          className="p-4 border-b flex items-center justify-between"
          style={{ borderColor: theme.surfaceBorder }}
        >
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-3.5 h-3.5" style={{ color: theme.accent }} />
            <h2
              className="text-[10px] uppercase tracking-widest font-bold"
              style={{ color: theme.textMuted }}
            >
              Workspace Files
            </h2>
          </div>
          <button
            id="new-doc-btn"
            onClick={onNewFile}
            className="p-1 rounded-lg text-white transition-colors shadow-sm"
            style={{ backgroundColor: theme.accent }}
            title="New Markdown Document"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* File Actions Bar */}
        <div
          className="p-3 border-b flex flex-col gap-2"
          style={{
            borderColor: theme.surfaceBorder,
            backgroundColor: `${theme.codeBg}80`,
          }}
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              id="open-file-btn"
              onClick={async () => {
                if (isNativeNeutralino()) {
                  try {
                    const nativeFile = await showNativeOpenFileDialog();
                    if (nativeFile) {
                      onImportFiles([
                        new File([nativeFile.content], nativeFile.name, { type: 'text/markdown' })
                      ]);
                      onToast('success', 'Native File Loaded', nativeFile.name);
                    } else {
                      fileInputRef.current?.click();
                    }
                  } catch (e) {
                    fileInputRef.current?.click();
                  }
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                color: theme.text,
              }}
              title="Open markdown file from computer"
            >
              <Upload className="w-3.5 h-3.5" style={{ color: theme.accent }} />
              <span>Open .md</span>
            </button>

            <button
              id="watch-disk-file-btn"
              onClick={onWatchDiskFile}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                color: theme.text,
              }}
              title="Watch live file on disk"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Live Sync</span>
            </button>
          </div>

          {onOpenDefaultAppModal && (
            <button
              id="sidebar-default-app-btn"
              onClick={onOpenDefaultAppModal}
              className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer hover:opacity-90"
              style={{
                backgroundColor: `${theme.accent}12`,
                borderColor: `${theme.accent}30`,
                color: theme.accent,
              }}
              title="Set as Default Application for .md files"
            >
              <span>Make Default .MD App</span>
            </button>
          )}
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 px-3 text-center">
              <FileCode className="w-8 h-8 opacity-30 mb-2" style={{ color: theme.accent }} />
              <div className="text-xs font-semibold" style={{ color: theme.heading }}>No Documents</div>
              <p className="text-[11px] mt-1 mb-3" style={{ color: theme.textMuted }}>
                Your workspace is currently empty.
              </p>
              <button
                onClick={onNewFile}
                className="px-3 py-1.5 text-xs font-medium rounded-lg text-white shadow-xs transition-opacity hover:opacity-90 flex items-center gap-1.5"
                style={{ backgroundColor: theme.accent }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Doc</span>
              </button>
            </div>
          ) : (
            files.map((file) => {
              const isActive = activeFileId === file.id;
              const isEditing = editingId === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file.id)}
                  className="group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all border"
                  style={{
                    backgroundColor: isActive
                      ? `${theme.accent}18`
                      : 'transparent',
                    borderColor: isActive
                      ? `${theme.accent}40`
                      : 'transparent',
                    color: isActive ? theme.heading : theme.textMuted,
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
                    <div className="shrink-0">
                      {file.isExternalFile ? (
                        <span title="Live Synced External File">
                          <Radio className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      ) : (
                        <FileCode
                          className="w-3.5 h-3.5"
                          style={{ color: isActive ? theme.accent : theme.textMuted }}
                        />
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(file.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="w-full px-1.5 py-0.5 text-xs border rounded focus:outline-none"
                          style={{
                            backgroundColor: theme.codeBg,
                            borderColor: theme.accent,
                            color: theme.text,
                          }}
                        />
                        <button
                          onClick={() => handleSaveRename(file.id)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 hover:opacity-80"
                          style={{ color: theme.textMuted }}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <div
                          className="truncate"
                          style={{ color: isActive ? theme.heading : theme.text }}
                        >
                          {file.name}
                        </div>
                        <div
                          className="text-[10px] flex items-center gap-2 mt-0.5 font-mono"
                          style={{ color: theme.textMuted, opacity: 0.8 }}
                        >
                          <span>{(file.content.length / 1024).toFixed(1)} KB</span>
                          <span>&bull;</span>
                          <span>{new Date(file.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Spacebar QuickLook Trigger */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickLook(file);
                        }}
                        className="p-1 rounded hover:opacity-80 transition-colors"
                        style={{ color: theme.textMuted }}
                        title="QuickLook (Space)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => handleStartRename(file, e)}
                        className="p-1 rounded hover:opacity-80 transition-colors"
                        style={{ color: theme.textMuted }}
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(file);
                        }}
                        className="p-1 rounded hover:text-rose-400 transition-colors"
                        style={{ color: theme.textMuted }}
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* QuickLook Finder Hint Footer */}
        <div
          className="p-3 border-t text-[11px] flex items-center justify-between"
          style={{
            backgroundColor: `${theme.codeBg}80`,
            borderColor: theme.surfaceBorder,
            color: theme.textMuted,
          }}
        >
          <span className="flex items-center space-x-1.5">
            <span
              className="px-1.5 py-0.5 border rounded font-mono text-[10px] font-bold"
              style={{
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
                color: theme.accent,
              }}
            >
              Space
            </span>
            <span style={{ color: theme.textMuted }}>QuickLook</span>
          </span>
          <span className="text-[10px] font-mono" style={{ color: theme.textMuted }}>{files.length} docs</span>
        </div>
      </aside>

      {/* Destructive Action Modal for Delete */}
      {deleteTarget && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Document"
          maxWidth="md"
        >
          <div className="space-y-4 text-sm">
            {/* Warning Box */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/25">
              <div className="p-2 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <div className="font-semibold text-slate-100 text-sm">
                  Delete this document?
                </div>
                <div className="text-xs text-slate-300">
                  Are you sure you want to permanently remove this file from your workspace?
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-700/80 font-mono text-xs text-rose-300 max-w-full truncate font-medium">
                    <FileCode className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="truncate">{deleteTarget.name}</span>
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-slate-400">
              This action is immediate and cannot be undone. Any unsaved edits will be permanently discarded.
            </p>

            {/* Modal Actions Footer - Clean right-aligned buttons without cramped keyboard badges */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-700/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500 whitespace-nowrap cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
