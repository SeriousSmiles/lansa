import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { PDFGenerator } from '@/components/pdf/PDFGenerator';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';
import { useToast } from '@/hooks/use-toast';

export const usePDFGeneration = () => {
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
        description: "Please wait while we create your resume.",
      });

      // Generate PDF blob
      const blob = await pdf(<PDFGenerator data={data} />).toBlob();
      
      // Create filename
      const defaultFilename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      const finalFilename = filename || defaultFilename;
      
      // Download file
      saveAs(blob, finalFilename);
      
      toast({
        title: "Resume Downloaded!",
        description: "Your PDF resume has been successfully generated.",
      });
      
      return blob;
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
      const blob = await pdf(<PDFGenerator data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      return url;
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