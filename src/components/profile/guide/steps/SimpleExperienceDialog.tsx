import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { YearRangeInput } from "@/components/profile/shared/YearRangeInput";
import type { ExperienceItem } from "@/hooks/profile/profileTypes";

interface SimpleExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (experience: ExperienceItem) => Promise<void>;
}

export function SimpleExperienceDialog({ open, onOpenChange, onSave }: SimpleExperienceDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startYear, setStartYear] = useState<number | undefined>();
  const [endYear, setEndYear] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) return;
    
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        startYear,
        endYear
      });
      
      // Reset form
      setTitle("");
      setDescription("");
      setStartYear(undefined);
      setEndYear(null);
      
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save experience:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setDescription("");
    setStartYear(undefined);
    setEndYear(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Position Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Marketing Intern, Software Developer"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your responsibilities, achievements, and skills used..."
              className="min-h-[100px]"
            />
          </div>
          
          <YearRangeInput
            startYear={startYear}
            endYear={endYear}
            onStartYearChange={setStartYear}
            onEndYearChange={setEndYear}
          />
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim() || saving}>
              {saving ? "Saving..." : "Save Experience"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}