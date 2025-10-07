import React, { useRef, useEffect } from 'react';
import { PDFResumeData, ResumeTemplate } from '@/types/pdf';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { ProfessionalTemplateExport } from './templates/ProfessionalTemplateExport';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';
import TimelineTemplate from './templates/TimelineTemplate';
import LogosTemplate from './templates/LogosTemplate';

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

  useEffect(() => {
    // Notify parent component when template is ready
    const timer = setTimeout(() => {
      onReady?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [data, template, onReady]);

  const renderTemplate = () => {
    // Use export template for JPEG generation (pixel-perfect)
    if (forExport && template === 'professional') {
      return <ProfessionalTemplateExport data={data} />;
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