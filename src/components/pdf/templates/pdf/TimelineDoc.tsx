import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { PDFResumeData } from '@/types/pdf';

function createStyles(colors: { primary: string; secondary: string }) {
  return StyleSheet.create({
    page: {
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
    },
    badge: {
      position: 'absolute',
      bottom: 15,
      right: 15,
      width: 90,
      opacity: 0.9,
    },
    // Header
    header: {
      padding: 24,
      paddingBottom: 18,
      backgroundColor: colors.primary,
      color: '#FFFFFF',
    },
    headerName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 12,
      color: '#FFFFFF',
      opacity: 0.9,
      marginBottom: 8,
    },
    headerContact: {
      flexDirection: 'row',
      gap: 12,
    },
    headerContactText: {
      fontSize: 9,
      color: '#FFFFFF',
    },
    // Content
    content: {
      padding: 20,
    },
    // Summary
    summaryBlock: {
      marginBottom: 16,
    },
    sectionHeading: {
      fontSize: 11,
      fontWeight: 'bold',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      paddingBottom: 4,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
    },
    summaryText: {
      fontSize: 9,
      lineHeight: 1.5,
      color: '#374151',
    },
    // Timeline section
    timelineSection: {
      marginBottom: 16,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    // Timeline left column (line + dot)
    timelineLeft: {
      width: 20,
      alignItems: 'center',
    },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginBottom: 2,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: `${colors.primary}40`,
    },
    // Timeline right content
    timelineRight: {
      flex: 1,
      paddingLeft: 8,
    },
    timelineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    timelineTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#111827',
      flex: 1,
      paddingRight: 6,
    },
    timelineDate: {
      fontSize: 8,
      color: '#6b7280',
    },
    timelineDescription: {
      fontSize: 9,
      lineHeight: 1.5,
      color: '#374151',
    },
    // Two-column bottom
    twoColumn: {
      flexDirection: 'row',
      gap: 16,
    },
    column: {
      flex: 1,
    },
    // Skills
    skillsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    skillPill: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      backgroundColor: `${colors.primary}15`,
      marginBottom: 3,
    },
    skillText: {
      fontSize: 8,
      color: colors.primary,
    },
    // Languages
    languageItem: {
      marginBottom: 6,
    },
    languageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    languageName: {
      fontSize: 8,
      fontWeight: 'medium' as any,
      color: '#1f2937',
    },
    languageLevelText: {
      fontSize: 7,
      color: '#6b7280',
    },
    languageBar: {
      width: '100%',
      height: 4,
      backgroundColor: '#e5e7eb',
      borderRadius: 2,
    },
    languageProgress: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.primary,
    },
    // Certifications
    certCard: {
      padding: 6,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      borderRadius: 4,
      marginBottom: 6,
    },
    certTitle: {
      fontSize: 8,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 1,
    },
    certIssuer: {
      fontSize: 7,
      color: '#374151',
    },
    certCredential: {
      fontSize: 7,
      color: '#6b7280',
      marginTop: 1,
    },
    goalText: {
      fontSize: 8,
      lineHeight: 1.5,
      color: '#374151',
    },
    sectionBlock: {
      marginBottom: 12,
    },
  });
}

