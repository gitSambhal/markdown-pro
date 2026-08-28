/**
 * Markdown Viewer Pro - Global Type Definitions
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

export type ThemeId =
  | 'github-light'
  | 'github-dark'
  | 'dracula'
  | 'nord'
  | 'one-dark'
  | 'monokai'
  | 'solarized-light'
  | 'solarized-dark'
  | 'tokyo-night'
  | 'gruvbox'
  | 'sepia'
  | 'cyberpunk';

export interface DocumentTheme {
  id: ThemeId;
  name: string;
  category: 'light' | 'dark' | 'sepia';
  bg: string;
  surface: string;
  surfaceBorder: string;
  text: string;
  textMuted: string;
  heading: string;
  accent: string;
  accentHover: string;
  codeBg: string;
  codeText: string;
  codeBorder: string;
  inlineCodeBg: string;
  inlineCodeText: string;
  blockquoteBg: string;
  blockquoteBorder: string;
  tableBorder: string;
  tableHeaderBg: string;
  tableStripeBg: string;
  mermaidTheme: 'default' | 'dark' | 'forest' | 'neutral' | 'base';
  mermaidVars: Record<string, string>;
  fontFamily: string;
  previewColors: [string, string, string]; // For theme preview pills
}

export interface MarkdownFile {
  id: string;
  name: string;
  content: string;
  updatedAt: number;
  sizeBytes: number;
  isExternalFile?: boolean;
  fileHandle?: any; // FileSystemFileHandle if loaded via File System Access API
  lastModified?: number;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children?: TocItem[];
}

export interface ZoomTargetData {
  type: 'mermaid' | 'table' | 'code';
  title: string;
  content: string;
  language?: string;
  svgHtml?: string;
}

export type ViewMode = 'view' | 'split' | 'edit';

export interface DocumentStats {
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  headingsCount: number;
  codeBlocksCount: number;
  diagramsCount: number;
  tablesCount: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}
