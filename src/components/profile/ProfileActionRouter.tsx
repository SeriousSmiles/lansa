import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/UnifiedAuthProvider";
import { toast } from "sonner";

/**
 * Reads `?action=<step.key>` from the URL when the Profile page loads.
 * - Scrolls to the matching `[data-completion-step~="<key>"]` anchor.
 * - Dispatches `lansa:profile-action` so the matching editor opens itself.
 * - Handles two special cases inline (no editor listener needed):
 *     - `visibility_on`   → flips user_profiles.visible_to_employers
 *     - `onboarding_done` → routes to /onboarding
 * - Strips the query param afterwards so it does not re-fire.
 */
export function ProfileActionRouter() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const handled = useRef<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (!action) return;
    if (handled.current === action) return;
    handled.current = action;

    const clearParam = () => {
      params.delete("action");
      const next = params.toString();
      navigate(
        { pathname: location.pathname, search: next ? `?${next}` : "" },
        { replace: true }
      );
    };

    // Special: onboarding — go to /onboarding immediately.
    if (action === "onboarding_done") {
      clearParam();
      navigate("/onboarding");
      return;
    }

    // Special: visibility — flip the flag, toast, do not dispatch.
    if (action === "visibility_on") {
      (async () => {
        if (!user?.id) return;
        const { error } = await supabase
          .from("user_profiles")
          .update({ visible_to_employers: true })
          .eq("user_id", user.id);
        if (error) {
          toast.error("Could not update visibility. Please try again.");
        } else {
          toast.success("You're now visible to employers.");
        }
      })();
      clearParam();
      return;
    }

    // Default: scroll to the anchor, then dispatch the event one frame later
    // so the target component has mounted its state handlers.
    const tryScroll = () => {
      const el = document.querySelector(
        `[data-completion-step~="${action}"]`
      ) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      // Dispatch even if scroll target is missing — the listener may live
      // inside a deep child whose container did not carry the attribute.
      window.dispatchEvent(
        new CustomEvent("lansa:profile-action", { detail: { key: action } })
      );
      clearParam();
    };

    // Defer to next frame so the page has painted.
    const raf = requestAnimationFrame(() => {
      // Small extra timeout for editors that mount async (e.g. profile data still loading).
      setTimeout(tryScroll, 120);
    });
    return () => cancelAnimationFrame(raf);
  }, [location.search, location.pathname, navigate, user?.id]);

  return null;
}