import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ResumeTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'modern' | 'professional' | 'creative' | 'ats';
  thumbnail_url?: string;
  design_json: any;
  is_featured: boolean;
}

export const useResumeTemplates = () => {
  const [templates, setTemplates] = useState<ResumeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('resume_templates')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name');

      if (error) throw error;

      setTemplates((data as ResumeTemplate[]) || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Failed to load templates',
        description: 'Could not load resume templates',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    loading,
    refreshTemplates: loadTemplates
  };
};
