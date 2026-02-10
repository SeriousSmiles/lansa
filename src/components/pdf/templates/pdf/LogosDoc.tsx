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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 50,
    },
    badgeIcon: {
      width: 12,
      height: 12,
    },
    badgeText: {
      fontSize: 8,
      fontWeight: 'medium' as any,
      color: '#1A1F71',
    },
    // Header
    header: {
      padding: 24,
      paddingBottom: 16,
      borderBottomWidth: 3,
      borderBottomColor: colors.primary,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    name: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 4,
    },
    title: {
      fontSize: 14,
      color: '#374151',
    },
    profileImage: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: colors.primary,
      overflow: 'hidden',
    },
    profileImg: {
      width: '100%',
      height: '100%',
    },
    // Two-column layout
    body: {
      flexDirection: 'row',
      flex: 1,
    },
    sidebar: {
      width: '35%',
      backgroundColor: '#F9FAFB',
      padding: 20,
    },
    mainContent: {
      width: '65%',
      padding: 20,
    },
    // Section heading
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
    // Contact
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    contactDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginRight: 6,
    },
    contactText: {
      fontSize: 9,
      color: '#374151',
    },
    // Skills as pills
    skillsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    skillPill: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      backgroundColor: `${colors.primary}20`,
      marginBottom: 4,
    },
    skillText: {
      fontSize: 8,
      color: colors.primary,
    },
    // Languages
    languageItem: {
      marginBottom: 8,
    },
    languageHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    languageName: {
      fontSize: 9,
      fontWeight: 'medium' as any,
      color: '#1f2937',
    },
    languagePercent: {
      fontSize: 8,
      color: '#6b7280',
    },
    languageBar: {
      width: '100%',
      height: 5,
      backgroundColor: '#e5e7eb',
      borderRadius: 3,
    },
    languageProgress: {
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    // Main content items
    itemContainer: {
      marginBottom: 14,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    itemTitle: {
      fontSize: 11,
      fontWeight: 'bold',
      color: '#111827',
      flex: 1,
      paddingRight: 6,
    },
    itemDate: {
      fontSize: 9,
      color: '#6b7280',
    },
    itemDescription: {
      fontSize: 9,
      lineHeight: 1.5,
      color: '#374151',
    },
    // Certifications
    certCard: {
      padding: 6,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      borderRadius: 4,
      marginBottom: 8,
    },
    certTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    certIssuer: {
      fontSize: 8,
      color: '#374151',
    },
    certCredential: {
      fontSize: 7,
      color: '#6b7280',
      marginTop: 2,
    },
    sidebarText: {
      fontSize: 9,
      lineHeight: 1.5,
      color: '#374151',
    },
    sectionBlock: {
      marginBottom: 14,
    },
  });
}

export default function LogosDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;
  const s = createStyles(colors);
  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {/* Header */}
        <View style={s.header} wrap={false}>
          <View style={s.headerContent}>
            <View>
              <Text style={s.name}>{personalInfo.name}</Text>
              <Text style={s.title}>{personalInfo.title}</Text>
            </View>
            {personalInfo.profileImage && (
              <View style={s.profileImage}>
                <Image src={personalInfo.profileImage} style={s.profileImg} />
              </View>
            )}
          </View>
        </View>

        {/* Body */}
        <View style={s.body}>
          {/* Sidebar */}
          <View style={s.sidebar}>
            {/* Contact */}
            <View style={s.sectionBlock}>
              <Text style={s.sectionHeading}>Contact</Text>
              {personalInfo.email && (
                <View style={s.contactItem}>
                  <View style={s.contactDot} />
                  <Text style={s.contactText}>{personalInfo.email}</Text>
                </View>
              )}
              {personalInfo.phone && (
                <View style={s.contactItem}>
                  <View style={s.contactDot} />
                  <Text style={s.contactText}>{personalInfo.phone}</Text>
                </View>
              )}
            </View>

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
                  const percentage = (lang.level / 5) * 100;
                  return (
                    <View key={index} style={s.languageItem}>
                      <View style={s.languageHeader}>
                        <Text style={s.languageName}>{lang.name}</Text>
                        <Text style={s.languagePercent}>{percentage}%</Text>
                      </View>
                      <View style={s.languageBar}>
                        <View style={[s.languageProgress, { width: `${percentage}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Professional Goal */}
            {personalInfo.professionalGoal && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Objective</Text>
                <Text style={s.sidebarText}>{personalInfo.professionalGoal}</Text>
              </View>
            )}

            {/* Biggest Challenge */}
            {personalInfo.biggestChallenge && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Challenge</Text>
                <Text style={s.sidebarText}>{personalInfo.biggestChallenge}</Text>
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={s.mainContent}>
            {/* Summary */}
            {personalInfo.summary && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Profile</Text>
                <Text style={s.itemDescription}>{personalInfo.summary}</Text>
              </View>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Experience</Text>
                {experience.map((exp, index) => (
                  <View key={index} style={s.itemContainer} wrap={false}>
                    <View style={s.itemHeader}>
                      <Text style={s.itemTitle}>{exp.title}</Text>
                      {exp.startYear && (
                        <Text style={s.itemDate}>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {exp.description && (
                      <Text style={s.itemDescription}>{exp.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {education.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Education</Text>
                {education.map((edu, index) => (
                  <View key={index} style={s.itemContainer} wrap={false}>
                    <View style={s.itemHeader}>
                      <Text style={s.itemTitle}>{edu.title}</Text>
                      {edu.startYear && (
                        <Text style={s.itemDate}>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {edu.description && (
                      <Text style={s.itemDescription}>{edu.description}</Text>
                    )}
                  </View>
                ))}
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

        {/* Badge */}
        <View style={s.badge}>
          <Image src="/lansa-icon.svg" style={s.badgeIcon} />
          <Text style={s.badgeText}>Powered by Lansa</Text>
        </View>
      </Page>
    </Document>
  );
}
