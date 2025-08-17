import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { ExperienceItem } from '@/hooks/profile/profileTypes';

interface PDFExperienceProps {
  experiences: ExperienceItem[];
}

const styles = StyleSheet.create({
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  experienceDate: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'right',
  },
  experienceDescription: {
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

export const PDFExperience: React.FC<PDFExperienceProps> = ({ experiences }) => {
  return (
    <View>
      {experiences.map((experience, index) => (
        <View key={experience.id || index} style={styles.experienceItem}>
          <View style={styles.experienceHeader}>
            <Text style={styles.experienceTitle}>
              {experience.title}
            </Text>
            <Text style={styles.experienceDate}>
              {formatYearRange(experience.startYear, experience.endYear)}
            </Text>
          </View>
          
          {experience.description && (
            <Text style={styles.experienceDescription}>
              {experience.description}
            </Text>
          )}
        </View>
      ))}
    </View>
  );
};