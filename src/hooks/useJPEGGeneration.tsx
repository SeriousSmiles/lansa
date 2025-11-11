import { useState } from 'react';
import { HTMLToJPEGGenerator } from '@/services/htmlToJPEGGenerator';
import { PDFResumeData } from '@/types/pdf';
import { useToast } from '@/hooks/use-toast';

export const useJPEGGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateJPEG = async (
    data: PDFResumeData,
    filename?: string
  ) => {
    setIsGenerating(true);
    
    try {
      toast({
        title: "Generating Image...",
        description: "Creating your print-ready resume image.",
      });

      const defaultFilename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.jpg`;
      const finalFilename = filename || defaultFilename;
      
      // Use the export template ID (pixel-perfect version)
      await HTMLToJPEGGenerator.downloadJPEG(
        'pdf-resume-export-container',
        finalFilename,
        { quality: 0.9, dpi: 300 }
      );
      
      toast({
        title: "Resume Downloaded!",
        description: "Your print-ready image has been saved.",
      });
      
    } catch (error) {
      console.error('Error generating JPEG:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "JPEG Export Failed",
        description: errorMessage.includes('not support') 
          ? "This template only supports PDF export. Please select PDF format."
          : "Please try again or contact support.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const previewJPEG = async () => {
    try {
      // Use the export template ID (pixel-perfect version)
      await HTMLToJPEGGenerator.previewJPEG('pdf-resume-export-container', {
        quality: 0.9,
        dpi: 300
      });
    } catch (error) {
      console.error('Error previewing JPEG:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "JPEG Preview Failed",
        description: errorMessage.includes('not support')
          ? "This template only supports PDF export. Please select PDF format."
          : "There was an error previewing your resume image.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    generateJPEG,
    previewJPEG,
    isGenerating,
  };
};
