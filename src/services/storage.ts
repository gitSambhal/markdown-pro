/**
 * Markdown Viewer Pro - Storage & File Sync Service
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import { MarkdownFile, ThemeId, ViewMode } from '../types';
import { SAMPLE_DOCUMENTS } from '../utils/samples';

const STORAGE_KEY_FILES = 'md_viewer_files_v1';
const STORAGE_KEY_ACTIVE_ID = 'md_viewer_active_id_v1';
const STORAGE_KEY_THEME = 'md_viewer_theme_v1';
const STORAGE_KEY_VIEW_MODE = 'md_viewer_view_mode_v1';
const STORAGE_KEY_FONT_SIZE = 'md_viewer_font_size_v1';
const STORAGE_KEY_CONTAINER_WIDTH = 'md_viewer_container_width_v1';
const STORAGE_KEY_SIDEBAR_OPEN = 'md_viewer_sidebar_open_v1';
const STORAGE_KEY_OPEN_TABS = 'md_viewer_open_tabs_v1';
const STORAGE_KEY_INITIALIZED = 'md_viewer_initialized_v1';

export const StorageService = {
  loadFiles(): MarkdownFile[] {
    try {
      const initialized = localStorage.getItem(STORAGE_KEY_INITIALIZED);
      const data = localStorage.getItem(STORAGE_KEY_FILES);

      if (!initialized && !data) {
        localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
        return SAMPLE_DOCUMENTS;
      }

      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved files from localStorage', e);
    }
    return SAMPLE_DOCUMENTS;
  },

  saveFiles(files: MarkdownFile[]) {
    try {
      localStorage.setItem(STORAGE_KEY_INITIALIZED, 'true');
      // Don't store huge objects or circular handles into localStorage
      const storableFiles = files.map(f => ({
        id: f.id,
        name: f.name,
        content: f.content,
        updatedAt: f.updatedAt,
        sizeBytes: f.content.length,
        isExternalFile: f.isExternalFile,
        lastModified: f.lastModified,
      }));
      localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(storableFiles));
    } catch (e) {
      console.error('Error saving files to localStorage', e);
    }
  },

  getActiveFileId(): string {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || '';
  },

  setActiveFileId(id: string) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  },

  getTheme(): ThemeId {
    return (localStorage.getItem(STORAGE_KEY_THEME) as ThemeId) || 'nord';
  },

  setTheme(theme: ThemeId) {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  },

  getViewMode(): ViewMode {
    return (localStorage.getItem(STORAGE_KEY_VIEW_MODE) as ViewMode) || 'view';
  },

  setViewMode(mode: ViewMode) {
    localStorage.setItem(STORAGE_KEY_VIEW_MODE, mode);
  },

  getFontSize(): number {
    const size = localStorage.getItem(STORAGE_KEY_FONT_SIZE);
    return size ? parseInt(size, 10) : 16;
  },

  setFontSize(size: number) {
    localStorage.setItem(STORAGE_KEY_FONT_SIZE, size.toString());
  },

  getContainerWidth(): 'narrow' | 'standard' | 'wide' | 'full' {
    return (localStorage.getItem(STORAGE_KEY_CONTAINER_WIDTH) as any) || 'standard';
  },

  setContainerWidth(width: 'narrow' | 'standard' | 'wide' | 'full') {
    localStorage.setItem(STORAGE_KEY_CONTAINER_WIDTH, width);
  },

  getSidebarOpen(): boolean {
    const val = localStorage.getItem(STORAGE_KEY_SIDEBAR_OPEN);
    return val !== null ? val === 'true' : true;
  },

  setSidebarOpen(open: boolean) {
    localStorage.setItem(STORAGE_KEY_SIDEBAR_OPEN, open.toString());
  },

  getOpenTabIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_OPEN_TABS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse open tabs from localStorage', e);
    }
    return [SAMPLE_DOCUMENTS[0].id];
  },

  setOpenTabIds(ids: string[]) {
    try {
      localStorage.setItem(STORAGE_KEY_OPEN_TABS, JSON.stringify(ids));
    } catch (e) {
      console.error('Error saving open tabs to localStorage', e);
    }
  }
};
