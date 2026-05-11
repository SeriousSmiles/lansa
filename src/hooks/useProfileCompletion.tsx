import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProfileCompletionStep {
  key: string;
  label: string;
  weight: number;
  cta_route: string;
}

export interface ProfileCompletion {
  score: number;
  is_complete: boolean;
  missing_steps: ProfileCompletionStep[];
  nudge_paused: boolean;
  last_nudge_sent_at: string | null;
  loading: boolean;
}

const DISMISS_KEY = (uid: string) => `lansa:completion_dismissed_until:${uid}`;

export function useProfileCompletion(userId: string | undefined) {
  const [state, setState] = useState<ProfileCompletion>({
    score: 0,
    is_complete: false,
    missing_steps: [],
    nudge_paused: false,
    last_nudge_sent_at: null,
    loading: true,
  });

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("profile_completion_state")
      .select("score, is_complete, missing_steps, nudge_paused, last_nudge_sent_at")
      .eq("user_id", userId)
      .maybeSingle();
    setState({
      score: data?.score ?? 0,
      is_complete: !!data?.is_complete,
      missing_steps: Array.isArray(data?.missing_steps)
        ? (data!.missing_steps as unknown as ProfileCompletionStep[])
        : [],
      nudge_paused: !!data?.nudge_paused,
      last_nudge_sent_at: data?.last_nudge_sent_at ?? null,
      loading: false,
    });
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const dismissedUntil = userId ? localStorage.getItem(DISMISS_KEY(userId)) : null;
  const dismissedActive = dismissedUntil ? new Date(dismissedUntil) > new Date() : false;

  const dismissForToday = () => {
    if (!userId) return;
    const until = new Date();
    until.setHours(until.getHours() + 24);
    localStorage.setItem(DISMISS_KEY(userId), until.toISOString());
  };

  return { ...state, dismissedActive, dismissForToday, refresh: load };
}