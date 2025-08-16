import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StudentDemographics } from "@/services/question/studentOnboardingService";

interface StudentDemographicsStepProps {
  onComplete: (demographics: StudentDemographics) => void;
  stepNumber: number;
  totalSteps: number;
  isSubmitting: boolean;
}

export function StudentDemographicsStep({ 
  onComplete, 
  stepNumber, 
  totalSteps,
  isSubmitting 
}: StudentDemographicsStepProps) {
  const [academicStatus, setAcademicStatus] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  const academicOptions = [
    { value: "final_year", label: "Final year student" },
    { value: "recent_graduate", label: "Recently graduated" },
    { value: "still_studying", label: "Still studying" },
    { value: "not_in_school", label: "Not in school right now" }
  ];

  const careerOptions = [
    { value: "first_job", label: "Get my first real job" },
    { value: "paid_internship", label: "Land a paid internship" },
    { value: "grow_with_company", label: "Find a company to grow with" },
    { value: "not_sure", label: "I'm not sure yet" }
  ];

  const canProceed = academicStatus && fieldOfStudy.trim() && careerGoal;

  const handleSubmit = () => {
    if (!canProceed || isSubmitting) return;

    onComplete({
      academic_status: academicStatus,
      field_of_study: fieldOfStudy.trim(),
      career_goal_type: careerGoal
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-8 bg-card border-border">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Step {stepNumber} of {totalSteps}
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Tell us about yourself
          </h2>
          <p className="text-muted-foreground">
            This helps us give you better guidance.
          </p>
        </div>

        <div className="space-y-6">
          {/* Academic Status */}
          <div className="space-y-3">
            <Label className="text-base font-medium">What's your current academic status?</Label>
            <RadioGroup value={academicStatus} onValueChange={setAcademicStatus}>
              {academicOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Field of Study */}
          <div className="space-y-2">
            <Label htmlFor="field_of_study" className="text-base font-medium">
              What are you studying (or did you study)?
            </Label>
            <Input
              id="field_of_study"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              placeholder="e.g., Business Administration, Computer Science, Psychology..."
              className="text-base"
            />
          </div>

          {/* Career Goal */}
          <div className="space-y-3">
            <Label className="text-base font-medium">
              Which of these best describes your career goal right now?
            </Label>
            <RadioGroup value={careerGoal} onValueChange={setCareerGoal}>
              {careerOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="text-sm cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSubmit}
            disabled={!canProceed || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            You're doing great — this helps us personalize your experience.
          </p>
        </div>
      </div>
    </Card>
  );
}