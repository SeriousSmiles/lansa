import { useState } from 'react';
import { HTMLToPDFGenerator } from '@/services/htmlToPDFGenerator';
import { PDFResumeData } from '@/types/pdf';
import { useToast } from '@/hooks/use-toast';

export const useHTMLPDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (
    data: PDFResumeData,
    filename?: string
  ) => {
    setIsGenerating(true);
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your professional resume.",
      });

      const defaultFilename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      const finalFilename = filename || defaultFilename;
      
      await HTMLToPDFGenerator.downloadPDF(
        'pdf-resume-template',
        finalFilename,
        {
          quality: 2,
          format: 'a4',
          orientation: 'portrait'
        }
      );
      
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

  const previewPDF = async () => {
    try {
      await HTMLToPDFGenerator.previewPDF('pdf-resume-template', {
        quality: 2,
        format: 'a4',
        orientation: 'portrait'
      });
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