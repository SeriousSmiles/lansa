import React, { useRef, useEffect } from 'react';
import { PDFResumeData } from '@/types/pdf';
import { ProfessionalTemplate } from './templates/ProfessionalTemplate';

interface HTMLPDFPreviewProps {
  data: PDFResumeData;
  template?: 'professional' | 'modern' | 'classic';
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
      case 'classic':
      default:
        // Fallback to professional template for now
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