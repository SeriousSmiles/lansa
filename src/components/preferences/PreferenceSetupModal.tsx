import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface PreferenceSetupModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

const CATEGORIES = [
  "Technology",
  "Marketing",
  "Hospitality",
  "Finance",
  "Healthcare",
  "Education",
  "Sales",
  "Creative",
  "Operations",
  "Customer Service"
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Freelance"
];

export function PreferenceSetupModal({ open, onClose, userId }: PreferenceSetupModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [isRemotePreferred, setIsRemotePreferred] = useState(false);
  const [filteringMode, setFilteringMode] = useState<'strict' | 'lite'>('lite');

  const handleCategoryToggle = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleJobTypeToggle = (jobType: string) => {
    setJobTypes(prev =>
      prev.includes(jobType)
        ? prev.filter(j => j !== jobType)
        : [...prev, jobType]
    );
  };

  const handleSave = async () => {
    if (categories.length === 0 || jobTypes.length === 0) {
      toast({
        title: "Missing preferences",
        description: "Please select at least one category and one job type.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_job_preferences')
        .upsert({
          user_id: userId,
          categories,
          job_types: jobTypes,
          is_remote_preferred: isRemotePreferred,
          filtering_mode: filteringMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Preferences saved!",
        description: "Your job preferences have been set successfully."
      });
      onClose();
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Your Job Preferences</DialogTitle>
          <DialogDescription>
            Congratulations on your certification! Now let's personalize your job feed to match your interests.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Categories of Interest</Label>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map(category => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={categories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <label
                    htmlFor={`category-${category}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Job Types */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Job Types</Label>
            <div className="grid grid-cols-2 gap-3">
              {JOB_TYPES.map(jobType => (
                <div key={jobType} className="flex items-center space-x-2">
                  <Checkbox
                    id={`jobtype-${jobType}`}
                    checked={jobTypes.includes(jobType)}
                    onCheckedChange={() => handleJobTypeToggle(jobType)}
                  />
                  <label
                    htmlFor={`jobtype-${jobType}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {jobType}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Remote Preference */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remote-pref"
              checked={isRemotePreferred}
              onCheckedChange={(checked) => setIsRemotePreferred(checked as boolean)}
            />
            <label
              htmlFor="remote-pref"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              I prefer remote opportunities
            </label>
          </div>

          {/* Filtering Mode */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Filtering Mode</Label>
            <RadioGroup value={filteringMode} onValueChange={(value) => setFilteringMode(value as 'strict' | 'lite')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lite" id="lite" />
                <label htmlFor="lite" className="text-sm cursor-pointer">
                  <span className="font-medium">Lite Mode</span> - Show me opportunities outside my preferences too
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="strict" id="strict" />
                <label htmlFor="strict" className="text-sm cursor-pointer">
                  <span className="font-medium">Strict Mode</span> - Only show opportunities matching my exact preferences
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Skip for now
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
