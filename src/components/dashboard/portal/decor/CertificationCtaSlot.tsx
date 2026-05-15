import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { BrandImageSlot } from "./BrandImageSlot";

interface CertificationCtaSlotProps {
  src?: string;
}

/**
 * Persistent dashboard CTA: shown only to users who have NOT yet
 * passed any certification exam. Drives them into /certification.
 */
export function CertificationCtaSlot({ src }: CertificationCtaSlotProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<"loading" | "show" | "hide">("loading");

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setState("hide");
      return;
    }
    (async () => {
      const { count } = await supabase
        .from("cert_results")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("pass_fail", true);
      if (!active) return;
      setState((count ?? 0) > 0 ? "hide" : "show");
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  if (state !== "show") return null;

  return (
    <BrandImageSlot
      aspect="wide"
      placement="image-right"
      tone="accent"
      eyebrow="Certify yourself"
      headline="Pass one exam. Show up everywhere employers look."
      body="Curaçao employers only see verified candidates. The Lansa certification is your way in — and unlocks live job applications too."
      cta={{ label: "Start your certification", onClick: () => navigate("/certification") }}
      src={src}
      alt="Become certified — Lansa"
    />
  );
}