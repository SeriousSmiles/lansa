import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface ProfessionalTemplateExportProps {
  data: PDFResumeData;
}

// Pixel-perfect A4 export template
// A4 at 300 DPI: 2480px × 3508px
// All measurements in absolute pixels for perfect rendering
export function ProfessionalTemplateExport({ data }: ProfessionalTemplateExportProps) {
  const { personalInfo, experience, education, skills, colors, languages, certifications } = data;

  // Pixel sizes (scaled from mm: 210mm × 297mm at 300 DPI = 11.81 pixels per mm)
  const TOTAL_WIDTH = 2480;
  const TOTAL_HEIGHT = 3508;
  const SIDEBAR_WIDTH = 1004; // 85mm
  const MAIN_WIDTH = 1476; // 125mm
  const PADDING = 71; // 6mm

  const styles = {
    container: {
      width: `${TOTAL_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '37.5px', // 12px * 3.125
      lineHeight: '1.4',
      position: 'relative' as const,
      overflow: 'hidden',
      display: 'flex',
    },
    badge: {
      position: 'absolute' as const,
      bottom: '47px', // 4 * 11.81
      right: '47px',
      width: '283px', // 24 * 11.81
      opacity: 0.9,
    },
    sidebar: {
      width: `${SIDEBAR_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      backgroundColor: colors.primary,
      color: '#ffffff',
      padding: `${PADDING}px`,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profileImageContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: `${PADDING}px`,
    },
    profileImage: {
      width: '283px', // 24mm
      height: '283px',
      borderRadius: '50%',
      border: '15px solid #ffffff',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    profileImageInner: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    profileInitial: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '75px', // 2xl
      fontWeight: 'bold' as const,
    },
    sectionTitle: {
      fontSize: '56px', // 18px * 3.125
      fontWeight: 'bold' as const,
      marginBottom: '35px',
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
    },
    contactItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '24px',
      fontSize: '44px', // 14px * 3.125
    },
    skillItem: {
      marginBottom: '24px',
      fontSize: '44px',
    },
    languageItem: {
      marginBottom: '35px',
    },
    languageHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '44px',
      marginBottom: '12px',
    },
    languageLevel: {
      fontSize: '37px', // xs
      padding: '6px 24px',
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    progressBar: {
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: '24px',
      height: '24px',
      overflow: 'hidden',
    },
    progressFill: {
      backgroundColor: '#ffffff',
      height: '24px',
      borderRadius: '24px',
    },
    certificationCard: {
      padding: '24px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      marginBottom: '35px',
    },
    certTitle: {
      fontSize: '44px',
      fontWeight: '600' as const,
      marginBottom: '12px',
    },
    certIssuer: {
      fontSize: '37px',
      opacity: 0.8,
      marginBottom: '12px',
    },
    certDate: {
      fontSize: '37px',
      opacity: 0.7,
    },
    goalText: {
      fontSize: '44px',
      opacity: 0.9,
      lineHeight: '1.6',
    },
    mainContent: {
      width: `${MAIN_WIDTH}px`,
      padding: '94px', // 8mm
    },
    name: {
      fontSize: '125px', // 4xl
      fontWeight: 'bold' as const,
      color: '#111827',
      marginBottom: '24px',
    },
    title: {
      fontSize: '66px', // xl
      color: '#4B5563',
      marginBottom: '47px',
    },
    summary: {
      fontSize: '44px',
      color: '#374151',
      lineHeight: '1.6',
    },
    experienceTitle: {
      fontSize: '66px',
      fontWeight: 'bold' as const,
      marginBottom: '47px',
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
      borderBottom: `6px solid ${colors.primary}`,
      paddingBottom: '24px',
      color: colors.primary,
    },
    experienceItem: {
      marginBottom: '71px',
    },
    experienceHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '24px',
    },
    experienceJobTitle: {
      fontSize: '56px',
      fontWeight: '600' as const,
      color: '#111827',
    },
    experienceDate: {
      fontSize: '44px',
      color: '#4B5563',
      marginLeft: '47px',
    },
    experienceDescription: {
      fontSize: '44px',
      color: '#374151',
      lineHeight: '1.6',
    },
  };

  return (
    <div style={styles.container}>
      {/* Powered by Lansa Badge */}
      <img 
        src={lansaBadge} 
        alt="Powered by Lansa" 
        style={styles.badge}
      />
      
      {/* Left Sidebar */}
      <div style={styles.sidebar}>
        {/* Profile Image */}
        <div style={styles.profileImageContainer}>
          <div style={styles.profileImage}>
            {personalInfo.profileImage ? (
              <img 
                src={personalInfo.profileImage} 
                alt={personalInfo.name}
                style={styles.profileImageInner}
              />
            ) : (
              <div style={styles.profileInitial}>
                {personalInfo.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div style={{ marginBottom: `${PADDING}px` }}>
          <h3 style={styles.sectionTitle}>Contact</h3>
          <div>
            {personalInfo.email && (
              <div style={styles.contactItem}>
                <span style={{ marginRight: '24px' }}>📧</span>
                <span style={{ wordBreak: 'break-all' }}>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div style={styles.contactItem}>
                <span style={{ marginRight: '24px' }}>📞</span>
                <span>{personalInfo.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ marginBottom: `${PADDING}px` }}>
            <h3 style={styles.sectionTitle}>Skills</h3>
            <div>
              {skills.slice(0, 8).map((skill, index) => (
                <div key={index} style={styles.skillItem}>
                  <span style={{ marginRight: '24px' }}>•</span>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <div style={{ marginBottom: `${PADDING}px` }}>
            <h3 style={styles.sectionTitle}>Languages</h3>
            <div>
              {languages.map((lang, index) => {
                const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                const levelName = levelNames[lang.level - 1] || 'Unknown';
                
                return (
                  <div key={index} style={styles.languageItem}>
                    <div style={styles.languageHeader}>
                      <span>{lang.name}</span>
                      <span style={styles.languageLevel}>{levelName}</span>
                    </div>
                    <div style={styles.progressBar}>
                      <div 
                        style={{
                          ...styles.progressFill,
                          width: `${(lang.level / 5) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <div style={{ marginBottom: `${PADDING}px` }}>
            <h3 style={styles.sectionTitle}>Certifications</h3>
            <div>
              {certifications.map((cert, index) => (
                <div key={index} style={styles.certificationCard}>
                  <h4 style={styles.certTitle}>
                    {cert.title}
                  </h4>
                  <p style={styles.certIssuer}>{cert.issuer}</p>
                  {cert.date && (
                    <p style={styles.certDate}>
                      {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Professional Goal */}
        {personalInfo.professionalGoal && (
          <div style={{ marginBottom: `${PADDING}px` }}>
            <h3 style={styles.sectionTitle}>Goal</h3>
            <p style={styles.goalText}>
              {personalInfo.professionalGoal}
            </p>
          </div>
        )}

        {/* Biggest Challenge */}
        {personalInfo.biggestChallenge && (
          <div style={{ marginTop: 'auto' }}>
            <h3 style={styles.sectionTitle}>Challenge</h3>
            <p style={styles.goalText}>
              {personalInfo.biggestChallenge}
            </p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Header */}
        <div style={{ marginBottom: '94px' }}>
          <h1 style={styles.name}>
            {personalInfo.name}
          </h1>
          <h2 style={styles.title}>
            {personalInfo.title}
          </h2>
          {personalInfo.summary && (
            <p style={styles.summary}>
              {personalInfo.summary}
            </p>
          )}
        </div>

        {/* Experience */}
        {experience.length > 0 && (
          <div style={{ marginBottom: '94px' }}>
            <h3 style={styles.experienceTitle}>
              Experience
            </h3>
            <div>
              {experience.map((exp, index) => (
                <div key={index} style={styles.experienceItem}>
                  <div style={styles.experienceHeader}>
                    <h4 style={styles.experienceJobTitle}>
                      {exp.title}
                    </h4>
                    <div style={styles.experienceDate}>
                      {exp.startYear && (
                        <span>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                  </div>
                  {exp.description && (
                    <p style={styles.experienceDescription}>
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
          <div style={{ marginBottom: '94px' }}>
            <h3 style={styles.experienceTitle}>
              Education
            </h3>
            <div>
              {education.map((edu, index) => (
                <div key={index} style={styles.experienceItem}>
                  <div style={styles.experienceHeader}>
                    <h4 style={styles.experienceJobTitle}>
                      {edu.title}
                    </h4>
                    <div style={styles.experienceDate}>
                      {edu.startYear && (
                        <span>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </span>
                      )}
                    </div>
                  </div>
                  {edu.description && (
                    <p style={styles.experienceDescription}>
                      {edu.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
