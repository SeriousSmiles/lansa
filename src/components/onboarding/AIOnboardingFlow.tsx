import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

// Import step images
import welcomeHeroImage from "@/assets/onboarding/welcome-hero.jpg";
import demographicsImage from "@/assets/onboarding/demographics.jpg";
import skillTransformImage from "@/assets/onboarding/skill-transform.jpg";
import ninetyDayGoalImage from "@/assets/onboarding/90day-goal.jpg";
import powerMirrorImage from "@/assets/onboarding/power-mirror.jpg";

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
  
  const debouncedSkillInput = useDebounce(skillInput, 800);
  const debouncedGoalInput = useDebounce(goalInput, 800);

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
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-skill-reframer', {
        body: {
          user_id: user.id,
          major: demographicsData.major,
          raw_skill_input: skill
        }
      });
      
      if (error) throw error;
      setSkillAnalysis(data.render_snippet);
    } catch (error) {
      console.error('Skill analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeGoal = async (goal: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-90day-planner', {
        body: {
          user_id: user.id,
          major: demographicsData.major,
          raw_goal_input: goal
        }
      });
      
      if (error) throw error;
      setGoalAnalysis(data.render_snippet);
    } catch (error) {
      console.error('Goal analysis error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMirror = async () => {
    if (!user || !skillAnalysis?.value_statements?.[0]) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-power-mirror', {
        body: {
          user_id: user.id,
          source: 'skill',
          text: skillAnalysis.value_statements[0]
        }
      });
      
      if (error) throw error;
      setMirrorData(data.render_snippet);
    } catch (error) {
      console.error('Mirror generation error:', error);
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
      // Update both tables to ensure proper completion tracking
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
      
      // Also update user_answers to mark onboarding as complete
      await supabase
        .from('user_answers')
        .upsert({
          user_id: user.id,
          career_path_onboarding_completed: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      toast.success('Onboarding completed! Ready to build your profile.');
      navigate('/profile');
    } catch (error) {
      console.error('Completion error:', error);
      toast.error('Failed to complete onboarding');
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
      <div className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-primary/5">
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
      <div className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-secondary/5">
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
                className="w-full py-4 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
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
      <div className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-primary/5">
        <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
        
        <StepHeader 
          stepNumber={getStepNumber()}
          totalSteps={5}
          title="Transform Your Skills"
          subtitle="Turn your academic abilities into business value that managers understand"
          image={skillTransformImage}
          powerMoment="Power Moment #1"
        />

        <Card className="shadow-lg border-border max-w-2xl mx-auto">
          <CardContent className="p-8">
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
                      I could help a company by...
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
                    strength={skillAnalysis.overall_strength} 
                    weakestDimension={getWeakestDimension(skillAnalysis)}
                  />
                  
                  {skillAnalysis.overall_strength < 0.7 && (
                    <WhyItMatters
                      explanation="Managers fund outcomes, not tools. They need to see the specific result you deliver."
                      suggestion={skillAnalysis.feedback}
                      clarifyingQuestion={skillAnalysis.follow_up_question}
                    />
                  )}

                  {skillAnalysis.value_statements && (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Manager View
                          </Badge>
                        </div>
                        <h4 className="font-medium text-green-900 dark:text-green-100 mb-3">
                          How this reads to managers:
                        </h4>
                        <ul className="space-y-2">
                          {skillAnalysis.value_statements.map((statement: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-green-800 dark:text-green-200">
                              <span className="text-green-600 mt-1">•</span>
                              <span className="text-sm">{statement}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => setCurrentStep('goal')}
                  disabled={!skillAnalysis || skillAnalysis.overall_strength < 0.5}
                  className="flex-1 py-4 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  Continue to 90-Day Goal ✨
                </Button>
                {skillAnalysis && skillAnalysis.overall_strength >= 0.5 && (
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
      <div className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-secondary/5">
        <ProgressBar currentStep={getStepNumber()} totalSteps={5} />
        
        <StepHeader 
          stepNumber={getStepNumber()}
          totalSteps={5}
          title="Your 90-Day Promise"
          subtitle="What specific, measurable outcome will you deliver in your first 90 days?"
          image={ninetyDayGoalImage}
          powerMoment="Power Moment #2"
        />

        <Card className="shadow-lg border-border max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-6">
              <ActionCard
                title="What will you achieve in 90 days?"
                description="Be specific about measurable outcomes that managers can track"
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
                    strength={goalAnalysis.overall_strength} 
                    weakestDimension={getWeakestDimension(goalAnalysis)}
                  />
                  
                  {goalAnalysis.overall_strength < 0.7 && (
                    <WhyItMatters
                      explanation="Managers need to see a clear, measurable outcome they can track in 90 days."
                      suggestion={goalAnalysis.feedback}
                      clarifyingQuestion={goalAnalysis.follow_up_question}
                    />
                  )}

                  {goalAnalysis.goal_statement && (
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Refined Goal
                          </Badge>
                        </div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                          Your enhanced 90-day promise:
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200 font-medium text-base bg-white/50 dark:bg-gray-800/50 p-3 rounded border-l-4 border-blue-500">
                          {goalAnalysis.goal_statement}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={async () => {
                    await generateMirror();
                    setCurrentStep('summary');
                  }}
                  disabled={!goalAnalysis || goalAnalysis.overall_strength < 0.5}
                  className="flex-1 py-4 text-lg bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  size="lg"
                >
                  See Manager's View 👁️
                </Button>
                {goalAnalysis && goalAnalysis.overall_strength >= 0.5 && (
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
      <div className="lansa-container-narrow min-h-screen bg-gradient-to-br from-background to-primary/5">
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
          <CardContent className="p-8">
            {mirrorData ? (
              <div className="space-y-6">
                <ActionCard
                  title="Manager's First Impression"
                  description="This is what hiring managers think when they read your profile"
                  icon={Eye}
                  status="completed"
                  tags={["AI Analysis", "Manager Perspective"]}
                >
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-5">
                      <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-3">
                        💭 Internal manager thoughts:
                      </h3>
                      <p className="text-blue-800 dark:text-blue-200 italic text-base leading-relaxed bg-white/50 dark:bg-gray-800/50 p-4 rounded border-l-4 border-blue-500">
                        "{mirrorData.manager_read}"
                      </p>
                    </CardContent>
                  </Card>
                </ActionCard>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <ActionCard
                    title="Your Strengths"
                    description="What managers see as your advantages"
                    icon={Target}
                    status="completed"
                  >
                    <ul className="space-y-2">
                      {mirrorData.strengths?.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-green-800 dark:text-green-200">
                          <span className="text-green-600 mt-1">✓</span>
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </ActionCard>
                  
                  <ActionCard
                    title="Potential Concerns"
                    description="Areas that might need addressing"
                    icon={Eye}
                    status="completed"
                  >
                    <ul className="space-y-2">
                      {mirrorData.risks?.map((risk: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-red-800 dark:text-red-200">
                          <span className="text-red-600 mt-1">⚠</span>
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </ActionCard>
                </div>

                <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-lg px-4 py-2">
                        Hire Signal: {Math.round((mirrorData.hire_signal_score || 0) * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Likelihood to hire:</span>
                      <div className="flex-1 bg-purple-200 dark:bg-purple-800 rounded-full h-3 relative overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000 shadow-lg"
                          style={{ width: `${(mirrorData.hire_signal_score || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="text-center pt-4">
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    🎉 Ready to build your professional profile?
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Take these insights and create a resume that showcases your true value.
                  </p>
                  <Button 
                    onClick={handleComplete} 
                    size="lg" 
                    className="px-12 py-4 text-lg bg-gradient-to-r from-primary via-secondary to-primary hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    Build Your Resume Now ✨
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
  if (!analysis) return 'clarity';
  
  const scores = {
    clarity: analysis.clarity_score || 0,
    specificity: analysis.specificity_score || 0,
    relevance: analysis.employer_relevance_score || 0
  };
  
  return Object.entries(scores).reduce((a, b) => scores[a[0]] < scores[b[0]] ? a : b)[0] as 'clarity' | 'specificity' | 'relevance';
}