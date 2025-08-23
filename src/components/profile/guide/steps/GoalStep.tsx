import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, CheckCircle, Loader2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { StepContainer } from "./StepContainer";

interface GoalStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface GoalTemplate {
  template: string;
  guidance: string;
  examples: string[];
}

export function GoalStep({ profile, userId, onNext, onPrevious, isFirst, isLast }: GoalStepProps) {
  const { toast } = useToast();
  const [goalText, setGoalText] = useState(profile.professionalGoal || "");
  const [template, setTemplate] = useState<GoalTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasGoal = !!profile.professionalGoal && profile.professionalGoal.trim().length > 10;

  useEffect(() => {
    setGoalText(profile.professionalGoal || "");
  }, [profile.professionalGoal]);

  const generateTemplate = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-goal-template', {
        body: { userId }
      });

      if (error) throw error;
      setTemplate(data.template);
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast({
        title: "Failed to generate template",
        description: "Please try again or write your own goal",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useTemplate = () => {
    if (template?.template) {
      setGoalText(template.template);
    }
  };

  const saveGoal = async () => {
    if (!goalText.trim() || !profile.updateProfessionalGoal) return;
    
    setSaving(true);
    try {
      await profile.updateProfessionalGoal(goalText.trim());
      toast({ title: "Professional goal updated successfully!" });
    } catch (error) {
      console.error('Failed to update goal:', error);
      toast({
        title: "Failed to update goal",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepContainer
      title="Define Your Professional Goal"
      description="Share your career aspirations and what you're working toward"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasGoal}
    >
      <div className="space-y-6">
        {/* Goal Text Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Professional Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="Describe your career aspirations, what you're working toward, or what type of opportunities you're seeking..."
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {goalText.length}/500 characters
                </span>
                <div className="flex gap-2">
                  <Button 
                    onClick={saveGoal}
                    disabled={!goalText.trim() || saving}
                    size="sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Goal
                  </Button>
                  {hasGoal && (
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
                  Get a personalized goal template based on your background and aspirations
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
                    <p className="text-sm">{template.template}</p>
                  </div>
                </div>

                {/* Guidance */}
                {template.guidance && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Writing Guidance:</h4>
                    <p className="text-sm text-blue-800">{template.guidance}</p>
                  </div>
                )}

                {/* Examples */}
                {template.examples && template.examples.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Example Goals:</h4>
                    {template.examples.map((example, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-sm italic">
                        "{example}"
                      </div>
                    ))}
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

        {/* Goal Writing Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Writing Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2 text-green-700">Do:</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Be specific about your target role or industry</li>
                  <li>• Mention what you hope to achieve or contribute</li>
                  <li>• Show enthusiasm and motivation</li>
                  <li>• Connect to your skills and experience</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2 text-red-700">Avoid:</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Being too vague or generic</li>
                  <li>• Focusing only on what you want to gain</li>
                  <li>• Using overly complex language</li>
                  <li>• Making unrealistic claims</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}