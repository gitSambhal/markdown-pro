/**
 * Markdown Viewer Pro - Live Markdown Editor with Quick Formatting Toolbar
 * Developer: Suhail Akhtar (https://suhail.top)
 * @license Apache-2.0
 */

import React, { useRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Table as TableIcon,
  Workflow,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Sigma,
  Quote
} from 'lucide-react';
import { DocumentTheme } from '../../types';

interface LiveEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  theme: DocumentTheme;
  fontSize: number;
}

export const LiveEditor: React.FC<LiveEditorProps> = ({
  content,
  onChange,
  theme,
  fontSize,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertSnippet = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    onChange(newContent);

    // Reposition cursor inside insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleInsertMermaidFlowchart = () => {
    insertSnippet(
      '\n```mermaid\nflowchart TD\n    A[Start Process] --> B{Is Valid?}\n    B -->|Yes| C[Proceed Next]\n    B -->|No| D[Log Error]\n```\n',
      '',
      ''
    );
  };

  const handleInsertMermaidSequence = () => {
    insertSnippet(
      '\n```mermaid\nsequenceDiagram\n    autonumber\n    Client->>Server: Request Data\n    Server-->>Client: Return JSON Payload\n```\n',
      '',
      ''
    );
  };

  const handleInsertTable = () => {
    insertSnippet(
      '\n| Feature | Status | SLA | Notes |\n| :--- | :---: | :---: | :--- |\n| Core API | Active | 99.99% | Operational |\n| Telemetry | Active | 99.95% | Low Latency |\n',
      '',
      ''
    );
  };

  const handleInsertMath = () => {
    insertSnippet('\n$$\n\\sum_{i=1}^{n} x_i = \\mathcal{O}(n)\n$$\n', '', '');
  };

  return (
    <div
      id="live-editor-container"
      className="flex flex-col h-full border-r border-slate-800 bg-slate-950/80 overflow-hidden"
    >
      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-slate-900 border-b border-slate-800 flex-wrap select-none text-slate-300">
        <button
          onClick={() => insertSnippet('**', '**', 'bold text')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Bold (**text**)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('*', '*', 'italic text')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Italic (*text*)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('~~', '~~', 'strikethrough text')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Strikethrough (~~text~~)"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={() => insertSnippet('# ', '', 'Heading 1')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Heading 1 (#)"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('## ', '', 'Heading 2')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Heading 2 (##)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('> ', '', 'Quote text')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Blockquote (>)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={() => insertSnippet('`', '`', 'code')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Inline Code (`code`)"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('\n```typescript\n', '\n```\n', '// code here')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors font-mono text-[10px]"
          title="Code Block (```)"
        >
          ```
        </button>
        <button
          onClick={() => insertSnippet('[', '](https://suhail.top)', 'link title')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Hyperlink [title](url)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={handleInsertTable}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-emerald-400 transition-colors"
          title="Insert Markdown Table"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleInsertMermaidFlowchart}
          className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-[11px] font-medium transition-colors"
          title="Insert Mermaid Flowchart"
        >
          <Workflow className="w-3 h-3" />
          <span>Flowchart</span>
        </button>
        <button
          onClick={handleInsertMermaidSequence}
          className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 text-[11px] font-medium transition-colors"
          title="Insert Mermaid Sequence"
        >
          <Workflow className="w-3 h-3" />
          <span>Sequence</span>
        </button>
        <button
          onClick={handleInsertMath}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-amber-400 transition-colors"
          title="Insert LaTeX Math Formula ($$...$$)"
        >
          <Sigma className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1" />

        <button
          onClick={() => insertSnippet('- [ ] ', '', 'Task item')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-sky-400 transition-colors"
          title="Checklist Item (- [ ])"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('- ', '', 'Bullet item')}
          className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
          title="Bullet List (-)"
        >
          <List className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Textarea */}
      <div className="flex-1 relative overflow-hidden flex">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or paste markdown content here..."
          spellCheck={false}
          style={{
            fontSize: `${fontSize}px`,
          }}
          className="w-full h-full p-6 bg-slate-950 font-mono text-slate-200 leading-relaxed resize-none focus:outline-none selection:bg-indigo-500/30 selection:text-indigo-200 overflow-y-auto"
        />
      </div>
    </div>
  );
};
