export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          insight_type: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: number
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: number
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      growth_prompts: {
        Row: {
          action_label: string
          action_type: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          order_index: number
          stage: string
          title: string
          updated_at: string
        }
        Insert: {
          action_label?: string
          action_type?: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          order_index?: number
          stage: string
          title: string
          updated_at?: string
        }
        Update: {
          action_label?: string
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          order_index?: number
          stage?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_answers: {
        Row: {
          age_group: string | null
          created_at: string
          desired_outcome: string | null
          gender: string | null
          id: string
          identity: string | null
          onboarding_completed: boolean | null
          question1: string | null
          question2: string | null
          question3: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_group?: string | null
          created_at?: string
          desired_outcome?: string | null
          gender?: string | null
          id?: string
          identity?: string | null
          onboarding_completed?: boolean | null
          question1?: string | null
          question2?: string | null
          question3?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_group?: string | null
          created_at?: string
          desired_outcome?: string | null
          gender?: string | null
          id?: string
          identity?: string | null
          onboarding_completed?: boolean | null
          question1?: string | null
          question2?: string | null
          question3?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_growth_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          prompt_id: string
          updated_at: string
          user_id: string
          week_assigned: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          prompt_id: string
          updated_at?: string
          user_id: string
          week_assigned?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          prompt_id?: string
          updated_at?: string
          user_id?: string
          week_assigned?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_growth_progress_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "growth_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_growth_stats: {
        Row: {
          created_at: string
          current_prompt_assigned_at: string | null
          current_prompt_id: string | null
          current_stage: string
          current_streak: number
          id: string
          last_completion_date: string | null
          longest_streak: number
          total_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_prompt_assigned_at?: string | null
          current_prompt_id?: string | null
          current_stage?: string
          current_streak?: number
          id?: string
          last_completion_date?: string | null
          longest_streak?: number
          total_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_prompt_assigned_at?: string | null
          current_prompt_id?: string | null
          current_stage?: string
          current_streak?: number
          id?: string
          last_completion_date?: string | null
          longest_streak?: number
          total_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_growth_stats_current_prompt_id_fkey"
            columns: ["current_prompt_id"]
            isOneToOne: false
            referencedRelation: "growth_prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          about_text: string | null
          age_group: string | null
          biggest_challenge: string | null
          cover_color: string | null
          created_at: string | null
          desired_outcome: string | null
          education: Json | null
          email: string | null
          experiences: Json | null
          gender: string | null
          highlight_color: string | null
          identity: string | null
          name: string | null
          phone_number: string | null
          professional_goal: string | null
          profile_image: string | null
          skills: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          about_text?: string | null
          age_group?: string | null
          biggest_challenge?: string | null
          cover_color?: string | null
          created_at?: string | null
          desired_outcome?: string | null
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          gender?: string | null
          highlight_color?: string | null
          identity?: string | null
          name?: string | null
          phone_number?: string | null
          professional_goal?: string | null
          profile_image?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          about_text?: string | null
          age_group?: string | null
          biggest_challenge?: string | null
          cover_color?: string | null
          created_at?: string | null
          desired_outcome?: string | null
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          gender?: string | null
          highlight_color?: string | null
          identity?: string | null
          name?: string | null
          phone_number?: string | null
          professional_goal?: string | null
          profile_image?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
