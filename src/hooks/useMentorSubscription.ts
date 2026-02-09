import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type SubscriptionTier = "free" | "starter" | "pro";

export interface MentorSubscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  price_xcg: number;
  started_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export const TIER_CONFIG = {
  free: { label: "Free", price: 0, maxVideos: 1, externalLink: false, promoted: false },
  starter: { label: "Starter", price: 30, maxVideos: 3, externalLink: true, promoted: false },
  pro: { label: "Pro", price: 75, maxVideos: Infinity, externalLink: true, promoted: true },
} as const;

export function useMentorSubscription(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["mentor-subscription", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from("mentor_subscriptions")
        .select("*")
        .eq("user_id", targetId)
        .eq("is_active", true)
        .maybeSingle();
      if (error) throw error;
      return data as MentorSubscription | null;
    },
    enabled: !!targetId,
  });
}

export function useCreateMentorSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sub: {
      user_id: string;
      tier: SubscriptionTier;
      price_xcg: number;
    }) => {
      const { data, error } = await supabase
        .from("mentor_subscriptions")
        .insert(sub)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mentor-subscription", data.user_id] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create subscription: " + error.message);
    },
  });
}
