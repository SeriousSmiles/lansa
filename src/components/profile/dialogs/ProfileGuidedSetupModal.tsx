import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      const inputs = {
        ...(userAnswers || {}),
        identity: userAnswers?.identity,
        desired_outcome: userAnswers?.desired_outcome,
        aspiration_text: (userAnswers as any)?.onboarding_inputs?.aspiration_text,
        challenges_text: (userAnswers as any)?.onboarding_inputs?.challenges_text,
        expectations_text: (userAnswers as any)?.onboarding_inputs?.expectations_text,
      };
      const resp = await generateProfileSuggestions(inputs);
      setSuggestions(resp);
      setLoading(false);
    };
    fetch();
  }, [open]);

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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Set up your profile with AI guidance</DialogTitle>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {steps.length} • {steps[step]}</p>
        </DialogHeader>

        <div className="space-y-4">
          {loading && <p className="text-muted-foreground">Generating suggestions…</p>}

          {!loading && step === 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Suggested headline</h4>
              <p className="text-sm text-muted-foreground">Current: {initialTitle || '—'}</p>
              <Separator />
              <p className="text-base">{suggestions?.title || 'We will propose a concise headline.'}</p>
            </div>
          )}

          {!loading && step === 1 && (
            <div className="space-y-3">
              <h4 className="font-medium">Suggested about</h4>
              <p className="text-sm text-muted-foreground">Current: {initialAbout || '—'}</p>
              <Separator />
              <p className="text-base whitespace-pre-line">{suggestions?.about || 'We will propose a short, first-person summary.'}</p>
            </div>
          )}

          {!loading && step === 2 && (
            <div className="space-y-3">
              <h4 className="font-medium">Suggested skills</h4>
              <p className="text-sm text-muted-foreground">We’ll add new ones and keep existing skills.</p>
              <Separator />
              <div className="flex flex-wrap gap-2">
                {(suggestions?.skills || []).map((s, i) => (
                  <span key={i} className="px-2 py-1 rounded border text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}

          {!loading && step === 3 && (
            <div className="space-y-3">
              <h4 className="font-medium">Suggested experience</h4>
              <Separator />
              <div className="space-y-2">
                {(suggestions?.experiences || []).map((e, i) => (
                  <div key={i} className="rounded border p-3">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-sm text-muted-foreground">{e.startYear} – {e.endYear ?? 'Present'}</div>
                    <p className="text-sm mt-1">{e.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && step === 4 && (
            <div className="space-y-3">
              <h4 className="font-medium">Suggested education</h4>
              <Separator />
              <div className="space-y-2">
                {(suggestions?.education || []).map((e, i) => (
                  <div key={i} className="rounded border p-3">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-sm text-muted-foreground">{e.startYear} – {e.endYear ?? 'Present'}</div>
                    <p className="text-sm mt-1">{e.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={skipForNow}>Skip for now</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
            {step === 0 && <Button onClick={applyTitle} disabled={loading}>Use suggestion</Button>}
            {step === 1 && <Button onClick={applyAbout} disabled={loading}>Use suggestion</Button>}
            {step === 2 && <Button onClick={applySkills} disabled={loading}>Add skills</Button>}
            {step === 3 && <Button onClick={applyExperience} disabled={loading}>Add experience</Button>}
            {step === 4 && <Button onClick={applyEducation} disabled={loading}>Finish</Button>}
            {step < steps.length - 1 && (
              <Button variant="secondary" onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
                Next
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
