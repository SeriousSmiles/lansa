import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { mobileAnimations } from "@/utils/mobileAnimations";
import { gsap } from "gsap";

interface BusinessOnboardingData {
  companyName: string;
  businessSize: string;
  roleFunction: string;
  businessServices: string;
}

interface MobileBusinessOnboardingProps {
  onComplete: (data: BusinessOnboardingData) => void;
  onBack?: () => void;
  initialData?: Partial<BusinessOnboardingData>;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  validation: () => boolean;
}

export function MobileBusinessOnboarding({ 
  onComplete, 
  onBack, 
  initialData = {} 
}: MobileBusinessOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<BusinessOnboardingData>({
    companyName: initialData.companyName || "",
    businessSize: initialData.businessSize || "",
    roleFunction: initialData.roleFunction || "",
    businessServices: initialData.businessServices || ""
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const businessSizes = [
    "1-10 employees", "11-50 employees", "51-200 employees",
    "201-500 employees", "501-1000 employees", "1000+ employees"
  ];

  const roleFunctions = [
    "CEO/Founder", "HR Director", "Hiring Manager", 
    "Recruiter", "Operations Manager", "Other"
  ];

  const businessServices = [
    "Technology", "Healthcare", "Finance", "Education",
    "Manufacturing", "Retail", "Consulting", "Marketing", "Other"
  ];

  const updateFormData = (field: keyof BusinessOnboardingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const steps: OnboardingStep[] = [
    {
      id: "company",
      title: "Tell us about your company",
      description: "Let's start with the basics",
      validation: () => formData.companyName.length > 0 && formData.businessSize.length > 0,
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="companyName" className="text-base font-medium">
              Company Name *
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => updateFormData('companyName', e.target.value)}
              placeholder="Enter your company name"
              className="mt-2 h-12 text-base"
            />
          </div>
          
          <div>
            <Label htmlFor="businessSize" className="text-base font-medium">
              Company Size *
            </Label>
            <Select 
              value={formData.businessSize} 
              onValueChange={(value) => updateFormData('businessSize', value)}
            >
              <SelectTrigger className="mt-2 h-12 text-base">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                {businessSizes.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      id: "role",
      title: "What's your role?",
      description: "Help us understand your function",
      validation: () => formData.roleFunction.length > 0,
      component: (
        <div>
          <Label htmlFor="roleFunction" className="text-base font-medium">
            Role & Function *
          </Label>
          <Select 
            value={formData.roleFunction} 
            onValueChange={(value) => updateFormData('roleFunction', value)}
          >
            <SelectTrigger className="mt-2 h-12 text-base">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {roleFunctions.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      id: "industry",
      title: "What industry are you in?",
      description: "This helps us match you with relevant candidates",
      validation: () => formData.businessServices.length > 0,
      component: (
        <div>
          <Label htmlFor="businessServices" className="text-base font-medium">
            Industry *
          </Label>
          <Select 
            value={formData.businessServices} 
            onValueChange={(value) => updateFormData('businessServices', value)}
          >
            <SelectTrigger className="mt-2 h-12 text-base">
              <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {businessServices.map((service) => (
                <SelectItem key={service} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    },
    {
      id: "complete",
      title: "You're all set!",
      description: "Ready to start finding great talent?",
      validation: () => true,
      component: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto">
            <Check className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Your employer profile is ready! You can now:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Post job listings</li>
              <li>• Browse and connect with candidates</li>
              <li>• Get AI-powered matches</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    // Animate content change
    if (contentRef.current) {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      );
    }

    // Update progress bar
    if (progressRef.current) {
      const progress = ((currentStep + 1) / steps.length) * 100;
      gsap.to(progressRef.current, {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out"
      });
    }
  }, [currentStep]);

  const handleNext = () => {
    const step = steps[currentStep];
    if (!step.validation()) return;

    if (currentStep === steps.length - 1) {
      onComplete(formData);
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack?.();
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/50 flex flex-col">
      {/* Header with Progress */}
      <div className="mobile-safe-top bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevious}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-800/30 rounded-full h-2">
            <div 
              ref={progressRef}
              className="h-2 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 py-8 flex-1">
          <div ref={contentRef}>
            {/* Step Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-muted-foreground">
                {currentStepData.description}
              </p>
            </div>

            {/* Step Content */}
            <div className="max-w-md mx-auto">
              {currentStepData.component}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border/50 mobile-safe-bottom">
          <div className="max-w-md mx-auto">
            <Button
              onClick={handleNext}
              disabled={!currentStepData.validation()}
              className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-medium"
            >
              {currentStep === steps.length - 1 ? (
                "Complete Setup"
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            {currentStep === 0 && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="w-full mt-2 text-muted-foreground"
              >
                Skip for now
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}