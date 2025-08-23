import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { StepContainer } from "./StepContainer";

interface TitleStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface TitleSuggestions {
  conservative: string;
  balanced: string;
  bold: string;
  reasoning: string;
}

export function TitleStep({ profile, userId, onNext, onPrevious, isFirst, isLast }: TitleStepProps) {
  const { toast } = useToast();
  const [customTitle, setCustomTitle] = useState(profile.userTitle || "");
  const [suggestions, setSuggestions] = useState<TitleSuggestions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasTitle = !!profile.userTitle && profile.userTitle.trim().length > 0;

  useEffect(() => {
    setCustomTitle(profile.userTitle || "");
  }, [profile.userTitle]);

  const generateSuggestions = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-title-suggestions', {
        body: { userId }
      });

      if (error) throw error;
      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      toast({
        title: "Failed to generate suggestions",
        description: "Please try again or write your own title",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTitle = async (title: string) => {
    if (!profile.updateUserTitle) return;
    
    setSaving(true);
    try {
      await profile.updateUserTitle(title);
      setCustomTitle(title);
      toast({ title: "Title updated successfully!" });
    } catch (error) {
      console.error('Failed to update title:', error);
      toast({
        title: "Failed to update title",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveCustomTitle = async () => {
    if (!customTitle.trim()) return;
    await applyTitle(customTitle.trim());
  };

  return (
    <StepContainer
      title="Create Your Professional Title"
      description="Your title is the first thing people see - make it compelling and searchable"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasTitle}
    >
      <div className="space-y-6">
        {/* Current Title */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Title</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Input
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g., Marketing Specialist | Content Creator | Digital Strategy"
                className="text-lg"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={saveCustomTitle}
                  disabled={!customTitle.trim() || saving}
                  size="sm"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Title
                </Button>
                {hasTitle && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI-Generated Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!suggestions ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Get personalized title suggestions based on your profile and career goals
                </p>
                <Button 
                  onClick={generateSuggestions}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate Suggestions"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Conservative Option */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Conservative</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyTitle(suggestions.conservative)}
                      disabled={saving}
                    >
                      Use This
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{suggestions.conservative}</p>
                  </div>
                </div>

                {/* Balanced Option */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Balanced</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyTitle(suggestions.balanced)}
                      disabled={saving}
                    >
                      Use This
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{suggestions.balanced}</p>
                  </div>
                </div>

                {/* Bold Option */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge>Bold</Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => applyTitle(suggestions.bold)}
                      disabled={saving}
                    >
                      Use This
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="font-medium">{suggestions.bold}</p>
                  </div>
                </div>

                {/* Reasoning */}
                {suggestions.reasoning && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{suggestions.reasoning}</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={generateSuggestions}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Generate New Options
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Title Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Title Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Include your primary role or skill set</li>
              <li>• Add relevant keywords for your industry</li>
              <li>• Mention key strengths or specializations</li>
              <li>• Keep it under 120 characters for best display</li>
              <li>• Consider what recruiters might search for</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}