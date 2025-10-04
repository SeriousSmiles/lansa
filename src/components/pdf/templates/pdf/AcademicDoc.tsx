import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import type { PDFResumeData } from '@/types/pdf';

const styles = StyleSheet.create({
  page: { 
    padding: 50, 
    backgroundColor: '#FFFFFF',
    fontFamily: 'Times-Roman',
    fontSize: 11,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 10,
  },
  name: { 
    fontSize: 20, 
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Times-Bold',
  },
  title: { 
    fontSize: 13, 
    marginBottom: 3,
    fontFamily: 'Times-Italic',
  },
  contact: {
    fontSize: 10,
    color: '#333333',
    marginTop: 4,
  },
  sectionHeading: { 
    fontSize: 14, 
    fontWeight: 'bold',
    marginTop: 20, 
    marginBottom: 10,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase',
  },
  text: { 
    fontSize: 11, 
    lineHeight: 1.6,
    color: '#000000',
    textAlign: 'justify',
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Times-Bold',
  },
  itemMeta: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#333333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  list: {
    marginLeft: 20,
  },
  listItem: {
    fontSize: 11,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 10,
    color: '#666666',
  },
});

export default function AcademicDoc({ data }: { data: PDFResumeData }) {
  const { personalInfo, experience, education, skills, languages, certifications, awards } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{personalInfo.name}</Text>
          {personalInfo.title && <Text style={styles.title}>{personalInfo.title}</Text>}
          <Text style={styles.contact}>
            {[personalInfo.email, personalInfo.phone].filter(Boolean).join(' • ')}
          </Text>
        </View>

        {/* Research Interests / Summary */}
        {personalInfo.summary && (
          <>
            <Text style={styles.sectionHeading}>Research Interests</Text>
            <Text style={styles.text}>{personalInfo.summary}</Text>
          </>
        )}

        {/* Education */}
        {education && education.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{edu.title}</Text>
                <Text style={styles.itemMeta}>
                  {edu.startYear} - {edu.endYear || 'Present'}
                </Text>
                {edu.description && (
                  <Text style={styles.itemDescription}>{edu.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Academic Experience / Teaching */}
        {experience && experience.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Academic Experience</Text>
            {experience.map((exp, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{exp.title}</Text>
                <Text style={styles.itemMeta}>
                  {exp.startYear} - {exp.endYear || 'Present'}
                </Text>
                {exp.description && (
                  <Text style={styles.itemDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </>
        )}

        {/* Certifications */}
        {certifications && certifications.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Certifications & Professional Development</Text>
            {certifications.map((cert, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{cert.title}</Text>
                <Text style={styles.itemMeta}>
                  {cert.issuer}{cert.date ? `, ${cert.date}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Awards */}
        {awards && awards.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Honors & Awards</Text>
            {awards.map((award, index) => (
              <View key={index} style={styles.itemContainer}>
                <Text style={styles.itemTitle}>{award.title}</Text>
                <Text style={styles.itemMeta}>
                  {award.issuer}{award.date ? `, ${award.date}` : ''}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Skills */}
        {skills && skills.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Technical Skills</Text>
            <Text style={styles.text}>
              {skills.join(', ')}
            </Text>
          </>
        )}

        {/* Languages */}
        {languages && languages.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Languages</Text>
            {languages.map((lang, index) => (
              <Text key={index} style={styles.listItem}>
                {lang.name} - {['Basic', 'Conversational', 'Proficient', 'Fluent', 'Native'][Math.min(4, lang.level - 1)]}
              </Text>
            ))}
          </>
        )}

        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `${pageNumber} / ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
}
