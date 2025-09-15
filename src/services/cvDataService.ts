import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CVExtractedData {
  personalInfo?: {
    name?: string;
    title?: string;
    summary?: string;
    email?: string;
    phone?: string;
  };
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

export interface CVAnalysisResult {
  extractedData: CVExtractedData;
  suggestions: {
    skillMatches: string[];
    gapAnalysis: string[];
    improvements: string[];
    mismatchWarnings?: string[];
    confidence: number;
  };
  metadata?: {
    originalFileName: string;
    uploadedAt: string;
    extractionConfidence: number;
    sectionsFound: string[];
  };
}

export class CVDataService {
  /**
   * Upload and parse a CV file using OpenAI Vision
   */
  static async uploadAndParseCV(file: File, userId: string, imageDataUrls: string[]): Promise<CVAnalysisResult> {
    try {
      // Call the parse-cv-vision edge function
      const { data, error } = await supabase.functions.invoke('parse-cv-resume', {
        body: {
          imageDataUrls,
          fileName: file.name,
          userId
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to parse CV');
      }

      return data as CVAnalysisResult;
    } catch (error) {
      console.error('Error uploading and parsing CV:', error);
      throw error;
    }
  }

  /**
   * Apply extracted CV data to user profile
   */
  static async applyCVDataToProfile(
    userId: string, 
    extractedData: Partial<CVExtractedData>
  ): Promise<void> {
    try {
      // Get current profile data
      const { data: currentProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // Prepare update data
      const updateData: any = {};

      // Map personal info
      if (extractedData.personalInfo) {
        if (extractedData.personalInfo.name) {
          updateData.name = extractedData.personalInfo.name;
        }
        if (extractedData.personalInfo.title) {
          updateData.title = extractedData.personalInfo.title;
        }
        if (extractedData.personalInfo.summary) {
          updateData.about_text = extractedData.personalInfo.summary;
        }
        if (extractedData.personalInfo.email) {
          updateData.email = extractedData.personalInfo.email;
        }
        if (extractedData.personalInfo.phone) {
          updateData.phone_number = extractedData.personalInfo.phone;
        }
      }

      // Map skills - merge with existing skills
      if (extractedData.skills) {
        const existingSkills = Array.isArray(currentProfile?.skills) ? currentProfile.skills as string[] : [];
        const newSkills = [...new Set([...existingSkills, ...extractedData.skills])];
        updateData.skills = newSkills;
      }

      // Map experience - merge with existing experience
      if (extractedData.experience) {
        const existingExperience = Array.isArray(currentProfile?.experiences) ? currentProfile.experiences as any[] : [];
        const newExperience = [...existingExperience, ...extractedData.experience.map(exp => ({
          id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description,
          isCurrentRole: exp.duration.toLowerCase().includes('present'),
          startDate: this.extractStartDate(exp.duration),
          endDate: this.extractEndDate(exp.duration)
        }))];
        updateData.experiences = newExperience;
      }

      // Map education - merge with existing education
      if (extractedData.education) {
        const existingEducation = Array.isArray(currentProfile?.education) ? currentProfile.education as any[] : [];
        const newEducation = [...existingEducation, ...extractedData.education.map(edu => ({
          id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          graduationYear: parseInt(edu.year) || new Date().getFullYear()
        }))];
        updateData.education = newEducation;
      }

      // Update profile in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...updateData,
          cv_imported_at: new Date().toISOString(),
          cv_last_used: new Date().toISOString()
        });

      if (updateError) {
        throw updateError;
      }

      toast.success("CV data applied to your profile successfully!");
    } catch (error) {
      console.error('Error applying CV data to profile:', error);
      toast.error("Failed to apply CV data to profile");
      throw error;
    }
  }

  /**
   * Check if user has previously uploaded a CV
   */
  static async hasUploadedCV(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('cv_imported_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!(data?.cv_imported_at);
    } catch (error) {
      console.error('Error checking CV upload status:', error);
      return false;
    }
  }

  /**
   * Get CV upload metadata
   */
  static async getCVMetadata(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('cv_source_metadata, cv_imported_at, cv_last_used')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching CV metadata:', error);
      return null;
    }
  }

  // Helper methods
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:application/pdf;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  }

  private static extractStartDate(duration: string): string {
    // Simple extraction - in production, you'd want more sophisticated parsing
    const parts = duration.split('-');
    return parts[0]?.trim() || '';
  }

  private static extractEndDate(duration: string): string {
    // Simple extraction - in production, you'd want more sophisticated parsing
    const parts = duration.split('-');
    const endPart = parts[1]?.trim();
    return endPart && endPart.toLowerCase() !== 'present' ? endPart : '';
  }
}