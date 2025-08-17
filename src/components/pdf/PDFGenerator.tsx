import React from 'react';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFResumeData } from '@/types/pdf';
import { PDFHeader } from './components/PDFHeader';
import { PDFSection } from './components/PDFSection';
import { PDFExperience } from './components/PDFExperience';
import { PDFEducation } from './components/PDFEducation';
import { PDFSkills } from './components/PDFSkills';

interface PDFGeneratorProps {
  data: PDFResumeData;
}

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  spacer: {
    height: 15,
  },
});

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          {/* Header Section */}
          <PDFHeader personalInfo={data.personalInfo} colors={data.colors} />
          
          <View style={styles.spacer} />
          
          {/* Professional Summary */}
          {data.personalInfo.summary && (
            <>
              <PDFSection title="Professional Summary" colors={data.colors}>
                <Text style={{ fontSize: 11, lineHeight: 1.4, color: '#374151' }}>
                  {data.personalInfo.summary}
                </Text>
              </PDFSection>
              <View style={styles.spacer} />
            </>
          )}

          {/* Professional Goal */}
          {data.personalInfo.professionalGoal && (
            <>
              <PDFSection title="Professional Goal" colors={data.colors}>
                <Text style={{ fontSize: 11, lineHeight: 1.4, color: '#374151' }}>
                  {data.personalInfo.professionalGoal}
                </Text>
              </PDFSection>
              <View style={styles.spacer} />
            </>
          )}
          
          {/* Experience Section */}
          {data.experience && data.experience.length > 0 && (
            <>
              <PDFSection title="Professional Experience" colors={data.colors}>
                <PDFExperience experiences={data.experience} />
              </PDFSection>
              <View style={styles.spacer} />
            </>
          )}
          
          {/* Education Section */}
          {data.education && data.education.length > 0 && (
            <>
              <PDFSection title="Education" colors={data.colors}>
                <PDFEducation education={data.education} />
              </PDFSection>
              <View style={styles.spacer} />
            </>
          )}
          
          {/* Skills Section */}
          {data.skills && data.skills.length > 0 && (
            <PDFSection title="Skills" colors={data.colors}>
              <PDFSkills skills={data.skills} />
            </PDFSection>
          )}
        </View>
      </Page>
    </Document>
  );
};