import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import lansaBadge from '@/assets/lansa-icon.svg';

interface LogosTemplateExportProps {
  data: PDFResumeData;
}

export function LogosTemplateExport({ data }: LogosTemplateExportProps) {
  const { personalInfo, experience, education, skills, colors } = data;
  const TOTAL_WIDTH = 2480;
  const TOTAL_HEIGHT = 3508;
  const SCALE_FACTOR = 3.125;

  return (
    <div id="pdf-resume-export-container" style={{
      width: `${TOTAL_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      fontFamily: 'Urbanist, Public Sans, sans-serif',
      fontSize: `${11 * SCALE_FACTOR}px`,
      lineHeight: 1.45, // Reduced from 1.5 to compensate for html2canvas text shift
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        bottom: `${16 * SCALE_FACTOR}px`,
        right: `${16 * SCALE_FACTOR}px`,
        display: 'flex',
        alignItems: 'center',
        gap: `${8 * SCALE_FACTOR}px`,
        padding: `${12 * SCALE_FACTOR}px ${12 * SCALE_FACTOR}px`,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: `${100 * SCALE_FACTOR}px`,
        zIndex: 10,
      }}>
        <img src={lansaBadge} alt="Lansa" style={{ width: `${16 * SCALE_FACTOR}px`, height: `${16 * SCALE_FACTOR}px` }} />
        <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, fontWeight: 500, color: '#1A1F71' }}>Powered by Lansa</span>
      </div>
      <div style={{ padding: `${32 * SCALE_FACTOR}px` }}>
        <h1 style={{ fontSize: `${40 * SCALE_FACTOR}px`, fontWeight: 'bold', marginBottom: `${8 * SCALE_FACTOR}px`, color: colors.primary }}>{personalInfo.name}</h1>
        <h2 style={{ fontSize: `${21 * SCALE_FACTOR}px`, color: '#374151' }}>{personalInfo.title}</h2>
      </div>
    </div>
  );
}
