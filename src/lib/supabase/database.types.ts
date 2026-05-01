// Supabase Database Types
// 基礎類型定義，用於 TypeScript 類型檢查

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      student_profiles: {
        Row: {
          id: string
          user_id: string
          group_code: string
          grade: number
          school_name: string | null
          target_pathways: string[]
          target_schooles: any[]
          total_records: number
          total_bonus_percent: number
          partner_ids: string[]
          warmth_points: number
          parent_ids: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          group_code: string
          grade: number
          school_name: string | null
          target_pathways: string[]
          target_schooles: any[]
          total_records: number
          total_bonus_percent: number
          partner_ids: string[]
          warmth_points: number
          parent_ids: string[]
          created_at: string
          updated_at: string
        }
        Update: {
          id?: string
          user_id?: string
          group_code?: string
          grade?: number
          school_name?: string | null
          target_pathways?: string[]
          target_schooles?: any[]
          total_records?: number
          total_bonus_percent?: number
          partner_ids?: string[]
          warmth_points?: number
          parent_ids?: string[]
          updated_at?: string
        }
      }
      ability_records: {
        Row: {
          id: string
          student_id: string
          category: string
          title: string
          description: string
          occurred_date: string
          semester: string
          portfolio_code: string
          scoring_value: any
          process_description: string
          reflection: string
          evidence_url: string
          bonus_percent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          category: string
          title: string
          description: string
          occurred_date: string
          semester: string
          portfolio_code: string
          scoring_value: any
          process_description: string
          reflection: string
          evidence_url: string
          bonus_percent: number
        }
        Update: {
          category?: string
          title?: string
          description?: string
          occurred_date?: string
          semester?: string
          portfolio_code?: string
          scoring_value?: any
          process_description?: string
          reflection?: string
          evidence_url?: string
          bonus_percent?: number
          updated_at?: string
        }
      }
      learning_portfolios: {
        Row: {
          id: string
          student_id: string
          title: string
          content: string
          category: string
          tags: string[]
          word_count: number
          version: number
          is_final: boolean
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          title: string
          content: string
          category?: string
          tags?: string[]
          word_count?: number
          version?: number
          is_final?: boolean
          is_published?: boolean
        }
        Update: {
          title?: string
          content?: string
          category?: string
          tags?: string[]
          word_count?: number
          version?: number
          is_final?: boolean
          is_published?: boolean
          updated_at?: string
        }
      }
      parent_profiles: {
        Row: {
          id: string
          user_id: string | null
          student_id: string
          relationship: string
          display_name: string | null
          phone: string | null
          notification_preferences: any
          language: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string | null
          student_id: string
          relationship: string
          display_name?: string | null
          phone?: string | null
          notification_preferences?: any
          language?: string
          is_active?: boolean
        }
        Update: {
          display_name?: string | null
          phone?: string | null
          notification_preferences?: any
          language?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      parent_reports: {
        Row: {
          id: string
          student_id: string
          parent_id: string
          report_type: string
          content: any
          summary: string | null
          is_paid: boolean
          price: number
          payment_status: string
          include_portfolio: boolean
          include_timeline: boolean
          include_achievements: boolean
          include_ai_insights: boolean
          share_token: string | null
          share_expires_at: string | null
          share_count: number
          last_viewed_at: string | null
          generated_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          parent_id: string
          report_type: string
          content: any
          summary?: string | null
          is_paid?: boolean
          price?: number
          payment_status?: string
          include_portfolio?: boolean
          include_timeline?: boolean
          include_achievements?: boolean
          include_ai_insights?: boolean
          share_token?: string | null
          share_expires_at?: string | null
        }
        Update: {
          content?: any
          summary?: string | null
          is_paid?: boolean
          price?: number
          payment_status?: string
          share_expires_at?: string | null
          last_viewed_at?: string | null
          updated_at?: string
        }
      }
      parent_invites: {
        Row: {
          id: string
          student_id: string
          parent_id: string | null
          invite_code: string
          permissions: any
          can_view_portfolio: boolean
          can_view_timeline: boolean
          can_view_achievements: boolean
          status: string
          expires_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          student_id: string
          invite_code: string
          permissions?: any
          can_view_portfolio?: boolean
          can_view_timeline?: boolean
          can_view_achievements?: boolean
          status?: string
          expires_at: string
        }
        Update: {
          parent_id?: string | null
          status?: string
          updated_at?: string
        }
      }
      referral_codes: {
        Row: {
          id: string
          referrer_id: string
          code: string
          is_active: boolean
          total_uses: number
          successful_conversions: number
          created_at: string
          expires_at: string | null
        }
        Insert: {
          referrer_id: string
          code: string
          is_active?: boolean
          expires_at?: string | null
        }
        Update: {
          is_active?: boolean
        }
      }
      referral_tracking: {
        Row: {
          id: string
          referral_code_id: string
          referred_user_id: string | null
          status: string
          referrer_reward_xp: number
          referred_reward_xp: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          referral_code_id: string
          referred_user_id?: string | null
          status?: string
          referrer_reward_xp?: number
          referred_reward_xp?: number
        }
        Update: {
          status?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      share_analytics: {
        Row: {
          id: string
          user_id: string | null
          share_type: string
          platform: string | null
          content_id: string | null
          share_token: string | null
          views: number
          clicks: number
          conversions: number
          created_at: string
        }
        Insert: {
          user_id?: string | null
          share_type: string
          platform?: string | null
          content_id?: string | null
          share_token?: string | null
        }
        Update: {}
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
  }
}