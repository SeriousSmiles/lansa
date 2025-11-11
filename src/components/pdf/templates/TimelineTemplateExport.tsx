import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface TimelineTemplateExportProps {
  data: PDFResumeData;
}

export function TimelineTemplateExport({ data }: TimelineTemplateExportProps) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;
  const TOTAL_WIDTH = 2480;
  const TOTAL_HEIGHT = 3508;
  const SCALE_FACTOR = 3.125;

  return (
    <div id="pdf-resume-export-container" style={{
      width: `${TOTAL_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      fontFamily: 'Urbanist, Public Sans, sans-serif',
      fontSize: `${11 * SCALE_FACTOR}px`,
      lineHeight: 1.5,
      backgroundColor: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <img src={lansaBadge} alt="Powered by Lansa" style={{
        position: 'absolute',
        bottom: `${16 * SCALE_FACTOR}px`,
        right: `${16 * SCALE_FACTOR}px`,
        width: `${96 * SCALE_FACTOR}px`,
        opacity: 0.9,
        zIndex: 10,
      }} />
      {/* Header */}
      <div style={{
        padding: `${32 * SCALE_FACTOR}px`,
        paddingBottom: `${24 * SCALE_FACTOR}px`,
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}dd 100%)`,
        color: '#ffffff',
      }}>
        <h1 style={{ fontSize: `${30 * SCALE_FACTOR}px`, fontWeight: 'bold', marginBottom: `${8 * SCALE_FACTOR}px` }}>{personalInfo.name}</h1>
        <h2 style={{ fontSize: `${18 * SCALE_FACTOR}px`, opacity: 0.9, marginBottom: `${12 * SCALE_FACTOR}px` }}>{personalInfo.title}</h2>
        <div style={{ display: 'flex', gap: `${16 * SCALE_FACTOR}px`, fontSize: `${14 * SCALE_FACTOR}px` }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
        </div>
      </div>
      {/* Timeline content - simplified for export */}
      <div style={{ padding: `${24 * SCALE_FACTOR}px` }}>
        {personalInfo.summary && (
          <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
            <h3 style={{ fontSize: `${14 * SCALE_FACTOR}px`, fontWeight: 'bold', marginBottom: `${12 * SCALE_FACTOR}px`, color: colors.primary }}>Profile</h3>
            <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151' }}>{personalInfo.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
