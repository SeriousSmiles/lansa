
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getContrastTextColor } from "@/utils/colorUtils";

interface ExperienceFormProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
  highlightColor?: string;
}

export function ExperienceForm({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange, 
  onSave, 
  onCancel, 
  isNew = false,
  highlightColor = "#FF6B4A"
}: ExperienceFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please provide a title for the experience.");
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      await onSave();
    } catch (error) {
      console.error("Error saving experience:", error);
      setError("There was an error saving your experience. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>
        {isNew ? "Add New Experience" : "Edit Experience"}
      </h3>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Title</label>
        <Input 
          value={title} 
          onChange={(e) => onTitleChange(e.target.value)} 
          placeholder="e.g. Product Manager at Tech Company"
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => onDescriptionChange(e.target.value)} 
          placeholder="Describe your role, responsibilities and achievements..."
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex space-x-2">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          style={{ 
            backgroundColor: highlightColor,
            color: getContrastTextColor(highlightColor) 
          }}
        >
          {isSaving ? "Saving..." : "Save Experience"}
        </Button>
        
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
