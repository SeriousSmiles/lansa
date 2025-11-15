import React from 'react';
import { PDFResumeData } from '@/types/pdf';
import { ContentSection } from '@/types/pagination';
import lansaBadge from '@/assets/powered-by-lansa-badge.png';

interface ProfessionalTemplateExportMultiPageProps {
  data: PDFResumeData;
}

// Calculate pagination inline
const calculatePagination = (data: PDFResumeData) => {
  const PAGE_HEIGHT = 3508;
  const PADDING_TOP = 78;
  const PADDING_BOTTOM = 94;
  const USABLE_HEIGHT = PAGE_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  const HEIGHTS = {
    name: 150,
    jobTitle: 80,
    summary: 200,
    sectionTitle: 90,
    experienceItem: 280,
    educationItem: 200,
    skillItem: 50,
    spacing: 40,
  };

  const sections: ContentSection[] = [];

  // Header
  sections.push({
    type: 'header',
    height: HEIGHTS.name + HEIGHTS.jobTitle + HEIGHTS.spacing,
    data: { name: data.personalInfo.name, title: data.personalInfo.title },
  });

  // Summary
  if (data.personalInfo.summary) {
    const summaryLines = Math.ceil(data.personalInfo.summary.length / 80);
    const summaryHeight = HEIGHTS.sectionTitle + (summaryLines * 55) + HEIGHTS.spacing;
    sections.push({
      type: 'summary',
      height: summaryHeight,
      data: data.personalInfo.summary,
    });
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    sections.push({
      type: 'experience',
      height: HEIGHTS.sectionTitle,
      data: { isTitle: true },
    });

    data.experience.forEach((exp, index) => {
      const descriptionLines = exp.description ? Math.ceil(exp.description.length / 100) : 0;
      const itemHeight = HEIGHTS.experienceItem + (descriptionLines * 30);
      sections.push({
        type: 'experience',
        height: itemHeight,
        data: exp,
        index,
      });
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    sections.push({
      type: 'education',
      height: HEIGHTS.sectionTitle,
      data: { isTitle: true },
    });

    data.education.forEach((edu, index) => {
      sections.push({
        type: 'education',
        height: HEIGHTS.educationItem,
        data: edu,
        index,
      });
    });
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    sections.push({
      type: 'skills',
      height: HEIGHTS.sectionTitle,
      data: { isTitle: true },
    });

    const skillsHeight = Math.ceil(data.skills.length / 3) * HEIGHTS.skillItem;
    sections.push({
      type: 'skills',
      height: skillsHeight,
      data: data.skills,
    });
  }

  // Paginate sections
  const pages: ContentSection[][] = [];
  let currentPage: ContentSection[] = [];
  let currentHeight = 0;

  sections.forEach((section) => {
    if (currentHeight + section.height > USABLE_HEIGHT && currentPage.length > 0) {
      pages.push(currentPage);
      currentPage = [];
      currentHeight = 0;
    }

    if (section.height > USABLE_HEIGHT) {
      console.warn(`Section ${section.type} exceeds page height, may cause overflow`);
    }

    currentPage.push(section);
    currentHeight += section.height;
  });

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  const totalHeight = sections.reduce((sum, s) => sum + s.height, 0);
  const hasOverflow = totalHeight > (USABLE_HEIGHT * 3);

  return {
    pages,
    totalPages: pages.length,
    hasOverflow,
  };
};

export function ProfessionalTemplateExportMultiPage({ data }: ProfessionalTemplateExportMultiPageProps) {
  const { pages, totalPages } = calculatePagination(data);
  const { personalInfo, experience, education, skills, colors, languages, certifications } = data;

  // Pixel sizes (A4 at 300 DPI)
  const TOTAL_WIDTH = 2480;
  const TOTAL_HEIGHT = 3508;
  const SIDEBAR_WIDTH = 1004;
  const MAIN_WIDTH = 1476;
  const PADDING = 71;

  const styles = {
    container: {
      width: `${TOTAL_WIDTH}px`,
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: '37.5px',
      lineHeight: '1.35',
      position: 'relative' as const,
    },
    page: {
      width: `${TOTAL_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      display: 'flex',
      position: 'relative' as const,
      pageBreakAfter: 'always' as const,
      overflow: 'hidden',
    },
    lastPage: {
      pageBreakAfter: 'auto' as const,
    },
    badge: {
      position: 'absolute' as const,
      bottom: '47px',
      right: '47px',
      width: '283px',
      opacity: 0.9,
    },
    sidebar: {
      width: `${SIDEBAR_WIDTH}px`,
      height: `${TOTAL_HEIGHT}px`,
      backgroundColor: colors.primary,
      color: '#ffffff',
      padding: `${PADDING}px`,
      paddingTop: `${PADDING - 16}px`,
      display: 'flex',
      flexDirection: 'column' as const,
    },
    profileImageContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: `${PADDING}px`,
    },
    profileImage: {
      width: '283px',
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
      fontSize: '75px',
      fontWeight: 'bold' as const,
    },
    sectionTitle: {
      fontSize: '56px',
      fontWeight: 'bold' as const,
      marginTop: '-12px',
      marginBottom: '28px',
      textTransform: 'uppercase' as const,
      letterSpacing: '2px',
    },
    contactItem: {
      display: 'flex',
      alignItems: 'flex-start',
      marginBottom: '24px',
      fontSize: '44px',
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
      fontSize: '37px',
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
      marginBottom: '6px',
    },
    certDate: {
      fontSize: '37px',
      opacity: 0.7,
    },
    goalText: {
      fontSize: '44px',
      opacity: 0.9,
      lineHeight: '1.52',
      marginTop: '-6px',
    },
    mainContent: {
      width: `${MAIN_WIDTH}px`,
      padding: '94px',
      paddingTop: '78px',
      overflow: 'hidden',
    },
    name: {
      fontSize: '125px',
      fontWeight: 'bold' as const,
      color: '#111827',
      marginTop: '-20px',
      marginBottom: '16px',
    },
    title: {
      fontSize: '66px',
      color: '#4B5563',
      marginTop: '-8px',
      marginBottom: '37px',
    },
    summary: {
      fontSize: '44px',
      color: '#374151',
      lineHeight: '1.52',
      marginTop: '-6px',
    },
    experienceTitle: {
      fontSize: '66px',
      fontWeight: 'bold' as const,
      marginTop: '-10px',
      marginBottom: '37px',
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
      lineHeight: '1.52',
      marginTop: '-6px',
    },
  };

  const renderSidebar = () => (
    <div style={styles.sidebar}>
      {/* Profile Image */}
      {personalInfo.profileImage && (
        <div style={styles.profileImageContainer}>
          <div style={styles.profileImage}>
            <img src={personalInfo.profileImage} alt={personalInfo.name} style={styles.profileImageInner} />
          </div>
        </div>
      )}

      {!personalInfo.profileImage && (
        <div style={styles.profileImageContainer}>
          <div style={styles.profileImage}>
            <div style={styles.profileInitial}>
              {personalInfo.name?.charAt(0) || 'U'}
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div style={{ marginBottom: `${PADDING}px` }}>
        <h3 style={styles.sectionTitle}>Contact</h3>
        {personalInfo.email && (
          <div style={styles.contactItem}>{personalInfo.email}</div>
        )}
        {personalInfo.phone && (
          <div style={styles.contactItem}>{personalInfo.phone}</div>
        )}
        {personalInfo.location && (
          <div style={styles.contactItem}>{personalInfo.location}</div>
        )}
      </div>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div style={{ marginBottom: `${PADDING}px` }}>
          <h3 style={styles.sectionTitle}>Skills</h3>
          {skills.map((skill, index) => (
            <div key={index} style={styles.skillItem}>• {skill}</div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages && languages.length > 0 && (
        <div style={{ marginBottom: `${PADDING}px` }}>
          <h3 style={styles.sectionTitle}>Languages</h3>
          {languages.map((lang, index) => {
            const proficiencyLabels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
            const proficiency = proficiencyLabels[lang.level - 1] || 'Intermediate';
            
            return (
              <div key={index} style={styles.languageItem}>
                <div style={styles.languageHeader}>
                  <span style={{ fontWeight: '600' }}>{lang.name}</span>
                  <span style={styles.languageLevel}>{proficiency}</span>
                </div>
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${(lang.level / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Certifications */}
      {certifications && certifications.length > 0 && (
        <div style={{ marginBottom: `${PADDING}px` }}>
          <h3 style={styles.sectionTitle}>Certifications</h3>
          {certifications.map((cert, index) => (
            <div key={index} style={styles.certificationCard}>
              <div style={styles.certTitle}>{cert.title}</div>
              <div style={styles.certIssuer}>{cert.issuer}</div>
              {cert.date && <div style={styles.certDate}>{cert.date}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Professional Goal */}
      {personalInfo.professionalGoal && (
        <div style={{ marginBottom: `${PADDING}px` }}>
          <h3 style={styles.sectionTitle}>Goal</h3>
          <div style={styles.goalText}>{personalInfo.professionalGoal}</div>
        </div>
      )}

      {/* Biggest Challenge */}
      {personalInfo.biggestChallenge && (
        <div>
          <h3 style={styles.sectionTitle}>Challenge</h3>
          <div style={styles.goalText}>{personalInfo.biggestChallenge}</div>
        </div>
      )}
    </div>
  );

  const renderSection = (section: ContentSection) => {
    switch (section.type) {
      case 'header':
        return (
          <div key="header">
            <h1 style={styles.name}>{section.data.name}</h1>
            <h2 style={styles.title}>{section.data.title}</h2>
          </div>
        );

      case 'summary':
        if (section.data) {
          return (
            <div key="summary" style={{ marginBottom: '47px' }}>
              <h3 style={styles.experienceTitle}>Professional Summary</h3>
              <p style={styles.summary}>{section.data}</p>
            </div>
          );
        }
        return null;

      case 'experience':
        if (section.data.isTitle) {
          return <h3 key="exp-title" style={styles.experienceTitle}>Experience</h3>;
        }
        const exp = section.data;
        return (
          <div key={`exp-${section.index}`} style={styles.experienceItem}>
            <div style={styles.experienceHeader}>
              <div>
                <div style={styles.experienceJobTitle}>{exp.position}</div>
                <div style={{ ...styles.experienceDate, marginLeft: 0, marginTop: '12px' }}>
                  {exp.company}
                </div>
              </div>
              <div style={styles.experienceDate}>
                {exp.startDate} - {exp.endDate || 'Present'}
              </div>
            </div>
            {exp.description && (
              <div style={styles.experienceDescription}>{exp.description}</div>
            )}
          </div>
        );

      case 'education':
        if (section.data.isTitle) {
          return <h3 key="edu-title" style={styles.experienceTitle}>Education</h3>;
        }
        const edu = section.data;
        return (
          <div key={`edu-${section.index}`} style={styles.experienceItem}>
            <div style={styles.experienceHeader}>
              <div>
                <div style={styles.experienceJobTitle}>{edu.degree}</div>
                <div style={{ ...styles.experienceDate, marginLeft: 0, marginTop: '12px' }}>
                  {edu.institution}
                </div>
              </div>
              <div style={styles.experienceDate}>{edu.year}</div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div key="skills-section" style={{ marginBottom: '40px' }}>
            <h3 style={styles.experienceTitle}>Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              {section.data.map((skill: string, index: number) => (
                <div key={index} style={{ ...styles.skillItem, flex: '0 0 30%' }}>
                  • {skill}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div id="pdf-resume-export-container" style={styles.container}>
      {pages.map((pageSections, pageIndex) => (
        <div
          key={`page-${pageIndex}`}
          className="pdf-page"
          style={{
            ...styles.page,
            ...(pageIndex === pages.length - 1 ? styles.lastPage : {}),
          }}
        >
          {/* Badge only on last page */}
          {pageIndex === pages.length - 1 && (
            <img src={lansaBadge} alt="Powered by Lansa" style={styles.badge} />
          )}

          {/* Sidebar on every page */}
          {renderSidebar()}

          {/* Main content for this page */}
          <div style={styles.mainContent}>
            {pageSections.map((section, sectionIndex) => renderSection(section))}
          </div>
        </div>
      ))}
    </div>
  );
}
