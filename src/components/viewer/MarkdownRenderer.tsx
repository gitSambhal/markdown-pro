/**
 * Markdown Viewer Pro - Complete Core Markdown Engine
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { slugify } from '../../utils/toc';
import { DocumentTheme, ZoomTargetData } from '../../types';
import { MermaidRenderer } from './MermaidRenderer';
import { CodeBlock } from './CodeBlock';
import { TableRenderer } from './TableRenderer';
import { openExternalUrl } from '../../services/neutralino';
import { Hash, ExternalLink, CheckSquare, Square } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  theme: DocumentTheme;
  fontSize: number;
  onOpenZoom: (data: ZoomTargetData) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

// Helper to recursively extract plain text from React nodes
function extractTextFromChildren(children: React.ReactNode): string {
  if (!children) return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (React.isValidElement(children)) {
    return extractTextFromChildren((children.props as any)?.children);
  }
  return '';
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  theme,
  fontSize,
  onOpenZoom,
  onToast,
}) => {
  // Fresh slug tracker for every render pass to keep DOM IDs 100% matched with Table of Contents
  const slugCountsRef = React.useRef<Record<string, number>>({});
  const headingIndexRef = React.useRef<number>(0);

  slugCountsRef.current = {};
  headingIndexRef.current = 0;

  const getHeadingId = (children: React.ReactNode): string => {
    const text = extractTextFromChildren(children);
    let baseSlug = slugify(text) || 'heading';
    if (slugCountsRef.current[baseSlug] !== undefined) {
      slugCountsRef.current[baseSlug]++;
      baseSlug = `${baseSlug}-${slugCountsRef.current[baseSlug]}`;
    } else {
      slugCountsRef.current[baseSlug] = 0;
    }
    return baseSlug;
  };

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id) || document.querySelector(`[data-toc-id="${id}"]`);
    const viewport = document.getElementById('document-scroll-viewport');
    if (el && viewport) {
      const viewportRect = viewport.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetScrollTop = viewport.scrollTop + (elRect.top - viewportRect.top) - 24;
      viewport.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
      window.history.replaceState(null, '', `#${id}`);
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  // Memoized custom component map for react-markdown
  const components = useMemo(() => {
    return {
      // Pass-through for pre tag so CodeBlock can manage its own container without invalid pre nesting
      pre({ children }: any) {
        return <>{children}</>;
      },

      // Code & Mermaid Handler
      code({ node, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        const lang = match ? match[1].toLowerCase() : '';
        const rawCode = String(children).replace(/\n$/, '');

        // In react-markdown v10, block code has language-* className or multi-line content
        const isBlock = Boolean(match) || (Boolean(className) && className.startsWith('language-')) || String(children).includes('\n');

        // If Mermaid diagram block
        if (isBlock && lang === 'mermaid') {
          return (
            <MermaidRenderer
              code={rawCode}
              theme={theme}
              onOpenZoom={onOpenZoom}
              onToast={onToast}
            />
          );
        }

        // Multi-line code block
        if (isBlock) {
          return (
            <CodeBlock
              language={lang || 'text'}
              code={rawCode}
              theme={theme}
              onOpenZoom={onOpenZoom}
              onToast={onToast}
            />
          );
        }

        // Inline code pill
        return (
          <code
            className="px-1.5 py-0.5 rounded text-[0.88em] font-mono font-medium border"
            style={{
              backgroundColor: theme.inlineCodeBg,
              color: theme.inlineCodeText,
              borderColor: theme.codeBorder,
            }}
            {...props}
          >
            {children}
          </code>
        );
      },

      // Table Wrapper
      table({ children }: any) {
        return (
          <TableRenderer
            theme={theme}
            onOpenZoom={onOpenZoom}
            onToast={onToast}
          >
            <table className="w-full text-left border-collapse text-sm">{children}</table>
          </TableRenderer>
        );
      },

      thead({ children }: any) {
        return (
          <thead
            style={{
              backgroundColor: theme.tableHeaderBg,
              borderBottom: `2px solid ${theme.tableBorder}`,
            }}
          >
            {children}
          </thead>
        );
      },

      th({ children }: any) {
        return (
          <th
            className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-left"
            style={{
              color: theme.heading,
              borderRight: `1px solid ${theme.tableBorder}`,
            }}
          >
            {children}
          </th>
        );
      },

      td({ children }: any) {
        return (
          <td
            className="px-4 py-2.5 text-sm border-b"
            style={{
              borderColor: theme.tableBorder,
              borderRight: `1px solid ${theme.tableBorder}`,
            }}
          >
            {children}
          </td>
        );
      },

      tr({ children, ...props }: any) {
        return (
          <tr className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors" {...props}>
            {children}
          </tr>
        );
      },

      // Headings with Anchor Link & Deterministic Tracking Attributes
      h1({ children }: any) {
        const id = getHeadingId(children);
        const idx = headingIndexRef.current++;
        const text = extractTextFromChildren(children);
        return (
          <h1
            id={id}
            data-toc-id={id}
            data-heading-index={idx}
            data-heading-text={text}
            className="group scroll-mt-24 text-3xl sm:text-4xl font-extrabold tracking-tight mt-10 mb-5 pb-3 border-b flex items-center gap-2"
            style={{
              color: theme.heading,
              borderColor: theme.surfaceBorder,
            }}
          >
            <span>{children}</span>
            <a
              href={`#${id}`}
              onClick={(e) => handleAnchorClick(e, id)}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-slate-400 p-1"
              title="Direct Link"
            >
              <Hash className="w-5 h-5" />
            </a>
          </h1>
        );
      },

      h2({ children }: any) {
        const id = getHeadingId(children);
        const idx = headingIndexRef.current++;
        const text = extractTextFromChildren(children);
        return (
          <h2
            id={id}
            data-toc-id={id}
            data-heading-index={idx}
            data-heading-text={text}
            className="group scroll-mt-24 text-2xl sm:text-3xl font-bold tracking-tight mt-9 mb-4 pb-2 border-b flex items-center gap-2"
            style={{
              color: theme.heading,
              borderColor: theme.surfaceBorder,
            }}
          >
            <span>{children}</span>
            <a
              href={`#${id}`}
              onClick={(e) => handleAnchorClick(e, id)}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-slate-400 p-1"
              title="Direct Link"
            >
              <Hash className="w-4 h-4" />
            </a>
          </h2>
        );
      },

      h3({ children }: any) {
        const id = getHeadingId(children);
        const idx = headingIndexRef.current++;
        const text = extractTextFromChildren(children);
        return (
          <h3
            id={id}
            data-toc-id={id}
            data-heading-index={idx}
            data-heading-text={text}
            className="group scroll-mt-24 text-xl sm:text-2xl font-bold tracking-tight mt-7 mb-3 flex items-center gap-2"
            style={{ color: theme.heading }}
          >
            <span>{children}</span>
            <a
              href={`#${id}`}
              onClick={(e) => handleAnchorClick(e, id)}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-slate-400 p-1"
              title="Direct Link"
            >
              <Hash className="w-4 h-4" />
            </a>
          </h3>
        );
      },

      h4({ children }: any) {
        const id = getHeadingId(children);
        const idx = headingIndexRef.current++;
        const text = extractTextFromChildren(children);
        return (
          <h4
            id={id}
            data-toc-id={id}
            data-heading-index={idx}
            data-heading-text={text}
            className="group scroll-mt-24 text-lg font-semibold tracking-tight mt-6 mb-2 flex items-center gap-2"
            style={{ color: theme.heading }}
          >
            <span>{children}</span>
            <a
              href={`#${id}`}
              onClick={(e) => handleAnchorClick(e, id)}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity text-slate-400 p-1 text-sm"
              title="Direct Link"
            >
              <Hash className="w-3.5 h-3.5" />
            </a>
          </h4>
        );
      },

      h5({ children }: any) {
        const id = getHeadingId(children);
        const idx = headingIndexRef.current++;
        const text = extractTextFromChildren(children);
        return (
          <h5
            id={id}
            data-toc-id={id}
            data-heading-index={idx}
            data-heading-text={text}
            className="scroll-mt-24 text-base font-semibold tracking-tight mt-5 mb-2"
            style={{ color: theme.heading }}
          >
            {children}
          </h5>
        );
      },

      h6({ children }: any) {
        const id = getHeadingId(children);
        const idx = headingIndexRef.current++;
        const text = extractTextFromChildren(children);
        return (
          <h6
            id={id}
            data-toc-id={id}
            data-heading-index={idx}
            data-heading-text={text}
            className="scroll-mt-24 text-sm font-semibold tracking-tight uppercase tracking-wider mt-4 mb-2 opacity-80"
            style={{ color: theme.heading }}
          >
            {children}
          </h6>
        );
      },

      // Blockquote
      blockquote({ children }: any) {
        return (
          <blockquote
            className="my-5 pl-4 py-2 border-l-4 rounded-r-xl text-sm leading-relaxed"
            style={{
              borderLeftColor: theme.blockquoteBorder,
              backgroundColor: theme.blockquoteBg,
              color: theme.text,
            }}
          >
            {children}
          </blockquote>
        );
      },

      // Paragraph
      p({ children }: any) {
        return <p className="my-4 leading-relaxed">{children}</p>;
      },

      // Lists & Task Lists
      ul({ children, className }: any) {
        const isTaskList = className?.includes('contains-task-list');
        return (
          <ul className={`my-4 pl-6 space-y-1.5 ${isTaskList ? 'list-none !pl-0' : 'list-disc'}`}>
            {children}
          </ul>
        );
      },

      ol({ children }: any) {
        return <ol className="my-4 pl-6 list-decimal space-y-1.5">{children}</ol>;
      },

      li({ children, className, checked }: any) {
        if (typeof checked === 'boolean') {
          return (
            <li className="flex items-start gap-2.5 my-1.5 list-none">
              <span className="mt-1 shrink-0">
                {checked ? (
                  <CheckSquare className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
              </span>
              <span className={checked ? 'line-through opacity-70' : ''}>{children}</span>
            </li>
          );
        }
        return <li className="leading-relaxed">{children}</li>;
      },

      // Anchor Links with Native External Browser Support
      a({ href, children }: any) {
        const isExternal = href?.startsWith('http://') || href?.startsWith('https://') || href?.startsWith('//') || href?.startsWith('mailto:');
        const isHash = href?.startsWith('#');

        const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
          if (isHash && href) {
            e.preventDefault();
            const targetId = href.substring(1);
            const el = document.getElementById(targetId) || document.querySelector(`[data-toc-id="${targetId}"]`);
            const viewport = document.getElementById('document-scroll-viewport');
            if (el && viewport) {
              const viewportRect = viewport.getBoundingClientRect();
              const elRect = el.getBoundingClientRect();
              const targetScrollTop = viewport.scrollTop + (elRect.top - viewportRect.top) - 24;
              viewport.scrollTo({
                top: Math.max(0, targetScrollTop),
                behavior: 'smooth',
              });
              window.history.replaceState(null, '', href);
            } else if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              window.history.replaceState(null, '', href);
            }
            return;
          }

          if (isExternal && href) {
            e.preventDefault();
            openExternalUrl(href);
          }
        };

        return (
          <a
            href={href}
            onClick={handleLinkClick}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className="inline-flex items-center gap-0.5 font-medium underline underline-offset-4 transition-colors"
            style={{ color: theme.accent }}
          >
            <span>{children}</span>
            {isExternal && <ExternalLink className="w-3.5 h-3.5 ml-0.5 inline opacity-70" />}
          </a>
        );
      },

      // Horizontal Rule
      hr() {
        return (
          <hr
            className="my-8 border-t"
            style={{ borderColor: theme.surfaceBorder }}
          />
        );
      },

      // Image
      img({ src, alt }: any) {
        return (
          <span className="my-6 block rounded-xl overflow-hidden border shadow-md" style={{ borderColor: theme.surfaceBorder }}>
            <img
              src={src}
              alt={alt || 'Markdown visual asset'}
              className="max-w-full h-auto object-cover mx-auto"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
            {alt && (
              <span className="block text-center text-xs p-2 text-slate-400 bg-black/10 border-t" style={{ borderColor: theme.surfaceBorder }}>
                {alt}
              </span>
            )}
          </span>
        );
      },
    };
  }, [theme, onOpenZoom, onToast]);

  return (
    <div
      id="markdown-rendered-view"
      className="markdown-pro-body max-w-none transition-all duration-150"
      style={{
        fontSize: `${fontSize}px`,
        color: theme.text,
        fontFamily: theme.fontFamily,
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
