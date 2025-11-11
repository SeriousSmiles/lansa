import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface CreativeTemplateExportProps {
  data: PDFResumeData;
}

export function CreativeTemplateExport({ data }: CreativeTemplateExportProps) {
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
      fontSize: `${11 * SCALE_FACTOR}px`,
      lineHeight: 1.5,
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

      {/* Decorative Header */}
      <div style={{ position: 'relative' }}>
        <div style={{
          height: `${80 * SCALE_FACTOR}px`,
          width: '100%',
          background: `linear-gradient(45deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: `${-40 * SCALE_FACTOR}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          width: `${80 * SCALE_FACTOR}px`,
          height: `${80 * SCALE_FACTOR}px`,
          borderRadius: '50%',
          border: `${4 * SCALE_FACTOR}px solid white`,
          overflow: 'hidden',
          backgroundColor: colors.primary,
        }}>
          {personalInfo.profileImage ? (
            <img 
              src={personalInfo.profileImage} 
              alt={personalInfo.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: `${24 * SCALE_FACTOR}px`,
              fontWeight: 'bold',
              color: 'white',
            }}>
              {personalInfo.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, paddingTop: `${48 * SCALE_FACTOR}px`, paddingLeft: `${32 * SCALE_FACTOR}px`, paddingRight: `${32 * SCALE_FACTOR}px` }}>
        {/* Name and Title */}
        <div style={{ textAlign: 'center', marginBottom: `${32 * SCALE_FACTOR}px` }}>
          <h1 style={{ fontSize: `${30 * SCALE_FACTOR}px`, fontWeight: 'bold', color: '#111827', marginBottom: `${8 * SCALE_FACTOR}px` }}>
            {personalInfo.name}
          </h1>
          <h2 style={{ fontSize: `${18 * SCALE_FACTOR}px`, fontWeight: 500, color: colors.primary }}>
            {personalInfo.title}
          </h2>
        </div>

        {/* Contact Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: `${24 * SCALE_FACTOR}px`,
          marginBottom: `${32 * SCALE_FACTOR}px`,
          padding: `${12 * SCALE_FACTOR}px ${24 * SCALE_FACTOR}px`,
          borderRadius: `${100 * SCALE_FACTOR}px`,
          color: 'white',
          fontSize: `${12 * SCALE_FACTOR}px`,
          backgroundColor: colors.primary,
        }}>
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo.email && <span>✉️ {personalInfo.email}</span>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '33.33% 66.67%', gap: `${24 * SCALE_FACTOR}px` }}>
          {/* Left Column */}
          <div>
            {/* Summary */}
            {personalInfo.summary && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textAlign: 'center',
                  color: colors.primary,
                }}>
                  Profile
                </h3>
                <div style={{
                  width: `${48 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  margin: `0 auto ${12 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6, textAlign: 'justify' }}>
                  {personalInfo.summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textAlign: 'center',
                  color: colors.primary,
                }}>
                  Skills
                </h3>
                <div style={{
                  width: `${48 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  margin: `0 auto ${12 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${8 * SCALE_FACTOR}px` }}>
                  {skills.slice(0, 8).map((skill, index) => (
                    <div key={index} style={{ textAlign: 'center' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: `${4 * SCALE_FACTOR}px ${12 * SCALE_FACTOR}px`,
                        borderRadius: `${100 * SCALE_FACTOR}px`,
                        fontSize: `${12 * SCALE_FACTOR}px`,
                        fontWeight: 500,
                        color: 'white',
                        backgroundColor: colors.primary,
                      }}>
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textAlign: 'center',
                  color: colors.primary,
                }}>
                  Languages
                </h3>
                <div style={{
                  width: `${48 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  margin: `0 auto ${12 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${12 * SCALE_FACTOR}px` }}>
                  {languages.map((lang, index) => {
                    const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                    const levelName = levelNames[lang.level - 1] || 'Unknown';
                    
                    return (
                      <div key={index}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: `${4 * SCALE_FACTOR}px`,
                          padding: `0 ${8 * SCALE_FACTOR}px`,
                        }}>
                          <span style={{ fontSize: `${12 * SCALE_FACTOR}px`, fontWeight: 500, color: '#1f2937' }}>{lang.name}</span>
                          <span style={{
                            fontSize: `${12 * SCALE_FACTOR}px`,
                            fontWeight: 500,
                            padding: `${2 * SCALE_FACTOR}px ${8 * SCALE_FACTOR}px`,
                            borderRadius: `${4 * SCALE_FACTOR}px`,
                            color: 'white',
                            backgroundColor: colors.primary,
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
                            width: `${(lang.level / 5) * 100}%`,
                            backgroundColor: colors.primary,
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
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textAlign: 'center',
                  color: colors.primary,
                }}>
                  Goal
                </h3>
                <div style={{
                  width: `${48 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  margin: `0 auto ${12 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6, textAlign: 'justify' }}>
                  {personalInfo.professionalGoal}
                </p>
              </div>
            )}

            {/* Biggest Challenge */}
            {personalInfo.biggestChallenge && (
              <div>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  textAlign: 'center',
                  color: colors.primary,
                }}>
                  Challenge
                </h3>
                <div style={{
                  width: `${48 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  margin: `0 auto ${12 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <p style={{ fontSize: `${12 * SCALE_FACTOR}px`, color: '#374151', lineHeight: 1.6, textAlign: 'justify' }}>
                  {personalInfo.biggestChallenge}
                </p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div>
            {/* Experience */}
            {experience.length > 0 && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  color: colors.primary,
                }}>
                  Experience
                </h3>
                <div style={{
                  width: `${64 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  marginBottom: `${16 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${20 * SCALE_FACTOR}px` }}>
                  {experience.map((exp, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${16 * SCALE_FACTOR}px` }}>
                        <div style={{
                          width: `${12 * SCALE_FACTOR}px`,
                          height: `${12 * SCALE_FACTOR}px`,
                          borderRadius: '50%',
                          marginTop: `${4 * SCALE_FACTOR}px`,
                          flexShrink: 0,
                          backgroundColor: colors.primary,
                        }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${8 * SCALE_FACTOR}px` }}>
                            <h4 style={{ fontSize: `${14 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                              {exp.title}
                            </h4>
                            {exp.startYear && (
                              <span style={{
                                fontSize: `${12 * SCALE_FACTOR}px`,
                                padding: `${4 * SCALE_FACTOR}px ${8 * SCALE_FACTOR}px`,
                                borderRadius: `${4 * SCALE_FACTOR}px`,
                                color: 'white',
                                marginLeft: `${8 * SCALE_FACTOR}px`,
                                backgroundColor: colors.secondary,
                              }}>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div style={{ marginBottom: `${24 * SCALE_FACTOR}px` }}>
                <h3 style={{
                  fontSize: `${18 * SCALE_FACTOR}px`,
                  fontWeight: 'bold',
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  color: colors.primary,
                }}>
                  Education
                </h3>
                <div style={{
                  width: `${64 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  marginBottom: `${16 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${16 * SCALE_FACTOR}px` }}>
                  {education.map((edu, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: `${16 * SCALE_FACTOR}px` }}>
                        <div style={{
                          width: `${12 * SCALE_FACTOR}px`,
                          height: `${12 * SCALE_FACTOR}px`,
                          borderRadius: '50%',
                          marginTop: `${4 * SCALE_FACTOR}px`,
                          flexShrink: 0,
                          backgroundColor: colors.primary,
                        }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                            <h4 style={{ fontSize: `${14 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                              {edu.title}
                            </h4>
                            {edu.startYear && (
                              <span style={{
                                fontSize: `${12 * SCALE_FACTOR}px`,
                                padding: `${4 * SCALE_FACTOR}px ${8 * SCALE_FACTOR}px`,
                                borderRadius: `${4 * SCALE_FACTOR}px`,
                                color: 'white',
                                marginLeft: `${8 * SCALE_FACTOR}px`,
                                backgroundColor: colors.secondary,
                              }}>
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
                      </div>
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
                  marginBottom: `${12 * SCALE_FACTOR}px`,
                  color: colors.primary,
                }}>
                  Certifications
                </h3>
                <div style={{
                  width: `${64 * SCALE_FACTOR}px`,
                  height: `${4 * SCALE_FACTOR}px`,
                  marginBottom: `${16 * SCALE_FACTOR}px`,
                  backgroundColor: colors.secondary,
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${12 * SCALE_FACTOR}px` }}>
                  {certifications.map((cert, index) => (
                    <div 
                      key={index}
                      style={{
                        padding: `${12 * SCALE_FACTOR}px`,
                        border: `${1 * SCALE_FACTOR}px solid ${colors.primary}30`,
                        borderRadius: `${8 * SCALE_FACTOR}px`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: `${4 * SCALE_FACTOR}px` }}>
                        <h4 style={{ fontSize: `${12 * SCALE_FACTOR}px`, fontWeight: 600, color: '#111827' }}>
                          {cert.title}
                        </h4>
                        {cert.date && (
                          <span style={{
                            fontSize: `${12 * SCALE_FACTOR}px`,
                            padding: `${4 * SCALE_FACTOR}px ${8 * SCALE_FACTOR}px`,
                            borderRadius: `${4 * SCALE_FACTOR}px`,
                            color: 'white',
                            backgroundColor: colors.secondary,
                          }}>
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
    </div>
  );
}
