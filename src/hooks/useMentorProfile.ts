import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface MentorProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  mentor_type: "teacher" | "coach" | "organization";
  external_url: string | null;
  profile_image: string | null;
  approval_status: "pending" | "approved" | "rejected";
  rejected_reason: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useMentorProfile(userId?: string) {
  const { user } = useAuth();
  const targetId = userId || user?.id;

  return useQuery({
    queryKey: ["mentor-profile", targetId],
    queryFn: async () => {
      if (!targetId) return null;
      const { data, error } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("user_id", targetId)
        .maybeSingle();
      if (error) throw error;
      return data as MentorProfile | null;
    },
    enabled: !!targetId,
  });
}

export function useCreateMentorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: {
      user_id: string;
      display_name: string;
      bio?: string;
      mentor_type: "teacher" | "coach" | "organization";
      external_url?: string;
      profile_image?: string;
    }) => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .insert(profile)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mentor-profile", data.user_id] });
    },
    onError: (error: Error) => {
      toast.error("Failed to create mentor profile: " + error.message);
    },
  });
}

export function useUpdateMentorProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      ...updates
    }: Partial<MentorProfile> & { userId: string }) => {
      const { data, error } = await supabase
        .from("mentor_profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["mentor-profile", data.user_id] });
      toast.success("Profile updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update profile: " + error.message);
    },
  });
}
