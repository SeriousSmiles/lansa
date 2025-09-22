// Core coach response interface used across all onboarding steps
export interface CoachResponse {
  recruiter_perspective: string;
  score: number;
  score_breakdown: {
    clarity: number;      // 0-3 points
    relevance: number;    // 0-3 points
    realism: number;      // 0-2 points
    professional_impression: number; // 0-2 points
  };
  coaching_nudge: string;
  contradictions?: string[];
}

// Skill-specific coach response
export interface SkillCoachResponse extends CoachResponse {
  reframed_skill: string;
  business_value_type: string;
}

// Goal-specific coach response
export interface GoalCoachResponse extends CoachResponse {
  interpretation: string;
  initiative_type: string;
  clarity_level: string;
}

// Power mirror response (combines all responses)
export interface PowerMirrorResponse extends CoachResponse {
  mirror_message: string;
  key_strengths: string[];
  employer_perspective: string;
  next_level_hint: string;
}