import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StudentDemographics } from "@/services/question/studentOnboardingService";
import demographicsImage from "@/assets/onboarding/demographics.jpg";
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
  const academicOptions = [{
    value: "final_year",
    label: "Final year student"
  }, {
    value: "recent_graduate",
    label: "Recently graduated"
  }, {
    value: "still_studying",
    label: "Still studying"
  }, {
    value: "not_in_school",
    label: "Not in school right now"
  }];
  const careerOptions = [{
    value: "first_job",
    label: "Get my first real job"
  }, {
    value: "paid_internship",
    label: "Land a paid internship"
  }, {
    value: "grow_with_company",
    label: "Find a company to grow with"
  }, {
    value: "not_sure",
    label: "I'm not sure yet"
  }];
  const canProceed = academicStatus && fieldOfStudy.trim() && careerGoal;
  const handleSubmit = () => {
    if (!canProceed || isSubmitting) return;
    onComplete({
      academic_status: academicStatus,
      field_of_study: fieldOfStudy.trim(),
      career_goal_type: careerGoal
    });
  };
  return <div className="min-h-screen bg-background px-4 py-8">
      {/* Centered Logo */}
      

      <div className="lansa-container-narrow">{/* Use Lansa container */}
        {/* Header with Image */}
        <div className="relative mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-full md:w-1/2">
              <img src={demographicsImage} alt="Students in academic setting" className="w-full h-48 md:h-64 object-cover rounded-xl shadow-lg" />
            </div>
            <div className="w-full md:w-1/2 text-center md:text-left">
              <div className="text-sm text-primary font-medium mb-2">
                Step {stepNumber} of {totalSteps} • Getting to Know You
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Tell us about yourself
              </h2>
              <p className="text-base md:text-lg text-muted-foreground">
                This helps us give you personalized guidance tailored to your unique situation.
              </p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg border-border">
          <CardContent className="p-4 md:p-8">
            <div className="space-y-6 md:space-y-8">

            {/* Academic Status */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-foreground">What's your current academic status?</Label>
              <RadioGroup value={academicStatus} onValueChange={setAcademicStatus} className="grid sm:grid-cols-2 gap-3">
                {academicOptions.map(option => <div key={option.value} className="relative">
                    <RadioGroupItem value={option.value} id={`academic_${option.value}`} className="peer sr-only" />
                    <Label htmlFor={`academic_${option.value}`} className="flex items-center justify-center p-4 bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/50 rounded-lg cursor-pointer transition-all peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary font-medium">
                      {option.label}
                    </Label>
                  </div>)}
              </RadioGroup>
            </div>

            {/* Field of Study */}
            <div className="space-y-3">
              <Label htmlFor="field_of_study" className="text-lg font-semibold text-foreground">
                What are you studying (or did you study)?
              </Label>
              <Input id="field_of_study" value={fieldOfStudy} onChange={e => setFieldOfStudy(e.target.value)} placeholder="e.g., Business Administration, Computer Science, Psychology..." className="text-base p-4 bg-background border-2 border-border focus:border-primary transition-colors" />
            </div>

            {/* Career Goal */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold text-foreground">
                Which of these best describes your career goal right now?
              </Label>
              <RadioGroup value={careerGoal} onValueChange={setCareerGoal} className="grid sm:grid-cols-2 gap-3">
                {careerOptions.map(option => <div key={option.value} className="relative">
                    <RadioGroupItem value={option.value} id={`career_${option.value}`} className="peer sr-only" />
                    <Label htmlFor={`career_${option.value}`} className="flex items-center justify-center p-4 bg-muted/30 hover:bg-muted/50 border border-border hover:border-primary/50 rounded-lg cursor-pointer transition-all peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary font-medium text-center">
                      {option.label}
                    </Label>
                  </div>)}
              </RadioGroup>
            </div>

            <div className="pt-8">
              <Button onClick={handleSubmit} disabled={!canProceed || isSubmitting} className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200" size="lg">
                {isSubmitting ? "Saving..." : "Continue to Power Skills"}
              </Button>
            </div>

            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                ✨ You're doing great — this helps us personalize your experience.
              </p>
            </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}