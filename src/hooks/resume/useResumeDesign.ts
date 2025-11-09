import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ResumeDesign {
  id: string;
  name: string;
  template_id?: string;
  design_json: any;
  thumbnail_url?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useResumeDesign = (userId?: string) => {
  const [designs, setDesigns] = useState<ResumeDesign[]>([]);
  const [currentDesign, setCurrentDesign] = useState<ResumeDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (userId) {
      loadDesigns();
    }
  }, [userId]);

  const loadDesigns = async () => {
    try {
      const { data, error } = await supabase
        .from('resume_designs')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setDesigns(data || []);
      
      // Set default or most recent as current
      const defaultDesign = data?.find(d => d.is_default) || data?.[0];
      if (defaultDesign) {
        setCurrentDesign(defaultDesign);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
      toast({
        title: 'Failed to load designs',
        description: 'Could not load your resume designs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveDesign = async (design: Partial<ResumeDesign>, designId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('save-resume-design', {
        body: { design, designId }
      });

      if (error) throw error;

      toast({
        title: 'Design saved',
        description: 'Your resume design has been saved successfully'
      });

      await loadDesigns();
      return data.design;
    } catch (error) {
      console.error('Error saving design:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save your design',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteDesign = async (designId: string) => {
    try {
      const { error } = await supabase
        .from('resume_designs')
        .delete()
        .eq('id', designId);

      if (error) throw error;

      toast({
        title: 'Design deleted',
        description: 'Your resume design has been deleted'
      });

      await loadDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
      toast({
        title: 'Delete failed',
        description: 'Could not delete the design',
        variant: 'destructive'
      });
    }
  };

  return {
    designs,
    currentDesign,
    setCurrentDesign,
    loading,
    saveDesign,
    deleteDesign,
    refreshDesigns: loadDesigns
  };
};
