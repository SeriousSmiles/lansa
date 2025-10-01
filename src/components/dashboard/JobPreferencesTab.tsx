import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

export function JobPreferencesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [isRemotePreferred, setIsRemotePreferred] = useState(false);
  const [filteringMode, setFilteringMode] = useState<'strict' | 'lite'>('lite');
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_job_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCategories(data.categories || []);
        setJobTypes(data.job_types || []);
        setIsRemotePreferred(data.is_remote_preferred || false);
        setFilteringMode((data.filtering_mode as 'strict' | 'lite') || 'lite');
        setHasPreferences(true);
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

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
    if (!user?.id) return;

    if (categories.length === 0 || jobTypes.length === 0) {
      toast({
        title: "Missing preferences",
        description: "Please select at least one category and one job type.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_job_preferences')
        .upsert({
          user_id: user.id,
          categories,
          job_types: jobTypes,
          is_remote_preferred: isRemotePreferred,
          filtering_mode: filteringMode,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Preferences saved!",
        description: "Your job feed will now be personalized based on your preferences."
      });
      setHasPreferences(true);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Feed Preferences</CardTitle>
          <CardDescription>
            Customize what types of opportunities you want to see in your job feed.
            {!hasPreferences && " Set your preferences to get started!"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasPreferences && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You haven't set your job preferences yet. Complete this form to personalize your job feed.
              </AlertDescription>
            </Alert>
          )}

          {/* Categories */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Categories of Interest</Label>
            <p className="text-sm text-muted-foreground">Select the industries and fields you're interested in</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
            <p className="text-sm text-muted-foreground">What type of work arrangement are you looking for?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
          <div className="space-y-3">
            <Label className="text-base font-semibold">Work Location</Label>
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
          </div>

          {/* Filtering Mode */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Filtering Mode</Label>
            <p className="text-sm text-muted-foreground">
              Choose how strictly you want to filter job opportunities
            </p>
            <RadioGroup 
              value={filteringMode} 
              onValueChange={(value: string) => setFilteringMode(value as 'strict' | 'lite')}
            >
              <div className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="lite" id="lite" className="mt-1" />
                <label htmlFor="lite" className="text-sm cursor-pointer flex-1">
                  <span className="font-medium block mb-1">Lite Mode (Recommended)</span>
                  <span className="text-muted-foreground">
                    Show me opportunities outside my preferences too. Great for discovering new possibilities!
                  </span>
                </label>
              </div>
              <div className="flex items-start space-x-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="strict" id="strict" className="mt-1" />
                <label htmlFor="strict" className="text-sm cursor-pointer flex-1">
                  <span className="font-medium block mb-1">Strict Mode</span>
                  <span className="text-muted-foreground">
                    Only show opportunities matching my exact preferences. Focused results only.
                  </span>
                </label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
