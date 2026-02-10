import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface ModernTemplateExportProps {
  data: PDFResumeData;
}

export function ModernTemplateExport({ data }: ModernTemplateExportProps) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;

  // Pixel-perfect A4 dimensions at 300 DPI
  const TOTAL_WIDTH = 2480; // 210mm × 11.81
  const TOTAL_HEIGHT = 3508; // 297mm × 11.81
  const SCALE_FACTOR = 3.125; // Scaling from 794px screen to 2480px print

  const styles = {
    container: {
      width: `${TOTAL_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: `${11 * SCALE_FACTOR}px`,
      lineHeight: 1.45,
      backgroundColor: '#ffffff',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    },
    header: {
      height: `${128 * SCALE_FACTOR}px`,
      position: 'relative' as const,
      overflow: 'hidden' as const,
      background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
    },
    headerOverlay: {
      position: 'absolute' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    headerContent: {
      position: 'relative' as const,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '100%',
      padding: `0 ${32 * SCALE_FACTOR}px`,
      color: '#ffffff',
    },
    profileImage: {
      width: `${80 * SCALE_FACTOR}px`,
      height: `${80 * SCALE_FACTOR}px`,
      borderRadius: '50%',
      border: `${3 * SCALE_FACTOR}px solid white`,
      overflow: 'hidden' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginLeft: `${24 * SCALE_FACTOR}px`,
    },
    leftColumn: {
      width: `${TOTAL_WIDTH * 0.357}px`, // 75mm
      backgroundColor: '#f9fafb',
      padding: `${24 * SCALE_FACTOR}px`,
    },
    badge: {
      position: 'absolute' as const,
      bottom: `${16 * SCALE_FACTOR}px`,
      right: `${16 * SCALE_FACTOR}px`,
      width: `${96 * SCALE_FACTOR}px`,
      opacity: 0.9,
    },
  };

  return (
    <div id="pdf-resume-export-container" style={styles.container}>
      {/* Powered by Lansa Badge */}
      <img src={lansaBadge} alt="Powered by Lansa" style={styles.badge} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerOverlay}></div>
        <div style={styles.headerContent}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: `${30 * SCALE_FACTOR}px`, fontWeight: 'bold', marginBottom: `${4 * SCALE_FACTOR}px`, marginTop: `-${6 * SCALE_FACTOR}px` }}>
              {personalInfo.name}
            </h1>
            <h2 style={{ fontSize: `${18 * SCALE_FACTOR}px`, opacity: 0.9 }}>
              {personalInfo.title}
            </h2>
          </div>
          {personalInfo.profileImage && (
            <div style={styles.profileImage}>
              <img 
                src={personalInfo.profileImage} 
                alt={personalInfo.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', height: `${TOTAL_HEIGHT - 128 * SCALE_FACTOR}px` }}>
        {/* Left Column */}
        <div style={styles.leftColumn}>
          {/* Contact */}
          <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
            <h3 style={{
              fontSize: `${14 * SCALE_FACTOR}px`,
              fontWeight: 'bold',
              marginBottom: `${12 * SCALE_FACTOR}px`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              paddingBottom: `${8 * SCALE_FACTOR}px`,
              borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
              color: colors.primary,
            }}>
              Contact
            </h3>
            <div style={{ fontSize: `${12 * SCALE_FACTOR}px` }}>
              {personalInfo.email && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: `${8 * SCALE_FACTOR}px` }}>
                  <div style={{
                    width: `${8 * SCALE_FACTOR}px`,
                    height: `${8 * SCALE_FACTOR}px`,
                    borderRadius: '50%',
                    backgroundColor: colors.primary,
                    marginRight: `${8 * SCALE_FACTOR}px`,
                  }}></div>
                  <span style={{ wordBreak: 'break-all' }}>{personalInfo.email}</span>
                </div>
              )}
              {personalInfo.phone && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: `${8 * SCALE_FACTOR}px`,
                    height: `${8 * SCALE_FACTOR}px`,
                    borderRadius: '50%',
                    backgroundColor: colors.primary,
                    marginRight: `${8 * SCALE_FACTOR}px`,
                  }}></div>
                  <span>{personalInfo.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${12 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Skills
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: `${8 * SCALE_FACTOR}px` }}>
                {skills.slice(0, 10).map((skill, index) => (
                  <div 
                    key={index}
                    style={{
                      fontSize: `${12 * SCALE_FACTOR}px`,
                      padding: `${4 * SCALE_FACTOR}px ${8 * SCALE_FACTOR}px`,
                      borderRadius: `${4 * SCALE_FACTOR}px`,
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary,
                    }}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${12 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Languages
              </h3>
              <div>
                {languages.map((lang, index) => {
                  const percentage = (lang.level / 5) * 100;
                  return (
                    <div key={index} style={{ marginBottom: `${12 * SCALE_FACTOR}px` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                        <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, fontWeight: 500, color: '#1f2937' }}>{lang.name}</span>
                        <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#6b7280' }}>{percentage}%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        backgroundColor: '#e5e7eb',
                        borderRadius: `${4 * SCALE_FACTOR}px`,
                        height: `${8 * SCALE_FACTOR}px`,
                      }}>
                        <div style={{
                          height: '100%',
                          borderRadius: `${4 * SCALE_FACTOR}px`,
                          backgroundColor: colors.primary,
                          width: `${percentage}%`,
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Professional Goal */}
          {personalInfo.professionalGoal && (
            <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${12 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Objective
              </h3>
              <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6 }}>
                {personalInfo.professionalGoal}
              </p>
            </div>
          )}

          {/* Biggest Challenge */}
          {personalInfo.biggestChallenge && (
            <div>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${12 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Challenge
              </h3>
              <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6 }}>
                {personalInfo.biggestChallenge}
              </p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, padding: `${24 * SCALE_FACTOR}px` }}>
          {/* Summary */}
          {personalInfo.summary && (
            <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${12 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Profile
              </h3>
              <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6 }}>
                {personalInfo.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${16 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Experience
              </h3>
              <div>
                {experience.map((exp, index) => (
                  <div key={index} style={{ 
                    position: 'relative',
                    paddingLeft: `${16 * SCALE_FACTOR}px`,
                    marginBottom: `${16 * SCALE_FACTOR}px`,
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: `${4 * SCALE_FACTOR}px`,
                      width: `${8 * SCALE_FACTOR}px`,
                      height: `${8 * SCALE_FACTOR}px`,
                      borderRadius: '50%',
                      backgroundColor: colors.primary,
                    }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                      <h4 style={{ fontSize: `${14 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                        {exp.title}
                      </h4>
                      {exp.startYear && (
                        <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#6b7280', marginLeft: `${8 * SCALE_FACTOR}px` }}>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                    {exp.description && (
                      <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6 }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${16 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Education
              </h3>
              <div>
                {education.map((edu, index) => (
                  <div key={index} style={{ 
                    position: 'relative',
                    paddingLeft: `${16 * SCALE_FACTOR}px`,
                    marginBottom: `${12 * SCALE_FACTOR}px`,
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: 0,
                      top: `${4 * SCALE_FACTOR}px`,
                      width: `${8 * SCALE_FACTOR}px`,
                      height: `${8 * SCALE_FACTOR}px`,
                      borderRadius: '50%',
                      backgroundColor: colors.primary,
                    }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                      <h4 style={{ fontSize: `${14 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                        {edu.title}
                      </h4>
                      {edu.startYear && (
                        <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#6b7280', marginLeft: `${8 * SCALE_FACTOR}px` }}>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                    {edu.description && (
                      <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6 }}>
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <div>
              <h3 style={{
                fontSize: `${14 * SCALE_FACTOR}px`,
                fontWeight: 'bold',
                marginBottom: `${16 * SCALE_FACTOR}px`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                paddingBottom: `${8 * SCALE_FACTOR}px`,
                borderBottom: `${2 * SCALE_FACTOR}px solid ${colors.primary}`,
                color: colors.primary,
              }}>
                Certifications
              </h3>
              <div>
                {certifications.map((cert, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: `${8 * SCALE_FACTOR}px`,
                      border: `${1 * SCALE_FACTOR}px solid ${colors.primary}30`,
                      borderRadius: `${4 * SCALE_FACTOR}px`,
                      marginBottom: `${12 * SCALE_FACTOR}px`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                      <h4 style={{ fontSize: `${12 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                        {cert.title}
                      </h4>
                      {cert.date && (
                        <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#6b7280', marginLeft: `${8 * SCALE_FACTOR}px` }}>
                          {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151' }}>{cert.issuer}</p>
                    {cert.credentialId && (
                      <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#6b7280', marginTop: `${4 * SCALE_FACTOR}px` }}>
                        ID: {cert.credentialId}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
