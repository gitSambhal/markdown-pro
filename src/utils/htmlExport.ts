/**
 * Markdown Viewer Pro - Standalone High-Fidelity HTML Exporter
 * Generates beautifully styled, self-contained, offline-ready HTML documents
 * with syntax highlighting, mathematical equations, tables, and functional copy buttons.
 * 
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import { DocumentTheme, MarkdownFile } from '../types';

export function generateExportedHtml(
  file: MarkdownFile,
  theme: DocumentTheme,
  fontSize: number
): string {
  const renderedContainer = document.getElementById('markdown-rendered-view');
  let bodyContent = '';

  if (renderedContainer) {
    // Clone the rendered view so we can safely clean up buttons without affecting the live React DOM
    const clone = renderedContainer.cloneNode(true) as HTMLElement;

    // 0. Unwrap any extraneous <pre> that has block children (prevents invalid <pre><div> nesting)
    const nestedPres = clone.querySelectorAll('pre');
    nestedPres.forEach((pre) => {
      if (pre.querySelector('div, table, .code-block-wrapper, .table-renderer-wrapper, .mermaid-renderer-wrapper')) {
        const parent = pre.parentNode;
        if (parent) {
          while (pre.firstChild) {
            parent.insertBefore(pre.firstChild, pre);
          }
          parent.removeChild(pre);
        }
      }
    });

    // 1. Process Code Blocks: Target specifically code block containers
    const codeWrappers = clone.querySelectorAll('[data-block-type="code"], .code-block-wrapper, div[id^="code-block-"]');
    codeWrappers.forEach((wrapper) => {
      // Find the language label
      const langAttr = wrapper.getAttribute('data-language');
      const langSpan = wrapper.querySelector('span.font-mono.font-bold, span.code-lang-badge');
      const lang = langAttr || (langSpan ? langSpan.textContent?.trim() || 'TEXT' : 'TEXT');

      // Find line count
      const lineCountSpan = wrapper.querySelector('span.text-\\[11px\\], span.code-lines-count');
      const lineCountText = lineCountSpan ? lineCountSpan.textContent?.trim() || '' : '';

      // Clean up header toolbar
      const headerDiv = wrapper.querySelector('div.flex.items-center.justify-between');
      if (headerDiv) {
        headerDiv.className = 'code-header';
        headerDiv.innerHTML = `
          <div class="code-header-left">
            <div class="mac-dots">
              <span class="mac-dot red"></span>
              <span class="mac-dot yellow"></span>
              <span class="mac-dot green"></span>
            </div>
            <span class="code-lang-badge">${lang.toUpperCase()}</span>
            ${lineCountText ? `<span class="code-lines-count">${lineCountText}</span>` : ''}
          </div>
          <div class="code-header-right">
            <button type="button" class="export-copy-btn" onclick="copySnippet(this)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
              <span>Copy</span>
            </button>
          </div>
        `;
      }
    });

    // 2. Process Tables: Clean up table wrappers and remove interactive buttons
    const tableWrappers = clone.querySelectorAll('[data-block-type="table"], .table-renderer-wrapper');
    tableWrappers.forEach((tw) => {
      // Remove the action toolbar in export so table is pristine
      const header = tw.querySelector('div.flex.items-center.justify-between, .code-header');
      if (header) {
        header.remove();
      }
      tw.classList.add('table-container');
    });

    // 3. Process Mermaid Diagrams: Clean diagram header, keep vector SVG
    const mermaidContainers = clone.querySelectorAll('[data-block-type="mermaid"], .mermaid-renderer-wrapper, .mermaid-renderer, [id^="mermaid-container-"]');
    mermaidContainers.forEach((container) => {
      const header = container.querySelector('div.flex.items-center.justify-between, .code-header');
      if (header) {
        header.className = 'code-header';
        header.innerHTML = `
          <div class="code-header-left">
            <div class="mac-dots">
              <span class="mac-dot red"></span>
              <span class="mac-dot yellow"></span>
              <span class="mac-dot green"></span>
            </div>
            <span class="code-lang-badge">MERMAID DIAGRAM</span>
          </div>
        `;
      }
    });

    // 4. Remove all remaining interactive buttons that depend on React runtime
    const allRemainingButtons = clone.querySelectorAll('button:not(.export-copy-btn)');
    allRemainingButtons.forEach((btn) => btn.remove());

    // 5. Clean Heading Anchors: convert to standard clean link
    const headingAnchors = clone.querySelectorAll('h1 a, h2 a, h3 a, h4 a, h5 a, h6 a');
    headingAnchors.forEach((a) => {
      a.className = 'heading-anchor';
      a.innerHTML = '#';
    });

    // 6. Strip internal tracking and react attributes
    const allElements = clone.querySelectorAll('*');
    allElements.forEach((el) => {
      el.removeAttribute('data--h-bstatus');
      el.removeAttribute('node');
      el.removeAttribute('data-toc-id');
      el.removeAttribute('data-heading-index');
      el.removeAttribute('data-heading-text');
    });

    bodyContent = clone.innerHTML;
  } else {
    bodyContent = `<pre><code>${escapeHtml(file.content)}</code></pre>`;
  }

  // Syntax highlighting CSS tokens matching the selected theme
  const syntaxCss = getThemeSyntaxCss(theme);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(file.name)}</title>
  <meta name="author" content="Suhail Akhtar (suhail.top)">
  <meta name="generator" content="Markdown Viewer Pro">
  
  <!-- Math Formula (KaTeX) Stylesheet -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossorigin="anonymous">
  
  <!-- Web Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">

  <style>
    /* CSS Reset & Root Variables */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    :root {
      --bg-color: ${theme.bg};
      --text-color: ${theme.text};
      --text-muted: ${theme.textMuted};
      --heading-color: ${theme.heading};
      --accent-color: ${theme.accent};
      --accent-hover: ${theme.accentHover};
      --surface-bg: ${theme.surface};
      --surface-border: ${theme.surfaceBorder};
      --code-bg: ${theme.codeBg};
      --code-text: ${theme.codeText};
      --code-border: ${theme.codeBorder};
      --inline-code-bg: ${theme.inlineCodeBg};
      --inline-code-text: ${theme.inlineCodeText};
      --blockquote-bg: ${theme.blockquoteBg};
      --blockquote-border: ${theme.blockquoteBorder};
      --table-border: ${theme.tableBorder};
      --table-header-bg: ${theme.tableHeaderBg};
      --table-stripe-bg: ${theme.tableStripeBg};
      --font-main: ${theme.fontFamily};
      --font-mono: 'Fira Code', 'JetBrains Mono', Consolas, Monaco, monospace;
    }

    html {
      scroll-behavior: smooth;
      font-size: ${fontSize}px;
      background-color: var(--bg-color);
      color: var(--text-color);
    }

    body {
      font-family: var(--font-main);
      line-height: 1.75;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      padding: 48px 24px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .doc-container {
      width: 100%;
      max-width: 860px;
      margin: 0 auto;
    }

    /* Headings */
    h1, h2, h3, h4, h5, h6 {
      color: var(--heading-color);
      font-weight: 700;
      line-height: 1.3;
      position: relative;
      scroll-margin-top: 32px;
    }

    h1 {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      margin: 2.5rem 0 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--surface-border);
    }

    h2 {
      font-size: 1.75rem;
      letter-spacing: -0.02em;
      margin: 2.25rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--surface-border);
    }

    h3 {
      font-size: 1.35rem;
      letter-spacing: -0.015em;
      margin: 1.75rem 0 0.75rem;
    }

    h4 {
      font-size: 1.15rem;
      margin: 1.5rem 0 0.5rem;
    }

    h5 {
      font-size: 1rem;
      margin: 1.25rem 0 0.5rem;
    }

    h6 {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 1rem 0 0.5rem;
      opacity: 0.8;
    }

    /* Direct Heading Anchors */
    .heading-anchor {
      display: inline-block;
      margin-left: 8px;
      color: var(--text-muted);
      text-decoration: none;
      opacity: 0.3;
      font-size: 0.8em;
      transition: opacity 0.2s, color 0.2s;
    }

    h1:hover .heading-anchor,
    h2:hover .heading-anchor,
    h3:hover .heading-anchor,
    h4:hover .heading-anchor {
      opacity: 0.8;
      color: var(--accent-color);
    }

    /* Paragraphs & Text */
    p {
      margin: 1.15rem 0;
      line-height: 1.75;
    }

    strong {
      font-weight: 700;
      color: var(--heading-color);
    }

    em {
      font-style: italic;
    }

    /* Hyperlinks */
    a {
      color: var(--accent-color);
      text-decoration: underline;
      text-underline-offset: 3px;
      transition: color 0.15s;
    }

    a:hover {
      color: var(--accent-hover);
    }

    /* Inline Code */
    code:not(pre code) {
      font-family: var(--font-mono);
      font-size: 0.88em;
      background-color: var(--inline-code-bg);
      color: var(--inline-code-text);
      padding: 0.2em 0.45em;
      border-radius: 4px;
      border: 1px solid var(--code-border);
    }

    /* Code Blocks & Wrappers */
    .code-block-wrapper, [id^="code-block-"] {
      margin: 1.75rem 0;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid var(--code-border);
      background-color: var(--code-bg);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }

    .code-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      font-size: 12px;
      border-bottom: 1px solid var(--code-border);
      background-color: var(--surface-bg);
      color: var(--text-muted);
      user-select: none;
    }

    .code-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .code-header-right {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* macOS Window Dots */
    .mac-dots {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-right: 4px;
    }

    .mac-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      opacity: 0.85;
    }

    .mac-dot.red { background-color: #BF616A; }
    .mac-dot.yellow { background-color: #EBCB8B; }
    .mac-dot.green { background-color: #A3BE8C; }

    .code-lang-badge {
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(0, 0, 0, 0.2);
      color: var(--accent-color);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .code-lines-count {
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Code Block Body & Line Number Alignment */
    .code-block-body,
    .code-block-wrapper > div:last-child {
      padding: 16px;
      overflow-x: auto;
      background-color: var(--code-bg);
    }

    .code-block-row,
    .code-block-wrapper .flex {
      display: flex !important;
      flex-direction: row !important;
      align-items: flex-start !important;
      width: 100%;
      min-width: 100%;
    }

    .code-line-numbers,
    .code-block-wrapper .select-none.pr-4 {
      display: flex !important;
      flex-direction: column !important;
      user-select: none;
      padding-right: 16px;
      margin: 0;
      text-align: right;
      border-right: 1px solid var(--code-border);
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.625;
      color: var(--text-muted);
      opacity: 0.45;
      flex-shrink: 0;
    }

    .code-line-numbers .line-number,
    .code-line-numbers div,
    .code-block-wrapper .select-none.pr-4 div {
      line-height: 1.625;
      font-family: var(--font-mono);
      font-size: 13px;
    }

    .code-block-pre,
    .code-block-wrapper pre {
      flex: 1 1 0% !important;
      margin: 0 !important;
      padding: 0 0 0 16px !important;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 13px;
      line-height: 1.625;
      color: var(--code-text);
      background: transparent !important;
      border: none !important;
    }

    .code-block-wrapper pre:only-child {
      padding-left: 0 !important;
    }

    .code-block-wrapper pre code {
      font-family: inherit;
      font-size: inherit;
      line-height: 1.625;
      background: none !important;
      border: none !important;
      padding: 0 !important;
      color: inherit;
      display: block;
      white-space: pre;
    }

    /* Clean Standalone Copy Button */
    .export-copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      font-size: 11px;
      font-family: var(--font-main);
      font-weight: 600;
      color: var(--text-color);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--code-border);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      user-select: none;
    }

    .export-copy-btn:hover {
      background: var(--accent-color);
      color: #ffffff;
      border-color: var(--accent-color);
    }

    .export-copy-btn.copied {
      background: #10b981;
      color: #ffffff;
      border-color: #10b981;
    }

    pre:not(.code-block-pre):not(.code-block-wrapper pre) {
      padding: 16px;
      overflow-x: auto;
      font-family: var(--font-mono);
      font-size: 0.9em;
      line-height: 1.625;
      color: var(--code-text);
      border: none;
      margin: 0;
    }

    pre code {
      font-family: inherit;
      font-size: inherit;
      background: none !important;
      border: none !important;
      padding: 0 !important;
      color: inherit;
    }

    /* Blockquote */
    blockquote {
      margin: 1.5rem 0;
      padding: 14px 20px;
      border-left: 4px solid var(--blockquote-border);
      background-color: var(--blockquote-bg);
      border-radius: 0 8px 8px 0;
      font-style: normal;
      color: var(--text-color);
    }

    blockquote p {
      margin: 0.5rem 0;
    }

    /* Lists */
    ul, ol {
      margin: 1.25rem 0;
      padding-left: 2rem;
    }

    li {
      margin: 0.35rem 0;
    }

    /* Task Lists */
    ul.contains-task-list, li.task-list-item {
      list-style-type: none;
      padding-left: 0;
    }

    /* Tables */
    .table-container, table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.75rem 0;
      font-size: 0.92em;
      border: 1px solid var(--table-border);
      border-radius: 8px;
      overflow: hidden;
    }

    th, td {
      padding: 10px 14px;
      text-align: left;
      border-bottom: 1px solid var(--table-border);
      border-right: 1px solid var(--table-border);
    }

    th:last-child, td:last-child {
      border-right: none;
    }

    tr:last-child td {
      border-bottom: none;
    }

    th {
      background-color: var(--table-header-bg);
      font-weight: 700;
      color: var(--heading-color);
      text-transform: uppercase;
      font-size: 0.8em;
      letter-spacing: 0.05em;
    }

    tr:nth-child(even) td {
      background-color: var(--table-stripe-bg);
    }

    /* Horizontal Rules */
    hr {
      border: 0;
      height: 1px;
      background: var(--surface-border);
      margin: 2.5rem 0;
    }

    /* Images */
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      display: block;
      margin: 1.5rem auto;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Mermaid SVG Responsive Scaling */
    .mermaid-renderer svg, svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }

    /* Document Footer */
    footer {
      margin-top: 60px;
      padding-top: 24px;
      border-top: 1px solid var(--surface-border);
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
      line-height: 1.6;
    }

    footer a {
      color: var(--text-color);
      font-weight: 600;
      text-decoration: underline;
    }

    /* Syntax Highlighting */
    ${syntaxCss}

    /* Print Optimization */
    @media print {
      body {
        padding: 0;
        background: #ffffff !important;
        color: #111111 !important;
        font-size: 12pt;
      }
      .doc-container {
        max-width: 100%;
      }
      .export-copy-btn, .heading-anchor {
        display: none !important;
      }
      pre, blockquote, table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="doc-container">
    ${bodyContent}
    <footer>
      Exported with <strong>Markdown Viewer Pro</strong> &bull; Developed by <a href="https://suhail.top" target="_blank" rel="noopener noreferrer">Suhail Akhtar</a>
    </footer>
  </div>

  <script>
    function copySnippet(btn) {
      const wrapper = btn.closest('.code-block-wrapper') || btn.closest('[id^="code-block-"]') || btn.closest('div[style*="background"]');
      const codeEl = wrapper ? wrapper.querySelector('pre code') || wrapper.querySelector('pre') : null;
      if (!codeEl) return;
      
      const text = codeEl.innerText || codeEl.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        const originalHtml = btn.innerHTML;
        btn.classList.add('copied');
        btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Copied!</span>';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = originalHtml;
        }, 2000);
      }).catch(err => {
        console.error('Clipboard copy failed:', err);
      });
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getThemeSyntaxCss(theme: DocumentTheme): string {
  const isDark = theme.category === 'dark';

  if (isDark) {
    return `
    .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #6272a4; font-style: italic; }
    .token.punctuation { color: #f8f8f2; }
    .token.property, .token.tag, .token.constant, .token.symbol, .token.deleted { color: #ff79c6; }
    .token.boolean, .token.number { color: #bd93f9; }
    .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #50fa7b; }
    .token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #f1fa8c; }
    .token.atrule, .token.attr-value, .token.keyword { color: #ff79c6; font-weight: bold; }
    .token.function, .token.class-name { color: #8be9fd; }
    .token.regex, .token.important, .token.variable { color: #f1fa8c; }
    `;
  }

  return `
  .token.comment, .token.prolog, .token.doctype, .token.cdata { color: #6a737d; font-style: italic; }
  .token.punctuation { color: #24292e; }
  .token.property, .token.tag, .token.constant, .token.symbol, .token.deleted { color: #d73a49; }
  .token.boolean, .token.number { color: #005cc5; }
  .token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #22863a; }
  .token.operator, .token.entity, .token.url { color: #d73a49; }
  .token.atrule, .token.attr-value, .token.keyword { color: #d73a49; font-weight: bold; }
  .token.function, .token.class-name { color: #6f42c1; }
  .token.regex, .token.important, .token.variable { color: #e36209; }
  `;
}
