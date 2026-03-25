import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle, ChevronRight, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AICareerPlanModal } from "./AICareerPlanModal";

interface AICareerPlanCardProps {
  autoOpen?: boolean;
}

export function AICareerPlanCard({ autoOpen }: AICareerPlanCardProps) {
  const { user } = useAuth();
  const [isComplete, setIsComplete] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [powerSkillPreview, setPowerSkillPreview] = useState<string | null>(null);
  const [autoOpenHandled, setAutoOpenHandled] = useState(false);

  useEffect(() => {
    if (user?.id) checkCareerPlanStatus();
  }, [user?.id]);

  // Auto-open modal if triggered from dashboard navigation state (e.g., from profile AI prompt)
  useEffect(() => {
    if (autoOpen && !autoOpenHandled && isComplete === false) {
      setIsModalOpen(true);
      setAutoOpenHandled(true);
    }
  }, [autoOpen, autoOpenHandled, isComplete]);



  const checkCareerPlanStatus = async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('user_power_skills')
      .select('reframed_skill')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    setIsComplete(!!data);
    if (data?.reframed_skill) setPowerSkillPreview(data.reframed_skill);
  };

  const handleComplete = () => {
    setIsModalOpen(false);
    checkCareerPlanStatus();
  };

  // Still loading
  if (isComplete === null) return null;

  // Completed state — compact success card
  if (isComplete) {
    return (
      <Card className="border-border bg-card/60">
        <CardContent className="p-4 flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">AI Career Plan — Active</p>
            {powerSkillPreview && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">"{powerSkillPreview}"</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">Your AI coach is personalised. Profile AI gives tailored suggestions.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 text-xs text-muted-foreground hover:text-primary"
            onClick={() => setIsModalOpen(true)}
          >
            Review
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
          <AICareerPlanModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onComplete={handleComplete}
          />
        </CardContent>
      </Card>
    );
  }

  // Incomplete state — prominent invite card
  return (
    <>
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-card to-secondary/5 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-bold text-foreground">Activate Your Personal AI Coach</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">~5 min</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Answer 5 quick questions so your AI understands your background. Unlock personalised CV suggestions, job matching, and career guidance tailored to <em>you</em>.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setIsModalOpen(true)}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Build My Career Plan
                </Button>
                <span className="text-xs text-muted-foreground">Free · No test · No pressure</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AICareerPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onComplete={handleComplete}
      />
    </>
  );
}
