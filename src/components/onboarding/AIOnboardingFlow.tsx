import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { logAICall } from "@/utils/logger";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { User, Target, Trophy, Eye, Sparkles } from "lucide-react";
import { StrengthBar } from "./StrengthBar";
import { WhyItMatters } from "./WhyItMatters";
import { SkillAnalysisDisplay } from "./SkillAnalysisDisplay";
import { GoalAnalysisDisplay } from "./GoalAnalysisDisplay";
import { CollapsibleAnalysisCard } from "./CollapsibleAnalysisCard";
import { OnboardingLayout } from "./layout/OnboardingLayout";
import { OnboardingCard } from "./layout/OnboardingCard";
import { LoadingSpinner } from "@/components/loading";
import { supabase } from "@/integrations/supabase/client";
import { useUserState } from "@/contexts/UserStateProvider";
import { useDebounce } from "@/hooks/use-debounce";
import { gsap } from "gsap";

// Import step images
import lansaWelcomeHero from "@/assets/onboarding/lansa-welcome-hero.jpg";
import lansaDemographicsImage from "@/assets/onboarding/lansa-demographics.jpg";
import lansaSkillTransformImage from "@/assets/onboarding/lansa-skill-transform.jpg";
import lansaGoalImage from "@/assets/onboarding/lansa-90day-goal.jpg";
import powerMirrorImage from "@/assets/onboarding/power-mirror-realistic.jpg";

interface AIOnboardingFlowProps {
  initialStep?: string;
}

