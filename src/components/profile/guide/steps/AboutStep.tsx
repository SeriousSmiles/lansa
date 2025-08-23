import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { StepContainer } from "./StepContainer";

interface AboutStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface AboutTemplate {
  template: string;
  guidance: string;
  personalizeSteps: string[];
}

export function AboutStep({ profile, userId, onNext, onPrevious, isFirst, isLast }: AboutStepProps) {
  const { toast } = useToast();
  const [aboutText, setAboutText] = useState(profile.aboutText || "");
  const [template, setTemplate] = useState<AboutTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasAbout = !!profile.aboutText && profile.aboutText.trim().length > 20;

  useEffect(() => {
    setAboutText(profile.aboutText || "");
  }, [profile.aboutText]);

  const generateTemplate = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-about-template', {
        body: { userId }
      });

      if (error) throw error;
      setTemplate(data.template);
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast({
        title: "Failed to generate template",
        description: "Please try again or write your own about section",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useTemplate = () => {
    if (template?.template) {
      setAboutText(template.template);
    }
  };

  const saveAbout = async () => {
    if (!aboutText.trim() || !profile.updateAboutText) return;
    
    setSaving(true);
    try {
      await profile.updateAboutText(aboutText.trim());
      toast({ title: "About section updated successfully!" });
    } catch (error) {
      console.error('Failed to update about section:', error);
      toast({
        title: "Failed to update about section",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepContainer
      title="Write Your About Section"
      description="Tell your professional story in a compelling and authentic way"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasAbout}
    >
      <div className="space-y-6">
        {/* About Text Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Your About Section</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                placeholder="Write a compelling summary of your professional background, key strengths, and career aspirations..."
                className="min-h-[120px] resize-none"
                maxLength={2000}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {aboutText.length}/2000 characters
                </span>
                <div className="flex gap-2">
                  <Button 
                    onClick={saveAbout}
                    disabled={!aboutText.trim() || saving}
                    size="sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save About
                  </Button>
                  {hasAbout && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Saved
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Template Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Template Generator
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!template ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Get a personalized template based on your background and career goals
                </p>
                <Button 
                  onClick={generateTemplate}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Generate Template"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Personalized Template</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={useTemplate}
                    >
                      Use Template
                    </Button>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-line">{template.template}</p>
                  </div>
                </div>

                {/* Guidance */}
                {template.guidance && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Writing Guidance:</h4>
                    <p className="text-sm text-blue-800">{template.guidance}</p>
                  </div>
                )}

                {/* Personalization Steps */}
                {template.personalizeSteps && template.personalizeSteps.length > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-2">Personalization Steps:</h4>
                    <ul className="text-sm text-amber-800 space-y-1">
                      {template.personalizeSteps.map((step, index) => (
                        <li key={index}>• {step}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={generateTemplate}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Generate New Template
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Writing Tips */}
        <Card>
          <CardHeader>
            <CardTitle>About Section Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Start with your current role or professional focus</li>
              <li>• Highlight 2-3 key achievements or skills</li>
              <li>• Mention your career goals or what you're passionate about</li>
              <li>• Use first person and write in a conversational tone</li>
              <li>• Keep it concise but comprehensive (150-300 words)</li>
              <li>• Include keywords relevant to your industry</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}