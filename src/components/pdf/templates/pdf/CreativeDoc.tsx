import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { PDFResumeData } from '@/types/pdf';

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };
  return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
}

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
    // Header gradient area
    headerBanner: {
      height: 70,
      backgroundColor: colors.primary,
    },
    // Profile image circle overlapping header
    profileContainer: {
      alignItems: 'center',
      marginTop: -35,
      marginBottom: 12,
    },
    profileCircle: {
      width: 70,
      height: 70,
      borderRadius: 35,
      borderWidth: 3,
      borderColor: '#FFFFFF',
      overflow: 'hidden',
      backgroundColor: colors.primary,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    profileInitial: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    // Name & title
    nameSection: {
      textAlign: 'center',
      marginBottom: 16,
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 4,
    },
    title: {
      fontSize: 12,
      fontWeight: 'medium' as any,
      color: colors.primary,
    },
    // Contact bar
    contactBar: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
      marginBottom: 20,
      marginHorizontal: 24,
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 50,
      backgroundColor: colors.primary,
    },
    contactText: {
      fontSize: 8,
      color: '#FFFFFF',
    },
    // Two-column
    twoColumn: {
      flexDirection: 'row',
      paddingHorizontal: 24,
      gap: 16,
    },
    leftColumn: {
      width: '33%',
    },
    rightColumn: {
      width: '67%',
    },
    // Section heading with decorative line
    sectionHeading: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 6,
      textAlign: 'center',
      color: colors.primary,
    },
    sectionHeadingLeft: {
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 6,
      color: colors.primary,
    },
    decorativeLine: {
      width: 36,
      height: 3,
      backgroundColor: colors.secondary,
      alignSelf: 'center',
      marginBottom: 8,
    },
    decorativeLineLeft: {
      width: 48,
      height: 3,
      backgroundColor: colors.secondary,
      marginBottom: 10,
    },
    // Skills pills
    skillPill: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 50,
      backgroundColor: colors.primary,
      marginBottom: 5,
      alignSelf: 'center',
    },
    skillText: {
      fontSize: 8,
      fontWeight: 'medium' as any,
      color: '#FFFFFF',
      textAlign: 'center',
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
      fontSize: 8,
      fontWeight: 'medium' as any,
      color: '#1f2937',
    },
    languageBadge: {
      fontSize: 7,
      fontWeight: 'medium' as any,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 3,
      color: '#FFFFFF',
      backgroundColor: colors.primary,
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
    // Experience items with dot
    experienceItem: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginTop: 3,
    },
    experienceContent: {
      flex: 1,
    },
    expHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    expTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#111827',
      flex: 1,
      paddingRight: 6,
    },
    dateBadge: {
      fontSize: 8,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      color: '#FFFFFF',
      backgroundColor: colors.secondary,
    },
    expDescription: {
      fontSize: 9,
      lineHeight: 1.5,
      color: '#374151',
    },
    // Certifications
    certCard: {
      padding: 8,
      borderWidth: 1,
      borderColor: `${colors.primary}30`,
      borderRadius: 6,
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
    // Sidebar text
    sidebarText: {
      fontSize: 8,
      lineHeight: 1.6,
      color: '#374151',
    },
    sectionBlock: {
      marginBottom: 14,
    },
  });
}

export default function CreativeDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;
  const s = createStyles(colors);
  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {/* Gradient Header Banner */}
        <View style={s.headerBanner} />

        {/* Profile Image */}
        <View style={s.profileContainer}>
          <View style={s.profileCircle}>
            {personalInfo.profileImage ? (
              <Image src={personalInfo.profileImage} style={s.profileImage} />
            ) : (
              <View style={s.profileInitial}>
                <Text>{personalInfo.name.charAt(0)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Name & Title */}
        <View style={s.nameSection} wrap={false}>
          <Text style={s.name}>{personalInfo.name}</Text>
          <Text style={s.title}>{personalInfo.title}</Text>
        </View>

        {/* Contact Bar */}
        <View style={s.contactBar} wrap={false}>
          {personalInfo.phone && <Text style={s.contactText}>📞 {personalInfo.phone}</Text>}
          {personalInfo.email && <Text style={s.contactText}>✉️ {personalInfo.email}</Text>}
        </View>

        {/* Two-Column Layout */}
        <View style={s.twoColumn}>
          {/* Left Column */}
          <View style={s.leftColumn}>
            {/* Summary */}
            {personalInfo.summary && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Profile</Text>
                <View style={s.decorativeLine} />
                <Text style={s.sidebarText}>{personalInfo.summary}</Text>
              </View>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Skills</Text>
                <View style={s.decorativeLine} />
                {skills.slice(0, 8).map((skill, index) => (
                  <View key={index} style={s.skillPill}>
                    <Text style={s.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Languages</Text>
                <View style={s.decorativeLine} />
                {languages.map((lang, index) => {
                  const levelName = levelNames[lang.level - 1] || 'Unknown';
                  const progressWidth = `${(lang.level / 5) * 100}%`;
                  return (
                    <View key={index} style={s.languageItem}>
                      <View style={s.languageHeader}>
                        <Text style={s.languageName}>{lang.name}</Text>
                        <Text style={s.languageBadge}>{levelName}</Text>
                      </View>
                      <View style={s.languageBar}>
                        <View style={[s.languageProgress, { width: progressWidth }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Professional Goal */}
            {personalInfo.professionalGoal && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Goal</Text>
                <View style={s.decorativeLine} />
                <Text style={s.sidebarText}>{personalInfo.professionalGoal}</Text>
              </View>
            )}

            {/* Biggest Challenge */}
            {personalInfo.biggestChallenge && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Challenge</Text>
                <View style={s.decorativeLine} />
                <Text style={s.sidebarText}>{personalInfo.biggestChallenge}</Text>
              </View>
            )}
          </View>

          {/* Right Column */}
          <View style={s.rightColumn}>
            {/* Experience */}
            {experience.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeadingLeft}>Experience</Text>
                <View style={s.decorativeLineLeft} />
                {experience.map((exp, index) => (
                  <View key={index} style={s.experienceItem} wrap={false}>
                    <View style={s.dot} />
                    <View style={s.experienceContent}>
                      <View style={s.expHeader}>
                        <Text style={s.expTitle}>{exp.title}</Text>
                        {exp.startYear && (
                          <Text style={s.dateBadge}>
                            {exp.startYear} - {exp.endYear || 'Present'}
                          </Text>
                        )}
                      </View>
                      {exp.description && (
                        <Text style={s.expDescription}>{exp.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {education.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeadingLeft}>Education</Text>
                <View style={s.decorativeLineLeft} />
                {education.map((edu, index) => (
                  <View key={index} style={s.experienceItem} wrap={false}>
                    <View style={s.dot} />
                    <View style={s.experienceContent}>
                      <View style={s.expHeader}>
                        <Text style={s.expTitle}>{edu.title}</Text>
                        {edu.startYear && (
                          <Text style={s.dateBadge}>
                            {edu.startYear} - {edu.endYear || 'Present'}
                          </Text>
                        )}
                      </View>
                      {edu.description && (
                        <Text style={s.expDescription}>{edu.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeadingLeft}>Certifications</Text>
                <View style={s.decorativeLineLeft} />
                {certifications.map((cert, index) => (
                  <View key={index} style={s.certCard} wrap={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={s.certTitle}>{cert.title}</Text>
                      {cert.date && (
                        <Text style={s.dateBadge}>
                          {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Text>
                      )}
                    </View>
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

        <Image style={s.badge} src="/powered-by-lansa-badge.png" />
      </Page>
    </Document>
  );
}
