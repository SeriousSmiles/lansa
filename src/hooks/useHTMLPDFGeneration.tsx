import { useState } from 'react';
import { HTMLToPDFGenerator } from '@/services/htmlToPDFGenerator';
import { PDFResumeData } from '@/types/pdf';
import { useToast } from '@/hooks/use-toast';

// Import pagination calculator
const calculatePagination = (data: PDFResumeData) => {
  const PAGE_HEIGHT = 3508;
  const PADDING_TOP = 78;
  const PADDING_BOTTOM = 94;
  const USABLE_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const HEIGHTS = {
    name: 150,
    jobTitle: 80,
    summary: 200,
    sectionTitle: 90,
    experienceItem: 280,
    educationItem: 200,
    spacing: 40,
  };

  let totalHeight = HEIGHTS.name + HEIGHTS.jobTitle + HEIGHTS.spacing;

  if (data.personalInfo.summary) {
    const summaryLines = Math.ceil(data.personalInfo.summary.length / 80);
    totalHeight += HEIGHTS.sectionTitle + (summaryLines * 55) + HEIGHTS.spacing;
  }

  if (data.experience && data.experience.length > 0) {
    totalHeight += HEIGHTS.sectionTitle;
    data.experience.forEach((exp: any) => {
      const descriptionLines = exp.description ? Math.ceil(exp.description.length / 100) : 0;
      totalHeight += HEIGHTS.experienceItem + (descriptionLines * 30);
    });
  }

  if (data.education && data.education.length > 0) {
    totalHeight += HEIGHTS.sectionTitle;
    totalHeight += data.education.length * HEIGHTS.educationItem;
  }

  const totalPages = Math.ceil(totalHeight / USABLE_HEIGHT);

  return { totalPages, hasOverflow: totalPages > 3 };
};

export const useHTMLPDFGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePDF = async (
    data: PDFResumeData,
    filename?: string,
    useMultiPage: boolean = true
  ) => {
    setIsGenerating(true);
    
    try {
      // Check if content needs multiple pages
      const pagination = calculatePagination(data);
      const needsMultiPage = pagination.totalPages > 1;

      if (needsMultiPage && !useMultiPage) {
        toast({
          title: "Content Warning",
          description: `Your resume content spans ${pagination.totalPages} pages. Consider using multi-page export.`,
        });
      }

      toast({
        title: "Generating PDF...",
        description: needsMultiPage && useMultiPage 
          ? `Creating ${pagination.totalPages}-page professional resume...`
          : "Please wait while we create your professional resume.",
      });

      const defaultFilename = `${data.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      const finalFilename = filename || defaultFilename;
      
      // Use multi-page template if content requires it
      const templateId = (needsMultiPage && useMultiPage) 
        ? 'pdf-resume-export-container' 
        : 'pdf-resume-template';
      
      await HTMLToPDFGenerator.downloadPDF(
        templateId,
        finalFilename,
        {
          quality: 2,
          format: 'a4',
          orientation: 'portrait'
        }
      );
      
      toast({
        title: "Resume Downloaded!",
        description: needsMultiPage && useMultiPage
          ? `Your ${pagination.totalPages}-page PDF resume has been successfully generated.`
          : "Your professional PDF resume has been successfully generated.",
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

  const previewPDF = async (data: PDFResumeData, useMultiPage: boolean = true) => {
    try {
      const pagination = calculatePagination(data);
      const needsMultiPage = pagination.totalPages > 1;
      
      const templateId = (needsMultiPage && useMultiPage) 
        ? 'pdf-resume-export-container' 
        : 'pdf-resume-template';

      await HTMLToPDFGenerator.previewPDF(templateId, {
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