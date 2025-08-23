import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, CheckCircle, Loader2, Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";
import { StepContainer } from "./StepContainer";

interface SkillsStepProps {
  profile: ProfileDataReturn;
  userId: string;
  onNext: () => void;
  onPrevious: () => void;
  isFirst: boolean;
  isLast: boolean;
}

interface SkillRecommendations {
  technical: string[];
  soft: string[];
  industry: string[];
  reasoning: string;
}

export function SkillsStep({ profile, userId, onNext, onPrevious, isFirst, isLast }: SkillsStepProps) {
  const { toast } = useToast();
  const [newSkill, setNewSkill] = useState("");
  const [recommendations, setRecommendations] = useState<SkillRecommendations | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasSkills = !!(profile.userSkills && profile.userSkills.length >= 3);
  const currentSkills = profile.userSkills || [];

  const generateRecommendations = async () => {
    if (!userId) return;
    
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-skills-recommendations', {
        body: { userId }
      });

      if (error) throw error;
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
      toast({
        title: "Failed to generate recommendations",
        description: "Please try again or add skills manually",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addSkill = async (skill: string) => {
    if (!skill.trim() || !profile.addSkill || currentSkills.includes(skill)) return;
    
    setSaving(true);
    try {
      await profile.addSkill(skill.trim());
      toast({ title: `Added "${skill}" to your skills!` });
      setNewSkill("");
    } catch (error) {
      console.error('Failed to add skill:', error);
      toast({
        title: "Failed to add skill",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = async (skill: string) => {
    if (!profile.removeSkill) return;
    
    try {
      await profile.removeSkill(skill);
      toast({ title: `Removed "${skill}" from your skills` });
    } catch (error) {
      console.error('Failed to remove skill:', error);
      toast({
        title: "Failed to remove skill",
        variant: "destructive"
      });
    }
  };

  const addRecommendedSkills = async (skills: string[], category: string) => {
    const newSkills = skills.filter(skill => !currentSkills.includes(skill));
    if (newSkills.length === 0) return;

    setSaving(true);
    try {
      for (const skill of newSkills) {
        await profile.addSkill(skill);
      }
      toast({ title: `Added ${newSkills.length} ${category} skills!` });
    } catch (error) {
      console.error('Failed to add skills:', error);
      toast({
        title: "Failed to add skills",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      addSkill(newSkill);
    }
  };

  return (
    <StepContainer
      title="Add Your Skills"
      description="Showcase your technical and soft skills to attract the right opportunities"
      onNext={onNext}
      onPrevious={onPrevious}
      isFirst={isFirst}
      isLast={isLast}
      isCompleted={hasSkills}
    >
      <div className="space-y-6">
        {/* Current Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Your Skills
              {hasSkills && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {currentSkills.length} skills
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add New Skill */}
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a skill and press Enter"
                  className="flex-1"
                />
                <Button 
                  onClick={() => addSkill(newSkill)}
                  disabled={!newSkill.trim() || saving}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add
                </Button>
              </div>

              {/* Skills List */}
              {currentSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentSkills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="flex items-center gap-1 px-3 py-1"
                    >
                      {skill}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No skills added yet</p>
                  <p className="text-sm">Add at least 3 skills to complete this section</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Skill Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!recommendations ? (
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Get personalized skill recommendations based on your background and goals
                </p>
                <Button 
                  onClick={generateRecommendations}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4" />
                  )}
                  {isGenerating ? "Generating..." : "Get Recommendations"}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Technical Skills */}
                {recommendations.technical && recommendations.technical.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Technical Skills</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addRecommendedSkills(recommendations.technical, "technical")}
                        disabled={saving}
                      >
                        Add All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.technical.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className={`cursor-pointer hover:bg-primary hover:text-primary-foreground ${
                            currentSkills.includes(skill) ? 'bg-green-100 text-green-700' : ''
                          }`}
                          onClick={() => !currentSkills.includes(skill) && addSkill(skill)}
                        >
                          {skill}
                          {currentSkills.includes(skill) && <CheckCircle className="h-3 w-3 ml-1" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Soft Skills */}
                {recommendations.soft && recommendations.soft.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Soft Skills</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addRecommendedSkills(recommendations.soft, "soft")}
                        disabled={saving}
                      >
                        Add All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.soft.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className={`cursor-pointer hover:bg-primary hover:text-primary-foreground ${
                            currentSkills.includes(skill) ? 'bg-green-100 text-green-700' : ''
                          }`}
                          onClick={() => !currentSkills.includes(skill) && addSkill(skill)}
                        >
                          {skill}
                          {currentSkills.includes(skill) && <CheckCircle className="h-3 w-3 ml-1" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Industry Skills */}
                {recommendations.industry && recommendations.industry.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Industry Skills</h4>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addRecommendedSkills(recommendations.industry, "industry")}
                        disabled={saving}
                      >
                        Add All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recommendations.industry.map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="outline"
                          className={`cursor-pointer hover:bg-primary hover:text-primary-foreground ${
                            currentSkills.includes(skill) ? 'bg-green-100 text-green-700' : ''
                          }`}
                          onClick={() => !currentSkills.includes(skill) && addSkill(skill)}
                        >
                          {skill}
                          {currentSkills.includes(skill) && <CheckCircle className="h-3 w-3 ml-1" />}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {recommendations.reasoning && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{recommendations.reasoning}</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  onClick={generateRecommendations}
                  disabled={isGenerating}
                  className="w-full"
                >
                  Generate New Recommendations
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Best Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Include both technical and soft skills</li>
              <li>• Focus on skills relevant to your target roles</li>
              <li>• Add skills you can confidently demonstrate</li>
              <li>• Include industry-specific tools and technologies</li>
              <li>• Aim for 8-12 skills for optimal visibility</li>
              <li>• Keep skills current and relevant</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}