export function AIOnboardingFlow({ initialStep = 'welcome' }: AIOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(false);
  const [demographicsData, setDemographicsData] = useState({
    academic_status: '',
    major: '',
    career_goal_type: ''
  });
  const [skillInput, setSkillInput] = useState('');
  const [goalInput, setGoalInput] = useState('');
  const [skillAnalysis, setSkillAnalysis] = useState<any>(null);
  const [goalAnalysis, setGoalAnalysis] = useState<any>(null);
  const [mirrorData, setMirrorData] = useState<any>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshUserState, setOnboardingCompleted } = useUserState();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const debouncedSkillInput = useDebounce(skillInput, 800);
  const debouncedGoalInput = useDebounce(goalInput, 800);

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

  // Auto-generate mirror if user lands on summary without data
  useEffect(() => {
    if (currentStep === 'summary' && !mirrorData) {
      generateMirror();
    }
  }, [currentStep]);

  // Auto-analyze skill input
  useEffect(() => {
    if (debouncedSkillInput && demographicsData.major && currentStep === 'skill') {
      analyzeSkill(debouncedSkillInput);
    }
  }, [debouncedSkillInput, demographicsData.major, currentStep]);

  // Auto-analyze goal input
  useEffect(() => {
    if (debouncedGoalInput && demographicsData.major && currentStep === 'goal') {
      analyzeGoal(debouncedGoalInput);
    }
  }, [debouncedGoalInput, demographicsData.major, currentStep]);

  const analyzeSkill = async (skill: string) => {
    if (!user) return;
    
    const startTime = Date.now();
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-skill-reframe', {
        body: { skill }
      });
      
      if (error) throw error;
      const normalized = (data as any)?.analysis ?? data;
      logAICall('analyze-skill-reframe', true, Date.now() - startTime);
      setSkillAnalysis(normalized);
    } catch (error) {
      logAICall('analyze-skill-reframe', false, Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeGoal = async (goal: string) => {
    if (!user) return;
    
    const startTime = Date.now();
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-90day-goal', {
        body: { goalStatement: goal }
      });
      
      if (error) throw error;
      const normalized = (data as any)?.analysis ?? data;
      logAICall('analyze-90day-goal', true, Date.now() - startTime);
      setGoalAnalysis(normalized);
    } catch (error) {
      logAICall('analyze-90day-goal', false, Date.now() - startTime);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMirror = async () => {
    if (!user || !skillAnalysis?.reframed_skill) return;
    
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('generate-power-mirror', {
        body: {
          skillReframe: skillAnalysis.reframed_skill,
          goalStatement: goalInput,
          demographics: demographicsData
        }
      });
      
      if (error) throw error;
      logAICall('generate-power-mirror', true, Date.now() - startTime);
      
      // Normalize response - extract mirror object if wrapped
      const normalized = (data && typeof data === 'object' && 'mirror' in data) ? data.mirror : data;
      setMirrorData(normalized);
      
      // Persist power skill
      if (user && skillInput && skillAnalysis) {
        await supabase.from('user_power_skills').insert({
          user_id: user.id,
          original_skill: skillInput,
          reframed_skill: skillAnalysis.reframed_skill,
          business_value_type: skillAnalysis.business_value_type,
          ai_category: skillAnalysis.ai_category
        });
      }
      
      // Persist 90-day goal
      if (user && goalInput && goalAnalysis) {
        await supabase.from('user_90day_goal').insert({
          user_id: user.id,
          goal_statement: goalInput,
          ai_interpretation: goalAnalysis.interpretation,
          initiative_type: goalAnalysis.initiative_type,
          clarity_level: goalAnalysis.clarity_level
        });
      }
    } catch (error) {
      logAICall('generate-power-mirror', false, Date.now() - startTime);
    }
  };

  const handleDemographicsSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          academic_status: demographicsData.academic_status,
          major: demographicsData.major,
          career_goal_type: demographicsData.career_goal_type
        });
      
      if (error) throw error;
      setCurrentStep('skill');
    } catch (error) {
      console.error('Demographics save error:', error);
      toast.error('Failed to save demographics');
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Use unified onboarding service
      const { markOnboardingComplete } = await import('@/services/onboarding/unifiedOnboardingService');
      const { getPostOnboardingDestination } = await import('@/services/navigation/onboardingNavigationService');
      
      await markOnboardingComplete(user.id, 'job_seeker');
      
      // Ensure app state reflects completion before routing
      if (refreshUserState) {
        await refreshUserState();
      }
      
      toast.success('Onboarding completed! Setting up your profile...');
      
      // Navigate to correct destination
      const destination = getPostOnboardingDestination('job_seeker');
      navigate(destination, { replace: true });
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepNumber = () => {
    const steps = ['welcome', 'demographics', 'skill', 'goal', 'summary'];
    return steps.indexOf(currentStep) + 1;
  };

  const totalSteps = 5;

  // Skill examples for the showcase
  const skillExamples = [
    {
      before: "I know Excel",
      after: "I can track marketing expenses so no one has to double-check my work.",
      category: "Technical Skills"
    },
    {
      before: "I studied psychology",
      after: "I know how to design surveys that people actually answer — so we can get real feedback.",
      category: "Research Skills"
    },
    {
      before: "I did a group project",
      after: "I can coordinate team deliverables and keep projects on schedule using proven collaboration tools.",
      category: "Project Management"
    }
  ];

  // Goal examples for the showcase
  const goalExamples = [
    {
      before: "I want to help with marketing",
      after: "I'll increase social media engagement by 25% in 90 days by implementing data-driven content strategy.",
      category: "Marketing"
    },
    {
      before: "I want to improve operations",
      after: "I'll reduce customer response time from 24 hours to 4 hours by streamlining our support workflow.",
      category: "Operations"
    },
    {
      before: "I want to work in sales",
      after: "I'll generate 50 qualified leads per month by developing and executing targeted outreach campaigns.",
      category: "Sales"
    }
  ];

  if (currentStep === 'welcome') {
    return (
      <div ref={containerRef} className="w-full max-w-4xl mx-auto space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-xl">
          <img 
            src={lansaWelcomeHero} 
            alt="Welcome to Lansa - Transform your future"
            className="w-full h-64 lg:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70 flex items-center justify-center">
            <div className="text-center text-white px-6 space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-inter animate-fade-in">
                This isn't a test
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl opacity-90 animate-fade-in [animation-delay:200ms]">
                It's your first step toward showing how you deliver value
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="bg-card border-border shadow-lg">
          <div className="p-6 lg:p-8 text-center space-y-8">
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                In the next few minutes, we'll help you translate your student experience into language that employers understand and value.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
              <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:border-primary/30 transition-colors">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm lg:text-base">AI-Powered</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">Get personalized insights and recommendations</p>
              </div>
              
              <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-accent/5 to-accent/10 rounded-xl border border-accent/20 hover:border-accent/30 transition-colors">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm lg:text-base">5 Minutes</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">Quick and easy to complete</p>
              </div>
              
              <div className="text-center p-4 lg:p-6 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-xl border border-secondary/20 hover:border-secondary/30 transition-colors">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-5 h-5 text-secondary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm lg:text-base">Career-Focused</h3>
                <p className="text-xs lg:text-sm text-muted-foreground">Tailored to your career goals</p>
              </div>
            </div>

            <div className="space-y-6">
              <Button 
                onClick={() => setCurrentStep('demographics')}
                size="lg"
                className="px-8 lg:px-12 py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Let's start ✨
              </Button>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>5 minutes</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🔒</span>
                  <span>Private & secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>✨</span>
                  <span>AI-powered</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'demographics') {
    return (
      <div ref={containerRef}>
        <OnboardingLayout 
          currentStep={getStepNumber()} 
          totalSteps={totalSteps}
          title="Getting Started"
        >
          <OnboardingCard
            image={lansaDemographicsImage}
            imageAlt="Tell us about yourself"
            title="Tell us about yourself"
            subtitle="Help us customize the experience for your academic background and career goals"
            stepBadge={`Step ${getStepNumber()} of ${totalSteps} • Getting to Know You`}
          >
            <div className="space-y-6 lg:space-y-8">
              {/* Academic Status */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground">Where are you in your academic journey?</Label>
                <RadioGroup 
                  value={demographicsData.academic_status}
                  onValueChange={(value) => 
                    setDemographicsData(prev => ({ ...prev, academic_status: value }))
                  }
                  className="grid sm:grid-cols-2 gap-3"
                >
                  <Label 
                    htmlFor="final_year" 
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all font-medium ${
                      demographicsData.academic_status === 'final_year' 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="final_year" id="final_year" className="sr-only" />
                    Final year student
                  </Label>
                  <Label 
                    htmlFor="recent_grad" 
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all font-medium ${
                      demographicsData.academic_status === 'recent_grad' 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="recent_grad" id="recent_grad" className="sr-only" />
                    Recent graduate
                  </Label>
                  <Label 
                    htmlFor="studying" 
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all font-medium ${
                      demographicsData.academic_status === 'studying' 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="studying" id="studying" className="sr-only" />
                    Currently studying
                  </Label>
                </RadioGroup>
              </div>

              {/* Field of Study */}
              <div className="space-y-3">
                <Label htmlFor="major" className="text-lg font-semibold text-foreground">
                  What's your major or area of specialization?
                </Label>
                <Input
                  id="major"
                  value={demographicsData.major}
                  onChange={(e) => 
                    setDemographicsData(prev => ({ ...prev, major: e.target.value }))
                  }
                  placeholder="e.g., Business Administration, Computer Science, Marketing..."
                  className="text-base p-4 bg-background border-2 border-border focus:border-primary transition-colors"
                />
              </div>

              {/* Career Goal */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-foreground">
                  What's your primary career goal right now?
                </Label>
                <RadioGroup 
                  value={demographicsData.career_goal_type}
                  onValueChange={(value) => 
                    setDemographicsData(prev => ({ ...prev, career_goal_type: value }))
                  }
                  className="grid sm:grid-cols-2 gap-3"
                >
                  <Label 
                    htmlFor="first_job" 
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all font-medium text-center ${
                      demographicsData.career_goal_type === 'first_job' 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="first_job" id="first_job" className="sr-only" />
                    Get my first job
                  </Label>
                  <Label 
                    htmlFor="paid_internship" 
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all font-medium text-center ${
                      demographicsData.career_goal_type === 'paid_internship' 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="paid_internship" id="paid_internship" className="sr-only" />
                    Find a paid internship
                  </Label>
                  <Label 
                    htmlFor="grow_in_company" 
                    className={`flex items-center justify-center p-4 border rounded-lg cursor-pointer transition-all font-medium text-center ${
                      demographicsData.career_goal_type === 'grow_in_company' 
                        ? 'bg-primary/10 border-primary text-primary' 
                        : 'bg-muted/30 hover:bg-muted/50 border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="grow_in_company" id="grow_in_company" className="sr-only" />
                    Grow within a company
                  </Label>
                </RadioGroup>
              </div>

              <div className="pt-8">
                <Button 
                  onClick={handleDemographicsSave}
                  disabled={!demographicsData.academic_status || !demographicsData.major || !demographicsData.career_goal_type}
                  className="w-full py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  Continue to Power Moments ✨
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  ✨ You're doing great — this helps us personalize your experience.
                </p>
              </div>
            </div>
          </OnboardingCard>
        </OnboardingLayout>
      </div>
    );
  }

  if (currentStep === 'skill') {
    const [showExamples, setShowExamples] = useState(false);

    return (
      <div ref={containerRef}>
        <OnboardingLayout 
          currentStep={getStepNumber()} 
          totalSteps={totalSteps}
          title="Getting Started"
        >
          <OnboardingCard
            image={lansaSkillTransformImage}
            imageAlt="Transform your skills"
            title="Transform Your Skills"
            subtitle="Turn your academic abilities into business value that recruiters like"
            stepBadge={`Step ${getStepNumber()} of ${totalSteps} • Power Moment #1`}
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20 p-6 rounded-xl border border-orange-200 dark:border-orange-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-3">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-orange-600 dark:text-orange-400 text-sm">💡</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Focus on specific problems you could solve or value you could create
                    </p>
                    <p className="text-base md:text-lg font-semibold text-foreground bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-primary text-left">
                      "What's something you learned that could actually solve a problem for a company today?"
                    </p>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExamples(!showExamples)}
                  className="border-primary/20 text-primary hover:bg-primary/5"
                >
                  {showExamples ? "Hide examples" : "💡 Want help? See examples"}
                </Button>

                {showExamples && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-foreground mb-3">Here's how to transform generic skills:</h4>
                    {skillExamples.map((example, index) => (
                      <div key={index} className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border">
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-red-500 font-medium text-sm">❌</span>
                            <span className="text-muted-foreground text-sm">"{example.before}"</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-green-500 font-medium text-sm">✅</span>
                            <span className="text-foreground font-medium text-sm">"{example.after}"</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label htmlFor="skill" className="text-lg font-semibold text-foreground">
                  What's your strongest skill?
                </Label>
                <Textarea
                  id="skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Think about specific problems you could solve or value you could create... Be specific about the outcome!"
                  className="min-h-[140px] text-base p-4 bg-background border-2 border-border focus:border-primary transition-colors resize-none"
                  maxLength={500}
                />
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                  <div className="text-xs text-muted-foreground">
                    💡 Tip: Focus on problems you can solve, not just skills you have
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {skillInput.length}/500 characters
                  </div>
                </div>
              </div>

              {skillAnalysis && (
                <SkillAnalysisDisplay analysis={skillAnalysis} />
              )}

              <div className="pt-8">
                <Button 
                  onClick={() => setCurrentStep('goal')}
                  disabled={!skillInput.trim() || skillInput.length < 10}
                  className="w-full py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    "Continue to 90-Day Goal ✨"
                  )}
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  🚀 This one's important — take your time and be specific.
                </p>
              </div>
            </div>
          </OnboardingCard>
        </OnboardingLayout>
      </div>
    );
  }

  if (currentStep === 'goal') {
    const [showExamples, setShowExamples] = useState(false);

    return (
      <div ref={containerRef}>
        <OnboardingLayout 
          currentStep={getStepNumber()} 
          totalSteps={totalSteps}
          title="Getting Started"
        >
          <OnboardingCard
            image={lansaGoalImage}
            imageAlt="Set your 90-day goal"
            title="Your 90-Day Promise"
            subtitle="Show employers what you can deliver in your first three months"
            stepBadge={`Step ${getStepNumber()} of ${totalSteps} • Power Moment #2`}
          >
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">🎯</span>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Think about a specific, measurable outcome you could deliver
                    </p>
                    <p className="text-base md:text-lg font-semibold text-foreground bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border-l-4 border-primary text-left">
                      "In my first 90 days, I will..."
                    </p>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExamples(!showExamples)}
                  className="border-primary/20 text-primary hover:bg-primary/5"
                >
                  {showExamples ? "Hide examples" : "💡 Want help? See examples"}
                </Button>

                {showExamples && (
                  <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-foreground mb-3">Examples of strong 90-day goals:</h4>
                    {goalExamples.map((example, index) => (
                      <div key={index} className="bg-white/70 dark:bg-gray-800/70 p-4 rounded-lg border">
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <span className="text-red-500 font-medium text-sm">❌</span>
                            <span className="text-muted-foreground text-sm">"{example.before}"</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <span className="text-green-500 font-medium text-sm">✅</span>
                            <span className="text-foreground font-medium text-sm">"{example.after}"</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label htmlFor="goal" className="text-lg font-semibold text-foreground">
                  In my first 90 days, I will...
                </Label>
                <Textarea
                  id="goal"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  placeholder="Be specific! Include numbers, timelines, or outcomes that show your impact..."
                  className="min-h-[140px] text-base p-4 bg-background border-2 border-border focus:border-primary transition-colors resize-none"
                  maxLength={500}
                />
                <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0">
                  <div className="text-xs text-muted-foreground">
                    🎯 Tip: Use numbers and specific outcomes to show your initiative
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {goalInput.length}/500 characters
                  </div>
                </div>
              </div>

              {goalAnalysis && (
                <GoalAnalysisDisplay analysis={goalAnalysis} />
              )}

              <div className="pt-8">
                <Button 
                  onClick={() => setCurrentStep('summary')}
                  disabled={!goalInput.trim() || goalInput.length < 10}
                  className="w-full py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    "See Your Power Mirror ✨"
                  )}
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  💪 Almost there — make it bold and specific!
                </p>
              </div>
            </div>
          </OnboardingCard>
        </OnboardingLayout>
      </div>
    );
  }

  if (currentStep === 'summary') {
    return (
      <div ref={containerRef}>
        <OnboardingLayout 
          currentStep={getStepNumber()} 
          totalSteps={totalSteps}
          title="Getting Started"
        >
          <OnboardingCard
            image={powerMirrorImage}
            imageAlt="Your power mirror"
            title="Your Power Mirror"
            subtitle="See how hiring managers will see you"
            stepBadge={`Step ${getStepNumber()} of ${totalSteps} • The Big Reveal`}
          >
            <div className="space-y-6">
              {mirrorData ? (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Eye className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">How You're Perceived</h3>
                          <p className="text-muted-foreground">{mirrorData.perception || mirrorData.how_youre_perceived}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/5 to-secondary/5 border-accent/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Trophy className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Your Unique Edge</h3>
                          <p className="text-muted-foreground">{mirrorData.edge || mirrorData.your_edge}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-secondary/5 to-primary/5 border-secondary/20">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Target className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Next Power Move</h3>
                          <p className="text-muted-foreground">{mirrorData.next_move || mirrorData.next_power_move}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <LoadingSpinner />
                  <p className="mt-4 text-muted-foreground">Generating your power mirror...</p>
                </div>
              )}

              <div className="pt-8">
                <Button 
                  onClick={handleComplete}
                  disabled={isLoading || !mirrorData}
                  className="w-full py-3 lg:py-4 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  {isLoading ? "Completing..." : "Start Building My Profile 🚀"}
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-sm text-muted-foreground">
                  🎉 You're ready to show the world your value!
                </p>
              </div>
            </div>
          </OnboardingCard>
        </OnboardingLayout>
      </div>
    );
  }

  return null;
}
