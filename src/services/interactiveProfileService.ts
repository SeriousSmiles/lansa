import { supabase } from "@/integrations/supabase/client";

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProfileGuidanceRequest {
  userId: string;
  conversationHistory: ConversationMessage[];
  userMessage?: string;
  requestType: 'initial' | 'refine' | 'alternatives' | 'apply';
  section?: string;
  currentContent?: string;
}

export interface ProfileGuidanceResponse {
  message: string;
  suggestions?: {
    title?: string;
    about?: string;
    skills?: string[];
    experiences?: Array<{
      title: string;
      description: string;
      startYear?: number;
      endYear?: number | null;
    }>;
    education?: Array<{
      title: string;
      description: string;
      startYear?: number;
      endYear?: number | null;
    }>;
  };
  reasoning?: string;
  nextSteps?: string[];
  isComplete?: boolean;
}

export class InteractiveProfileService {
  static async generateGuidance(request: ProfileGuidanceRequest): Promise<ProfileGuidanceResponse> {
    try {
      const response = await supabase.functions.invoke('generate-interactive-profile-guidance', {
        body: request
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to generate guidance');
      }

      return response.data?.guidance || this.getFallbackResponse();
    } catch (error) {
      console.error('Error generating profile guidance:', error);
      return this.getFallbackResponse();
    }
  }

  static async getInitialGuidance(userId: string): Promise<ProfileGuidanceResponse> {
    return this.generateGuidance({
      userId,
      conversationHistory: [],
      requestType: 'initial',
      userMessage: "Hi! I'd like help completing my professional profile. Can you analyze my current situation and guide me through improving it?"
    });
  }

  static async refineSection(
    userId: string,
    conversationHistory: ConversationMessage[],
    userMessage: string
  ): Promise<ProfileGuidanceResponse> {
    return this.generateGuidance({
      userId,
      conversationHistory,
      requestType: 'refine',
      userMessage
    });
  }

  static async requestAlternatives(
    userId: string,
    conversationHistory: ConversationMessage[],
    section: string,
    currentSuggestion: any,
    userFeedback: string
  ): Promise<ProfileGuidanceResponse> {
    return this.generateGuidance({
      userId,
      conversationHistory,
      requestType: 'alternatives',
      userMessage: `I'd like alternatives for the ${section}. Current suggestion: ${JSON.stringify(currentSuggestion)}. My feedback: ${userFeedback}`,
      section,
      currentContent: JSON.stringify(currentSuggestion)
    });
  }

  static async confirmApplication(
    userId: string,
    conversationHistory: ConversationMessage[],
    appliedType: string
  ): Promise<ProfileGuidanceResponse> {
    return this.generateGuidance({
      userId,
      conversationHistory,
      requestType: 'apply',
      userMessage: `I applied the ${appliedType} suggestion. What should I focus on next?`,
      section: appliedType
    });
  }

  private static getFallbackResponse(): ProfileGuidanceResponse {
    return {
      message: "I'm having trouble connecting right now. Let me help you with some general profile tips while I get back online. What specific section would you like to work on - your headline, about section, skills, or experience?",
      suggestions: {},
      reasoning: "Fallback response due to technical issue",
      nextSteps: [
        "Try again in a moment",
        "Choose a specific section to focus on",
        "Check your internet connection"
      ],
      isComplete: false
    };
  }
}

// Utility functions for profile analysis
export function analyzeProfileCompleteness(profile: any): {
  completeness: number;
  missingFields: string[];
  recommendations: string[];
} {
  const fields = {
    title: profile.userTitle,
    about: profile.aboutText,
    skills: profile.userSkills?.length > 0,
    experience: profile.userExperiences?.length > 0,
    education: profile.userEducation?.length > 0,
    image: profile.profileImage
  };

  const completedFields = Object.values(fields).filter(Boolean).length;
  const totalFields = Object.keys(fields).length;
  const completeness = Math.round((completedFields / totalFields) * 100);

  const missingFields = Object.entries(fields)
    .filter(([_, value]) => !value)
    .map(([key, _]) => key);

  const recommendations = [];
  if (!fields.title) recommendations.push("Add a professional headline");
  if (!fields.about) recommendations.push("Write an about section");
  if (!fields.skills) recommendations.push("List your key skills");
  if (!fields.experience) recommendations.push("Add your work experience");
  if (!fields.education) recommendations.push("Include your education");
  if (!fields.image) recommendations.push("Upload a profile picture");

  return { completeness, missingFields, recommendations };
}

export function getPriorityRecommendations(profile: any, userAnswers: any): string[] {
  const priorities = [];

  // High priority based on user type and goals
  if (!profile.userTitle) {
    priorities.push("Create a compelling professional headline that showcases your value");
  }

  if (!profile.aboutText && userAnswers?.desired_outcome) {
    priorities.push("Write an about section that connects your background to your goals");
  }

  if ((!profile.userSkills || profile.userSkills.length === 0) && userAnswers?.identity) {
    priorities.push("Add skills that align with your career identity");
  }

  // Medium priority
  if ((!profile.userExperiences || profile.userExperiences.length === 0)) {
    priorities.push("Document your relevant experience and projects");
  }

  return priorities;
}