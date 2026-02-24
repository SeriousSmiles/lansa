import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap, Briefcase, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProfessionalStageSelector() {
  const { user } = useAuth();
  const [stage, setStage] = useState<string>("");
  const [originalStage, setOriginalStage] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_profiles")
      .select("professional_stage")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const value = (data as any)?.professional_stage || "";
        setStage(value);
        setOriginalStage(value);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user || stage === originalStage) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({ professional_stage: stage } as any)
        .eq("user_id", user.id);
      if (error) throw error;
      setOriginalStage(stage);
      toast.success("Professional stage updated!");
    } catch {
      toast.error("Failed to update professional stage");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = stage !== originalStage;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Professional Stage</CardTitle>
        <p className="text-sm text-muted-foreground">
          Are you a student or a working professional? This helps us match you with the right opportunities.
        </p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={stage} onValueChange={setStage} className="space-y-3">
          <div className={cn(
            "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
            stage === "student" ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
          )}>
            <RadioGroupItem value="student" id="stage_student" />
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="stage_student" className="cursor-pointer flex-1">
              <span className="font-medium">Student</span>
              <span className="block text-xs text-muted-foreground">Studying, recently graduated, or about to graduate</span>
            </Label>
          </div>
          <div className={cn(
            "flex items-center space-x-3 p-3 rounded-lg border transition-colors",
            stage === "working_professional" ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"
          )}>
            <RadioGroupItem value="working_professional" id="stage_professional" />
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="stage_professional" className="cursor-pointer flex-1">
              <span className="font-medium">Working Professional</span>
              <span className="block text-xs text-muted-foreground">Currently employed, seeking better opportunities</span>
            </Label>
          </div>
        </RadioGroup>
        {hasChanged && (
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="mt-4">
            {isSaving ? "Saving..." : "Save Change"}
            {!isSaving && <Check className="ml-1 h-4 w-4" />}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
