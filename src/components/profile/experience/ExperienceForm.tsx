
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ExperienceFormProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

export function ExperienceForm({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onSave,
  onCancel,
  isNew = false
}: ExperienceFormProps) {
  const { toast } = useToast();

  const handleSave = () => {
    if (!title || !description) {
      toast({
        title: "Validation error",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
      return;
    }
    
    onSave();
  };

  return (
    <div className="border p-4 rounded-md bg-gray-50">
      <h3 className="font-medium mb-2">{isNew ? "Add New Experience" : "Edit Experience"}</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <Input 
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Experience title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea 
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Describe your experience"
          />
        </div>
        <div className="flex space-x-2 pt-2">
          <Button onClick={handleSave} size="sm">{isNew ? "Save" : "Update"}</Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
