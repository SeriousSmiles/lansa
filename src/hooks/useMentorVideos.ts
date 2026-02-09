import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { ContentVideo, ContentVideoInsert } from "@/hooks/useContentVideos";

export function useMentorVideos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mentor-videos", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("content_videos")
        .select("*")
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContentVideo[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateMentorVideo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (video: Omit<ContentVideoInsert, "mentor_id">) => {
      if (!user?.id) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("content_videos")
        .insert({ ...video, mentor_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-videos"] });
      queryClient.invalidateQueries({ queryKey: ["content-videos"] });
      toast.success("Video added successfully");
    },
    onError: (error: Error) => {
      if (error.message.includes("row-level security")) {
        toast.error("You've reached your video upload limit. Upgrade your tier for more.");
      } else {
        toast.error("Failed to add video: " + error.message);
      }
    },
  });
}

export function useUpdateMentorVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentVideo> & { id: string }) => {
      const { data, error } = await supabase
        .from("content_videos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-videos"] });
      queryClient.invalidateQueries({ queryKey: ["content-videos"] });
      toast.success("Video updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update video: " + error.message);
    },
  });
}

export function useDeleteMentorVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("content_videos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentor-videos"] });
      queryClient.invalidateQueries({ queryKey: ["content-videos"] });
      toast.success("Video deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete video: " + error.message);
    },
  });
}
