import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
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
      <DialogContent className="max-w-[1440px] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 mx-auto">
        <VisuallyHidden>
          <DialogTitle>Profile Setup Assistant</DialogTitle>
          <DialogDescription>Complete your profile step by step with AI assistance</DialogDescription>
        </VisuallyHidden>
        {/* Elegant Header with Visual Hierarchy */}
        <div className="flex items-center justify-between p-6 border-b border-border/20 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 flex items-center justify-center shadow-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI Profile Assistant</h2>
              <p className="text-sm text-muted-foreground">Complete your profile with intelligent guidance</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Enhanced Progress with Visual Hierarchy */}
        <div className="px-6 py-4 border-b border-border/10 bg-gradient-to-r from-background to-muted/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Progress</span>
            <span className="text-sm font-medium text-primary">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2 bg-muted/50" />
        </div>

        {/* Enhanced Step Navigation with Visual Cues */}
        <div className="px-6 py-4 border-b border-border/10 bg-muted/5">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
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
                    "h-9 px-3 text-xs font-medium transition-all duration-200 min-w-fit",
                    isCurrent && "bg-primary text-primary-foreground shadow-md scale-105",
                    isCompleted && !isCurrent && "text-green-700 bg-green-100 hover:bg-green-200 border-green-300",
                    !isCompleted && !isCurrent && "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-3.5 w-3.5" />
                  ) : (
                    <Circle className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden lg:inline ml-2">{step.title}</span>
                  <span className="lg:hidden ml-1">{index + 1}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Step Content with Focus Area */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-background via-background to-muted/10">
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              <StepComponent
                profile={profile}
                userId={userId}
                onNext={goToNext}
                onPrevious={goToPrevious}
                isFirst={currentStep === 0}
                isLast={currentStep === STEPS.length - 1}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Footer Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/10 bg-gradient-to-r from-muted/20 to-background">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="h-9 px-4 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <div className="text-xs font-medium text-foreground bg-muted px-2 py-1 rounded">
              {currentStepData.title}
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={goToNext}
            disabled={currentStep === STEPS.length - 1}
            className="h-9 px-4 disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}