/**
 * Markdown Viewer Pro - Rich Interactive Table Component
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Maximize2, Copy, Check, Table as TableIcon } from 'lucide-react';
import { DocumentTheme, ZoomTargetData } from '../../types';

interface TableRendererProps {
  children: React.ReactNode;
  theme: DocumentTheme;
  onOpenZoom: (data: ZoomTargetData) => void;
  onToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) => void;
}

export const TableRenderer: React.FC<TableRendererProps> = ({
  children,
  theme,
  onOpenZoom,
  onToast,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleCopyTable = () => {
    if (!tableRef.current) return;
    const tableEl = tableRef.current.querySelector('table');
    if (!tableEl) return;

    // Convert HTML table to CSV format
    const rows = Array.from(tableEl.querySelectorAll('tr'));
    const csvContent = rows
      .map((row) => {
        const cells = Array.from(row.querySelectorAll('th, td'));
        return cells.map((cell) => `"${cell.textContent?.trim().replace(/"/g, '""') || ''}"`).join(',');
      })
      .join('\n');

    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    onToast('success', 'Table copied as CSV', 'Paste directly into Excel or Google Sheets.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoom = () => {
    if (!tableRef.current) return;
    const tableEl = tableRef.current.querySelector('table');
    const tableHtml = tableEl ? tableEl.outerHTML : '';

    onOpenZoom({
      type: 'table',
      title: 'Data Table Inspector',
      content: tableEl?.innerText || 'Table data',
      svgHtml: tableHtml,
    });
  };

  return (
    <div
      ref={tableRef}
      className="group relative my-6 rounded-xl border transition-all duration-200 overflow-hidden shadow-sm"
      style={{
        borderColor: theme.tableBorder,
        backgroundColor: theme.surface,
      }}
    >
      {/* Table Action Bar */}
      <div
        className="flex items-center justify-between px-4 py-2 text-xs border-b select-none"
        style={{
          borderColor: theme.tableBorder,
          backgroundColor: theme.surface,
          color: theme.textMuted,
        }}
      >
        <span className="font-mono text-[11px] flex items-center gap-1.5 font-medium">
          <TableIcon className="w-3.5 h-3.5 text-emerald-400" />
          Data Table
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopyTable}
            className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-black/10 transition-colors"
            title="Copy Table as CSV"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">{copied ? 'Copied' : 'Copy CSV'}</span>
          </button>

          <button
            onClick={handleZoom}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 transition-colors ml-1 font-medium"
            title="Zoom & Expand Table"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="text-[11px]">Zoom</span>
          </button>
        </div>
      </div>

      {/* Responsive Table Scroll Container */}
      <div className="overflow-x-auto p-1">
        <div className="markdown-table-wrapper w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
