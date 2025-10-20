import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import MirrorMomentPanel from "./MirrorMomentPanel";
import gsap from "gsap";

interface Question {
  id: string;
  scenario: string;
  choices: Array<{ id: string; text: string; points: number }>;
  category: string;
  mirror_role: string;
  mirror_context: string;
  randomize_order: boolean;
}

interface ExamFlowProps {
  sector: 'office' | 'service' | 'technical' | 'digital';
  userId: string;
}

export default function ExamFlow({ sector, userId }: ExamFlowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const questionRef = useRef<HTMLDivElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMirror, setShowMirror] = useState(false);
  const [mirrorText, setMirrorText] = useState("");
  const [shuffledChoices, setShuffledChoices] = useState<any[]>([]);

  useEffect(() => {
    initializeExam();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length) {
      const current = questions[currentIndex];
      if (current.randomize_order) {
        setShuffledChoices([...current.choices].sort(() => Math.random() - 0.5));
      } else {
        setShuffledChoices(current.choices);
      }
      animateQuestionEntry();
    }
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
    // Fetch all questions for this sector
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

    // Randomly select 15 questions (3-4 per category) and cast types
    const categories = ['mindset', 'workplace_intelligence', 'performance_habits', 'applied_thinking'];
    const selected: Question[] = [];
    
    categories.forEach(cat => {
      const catQuestions = allQuestions
        .filter(q => q.category === cat)
        .map(q => ({
          ...q,
          choices: q.choices as Array<{ id: string; text: string; points: number }>
        }));
      const count = cat === 'mindset' || cat === 'applied_thinking' ? 4 : 3;
      const randomPicks = catQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(count, catQuestions.length));
      selected.push(...randomPicks);
    });

    // Shuffle all selected questions
    const shuffled = selected.sort(() => Math.random() - 0.5).slice(0, 15);
    setQuestions(shuffled);

    // Create exam session
    const { data: session, error: sError } = await supabase
      .from('cert_sessions')
      .insert({
        user_id: userId,
        sector,
        selected_questions: shuffled.map(q => q.id),
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

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !sessionId) return;

    setSubmitting(true);
    const current = questions[currentIndex];
    const selectedChoice = current.choices.find(c => c.id === selectedAnswer);

    if (!selectedChoice) {
      setSubmitting(false);
      return;
    }

    // Save answer to database
    const { error: answerError } = await supabase
      .from('cert_answers')
      .insert({
        session_id: sessionId,
        question_id: current.id,
        selected_option_id: selectedAnswer,
        points_awarded: selectedChoice.points,
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

    // Call Mirror AI
    try {
      const { data: mirrorData, error: mirrorError } = await supabase.functions.invoke('cert-mirror-feedback', {
        body: {
          sector,
          category: current.category,
          scenario: current.scenario,
          user_answer_text: selectedChoice.text,
          mirror_role: current.mirror_role,
          mirror_context: current.mirror_context,
        },
      });

      if (mirrorError) {
        console.error('Mirror AI error:', mirrorError);
      }

      const mirror = mirrorData?.mirror_text || "Your answer shows thoughtfulness. Keep reflecting on how your choices impact professional outcomes.";
      
      // Update answer with mirror text
      await supabase
        .from('cert_answers')
        .update({ ai_mirror_text: mirror })
        .eq('session_id', sessionId)
        .eq('question_id', current.id);

      setMirrorText(mirror);
      setShowMirror(true);
    } catch (err) {
      console.error('Mirror generation error:', err);
      setMirrorText("Your answer demonstrates consideration of the scenario. Continue developing your professional judgment.");
      setShowMirror(true);
    }

    setSubmitting(false);
  };

  const handleNextQuestion = () => {
    setShowMirror(false);
    setSelectedAnswer(null);
    
    if (currentIndex === questions.length - 1) {
      // Exam complete - calculate results
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

    // Generate AI summary
    const allMirrorTexts = answers.map(a => a.ai_mirror_text).filter(Boolean);
    
    let aiSummary = "";
    try {
      const { data: summaryData } = await supabase.functions.invoke('cert-summary', {
        body: {
          sector,
          category_scores: categoryScores,
          all_mirror_texts: allMirrorTexts,
          total_score: totalScore,
          pass_fail: passFail,
        },
      });

      aiSummary = summaryData?.ai_summary_text || "";
    } catch (err) {
      console.error('Summary generation error:', err);
    }

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
        ai_summary_text: aiSummary,
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

  if (showMirror) {
    return (
      <MirrorMomentPanel
        mirrorText={mirrorText}
        onNext={handleNextQuestion}
        isLastQuestion={currentIndex === questions.length - 1}
      />
    );
  }

  const current = questions[currentIndex];
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8 px-4">
      <div className="max-w-3xl mx-auto">
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
        <Card ref={questionRef} className="p-8 mb-6">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-4">
              {current.category.replace(/_/g, ' ').toUpperCase()}
            </span>
            <h2 className="text-2xl font-bold mb-4">{current.scenario}</h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {shuffledChoices.map((choice) => (
              <button
                key={choice.id}
                onClick={() => setSelectedAnswer(choice.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === choice.id
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <span className="font-medium">{choice.text}</span>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || submitting}
            className="w-full mt-6"
            size="lg"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
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
