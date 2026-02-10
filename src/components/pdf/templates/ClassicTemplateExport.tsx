import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface ClassicTemplateExportProps {
  data: PDFResumeData;
}

export function ClassicTemplateExport({ data }: ClassicTemplateExportProps) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;

  // Pixel-perfect A4 dimensions at 300 DPI
  const TOTAL_WIDTH = 2480;
  const TOTAL_HEIGHT = 3508;
  const SCALE_FACTOR = 3.125;

  const styles = {
    container: {
      width: `${TOTAL_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: `${12 * SCALE_FACTOR}px`,
      lineHeight: 1.5, // Reduced from 1.6 to compensate for html2canvas text shift
      backgroundColor: '#ffffff',
      position: 'relative' as const,
      overflow: 'hidden' as const,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    badge: {
      position: 'absolute' as const,
      bottom: `${16 * SCALE_FACTOR}px`,
      right: `${16 * SCALE_FACTOR}px`,
      width: `${96 * SCALE_FACTOR}px`,
      opacity: 0.9,
      zIndex: 10,
    },
  };

  return (
    <div id="pdf-resume-export-container" style={styles.container}>
      <img src={lansaBadge} alt="Powered by Lansa" style={styles.badge} />
      
      <div style={{ flex: 1, padding: `${32 * SCALE_FACTOR}px` }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: `${32 * SCALE_FACTOR}px`,
          paddingBottom: `${24 * SCALE_FACTOR}px`,
          borderBottom: `${2 * SCALE_FACTOR}px solid #d1d5db`,
        }}>
          <h1 style={{
            fontSize: `${40 * SCALE_FACTOR}px`,
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: `${8 * SCALE_FACTOR}px`,
            marginTop: `-${8 * SCALE_FACTOR}px`, // html2canvas compensation
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            {personalInfo.name}
          </h1>
          <h2 style={{
            fontSize: `${21 * SCALE_FACTOR}px`,
            color: '#374151',
            marginBottom: `${16 * SCALE_FACTOR}px`,
          }}>
            {personalInfo.title}
          </h2>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: `${24 * SCALE_FACTOR}px`,
            fontSize: `${14 * SCALE_FACTOR}px`,
            color: '#6b7280',
          }}>
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
          </div>
        </div>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <div style={{ marginBottom: `${32 * SCALE_FACTOR}px` }}>
            <h3 style={{
              fontSize: `${18 * SCALE_FACTOR}px`,
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: `${12 * SCALE_FACTOR}px`,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Professional Summary
            </h3>
            <p style={{
              color: '#374151',
              lineHeight: 1.5,
              textAlign: 'justify',
            }}>
              {personalInfo.summary}
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '66.67% 33.33%', gap: `${32 * SCALE_FACTOR}px` }}>
          {/* Main Content */}
          <div>
            {/* Experience */}
            {experience.length > 0 && (
              <div style={{ marginBottom: `${32 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: `${16 * SCALE_FACTOR}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                  paddingBottom: `${8 * SCALE_FACTOR}px`,
                }}>
                  Professional Experience
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${24 * SCALE_FACTOR}px` }}>
                  {experience.map((exp, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${8 * SCALE_FACTOR}px` }}>
                        <h4 style={{ fontSize: `${16 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                          {exp.title}
                        </h4>
                        {exp.startYear && (
                          <span style={{ fontSize: `${14 * SCALE_FACTOR}px`, color: '#6b7280', fontWeight: 500 }}>
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </span>
                        )}
                      </div>
                      {exp.description && (
                        <p style={{ color: '#374151', lineHeight: 1.5, textAlign: 'justify' }}>
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
              <div style={{ marginBottom: `${32 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: `${16 * SCALE_FACTOR}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                  paddingBottom: `${8 * SCALE_FACTOR}px`,
                }}>
                  Education
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${16 * SCALE_FACTOR}px` }}>
                  {education.map((edu, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                        <h4 style={{ fontSize: `${16 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                          {edu.title}
                        </h4>
                        {edu.startYear && (
                          <span style={{ fontSize: `${14 * SCALE_FACTOR}px`, color: '#6b7280', fontWeight: 500 }}>
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </span>
                        )}
                      </div>
                      {edu.description && (
                        <p style={{ color: '#374151', lineHeight: 1.5 }}>
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
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: `${16 * SCALE_FACTOR}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                  paddingBottom: `${8 * SCALE_FACTOR}px`,
                }}>
                  Certifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${12 * SCALE_FACTOR}px` }}>
                  {certifications.map((cert, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: `${12 * SCALE_FACTOR}px`,
                        border: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                        borderRadius: `${4 * SCALE_FACTOR}px`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                        <h4 style={{ fontSize: `${14 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                          {cert.title}
                        </h4>
                        {cert.date && (
                          <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#6b7280', fontWeight: 500 }}>
                            {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: `${14 * SCALE_FACTOR}px`, color: '#374151' }}>{cert.issuer}</p>
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

          {/* Sidebar */}
          <div>
            {/* Profile Image */}
            {personalInfo.profileImage && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px`, textAlign: 'center' }}>
                <div style={{
                  width: `${128 * SCALE_FACTOR}px`,
                  height: `${128 * SCALE_FACTOR}px`,
                  margin: '0 auto',
                  border: `${4 * SCALE_FACTOR}px solid #d1d5db`,
                  overflow: 'hidden',
                }}>
                  <img 
                    src={personalInfo.profileImage} 
                    alt={personalInfo.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${16 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                  paddingBottom: `${8 * SCALE_FACTOR}px`,
                }}>
                  Core Skills
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {skills.slice(0, 10).map((skill, index) => (
                    <li key={index} style={{
                      fontSize: `${14 * SCALE_FACTOR}px`,
                      color: '#374151',
                      lineHeight: 1.5,
                      marginBottom: `${4 * SCALE_FACTOR}px`,
                    }}>
                      • {skill}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${16 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                  paddingBottom: `${8 * SCALE_FACTOR}px`,
                }}>
                  Languages
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${12 * SCALE_FACTOR}px` }}>
                  {languages.map((lang, index) => {
                    const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                    const levelName = levelNames[lang.level - 1] || 'Unknown';
                    
                    return (
                      <div key={index}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                          <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, fontWeight: 500, color: '#1f2937' }}>{lang.name}</span>
                          <span style={{
                            fontSize: `${12 * SCALE_FACTOR}px`,
                            fontWeight: 500,
                            padding: `${2 * SCALE_FACTOR}px ${8 * SCALE_FACTOR}px`,
                            borderRadius: `${4 * SCALE_FACTOR}px`,
                            backgroundColor: '#e5e7eb',
                            color: '#374151',
                          }}>
                            {levelName}
                          </span>
                        </div>
                        <div style={{
                          width: '100%',
                          height: `${8 * SCALE_FACTOR}px`,
                          backgroundColor: '#e5e7eb',
                          borderRadius: `${100 * SCALE_FACTOR}px`,
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            height: '100%',
                            borderRadius: `${100 * SCALE_FACTOR}px`,
                            backgroundColor: '#374151',
                            width: `${(lang.level / 5) * 100}%`,
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
                  fontSize: `${16 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                  paddingBottom: `${8 * SCALE_FACTOR}px`,
                }}>
                  Career Objective
                </h3>
                <p style={{ fontSize: `${14 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.5, textAlign: 'justify' }}>
                  {personalInfo.professionalGoal}
                </p>
              </div>
            )}

            {/* Biggest Challenge */}
            {personalInfo.biggestChallenge && (
              <div>
                <h3 style={{
                  fontSize: `${16 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: `${1 * SCALE_FACTOR}px solid #d1d5db`,
                  paddingBottom: `${8 * SCALE_FACTOR}px`,
                }}>
                  Key Challenge
                </h3>
                <p style={{ fontSize: `${14 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.5, textAlign: 'justify' }}>
                  {personalInfo.biggestChallenge}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
