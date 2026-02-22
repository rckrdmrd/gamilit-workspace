import { useRef, type ReactNode } from 'react';
import { cn } from '@shared/utils/cn';
import { Bold, Italic, List, ImageIcon } from 'lucide-react';

export interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function ContentEditor({
  value,
  onChange,
  placeholder = 'Escribe el contenido aqui...',
  label,
}: ContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const before = value.substring(0, start);
    const after = value.substring(end);

    const newText = `${before}${prefix}${selected}${suffix}${after}`;
    onChange(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selected.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const handleInsertBold = () => insertMarkdown('**', '**');
  const handleInsertItalic = () => insertMarkdown('*', '*');
  const handleInsertList = () => insertMarkdown('\n- ', '');

  const handleInsertImage = () => {
    const url = window.prompt('URL de la imagen:');
    if (url) {
      insertMarkdown(`\n![imagen](${url})\n`, '');
    }
  };

  const charCount = value.length;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-400">{label}</label>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-1 rounded-t-lg border border-b-0 border-gray-700 bg-gray-800/50 px-2 py-1">
        <ToolbarButton onClick={handleInsertBold} title="Negrita">
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleInsertItalic} title="Cursiva">
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={handleInsertList} title="Lista">
          <List className="h-4 w-4" />
        </ToolbarButton>
        <div className="mx-1 h-5 w-px bg-gray-600" />
        <ToolbarButton onClick={handleInsertImage} title="Insertar imagen (URL)">
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
        <div className="ml-auto text-xs text-gray-500">{charCount} caracteres</div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        className={cn(
          'input-detective w-full rounded-t-none border-t-0 font-mono text-sm',
          'min-h-[160px] resize-y'
        )}
        rows={8}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      <p className="text-xs text-gray-500">
        Soporta formato Markdown: **negrita**, *cursiva*, - listas, ![alt](url)
      </p>
    </div>
  );
}

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="rounded p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-detective-orange"
    >
      {children}
    </button>
  );
}

export default ContentEditor;
