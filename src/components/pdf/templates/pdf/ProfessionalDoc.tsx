import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import type { PDFResumeData } from '@/types/pdf';

const styles = StyleSheet.create({
  page: { 
    flexDirection: 'row',
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
  // Left Sidebar Styles
  sidebar: {
    width: '35%',
    padding: 24,
    color: '#FFFFFF',
  },
  profileImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    border: '4px solid #FFFFFF',
    marginBottom: 24,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
    fontSize: 32,
    fontWeight: 'bold',
  },
  sidebarSection: {
    marginBottom: 24,
  },
  sidebarHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  contactItem: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  skillItem: {
    fontSize: 10,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  languageItem: {
    marginBottom: 12,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  languageName: {
    fontSize: 10,
  },
  languageBadge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  languageBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
  },
  languageProgress: {
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  certificationCard: {
    padding: 8,
    marginBottom: 12,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  certificationTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  certificationIssuer: {
    fontSize: 8,
    opacity: 0.8,
    marginBottom: 2,
  },
  certificationDate: {
    fontSize: 8,
    opacity: 0.7,
  },
  goalText: {
    fontSize: 10,
    lineHeight: 1.5,
    opacity: 0.9,
  },
  
  // Main Content Styles
  mainContent: {
    flex: 1,
    padding: 32,
  },
  header: {
    marginBottom: 32,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  summary: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.6,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    borderBottomWidth: 2,
    paddingBottom: 8,
  },
  experienceItem: {
    marginBottom: 24,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  experienceTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    paddingRight: 16,
  },
  experienceDate: {
    fontSize: 10,
    color: '#6B7280',
    width: 100,
    textAlign: 'right',
  },
  experienceDescription: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
  },
  educationItem: {
    marginBottom: 16,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  educationTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    paddingRight: 16,
  },
  educationDate: {
    fontSize: 10,
    color: '#6B7280',
    width: 100,
    textAlign: 'right',
  },
  educationDescription: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.5,
  },
});

export default function ProfessionalDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, colors, languages, certifications } = data;

  const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Left Sidebar */}
        <View style={[styles.sidebar, { backgroundColor: colors.primary }]}>
          {/* Profile Image */}
          <View style={styles.profileImageContainer}>
            {personalInfo.profileImage ? (
              <Image 
                src={personalInfo.profileImage} 
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profileInitial}>
                <Text>{personalInfo.name.charAt(0)}</Text>
              </View>
            )}
          </View>

          {/* Contact Info */}
          <View style={styles.sidebarSection}>
            <Text style={styles.sidebarHeading}>CONTACT</Text>
            {personalInfo.email && (
              <Text style={styles.contactItem}>📧 {personalInfo.email}</Text>
            )}
            {personalInfo.phone && (
              <Text style={styles.contactItem}>📞 {personalInfo.phone}</Text>
            )}
          </View>

          {/* Skills */}
          {skills.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>SKILLS</Text>
              {skills.slice(0, 8).map((skill, index) => (
                <Text key={index} style={styles.skillItem}>• {skill}</Text>
              ))}
            </View>
          )}

          {/* Languages */}
          {languages && languages.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>LANGUAGES</Text>
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

          {/* Certifications */}
          {certifications && certifications.length > 0 && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>CERTIFICATIONS</Text>
              {certifications.map((cert, index) => (
                <View key={index} style={styles.certificationCard}>
                  <Text style={styles.certificationTitle}>{cert.title}</Text>
                  <Text style={styles.certificationIssuer}>{cert.issuer}</Text>
                  {cert.date && (
                    <Text style={styles.certificationDate}>
                      {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Professional Goal */}
          {personalInfo.professionalGoal && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>GOAL</Text>
              <Text style={styles.goalText}>{personalInfo.professionalGoal}</Text>
            </View>
          )}

          {/* Biggest Challenge */}
          {personalInfo.biggestChallenge && (
            <View style={styles.sidebarSection}>
              <Text style={styles.sidebarHeading}>CHALLENGE</Text>
              <Text style={styles.goalText}>{personalInfo.biggestChallenge}</Text>
            </View>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.name}>{personalInfo.name}</Text>
            {personalInfo.title && (
              <Text style={styles.title}>{personalInfo.title}</Text>
            )}
            {personalInfo.summary && (
              <Text style={styles.summary}>{personalInfo.summary}</Text>
            )}
          </View>

          {/* Experience */}
          {experience.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeading, { color: colors.primary, borderBottomColor: colors.primary }]}>
                EXPERIENCE
              </Text>
              {experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <View style={styles.experienceHeader}>
                    <Text style={styles.experienceTitle}>{exp.title}</Text>
                    {exp.startYear && (
                      <Text style={styles.experienceDate}>
                        {exp.startYear} - {exp.endYear || 'Present'}
                      </Text>
                    )}
                  </View>
                  {exp.description && (
                    <Text style={styles.experienceDescription}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {education.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionHeading, { color: colors.primary, borderBottomColor: colors.primary }]}>
                EDUCATION
              </Text>
              {education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <View style={styles.educationHeader}>
                    <Text style={styles.educationTitle}>{edu.title}</Text>
                    {edu.startYear && (
                      <Text style={styles.educationDate}>
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </Text>
                    )}
                  </View>
                  {edu.description && (
                    <Text style={styles.educationDescription}>{edu.description}</Text>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Powered by Lansa Badge */}
        <Image style={styles.badge} src="/powered-by-lansa-badge.png" />
      </Page>
    </Document>
  );
}
