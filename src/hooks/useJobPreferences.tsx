import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface JobPreferences {
  categories: string[];
  job_types: string[];
  is_remote_preferred: boolean;
  filtering_mode: 'strict' | 'lite';
}

export function useJobPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<JobPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCertified, setIsCertified] = useState(false);
  const [showPreferenceSetup, setShowPreferenceSetup] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkCertificationAndPreferences();
    }
  }, [user?.id]);

  const checkCertificationAndPreferences = async () => {
    if (!user?.id) return;

    try {
      // Check certification
      const { data: certData } = await supabase
        .from('user_certifications')
        .select('lansa_certified, verified')
        .eq('user_id', user.id)
        .maybeSingle();

      const certified = certData?.lansa_certified && certData?.verified;
      setIsCertified(certified);

      if (!certified) {
        setLoading(false);
        return;
      }

      // Check if preferences exist
      const { data: prefData, error } = await supabase
        .from('user_job_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (prefData) {
        setPreferences({
          categories: prefData.categories || [],
          job_types: prefData.job_types || [],
          is_remote_preferred: prefData.is_remote_preferred || false,
          filtering_mode: (prefData.filtering_mode as 'strict' | 'lite') || 'lite'
        });
      } else if (certified) {
        // Certified but no preferences set - show setup modal
        setShowPreferenceSetup(true);
      }
    } catch (error) {
      console.error('Error checking preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPreferences = () => {
    checkCertificationAndPreferences();
  };

  return {
    preferences,
    loading,
    isCertified,
    showPreferenceSetup,
    setShowPreferenceSetup,
    refreshPreferences
  };
}
