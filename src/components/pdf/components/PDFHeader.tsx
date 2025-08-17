import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFResumeData } from '@/types/pdf';

interface PDFHeaderProps {
  personalInfo: PDFResumeData['personalInfo'];
  colors: PDFResumeData['colors'];
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1F2937',
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    color: '#6B7280',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  contactItem: {
    fontSize: 10,
    color: '#6B7280',
  },
  divider: {
    height: 2,
    width: '100%',
    marginTop: 15,
  },
});

export const PDFHeader: React.FC<PDFHeaderProps> = ({ personalInfo, colors }) => {
  return (
    <View style={styles.header}>
      <Text style={[styles.name, { color: colors.primary }]}>
        {personalInfo.name}
      </Text>
      
      {personalInfo.title && (
        <Text style={styles.title}>
          {personalInfo.title}
        </Text>
      )}
      
      <View style={styles.contactInfo}>
        {personalInfo.email && (
          <Text style={styles.contactItem}>
            {personalInfo.email}
          </Text>
        )}
        
        {personalInfo.phone && (
          <Text style={styles.contactItem}>
            {personalInfo.phone}
          </Text>
        )}
      </View>
      
      <View style={[styles.divider, { backgroundColor: colors.primary }]} />
    </View>
  );
};