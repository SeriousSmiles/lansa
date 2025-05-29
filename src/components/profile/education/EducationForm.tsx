
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { YearRangeInput } from "@/components/profile/shared/YearRangeInput";
import { getContrastTextColor } from "@/utils/colorUtils";

interface EducationFormProps {
  title: string;
  description: string;
  startYear?: number;
  endYear?: number | null;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onStartYearChange: (year: number | undefined) => void;
  onEndYearChange: (year: number | null) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  isNew?: boolean;
  highlightColor?: string;
}

export function EducationForm({ 
  title, 
  description,
  startYear,
  endYear,
  onTitleChange, 
  onDescriptionChange,
  onStartYearChange,
  onEndYearChange,
  onSave, 
  onCancel, 
  isNew = false,
  highlightColor = "#FF6B4A"
}: EducationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      setError("Please provide a title for the education.");
      return;
    }

    setIsSaving(true);
    setError(null);
    
    try {
      await onSave();
    } catch (error) {
      console.error("Error saving education:", error);
      setError("There was an error saving your education. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold" style={{ color: highlightColor }}>
        {isNew ? "Add Education" : "Edit Education"}
      </h3>
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Name of Institution / Qualification</label>
        <Input 
          value={title} 
          onChange={(e) => onTitleChange(e.target.value)} 
          placeholder="e.g. University of Technology, Master's Degree"
        />
      </div>

      <YearRangeInput
        startYear={startYear}
        endYear={endYear}
        onStartYearChange={onStartYearChange}
        onEndYearChange={onEndYearChange}
        highlightColor={highlightColor}
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => onDescriptionChange(e.target.value)} 
          placeholder="Describe your education, major, achievements, etc."
          className="min-h-[100px]"
        />
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={handleSave}
          disabled={!title.trim() || isSaving}
          style={{ 
            backgroundColor: highlightColor,
            color: getContrastTextColor(highlightColor)
          }}
        >
          {isSaving ? "Saving..." : "Save Education"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
