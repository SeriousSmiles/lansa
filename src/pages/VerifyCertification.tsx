import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, Calendar, User, Briefcase, Loader2, XCircle } from "lucide-react";

interface CertificationData {
  user_id: string;
  sector: string;
  level: string;
  date_issued: string;
  result: {
    total_score: number;
    category_scores: Record<string, number>;
    ai_summary_text: string;
  };
  profile: {
    name: string;
    title: string;
  };
}

export default function VerifyCertification() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cert, setCert] = useState<CertificationData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (code) {
      verifyCertification(code);
    }
  }, [code]);

  const verifyCertification = async (verificationCode: string) => {
    try {
      // Fetch certification
      const { data: certData, error: certError } = await supabase
        .from('cert_certifications')
        .select(`
          user_id,
          sector,
          level,
          date_issued,
          result:cert_results (
            total_score,
            category_scores,
            ai_summary_text
          )
        `)
        .eq('verification_code', verificationCode)
        .single();

      if (certError || !certData) {
        setError(true);
        setLoading(false);
        return;
      }

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('name, title')
        .eq('user_id', certData.user_id)
        .single();

      setCert({
        ...certData,
        result: {
          ...certData.result,
          category_scores: certData.result.category_scores as Record<string, number>
        },
        profile: profileData || { name: 'Certified Professional', title: '' }
      });

      setLoading(false);
    } catch (err) {
      console.error('Verification error:', err);
      setError(true);
      setLoading(false);
    }
  };

  const getCategoryLabel = (key: string) => {
    const labels: Record<string, string> = {
      mindset: 'Mindset',
      workplace_intelligence: 'Intelligence',
      performance_habits: 'Habits',
      applied_thinking: 'Applied',
    };
    return labels[key] || key;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Invalid Verification Code</h2>
          <p className="text-muted-foreground mb-6">
            The certification code you entered could not be verified. Please check the code and try again.
          </p>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const sectorName = cert.sector.charAt(0).toUpperCase() + cert.sector.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-4 shadow-xl">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">✓ Verified Certification</h1>
          <p className="text-lg text-muted-foreground">Lansa Professional Certification</p>
        </div>

        {/* Main Card */}
        <Card className="p-8 md:p-12">
          {/* Candidate Info */}
          <div className="border-b pb-6 mb-6">
            <div className="flex items-start gap-4 mb-4">
              <User className="h-6 w-6 text-primary mt-1" />
              <div>
                <h2 className="text-2xl font-bold mb-1">{cert.profile.name}</h2>
                {cert.profile.title && (
                  <p className="text-lg text-muted-foreground">{cert.profile.title}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{sectorName} Professional</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {cert.level === 'high_performer' ? 'High Performer' : 'Certified'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  Issued {new Date(cert.date_issued).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="border-b pb-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Performance Scores</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(cert.result.category_scores).map(([key, score]) => (
                <div key={key} className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{score}</div>
                  <div className="text-sm text-muted-foreground">{getCategoryLabel(key)}</div>
                </div>
              ))}
            </div>
            <div className="text-center pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-1">Overall Score</div>
              <div className="text-4xl font-bold text-primary">{cert.result.total_score}%</div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">🪞 Professional Assessment</h3>
            <div className="bg-muted/50 rounded-lg p-6">
              <p className="leading-relaxed whitespace-pre-line">
                {cert.result.ai_summary_text || 'This candidate has completed Lansa professional certification.'}
              </p>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="bg-primary/5 rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              This certification is verified by Lansa
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              Code: {code}
            </p>
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Want to get certified yourself?
          </p>
          <Button onClick={() => navigate('/certification')}>
            Start Your Certification
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
