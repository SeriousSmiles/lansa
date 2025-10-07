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
      
      await HTMLToJPEGGenerator.downloadJPEG(
        'pdf-resume-template',
        finalFilename,
        { quality: 0.9, dpi: 300 }
      );
      
      toast({
        title: "Resume Downloaded!",
        description: "Your print-ready image has been saved.",
      });
      
    } catch (error) {
      console.error('Error generating JPEG:', error);
      toast({
        title: "Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const previewJPEG = async () => {
    try {
      await HTMLToJPEGGenerator.previewJPEG('pdf-resume-template', {
        quality: 0.9,
        dpi: 300
      });
    } catch (error) {
      console.error('Error previewing JPEG:', error);
      toast({
        title: "Preview Failed",
        description: "There was an error previewing your resume image.",
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
