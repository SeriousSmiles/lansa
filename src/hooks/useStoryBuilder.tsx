import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface StoryResponses {
  origin?: string;
  motivation?: string;
  pivotal?: string;
  vision?: string;
}

export interface UserStory {
  id: string;
  story_type: string;
  title: string;
  content: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  is_active: boolean;
}

export interface StoryGenerationOptions {
  formatType?: 'origin' | 'elevator_pitch' | 'bio' | 'interview';
  tone?: 'professional' | 'conversational' | 'creative';
}

export const useStoryBuilder = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch user context data from multiple tables
  const fetchUserContext = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Get user profile
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user answers/onboarding data
      const { data: answers } = await supabase
        .from('user_answers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      return {
        user_id: user.id,
        name: profile?.name || 'Professional',
        title: profile?.title,
        about_text: profile?.about_text,
        career_path: answers?.career_path,
        identity: answers?.identity,
        desired_outcome: answers?.desired_outcome,
        skills: profile?.skills || [],
        experiences: profile?.experiences || []
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return null;
    }
  }, []);

  // Generate story using AI
  const generateStory = useCallback(async (
    responses: StoryResponses,
    options: StoryGenerationOptions = {}
  ) => {
    setIsGenerating(true);
    
    try {
      const userContext = await fetchUserContext();
      if (!userContext) {
        throw new Error('Could not fetch user context');
      }

      const { data, error } = await supabase.functions.invoke('generate-story-builder', {
        body: {
          responses,
          userContext,
          formatType: options.formatType || 'origin',
          tone: options.tone || 'professional'
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate story');
      }

      toast({
        title: "Story Generated Successfully",
        description: "Your AI-powered story has been created by Maya, your personal branding coach.",
      });

      return {
        story: data.story,
        formatType: data.formatType,
        tone: data.tone,
        coach: data.coach,
        timestamp: data.timestamp
      };

    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Story Generation Failed",
        description: error.message || "Unable to generate your story. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [fetchUserContext, toast]);

  // Fetch user's saved stories
  const fetchStories = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_stories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setStories(data || []);
      return data || [];

    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: "Error Loading Stories",
        description: "Unable to load your saved stories.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Save or update a story
  const saveStory = useCallback(async (
    storyData: Partial<UserStory> & { content: string; story_type: string }
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('user_stories')
        .insert({
          user_id: user.id,
          story_type: storyData.story_type,
          title: storyData.title || `${storyData.story_type} Story`,
          content: storyData.content,
          metadata: storyData.metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh stories list
      await fetchStories();

      toast({
        title: "Story Saved",
        description: "Your story has been saved successfully.",
      });

      return data;

    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save your story. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [fetchStories, toast]);

  // Delete a story
  const deleteStory = useCallback(async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('user_stories')
        .update({ is_active: false })
        .eq('id', storyId);

      if (error) throw error;

      // Refresh stories list
      await fetchStories();

      toast({
        title: "Story Deleted",
        description: "Your story has been removed.",
      });

    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: "Delete Failed",
        description: "Unable to delete the story. Please try again.",
        variant: "destructive",
      });
    }
  }, [fetchStories, toast]);

  return {
    // State
    isGenerating,
    isLoading,
    stories,

    // Actions
    generateStory,
    fetchStories,
    saveStory,
    deleteStory,
    fetchUserContext
  };
};