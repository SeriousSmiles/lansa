import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Briefcase, Users, Wrench, Monitor, Award, TrendingUp, ArrowLeft } from "lucide-react";
import gsap from "gsap";
import { PaymentModal } from "./PaymentModal";

interface SectorProgress {
  sector: string;
  lastScore: number | null;
  passed: boolean;
  lastAttempt: string | null;
}

interface CertificationDashboardProps {
  userId: string;
}

const SECTORS = [
  { 
    id: 'office', 
    name: 'Office Professional', 
    icon: Briefcase,
    gradient: 'from-blue-500 to-blue-700',
    description: 'Administrative & coordination skills'
  },
  { 
    id: 'service', 
    name: 'Service Professional', 
    icon: Users,
    gradient: 'from-green-500 to-green-700',
    description: 'Customer-facing & hospitality skills'
  },
  { 
    id: 'technical', 
    name: 'Technical Professional', 
    icon: Wrench,
    gradient: 'from-orange-500 to-orange-700',
    description: 'Hands-on & technical skills'
  },
  { 
    id: 'digital', 
    name: 'Digital Professional', 
    icon: Monitor,
    gradient: 'from-purple-500 to-purple-700',
    description: 'Tech & digital skills'
  },
];

export default function CertificationDashboard({ userId }: CertificationDashboardProps) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, SectorProgress>>({});
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; sectorId: string; sectorName: string }>({
    open: false, sectorId: '', sectorName: ''
  });

  useEffect(() => {
    loadProgress();
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.sector-card', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [loading]);

  const loadProgress = async () => {
    const { data: results } = await supabase
      .from('cert_results')
      .select('sector, total_score, pass_fail, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const progressMap: Record<string, SectorProgress> = {};
    
    SECTORS.forEach(s => {
      const sectorResults = results?.filter(r => r.sector === s.id);
      const latest = sectorResults?.[0];
      
      progressMap[s.id] = {
        sector: s.id,
        lastScore: latest?.total_score || null,
        passed: latest?.pass_fail || false,
        lastAttempt: latest?.created_at || null,
      };
    });

    setProgress(progressMap);
    setLoading(false);
  };

  const handleStartExam = async (sectorId: string) => {
    const sector = SECTORS.find(s => s.id === sectorId);
    // Show payment modal - in test mode (no Sentoo key), payment auto-completes
    setPaymentModal({ open: true, sectorId, sectorName: sector?.name || sectorId });
  };

  const handlePaymentComplete = () => {
    navigate(`/certification/${paymentModal.sectorId}`);
  };

  const getProgressRing = (score: number | null) => {
    if (!score) return 0;
    return (score / 100) * 283; // 283 is circumference of circle with r=45
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <Award className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Lansa Certification
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prove your professional readiness. Get certified in your sector and stand out to employers.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Certifications Earned</p>
                <p className="text-2xl font-bold">
                  {Object.values(progress).filter(p => p.passed).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Highest Score</p>
                <p className="text-2xl font-bold">
                  {Math.max(...Object.values(progress).map(p => p.lastScore || 0), 0).toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <Briefcase className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available Exams</p>
                <p className="text-2xl font-bold">{SECTORS.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Sector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SECTORS.map((sector) => {
            const Icon = sector.icon;
            const prog = progress[sector.id];
            const progressStroke = getProgressRing(prog?.lastScore || null);

            return (
              <Card 
                key={sector.id}
                className="sector-card relative overflow-hidden p-8 hover:shadow-2xl transition-all duration-300"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sector.gradient} opacity-5`} />
                
                <div className="relative z-10">
                  {/* Icon and Title */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className="h-8 w-8 text-primary" />
                        <h3 className="text-2xl font-bold">{sector.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{sector.description}</p>
                    </div>

                    {/* Progress Ring */}
                    <div className="relative w-20 h-20">
                      <svg className="transform -rotate-90 w-20 h-20">
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-muted"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="36"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray="283"
                          strokeDashoffset={283 - progressStroke}
                          className="text-primary transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {prog?.lastScore ? `${prog.lastScore.toFixed(0)}%` : '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  {prog?.lastScore && (
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                      prog.passed 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}>
                      {prog.passed ? '✓ Certified' : 'Try Again'}
                    </div>
                  )}

                  {/* CTA Button */}
                  <Button 
                    onClick={() => handleStartExam(sector.id)}
                    className="w-full"
                    size="lg"
                  >
                    {prog?.lastScore ? 'Retake Exam' : 'Start Exam'}
                  </Button>

                  {prog?.lastAttempt && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Last attempt: {new Date(prog.lastAttempt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <Card className="mt-12 p-8 text-center bg-gradient-to-r from-primary/10 to-accent/10">
          <h3 className="text-2xl font-bold mb-3">Ready to Stand Out?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Complete your certification and share your verified professional readiness with employers across the Caribbean.
          </p>
        </Card>

        {/* Payment Modal */}
        <PaymentModal
          open={paymentModal.open}
          onOpenChange={(open) => setPaymentModal(prev => ({ ...prev, open }))}
          sector={paymentModal.sectorId}
          sectorName={paymentModal.sectorName}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </div>
  );
}
