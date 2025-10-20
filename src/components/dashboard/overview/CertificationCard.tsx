import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Award, TrendingUp, Loader2, CheckCircle } from "lucide-react";

export function CertificationCard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [latestResult, setLatestResult] = useState<any>(null);

  useEffect(() => {
    if (user?.id) {
      loadCertificationStatus();
    }
  }, [user?.id]);

  const loadCertificationStatus = async () => {
    try {
      // Check certifications
      const { data: certs } = await supabase
        .from('cert_certifications')
        .select('sector, level, date_issued')
        .eq('user_id', user?.id)
        .order('date_issued', { ascending: false });

      setCertifications(certs || []);

      // Get latest result
      const { data: result } = await supabase
        .from('cert_results')
        .select('sector, total_score, pass_fail, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setLatestResult(result);
    } catch (error) {
      console.error('Error loading certification status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const totalCerts = certifications.length;
  const hasCertifications = totalCerts > 0;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
              hasCertifications 
                ? 'bg-gradient-to-br from-green-400 to-green-600' 
                : 'bg-gradient-to-br from-primary to-accent'
            }`}>
              {hasCertifications ? (
                <CheckCircle className="h-6 w-6 text-white" />
              ) : (
                <Award className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {hasCertifications ? 'Professional Certifications' : 'Get Certified'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {hasCertifications 
                  ? `${totalCerts} sector${totalCerts > 1 ? 's' : ''} certified`
                  : 'Prove your professional readiness'
                }
              </p>
            </div>
          </div>
        </div>

        {hasCertifications ? (
          <div className="space-y-3">
            {/* Latest Score Display */}
            {latestResult && (
              <div className="bg-muted/50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Latest Score</p>
                  <p className="text-sm font-medium">
                    {latestResult.sector.charAt(0).toUpperCase() + latestResult.sector.slice(1)} - {latestResult.total_score}%
                  </p>
                </div>
                <TrendingUp className={`h-5 w-5 ${
                  latestResult.pass_fail ? 'text-green-500' : 'text-orange-500'
                }`} />
              </div>
            )}

            {/* Certified Sectors */}
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                >
                  <CheckCircle className="h-3 w-3" />
                  {cert.sector.charAt(0).toUpperCase() + cert.sector.slice(1)}
                </span>
              ))}
            </div>

            <Button 
              onClick={() => navigate('/certification')}
              variant="outline"
              className="w-full"
            >
              View Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Complete sector-specific exams to earn professional certifications that employers can verify.
            </p>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>AI-powered feedback</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>4 key pillars</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Instant results</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Public verification</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/certification')}
              className="w-full"
            >
              Start Your First Exam
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
