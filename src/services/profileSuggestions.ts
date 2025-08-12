import { supabase } from "@/integrations/supabase/client";

export interface ProfileSuggestions {
  title: string;
  about: string;
  skills: string[];
  experiences: { title: string; description: string; startYear?: number; endYear?: number | null }[];
  education: { title: string; description: string; startYear?: number; endYear?: number | null }[];
  prompt_version?: string;
}

export async function generateProfileSuggestions(inputs: Record<string, any>): Promise<ProfileSuggestions | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-profile-suggestions', {
      body: { answers: inputs }
    });
    if (error) throw error;
    return (data as any)?.suggestions as ProfileSuggestions;
  } catch (e) {
    console.error('Failed to generate profile suggestions', e);
    return null;
  }
}
