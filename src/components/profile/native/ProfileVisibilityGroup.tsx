import { useEffect, useState } from "react";
import { Eye, Link2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VisibilityState { isPublic: boolean; visibleToEmployers: boolean }

/** Existing two visibility fields: share link (is_public) and employer discovery (visible_to_employers). */
export function ProfileVisibilityGroup({ userId, onChange }: { userId?: string; onChange?: (v: VisibilityState) => void }) {
  const [v, setV] = useState<VisibilityState | null>(null);
  const [saving, setSaving] = useState<keyof VisibilityState | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) return;
    supabase.from("user_profiles").select("is_public, visible_to_employers").eq("user_id", userId).maybeSingle().then(({ data, error }) => {
      if (error) { setError(true); return; }
      const next = { isPublic: !!data?.is_public, visibleToEmployers: !!data?.visible_to_employers };
      setV(next); onChange?.(next);
    });
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = async (key: keyof VisibilityState, value: boolean) => {
    if (!userId || !v) return;
    setSaving(key);
    const column = key === "isPublic" ? "is_public" : "visible_to_employers";
    const { error } = await supabase.from("user_profiles").update({ [column]: value }).eq("user_id", userId);
    setSaving(null);
    if (error) { toast.error("Couldn't save that setting. Try again."); return; }
    const next = { ...v, [key]: value }; setV(next); onChange?.(next);
    toast.success(key === "isPublic" ? (value ? "Share link turned on." : "Share link turned off.") : (value ? "You can appear to employers." : "Hidden from employer discovery."));
  };

  const row = (key: keyof VisibilityState, Icon: typeof Eye, label: string, detail: string) => (
    <label className="ee-row cursor-pointer">
      <span className="ee-row-icon"><Icon size={18} aria-hidden /></span>
      <span className="ee-row-text"><span className="ee-row-label">{label}</span><span className="ee-row-detail">{detail}</span></span>
      <Switch checked={!!v?.[key]} disabled={!v || saving !== null} onCheckedChange={(c) => set(key, c)} aria-label={label} />
    </label>
  );

  return (
    <section aria-label="Visibility & sharing" data-completion-step="visibility_on">
      <h2 className="ee-section-label">Visibility & sharing</h2>
      <div className="ee-group">
        {error ? <p className="p-4 text-sm text-destructive" role="alert">Visibility settings didn't load.</p> : <>
          {row("visibleToEmployers", Eye, "Appear to employers", "Certified, verified profiles can show in employer discovery")}
          {row("isPublic", Link2, "Shareable link", "Anyone with your link can view your profile")}
        </>}
      </div>
    </section>
  );
}
