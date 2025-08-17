import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';

interface PDFSkillsProps {
  skills: string[];
}

const styles = StyleSheet.create({
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillItem: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4,
  },
  skillText: {
    fontSize: 10,
    color: '#374151',
  },
  skillsGrid: {
    flexDirection: 'column',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
});

export const PDFSkills: React.FC<PDFSkillsProps> = ({ skills }) => {
  // Group skills in rows for better layout
  const groupedSkills = [];
  const itemsPerRow = 4;
  
  for (let i = 0; i < skills.length; i += itemsPerRow) {
    groupedSkills.push(skills.slice(i, i + itemsPerRow));
  }

  return (
    <View style={styles.skillsGrid}>
      {groupedSkills.map((skillGroup, rowIndex) => (
        <View key={rowIndex} style={styles.skillsRow}>
          {skillGroup.map((skill, index) => (
            <View key={index} style={[styles.skillItem, { marginRight: 8 }]}>
              <Text style={styles.skillText}>
                {skill}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};