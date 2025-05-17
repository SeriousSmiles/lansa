
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CompletionCardProps {
  onGoToDashboard: () => void;
  isTransitioning: boolean;
  identity?: string;
  desiredOutcome?: string;
}

export const CompletionCard: React.FC<CompletionCardProps> = ({
  onGoToDashboard,
  isTransitioning,
  identity = "Professional",
  desiredOutcome = "Professional clarity",
}) => {
  return (
    <Card className="bg-white rounded-2xl overflow-hidden shadow-lg border-0 w-full">
      <div className="h-3 bg-gradient-to-r from-[#FF6B4A] to-[#FF8F6B]"></div>
      
      <CardContent className="p-8">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2E2E2E] mb-4">
              Your Profile is Complete!
            </h2>
            <p className="text-lg text-[#2E2E2E]">
              You've successfully completed your onboarding. Now you're ready to explore your personalized dashboard and start building your professional clarity.
            </p>
          </div>
          
          <div className="bg-[#F9F5FF] p-6 rounded-lg border-l-4 border-[#FF6B4A]">
            <p className="text-xl text-[#2E2E2E] font-medium">
              As a {identity}, your goal of {desiredOutcome} is now within reach with our personalized guidance.
            </p>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#2E2E2E]">
              Next steps to increase your professional clarity:
            </h3>
            
            <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]">
              <li>Complete your profile to highlight your unique strengths</li>
              <li>Explore content tailored to your professional identity</li>
              <li>Begin building your visibility strategy</li>
              <li>Connect with others who share your professional goals</li>
            </ul>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button
              onClick={onGoToDashboard}
              className="bg-[#FF6B4A] hover:bg-[#FF6B4A]/90 text-white text-lg py-6 px-8 h-auto rounded-lg w-full md:w-auto"
              disabled={isTransitioning}
            >
              {isTransitioning ? 'Setting up...' : 'Build My Success Dashboard'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
