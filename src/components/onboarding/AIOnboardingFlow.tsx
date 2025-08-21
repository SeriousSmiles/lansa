import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { StrengthBar } from "./StrengthBar";
import { WhyItMatters } from "./WhyItMatters";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/use-debounce";

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
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
      
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

  if (currentStep === 'welcome') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {renderProgressBar()}
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            This isn't a test.
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            It's your first step toward showing how you deliver value.
          </p>
          <Button 
            onClick={() => setCurrentStep('demographics')}
            size="lg"
            className="px-8"
          >
            Let's start
          </Button>
        </Card>
      </div>
    );
  }

  if (currentStep === 'demographics') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {renderProgressBar()}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Tell us about yourself
          </h2>
          
          <div className="space-y-6">
            <div>
              <Label>Academic Status</Label>
              <RadioGroup 
                value={demographicsData.academic_status}
                onValueChange={(value) => 
                  setDemographicsData(prev => ({ ...prev, academic_status: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="final_year" id="final_year" />
                  <Label htmlFor="final_year">Final year student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recent_grad" id="recent_grad" />
                  <Label htmlFor="recent_grad">Recent graduate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="studying" id="studying" />
                  <Label htmlFor="studying">Currently studying</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="major">Major/Field of Study</Label>
              <Input
                id="major"
                value={demographicsData.major}
                onChange={(e) => 
                  setDemographicsData(prev => ({ ...prev, major: e.target.value }))
                }
                placeholder="e.g., Business Administration, Computer Science..."
              />
            </div>

            <div>
              <Label>Career Intention</Label>
              <RadioGroup 
                value={demographicsData.career_goal_type}
                onValueChange={(value) => 
                  setDemographicsData(prev => ({ ...prev, career_goal_type: value }))
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="first_job" id="first_job" />
                  <Label htmlFor="first_job">Get my first job</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid_internship" id="paid_internship" />
                  <Label htmlFor="paid_internship">Find a paid internship</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grow_in_company" id="grow_in_company" />
                  <Label htmlFor="grow_in_company">Grow within a company</Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleDemographicsSave}
              disabled={!demographicsData.academic_status || !demographicsData.major || !demographicsData.career_goal_type}
              className="w-full"
            >
              Continue
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'skill') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {renderProgressBar()}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Power Moment 1: What's your strongest skill?
          </h2>
          <p className="text-gray-600 mb-6">
            Turn your school skill into business value that managers understand.
          </p>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="skill">Your skill</Label>
              <Textarea
                id="skill"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., I'm good at research, I can analyze data, I'm organized..."
                rows={3}
              />
            </div>

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
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">How this reads to managers:</h4>
                    <ul className="space-y-1">
                      {skillAnalysis.value_statements.map((statement: string, i: number) => (
                        <li key={i} className="text-green-800">• {statement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={() => setCurrentStep('goal')}
                disabled={!skillAnalysis || skillAnalysis.overall_strength < 0.5}
                className="flex-1"
              >
                Continue to Goal
              </Button>
              {skillAnalysis && skillAnalysis.overall_strength >= 0.5 && (
                <Button 
                  variant="outline" 
                  onClick={() => analyzeSkill(skillInput)}
                  disabled={isLoading}
                >
                  Improve
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'goal') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {renderProgressBar()}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Power Moment 2: Your 90-Day Promise
          </h2>
          <p className="text-gray-600 mb-6">
            What specific outcome will you deliver in your first 90 days?
          </p>
          
          <div className="space-y-6">
            <div>
              <Label htmlFor="goal">Your 90-day goal</Label>
              <Textarea
                id="goal"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g., I will help reduce customer complaints, I'll improve our social media presence..."
                rows={3}
              />
            </div>

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
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Your refined goal:</h4>
                    <p className="text-green-800">{goalAnalysis.goal_statement}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={async () => {
                  await generateMirror();
                  setCurrentStep('summary');
                }}
                disabled={!goalAnalysis || goalAnalysis.overall_strength < 0.5}
                className="flex-1"
              >
                See Manager View
              </Button>
              {goalAnalysis && goalAnalysis.overall_strength >= 0.5 && (
                <Button 
                  variant="outline" 
                  onClick={() => analyzeGoal(goalInput)}
                  disabled={isLoading}
                >
                  Improve
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'summary') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        {renderProgressBar()}
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            How a manager reads you
          </h2>
          
          {mirrorData && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-3">Manager's perspective:</h3>
                <p className="text-blue-800 mb-4">{mirrorData.manager_read}</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-900 mb-2">Strengths</h4>
                    <ul className="space-y-1">
                      {mirrorData.strengths?.map((strength: string, i: number) => (
                        <li key={i} className="text-green-800 text-sm">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-red-900 mb-2">Risks</h4>
                    <ul className="space-y-1">
                      {mirrorData.risks?.map((risk: string, i: number) => (
                        <li key={i} className="text-red-800 text-sm">• {risk}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Hire signal:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(mirrorData.hire_signal_score || 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold">
                      {Math.round((mirrorData.hire_signal_score || 0) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Ready to build your professional profile?
                </h3>
                <Button onClick={handleComplete} size="lg" className="px-8">
                  Build your resume now
                </Button>
              </div>
            </div>
          )}
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