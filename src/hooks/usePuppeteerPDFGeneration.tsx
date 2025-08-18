import { useState } from 'react';
import { PuppeteerPDFGenerator } from '@/services/puppeteerPDFGenerator';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';
import { useToast } from '@/hooks/use-toast';

export const usePuppeteerPDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (
    data: PDFResumeData,
    template: ResumeTemplate = 'modern',
    filename?: string
  ) => {
    setIsGenerating(true);
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your professional resume using our server.",
      });

      await PuppeteerPDFGenerator.downloadPDF(data, template, filename);
      
      toast({
        title: "Resume Downloaded!",
        description: "Your high-quality PDF resume has been successfully generated.",
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

  const previewPDF = async (data: PDFResumeData, template: ResumeTemplate = 'modern') => {
    try {
      return await PuppeteerPDFGenerator.previewPDF(data, template);
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