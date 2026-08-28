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
      className="flex flex-col h-full border-r overflow-hidden transition-colors duration-150"
      style={{
        backgroundColor: theme.codeBg,
        borderColor: theme.surfaceBorder,
      }}
    >
      {/* Formatting Toolbar */}
      <div
        className="flex items-center gap-1 p-2 border-b flex-wrap select-none transition-colors duration-150"
        style={{
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
          color: theme.text,
        }}
      >
        <button
          onClick={() => insertSnippet('**', '**', 'bold text')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Bold (**text**)"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('*', '*', 'italic text')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Italic (*text*)"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('~~', '~~', 'strikethrough text')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Strikethrough (~~text~~)"
        >
          <Strikethrough className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] mx-1" style={{ backgroundColor: theme.surfaceBorder }} />

        <button
          onClick={() => insertSnippet('# ', '', 'Heading 1')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Heading 1 (#)"
        >
          <Heading1 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('## ', '', 'Heading 2')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Heading 2 (##)"
        >
          <Heading2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('> ', '', 'Quote text')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Blockquote (>)"
        >
          <Quote className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] mx-1" style={{ backgroundColor: theme.surfaceBorder }} />

        <button
          onClick={() => insertSnippet('`', '`', 'code')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Inline Code (`code`)"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('\n```typescript\n', '\n```\n', '// code here')}
          className="p-1.5 rounded hover:opacity-80 transition-colors font-mono text-[10px]"
          style={{ color: theme.text }}
          title="Code Block (```)"
        >
          ```
        </button>
        <button
          onClick={() => insertSnippet('[', '](https://suhail.top)', 'link title')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Hyperlink [title](url)"
        >
          <LinkIcon className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] mx-1" style={{ backgroundColor: theme.surfaceBorder }} />

        <button
          onClick={handleInsertTable}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.accent }}
          title="Insert Markdown Table"
        >
          <TableIcon className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleInsertMermaidFlowchart}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors"
          style={{
            backgroundColor: `${theme.accent}18`,
            color: theme.accent,
          }}
          title="Insert Mermaid Flowchart"
        >
          <Workflow className="w-3 h-3" />
          <span>Flowchart</span>
        </button>
        <button
          onClick={handleInsertMermaidSequence}
          className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-colors"
          style={{
            backgroundColor: `${theme.accent}18`,
            color: theme.accent,
          }}
          title="Insert Mermaid Sequence"
        >
          <Workflow className="w-3 h-3" />
          <span>Sequence</span>
        </button>
        <button
          onClick={handleInsertMath}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.accent }}
          title="Insert LaTeX Math Formula ($$...$$)"
        >
          <Sigma className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] mx-1" style={{ backgroundColor: theme.surfaceBorder }} />

        <button
          onClick={() => insertSnippet('- [ ] ', '', 'Task item')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
          title="Checklist Item (- [ ])"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('- ', '', 'Bullet item')}
          className="p-1.5 rounded hover:opacity-80 transition-colors"
          style={{ color: theme.text }}
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
            backgroundColor: theme.codeBg,
            color: theme.codeText || theme.text,
          }}
          className="w-full h-full p-6 font-mono leading-relaxed resize-none focus:outline-none overflow-y-auto"
        />
      </div>
    </div>
  );
};
