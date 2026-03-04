import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CertificationDashboard from "@/components/certification/CertificationDashboard";
import ExamFlow from "@/components/certification/ExamFlow";
import ReflectionReport from "@/components/certification/ReflectionReport";
import { Loader2 } from "lucide-react";

export default function Certification() {
  const { sector, resultId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/');
      return;
    }
    setUserId(user.id);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show result page if resultId is present
  if (resultId) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
        <ReflectionReport resultId={resultId} userId={userId!} />
      </div>
    );
  }

  // Show exam flow if sector is selected
  if (sector) {
    return <ExamFlow sector={sector as any} userId={userId!} />;
  }

  // Show dashboard
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
      <CertificationDashboard userId={userId!} />
    </div>
  );
}
