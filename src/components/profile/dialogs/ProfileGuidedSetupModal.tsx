import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { generateProfileSuggestions, ProfileSuggestions } from "@/services/profileSuggestions";
import type { ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";

interface ProfileGuidedSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userAnswers?: Record<string, any> | null;
  existingSkills: string[];
  initialTitle?: string;
  initialAbout?: string;
  // Apply handlers
  updateUserTitle: (title: string) => Promise<void>;
  updateAboutText: (text: string) => Promise<void>;
  addSkill: (skill: string) => Promise<void>;
  addExperience: (exp: ExperienceItem) => Promise<void>;
  addEducation: (edu: EducationItem) => Promise<void>;
}

export function ProfileGuidedSetupModal({
  open,
  onOpenChange,
  userAnswers,
  existingSkills,
  initialTitle,
  initialAbout,
  updateUserTitle,
  updateAboutText,
  addSkill,
  addExperience,
  addEducation,
}: ProfileGuidedSetupModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProfileSuggestions | null>(null);
  const [step, setStep] = useState(0);

  const steps = useMemo(() => ["Headline", "About", "Skills", "Experience", "Education"], []);

  useEffect(() => {
    const fetch = async () => {
      if (!open) return;
      setLoading(true);
      
      // Gather comprehensive user onboarding data
      const inputs = {
        // Basic user data
        ...(userAnswers || {}),
        identity: userAnswers?.identity,
        desired_outcome: userAnswers?.desired_outcome,
        user_type: userAnswers?.user_type,
        career_path: userAnswers?.career_path,
        
        // Student onboarding data
        academic_status: userAnswers?.academic_status,
        field_of_study: userAnswers?.field_of_study,
        career_goal_type: userAnswers?.career_goal_type,
        
        // Additional onboarding inputs
        aspiration_text: (userAnswers as any)?.onboarding_inputs?.aspiration_text,
        challenges_text: (userAnswers as any)?.onboarding_inputs?.challenges_text,
        expectations_text: (userAnswers as any)?.onboarding_inputs?.expectations_text,
      };
      
      const resp = await generateProfileSuggestions(inputs);
      setSuggestions(resp);
      setLoading(false);
    };
    fetch();
  }, [open, userAnswers]);

  const applyTitle = async () => {
    if (!suggestions?.title) return;
    await updateUserTitle(suggestions.title);
    toast({ title: "Headline applied" });
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const applyAbout = async () => {
    if (!suggestions?.about) return;
    await updateAboutText(suggestions.about);
    toast({ title: "About section applied" });
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const applySkills = async () => {
    if (!suggestions?.skills?.length) return;
    const toAdd = suggestions.skills.filter((s) => !existingSkills.includes(s));
    for (const skill of toAdd) {
      await addSkill(skill);
    }
    toast({ title: "Skills added" });
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const applyExperience = async () => {
    if (!suggestions?.experiences?.length) return;
    for (const exp of suggestions.experiences) {
      const payload: ExperienceItem = {
        title: exp.title,
        description: exp.description,
        startYear: exp.startYear,
        endYear: exp.endYear ?? null,
      };
      await addExperience(payload);
    }
    toast({ title: "Experience added" });
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const applyEducation = async () => {
    if (!suggestions?.education?.length) return;
    for (const ed of suggestions.education) {
      const payload: EducationItem = {
        title: ed.title,
        description: ed.description,
        startYear: ed.startYear,
        endYear: ed.endYear ?? null,
      };
      await addEducation(payload);
    }
    toast({ title: "Education added" });
    onOpenChange(false);
  };

  const skipForNow = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="text-center mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/41285a6d1f6906d8349429ceb652f953bf730d06?placeholderIfAbsent=true"
              alt="Lansa Logo"
              className="aspect-[2.7] object-contain w-[92px] mx-auto mb-4"
            />
            <DialogTitle className="text-2xl font-bold text-foreground">
              Complete Your Profile with AI Guidance
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-2">
              We'll help you create a compelling profile using AI-generated suggestions based on your onboarding responses.
            </DialogDescription>
            <div className="text-sm text-primary font-medium mt-2">
              Step {step + 1} of {steps.length} • {steps[step]}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                Generating personalized suggestions based on your onboarding…
              </div>
            </div>
          )}

          {!loading && step === 0 && (
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Professional Headline</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current: <span className="font-medium">{initialTitle || 'Not set yet'}</span>
                  </p>
                  <div className="bg-background rounded-lg p-4 border">
                    <p className="text-base font-medium">{suggestions?.title || 'Generating a compelling headline...'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && step === 1 && (
            <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl p-6 border border-secondary/20">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">About Section</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Current: <span className="font-medium">{initialAbout || 'Not set yet'}</span>
                  </p>
                  <div className="bg-background rounded-lg p-4 border">
                    <p className="text-base whitespace-pre-line leading-relaxed">
                      {suggestions?.about || 'Crafting your professional story...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && step === 2 && (
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Professional Skills</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    We'll add new skills while keeping your existing ones.
                  </p>
                  <div className="bg-background rounded-lg p-4 border">
                    <div className="flex flex-wrap gap-2">
                      {(suggestions?.skills || []).map((skill, i) => (
                        <span 
                          key={i} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {(!suggestions?.skills || suggestions.skills.length === 0) && (
                        <span className="text-muted-foreground">Identifying your key skills...</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && step === 3 && (
            <div className="bg-gradient-to-r from-secondary/5 to-primary/5 rounded-xl p-6 border border-secondary/20">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">💼</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Work Experience</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Relevant experiences to showcase your background.
                  </p>
                  <div className="bg-background rounded-lg p-4 border space-y-3">
                    {(suggestions?.experiences || []).map((exp, i) => (
                      <div key={i} className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="font-semibold text-foreground">{exp.title}</div>
                        <div className="text-sm text-primary font-medium mb-2">
                          {exp.startYear} – {exp.endYear ?? 'Present'}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                    {(!suggestions?.experiences || suggestions.experiences.length === 0) && (
                      <span className="text-muted-foreground">Building your experience profile...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && step === 4 && (
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎓</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-2">Education & Training</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Educational background that supports your career goals.
                  </p>
                  <div className="bg-background rounded-lg p-4 border space-y-3">
                    {(suggestions?.education || []).map((edu, i) => (
                      <div key={i} className="border border-border rounded-lg p-4 bg-muted/30">
                        <div className="font-semibold text-foreground">{edu.title}</div>
                        <div className="text-sm text-secondary font-medium mb-2">
                          {edu.startYear} – {edu.endYear ?? 'Present'}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{edu.description}</p>
                      </div>
                    ))}
                    {(!suggestions?.education || suggestions.education.length === 0) && (
                      <span className="text-muted-foreground">Preparing education suggestions...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
          <Button variant="ghost" onClick={skipForNow} className="order-3 sm:order-1">
            Skip for now
          </Button>
          <div className="flex gap-2 order-2">
            <Button 
              variant="outline" 
              onClick={() => setStep((s) => Math.max(0, s - 1))} 
              disabled={step === 0}
              className="min-w-[80px]"
            >
              Back
            </Button>
            {step === 0 && (
              <Button 
                onClick={applyTitle} 
                disabled={loading} 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 min-w-[120px]"
              >
                Use Headline
              </Button>
            )}
            {step === 1 && (
              <Button 
                onClick={applyAbout} 
                disabled={loading}
                className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 min-w-[120px]"
              >
                Use About
              </Button>
            )}
            {step === 2 && (
              <Button 
                onClick={applySkills} 
                disabled={loading}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 min-w-[120px]"
              >
                Add Skills
              </Button>
            )}
            {step === 3 && (
              <Button 
                onClick={applyExperience} 
                disabled={loading}
                className="bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 min-w-[120px]"
              >
                Add Experience
              </Button>
            )}
            {step === 4 && (
              <Button 
                onClick={applyEducation} 
                disabled={loading}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 min-w-[120px]"
              >
                Finish Setup
              </Button>
            )}
            {step < steps.length - 1 && (
              <Button 
                variant="outline" 
                onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                className="min-w-[80px]"
              >
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}