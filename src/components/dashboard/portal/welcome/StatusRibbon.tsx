import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Eye, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useDashboardPanel } from "../useDashboardPanel";
import { cn } from "@/lib/utils";

interface ChipState {
  label: string;
  value: string;
  status: "good" | "warn" | "muted";
  icon: React.ElementType;
  onClick: () => void;
}

export function StatusRibbon() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { openPanel } = useDashboardPanel();
  const [completeness, setCompleteness] = useState<number>(0);
  const [certified, setCertified] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    let mounted = true;
    (async () => {
      const [{ data: profile }, { data: cert }] = await Promise.all([
        supabase
          .from("user_profiles")
          .select(
            "name,title,about_text,profile_image,skills,experiences,education,visible_to_employers"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("user_certifications")
          .select("lansa_certified,verified")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (!mounted) return;

      if (profile) {
        const checks = [
          !!profile.name,
          !!profile.title,
          !!profile.about_text,
          !!profile.profile_image,
          Array.isArray(profile.skills) && profile.skills.length > 0,
          Array.isArray(profile.experiences) && profile.experiences.length > 0,
          Array.isArray(profile.education) && profile.education.length > 0,
        ];
        const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
        setCompleteness(score);
        setVisible(!!profile.visible_to_employers);
      }
      setCertified(!!(cert?.lansa_certified && cert?.verified));
      setLoaded(true);
    })();
    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const chips: ChipState[] = [
    {
      label: "Profile",
      value: loaded ? `${completeness}% complete` : "Loading…",
      status: completeness >= 80 ? "good" : completeness >= 50 ? "warn" : "muted",
      icon: CheckCircle2,
      onClick: () => navigate("/profile"),
    },
    {
      label: "Certification",
      value: certified ? "Verified" : "Not certified",
      status: certified ? "good" : "muted",
      icon: ShieldCheck,
      onClick: () => navigate("/certification"),
    },
    {
      label: "Visibility",
      value: visible ? "Listed to employers" : "Hidden",
      status: visible ? "good" : "warn",
      icon: Eye,
      onClick: () => openPanel("insights"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-6">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={chip.onClick}
          className={cn(
            "group flex items-center gap-3 rounded-2xl border border-border/40 bg-card/70 backdrop-blur-sm px-4 py-3 text-left transition-all hover:border-primary/40 hover:bg-card hover:-translate-y-0.5"
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl shrink-0",
              chip.status === "good" && "bg-primary/12 text-primary",
              chip.status === "warn" && "bg-amber-500/12 text-amber-600",
              chip.status === "muted" && "bg-muted text-muted-foreground"
            )}
          >
            <chip.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-medium">
              {chip.label}
            </div>
            <div className="text-sm font-semibold text-foreground truncate">
              {chip.value}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-hover:translate-x-0.5" />
        </button>
      ))}
    </div>
  );
}