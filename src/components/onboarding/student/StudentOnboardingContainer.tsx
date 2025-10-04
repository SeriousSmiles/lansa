import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { gsap } from "gsap";
import { 
  saveStudentDemographics, 
  savePowerSkill, 
  saveNinetyDayGoal, 
  markStudentOnboardingComplete,
  StudentDemographics 
} from "@/services/question/studentOnboardingService";

import { StudentWelcomeCard } from "./StudentWelcomeCard";
import { StudentDemographicsStep } from "./StudentDemographicsStep";
import { SkillReframeStep } from "./SkillReframeStep";
import { NinetyDayPromiseStep } from "./NinetyDayPromiseStep";
import { PowerMirrorStep } from "./PowerMirrorStep";

type Step = 'welcome' | 'demographics' | 'skill-reframe' | 'ninety-day' | 'power-mirror';

export function StudentOnboardingContainer() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demographics, setDemographics] = useState<StudentDemographics | null>(null);
  const [skillData, setSkillData] = useState<{ original: string; analysis: any } | null>(null);
  const [goalData, setGoalData] = useState<{ statement: string; analysis: any } | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  // Animate step entrance
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [currentStep]);

  const totalSteps = 5;
  const getStepNumber = (): number => {
    const stepMap = {
      'welcome': 0,
      'demographics': 1,
      'skill-reframe': 2,
      'ninety-day': 3,
      'power-mirror': 4
    };
    return stepMap[currentStep];
  };

  const handleWelcomeComplete = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep('demographics');
  };

  const handleDemographicsComplete = async (demographicsData: StudentDemographics) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await saveStudentDemographics(user.id, demographicsData);
      setDemographics(demographicsData);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep('skill-reframe');
      
      toast({
        title: "Great start!",
        description: "Your information has been saved.",
      });
    } catch (error) {
      console.error('Error saving demographics:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillComplete = async (originalSkill: string, analysis: any) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await savePowerSkill({
        user_id: user.id,
        original_skill: originalSkill,
        reframed_skill: analysis.reframed_skill,
        ai_category: analysis.ai_category,
        business_value_type: analysis.business_value_type
      });
      
      setSkillData({ original: originalSkill, analysis });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep('ninety-day');
      
      toast({
        title: "Excellent!",
        description: analysis.encouragement || "You're showing real value!",
      });
    } catch (error) {
      console.error('Error saving skill:', error);
      toast({
        title: "Error",
        description: "Failed to save your skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalComplete = async (goalStatement: string, analysis: any) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await saveNinetyDayGoal({
        user_id: user.id,
        goal_statement: goalStatement,
        ai_interpretation: analysis.interpretation,
        initiative_type: analysis.initiative_type,
        clarity_level: analysis.clarity_level
      });
      
      setGoalData({ statement: goalStatement, analysis });
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep('power-mirror');
      
      toast({
        title: "Outstanding!",
        description: "Your 90-day goal shows real initiative!",
      });
    } catch (error) {
      console.error('Error saving goal:', error);
      toast({
        title: "Error",
        description: "Failed to save your goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalComplete = async (mirror: any) => {
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await markStudentOnboardingComplete(user.id);
      
      toast({
        title: "🎉 Onboarding Complete!",
        description: "You're ready to build your profile and show your value!",
      });
      
      // Navigate to profile page
      navigate('/profile');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to complete onboarding. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    const stepNumber = getStepNumber();
    
    switch (currentStep) {
      case 'welcome':
        return <StudentWelcomeCard onStart={handleWelcomeComplete} />;
        
      case 'demographics':
        return (
          <div ref={containerRef}>
            <StudentDemographicsStep
              onComplete={handleDemographicsComplete}
              stepNumber={stepNumber}
              totalSteps={totalSteps - 1} // Exclude welcome step from count
              isSubmitting={isSubmitting}
            />
          </div>
        );
        
      case 'skill-reframe':
        return (
          <div ref={containerRef}>
            <SkillReframeStep
              onComplete={handleSkillComplete}
              stepNumber={stepNumber}
              totalSteps={totalSteps - 1}
              isSubmitting={isSubmitting}
            />
          </div>
        );
        
      case 'ninety-day':
        return (
          <div ref={containerRef}>
            <NinetyDayPromiseStep
              onComplete={handleGoalComplete}
              stepNumber={stepNumber}
              totalSteps={totalSteps - 1}
              isSubmitting={isSubmitting}
            />
          </div>
        );
        
      case 'power-mirror':
        return (
          <div ref={containerRef}>
            <PowerMirrorStep
              skillReframe={skillData?.analysis?.reframed_skill || ''}
              goalStatement={goalData?.statement || ''}
              demographics={demographics!}
              onComplete={handleFinalComplete}
              stepNumber={stepNumber}
              totalSteps={totalSteps - 1}
              isSubmitting={isSubmitting}
            />
          </div>
        );
        
      default:
        return <StudentWelcomeCard onStart={handleWelcomeComplete} />;
    }
  };

  return renderCurrentStep();
}