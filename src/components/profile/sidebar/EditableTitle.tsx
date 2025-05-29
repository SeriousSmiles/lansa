
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Check, X } from "lucide-react";

interface EditableTitleProps {
  title: string;
  onUpdateTitle?: (title: string) => Promise<void>;
  highlightColor?: string;
}

export function EditableTitle({ title, onUpdateTitle, highlightColor = "#FF6B4A" }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(title);

  const handleSave = async () => {
    if (onUpdateTitle && editingTitle.trim() !== title) {
      try {
        await onUpdateTitle(editingTitle.trim());
      } catch (error) {
        console.error("Error updating title:", error);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditingTitle(title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 mt-1">
        <Input
          value={editingTitle}
          onChange={(e) => setEditingTitle(e.target.value)}
          className="text-sm"
          placeholder="Enter your title"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          autoFocus
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6"
          onClick={handleSave}
          style={{ color: highlightColor }}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <p className="text-sm text-gray-600 flex-1">
        {title || "No title set"}
      </p>
      {onUpdateTitle && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-6 w-6"
          onClick={() => setIsEditing(true)}
          style={{ color: highlightColor }}
        >
          <Pencil className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
