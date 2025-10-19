import { useState, useCallback } from 'react';

interface CVSmartFillData {
  skillSuggestion?: string;
  goalSuggestion?: string;
  majorSuggestion?: string;
  titleSuggestion?: string;
  aboutSuggestion?: string;
}

export function useCVSmartFill() {
  const [cvFillData, setCVFillData] = useState<CVSmartFillData | null>(null);

  const processCVForSmartFill = useCallback((cvData: any) => {
    const suggestions: CVSmartFillData = {};

    // Extract primary skill from skills array
    if (cvData.skills && cvData.skills.length > 0) {
      suggestions.skillSuggestion = cvData.skills[0];
    }

    // Generate goal suggestion from title and recent experience
    if (cvData.title || (cvData.experience && cvData.experience.length > 0)) {
      const recentRole = cvData.experience?.[0]?.title || cvData.title;
      suggestions.goalSuggestion = `Secure a ${recentRole || 'role'} position that leverages my skills`;
    }

    // Extract major from education
    if (cvData.education && cvData.education.length > 0) {
      const degree = cvData.education[0].degree;
      // Try to extract major from degree string
      const majorMatch = degree.match(/in (.+?)(?:\s|$|,)/i);
      if (majorMatch) {
        suggestions.majorSuggestion = majorMatch[1];
      }
    }

    // Use title directly
    if (cvData.title) {
      suggestions.titleSuggestion = cvData.title;
    }

    // Use summary for about
    if (cvData.summary) {
      suggestions.aboutSuggestion = cvData.summary;
    }

    setCVFillData(suggestions);
    return suggestions;
  }, []);

  const clearSmartFill = useCallback(() => {
    setCVFillData(null);
  }, []);

  const applySmartFill = useCallback((
    field: keyof CVSmartFillData, 
    setterFunction: (value: string) => void
  ) => {
    if (cvFillData && cvFillData[field]) {
      setterFunction(cvFillData[field]!);
    }
  }, [cvFillData]);

  return {
    cvFillData,
    processCVForSmartFill,
    clearSmartFill,
    applySmartFill
  };
}
