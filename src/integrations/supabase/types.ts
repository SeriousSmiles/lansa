export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      ai_feedback_log: {
        Row: {
          ai_suggestion: string
          created_at: string
          id: string
          input_text: string
          reasoning: string
          score: Json
          section: string
          user_id: string
        }
        Insert: {
          ai_suggestion: string
          created_at?: string
          id?: string
          input_text: string
          reasoning: string
          score?: Json
          section: string
          user_id: string
        }
        Update: {
          ai_suggestion?: string
          created_at?: string
          id?: string
          input_text?: string
          reasoning?: string
          score?: Json
          section?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          action_link: string | null
          created_at: string
          expires_at: string | null
          id: string
          insight_text: string
          priority: number
          user_id: string
        }
        Insert: {
          action_link?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_text: string
          priority?: number
          user_id: string
        }
        Update: {
          action_link?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          insight_text?: string
          priority?: number
          user_id?: string
        }
        Relationships: []
      }
      ai_logs: {
        Row: {
          created_at: string
          error_flag: boolean
          expert: string
          id: string
          input_hash: string
          latency_ms: number | null
          model_used: string
          token_count: number | null
          user_id_hash: string
        }
        Insert: {
          created_at?: string
          error_flag?: boolean
          expert: string
          id?: string
          input_hash: string
          latency_ms?: number | null
          model_used: string
          token_count?: number | null
          user_id_hash: string
        }
        Update: {
          created_at?: string
          error_flag?: boolean
          expert?: string
          id?: string
          input_hash?: string
          latency_ms?: number | null
          model_used?: string
          token_count?: number | null
          user_id_hash?: string
        }
        Relationships: []
      }
      ai_mirror_reviews: {
        Row: {
          created_at: string
          hire_signal_score: number
          id: string
          manager_read: string
          risks: string[] | null
          source: string
          strengths: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          hire_signal_score?: number
          id?: string
          manager_read: string
          risks?: string[] | null
          source: string
          strengths?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          hire_signal_score?: number
          id?: string
          manager_read?: string
          risks?: string[] | null
          source?: string
          strengths?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      business_onboarding_data: {
        Row: {
          business_services: string | null
          business_size: string | null
          company_logo: string | null
          company_name: string | null
          created_at: string
          id: string
          open_job_listings: Json | null
          role_function: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          business_services?: string | null
          business_size?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          open_job_listings?: Json | null
          role_function?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          business_services?: string | null
          business_size?: string | null
          company_logo?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          open_job_listings?: Json | null
          role_function?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      business_profiles: {
        Row: {
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          id: string
          industry: string | null
          location: string | null
          organization_id: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      catalogue_entries: {
        Row: {
          availability: string | null
          created_at: string
          id: string
          internship_ready: boolean
          is_active: boolean
          job_ready: boolean
          location: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          created_at?: string
          id?: string
          internship_ready?: boolean
          is_active?: boolean
          job_ready?: boolean
          location?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          created_at?: string
          id?: string
          internship_ready?: boolean
          is_active?: boolean
          job_ready?: boolean
          location?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cert_answers: {
        Row: {
          ai_mirror_text: string | null
          created_at: string
          id: string
          points_awarded: number
          question_id: string
          selected_option_id: string
          session_id: string
        }
        Insert: {
          ai_mirror_text?: string | null
          created_at?: string
          id?: string
          points_awarded: number
          question_id: string
          selected_option_id: string
          session_id: string
        }
        Update: {
          ai_mirror_text?: string | null
          created_at?: string
          id?: string
          points_awarded?: number
          question_id?: string
          selected_option_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cert_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "cert_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cert_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cert_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cert_certifications: {
        Row: {
          created_at: string
          date_issued: string
          id: string
          level: Database["public"]["Enums"]["certification_level"]
          result_id: string
          sector: Database["public"]["Enums"]["exam_sector"]
          user_id: string
          verification_code: string
        }
        Insert: {
          created_at?: string
          date_issued?: string
          id?: string
          level?: Database["public"]["Enums"]["certification_level"]
          result_id: string
          sector: Database["public"]["Enums"]["exam_sector"]
          user_id: string
          verification_code: string
        }
        Update: {
          created_at?: string
          date_issued?: string
          id?: string
          level?: Database["public"]["Enums"]["certification_level"]
          result_id?: string
          sector?: Database["public"]["Enums"]["exam_sector"]
          user_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "cert_certifications_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "cert_results"
            referencedColumns: ["id"]
          },
        ]
      }
      cert_questions: {
        Row: {
          category: Database["public"]["Enums"]["exam_category"]
          choices: Json
          created_at: string
          id: string
          mirror_context: string
          mirror_role: string
          randomize_order: boolean
          scenario: string
          sector: Database["public"]["Enums"]["exam_sector"]
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["exam_category"]
          choices: Json
          created_at?: string
          id?: string
          mirror_context: string
          mirror_role: string
          randomize_order?: boolean
          scenario: string
          sector: Database["public"]["Enums"]["exam_sector"]
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["exam_category"]
          choices?: Json
          created_at?: string
          id?: string
          mirror_context?: string
          mirror_role?: string
          randomize_order?: boolean
          scenario?: string
          sector?: Database["public"]["Enums"]["exam_sector"]
          updated_at?: string
        }
        Relationships: []
      }
      cert_results: {
        Row: {
          ai_summary_text: string | null
          category_scores: Json
          created_at: string
          id: string
          pass_fail: boolean
          sector: Database["public"]["Enums"]["exam_sector"]
          session_id: string
          total_score: number
          user_id: string
        }
        Insert: {
          ai_summary_text?: string | null
          category_scores: Json
          created_at?: string
          id?: string
          pass_fail: boolean
          sector: Database["public"]["Enums"]["exam_sector"]
          session_id: string
          total_score: number
          user_id: string
        }
        Update: {
          ai_summary_text?: string | null
          category_scores?: Json
          created_at?: string
          id?: string
          pass_fail?: boolean
          sector?: Database["public"]["Enums"]["exam_sector"]
          session_id?: string
          total_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cert_results_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cert_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      cert_sessions: {
        Row: {
          created_at: string
          end_time: string | null
          id: string
          sector: Database["public"]["Enums"]["exam_sector"]
          selected_questions: Json
          start_time: string
          status: Database["public"]["Enums"]["exam_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: string
          sector: Database["public"]["Enums"]["exam_sector"]
          selected_questions: Json
          start_time?: string
          status?: Database["public"]["Enums"]["exam_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: string
          sector?: Database["public"]["Enums"]["exam_sector"]
          selected_questions?: Json
          start_time?: string
          status?: Database["public"]["Enums"]["exam_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          context: Database["public"]["Enums"]["match_context"]
          created_at: string
          created_by: string
          id: string
          job_listing_id: string | null
          last_message_at: string | null
          match_id: string | null
          participant_ids: string[]
        }
        Insert: {
          context: Database["public"]["Enums"]["match_context"]
          created_at?: string
          created_by: string
          id?: string
          job_listing_id?: string | null
          last_message_at?: string | null
          match_id?: string | null
          participant_ids: string[]
        }
        Update: {
          context?: Database["public"]["Enums"]["match_context"]
          created_at?: string
          created_by?: string
          id?: string
          job_listing_id?: string | null
          last_message_at?: string | null
          match_id?: string | null
          participant_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          name: string
          size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          size?: string | null
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
      job_applications: {
        Row: {
          applicant_user_id: string
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          responded_at: string | null
          status: string
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          applicant_user_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          responded_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          applicant_user_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          responded_at?: string | null
          status?: string
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications_v2: {
        Row: {
          applicant_user_id: string
          cover_note: string | null
          created_at: string
          id: string
          job_id: string
          organization_id: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_user_id: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_user_id?: string
          cover_note?: string | null
          created_at?: string
          id?: string
          job_id?: string
          organization_id?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_v2_applicant_user_id_fkey"
            columns: ["applicant_user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "job_applications_v2_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_v2_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_interactions: {
        Row: {
          created_at: string
          id: string
          job_id: string
          type: Database["public"]["Enums"]["interaction_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          type: Database["public"]["Enums"]["interaction_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          type?: Database["public"]["Enums"]["interaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_interactions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      job_listings: {
        Row: {
          business_id: string
          category: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          is_remote: boolean | null
          job_image: string | null
          job_type: string | null
          location: string | null
          mode: Database["public"]["Enums"]["match_context"]
          organization_id: string | null
          salary_range: string | null
          target_user_types: string[] | null
          title: string
          top_skills: string[] | null
          updated_at: string
        }
        Insert: {
          business_id: string
          category?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_remote?: boolean | null
          job_image?: string | null
          job_type?: string | null
          location?: string | null
          mode: Database["public"]["Enums"]["match_context"]
          organization_id?: string | null
          salary_range?: string | null
          target_user_types?: string[] | null
          title: string
          top_skills?: string[] | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          category?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          is_remote?: boolean | null
          job_image?: string | null
          job_type?: string | null
          location?: string | null
          mode?: Database["public"]["Enums"]["match_context"]
          organization_id?: string | null
          salary_range?: string | null
          target_user_types?: string[] | null
          title?: string
          top_skills?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings_v2: {
        Row: {
          category: string
          company_id: string
          created_by: string | null
          description: string
          expires_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          is_remote: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location: string | null
          organization_id: string | null
          posted_at: string
          salary_range: string | null
          search_tsv: unknown
          skills_required: Json | null
          target_user_types: Json | null
          title: string
        }
        Insert: {
          category: string
          company_id: string
          created_by?: string | null
          description: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_remote?: boolean | null
          job_type: Database["public"]["Enums"]["job_type"]
          location?: string | null
          organization_id?: string | null
          posted_at?: string
          salary_range?: string | null
          search_tsv?: unknown
          skills_required?: Json | null
          target_user_types?: Json | null
          title: string
        }
        Update: {
          category?: string
          company_id?: string
          created_by?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_remote?: boolean | null
          job_type?: Database["public"]["Enums"]["job_type"]
          location?: string | null
          organization_id?: string | null
          posted_at?: string
          salary_range?: string | null
          search_tsv?: unknown
          skills_required?: Json | null
          target_user_types?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_listings_v2_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_listings_v2_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "job_listings_v2_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      job_recommendations: {
        Row: {
          created_at: string
          job_id: string
          reason: string | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          reason?: string | null
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          reason?: string | null
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_recommendations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings_v2"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_recommendations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      job_skills: {
        Row: {
          job_id: string
          skill_name: string
        }
        Insert: {
          job_id: string
          skill_name: string
        }
        Update: {
          job_id?: string
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings_v2"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          context: Database["public"]["Enums"]["match_context"]
          created_at: string
          id: string
          job_listing_id: string | null
          latest_activity_at: string
          user_a: string
          user_b: string
          user_high: string | null
          user_low: string | null
        }
        Insert: {
          context: Database["public"]["Enums"]["match_context"]
          created_at?: string
          id?: string
          job_listing_id?: string | null
          latest_activity_at?: string
          user_a: string
          user_b: string
          user_high?: string | null
          user_low?: string | null
        }
        Update: {
          context?: Database["public"]["Enums"]["match_context"]
          created_at?: string
          id?: string
          job_listing_id?: string | null
          latest_activity_at?: string
          user_a?: string
          user_b?: string
          user_high?: string | null
          user_low?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          organization_id: string
          performed_by: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id: string
          performed_by?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          performed_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_audit_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role?: string
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          clerk_user_id: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          is_active: boolean
          joined_at: string
          metadata: Json | null
          organization_id: string
          permissions: Json | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string
          metadata?: Json | null
          organization_id: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          clerk_user_id?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          is_active?: boolean
          joined_at?: string
          metadata?: Json | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_status: string | null
          clerk_org_id: string
          created_at: string
          description: string | null
          domain: string | null
          id: string
          industry: string | null
          is_active: boolean
          logo_url: string | null
          name: string
          plan_type: string | null
          seat_limit: number | null
          settings: Json | null
          size_range: string | null
          slug: string
          updated_at: string
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          billing_status?: string | null
          clerk_org_id: string
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          logo_url?: string | null
          name: string
          plan_type?: string | null
          seat_limit?: number | null
          settings?: Json | null
          size_range?: string | null
          slug: string
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          billing_status?: string | null
          clerk_org_id?: string
          created_at?: string
          description?: string | null
          domain?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean
          logo_url?: string | null
          name?: string
          plan_type?: string | null
          seat_limit?: number | null
          settings?: Json | null
          size_range?: string | null
          slug?: string
          updated_at?: string
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      swipes: {
        Row: {
          context: Database["public"]["Enums"]["match_context"]
          created_at: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id: string
          job_listing_id: string | null
          swiper_user_id: string
          target_user_id: string
        }
        Insert: {
          context: Database["public"]["Enums"]["match_context"]
          created_at?: string
          direction: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          job_listing_id?: string | null
          swiper_user_id: string
          target_user_id: string
        }
        Update: {
          context?: Database["public"]["Enums"]["match_context"]
          created_at?: string
          direction?: Database["public"]["Enums"]["swipe_direction"]
          id?: string
          job_listing_id?: string | null
          swiper_user_id?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swipes_job_listing_id_fkey"
            columns: ["job_listing_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_90day_goal: {
        Row: {
          ai_interpretation: string | null
          assumptions: string[] | null
          clarity_level: string | null
          clarity_score: number | null
          created_at: string
          employer_relevance_score: number | null
          feedback: string | null
          follow_up_question: string | null
          goal_statement: string
          id: string
          initiative_type: string | null
          overall_strength: number | null
          risk_notes: string[] | null
          specificity_score: number | null
          success_metric: string | null
          user_id: string
        }
        Insert: {
          ai_interpretation?: string | null
          assumptions?: string[] | null
          clarity_level?: string | null
          clarity_score?: number | null
          created_at?: string
          employer_relevance_score?: number | null
          feedback?: string | null
          follow_up_question?: string | null
          goal_statement: string
          id?: string
          initiative_type?: string | null
          overall_strength?: number | null
          risk_notes?: string[] | null
          specificity_score?: number | null
          success_metric?: string | null
          user_id: string
        }
        Update: {
          ai_interpretation?: string | null
          assumptions?: string[] | null
          clarity_level?: string | null
          clarity_score?: number | null
          created_at?: string
          employer_relevance_score?: number | null
          feedback?: string | null
          follow_up_question?: string | null
          goal_statement?: string
          id?: string
          initiative_type?: string | null
          overall_strength?: number | null
          risk_notes?: string[] | null
          specificity_score?: number | null
          success_metric?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          created_at: string | null
          credential_id: string | null
          credential_url: string | null
          date_achieved: string | null
          description: string
          display_order: number | null
          id: string
          is_featured: boolean | null
          organization: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          date_achieved?: string | null
          description: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          organization?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credential_id?: string | null
          credential_url?: string | null
          date_achieved?: string | null
          description?: string
          display_order?: number | null
          id?: string
          is_featured?: boolean | null
          organization?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
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
          ai_onboarding_card: Json | null
          career_path: Database["public"]["Enums"]["career_path_type"] | null
          career_path_onboarding_completed: boolean | null
          created_at: string
          desired_outcome: string | null
          gender: string | null
          id: string
          identity: string | null
          onboarding_inputs: Json | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          age_group?: string | null
          ai_onboarding_card?: Json | null
          career_path?: Database["public"]["Enums"]["career_path_type"] | null
          career_path_onboarding_completed?: boolean | null
          created_at?: string
          desired_outcome?: string | null
          gender?: string | null
          id?: string
          identity?: string | null
          onboarding_inputs?: Json | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          age_group?: string | null
          ai_onboarding_card?: Json | null
          career_path?: Database["public"]["Enums"]["career_path_type"] | null
          career_path_onboarding_completed?: boolean | null
          created_at?: string
          desired_outcome?: string | null
          gender?: string | null
          id?: string
          identity?: string | null
          onboarding_inputs?: Json | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      user_certifications: {
        Row: {
          assessment_score: number | null
          certified_at: string | null
          created_at: string
          id: string
          lansa_certified: boolean
          mini_project_url: string | null
          updated_at: string
          user_id: string
          verified: boolean
          verified_by: string | null
        }
        Insert: {
          assessment_score?: number | null
          certified_at?: string | null
          created_at?: string
          id?: string
          lansa_certified?: boolean
          mini_project_url?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
          verified_by?: string | null
        }
        Update: {
          assessment_score?: number | null
          certified_at?: string | null
          created_at?: string
          id?: string
          lansa_certified?: boolean
          mini_project_url?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
          verified_by?: string | null
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
      user_job_preferences: {
        Row: {
          categories: string[] | null
          filtering_mode: string
          id: string
          is_remote_preferred: boolean | null
          job_types: string[] | null
          location_preferences: string[] | null
          preferences_set_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          categories?: string[] | null
          filtering_mode?: string
          id?: string
          is_remote_preferred?: boolean | null
          job_types?: string[] | null
          location_preferences?: string[] | null
          preferences_set_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          categories?: string[] | null
          filtering_mode?: string
          id?: string
          is_remote_preferred?: boolean | null
          job_types?: string[] | null
          location_preferences?: string[] | null
          preferences_set_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_job_prefs: {
        Row: {
          categories: Json | null
          job_types: Json | null
          remote_only: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: Json | null
          job_types?: Json | null
          remote_only?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: Json | null
          job_types?: Json | null
          remote_only?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_job_prefs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_migration_mapping: {
        Row: {
          clerk_user_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          metadata: Json | null
          migration_status: string
          supabase_user_id: string
          updated_at: string
        }
        Insert: {
          clerk_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          metadata?: Json | null
          migration_status?: string
          supabase_user_id: string
          updated_at?: string
        }
        Update: {
          clerk_user_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          metadata?: Json | null
          migration_status?: string
          supabase_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_power_skills: {
        Row: {
          ai_category: string | null
          business_value_type: string | null
          clarity_score: number | null
          created_at: string
          employer_relevance_score: number | null
          feedback: string | null
          follow_up_question: string | null
          id: string
          original_skill: string
          overall_strength: number | null
          reframed_skill: string | null
          specificity_score: number | null
          user_id: string
          value_statements: string[] | null
          value_tags: string[] | null
        }
        Insert: {
          ai_category?: string | null
          business_value_type?: string | null
          clarity_score?: number | null
          created_at?: string
          employer_relevance_score?: number | null
          feedback?: string | null
          follow_up_question?: string | null
          id?: string
          original_skill: string
          overall_strength?: number | null
          reframed_skill?: string | null
          specificity_score?: number | null
          user_id: string
          value_statements?: string[] | null
          value_tags?: string[] | null
        }
        Update: {
          ai_category?: string | null
          business_value_type?: string | null
          clarity_score?: number | null
          created_at?: string
          employer_relevance_score?: number | null
          feedback?: string | null
          follow_up_question?: string | null
          id?: string
          original_skill?: string
          overall_strength?: number | null
          reframed_skill?: string | null
          specificity_score?: number | null
          user_id?: string
          value_statements?: string[] | null
          value_tags?: string[] | null
        }
        Relationships: []
      }
      user_profile_certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          credential_url: string | null
          description: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuer: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          credential_url?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          about_text: string | null
          academic_status: string | null
          age_group: string | null
          biggest_challenge: string | null
          career_goal_type: string | null
          clerk_user_id: string | null
          cover_color: string | null
          created_at: string | null
          cv_imported_at: string | null
          cv_last_used: string | null
          cv_source_metadata: Json | null
          desired_outcome: string | null
          education: Json | null
          email: string | null
          experiences: Json | null
          field_of_study: string | null
          first_name: string | null
          gender: string | null
          highlight_color: string | null
          hire_rate_score: number | null
          identity: string | null
          is_public: boolean
          languages: Json | null
          last_name: string | null
          location: string | null
          major: string | null
          migration_status: string | null
          name: string | null
          onboarding_completed: boolean | null
          organization_id: string | null
          phone_number: string | null
          privacy_settings: Json | null
          professional_goal: string | null
          profile_image: string | null
          score_breakdown: Json | null
          skills: string[] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          about_text?: string | null
          academic_status?: string | null
          age_group?: string | null
          biggest_challenge?: string | null
          career_goal_type?: string | null
          clerk_user_id?: string | null
          cover_color?: string | null
          created_at?: string | null
          cv_imported_at?: string | null
          cv_last_used?: string | null
          cv_source_metadata?: Json | null
          desired_outcome?: string | null
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          field_of_study?: string | null
          first_name?: string | null
          gender?: string | null
          highlight_color?: string | null
          hire_rate_score?: number | null
          identity?: string | null
          is_public?: boolean
          languages?: Json | null
          last_name?: string | null
          location?: string | null
          major?: string | null
          migration_status?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          phone_number?: string | null
          privacy_settings?: Json | null
          professional_goal?: string | null
          profile_image?: string | null
          score_breakdown?: Json | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          about_text?: string | null
          academic_status?: string | null
          age_group?: string | null
          biggest_challenge?: string | null
          career_goal_type?: string | null
          clerk_user_id?: string | null
          cover_color?: string | null
          created_at?: string | null
          cv_imported_at?: string | null
          cv_last_used?: string | null
          cv_source_metadata?: Json | null
          desired_outcome?: string | null
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          field_of_study?: string | null
          first_name?: string | null
          gender?: string | null
          highlight_color?: string | null
          hire_rate_score?: number | null
          identity?: string | null
          is_public?: boolean
          languages?: Json | null
          last_name?: string | null
          location?: string | null
          major?: string | null
          migration_status?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          organization_id?: string | null
          phone_number?: string | null
          privacy_settings?: Json | null
          professional_goal?: string | null
          profile_image?: string | null
          score_breakdown?: Json | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles_public: {
        Row: {
          about_text: string | null
          achievements: Json | null
          biggest_challenge: string | null
          cover_color: string | null
          created_at: string
          education: Json | null
          email: string | null
          experiences: Json | null
          highlight_color: string | null
          languages: Json | null
          location: string | null
          name: string | null
          phone_number: string | null
          professional_goal: string | null
          profile_image: string | null
          skills: string[] | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about_text?: string | null
          achievements?: Json | null
          biggest_challenge?: string | null
          cover_color?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          highlight_color?: string | null
          languages?: Json | null
          location?: string | null
          name?: string | null
          phone_number?: string | null
          professional_goal?: string | null
          profile_image?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about_text?: string | null
          achievements?: Json | null
          biggest_challenge?: string | null
          cover_color?: string | null
          created_at?: string
          education?: Json | null
          email?: string | null
          experiences?: Json | null
          highlight_color?: string | null
          languages?: Json | null
          location?: string | null
          name?: string | null
          phone_number?: string | null
          professional_goal?: string | null
          profile_image?: string | null
          skills?: string[] | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_featured: boolean | null
          start_date: string | null
          technologies: string[] | null
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean | null
          start_date?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_featured?: boolean | null
          start_date?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_resumes: {
        Row: {
          confidence_scores: Json | null
          created_at: string
          error_message: string | null
          extracted_data: Json | null
          file_size: number | null
          id: string
          original_filename: string
          parsing_source: string
          processed_at: string | null
          processing_status: string
          raw_response: Json | null
          sections_found: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence_scores?: Json | null
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          file_size?: number | null
          id?: string
          original_filename: string
          parsing_source?: string
          processed_at?: string | null
          processing_status?: string
          raw_response?: Json | null
          sections_found?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence_scores?: Json | null
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          file_size?: number | null
          id?: string
          original_filename?: string
          parsing_source?: string
          processed_at?: string | null
          processing_status?: string
          raw_response?: Json | null
          sections_found?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          is_organization_role: boolean | null
          organization_id: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_organization_role?: boolean | null
          organization_id?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_organization_role?: boolean | null
          organization_id?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stories: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          metadata: Json | null
          story_type: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          story_type: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          metadata?: Json | null
          story_type?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      catalogue_students: {
        Row: {
          about_text: string | null
          certified_at: string | null
          cover_color: string | null
          highlight_color: string | null
          internship_ready: boolean | null
          job_ready: boolean | null
          lansa_certified: boolean | null
          location: string | null
          name: string | null
          professional_goal: string | null
          profile_image: string | null
          skills: string[] | null
          title: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_org_membership: {
        Args: { _organization_id: string; _roles?: string[]; _user_id: string }
        Returns: boolean
      }
      create_organization_with_owner: {
        Args: {
          p_description?: string
          p_domain?: string
          p_industry?: string
          p_logo_url?: string
          p_name: string
          p_size_range?: string
          p_website?: string
        }
        Returns: Json
      }
      generate_cert_verification_code: { Args: never; Returns: string }
      has_org_role: {
        Args: { _org_id: string; _role: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_thread_participant: {
        Args: { _thread_id: string; _user_id: string }
        Returns: boolean
      }
      log_org_action: {
        Args: {
          _action: string
          _metadata?: Json
          _org_id: string
          _performed_by: string
          _user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "business"
        | "student"
        | "org_owner"
        | "org_admin"
        | "org_manager"
        | "org_member"
      application_status: "pending" | "accepted" | "declined" | "withdrawn"
      career_path_type:
        | "student"
        | "visionary"
        | "entrepreneur"
        | "freelancer"
        | "business"
      certification_level: "standard" | "high_performer"
      exam_category:
        | "mindset"
        | "workplace_intelligence"
        | "performance_habits"
        | "applied_thinking"
      exam_sector: "office" | "service" | "technical" | "digital"
      exam_status: "in_progress" | "completed" | "abandoned"
      interaction_type: "view" | "save" | "apply" | "ignore" | "share"
      job_type: "full_time" | "part_time" | "contract" | "internship"
      match_context: "employee" | "internship"
      swipe_direction: "right" | "left" | "nudge"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "business",
        "student",
        "org_owner",
        "org_admin",
        "org_manager",
        "org_member",
      ],
      application_status: ["pending", "accepted", "declined", "withdrawn"],
      career_path_type: [
        "student",
        "visionary",
        "entrepreneur",
        "freelancer",
        "business",
      ],
      certification_level: ["standard", "high_performer"],
      exam_category: [
        "mindset",
        "workplace_intelligence",
        "performance_habits",
        "applied_thinking",
      ],
      exam_sector: ["office", "service", "technical", "digital"],
      exam_status: ["in_progress", "completed", "abandoned"],
      interaction_type: ["view", "save", "apply", "ignore", "share"],
      job_type: ["full_time", "part_time", "contract", "internship"],
      match_context: ["employee", "internship"],
      swipe_direction: ["right", "left", "nudge"],
    },
  },
} as const
