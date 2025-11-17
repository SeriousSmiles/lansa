import { Sparkles } from "lucide-react";
import { ActionCard } from "@/components/onboarding/ActionCard";
import { StepHeader } from "@/components/onboarding/StepHeader";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import welcomeHeroImage from "@/assets/onboarding/welcome-hero.jpg";

interface StudentWelcomeCardProps {
  onStart: () => void;
}

export function StudentWelcomeCard({ onStart }: StudentWelcomeCardProps) {
  return (
    <div className="lansa-container-narrow">
      <ProgressBar currentStep={1} totalSteps={5} />
    
      <StepHeader 
        stepNumber={1}
        totalSteps={5}
        title="This isn't a test"
        subtitle="It's your first step toward showing how you deliver value"
        image={welcomeHeroImage}
      />

      <ActionCard
        title="Ready to transform how you present yourself?"
        description="In the next few minutes, we'll help you translate your student experience into language that employers understand and value."
        icon={Sparkles}
        status="active"
        tags={["AI-Powered", "5 Minutes", "Career-Focused"]}
        onAction={onStart}
        actionLabel="Let's start ✨"
        className="max-w-xl mx-auto"
      />
    </div>
  );
}