import React, { useRef, useEffect } from 'react';
import { PDFResumeData } from '@/types/pdf';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { CreativeTemplate } from './templates/CreativeTemplate';
import { ClassicTemplate } from './templates/ClassicTemplate';

interface HTMLPDFPreviewProps {
  data: PDFResumeData;
  template?: 'professional' | 'modern' | 'classic' | 'creative';
  onReady?: () => void;
}

export function HTMLPDFPreview({ 
  data, 
  template = 'professional',
  onReady 
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
    switch (template) {
      case 'professional':
        return <ProfessionalTemplate data={data} />;
      case 'modern':
        return <ModernTemplate data={data} />;
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      default:
        return <ProfessionalTemplate data={data} />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-auto bg-gray-100 p-4"
    >
      <div className="flex justify-center">
        {renderTemplate()}
      </div>
    </div>
  );
}