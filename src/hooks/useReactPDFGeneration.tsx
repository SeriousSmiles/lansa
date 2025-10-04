import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';
import { useToast } from '@/hooks/use-toast';
import { getReactPDFDocFor } from '@/components/pdf/reactPdfFactory';

export const useReactPDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (
    data: PDFResumeData,
    template: ResumeTemplate,
    filename?: string
  ) => {
    setIsGenerating(true);
    
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your resume.",
      });

      const Doc = await getReactPDFDocFor(template);
      const element = <Doc data={data} />;
      const blob = await pdf(element as any).toBlob();
      
      const defaultFilename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      const finalFilename = filename || defaultFilename;
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = finalFilename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Resume Downloaded!",
        description: "Your PDF resume has been successfully generated.",
      });
      
      return blob;
    } catch (error) {
      console.error('Error generating React-PDF:', error);
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

  const previewPDF = async (data: PDFResumeData, template: ResumeTemplate) => {
    try {
      const Doc = await getReactPDFDocFor(template);
      const element = <Doc data={data} />;
      const blob = await pdf(element as any).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      return url;
    } catch (error) {
      console.error('Error previewing React-PDF:', error);
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
