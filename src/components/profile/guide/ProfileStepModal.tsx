import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X, CheckCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PhotoStep } from "./steps/PhotoStep";
import { TitleStep } from "./steps/TitleStep";
import { AboutStep } from "./steps/AboutStep";
import { SkillsStep } from "./steps/SkillsStep";
import { GoalStep } from "./steps/GoalStep";
import { ChallengeStep } from "./steps/ChallengeStep";
import { ExperienceStep } from "./steps/ExperienceStep";
import { EducationStep } from "./steps/EducationStep";
import type { ProfileDataReturn } from "@/hooks/profile/profileTypes";

interface ProfileStepModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: ProfileDataReturn;
  userId: string;
}

const STEPS = [
  { id: 'photo', title: 'Profile Photo', component: PhotoStep },
  { id: 'title', title: 'Professional Title', component: TitleStep },
  { id: 'about', title: 'About Me', component: AboutStep },
  { id: 'skills', title: 'Skills', component: SkillsStep },
  { id: 'goal', title: 'Professional Goal', component: GoalStep },
  { id: 'challenge', title: 'Biggest Challenge', component: ChallengeStep },
  { id: 'experience', title: 'Experience', component: ExperienceStep },
  { id: 'education', title: 'Education', component: EducationStep },
];

export function ProfileStepModal({ open, onOpenChange, profile, userId }: ProfileStepModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Calculate completion status for each step
  useEffect(() => {
    const completed = new Set<string>();
    
    if (profile.profileImage) completed.add('photo');
    if (profile.userTitle) completed.add('title');
    if (profile.aboutText) completed.add('about');
    if (profile.userSkills && profile.userSkills.length > 0) completed.add('skills');
    if (profile.professionalGoal) completed.add('goal');
    if (profile.biggestChallenge) completed.add('challenge');
    if (profile.experiences && profile.experiences.length > 0) completed.add('experience');
    if (profile.educationItems && profile.educationItems.length > 0) completed.add('education');
    
    setCompletedSteps(completed);
  }, [profile]);

  // Find next incomplete step when opening
  useEffect(() => {
    if (open) {
      const nextIncompleteIndex = STEPS.findIndex(step => !completedSteps.has(step.id));
      if (nextIncompleteIndex !== -1) {
        setCurrentStep(nextIncompleteIndex);
      }
    }
  }, [open, completedSteps]);

  const currentStepData = STEPS[currentStep];
  const StepComponent = currentStepData.component;
  const progress = (completedSteps.size / STEPS.length) * 100;

  const goToNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Profile Guide</h2>
            <p className="text-muted-foreground">Complete your professional profile step by step</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b bg-muted/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Navigation */}
        <div className="px-6 py-4 border-b">
          <div className="flex items-center gap-2 overflow-x-auto">
            {STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStep;
              
              return (
                <Button
                  key={step.id}
                  variant={isCurrent ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => goToStep(index)}
                  className={cn(
                    "flex items-center gap-2 min-w-fit",
                    isCompleted && !isCurrent && "text-green-600"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{step.title}</span>
                  <span className="sm:hidden">{index + 1}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <StepComponent
            profile={profile}
            userId={userId}
            onNext={goToNext}
            onPrevious={goToPrevious}
            isFirst={currentStep === 0}
            isLast={currentStep === STEPS.length - 1}
          />
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/20">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </div>
          
          <Button
            onClick={goToNext}
            disabled={currentStep === STEPS.length - 1}
            className="flex items-center gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}