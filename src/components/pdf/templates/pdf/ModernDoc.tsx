import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { PDFResumeData } from '@/types/pdf';
import { getPublicAssetUrl, BADGE_PATH } from '../../helpers/pdfUtils';

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
      height: 90,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
    },
    headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
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
    },
    profileImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: '#FFFFFF',
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginLeft: 16,
    },
    profileImg: {
      width: '100%',
      height: '100%',
    },
    // Two-column body
    body: {
      flexDirection: 'row',
      flex: 1,
    },
    leftColumn: {
      width: '35%',
      backgroundColor: '#f9fafb',
      padding: 18,
    },
    rightColumn: {
      flex: 1,
      padding: 18,
    },
    // Section heading
    sectionHeading: {
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      paddingBottom: 5,
      borderBottomWidth: 2,
      borderBottomColor: colors.primary,
      color: colors.primary,
    },
    // Contact
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    contactDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginRight: 6,
    },
    contactText: {
      fontSize: 8,
      color: '#374151',
    },
    // Skills
    skillTag: {
      fontSize: 8,
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 3,
      backgroundColor: `${colors.primary}15`,
      color: colors.primary,
      marginBottom: 4,
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
    // Main content
    summaryText: {
      fontSize: 9,
      lineHeight: 1.5,
      color: '#374151',
      marginBottom: 14,
    },
    // Experience with dots
    expItem: {
      position: 'relative',
      paddingLeft: 12,
      marginBottom: 12,
    },
    expDot: {
      position: 'absolute',
      left: 0,
      top: 3,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    expHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    expTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#111827',
      flex: 1,
      paddingRight: 6,
    },
    expDate: {
      fontSize: 8,
      color: '#6b7280',
    },
    expDescription: {
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
      fontSize: 8,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 2,
    },
    certIssuer: {
      fontSize: 8,
      color: '#374151',
    },
    certDate: {
      fontSize: 7,
      color: '#6b7280',
    },
    certCredential: {
      fontSize: 7,
      color: '#6b7280',
      marginTop: 2,
    },
    sidebarText: {
      fontSize: 8,
      lineHeight: 1.5,
      color: '#374151',
    },
    sectionBlock: {
      marginBottom: 14,
    },
  });
}

export default function ModernDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;
  const s = createStyles(colors);

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {/* Header */}
        <View style={s.header} wrap={false}>
          <View style={s.headerOverlay} />
          <View style={{ flex: 1 }}>
            <Text style={s.headerName}>{personalInfo.name}</Text>
            <Text style={s.headerTitle}>{personalInfo.title}</Text>
          </View>
          {personalInfo.profileImage && (
            <View style={s.profileImage}>
              <Image src={personalInfo.profileImage} style={s.profileImg} />
            </View>
          )}
        </View>

        {/* Body */}
        <View style={s.body}>
          {/* Left Column */}
          <View style={s.leftColumn}>
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
                {skills.slice(0, 10).map((skill, index) => (
                  <Text key={index} style={s.skillTag}>{skill}</Text>
                ))}
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

            {/* Challenge */}
            {personalInfo.biggestChallenge && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Challenge</Text>
                <Text style={s.sidebarText}>{personalInfo.biggestChallenge}</Text>
              </View>
            )}
          </View>

          {/* Right Column */}
          <View style={s.rightColumn}>
            {/* Summary */}
            {personalInfo.summary && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Profile</Text>
                <Text style={s.summaryText}>{personalInfo.summary}</Text>
              </View>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <View style={s.sectionBlock}>
                <Text style={s.sectionHeading}>Experience</Text>
                {experience.map((exp, index) => (
                  <View key={index} style={s.expItem} wrap={false}>
                    <View style={s.expDot} />
                    <View style={s.expHeader}>
                      <Text style={s.expTitle}>{exp.title}</Text>
                      {exp.startYear && (
                        <Text style={s.expDate}>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {exp.description && (
                      <Text style={s.expDescription}>{exp.description}</Text>
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
                  <View key={index} style={s.expItem} wrap={false}>
                    <View style={s.expDot} />
                    <View style={s.expHeader}>
                      <Text style={s.expTitle}>{edu.title}</Text>
                      {edu.startYear && (
                        <Text style={s.expDate}>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {edu.description && (
                      <Text style={s.expDescription}>{edu.description}</Text>
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
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={s.certTitle}>{cert.title}</Text>
                      {cert.date && (
                        <Text style={s.certDate}>
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

        <Image style={s.badge} src={getPublicAssetUrl(BADGE_PATH)} />
      </Page>
    </Document>
  );
}
