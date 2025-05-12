import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getContrastTextColor } from "@/utils/colorUtils";

interface ExperienceFormProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
  highlightColor?: string; // Added highlightColor property
}

export function ExperienceForm({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange, 
  onSave, 
  onCancel, 
  isNew = false,
  highlightColor = "#FF6B4A" // Default to original orange
}: ExperienceFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the experience.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave();
      toast({
        title: isNew ? "Experience added" : "Experience updated",
        description: isNew 
          ? "Your new experience has been added to your profile." 
          : "Your experience has been updated."
      });
    } catch (error) {
      console.error("Error saving experience:", error);
      toast({
        title: "Error saving experience",
        description: "There was an error saving your experience. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>
        {isNew ? "Add New Experience" : "Edit Experience"}
      </h3>
      
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
