import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExportOptions {
  format: 'pdf' | 'png' | 'jpeg';
  include_photo?: boolean;
  ats_mode?: boolean;
  sections?: string[];
  dpi?: number;
}

export const useResumeExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportResume = async (
    design_id: string | undefined,
    design_json: any,
    options: ExportOptions
  ) => {
    setIsExporting(true);
    
    try {
      toast({
        title: 'Exporting resume...',
        description: 'Creating your pixel-perfect export'
      });

      const { data, error } = await supabase.functions.invoke('export-resume', {
        body: {
          design_id,
          design_json,
          options
        }
      });

      if (error) throw error;

      // Download the file
      if (data.file_url) {
        const link = document.createElement('a');
        link.href = data.file_url;
        link.download = `resume.${options.format}`;
        link.click();
      }

      toast({
        title: 'Export complete!',
        description: 'Your resume has been downloaded'
      });

      return data;
    } catch (error) {
      console.error('Error exporting resume:', error);
      toast({
        title: 'Export failed',
        description: 'Could not export your resume',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportResume,
    isExporting
  };
};
