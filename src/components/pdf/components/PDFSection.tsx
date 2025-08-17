import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { PDFResumeData } from '@/types/pdf';

interface PDFSectionProps {
  title: string;
  children: React.ReactNode;
  colors: PDFResumeData['colors'];
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionDivider: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  content: {
    paddingLeft: 5,
  },
});

export const PDFSection: React.FC<PDFSectionProps> = ({ title, children, colors }) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        {title}
      </Text>
      <View style={[styles.sectionDivider, { backgroundColor: colors.primary }]} />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};