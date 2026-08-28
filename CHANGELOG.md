# Changelog

All notable changes to **Markdown Viewer Pro** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.3.0] - 2026-08-28

### Added
- **Interactive Landing Workspace & Empty State Experience**:
  - Beautiful empty workspace screen with drag-and-drop file upload target zone.
  - Quick action buttons to import files, open live sync file watcher, or create a blank markdown document.
  - Curated markdown template gallery (System Architecture, Math & KaTeX, Feature Showcase, Developer Guide) for one-click exploration.
  - Feature highlight chips for diagrams, math equations, multi-themes, and spacebar QuickLook.
- **Unrestricted File Deletion**:
  - Users can delete all documents including the last remaining file in the workspace.
  - When the last document is deleted, the app gracefully transitions to the clean Landing Workspace without errors or phantom files.
  - Empty state file explorer with quick "Create Doc" button.

---

## [1.2.0] - 2026-08-28

### Added
- **Multi-Document Tabs Workspace Bar**:
  - Tab bar above editor/reader with smooth switching, close buttons (`X`), middle-click to close, and "+" button to open a new tab.
  - Multi-tab keyboard navigation (`Ctrl+Tab`, `Ctrl+Shift+Tab`, `Cmd/Ctrl+W` to close tab, `Cmd/Ctrl+1..9` to switch directly to tabs).
  - Open tabs state persistence across page refreshes via `StorageService`.
  - Context menu and quick actions for closing other tabs or closing all tabs.
- **Universal Keyboard Shortcuts for Modals and Popups**:
  - `Escape`: Instantly dismiss any open modal, dialog, quicklook preview, or zoom inspector.
  - `Enter`: Instant confirmation in destructive delete modals, inline rename inputs, and quick-launch into viewer from QuickLook.
  - `Space / Esc` toggle in QuickLook with left/right arrow file cycling.
  - `+ / - / 0` shortcuts in Interactive Zoom & Pan Inspector.
- **Keyboard Shortcuts Cheat Sheet Modal (`?` or `Cmd/Ctrl + /`)**:
  - Interactive overlay displaying all navigation, tab management, editor, and modal shortcut keys with direct Esc/Enter dismissal.

---

## [1.1.4] - 2026-08-28

### Fixed
- **Code Block Line Number Positioning in Exported HTML**:
  - Embedded dedicated flexbox and column-alignment CSS rules (`.code-block-row`, `.code-line-numbers`, `.code-block-pre`) directly in standalone exported HTML stylesheets.
  - Resolved issue where line numbers rendered vertically stacked above the code in static HTML export viewers by ensuring side-by-side gutter alignment and matching baseline line heights.

---

## [1.1.3] - 2026-08-28

### Fixed
- **HTML Export Formatting & Block Isolation**:
  - Fixed erroneous code header injection into data tables by strictly scoping block processing to code containers (`data-block-type="code"`).
  - Resolved inline code conversion to full block windows in list items and paragraphs.
  - Stripped invalid outer `<pre>` wrappers around code block containers.
  - Sanitized Mermaid diagram sources by auto-stripping accidental markdown code fences prior to vector rendering.
  - Cleaned exported DOM from internal tracking attributes (`data--h-bstatus`, `node`, `data-toc-id`).

---

## [1.1.2] - 2026-08-28

### Fixed
- **HTML DOM Validation & Hydration Error Fix**: Resolved invalid nesting in `react-markdown` by adding a pass-through `pre` component wrapper and distinguishing inline vs block code without defaulting to `<CodeBlock>` `<div>` elements inside `<p>` or `<strong>` tags.

---

## [1.1.1] - 2026-08-28

### Fixed
- **Exported HTML Document Button & Styling Fix**: Cleaned up exported standalone HTML bundle by removing non-functional React modal triggers, rendering clean macOS dots, language tags, and standalone Vanilla JS copy buttons with clipboard feedback and full syntax styling.
- **Table of Contents Smooth Scroll Fix**: Fixed heading ID mismatch caused by per-render slug tracking; added deterministic slug resolution across all heading levels (`h1`-`h6`) and smooth viewport scrolling for both TOC clicks and direct heading anchor links.

---

## [1.1.0] - 2026-08-28

### Added
- **Neutralino.js Native Desktop Application Support**: Complete cross-platform desktop build pipeline (`neutralino.config.json`) generating lightweight native binaries for Windows (`.exe`), macOS (`arm64`, `x64`, `universal`), and Linux (`x64`, `arm64`, `armhf`).
- **Native Build Commands**:
  - `npm run neu:build` / `npm run build:native`: Vite production build + Neutralino release binary generation and `.zip` distribution.
  - `npm run neu:run`: Live native application preview.
  - `npm run neu:update`: Framework and client library updater.
- **Native OS Integration Service**: Direct filesystem I/O, native OS Open/Save dialogs, native window title sync, and OS notifications with automatic web fallback.
- **Custom Native Icon Suite**: High-resolution branded SVG and PNG app icons generated in `/public/icons/appIcon.png` and root `/icons/appIcon.png`.

---

## [1.0.0] - 2026-08-28

### Added
- **Instant .MD Rendering**: Lightning-fast markdown parsing supporting GFM tables, strikethroughs, autolinks, checklists, task toggles, and LaTeX math.
- **Native Mermaid Diagrams**: Zero plugins, zero setup! Support for flowcharts, sequence diagrams, class diagrams, state diagrams, ER diagrams, Gantt charts, git graphs, and mindmaps.
- **QuickLook Modal (Spacebar in Finder)**: Press `Space` on any document in the workspace/file explorer to trigger an instant floating macOS-style QuickLook preview.
- **Syntax Highlighting**: Comprehensive Prism syntax highlighting across 25+ popular languages with line numbers, code copy, and full-screen zoom.
- **12 Curated Document Themes**:
  - GitHub Light & GitHub Dark
  - Dracula
  - Nord
  - One Dark
  - Monokai Pro
  - Solarized Light & Solarized Dark
  - Tokyo Night
  - Gruvbox Dark
  - Sepia Editorial (Warm Paper & Serif)
  - Cyberpunk Neon
- **Interactive Zoom & Pan**: Dedicated zoom modal for complex Mermaid diagrams, wide tables, and code snippets with SVG export and drag-to-pan.
- **Table of Contents Sidebar**: Auto-generated nested outline with active scroll-spy, search filter, reading progress bar, word count, and estimated read time.
- **Live Reload & External File Sync**: File System Access API integration with live polling to watch and auto-reload files when edited externally.
- **Multi-document Workspace**: Create, import, export (`.md`, `.html`, Print/PDF), rename, and manage multiple documents locally.
- **Developer Attribution**: Attribution to **Suhail Akhtar** ([suhail.top](https://suhail.top)).
