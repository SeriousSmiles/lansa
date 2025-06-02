
export interface GrowthPrompt {
  id: string;
  title: string;
  description: string;
  stage: string;
  order_index: number;
  is_active: boolean;
  action_type: string;
  action_label: string;
  created_at: string;
  updated_at: string;
}

export interface UserGrowthProgress {
  id: string;
  user_id: string;
  prompt_id: string;
  completed_at: string | null;
  is_completed: boolean;
  week_assigned: string;
  created_at: string;
  updated_at: string;
}

export interface UserGrowthStats {
  id: string;
  user_id: string;
  total_completed: number;
  current_streak: number;
  longest_streak: number;
  current_stage: string;
  last_completion_date: string | null;
  current_prompt_id: string | null;
  current_prompt_assigned_at: string | null;
  created_at: string;
  updated_at: string;
}
