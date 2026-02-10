import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { PDFResumeData } from '@/types/pdf';

const styles = StyleSheet.create({
  page: {
    padding: 32,
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
    textAlign: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  contactText: {
    fontSize: 9,
    color: '#6b7280',
  },
  // Sections
  sectionHeading: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 5,
  },
  summaryText: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 20,
  },
  // Two-column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 24,
  },
  mainColumn: {
    width: '65%',
  },
  sideColumn: {
    width: '35%',
  },
  // Experience / Education items
  itemContainer: {
    marginBottom: 16,
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
    paddingRight: 8,
  },
  itemDate: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: 'medium' as any,
  },
  itemDescription: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
  },
  // Skills
  skillItem: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 4,
    lineHeight: 1.5,
  },
  // Languages
  languageItem: {
    marginBottom: 8,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 9,
    fontWeight: 'medium' as any,
    color: '#1f2937',
  },
  languageBadge: {
    fontSize: 8,
    fontWeight: 'medium' as any,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    color: '#374151',
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
    backgroundColor: '#374151',
  },
  // Certification cards
  certCard: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
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
    fontSize: 9,
    color: '#374151',
  },
  certDate: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  certCredential: {
    fontSize: 8,
    color: '#6b7280',
    marginTop: 2,
  },
  // Profile image
  profileImageContainer: {
    width: 80,
    height: 80,
    borderWidth: 3,
    borderColor: '#d1d5db',
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  goalText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: '#374151',
  },
  sectionBlock: {
    marginBottom: 16,
  },
});

export default function ClassicDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, languages, colors, certifications } = data;
  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={styles.header} wrap={false}>
          <Text style={styles.name}>{personalInfo.name}</Text>
          <Text style={styles.title}>{personalInfo.title}</Text>
          <View style={styles.contactRow}>
            {personalInfo.email && <Text style={styles.contactText}>{personalInfo.email}</Text>}
            {personalInfo.phone && <Text style={styles.contactText}>{personalInfo.phone}</Text>}
          </View>
        </View>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <View wrap={false}>
            <Text style={styles.sectionHeading}>Professional Summary</Text>
            <Text style={styles.summaryText}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Two-column layout */}
        <View style={styles.twoColumn}>
          {/* Main Content */}
          <View style={styles.mainColumn}>
            {/* Experience */}
            {experience.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>Professional Experience</Text>
                {experience.map((exp, index) => (
                  <View key={index} style={styles.itemContainer} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{exp.title}</Text>
                      {exp.startYear && (
                        <Text style={styles.itemDate}>
                          {exp.startYear} - {exp.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {exp.description && (
                      <Text style={styles.itemDescription}>{exp.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {education.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>Education</Text>
                {education.map((edu, index) => (
                  <View key={index} style={styles.itemContainer} wrap={false}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>{edu.title}</Text>
                      {edu.startYear && (
                        <Text style={styles.itemDate}>
                          {edu.startYear} - {edu.endYear || 'Present'}
                        </Text>
                      )}
                    </View>
                    {edu.description && (
                      <Text style={styles.itemDescription}>{edu.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Certifications */}
            {certifications && certifications.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>Certifications</Text>
                {certifications.map((cert, index) => (
                  <View key={index} style={styles.certCard} wrap={false}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={styles.certTitle}>{cert.title}</Text>
                      {cert.date && (
                        <Text style={styles.certDate}>
                          {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.certIssuer}>{cert.issuer}</Text>
                    {cert.credentialId && (
                      <Text style={styles.certCredential}>ID: {cert.credentialId}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Sidebar */}
          <View style={styles.sideColumn}>
            {/* Profile Image */}
            {personalInfo.profileImage && (
              <View style={styles.profileImageContainer}>
                <Image src={personalInfo.profileImage} style={styles.profileImage} />
              </View>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>Core Skills</Text>
                {skills.slice(0, 10).map((skill, index) => (
                  <Text key={index} style={styles.skillItem}>• {skill}</Text>
                ))}
              </View>
            )}

            {/* Languages */}
            {languages && languages.length > 0 && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>Languages</Text>
                {languages.map((lang, index) => {
                  const levelName = levelNames[lang.level - 1] || 'Unknown';
                  const progressWidth = `${(lang.level / 5) * 100}%`;
                  return (
                    <View key={index} style={styles.languageItem}>
                      <View style={styles.languageHeader}>
                        <Text style={styles.languageName}>{lang.name}</Text>
                        <Text style={styles.languageBadge}>{levelName}</Text>
                      </View>
                      <View style={styles.languageBar}>
                        <View style={[styles.languageProgress, { width: progressWidth }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Professional Goal */}
            {personalInfo.professionalGoal && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>Career Objective</Text>
                <Text style={styles.goalText}>{personalInfo.professionalGoal}</Text>
              </View>
            )}

            {/* Biggest Challenge */}
            {personalInfo.biggestChallenge && (
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionHeading}>Key Challenge</Text>
                <Text style={styles.goalText}>{personalInfo.biggestChallenge}</Text>
              </View>
            )}
          </View>
        </View>

        <Image style={styles.badge} src="/powered-by-lansa-badge.png" />
      </Page>
    </Document>
  );
}
