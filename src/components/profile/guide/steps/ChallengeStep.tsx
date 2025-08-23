import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { StepContainer } from "./StepContainer";

interface ChallengeStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface ChallengeTemplate {
  template: string;
  guidance: string;
  examples: string[];
}

export function ChallengeStep({ profile, userId, onNext, onPrevious, isFirst, isLast }: ChallengeStepProps) {
  const { toast } = useToast();
  const [challengeText, setChallengeText] = useState(profile.biggestChallenge || "");
  const [template, setTemplate] = useState<ChallengeTemplate | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasChallenge = !!profile.biggestChallenge && profile.biggestChallenge.trim().length > 10;

  useEffect(() => {
    setChallengeText(profile.biggestChallenge || "");
  }, [profile.biggestChallenge]);

  const generateTemplate = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-challenge-template', {
        body: { userId }
      });

      if (error) throw error;
      setTemplate(data.template);
    } catch (error) {
      console.error('Failed to generate template:', error);
      toast({
        title: "Failed to generate template",
        description: "Please try again or write your own challenge",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useTemplate = () => {
    if (template?.template) {
      setChallengeText(template.template);
    }
  };

  const saveChallenge = async () => {
    if (!challengeText.trim() || !profile.updateBiggestChallenge) return;
    
    setSaving(true);
    try {
      await profile.updateBiggestChallenge(challengeText.trim());
      toast({ title: "Biggest challenge updated successfully!" });
    } catch (error) {
      console.error('Failed to update challenge:', error);
      toast({
        title: "Failed to update challenge",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepContainer
      title="Share Your Biggest Challenge"
      description="Describe what you're working to overcome or improve in your career"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasChallenge}
    >
      <div className="space-y-6">
        {/* Challenge Text Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Your Biggest Challenge
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                value={challengeText}
                onChange={(e) => setChallengeText(e.target.value)}
                placeholder="Describe a professional challenge you're currently facing or working to overcome..."
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {challengeText.length}/500 characters
                </span>
                <div className="flex gap-2">
                  <Button 
                    onClick={saveChallenge}
                    disabled={!challengeText.trim() || saving}
                    size="sm"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Challenge
                  </Button>
                  {hasChallenge && (
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
                  Get a personalized template to articulate your professional challenges
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
                    <h4 className="font-medium">Example Challenges:</h4>
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

        {/* Challenge Writing Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Challenge Writing Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium mb-2 text-green-700">Do:</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Be honest and authentic</li>
                  <li>• Show how you're addressing the challenge</li>
                  <li>• Frame it as a growth opportunity</li>
                  <li>• Connect it to your professional development</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2 text-red-700">Avoid:</h5>
                <ul className="text-muted-foreground space-y-1">
                  <li>• Being overly negative or critical</li>
                  <li>• Sharing very personal issues</li>
                  <li>• Blaming others or circumstances</li>
                  <li>• Making it sound insurmountable</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Remember:</strong> This section shows your self-awareness and commitment to growth. 
                Focus on challenges that demonstrate your dedication to improvement and learning.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}