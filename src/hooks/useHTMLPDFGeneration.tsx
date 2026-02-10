import { useState } from 'react';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';
import { ResumeExportService } from '@/services/resumeExportService';
import { useToast } from '@/hooks/use-toast';

export const useHTMLPDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (
    data: PDFResumeData,
    filename?: string,
    _useMultiPage: boolean = true,
    template: ResumeTemplate = 'professional'
  ) => {
    setIsGenerating(true);
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Creating your pixel-perfect resume...",
      });

      await ResumeExportService.downloadPDF(template, data, filename);
      
      toast({
        title: "Resume Downloaded!",
        description: "Your professional PDF resume has been successfully generated.",
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Generation Failed",
        description: "There was an error creating your PDF resume. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const previewPDF = async (
    data: PDFResumeData,
    _useMultiPage: boolean = true,
    template: ResumeTemplate = 'professional'
  ) => {
    try {
      await ResumeExportService.previewPDF(template, data);
    } catch (error) {
      console.error('Error previewing PDF:', error);
      toast({
        title: "Preview Failed",
        description: "There was an error previewing your PDF resume.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    generatePDF,
    previewPDF,
    isGenerating,
  };
};
