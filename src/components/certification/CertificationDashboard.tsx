import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import gsap from "gsap";
import { PaymentModal } from "./PaymentModal";
import { CertResult, Certification } from "@/types/certification";
import { HubHero } from "./hub/HubHero";
import { HubStoryBand } from "./hub/HubStoryBand";
import { SectorShowcase, SECTORS, SectorProgress } from "./hub/SectorShowcase";
import { HubOutcomesBand } from "./hub/HubOutcomesBand";
import { HubClosingCta } from "./hub/HubClosingCta";

interface CertificationDashboardProps {
  userId: string;
}

export default function CertificationDashboard({ userId }: CertificationDashboardProps) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, SectorProgress>>({});
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; sectorId: string; sectorName: string }>({
    open: false,
    sectorId: "",
    sectorName: "",
  });

  useEffect(() => {
    loadProgress();
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      gsap.fromTo(
        ".sector-card",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }
      );
    }
  }, [loading]);

  const loadProgress = async () => {
    const { data: results } = await supabase
      .from('cert_results')
      .select('id, sector, total_score, pass_fail, created_at, category_scores, ai_summary_text, insights, strengths, focus_areas, session_id, per_question_reflections, high_performer')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Fetch all certifications for this user
    const { data: certifications } = await supabase
      .from('cert_certifications')
      .select('*')
      .eq('user_id', userId);

    const progressMap: Record<string, SectorProgress> = {};
    
    SECTORS.forEach(s => {
      const sectorResults = results?.filter(r => r.sector === s.id);
      const latest = sectorResults?.[0];
      const cert = certifications?.find(c => c.result_id === latest?.id) || null;

      progressMap[s.id] = {
        sector: s.id,
        resultId: latest?.id || null,
        lastScore: latest?.total_score || null,
        passed: latest?.pass_fail || false,
        lastAttempt: latest?.created_at || null,
        fullResult: latest ? {
          ...latest,
          category_scores: latest.category_scores as Record<string, number>,
          strengths: (latest.strengths || []) as string[],
          focus_areas: (latest.focus_areas || []) as string[],
          insights: (latest.insights || {}) as any,
          per_question_reflections: (Array.isArray(latest.per_question_reflections) ? latest.per_question_reflections : []) as any[],
        } as CertResult : null,
        certification: cert as any as Certification | null,
      };
    });

    setProgress(progressMap);
    setLoading(false);
  };

  const handleStartExam = (sectorId: string, sectorName: string) => {
    setPaymentModal({ open: true, sectorId, sectorName });
  };

  const handlePaymentComplete = () => {
    navigate(`/certification/${paymentModal.sectorId}`);
  };

  const certifiedCount = Object.values(progress).filter((p) => p.passed).length;
  const highestScore = Math.max(...Object.values(progress).map((p) => p.lastScore || 0), 0);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const startFirstAvailable = () => {
    const first = SECTORS.find((s) => !progress[s.id]?.passed) ?? SECTORS[0];
    handleStartExam(first.id, first.name);
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-4">
      <HubHero
        certifiedCount={certifiedCount}
        totalSectors={SECTORS.length}
        highestScore={highestScore}
        onPrimary={() => scrollTo("sectors")}
        onSecondary={() => scrollTo("how-it-works")}
      />

      <HubStoryBand />

      <SectorShowcase progress={progress} userId={userId} onStart={handleStartExam} />

      <HubOutcomesBand />

      <HubClosingCta onStart={startFirstAvailable} />

      <PaymentModal
        open={paymentModal.open}
        onOpenChange={(open) => setPaymentModal((prev) => ({ ...prev, open }))}
        paymentType="certification_exam"
        amountCents={2500}
        metadata={{ sector: paymentModal.sectorId, sectorName: paymentModal.sectorName }}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
}
