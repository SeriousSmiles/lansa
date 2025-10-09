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
import { StepHeader } from "./StepHeader";
import { ProgressBar } from "./ProgressBar";
import { ActionCard } from "./ActionCard";
import { ExampleShowcase } from "./ExampleShowcase";
import { HoverInfo } from "./HoverInfo";
import { SkillAnalysisDisplay } from "./SkillAnalysisDisplay";
import { GoalAnalysisDisplay } from "./GoalAnalysisDisplay";
import { CollapsibleAnalysisCard } from "./CollapsibleAnalysisCard";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";
import { gsap } from "gsap";

// Import step images - realistic professional versions
import welcomeHeroImage from "@/assets/onboarding/welcome-hero.jpg";
import demographicsImage from "@/assets/onboarding/demographics-realistic.jpg";
import skillTransformImage from "@/assets/onboarding/skill-transform-realistic.jpg";
import ninetyDayGoalImage from "@/assets/onboarding/90day-goal-realistic.jpg";
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

  const renderProgressBar = () => (
    <div className="flex justify-center mb-8">
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-all duration-300 ${
              i < getStepNumber() 
                ? 'bg-primary' 
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );

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
      <div ref={containerRef} className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-primary/5">
        <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
        
        <StepHeader 
          stepNumber={getStepNumber()}
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
          onAction={() => setCurrentStep('demographics')}
          actionLabel="Let's start ✨"
          className="max-w-2xl mx-auto"
        />
      </div>
    );
  }

  if (currentStep === 'demographics') {
    return (
      <div ref={containerRef} className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-secondary/5">
        <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
        
        <StepHeader 
          stepNumber={getStepNumber()}
          totalSteps={5}
          title="Tell us about yourself"
          subtitle="Help us customize the experience for your academic background and career goals"
          image={demographicsImage}
        />

        <Card className="shadow-lg border-border max-w-2xl mx-auto">
          <CardContent className="p-4">
            <div className="space-y-8">
              <ActionCard
                title="Academic Status"
                description="Where are you in your academic journey?"
                icon={User}
                status="active"
              >
                <RadioGroup 
                  value={demographicsData.academic_status}
                  onValueChange={(value) => 
                    setDemographicsData(prev => ({ ...prev, academic_status: value }))
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="final_year" id="final_year" />
                    <Label htmlFor="final_year" className="cursor-pointer flex-1">Final year student</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="recent_grad" id="recent_grad" />
                    <Label htmlFor="recent_grad" className="cursor-pointer flex-1">Recent graduate</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="studying" id="studying" />
                    <Label htmlFor="studying" className="cursor-pointer flex-1">Currently studying</Label>
                  </div>
                </RadioGroup>
              </ActionCard>

              <ActionCard
                title="Field of Study"
                description="What's your major or area of specialization?"
                icon={Target}
                status="active"
              >
                <div className="flex items-center gap-2">
                  <Input
                    value={demographicsData.major}
                    onChange={(e) => 
                      setDemographicsData(prev => ({ ...prev, major: e.target.value }))
                    }
                    placeholder="e.g., Business Administration, Computer Science, Marketing..."
                    className="flex-1"
                  />
                  <HoverInfo 
                    title="Why do we ask this?"
                    content="We use your major to give you field-specific examples and recommendations that are relevant to your career path."
                    variant="help"
                  />
                </div>
              </ActionCard>

              <ActionCard
                title="Career Intention"
                description="What's your primary career goal right now?"
                icon={Trophy}
                status="active"
              >
                <RadioGroup 
                  value={demographicsData.career_goal_type}
                  onValueChange={(value) => 
                    setDemographicsData(prev => ({ ...prev, career_goal_type: value }))
                  }
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="first_job" id="first_job" />
                    <Label htmlFor="first_job" className="cursor-pointer flex-1">Get my first job</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="paid_internship" id="paid_internship" />
                    <Label htmlFor="paid_internship" className="cursor-pointer flex-1">Find a paid internship</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="grow_in_company" id="grow_in_company" />
                    <Label htmlFor="grow_in_company" className="cursor-pointer flex-1">Grow within a company</Label>
                  </div>
                </RadioGroup>
              </ActionCard>

              <Button 
                onClick={handleDemographicsSave}
                disabled={!demographicsData.academic_status || !demographicsData.major || !demographicsData.career_goal_type}
                className="w-full py-4 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                size="lg"
              >
                Continue to Power Moments ✨
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'skill') {
    return (
      <div ref={containerRef} className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-primary/5">
        <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
        
        <StepHeader 
          stepNumber={getStepNumber()}
          totalSteps={5}
          title="Transform Your Skills"
          subtitle="Turn your academic abilities into business value that recruiters like"
          image={skillTransformImage}
          powerMoment="Power Moment #1"
        />

        <Card className="shadow-lg border-border max-w-2xl mx-auto">
          <CardContent className="p-4">
            <div className="space-y-6">
              <ActionCard
                title="What's your strongest skill?"
                description="Focus on specific problems you could solve or value you could create"
                icon={Target}
                status="active"
              >
                <div className="space-y-4">
                  <ExampleShowcase 
                    examples={skillExamples}
                    title="Transform your skills"
                    description="See how students turn generic skills into business value"
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="skill" className="text-base font-medium">
                      I could help a project by...
                    </Label>
                    <Textarea
                      id="skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      placeholder="Think about specific problems you could solve or outcomes you could create... Be specific about the business impact!"
                      className="min-h-[120px] text-base bg-background border-2 border-border focus:border-primary transition-colors resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>💡 Focus on outcomes, not just tools or skills</span>
                      <span>{skillInput.length}/500</span>
                    </div>
                  </div>
                </div>
              </ActionCard>

              {skillAnalysis && (
                <div className="space-y-4">
                  <StrengthBar 
                    strength={skillAnalysis.score / 10} 
                    weakestDimension={getWeakestDimension(skillAnalysis)}
                  />
                  
                  {skillAnalysis.score < 7 && (
                    <WhyItMatters
                      explanation="Managers fund outcomes, not tools. They need to see the specific result you deliver."
                      suggestion={skillAnalysis.coaching_nudge}
                    />
                  )}

                  <SkillAnalysisDisplay analysis={skillAnalysis} />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setCurrentStep('goal')}
                  disabled={!skillAnalysis || skillAnalysis.score < 5}
                  className="flex-1 py-4 text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  Continue to 90-Day Goal ✨
                </Button>
                {skillAnalysis && skillAnalysis.score >= 5 && (
                  <Button 
                    variant="outline" 
                    onClick={() => analyzeSkill(skillInput)}
                    disabled={isLoading}
                    className="px-6"
                  >
                    {isLoading ? "Analyzing..." : "Improve"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'goal') {
    return (
      <div ref={containerRef} className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-secondary/5">
        <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
        
        <StepHeader 
          stepNumber={getStepNumber()}
          totalSteps={5}
          title="Your 90-Day Promise"
          subtitle="What specific, outcome can you deliver in your first 90 days?"
          image={ninetyDayGoalImage}
          powerMoment="Power Moment #2"
        />

        <Card className="shadow-lg border-border max-w-2xl mx-auto">
          <CardContent className="p-4">
            <div className="space-y-6">
              <ActionCard
                title="What will you achieve in 90 days?"
                description="Be specific about results that you can prove."
                icon={Trophy}
                status="active"
              >
                <div className="space-y-4">
                  <ExampleShowcase 
                    examples={goalExamples}
                    title="90-day goal examples"
                    description="See how students create compelling 90-day promises"
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-base font-medium">
                      In my first 90 days, I will...
                    </Label>
                    <Textarea
                      id="goal"
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      placeholder="e.g., I'll increase customer satisfaction by 15% by implementing a feedback system that reduces response time from 24 hours to 4 hours..."
                      className="min-h-[120px] text-base bg-background border-2 border-border focus:border-primary transition-colors resize-none"
                      maxLength={500}
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>💡 Include numbers, timelines, and specific outcomes</span>
                      <span>{goalInput.length}/500</span>
                    </div>
                  </div>
                </div>
              </ActionCard>

              {goalAnalysis && (
                <div className="space-y-4">
                  <StrengthBar 
                    strength={goalAnalysis.score / 10} 
                    weakestDimension={getWeakestDimension(goalAnalysis)}
                  />
                  
                  {goalAnalysis.score < 7 && (
                    <WhyItMatters
                      explanation="Managers need to see a clear, measurable outcome they can track in 90 days."
                      suggestion={goalAnalysis.coaching_nudge}
                    />
                  )}

                  <GoalAnalysisDisplay analysis={goalAnalysis} />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={async () => {
                    await generateMirror();
                    setCurrentStep('summary');
                  }}
                  disabled={!goalAnalysis || goalAnalysis.score < 5}
                  className="flex-1 py-4 text-sm bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  See Manager's View 👁️
                </Button>
                {goalAnalysis && goalAnalysis.score >= 5 && (
                  <Button 
                    variant="outline" 
                    onClick={() => analyzeGoal(goalInput)}
                    disabled={isLoading}
                    className="px-6"
                  >
                    {isLoading ? "Analyzing..." : "Improve"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'summary') {
    return (
      <div ref={containerRef} className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-primary/5">
        <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
        
        <StepHeader 
          stepNumber={getStepNumber()}
          totalSteps={5}
          title="The Manager's View"
          subtitle="See how a hiring manager reads your profile based on what you've shared"
          image={powerMirrorImage}
          powerMoment="Your Mirror Moment"
        />

        <Card className="shadow-lg border-border max-w-2xl mx-auto">
          <CardContent className="p-4">
            {mirrorData ? (
              <div className="space-y-4">
                {/* Overall Score Hero */}
                <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 shadow-lg">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">
                        Overall Impression: {mirrorData.score || 7}/10
                      </h3>
                      <div className="flex justify-center gap-1 mb-4">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-8 rounded-full transition-all ${
                              i < (mirrorData.score || 7) ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      
                      {mirrorData.score_breakdown && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-primary/10 shadow-sm">
                            <div className="font-medium text-muted-foreground mb-1">Clarity</div>
                            <div className="text-lg font-bold">{mirrorData.score_breakdown.clarity || 0}/3</div>
                          </div>
                          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-primary/10 shadow-sm">
                            <div className="font-medium text-muted-foreground mb-1">Relevance</div>
                            <div className="text-lg font-bold">{mirrorData.score_breakdown.relevance || 0}/3</div>
                          </div>
                          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-primary/10 shadow-sm">
                            <div className="font-medium text-muted-foreground mb-1">Realism</div>
                            <div className="text-lg font-bold">{mirrorData.score_breakdown.realism || 0}/2</div>
                          </div>
                          <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-primary/10 shadow-sm">
                            <div className="font-medium text-muted-foreground mb-1">Impact</div>
                            <div className="text-lg font-bold">{mirrorData.score_breakdown.professional_impression || 0}/2</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Recruiter Perspective - Always Open */}
                <CollapsibleAnalysisCard
                  title="How Recruiters See You"
                  icon="👔"
                  isDefaultOpen={true}
                  variant="neutral"
                >
                  <div className="space-y-3">
                    <p className="text-base leading-relaxed italic border-l-4 border-primary pl-4 py-2 bg-primary/5 text-foreground/90 rounded-r">
                      "{mirrorData.recruiter_perspective || mirrorData.mirror_message}"
                    </p>
                  </div>
                </CollapsibleAnalysisCard>

                {/* Key Strengths */}
                {mirrorData.key_strengths && mirrorData.key_strengths.length > 0 && (
                  <CollapsibleAnalysisCard
                    title="What Makes You Stand Out"
                    icon="💎"
                    isDefaultOpen={false}
                    variant="good"
                  >
                    <ul className="space-y-2">
                      {mirrorData.key_strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-600 dark:text-green-400 mt-1">✓</span>
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleAnalysisCard>
                )}

                {/* Contradictions/Areas to Watch */}
                {mirrorData.contradictions && mirrorData.contradictions.length > 0 && (
                  <CollapsibleAnalysisCard
                    title="Areas to Watch"
                    icon="⚠️"
                    isDefaultOpen={false}
                    variant="concerning"
                  >
                    <ul className="space-y-2">
                      {mirrorData.contradictions.map((contradiction: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-600 dark:text-orange-400 mt-1">!</span>
                          <span className="text-sm">{contradiction}</span>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleAnalysisCard>
                )}

                {/* Employer Perspective */}
                {mirrorData.employer_perspective && (
                  <CollapsibleAnalysisCard
                    title="Employer's First Impression"
                    icon="👔"
                    isDefaultOpen={false}
                  >
                    <p className="text-sm leading-relaxed">{mirrorData.employer_perspective}</p>
                  </CollapsibleAnalysisCard>
                )}

                {/* Coaching Advice */}
                {(mirrorData.coaching_nudge || mirrorData.next_level_hint) && (
                  <CollapsibleAnalysisCard
                    title="Your Coach's Advice"
                    icon="💡"
                    isDefaultOpen={false}
                    variant={mirrorData.score >= 7 ? 'good' : 'concerning'}
                  >
                    <div className="space-y-3">
                      {mirrorData.coaching_nudge && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">Next Step:</p>
                          <p className="text-sm">{mirrorData.coaching_nudge}</p>
                        </div>
                      )}
                      {mirrorData.next_level_hint && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-1">To Level Up:</p>
                          <p className="text-sm">{mirrorData.next_level_hint}</p>
                        </div>
                      )}
                    </div>
                  </CollapsibleAnalysisCard>
                )}

                {/* CTA */}
                <div className="text-center pt-6 space-y-4">
                  <div className="p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-2 border-primary/20 rounded-lg shadow-md">
                    <p className="text-base font-medium mb-2">
                      🎯 You're ready to showcase your value
                    </p>
                    <p className="text-sm text-foreground/80">
                      Use these insights to build a profile that stands out to employers
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleComplete} 
                    size="lg" 
                    className="w-full py-6 text-base bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  >
                    Build Your Profile Now ✨
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Generating your manager's perspective...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

function getWeakestDimension(analysis: any): 'clarity' | 'specificity' | 'relevance' {
  if (!analysis?.score_breakdown) return 'clarity';
  
  const { score_breakdown } = analysis;
  const scores = {
    clarity: score_breakdown.clarity || 0,
    specificity: score_breakdown.realism || 0,  // Map realism to specificity
    relevance: score_breakdown.relevance || 0
  };
  
  return Object.entries(scores).reduce((a, b) => scores[a[0]] < scores[b[0]] ? a : b)[0] as 'clarity' | 'specificity' | 'relevance';
}