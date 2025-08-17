import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { EducationItem } from '@/hooks/profile/profileTypes';

interface PDFEducationProps {
  education: EducationItem[];
}

const styles = StyleSheet.create({
  educationItem: {
    marginBottom: 12,
  },
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  educationTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  educationDate: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  educationDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    color: '#374151',
    marginTop: 2,
  },
});

const formatYearRange = (startYear?: number, endYear?: number | null) => {
  if (!startYear) return '';
  
  const start = startYear.toString();
  const end = endYear === null ? 'Present' : endYear?.toString() || '';
  
  if (!end) return start;
  return `${start} - ${end}`;
};

export const PDFEducation: React.FC<PDFEducationProps> = ({ education }) => {
  return (
    <View>
      {education.map((edu, index) => (
        <View key={edu.id || index} style={styles.educationItem}>
          <View style={styles.educationHeader}>
            <Text style={styles.educationTitle}>
              {edu.title}
            </Text>
            <Text style={styles.educationDate}>
              {formatYearRange(edu.startYear, edu.endYear)}
            </Text>
          </View>
          
          {edu.description && (
            <Text style={styles.educationDescription}>
              {edu.description}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};