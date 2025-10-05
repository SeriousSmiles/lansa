/**
 * Base Template Utilities
 * Shared components and logic for all PDF templates
 */

import { Text, View, StyleSheet } from "@react-pdf/renderer";
import { LanguageItem } from "@/hooks/profile/profileTypes";

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textLight: string;
  background: string;
}

/**
 * Shared utility functions for PDF templates
 */
export class TemplateUtils {
  /**
   * Check if a section should be rendered based on data availability
   */
  static shouldRenderSection(data: any[] | undefined | null): boolean {
    return Boolean(data && data.length > 0);
  }

  /**
   * Format date range for experience/education
   */
  static formatDateRange(startYear?: number, endYear?: number | null): string {
    if (!startYear) return '';
    const start = startYear.toString();
    const end = endYear === null ? 'Present' : endYear?.toString() || '';
    return end ? `${start} - ${end}` : start;
  }

  /**
   * Format date for certifications
   */
  static formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  }

  /**
   * Get language level label
   */
  static getLanguageLevel(level: number): string {
    const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
    return levels[level - 1] || 'Unknown';
  }

  /**
   * Truncate text to specified length
   */
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Check if text is empty or whitespace
   */
  static isEmptyText(text?: string | null): boolean {
    return !text || text.trim().length === 0;
  }
}

/**
 * Shared PDF Components
 */

interface SectionHeaderProps {
  title: string;
  colors: ColorConfig;
  style?: any;
}

export const SectionHeader = ({ title, colors, style }: SectionHeaderProps) => {
  const styles = StyleSheet.create({
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      ...style,
    },
  });

  return <Text style={styles.sectionTitle}>{title}</Text>;
};

interface LanguageBarProps {
  level: number;
  colors: ColorConfig;
  height?: number;
}

export const LanguageBar = ({ level, colors, height = 4 }: LanguageBarProps) => {
  const styles = StyleSheet.create({
    barContainer: {
      flexDirection: 'row',
      gap: 2,
      marginTop: 4,
    },
    barSegment: {
      width: 12,
      height: height,
      backgroundColor: colors.secondary,
      borderRadius: 1,
    },
    barSegmentFilled: {
      backgroundColor: colors.accent,
    },
  });

  return (
    <View style={styles.barContainer}>
      {[1, 2, 3, 4, 5].map((segment) => (
        <View
          key={segment}
          style={[
            styles.barSegment,
            segment <= level && styles.barSegmentFilled,
          ]}
        />
      ))}
    </View>
  );
};

interface SkillTagProps {
  skill: string;
  colors: ColorConfig;
}

export const SkillTag = ({ skill, colors }: SkillTagProps) => {
  const styles = StyleSheet.create({
    skillTag: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginRight: 6,
      marginBottom: 6,
    },
    skillText: {
      fontSize: 9,
      color: colors.text,
    },
  });

  return (
    <View style={styles.skillTag}>
      <Text style={styles.skillText}>{skill}</Text>
    </View>
  );
};

interface TechnologyTagProps {
  technology: string;
  colors: ColorConfig;
  small?: boolean;
}

export const TechnologyTag = ({ technology, colors, small = false }: TechnologyTagProps) => {
  const styles = StyleSheet.create({
    tag: {
      backgroundColor: colors.secondary,
      paddingHorizontal: small ? 6 : 8,
      paddingVertical: small ? 2 : 4,
      borderRadius: 3,
      marginRight: 4,
      marginBottom: 4,
    },
    tagText: {
      fontSize: small ? 8 : 9,
      color: colors.text,
    },
  });

  return (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{technology}</Text>
    </View>
  );
};

/**
 * Default color configurations for templates
 */
export const DEFAULT_COLORS: ColorConfig = {
  primary: '#2563eb',
  secondary: '#e0e7ff',
  accent: '#3b82f6',
  text: '#1f2937',
  textLight: '#6b7280',
  background: '#ffffff',
};

export const DARK_COLORS: ColorConfig = {
  primary: '#1e40af',
  secondary: '#1e293b',
  accent: '#3b82f6',
  text: '#f9fafb',
  textLight: '#d1d5db',
  background: '#0f172a',
};

/**
 * Template validation helpers
 */
export class TemplateValidator {
  /**
   * Validate personal info section
   */
  static validatePersonalInfo(personalInfo: any): boolean {
    return Boolean(personalInfo?.name && personalInfo?.email);
  }

  /**
   * Validate experience item
   */
  static validateExperience(exp: any): boolean {
    return Boolean(exp?.title && exp?.description);
  }

  /**
   * Validate education item
   */
  static validateEducation(edu: any): boolean {
    return Boolean(edu?.title && edu?.description);
  }

  /**
   * Validate certification item
   */
  static validateCertification(cert: any): boolean {
    return Boolean(cert?.title && cert?.issuer);
  }

  /**
   * Validate project item
   */
  static validateProject(project: any): boolean {
    return Boolean(project?.title);
  }

  /**
   * Validate language item
   */
  static validateLanguage(lang: any): boolean {
    return Boolean(lang?.name && lang?.level >= 1 && lang?.level <= 5);
  }
}
