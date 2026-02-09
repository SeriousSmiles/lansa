import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ContentVideo {
  id: string;
  title: string;
  description: string | null;
  source_type: "youtube" | "native";
  youtube_url: string | null;
  storage_path: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  education_type: string | null;
  transformation_promise: string | null;
  category: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ContentVideoInsert = Omit<ContentVideo, "id" | "created_at" | "updated_at">;

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "Unknown";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins} min ${secs}s` : `${mins} min`;
}

export function usePublishedVideos() {
  return useQuery({
    queryKey: ["content-videos", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_videos")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContentVideo[];
    },
  });
}

export function useAllVideos() {
  return useQuery({
    queryKey: ["content-videos", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_videos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContentVideo[];
    },
  });
}

export function useCreateVideo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (video: ContentVideoInsert) => {
      const { data, error } = await supabase
        .from("content_videos")
        .insert(video)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-videos"] });
      toast.success("Video added successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to add video: " + error.message);
    },
  });
}

export function useUpdateVideo() {
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
      queryClient.invalidateQueries({ queryKey: ["content-videos"] });
      toast.success("Video updated");
    },
    onError: (error: Error) => {
      toast.error("Failed to update video: " + error.message);
    },
  });
}

export function useDeleteVideo() {
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
      queryClient.invalidateQueries({ queryKey: ["content-videos"] });
      toast.success("Video deleted");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete video: " + error.message);
    },
  });
}

export function useTogglePublish() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("content_videos")
        .update({ is_published })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-videos"] });
    },
  });
}
