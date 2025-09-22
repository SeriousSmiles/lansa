import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CVExtractedData {
  personalInfo?: {
    name?: string;
    title?: string;
    summary?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
    source?: string;
    order_index?: number;
    is_user_edited?: boolean;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    source?: string;
    order_index?: number;
    is_user_edited?: boolean;
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
   * Upload and parse a CV file using Railway microservice
   */
  static async uploadAndParseCV(file: File, userId: string): Promise<CVAnalysisResult> {
    try {
      // Prepare FormData for Railway microservice
      const formData = new FormData();
      formData.append('pdf', file);
      formData.append('userId', userId);

      // Call the parse-cv-railway edge function
      const { data, error } = await supabase.functions.invoke('parse-cv-railway', {
        body: formData
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
   * Get user's resume parsing history
   */
  static async getUserResumes(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching user resumes:', error);
      return [];
    }
  }

  /**
   * Get specific resume by ID
   */
  static async getResumeById(resumeId: string, userId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('user_resumes')
        .select('*')
        .eq('id', resumeId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching resume by ID:', error);
      return null;
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
        if (extractedData.personalInfo.location) {
          updateData.location = extractedData.personalInfo.location;
        }
      }

      // Map skills - merge with existing skills, adding source tracking for new ones
      if (extractedData.skills) {
        const existingSkills = Array.isArray(currentProfile?.skills) ? currentProfile.skills as string[] : [];
        const newSkills = [...new Set([...existingSkills, ...extractedData.skills])];
        updateData.skills = newSkills;
      }

      // Map experience - smart merge preserving user-edited content
      if (extractedData.experience) {
        const existingExperience = Array.isArray(currentProfile?.experiences) ? currentProfile.experiences as any[] : [];
        
        // Preserve existing user-edited experiences
        const userEditedExperiences = existingExperience.filter(exp => exp.is_user_edited !== false);
        
        // Add new resume experiences with source tracking
        const newResumeExperiences = extractedData.experience.map((exp, index) => ({
          id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: exp.title,
          company: exp.company,
          duration: exp.duration,
          description: exp.description,
          isCurrentRole: exp.duration.toLowerCase().includes('present'),
          startDate: this.extractStartDate(exp.duration),
          endDate: this.extractEndDate(exp.duration),
          source: exp.source || 'resume-upload',
          order_index: exp.order_index ?? index,
          is_user_edited: exp.is_user_edited ?? false
        }));
        
        updateData.experiences = [...userEditedExperiences, ...newResumeExperiences];
      }

      // Map education - smart merge preserving user-edited content
      if (extractedData.education) {
        const existingEducation = Array.isArray(currentProfile?.education) ? currentProfile.education as any[] : [];
        
        // Preserve existing user-edited education
        const userEditedEducation = existingEducation.filter(edu => edu.is_user_edited !== false);
        
        // Add new resume education with source tracking
        const newResumeEducation = extractedData.education.map((edu, index) => ({
          id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          degree: edu.degree,
          institution: edu.institution,
          year: edu.year,
          graduationYear: parseInt(edu.year) || new Date().getFullYear(),
          source: edu.source || 'resume-upload',
          order_index: edu.order_index ?? index,
          is_user_edited: edu.is_user_edited ?? false
        }));
        
        updateData.education = [...userEditedEducation, ...newResumeEducation];
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