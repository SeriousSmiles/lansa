/**
 * Centralized Profile Field Registry
 * Single source of truth for all profile fields across the system
 */

interface FieldConfig {
  dbColumn: string | null;
  pdfKey: string | null;
  required: boolean;
  isArray?: boolean;
  tableName?: string;
}

export const PROFILE_FIELDS: Record<string, FieldConfig> = {
  // Personal Info
  name: { dbColumn: 'name', pdfKey: 'personalInfo.name', required: true },
  title: { dbColumn: 'title', pdfKey: 'personalInfo.title', required: false },
  email: { dbColumn: 'email', pdfKey: 'personalInfo.email', required: true },
  phone: { dbColumn: 'phone_number', pdfKey: 'personalInfo.phone', required: false },
  summary: { dbColumn: 'about_text', pdfKey: 'personalInfo.summary', required: false },
  professionalGoal: { dbColumn: 'professional_goal', pdfKey: 'personalInfo.professionalGoal', required: false },
  biggestChallenge: { dbColumn: 'biggest_challenge', pdfKey: 'personalInfo.biggestChallenge', required: false },
  profileImage: { dbColumn: 'profile_image', pdfKey: 'personalInfo.profileImage', required: false },
  location: { dbColumn: 'location', pdfKey: null, required: false }, // Not in PDF
  
  // Styling
  coverColor: { dbColumn: 'cover_color', pdfKey: null, required: false },
  highlightColor: { dbColumn: 'highlight_color', pdfKey: null, required: false },
  
  // Sections
  skills: { dbColumn: 'skills', pdfKey: 'skills', required: false, isArray: true },
  languages: { dbColumn: 'languages', pdfKey: 'languages', required: false, isArray: true },
  experience: { dbColumn: 'experiences', pdfKey: 'experience', required: false, isArray: true },
  education: { dbColumn: 'education', pdfKey: 'education', required: false, isArray: true },
  certifications: { dbColumn: null, pdfKey: 'certifications', required: false, isArray: true, tableName: 'user_profile_certifications' },
  projects: { dbColumn: null, pdfKey: 'projects', required: false, isArray: true, tableName: 'user_projects' },
};

export type ProfileFieldKey = keyof typeof PROFILE_FIELDS;

/**
 * Helper function to get database column name for a field
 */
export function getDbColumn(fieldKey: ProfileFieldKey): string | null {
  return PROFILE_FIELDS[fieldKey].dbColumn;
}

/**
 * Helper function to get PDF key path for a field
 */
export function getPdfKey(fieldKey: ProfileFieldKey): string | null {
  return PROFILE_FIELDS[fieldKey].pdfKey;
}

/**
 * Helper function to check if a field is required
 */
export function isFieldRequired(fieldKey: ProfileFieldKey): boolean {
  return PROFILE_FIELDS[fieldKey].required;
}

/**
 * Helper function to check if a field is an array
 */
export function isFieldArray(fieldKey: ProfileFieldKey): boolean {
  return PROFILE_FIELDS[fieldKey].isArray || false;
}

/**
 * Helper function to get table name for fields stored in separate tables
 */
export function getFieldTableName(fieldKey: ProfileFieldKey): string | null {
  return PROFILE_FIELDS[fieldKey].tableName || null;
}

/**
 * Get all required fields
 */
export function getRequiredFields(): ProfileFieldKey[] {
  return Object.entries(PROFILE_FIELDS)
    .filter(([_, config]) => config.required)
    .map(([key]) => key as ProfileFieldKey);
}

/**
 * Get all fields stored in separate tables
 */
export function getRelationalFields(): ProfileFieldKey[] {
  return Object.entries(PROFILE_FIELDS)
    .filter(([_, config]) => config.tableName)
    .map(([key]) => key as ProfileFieldKey);
}

/**
 * Validate that a profile data object has all required fields
 */
export function validateProfileData(data: Record<string, any>): { valid: boolean; missingFields: string[] } {
  const requiredFields = getRequiredFields();
  const missingFields: string[] = requiredFields.filter(field => {
    const dbColumn = getDbColumn(field);
    return !dbColumn || !data[dbColumn];
  });
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}
