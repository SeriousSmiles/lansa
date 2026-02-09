import { useRef, useCallback } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  minHeight = "120px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    // After command, update parent state
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  }, []);

  const isEmpty = !value || value === "<br>" || value === "<div><br></div>";

  return (
    <div className={cn("rounded-md border border-input bg-background", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-input px-2 py-1">
        <Toggle
          size="sm"
          aria-label="Bold"
          onPressedChange={() => execCommand("bold")}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Italic"
          onPressedChange={() => execCommand("italic")}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <div className="w-px h-5 bg-border mx-1" />
        <Toggle
          size="sm"
          aria-label="Bullet list"
          onPressedChange={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          aria-label="Numbered list"
          onPressedChange={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      </div>

      {/* Editable area */}
      <div className="relative">
        {isEmpty && (
          <div className="absolute inset-0 px-3 py-2 text-muted-foreground pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onPaste={handlePaste}
          dangerouslySetInnerHTML={{ __html: value }}
          className={cn(
            "px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-b-md",
            "prose prose-sm max-w-none dark:prose-invert",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_li]:my-0.5"
          )}
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
