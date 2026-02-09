
-- Create enum for video source type
CREATE TYPE public.video_source_type AS ENUM ('youtube', 'native');

-- Create content_videos table
CREATE TABLE public.content_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  source_type video_source_type NOT NULL DEFAULT 'youtube',
  youtube_url TEXT,
  storage_path TEXT,
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  education_type TEXT,
  transformation_promise TEXT,
  category TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.content_videos ENABLE ROW LEVEL SECURITY;

-- Published videos readable by all authenticated users
CREATE POLICY "Authenticated users can view published videos"
ON public.content_videos
FOR SELECT
TO authenticated
USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage all videos"
ON public.content_videos
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_content_videos_updated_at
BEFORE UPDATE ON public.content_videos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for native video uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('content-videos', 'content-videos', true);

-- Storage policies for content-videos bucket
CREATE POLICY "Anyone can view content videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'content-videos');

CREATE POLICY "Admins can upload content videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'content-videos' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'content-videos' AND public.has_role(auth.uid(), 'admin'));
