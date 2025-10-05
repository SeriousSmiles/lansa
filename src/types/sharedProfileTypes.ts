import { LanguageItem, ExperienceItem, EducationItem } from "@/hooks/profile/profileTypes";

/**
 * Fields that can be shared publicly on user profiles
 * This interface should match the columns in user_profiles_public table
 */
export interface PublicProfileFields {
  user_id: string;
  name: string | null;
  title: string | null;
  about_text: string | null;
  cover_color: string | null;
  highlight_color: string | null;
  profile_image: string | null;
  skills: string[] | null;
  experiences: any[] | null;
  education: any[] | null;
  professional_goal: string | null;
  languages: LanguageItem[] | null;
  biggest_challenge: string | null;
  phone_number: string | null;
  email: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Privacy settings structure stored in user_profiles.privacy_settings
 */
export interface ProfilePrivacySettings {
  show_email: boolean;
  show_phone: boolean;
}

/**
 * Complete list of profile fields that can be synced
 * Use this as a reference when updating the sync trigger
 */
export const SYNCABLE_PROFILE_FIELDS = [
  'name',
  'title',
  'about_text',
  'cover_color',
  'highlight_color',
  'profile_image',
  'skills',
  'experiences',
  'education',
  'professional_goal',
  'languages',
  'biggest_challenge',
  'phone_number',
  'email',
  'location',
] as const;

export type SyncableProfileField = typeof SYNCABLE_PROFILE_FIELDS[number];
