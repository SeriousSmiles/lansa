import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SectionComponent, SectionInstance, SectionComponentType } from '@/types/resumeSection';

export const useResumeSections = (resumeDesignId?: string) => {
  const [sectionComponents, setSectionComponents] = useState<SectionComponent[]>([]);
  const [sectionInstances, setSectionInstances] = useState<SectionInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSectionComponents();
    if (resumeDesignId) {
      loadSectionInstances(resumeDesignId);
    } else {
      setLoading(false);
    }
  }, [resumeDesignId]);

  const loadSectionComponents = async () => {
    try {
      const { data, error } = await supabase
        .from('resume_section_components')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name');

      if (error) throw error;

      setSectionComponents(data?.map(item => ({
        ...item,
        type: item.type as SectionComponentType,
        category: item.category as any,
        data_schema: item.data_schema as any,
        default_design_json: item.default_design_json as any
      })) || []);
    } catch (error) {
      console.error('Error loading section components:', error);
      toast({
        title: 'Failed to load sections',
        description: 'Could not load available resume sections',
        variant: 'destructive'
      });
    }
  };

  const loadSectionInstances = async (designId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resume_sections')
        .select('*')
        .eq('resume_design_id', designId)
        .order('position');

      if (error) throw error;

      setSectionInstances((data || []).map(item => ({
        ...item,
        zone: (item as any).zone || 'main',
        width: (item as any).width || 'full',
        component_type: item.component_type as SectionComponentType,
        layout_config: item.layout_config as any,
        custom_design_json: item.custom_design_json as any,
        custom_data: item.custom_data as any
      })));
    } catch (error) {
      console.error('Error loading section instances:', error);
      toast({
        title: 'Failed to load resume sections',
        description: 'Could not load your resume sections',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSectionInstances = async (designId: string, sections: SectionInstance[]) => {
    try {
      // Delete existing sections
      await supabase
        .from('resume_sections')
        .delete()
        .eq('resume_design_id', designId);

      // Insert new sections
      const { error } = await supabase
        .from('resume_sections')
        .insert(
          sections.map(section => ({
            resume_design_id: designId,
            component_type: section.component_type,
            position: section.position,
            zone: (section as any).zone || 'main',
            width: (section as any).width || 'full',
            custom_design_json: section.custom_design_json as any,
            custom_data: section.custom_data as any,
            is_visible: section.is_visible,
            layout_config: section.layout_config as any
          }))
        );

      if (error) throw error;

      toast({
        title: 'Sections saved',
        description: 'Your resume sections have been saved successfully'
      });

      await loadSectionInstances(designId);
    } catch (error) {
      console.error('Error saving sections:', error);
      toast({
        title: 'Save failed',
        description: 'Could not save your resume sections',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    sectionComponents,
    sectionInstances,
    setSectionInstances,
    loading,
    saveSectionInstances,
    refreshSections: () => loadSectionInstances(resumeDesignId!)
  };
};
