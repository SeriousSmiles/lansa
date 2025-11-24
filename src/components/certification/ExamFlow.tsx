import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WrittenQuestionCard } from "./WrittenQuestionCard";
import gsap from "gsap";

interface Question {
  id: string;
  scenario: string;
  choices: Array<{ id: string; text: string; points: number }>;
  category: string;
  mirror_role: string;
  mirror_context: string;
  randomize_order: boolean;
  question_type: string;
  guidance: string | null;
  max_words: number | null;
  time_limit_seconds: number;
}

interface ExamFlowProps {
  sector: 'office' | 'service' | 'technical' | 'digital';
  userId: string;
}

const ENABLE_WRITTEN_QUESTIONS = false; // Feature flag

export default function ExamFlow({ sector, userId }: ExamFlowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const questionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(40);

  useEffect(() => {
    initializeExam();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const current = questions[currentIndex];
      
      // Shuffle choices if needed
      if (current.question_type === 'mcq') {
        if (current.randomize_order) {
          setShuffledChoices([...current.choices].sort(() => Math.random() - 0.5));
        } else {
          setShuffledChoices(current.choices);
        }
      }
      
      // Reset timer
      const timeLimit = current.question_type === 'written' ? 60 : 40;
      setTimeRemaining(timeLimit);
      
      // Clear existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start countdown
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      animateQuestionEntry();
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex, questions]);

  const animateQuestionEntry = () => {
    if (questionRef.current) {
      gsap.fromTo(questionRef.current,
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  };

  const initializeExam = async () => {
    const { data: allQuestions, error: qError } = await supabase
      .from('cert_questions')
      .select('*')
      .eq('sector', sector);

    if (qError || !allQuestions || allQuestions.length === 0) {
      toast({
        title: "Error",
        description: "No questions available for this sector.",
        variant: "destructive",
      });
      navigate('/certification');
      return;
    }

    // Select questions with type filtering
    const categories = ['mindset', 'workplace_intelligence', 'performance_habits', 'applied_thinking'];
    const selected: Question[] = [];
    
    categories.forEach(cat => {
      const catQuestions = allQuestions
        .filter(q => q.category === cat)
        .map(q => ({
          ...q,
          choices: q.choices as Array<{ id: string; text: string; points: number }>,
          question_type: q.question_type || 'mcq',
          time_limit_seconds: q.time_limit_seconds || 40,
        }));
      
      // Filter by type based on feature flag
      const filteredQuestions = ENABLE_WRITTEN_QUESTIONS 
        ? catQuestions 
        : catQuestions.filter(q => q.question_type !== 'written');
      
      const count = cat === 'mindset' || cat === 'applied_thinking' ? 4 : 3;
      const randomPicks = filteredQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(count, filteredQuestions.length));
      selected.push(...randomPicks);
    });

    // If written questions enabled, ensure mix (12 MCQ + 3 written)
    let finalSelection;
    if (ENABLE_WRITTEN_QUESTIONS) {
      const written = selected.filter(q => q.question_type === 'written').slice(0, 3);
      const mcq = selected.filter(q => q.question_type === 'mcq').slice(0, 12);
      finalSelection = [...mcq, ...written].sort(() => Math.random() - 0.5).slice(0, 15);
    } else {
      finalSelection = selected.sort(() => Math.random() - 0.5).slice(0, 15);
    }

    setQuestions(finalSelection);

    // Create exam session
    const { data: session, error: sError } = await supabase
      .from('cert_sessions')
      .insert({
        user_id: userId,
        sector,
        selected_questions: finalSelection.map(q => q.id),
        status: 'in_progress',
      })
      .select()
      .single();

    if (sError || !session) {
      toast({
        title: "Error",
        description: "Failed to start exam session.",
        variant: "destructive",
      });
      navigate('/certification');
      return;
    }

    setSessionId(session.id);
    setLoading(false);
  };

  const handleAutoSubmit = () => {
    const current = questions[currentIndex];
    
    if (current.question_type === 'written') {
      handleSubmitWrittenAnswer(writtenAnswer);
    } else {
      if (selectedAnswer) {
        handleSubmitAnswer();
      } else {
        // Auto-select first choice
        const firstChoice = shuffledChoices[0];
        setSelectedAnswer(firstChoice.id);
        setTimeout(() => handleSubmitAnswer(), 100);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !sessionId) return;

    setSubmitting(true);
    const current = questions[currentIndex];
    const selectedChoice = current.choices.find(c => c.id === selectedAnswer);

    if (!selectedChoice) {
      setSubmitting(false);
      return;
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate response time
    const timeLimit = current.time_limit_seconds || 40;
    const responseTime = timeLimit - timeRemaining;

    // Save answer to database (no AI call)
    const { error: answerError } = await supabase
      .from('cert_answers')
      .insert({
        session_id: sessionId,
        question_id: current.id,
        selected_option_id: selectedAnswer,
        points_awarded: selectedChoice.points,
        response_time_sec: responseTime,
      });

    if (answerError) {
      toast({
        title: "Error",
        description: "Failed to save answer.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Immediately advance (no mirror moment)
    setSelectedAnswer(null);
    setSubmitting(false);
    
    if (currentIndex === questions.length - 1) {
      completeExam();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmitWrittenAnswer = async (text: string) => {
    if (!sessionId) return;
    setSubmitting(true);

    const current = questions[currentIndex];

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Calculate response time
    const timeLimit = current.time_limit_seconds || 60;
    const responseTime = timeLimit - timeRemaining;

    // Save to database (neutral score for now)
    const { error: answerError } = await supabase
      .from('cert_answers')
      .insert({
        session_id: sessionId,
        question_id: current.id,
        selected_option_id: null,
        written_answer_text: text,
        points_awarded: 7, // Neutral score until AI scoring implemented
        response_time_sec: responseTime,
      });

    if (answerError) {
      toast({
        title: "Error",
        description: "Failed to save answer.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    setWrittenAnswer("");
    setSubmitting(false);

    // Advance
    if (currentIndex === questions.length - 1) {
      completeExam();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const completeExam = async () => {
    if (!sessionId) return;

    setLoading(true);

    // Fetch all answers for this session
    const { data: answers } = await supabase
      .from('cert_answers')
      .select('*, question_id')
      .eq('session_id', sessionId);

    if (!answers) {
      toast({
        title: "Error",
        description: "Failed to calculate results.",
        variant: "destructive",
      });
      return;
    }

    // Calculate category scores
    const categoryPoints: Record<string, { total: number; count: number }> = {
      mindset: { total: 0, count: 0 },
      workplace_intelligence: { total: 0, count: 0 },
      performance_habits: { total: 0, count: 0 },
      applied_thinking: { total: 0, count: 0 },
    };

    const maxPointsPerQuestion = 10;

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.question_id);
      if (question) {
        const cat = question.category as keyof typeof categoryPoints;
        categoryPoints[cat].total += answer.points_awarded;
        categoryPoints[cat].count += 1;
      }
    });

    // Calculate percentages with weights
    const weights = {
      mindset: 1.2,
      workplace_intelligence: 1.0,
      performance_habits: 1.0,
      applied_thinking: 1.2,
    };

    const categoryScores: Record<string, number> = {};
    let weightedSum = 0;
    let totalWeight = 0;

    Object.keys(categoryPoints).forEach(cat => {
      const catKey = cat as keyof typeof categoryPoints;
      const { total, count } = categoryPoints[catKey];
      const percentage = count > 0 ? (total / (count * maxPointsPerQuestion)) * 100 : 0;
      categoryScores[cat] = Math.round(percentage);
      
      weightedSum += percentage * weights[catKey];
      totalWeight += weights[catKey];
    });

    const totalScore = Math.round(weightedSum / totalWeight);
    const passFail = totalScore >= 75;

    // Build payload for AI analysis
    const allAnswers = answers.map(a => {
      const question = questions.find(q => q.id === a.question_id);
      const selectedChoice = question?.choices.find(c => c.id === a.selected_option_id);
      
      return {
        question_id: a.question_id,
        scenario: question?.scenario || '',
        category: question?.category || '',
        selected_text: a.written_answer_text || selectedChoice?.text || '',
        points_awarded: a.points_awarded,
      };
    });

    // Call new cert-post-analysis AI function
    let analysisData: any = null;
    try {
      const { data, error: analysisError } = await supabase.functions.invoke('cert-post-analysis', {
        body: {
          sector,
          category_scores: categoryScores,
          total_score: totalScore,
          pass_fail: passFail ? 'PASS' : 'NEEDS_IMPROVEMENT',
          answers: allAnswers,
        },
      });

      if (analysisError) {
        console.error('Analysis error:', analysisError);
      }
      
      analysisData = data;
    } catch (err) {
      console.error('Post-analysis generation error:', err);
    }

    // Extract AI response
    const strengths = analysisData?.strengths || [];
    const focus_areas = analysisData?.focus_areas || [];
    const per_question_reflections = analysisData?.per_question_reflections || [];
    const category_cards = analysisData?.category_cards || [];
    const mini_report = analysisData?.mini_report || {};

    // Save result
    const { data: result } = await supabase
      .from('cert_results')
      .insert({
        user_id: userId,
        session_id: sessionId,
        sector,
        total_score: totalScore,
        category_scores: categoryScores,
        pass_fail: passFail,
        high_performer: Object.values(categoryScores).every(score => score >= 80),
        ai_summary_text: `${mini_report.overall || ''}\n\n${mini_report.categories || ''}\n\n${mini_report.forward || ''}`,
        strengths,
        focus_areas,
        insights: {
          category_cards,
          mini_report,
        },
        per_question_reflections,
      })
      .select()
      .single();

    // Update session status
    await supabase
      .from('cert_sessions')
      .update({ status: 'completed', end_time: new Date().toISOString() })
      .eq('id', sessionId);

    // Create certification if passed
    if (passFail && result) {
      const allCategoriesHighPerformer = Object.values(categoryScores).every(score => score >= 80);
      const level = allCategoriesHighPerformer ? 'high_performer' : 'standard';
      
      const verificationCode = await generateVerificationCode();
      
      await supabase
        .from('cert_certifications')
        .insert({
          user_id: userId,
          sector,
          level,
          verification_code: verificationCode,
          result_id: result.id,
        });
    }

    setLoading(false);
    
    if (result) {
      navigate(`/certification/result/${result.id}`);
    }
  };

  const generateVerificationCode = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_cert_verification_code');
    if (error || !data) {
      return `LANSA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    }
    return data;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const current = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isWritten = current.question_type === 'written';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className={isWritten ? "max-w-4xl mx-auto" : "max-w-3xl mx-auto"}>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question Card */}
        <Card ref={questionRef} className="p-6 md:p-8 mb-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              {current.category.replace(/_/g, ' ').toUpperCase()}
            </span>
            <h2 className="text-xl md:text-2xl font-bold mb-6 max-w-prose mx-auto text-center">
              {current.scenario}
            </h2>
          </div>

          {isWritten ? (
            <WrittenQuestionCard
              scenario={current.scenario}
              guidance={current.guidance || "Be clear, professional, and solution-focused"}
              maxWords={current.max_words || 50}
              timeLimit={current.time_limit_seconds || 60}
              onSubmit={(answer) => {
                setWrittenAnswer(answer);
                handleSubmitWrittenAnswer(answer);
              }}
              submitting={submitting}
            />
          ) : (
            <>
              {/* Answer Options - 2x2 Grid on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                {shuffledChoices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedAnswer(choice.id)}
                    className={`text-left p-4 md:p-5 rounded-lg border-2 transition-all duration-200 min-h-[100px] md:min-h-[120px] flex items-center ${
                      selectedAnswer === choice.id
                        ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <span className="font-medium text-sm md:text-base">{choice.text}</span>
                  </button>
                ))}
              </div>

              {/* Timer Display */}
              <div className="flex items-center justify-center gap-2 my-4 md:my-6">
                <Clock className={`h-5 w-5 ${
                  timeRemaining <= 10 ? 'text-red-500 animate-pulse' : 'text-muted-foreground'
                }`} />
                <span className={`text-2xl font-mono font-bold ${
                  timeRemaining <= 10 
                    ? 'text-red-500 animate-pulse' 
                    : timeRemaining <= 20 
                      ? 'text-orange-500' 
                      : 'text-primary'
                }`}>
                  {timeRemaining}s
                </span>
              </div>
            </>
          )}

          {/* Submit Button */}
          <Button
            onClick={isWritten ? () => handleSubmitWrittenAnswer(writtenAnswer) : handleSubmitAnswer}
            disabled={submitting || (isWritten ? !writtenAnswer.trim() : !selectedAnswer)}
            className="w-full mt-6"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Submit Answer
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
