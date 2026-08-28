/**
 * Markdown Viewer Pro - Application Core & Workflow Manager
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  MarkdownFile,
  ThemeId,
  ViewMode,
  ZoomTargetData,
} from './types';
import { DOCUMENT_THEMES } from './utils/themes';
import { extractTableOfContents, computeDocumentStats } from './utils/toc';
import { generateExportedHtml } from './utils/htmlExport';
import { StorageService } from './services/storage';
import { setNativeWindowTitle } from './services/neutralino';
import { useToast } from './hooks/useToast';

import { TopNavbar } from './components/toolbar/TopNavbar';
import { TabBar } from './components/toolbar/TabBar';
import { FileExplorer } from './components/sidebar/FileExplorer';
import { TableOfContents } from './components/sidebar/TableOfContents';
import { MarkdownRenderer } from './components/viewer/MarkdownRenderer';
import { LiveEditor } from './components/editor/LiveEditor';
import { ZoomModal } from './components/common/ZoomModal';
import { QuickLookModal } from './components/quicklook/QuickLookModal';
import { ChangelogModal } from './components/common/ChangelogModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { ToastContainer } from './components/common/Toast';
import { Footer } from './components/footer/Footer';

export default function App() {
  // State Initialization from Persistent Local Storage
  const [files, setFiles] = useState<MarkdownFile[]>(() => StorageService.loadFiles());
  const [activeFileId, setActiveFileId] = useState<string>(() => StorageService.getActiveFileId());
  const [openTabIds, setOpenTabIds] = useState<string[]>(() => {
    const savedTabs = StorageService.getOpenTabIds();
    const active = StorageService.getActiveFileId();
    if (!savedTabs.includes(active)) {
      return [...savedTabs, active];
    }
    return savedTabs;
  });
  const [themeId, setThemeId] = useState<ThemeId>(() => StorageService.getTheme());
  const [viewMode, setViewMode] = useState<ViewMode>(() => StorageService.getViewMode());
  const [fontSize, setFontSize] = useState<number>(() => StorageService.getFontSize());
  const [containerWidth, setContainerWidth] = useState<'narrow' | 'standard' | 'wide' | 'full'>(
    () => StorageService.getContainerWidth()
  );
  const [isFilesOpen, setIsFilesOpen] = useState<boolean>(() => StorageService.getSidebarOpen());
  const [isTocOpen, setIsTocOpen] = useState<boolean>(true);

  // Modals & Overlay States
  const [zoomData, setZoomData] = useState<ZoomTargetData | null>(null);
  const [quickLookFile, setQuickLookFile] = useState<MarkdownFile | null>(null);
  const [isChangelogOpen, setIsChangelogOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  const { toasts, addToast, removeToast } = useToast();

  // Active theme object
  const currentTheme = useMemo(
    () => DOCUMENT_THEMES[themeId] || DOCUMENT_THEMES['github-dark'],
    [themeId]
  );

  // Active file object
  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0] || {
      id: 'fallback-doc',
      name: 'Untitled.md',
      content: '# Welcome to Markdown Viewer Pro\n\nStart typing here...',
      updatedAt: Date.now(),
      sizeBytes: 50,
    };
  }, [files, activeFileId]);

  // Document Metrics & Table of Contents
  const toc = useMemo(() => extractTableOfContents(activeFile.content), [activeFile.content]);
  const stats = useMemo(() => computeDocumentStats(activeFile.content), [activeFile.content]);

  // Persist files and preferences on updates
  useEffect(() => {
    StorageService.saveFiles(files);
  }, [files]);

  useEffect(() => {
    StorageService.setActiveFileId(activeFileId);
  }, [activeFileId]);

  useEffect(() => {
    StorageService.setOpenTabIds(openTabIds);
  }, [openTabIds]);

  useEffect(() => {
    StorageService.setTheme(themeId);
  }, [themeId]);

  useEffect(() => {
    StorageService.setViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    StorageService.setFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    StorageService.setContainerWidth(containerWidth);
  }, [containerWidth]);

  useEffect(() => {
    StorageService.setSidebarOpen(isFilesOpen);
  }, [isFilesOpen]);

  // Synchronize document title & Native Desktop Window Title
  useEffect(() => {
    if (activeFile?.name) {
      document.title = `${activeFile.name} — Markdown Viewer Pro`;
      setNativeWindowTitle(activeFile.name);
    }
  }, [activeFile?.name]);

  // Register PWA Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('ServiceWorker registered'))
        .catch((err) => console.warn('ServiceWorker registration error:', err));
    }
  }, []);

  // Live File Watcher Poller for external files opened via File System Access API
  const fileHandleRef = useRef<any>(null);
  const lastModifiedRef = useRef<number>(0);

  useEffect(() => {
    if (!activeFile.isExternalFile || !activeFile.fileHandle) {
      fileHandleRef.current = null;
      return;
    }

    fileHandleRef.current = activeFile.fileHandle;
    lastModifiedRef.current = activeFile.lastModified || 0;

    const interval = setInterval(async () => {
      try {
        if (!fileHandleRef.current) return;
        const fileObj = await fileHandleRef.current.getFile();
        if (fileObj.lastModified > lastModifiedRef.current) {
          lastModifiedRef.current = fileObj.lastModified;
          const freshText = await fileObj.text();

          setFiles((prev) =>
            prev.map((f) =>
              f.id === activeFile.id
                ? {
                    ...f,
                    content: freshText,
                    updatedAt: Date.now(),
                    sizeBytes: freshText.length,
                    lastModified: fileObj.lastModified,
                  }
                : f
            )
          );

          addToast('info', 'Live Reload', `${activeFile.name} was updated on disk.`);
        }
      } catch (err) {
        console.warn('File polling error:', err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeFile, addToast]);

  // File & Tab Operations
  const handleSelectFile = useCallback((id: string) => {
    setActiveFileId(id);
    setOpenTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleSelectTab = useCallback((id: string) => {
    setActiveFileId(id);
    setOpenTabIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const handleCloseTab = useCallback(
    (id: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      setOpenTabIds((prev) => {
        const filtered = prev.filter((tabId) => tabId !== id);
        if (filtered.length === 0) {
          // Keep at least one tab open
          const fallback = files.find((f) => f.id !== id) || files[0];
          if (fallback) {
            setActiveFileId(fallback.id);
            return [fallback.id];
          }
          return prev;
        }
        if (activeFileId === id) {
          const closedIndex = prev.indexOf(id);
          const nextIndex = Math.min(closedIndex, filtered.length - 1);
          setActiveFileId(filtered[nextIndex]);
        }
        return filtered;
      });
    },
    [activeFileId, files]
  );

  const handleCloseOtherTabs = useCallback(
    (id: string) => {
      setOpenTabIds([id]);
      setActiveFileId(id);
      addToast('info', 'Closed Other Tabs', 'Workspace tabs cleaned up.');
    },
    [addToast]
  );

  const handleCloseAllTabs = useCallback(() => {
    if (files.length > 0) {
      setOpenTabIds([files[0].id]);
      setActiveFileId(files[0].id);
    }
    addToast('info', 'Tabs Reset', 'Showing single active document.');
  }, [files, addToast]);

  const handleNewFile = useCallback(() => {
    const untitledCount = files.filter((f) => f.name.startsWith('Untitled')).length + 1;
    const newDoc: MarkdownFile = {
      id: 'doc-' + Math.random().toString(36).substring(2, 9),
      name: `Untitled-${untitledCount}.md`,
      content: `# Untitled Document ${untitledCount}\n\nStart writing markdown, or paste code & mermaid diagrams...\n\n\`\`\`mermaid\nflowchart LR\n    A[Input] --> B[Processing]\n    B --> C[Markdown Rendered]\n\`\`\`\n`,
      updatedAt: Date.now(),
      sizeBytes: 150,
    };

    setFiles((prev) => [newDoc, ...prev]);
    setOpenTabIds((prev) => [newDoc.id, ...prev]);
    setActiveFileId(newDoc.id);
    setViewMode('split');
    addToast('success', 'Created new document', newDoc.name);
  }, [files, addToast]);

  const handleImportFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const importedDocs: MarkdownFile[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        try {
          const text = await file.text();
          importedDocs.push({
            id: 'doc-' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            content: text,
            updatedAt: Date.now(),
            sizeBytes: text.length,
            lastModified: file.lastModified,
          });
        } catch (err) {
          console.error('Error reading imported file:', err);
        }
      }

      if (importedDocs.length > 0) {
        setFiles((prev) => [...importedDocs, ...prev]);
        const importedIds = importedDocs.map((d) => d.id);
        setOpenTabIds((prev) => [...importedIds, ...prev]);
        setActiveFileId(importedDocs[0].id);
        addToast(
          'success',
          `Imported ${importedDocs.length} ${importedDocs.length === 1 ? 'document' : 'documents'}`,
          'Ready for viewing and analysis.'
        );
      }
    },
    [addToast]
  );

  const handleWatchDiskFile = useCallback(async () => {
    if (!('showOpenFilePicker' in window)) {
      addToast(
        'warning',
        'Feature requires File System API',
        'Please use Chrome, Edge or Safari to live sync external files, or use standard file upload.'
      );
      return;
    }

    try {
      const [handle] = await (window as any).showOpenFilePicker({
        types: [
          {
            description: 'Markdown Files',
            accept: {
              'text/markdown': ['.md', '.markdown', '.txt'],
            },
          },
        ],
        multiple: false,
      });

      const fileObj = await handle.getFile();
      const text = await fileObj.text();

      const watchedDoc: MarkdownFile = {
        id: 'watched-' + Math.random().toString(36).substring(2, 9),
        name: fileObj.name,
        content: text,
        updatedAt: Date.now(),
        sizeBytes: text.length,
        isExternalFile: true,
        fileHandle: handle,
        lastModified: fileObj.lastModified,
      };

      setFiles((prev) => [watchedDoc, ...prev]);
      setOpenTabIds((prev) => [watchedDoc.id, ...prev]);
      setActiveFileId(watchedDoc.id);
      addToast(
        'success',
        'Live Watch Active',
        `Any edits to "${fileObj.name}" in your external editor will sync here immediately!`
      );
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('User cancelled or error opening disk file', err);
      }
    }
  }, [addToast]);

  const handleRenameFile = useCallback(
    (id: string, newName: string) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, name: newName, updatedAt: Date.now() } : f))
      );
      addToast('success', 'Document renamed', newName);
    },
    [addToast]
  );

  const handleDeleteFile = useCallback(
    (id: string) => {
      setFiles((prev) => {
        const filtered = prev.filter((f) => f.id !== id);
        if (activeFileId === id && filtered.length > 0) {
          setActiveFileId(filtered[0].id);
        }
        return filtered;
      });
      setOpenTabIds((prev) => prev.filter((tabId) => tabId !== id));
      addToast('info', 'Document removed', 'Removed from workspace.');
    },
    [activeFileId, addToast]
  );

  const handleUpdateContent = useCallback(
    (newContent: string) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? { ...f, content: newContent, updatedAt: Date.now(), sizeBytes: newContent.length }
            : f
        )
      );
    },
    [activeFileId]
  );

  const handleQuickLook = useCallback(
    (fileToPreview?: MarkdownFile) => {
      setQuickLookFile(fileToPreview || activeFile);
    },
    [activeFile]
  );

  // Export handlers
  const handleExportMarkdown = useCallback(() => {
    const blob = new Blob([activeFile.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name.endsWith('.md') ? activeFile.name : `${activeFile.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Downloaded Markdown', activeFile.name);
  }, [activeFile, addToast]);

  const handleExportHtml = useCallback(() => {
    const htmlBundle = generateExportedHtml(activeFile, currentTheme, fontSize);
    const blob = new Blob([htmlBundle], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeFile.name.replace(/\.[^/.]+$/, '')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Exported HTML Document', 'Self-contained file saved with full styles.');
  }, [activeFile, currentTheme, fontSize, addToast]);

  const handlePrintPdf = useCallback(() => {
    addToast('info', 'Preparing Print Preview', 'Opening system print dialog...');
    setTimeout(() => {
      window.print();
    }, 300);
  }, [addToast]);

  // Global Keyboard Shortcuts (Tabs, Popups, Modals, Workspace)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      // Escape: Dismiss active popups / modals
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          e.preventDefault();
          setIsShortcutsOpen(false);
          return;
        }
        if (isChangelogOpen) {
          e.preventDefault();
          setIsChangelogOpen(false);
          return;
        }
        if (quickLookFile) {
          e.preventDefault();
          setQuickLookFile(null);
          return;
        }
        if (zoomData) {
          e.preventDefault();
          setZoomData(null);
          return;
        }
      }

      // '?' or 'Cmd/Ctrl + /' for Shortcuts Cheat Sheet
      if ((e.key === '?' && !isInput) || ((e.metaKey || e.ctrlKey) && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
        return;
      }

      // Close Active Tab: Cmd/Ctrl + W
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'w') {
        e.preventDefault();
        handleCloseTab(activeFileId);
        return;
      }

      // New Document Tab: Cmd/Ctrl + Alt + N
      if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewFile();
        return;
      }

      // Cycle Open Tabs: Ctrl + Tab (or Ctrl + Shift + Tab)
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = openTabIds.indexOf(activeFileId);
        if (currentIndex !== -1 && openTabIds.length > 1) {
          const nextIndex = e.shiftKey
            ? (currentIndex - 1 + openTabIds.length) % openTabIds.length
            : (currentIndex + 1) % openTabIds.length;
          setActiveFileId(openTabIds[nextIndex]);
        }
        return;
      }

      // Jump to Tab #1..#9: Cmd/Ctrl + 1..9 (when not editing text)
      if ((e.metaKey || e.ctrlKey) && !isInput && /^[1-9]$/.test(e.key)) {
        const tabIndex = parseInt(e.key, 10) - 1;
        if (openTabIds[tabIndex]) {
          e.preventDefault();
          setActiveFileId(openTabIds[tabIndex]);
          return;
        }
      }

      // Toggle sidebars: Cmd/Ctrl + B (when not typing in editor)
      if ((e.metaKey || e.ctrlKey) && !isInput && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsFilesOpen((prev) => !prev);
        return;
      }

      // Toggle view mode: Cmd/Ctrl + E
      if ((e.metaKey || e.ctrlKey) && !isInput && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setViewMode((prev) => (prev === 'view' ? 'split' : prev === 'split' ? 'edit' : 'view'));
        return;
      }

      // Save / Export: Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleExportMarkdown();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [
    activeFileId,
    openTabIds,
    handleCloseTab,
    handleNewFile,
    handleExportMarkdown,
    isShortcutsOpen,
    isChangelogOpen,
    quickLookFile,
    zoomData,
  ]);

  // Container width max-width CSS classes
  const getContainerWidthClass = () => {
    switch (containerWidth) {
      case 'narrow':
        return 'max-w-[720px]';
      case 'standard':
        return 'max-w-[860px]';
      case 'wide':
        return 'max-w-[1120px]';
      case 'full':
        return 'max-w-none px-6';
      default:
        return 'max-w-[860px]';
    }
  };

  return (
    <div
      id="app-root-shell"
      className="flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-150"
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.text,
        ['--app-bg' as any]: currentTheme.bg,
        ['--app-surface' as any]: currentTheme.surface,
        ['--app-surface-border' as any]: currentTheme.surfaceBorder,
        ['--app-text' as any]: currentTheme.text,
        ['--app-text-muted' as any]: currentTheme.textMuted,
        ['--app-heading' as any]: currentTheme.heading,
        ['--app-accent' as any]: currentTheme.accent,
        ['--app-code-bg' as any]: currentTheme.codeBg,
      }}
    >
      {/* Top Navbar */}
      <TopNavbar
        activeFile={activeFile}
        theme={currentTheme}
        onThemeChange={setThemeId}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        containerWidth={containerWidth}
        onContainerWidthChange={setContainerWidth}
        isFilesOpen={isFilesOpen}
        onToggleFiles={() => setIsFilesOpen(!isFilesOpen)}
        isTocOpen={isTocOpen}
        onToggleToc={() => setIsTocOpen(!isTocOpen)}
        onQuickLook={() => handleQuickLook(activeFile)}
        onExportMarkdown={handleExportMarkdown}
        onExportHtml={handleExportHtml}
        onPrintPdf={handlePrintPdf}
        onRename={(newName) => handleRenameFile(activeFile.id, newName)}
        stats={stats}
        isLiveSyncActive={!!activeFile.isExternalFile}
        onToast={addToast}
      />

      {/* Main Multi-Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Files Explorer */}
        <FileExplorer
          files={files}
          activeFileId={activeFile.id}
          theme={currentTheme}
          onSelectFile={handleSelectFile}
          onNewFile={handleNewFile}
          onImportFiles={handleImportFiles}
          onWatchDiskFile={handleWatchDiskFile}
          onRenameFile={handleRenameFile}
          onDeleteFile={handleDeleteFile}
          onQuickLook={handleQuickLook}
          isOpen={isFilesOpen}
          onToast={addToast}
        />

        {/* Center: Multi-Tab Bar, Live Editor & Document Viewer */}
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {/* Multi-Tab Workspace Header Bar */}
          <TabBar
            files={files}
            openTabIds={openTabIds}
            activeFileId={activeFile.id}
            theme={currentTheme}
            onSelectTab={handleSelectTab}
            onCloseTab={handleCloseTab}
            onCloseOtherTabs={handleCloseOtherTabs}
            onCloseAllTabs={handleCloseAllTabs}
            onNewTab={handleNewFile}
            onOpenShortcuts={() => setIsShortcutsOpen(true)}
            onQuickLook={handleQuickLook}
          />

          {/* Editor & Viewport Workspace Area */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Split Mode: Live Editor on the Left */}
            {(viewMode === 'split' || viewMode === 'edit') && (
              <div className={`${viewMode === 'split' ? 'w-1/2' : 'w-full'} h-full flex flex-col`}>
                <LiveEditor
                  content={activeFile.content}
                  onChange={handleUpdateContent}
                  theme={currentTheme}
                  fontSize={fontSize}
                />
              </div>
            )}

            {/* Reader Viewport on the Right / Center */}
            {(viewMode === 'view' || viewMode === 'split') && (
              <div
                id="document-scroll-viewport"
                className={`${
                  viewMode === 'split' ? 'w-1/2' : 'w-full'
                } h-full overflow-y-auto transition-colors duration-150 p-6 sm:p-10 md:p-14`}
                style={{
                  backgroundColor: currentTheme.bg,
                }}
              >
                <div className={`mx-auto ${getContainerWidthClass()}`}>
                  <MarkdownRenderer
                    content={activeFile.content}
                    theme={currentTheme}
                    fontSize={fontSize}
                    onOpenZoom={setZoomData}
                    onToast={addToast}
                  />
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right: Table of Contents Sidebar */}
        <TableOfContents
          toc={toc}
          stats={stats}
          theme={currentTheme}
          isOpen={isTocOpen}
          onClose={() => setIsTocOpen(false)}
          onEnsureViewerVisible={() => {
            if (viewMode === 'edit') {
              setViewMode('split');
            }
          }}
        />
      </div>

      {/* Footer Status Bar with Developer Attribution */}
      <Footer
        stats={stats}
        activeFile={activeFile}
        theme={currentTheme}
        onOpenChangelog={() => setIsChangelogOpen(true)}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        theme={currentTheme}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Interactive Zoom & Pan Inspector Modal */}
      <ZoomModal
        data={zoomData}
        onClose={() => setZoomData(null)}
        onToast={addToast}
      />

      {/* macOS Finder Style Spacebar QuickLook Modal */}
      <QuickLookModal
        isOpen={!!quickLookFile}
        file={quickLookFile}
        files={files}
        theme={currentTheme}
        onClose={() => setQuickLookFile(null)}
        onSelectFile={handleSelectFile}
        onOpenZoom={setZoomData}
        onToast={addToast}
      />

      {/* What's New / Changelog Modal */}
      <ChangelogModal
        isOpen={isChangelogOpen}
        onClose={() => setIsChangelogOpen(false)}
      />

      {/* Toast Feedback Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
