import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, CheckCircle, XCircle, Loader2 } from "lucide-react";
import gsap from "gsap";
import { CategoryCard } from "./CategoryCard";
import { StrengthsFocusCard } from "./StrengthsFocusCard";
import { ReviewDrawer } from "./ReviewDrawer";
import { CertResult, Certification } from "@/types/certification";
import CertificateDownloadButton from "./CertificateDownloadButton";

interface ReflectionReportProps {
  resultId: string;
  userId: string;
}

export default function ReflectionReport({ resultId, userId }: ReflectionReportProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<CertResult | null>(null);
  const [certification, setCertification] = useState<Certification | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [answers, setAnswers] = useState<any[]>([]);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  useEffect(() => {
    if (result && badgeRef.current) {
      gsap.fromTo(badgeRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.5)', delay: 0.3 }
      );
    }
  }, [result]);

  const loadResult = async () => {
    const { data: resultData, error: rError } = await supabase
      .from('cert_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', userId)
      .single();

    if (rError || !resultData) {
      navigate('/certification');
      return;
    }

    setResult({
      ...resultData,
      category_scores: resultData.category_scores as Record<string, number>,
      strengths: (resultData.strengths || []) as string[],
      focus_areas: (resultData.focus_areas || []) as string[],
      insights: (resultData.insights || {}) as any,
      per_question_reflections: (Array.isArray(resultData.per_question_reflections) ? resultData.per_question_reflections : []) as any[],
    } as CertResult);

    // Load certification if passed
    if (resultData.pass_fail) {
      const { data: certData } = await supabase
        .from('cert_certifications')
        .select('*')
        .eq('result_id', resultId)
        .single();

      if (certData) {
        setCertification(certData as any as Certification);
      }
    }

    // Load all answers with questions for review mode
    const { data: answersData } = await supabase
      .from('cert_answers')
      .select(`
        *,
        cert_questions (
          scenario,
          choices,
          category,
          question_type
        )
      `)
      .eq('session_id', resultData.session_id)
      .order('created_at');

    if (answersData) {
      const reflections = Array.isArray(resultData.per_question_reflections) 
        ? resultData.per_question_reflections 
        : [];
      
      const enrichedAnswers = answersData.map((answer: any) => {
        const reflection: any = reflections.find(
          (r: any) => r && typeof r === 'object' && r.question_id === answer.question_id
        );
        return {
          ...answer,
          reflection: reflection?.short_mirror || 'Reflection not available',
        };
      });
      setAnswers(enrichedAnswers);
    }

    setLoading(false);
  };

  const handleDownloadCertificate = () => {}; // replaced by CertificateDownloadButton

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) return null;

  const sectorName = result.sector.charAt(0).toUpperCase() + result.sector.slice(1);
  const categoryCards = result.insights?.category_cards || [];
  const miniReport = (result.insights?.mini_report || {}) as any;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Result Badge */}
        <div ref={badgeRef} className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full mb-4 ${
            result.pass_fail 
              ? 'bg-gradient-to-br from-green-400 to-green-600' 
              : 'bg-gradient-to-br from-orange-400 to-orange-600'
          } shadow-2xl`}>
            {result.pass_fail ? (
              <CheckCircle className="h-16 w-16 text-white" />
            ) : (
              <XCircle className="h-16 w-16 text-white" />
            )}
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {result.pass_fail ? '✅ CERTIFIED!' : '📊 Results'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {sectorName} Professional Certification
          </p>
          {result.high_performer && (
            <div className="inline-block mt-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-full text-sm font-bold shadow-lg">
              🌟 HIGH PERFORMER
            </div>
          )}
        </div>

        {/* Overall Score Card */}
        <Card className="p-8 mb-6 text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Score</p>
          <p className="text-6xl font-bold text-primary mb-2">{result.total_score}%</p>
          <p className="text-lg text-muted-foreground">
            {result.pass_fail 
              ? 'You demonstrated professional readiness!' 
              : 'Keep developing your skills'}
          </p>
        </Card>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {categoryCards.map((card: any, index: number) => (
            <CategoryCard
              key={card.category || index}
              category={card.category}
              score={result.category_scores[card.category]}
              summary={card.summary}
              nextStep={card.next_step}
            />
          ))}
        </div>

        {/* Strengths & Focus Areas */}
        {(result.strengths.length > 0 || result.focus_areas.length > 0) && (
          <StrengthsFocusCard 
            strengths={result.strengths}
            focusAreas={result.focus_areas}
          />
        )}

        {/* Mini Report */}
        {miniReport.overall && (
          <Card className="p-8 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Professional Readiness Report
            </h3>
            <div className="space-y-4 leading-relaxed">
              <p>{miniReport.overall}</p>
              <p>{miniReport.categories}</p>
              <p>{miniReport.forward}</p>
            </div>
          </Card>
        )}

        {/* Certification Details */}
        {certification && (
          <Card className="p-6 mb-6 bg-primary/5">
            <h4 className="font-bold mb-3">🏆 Certification Details</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Level:</strong> {(certification.level as any) === 'high_performer' ? 'High Performer' : 'Standard'}</p>
              <p><strong>Verification Code:</strong> <code className="bg-background px-2 py-1 rounded">{certification.verification_code}</code></p>
              <p><strong>Issued:</strong> {new Date(certification.date_issued).toLocaleDateString()}</p>
            </div>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          {answers.length > 0 && (
            <Button onClick={() => setShowReview(true)} variant="outline" className="flex-1" size="lg">
              📝 Review Your Answers
            </Button>
          )}
          {result.pass_fail && certification && (
            <CertificateDownloadButton
              result={result}
              certification={certification}
              userId={userId}
            />
          )}
          <Button 
            onClick={() => navigate('/certification')}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Review Drawer */}
      {showReview && (
        <ReviewDrawer
          answers={answers}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}
