import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award, Download, TrendingUp, CheckCircle, XCircle, Loader2 } from "lucide-react";
import gsap from "gsap";

interface ResultPageProps {
  resultId: string;
  userId: string;
}

interface Result {
  id: string;
  sector: string;
  total_score: number;
  category_scores: Record<string, number>;
  pass_fail: boolean;
  ai_summary_text: string;
  created_at: string;
}

interface Certification {
  verification_code: string;
  level: string;
  date_issued: string;
}

export default function ResultPage({ resultId, userId }: ResultPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<Result | null>(null);
  const [certification, setCertification] = useState<Certification | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadResult();
  }, [resultId]);

  useEffect(() => {
    if (result && badgeRef.current) {
      // Animate badge reveal
      gsap.fromTo(badgeRef.current,
        { scale: 0, rotation: -180, opacity: 0 },
        { 
          scale: 1, 
          rotation: 0, 
          opacity: 1, 
          duration: 1, 
          ease: 'elastic.out(1, 0.5)',
          delay: 0.3 
        }
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
      category_scores: resultData.category_scores as Record<string, number>
    });

    // Load certification if passed
    if (resultData.pass_fail) {
      const { data: certData } = await supabase
        .from('cert_certifications')
        .select('*')
        .eq('result_id', resultId)
        .single();

      setCertification(certData);
    }

    setLoading(false);
  };

  const handleDownloadCertificate = () => {
    // TODO: Implement certificate PDF generation
    alert('Certificate download coming soon!');
  };

  const getCategoryLabel = (key: string) => {
    const labels: Record<string, string> = {
      mindset: 'Mindset (Accountability)',
      workplace_intelligence: 'Workplace Intelligence',
      performance_habits: 'Performance Habits',
      applied_thinking: 'Applied Thinking',
    };
    return labels[key] || key;
  };

  const getLowestCategory = () => {
    if (!result) return null;
    const entries = Object.entries(result.category_scores);
    const lowest = entries.reduce((min, [key, val]) => val < min[1] ? [key, val] : min, entries[0]);
    return { category: getCategoryLabel(lowest[0]), score: lowest[1] };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!result) return null;

  const lowest = getLowestCategory();
  const sectorName = result.sector.charAt(0).toUpperCase() + result.sector.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
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
        </div>

        {/* Main Result Card */}
        <Card className="p-8 mb-6">
          {/* Score */}
          <div className="text-center mb-8 pb-8 border-b">
            <p className="text-sm font-medium text-muted-foreground mb-2">Total Score</p>
            <p className="text-6xl font-bold text-primary mb-2">{result.total_score}%</p>
            <p className="text-lg text-muted-foreground">
              {result.pass_fail 
                ? 'You demonstrated professional readiness!' 
                : 'Keep developing your skills'}
            </p>
          </div>

          {/* Category Scores */}
          <div className="mb-8 pb-8 border-b">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Category Breakdown
            </h3>
            <div className="space-y-4">
              {Object.entries(result.category_scores).map(([key, score]) => (
                <div key={key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{getCategoryLabel(key)}</span>
                    <span className="text-lg font-bold text-primary">{score}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="mb-8 pb-8 border-b">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              🪞 Professional Mirror Summary
            </h3>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="leading-relaxed whitespace-pre-line">
                {result.ai_summary_text || 'Generating summary...'}
              </p>
            </div>
          </div>

          {/* Improvement Suggestion */}
          {lowest && (
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6 mb-6">
              <h4 className="font-bold text-orange-900 dark:text-orange-400 mb-2">
                💡 Focus Area
              </h4>
              <p className="text-orange-800 dark:text-orange-300">
                Your lowest score was in <strong>{lowest.category}</strong> ({lowest.score}%). 
                Consider reviewing this area to strengthen your overall professional readiness.
              </p>
            </div>
          )}

          {/* Certification Info */}
          {certification && (
            <div className="bg-primary/5 rounded-lg p-6 mb-6">
              <h4 className="font-bold mb-3">🏆 Certification Details</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Level:</strong> {certification.level === 'high_performer' ? 'High Performer' : 'Standard'}</p>
                <p><strong>Verification Code:</strong> <code className="bg-background px-2 py-1 rounded">{certification.verification_code}</code></p>
                <p><strong>Issued:</strong> {new Date(certification.date_issued).toLocaleDateString()}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {result.pass_fail && (
              <Button onClick={handleDownloadCertificate} className="flex-1" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
            )}
            <Button 
              onClick={() => navigate('/certification')}
              variant={result.pass_fail ? 'outline' : 'primary'}
              className="flex-1"
              size="lg"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
