# Changelog

All notable changes to **Markdown Viewer Pro** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
