/**
 * Certification & Exam Type Definitions
 * Centralized types for the exam system
 */

export type ExamSector = 'office' | 'service' | 'technical' | 'digital';
export type ExamCategory = 'mindset' | 'workplace_intelligence' | 'performance_habits' | 'applied_thinking';
export type ExamStatus = 'in_progress' | 'completed' | 'abandoned';
export type QuestionType = 'mcq' | 'written';
export type CertificationLevel = 'standard' | 'high_performer';

export interface QuestionChoice {
  id: string;
  text: string;
  points: number;
}

export interface CertQuestion {
  id: string;
  scenario: string;
  choices: QuestionChoice[];
  category: ExamCategory;
  mirror_role: string;
  mirror_context: string;
  randomize_order: boolean;
  question_type: QuestionType;
  guidance: string | null;
  max_words: number | null;
  time_limit_seconds: number;
  sector: ExamSector;
}

export interface CertAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_id: string | null;
  written_answer_text: string | null;
  points_awarded: number;
  response_time_sec: number;
  ai_mirror_text: string | null;
  created_at: string;
}

export interface CertSession {
  id: string;
  user_id: string;
  sector: ExamSector;
  selected_questions: string[];
  status: ExamStatus;
  start_time: string;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryScore {
  category: ExamCategory;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface CertResult {
  id: string;
  user_id: string;
  session_id: string;
  sector: ExamSector;
  total_score: number;
  category_scores: Record<string, number>;
  pass_fail: boolean;
  high_performer: boolean;
  ai_summary_text: string;
  strengths: string[];
  focus_areas: string[];
  insights: ExamInsights;
  per_question_reflections: QuestionReflection[];
  created_at: string;
}

export interface QuestionReflection {
  question_id: string;
  short_mirror: string;
  what_it_reveals: string;
}

export interface ExamInsights {
  mini_report: {
    headline: string;
    key_takeaway: string;
    action_prompt: string;
  };
  category_cards: Array<{
    category: string;
    score: number;
    emoji: string;
    strength_phrase: string;
    growth_phrase: string;
  }>;
}

export interface Certification {
  id: string;
  user_id: string;
  result_id: string;
  sector: ExamSector;
  level: CertificationLevel;
  verification_code: string;
  date_issued: string;
  created_at: string;
}

export interface AnalysisPayload {
  sector: ExamSector;
  category_scores: Record<string, number>;
  total_score: number;
  pass_fail: 'PASS' | 'NEEDS_IMPROVEMENT';
  answers: Array<{
    question_id: string;
    scenario: string;
    category: string;
    selected_text: string;
    points_awarded: number;
  }>;
}

export interface AnalysisResponse {
  summary_text: string;
  strengths: string[];
  focus_areas: string[];
  high_performer: boolean;
  insights: ExamInsights;
  per_question_reflections: QuestionReflection[];
}
