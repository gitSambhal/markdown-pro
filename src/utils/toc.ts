/**
 * Markdown Viewer Pro - TOC & Heading Extraction Utilities
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import { DocumentStats, TocItem } from '../types';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extracts clean structured table of contents from raw markdown string
 */
export function extractTableOfContents(markdown: string): TocItem[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const toc: TocItem[] = [];
  const slugCounts: Record<string, number> = {};

  let inCodeBlock = false;

  for (const line of lines) {
    // Toggle code block state to avoid matching markdown comments or headings inside code
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      let rawText = headingMatch[2].trim();

      // Strip markdown formatting from TOC title like bold, italics, links, backticks
      const cleanText = rawText
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/~~(.*?)~~/g, '$1')
        .trim();

      let baseSlug = slugify(cleanText) || `heading-${toc.length + 1}`;
      if (slugCounts[baseSlug] !== undefined) {
        slugCounts[baseSlug]++;
        baseSlug = `${baseSlug}-${slugCounts[baseSlug]}`;
      } else {
        slugCounts[baseSlug] = 0;
      }

      toc.push({
        id: baseSlug,
        text: cleanText,
        level,
      });
    }
  }

  return toc;
}

/**
 * Computes deep document statistics (word count, reading time, code blocks, diagrams, etc.)
 */
export function computeDocumentStats(markdown: string): DocumentStats {
  if (!markdown) {
    return {
      wordCount: 0,
      characterCount: 0,
      readingTimeMinutes: 0,
      headingsCount: 0,
      codeBlocksCount: 0,
      diagramsCount: 0,
      tablesCount: 0,
    };
  }

  const cleanText = markdown.replace(/```[\s\S]*?```/g, ' ');
  const words = cleanText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const characterCount = markdown.length;
  
  // Standard reading speed ~200 words/minute
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const headingsMatch = markdown.match(/^#{1,6}\s+/gm);
  const headingsCount = headingsMatch ? headingsMatch.length : 0;

  const codeBlocksMatch = markdown.match(/```[a-zA-Z0-9_-]*/g);
  const codeBlocksCount = codeBlocksMatch ? codeBlocksMatch.length : 0;

  const mermaidMatch = markdown.match(/```mermaid/g);
  const diagramsCount = mermaidMatch ? mermaidMatch.length : 0;

  const tablesMatch = markdown.match(/\|[\s\S]+?\|\n\|[-:\s|]+\|/g);
  const tablesCount = tablesMatch ? tablesMatch.length : 0;

  return {
    wordCount,
    characterCount,
    readingTimeMinutes,
    headingsCount,
    codeBlocksCount,
    diagramsCount,
    tablesCount,
  };
}
