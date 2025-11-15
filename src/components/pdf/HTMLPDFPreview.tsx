import React, { useRef, useEffect, useMemo } from 'react';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { ProfessionalTemplateExport } from './templates/ProfessionalTemplateExport';
import { ProfessionalTemplateExportMultiPage } from './templates/ProfessionalTemplateExportMultiPage';
import { ModernTemplate } from './templates/ModernTemplate';
import { ModernTemplateExport } from './templates/ModernTemplateExport';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { CreativeTemplateExport } from './templates/CreativeTemplateExport';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { ClassicTemplateExport } from './templates/ClassicTemplateExport';
import TimelineTemplate from './templates/TimelineTemplate';
import { TimelineTemplateExport } from './templates/TimelineTemplateExport';
import LogosTemplate from './templates/LogosTemplate';
import { LogosTemplateExport } from './templates/LogosTemplateExport';

interface HTMLPDFPreviewProps {
  data: PDFResumeData;
  template?: ResumeTemplate;
  onReady?: () => void;
  forExport?: boolean;
}

export function HTMLPDFPreview({ 
  data, 
  template = 'professional',
  onReady,
  forExport = false
}: HTMLPDFPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate if multi-page is needed
  const needsMultiPage = useMemo(() => {
    const PAGE_HEIGHT = 3508;
    const USABLE_HEIGHT = PAGE_HEIGHT - 172; // padding
    const HEIGHTS = {
      name: 150,
      jobTitle: 80,
      summary: 200,
      sectionTitle: 90,
      experienceItem: 280,
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

    return totalHeight > USABLE_HEIGHT;
  }, [data]);

  useEffect(() => {
    // Notify parent component when template is ready
    const timer = setTimeout(() => {
      onReady?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [data, template, onReady]);

  const renderTemplate = () => {
    // Use export templates for JPEG generation (pixel-perfect)
    if (forExport) {
      switch (template) {
        case 'professional':
          // Use multi-page if content requires it
          return needsMultiPage 
            ? <ProfessionalTemplateExportMultiPage data={data} />
            : <ProfessionalTemplateExport data={data} />;
        case 'modern':
          return <ModernTemplateExport data={data} />;
        case 'creative':
          return <CreativeTemplateExport data={data} />;
        case 'classic':
          return <ClassicTemplateExport data={data} />;
        case 'timeline':
          return <TimelineTemplateExport data={data} />;
        case 'logos':
          return <LogosTemplateExport data={data} />;
        default:
          return needsMultiPage 
            ? <ProfessionalTemplateExportMultiPage data={data} />
            : <ProfessionalTemplateExport data={data} />;
      }
    }

    // Use preview templates for screen viewing
    switch (template) {
      case 'professional':
        return <ProfessionalTemplate data={data} />;
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      case 'timeline':
        return <TimelineTemplate data={data} />;
      case 'logos':
        return <LogosTemplate data={data} />;
      default:
        return <ProfessionalTemplate data={data} />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={forExport ? "" : "w-full h-full overflow-auto bg-gray-100 p-4"}
      style={forExport ? { position: 'absolute', left: '-9999px', top: '0' } : undefined}
    >
      <div className={forExport ? "" : "flex justify-center"}>
        {renderTemplate()}
      </div>
    </div>
  );
}