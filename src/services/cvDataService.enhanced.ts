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

interface ProcessingOptions {
  retryAttempts?: number;
  timeout?: number;
  validateContent?: boolean;
}

export class CVDataServiceEnhanced {
  private static readonly MAX_RETRY_ATTEMPTS = 3;
  private static readonly DEFAULT_TIMEOUT = 120000; // 2 minutes
  private static readonly MIN_CONTENT_THRESHOLD = 100; // Minimum characters for valid CV

  /**
   * Enhanced CV upload and parsing with better error handling and validation
   */
  static async uploadAndParseCV(
    file: File, 
    userId: string,
    options: ProcessingOptions = {}
  ): Promise<CVAnalysisResult> {
    const { 
      retryAttempts = this.MAX_RETRY_ATTEMPTS, 
      timeout = this.DEFAULT_TIMEOUT,
      validateContent = true
    } = options;

    // Pre-processing validation
    const validationResult = await this.validateFile(file);
    if (!validationResult.isValid) {
      throw new Error(validationResult.error);
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        console.log(`CV parsing attempt ${attempt}/${retryAttempts} for file: ${file.name}`);
        
        const result = await this.processCVWithTimeout(file, userId, timeout);
        
        if (validateContent) {
          const contentValidation = this.validateExtractedContent(result);
          if (!contentValidation.isValid) {
            throw new Error(contentValidation.error);
          }
        }

        // Enhance the result with additional metadata
        result.metadata = {
          ...result.metadata,
          originalFileName: file.name,
          uploadedAt: new Date().toISOString(),
          extractionConfidence: this.calculateExtractionConfidence(result),
          sectionsFound: this.identifySectionsFound(result)
        };

        console.log(`CV parsing successful on attempt ${attempt}`);
        return result;
        
      } catch (error: any) {
        lastError = error;
        console.error(`CV parsing attempt ${attempt} failed:`, error.message);
        
        // Don't retry for certain types of errors
        if (this.isNonRetryableError(error)) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        if (attempt < retryAttempts) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all attempts failed, provide enhanced error message
    const enhancedError = this.enhanceErrorMessage(lastError, file);
    throw enhancedError;
  }

  /**
   * Process CV with timeout protection
   */
  private static async processCVWithTimeout(
    file: File, 
    userId: string, 
    timeout: number
  ): Promise<CVAnalysisResult> {
    return Promise.race([
      this.performCVProcessing(file, userId),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('CV processing timed out. Please try again with a smaller or simpler file.'));
        }, timeout);
      })
    ]);
  }

  /**
   * Core CV processing logic
   */
  private static async performCVProcessing(file: File, userId: string): Promise<CVAnalysisResult> {
    // Prepare FormData for Railway microservice
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('userId', userId);

    // Add processing metadata
    formData.append('requestId', this.generateRequestId());
    formData.append('timestamp', new Date().toISOString());

    // Call the parse-cv-railway edge function
    const { data, error } = await supabase.functions.invoke('parse-cv-railway', {
      body: formData
    });

    if (error) {
      throw new Error(error.message || 'Failed to parse CV');
    }

    if (!data) {
      throw new Error('No data received from CV parsing service');
    }

    return data as CVAnalysisResult;
  }

  /**
   * Enhanced file validation
   */
  private static async validateFile(file: File): Promise<{ isValid: boolean; error?: string }> {
    // Check file type
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'Only PDF files are supported. Please convert your CV to PDF format.'
      };
    }

    // Check file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'File size exceeds 20MB limit. Please compress your PDF or use a smaller file.'
      };
    }

    // Check minimum file size (avoid empty files)
    if (file.size < 1024) {
      return {
        isValid: false,
        error: 'File appears to be too small or empty. Please check your PDF file.'
      };
    }

    // Basic file integrity check
    try {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Check PDF header
      const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
      if (pdfHeader !== '%PDF') {
        return {
          isValid: false,
          error: 'File does not appear to be a valid PDF. Please ensure your file is a proper PDF document.'
        };
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Unable to read the file. Please try again or use a different file.'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate extracted content quality
   */
  private static validateExtractedContent(result: CVAnalysisResult): { isValid: boolean; error?: string } {
    const { extractedData } = result;

    // Check if any meaningful data was extracted
    const hasPersonalInfo = extractedData.personalInfo && (
      extractedData.personalInfo.name || 
      extractedData.personalInfo.title || 
      extractedData.personalInfo.email
    );
    
    const hasSkills = extractedData.skills && extractedData.skills.length > 0;
    const hasExperience = extractedData.experience && extractedData.experience.length > 0;
    const hasEducation = extractedData.education && extractedData.education.length > 0;

    if (!hasPersonalInfo && !hasSkills && !hasExperience && !hasEducation) {
      return {
        isValid: false,
        error: 'Unable to extract meaningful content from your CV. Please ensure it contains clear, readable text and is not a scanned image.'
      };
    }

    // Validate text quality (check for garbled text)
    const textFields = [
      extractedData.personalInfo?.name,
      extractedData.personalInfo?.title,
      extractedData.personalInfo?.summary,
      ...(extractedData.skills || []),
      ...(extractedData.experience || []).map(exp => exp.title + ' ' + exp.company),
      ...(extractedData.education || []).map(edu => edu.degree + ' ' + edu.institution)
    ].filter(Boolean);

    const hasGarbledText = textFields.some(text => {
      if (!text || text.length < 2) return false;
      // Check for excessive special characters or non-alphabetic content
      const alphaRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
      return alphaRatio < 0.3; // Less than 30% alphabetic characters
    });

    if (hasGarbledText) {
      return {
        isValid: false,
        error: 'The extracted text appears corrupted. This usually happens with scanned PDFs. Please try a text-based PDF or a higher quality scan.'
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate extraction confidence score
   */
  private static calculateExtractionConfidence(result: CVAnalysisResult): number {
    const { extractedData } = result;
    let score = 0;
    let maxScore = 0;

    // Personal info scoring
    maxScore += 30;
    if (extractedData.personalInfo?.name) score += 10;
    if (extractedData.personalInfo?.title) score += 10;
    if (extractedData.personalInfo?.email || extractedData.personalInfo?.phone) score += 10;

    // Skills scoring
    maxScore += 25;
    const skillsCount = extractedData.skills?.length || 0;
    score += Math.min(25, skillsCount * 2.5);

    // Experience scoring
    maxScore += 30;
    const expCount = extractedData.experience?.length || 0;
    score += Math.min(30, expCount * 10);

    // Education scoring
    maxScore += 15;
    const eduCount = extractedData.education?.length || 0;
    score += Math.min(15, eduCount * 7.5);

    return Math.round((score / maxScore) * 100);
  }

  /**
   * Identify which sections were found
   */
  private static identifySectionsFound(result: CVAnalysisResult): string[] {
    const sections = [];
    const { extractedData } = result;

    if (extractedData.personalInfo && (
      extractedData.personalInfo.name || 
      extractedData.personalInfo.title || 
      extractedData.personalInfo.email
    )) {
      sections.push('Personal Information');
    }

    if (extractedData.skills && extractedData.skills.length > 0) {
      sections.push('Skills');
    }

    if (extractedData.experience && extractedData.experience.length > 0) {
      sections.push('Work Experience');
    }

    if (extractedData.education && extractedData.education.length > 0) {
      sections.push('Education');
    }

    return sections;
  }

  /**
   * Check if error should not be retried
   */
  private static isNonRetryableError(error: Error): boolean {
    const nonRetryableMessages = [
      'file too large',
      'invalid file type',
      'authentication',
      'permission denied',
      'quota exceeded',
      'unsupported format'
    ];

    return nonRetryableMessages.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  }

  /**
   * Enhance error messages with helpful suggestions
   */
  private static enhanceErrorMessage(error: Error | null, file: File): Error {
    if (!error) {
      return new Error('Unknown error occurred during CV processing');
    }

    let enhancedMessage = error.message;
    const suggestions = [];

    // File-specific suggestions
    if (file.size > 10 * 1024 * 1024) {
      suggestions.push('Try compressing your PDF file');
    }

    if (file.name.toLowerCase().includes('scan')) {
      suggestions.push('Use a text-based PDF instead of a scanned document');
    }

    // Error-specific suggestions
    if (error.message.includes('timeout')) {
      suggestions.push('Try again during off-peak hours');
      suggestions.push('Use a simpler CV format with less complex layouts');
    }

    if (error.message.includes('extract')) {
      suggestions.push('Ensure your PDF contains selectable text (not just images)');
      suggestions.push('Try exporting your CV as a new PDF from your word processor');
    }

    if (suggestions.length > 0) {
      enhancedMessage += '\n\nSuggestions:\n• ' + suggestions.join('\n• ');
    }

    return new Error(enhancedMessage);
  }

  /**
   * Generate unique request ID for tracking
   */
  private static generateRequestId(): string {
    return `cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Smart profile data application with conflict resolution
   */
  static async applyCVDataToProfile(
    userId: string, 
    extractedData: Partial<CVExtractedData>,
    options: { preserveUserEdits?: boolean; mergingStrategy?: 'replace' | 'merge' | 'append' } = {}
  ): Promise<void> {
    const { preserveUserEdits = true, mergingStrategy = 'merge' } = options;

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

      // Prepare update data with smart merging
      const updateData = await this.mergeProfileData(
        currentProfile, 
        extractedData, 
        { preserveUserEdits, mergingStrategy }
      );

      // Update profile in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...updateData,
          cv_imported_at: new Date().toISOString(),
          cv_last_used: new Date().toISOString(),
          cv_source_metadata: {
            extraction_date: new Date().toISOString(),
            merging_strategy: mergingStrategy,
            preserved_user_edits: preserveUserEdits
          }
        });

      if (updateError) {
        throw updateError;
      }

      toast.success("CV data successfully applied to your profile!");
    } catch (error) {
      console.error('Error applying CV data to profile:', error);
      toast.error("Failed to apply CV data to profile");
      throw error;
    }
  }

  /**
   * Smart data merging with conflict resolution
   */
  private static async mergeProfileData(
    currentProfile: any,
    extractedData: Partial<CVExtractedData>,
    options: { preserveUserEdits: boolean; mergingStrategy: string }
  ): Promise<any> {
    const updateData: any = {};

    // Personal information merging
    if (extractedData.personalInfo) {
      const personalInfo = extractedData.personalInfo;
      
      // Only update empty fields unless strategy is 'replace'
      if (options.mergingStrategy === 'replace' || !currentProfile?.name) {
        updateData.name = personalInfo.name;
      }
      if (options.mergingStrategy === 'replace' || !currentProfile?.title) {
        updateData.title = personalInfo.title;
      }
      if (options.mergingStrategy === 'replace' || !currentProfile?.about_text) {
        updateData.about_text = personalInfo.summary;
      }
      if (options.mergingStrategy === 'replace' || !currentProfile?.email) {
        updateData.email = personalInfo.email;
      }
      if (options.mergingStrategy === 'replace' || !currentProfile?.phone_number) {
        updateData.phone_number = personalInfo.phone;
      }
      if (options.mergingStrategy === 'replace' || !currentProfile?.location) {
        updateData.location = personalInfo.location;
      }
    }

    // Skills merging with deduplication
    if (extractedData.skills) {
      const existingSkills = Array.isArray(currentProfile?.skills) ? currentProfile.skills : [];
      const newSkills = extractedData.skills;
      
      let mergedSkills;
      switch (options.mergingStrategy) {
        case 'replace':
          mergedSkills = newSkills;
          break;
        case 'append':
          mergedSkills = [...existingSkills, ...newSkills];
          break;
        default: // merge
          mergedSkills = [...new Set([...existingSkills, ...newSkills])];
      }
      
      updateData.skills = mergedSkills;
    }

    // Experience merging with smart conflict detection
    if (extractedData.experience) {
      updateData.experiences = this.mergeExperienceData(
        currentProfile?.experiences || [],
        extractedData.experience,
        options
      );
    }

    // Education merging
    if (extractedData.education) {
      updateData.education = this.mergeEducationData(
        currentProfile?.education || [],
        extractedData.education,
        options
      );
    }

    return updateData;
  }

  /**
   * Merge experience data with duplicate detection
   */
  private static mergeExperienceData(existing: any[], newData: any[], options: any): any[] {
    if (options.mergingStrategy === 'replace') {
      return newData.map((exp, index) => this.formatExperienceEntry(exp, index));
    }

    const userEditedExperiences = options.preserveUserEdits ? 
      existing.filter(exp => exp.is_user_edited !== false) : [];
    
    // Detect potential duplicates
    const deduplicatedNew = newData.filter(newExp => {
      return !existing.some(existingExp => 
        this.isExperienceDuplicate(existingExp, newExp)
      );
    });

    const formattedNew = deduplicatedNew.map((exp, index) => 
      this.formatExperienceEntry(exp, userEditedExperiences.length + index)
    );

    return [...userEditedExperiences, ...formattedNew];
  }

  /**
   * Merge education data with duplicate detection
   */
  private static mergeEducationData(existing: any[], newData: any[], options: any): any[] {
    if (options.mergingStrategy === 'replace') {
      return newData.map((edu, index) => this.formatEducationEntry(edu, index));
    }

    const userEditedEducation = options.preserveUserEdits ? 
      existing.filter(edu => edu.is_user_edited !== false) : [];
    
    // Detect potential duplicates
    const deduplicatedNew = newData.filter(newEdu => {
      return !existing.some(existingEdu => 
        this.isEducationDuplicate(existingEdu, newEdu)
      );
    });

    const formattedNew = deduplicatedNew.map((edu, index) => 
      this.formatEducationEntry(edu, userEditedEducation.length + index)
    );

    return [...userEditedEducation, ...formattedNew];
  }

  /**
   * Check if two experience entries are duplicates
   */
  private static isExperienceDuplicate(existing: any, newEntry: any): boolean {
    const normalizeString = (str: string) => str?.toLowerCase().trim() || '';
    
    const titleMatch = normalizeString(existing.title) === normalizeString(newEntry.title);
    const companyMatch = normalizeString(existing.company) === normalizeString(newEntry.company);
    
    return titleMatch && companyMatch;
  }

  /**
   * Check if two education entries are duplicates
   */
  private static isEducationDuplicate(existing: any, newEntry: any): boolean {
    const normalizeString = (str: string) => str?.toLowerCase().trim() || '';
    
    const degreeMatch = normalizeString(existing.degree) === normalizeString(newEntry.degree);
    const institutionMatch = normalizeString(existing.institution) === normalizeString(newEntry.institution);
    
    return degreeMatch && institutionMatch;
  }

  /**
   * Format experience entry for storage
   */
  private static formatExperienceEntry(exp: any, index: number): any {
    return {
      id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: exp.title,
      company: exp.company,
      duration: exp.duration,
      description: exp.description,
      isCurrentRole: exp.duration?.toLowerCase().includes('present') || false,
      startDate: this.extractStartDate(exp.duration),
      endDate: this.extractEndDate(exp.duration),
      source: exp.source || 'cv-upload',
      order_index: exp.order_index ?? index,
      is_user_edited: exp.is_user_edited ?? false
    };
  }

  /**
   * Format education entry for storage
   */
  private static formatEducationEntry(edu: any, index: number): any {
    return {
      id: `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      degree: edu.degree,
      institution: edu.institution,
      year: edu.year,
      graduationYear: parseInt(edu.year) || new Date().getFullYear(),
      source: edu.source || 'cv-upload',
      order_index: edu.order_index ?? index,
      is_user_edited: edu.is_user_edited ?? false
    };
  }

  // Helper methods (same as before)
  private static extractStartDate(duration: string): string {
    if (!duration) return '';
    const parts = duration.split('-');
    return parts[0]?.trim() || '';
  }

  private static extractEndDate(duration: string): string {
    if (!duration) return '';
    const parts = duration.split('-');
    const endPart = parts[1]?.trim();
    return endPart && endPart.toLowerCase() !== 'present' ? endPart : '';
  }

  // All other existing methods from CVDataService...
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
}