export default function TimelineDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;
  const s = createStyles(colors);
  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {/* Header */}
        <View style={s.header} wrap={false}>
          <Text style={s.headerName}>{personalInfo.name}</Text>
          <Text style={s.headerTitle}>{personalInfo.title}</Text>
          <View style={s.headerContact}>
            {personalInfo.email && <Text style={s.headerContactText}>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text style={s.headerContactText}>{personalInfo.phone}</Text>}
          </View>
        </View>

        <View style={s.content}>
          {/* Summary */}
          {personalInfo.summary && (
            <View style={s.summaryBlock}>
              <Text style={s.sectionHeading}>Profile</Text>
              <Text style={s.summaryText}>{personalInfo.summary}</Text>
            </View>
          )}

          {/* Experience Timeline */}
          {experience.length > 0 && (
            <View style={s.timelineSection}>
              <Text style={s.sectionHeading}>Experience</Text>
              {experience.map((exp, index) => (
                <View key={index} style={s.timelineItem} wrap={false}>
                  <View style={s.timelineLeft}>
                    <View style={s.timelineDot} />
                    {index < experience.length - 1 && <View style={s.timelineLine} />}
                  </View>
                  <View style={s.timelineRight}>
                    <View style={s.timelineHeader}>
                      <Text style={s.timelineTitle}>{exp.title}</Text>
                      {exp.startYear && (
                        <Text style={s.timelineDate}>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {exp.description && (
                      <Text style={s.timelineDescription}>{exp.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Education Timeline */}
          {education.length > 0 && (
            <View style={s.timelineSection}>
              <Text style={s.sectionHeading}>Education</Text>
              {education.map((edu, index) => (
                <View key={index} style={s.timelineItem} wrap={false}>
                  <View style={s.timelineLeft}>
                    <View style={s.timelineDot} />
                    {index < education.length - 1 && <View style={s.timelineLine} />}
                  </View>
                  <View style={s.timelineRight}>
                    <View style={s.timelineHeader}>
                      <Text style={s.timelineTitle}>{edu.title}</Text>
                      {edu.startYear && (
                        <Text style={s.timelineDate}>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {edu.description && (
                      <Text style={s.timelineDescription}>{edu.description}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Bottom two-column: Skills + Languages / Goal + Certifications */}
          <View style={s.twoColumn}>
            <View style={s.column}>
              {/* Skills */}
              {skills.length > 0 && (
                <View style={s.sectionBlock}>
                  <Text style={s.sectionHeading}>Skills</Text>
                  <View style={s.skillsWrap}>
                    {skills.slice(0, 10).map((skill, index) => (
                      <View key={index} style={s.skillPill}>
                        <Text style={s.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Languages */}
              {languages && languages.length > 0 && (
                <View style={s.sectionBlock}>
                  <Text style={s.sectionHeading}>Languages</Text>
                  {languages.map((lang, index) => {
                    const levelName = levelNames[lang.level - 1] || 'Unknown';
                    const percentage = (lang.level / 5) * 100;
                    return (
                      <View key={index} style={s.languageItem}>
                        <View style={s.languageHeader}>
                          <Text style={s.languageName}>{lang.name}</Text>
                          <Text style={s.languageLevelText}>{levelName}</Text>
                        </View>
                        <View style={s.languageBar}>
                          <View style={[s.languageProgress, { width: `${percentage}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={s.column}>
              {/* Professional Goal */}
              {personalInfo.professionalGoal && (
                <View style={s.sectionBlock}>
                  <Text style={s.sectionHeading}>Objective</Text>
                  <Text style={s.goalText}>{personalInfo.professionalGoal}</Text>
                </View>
              )}

              {/* Biggest Challenge */}
              {personalInfo.biggestChallenge && (
                <View style={s.sectionBlock}>
                  <Text style={s.sectionHeading}>Challenge</Text>
                  <Text style={s.goalText}>{personalInfo.biggestChallenge}</Text>
                </View>
              )}

              {/* Certifications */}
              {certifications && certifications.length > 0 && (
                <View style={s.sectionBlock}>
                  <Text style={s.sectionHeading}>Certifications</Text>
                  {certifications.map((cert, index) => (
                    <View key={index} style={s.certCard} wrap={false}>
                      <Text style={s.certTitle}>{cert.title}</Text>
                      <Text style={s.certIssuer}>{cert.issuer}</Text>
                      {cert.credentialId && (
                        <Text style={s.certCredential}>ID: {cert.credentialId}</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        <Image style={s.badge} src="/powered-by-lansa-badge.png" />
      </Page>
    </Document>
  );
}
