-- Create user_stories table for storing AI-generated stories
CREATE TABLE public.user_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_type TEXT NOT NULL CHECK (story_type IN ('origin', 'elevator_pitch', 'bio', 'interview')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_stories ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own stories" 
ON public.user_stories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stories" 
ON public.user_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories" 
ON public.user_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories" 
ON public.user_stories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_stories_updated_at
BEFORE UPDATE ON public.user_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();