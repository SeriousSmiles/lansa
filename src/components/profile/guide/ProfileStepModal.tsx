import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, X, CheckCircle, Circle, Brain } from "lucide-react";
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
      <DialogContent className="max-w-5xl h-[95vh] flex flex-col p-0 gap-0">
        {/* Compact Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Profile Assistant</h2>
              <p className="text-xs text-muted-foreground">Complete your profile step by step</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Compact Progress */}
        <div className="px-4 py-2 border-b bg-muted/10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">Progress</span>
            <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Compact Step Navigation */}
        <div className="px-4 py-2 border-b bg-muted/5">
          <div className="flex items-center gap-1 overflow-x-auto">
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
                    "h-8 px-2 text-xs min-w-fit",
                    isCurrent && "bg-primary text-primary-foreground",
                    isCompleted && !isCurrent && "text-green-600 bg-green-50"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span className="hidden md:inline ml-1">{step.title}</span>
                  <span className="md:hidden ml-1">{index + 1}</span>
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

        {/* Compact Footer Navigation */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="h-8"
          >
            <ChevronLeft className="h-3 w-3 mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          
          <div className="text-xs text-muted-foreground">
            {currentStep + 1} / {STEPS.length}
          </div>
          
          <Button
            size="sm"
            onClick={goToNext}
            disabled={currentStep === STEPS.length - 1}
            className="h-8"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}