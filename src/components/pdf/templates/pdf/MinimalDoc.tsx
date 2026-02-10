import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import type { PDFResumeData } from '@/types/pdf';

// Register Public Sans and Urbanist fonts (you'll need to add these font files to your public folder)
// For now, using default fonts
// Font.register({ family: 'Public Sans', src: '/fonts/PublicSans-Regular.ttf' });
// Font.register({ family: 'Urbanist', src: '/fonts/Urbanist-SemiBold.ttf' });

const styles = StyleSheet.create({
  page: { 
    padding: 40, 
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
  name: { 
    fontSize: 24, 
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  title: { 
    fontSize: 12, 
    marginBottom: 6,
    color: '#4a4a4a',
  },
  contact: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 16,
  },
  sectionHeading: { 
    fontSize: 13, 
    fontWeight: 'bold',
    marginTop: 16, 
    marginBottom: 8,
    color: '#1a1a1a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 4,
  },
  text: { 
    fontSize: 10, 
    lineHeight: 1.5,
    color: '#333333',
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#1a1a1a',
  },
  itemSubtitle: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 10,
    color: '#4a4a4a',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    fontSize: 9,
    padding: 4,
    backgroundColor: '#f5f5f5',
    color: '#333333',
    borderRadius: 3,
  },
});

export default function MinimalDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, languages } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{personalInfo.name}</Text>
        {personalInfo.title && <Text style={styles.title}>{personalInfo.title}</Text>}
        <Text style={styles.contact}>
          {[personalInfo.email, personalInfo.phone].filter(Boolean).join(' • ')}
        </Text>

        {/* Profile Summary */}
        {personalInfo.summary && (
          <>
            <Text style={styles.sectionHeading}>Profile</Text>
            <Text style={styles.text}>{personalInfo.summary}</Text>
          </>
        )}

        {/* Professional Goal */}
        {personalInfo.professionalGoal && (
          <>
            <Text style={styles.sectionHeading}>Objective</Text>
            <Text style={styles.text}>{personalInfo.professionalGoal}</Text>
          </>
        )}

        {/* Biggest Challenge */}
        {personalInfo.biggestChallenge && (
          <>
            <Text style={styles.sectionHeading}>Challenge</Text>
            <Text style={styles.text}>{personalInfo.biggestChallenge}</Text>
          </>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Experience</Text>
            {experience.map((exp, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={styles.itemTitle}>{exp.title}</Text>
                <Text style={styles.itemSubtitle}>
                  {exp.startYear} - {exp.endYear || 'Present'}
                </Text>
                {exp.description && (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={{ marginBottom: 10 }}>
                <Text style={styles.itemTitle}>{edu.title}</Text>
                <Text style={styles.itemSubtitle}>
                  {edu.startYear} - {edu.endYear || 'Present'}
                </Text>
                {edu.description && (
                  <Text style={styles.itemDescription}>{edu.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.slice(0, 15).map((skill, index) => (
                <Text key={index} style={styles.skillBadge}>{skill}</Text>
              ))}
            </View>
          </>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Languages</Text>
            {languages.map((lang, index) => {
              const levelNames = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
              const levelName = levelNames[lang.level - 1] || 'Unknown';
              return (
                <Text key={index} style={styles.text}>
                  {lang.name} - {levelName}
                </Text>
              );
            })}
          </>
        )}

        {/* Powered by Lansa Badge */}
        <Image style={styles.badge} src="/powered-by-lansa-badge.png" />
      </Page>
    </Document>
  );
}
