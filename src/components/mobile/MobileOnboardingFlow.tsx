import React, { useState, useRef, useEffect } from "react";
import { SwipeableContainer } from "./SwipeableContainer";
import { MobileCardLayout } from "./MobileCardLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import { gsap } from "gsap";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  component?: React.ReactNode;
  validation?: () => boolean;
}

interface MobileOnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
}

export function MobileOnboardingFlow({
  steps,
  onComplete,
  onStepChange
}: MobileOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  useEffect(() => {
    onStepChange?.(currentStep);
    
    // Animate content change
    if (contentRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(contentRef.current,
        { 
          x: direction === 'forward' ? 50 : -50, 
          opacity: 0,
          scale: 0.95
        },
        { 
          x: 0, 
          opacity: 1,
          scale: 1,
          duration: 0.6, 
          ease: "back.out(1.7)" 
        }
      );
    }

    // Animate progress bar
    if (progressRef.current) {
      gsap.to(progressRef.current, {
        scaleX: progress / 100,
        duration: 0.8,
        ease: "power2.out"
      });
    }
  }, [currentStep, direction, onStepChange, progress]);

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    
    // Validate current step if validation function exists
    if (currentStepData.validation && !currentStepData.validation()) {
      return;
    }

    if (isLastStep) {
      // Completion animation
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          scale: 1.05,
          duration: 0.2,
          yoyo: true,
          repeat: 1,
          onComplete: onComplete
        });
      }
    } else {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSwipe = (swipeDirection: 'left' | 'right') => {
    if (swipeDirection === 'left' && !isLastStep) {
      handleNext();
    } else if (swipeDirection === 'right' && !isFirstStep) {
      handlePrevious();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-background flex flex-col md:hidden">
      {/* Header with progress */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border/50 mobile-safe-top">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground font-inter">
              Getting Started
            </h1>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          {/* Progress bar container */}
          <div className="relative h-2 bg-gray-100 dark:bg-gray-800/30 rounded-full overflow-hidden">
            <div 
              ref={progressRef}
              className="absolute top-0 left-0 h-full lansa-gradient-primary rounded-full origin-left scale-x-0"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4">
        <SwipeableContainer
          onSwipeLeft={() => handleSwipe('left')}
          onSwipeRight={() => handleSwipe('right')}
          className="h-full"
        >
          <div ref={contentRef} className="h-full flex flex-col">
            {/* Step image */}
            {currentStepData.image && (
              <div className="mb-6">
                <img
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  className="w-full h-48 object-cover rounded-2xl shadow-lg"
                />
              </div>
            )}

            {/* Step content */}
            <MobileCardLayout className="flex-1 flex flex-col">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-3 font-inter">
                  {currentStepData.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {currentStepData.description}
                </p>
              </div>

              {/* Custom component for this step */}
              {currentStepData.component && (
                <div className="flex-1 mb-6">
                  {currentStepData.component}
                </div>
              )}

              {/* Step indicators */}
              <div className="flex justify-center gap-2 mb-8">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'bg-primary scale-125'
                        : index < currentStep
                        ? 'bg-primary/60'
                        : 'bg-muted'
                    }`}
                    onClick={() => {
                      setDirection(index > currentStep ? 'forward' : 'backward');
                      setCurrentStep(index);
                    }}
                  />
                ))}
              </div>
            </MobileCardLayout>
          </div>
        </SwipeableContainer>
      </div>

      {/* Navigation buttons */}
      <div className="p-4 mobile-safe-bottom">
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={handlePrevious}
            disabled={isFirstStep}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            size="lg"
            className="flex-1 lansa-gradient-primary"
            onClick={handleNext}
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Complete
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        {/* Skip option for non-essential steps */}
        {!isLastStep && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full mt-3 text-muted-foreground"
            onClick={onComplete}
          >
            Skip onboarding
          </Button>
        )}
      </div>
    </div>
  );
}