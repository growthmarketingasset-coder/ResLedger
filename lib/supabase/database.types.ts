export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: { Row: { id: string; email: string; full_name: string | null; avatar_url: string | null; created_at: string; updated_at: string }; Insert: { id: string; email: string; full_name?: string | null }; Update: { full_name?: string | null; updated_at?: string } }
      tags: { Row: { id: string; user_id: string; name: string; color: string; created_at: string }; Insert: { id?: string; user_id: string; name: string; color?: string }; Update: { name?: string; color?: string } }
      learnings: {
        Row: { id: string; user_id: string; title: string; summary: string | null; details: string | null; source: string | null; industry: string | null; what_to_do: string | null; potential_impact: string; review_date: string | null; is_reviewed: boolean; is_pinned: boolean; is_archived: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; summary?: string | null; details?: string | null; source?: string | null; industry?: string | null; what_to_do?: string | null; potential_impact?: string; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean }
        Update: { title?: string; summary?: string | null; details?: string | null; source?: string | null; industry?: string | null; what_to_do?: string | null; potential_impact?: string; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean; updated_at?: string }
      }
      resources: {
        Row: { id: string; user_id: string; title: string; url: string | null; description: string | null; resource_type: string; industry: string | null; what_to_do: string | null; potential_impact: string; review_date: string | null; is_reviewed: boolean; is_pinned: boolean; is_archived: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; url?: string | null; description?: string | null; resource_type?: string; industry?: string | null; what_to_do?: string | null; potential_impact?: string; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean }
        Update: { title?: string; url?: string | null; description?: string | null; resource_type?: string; industry?: string | null; what_to_do?: string | null; potential_impact?: string; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean; updated_at?: string }
      }
      templates: {
        Row: { id: string; user_id: string; title: string; description: string | null; content: string | null; url: string | null; category: string | null; what_to_do: string | null; potential_impact: string; review_date: string | null; is_reviewed: boolean; is_pinned: boolean; is_archived: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; description?: string | null; content?: string | null; url?: string | null; category?: string | null; what_to_do?: string | null; potential_impact?: string; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean }
        Update: { title?: string; description?: string | null; content?: string | null; url?: string | null; category?: string | null; what_to_do?: string | null; potential_impact?: string; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean; updated_at?: string }
      }
      tools: {
        Row: { id: string; user_id: string; title: string; url: string | null; description: string | null; category: string | null; pricing: string; is_pinned: boolean; is_archived: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; url?: string | null; description?: string | null; category?: string | null; pricing?: string; is_pinned?: boolean; is_archived?: boolean }
        Update: { title?: string; url?: string | null; description?: string | null; category?: string | null; pricing?: string; is_pinned?: boolean; is_archived?: boolean; updated_at?: string }
      }
      ideas: {
        Row: { id: string; user_id: string; title: string; description: string | null; status: string; industry: string | null; potential: string | null; what_to_do: string | null; review_date: string | null; is_reviewed: boolean; is_pinned: boolean; is_archived: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; description?: string | null; status?: string; industry?: string | null; potential?: string | null; what_to_do?: string | null; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean }
        Update: { title?: string; description?: string | null; status?: string; industry?: string | null; potential?: string | null; what_to_do?: string | null; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean; updated_at?: string }
      }
      ai_strategies: {
        Row: { id: string; user_id: string; title: string; objective: string | null; approach: string | null; tools_used: string | null; outcome: string | null; status: string; industry: string | null; potential_impact: string; what_to_do: string | null; review_date: string | null; is_reviewed: boolean; is_pinned: boolean; is_archived: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; user_id: string; title: string; objective?: string | null; approach?: string | null; tools_used?: string | null; outcome?: string | null; status?: string; industry?: string | null; potential_impact?: string; what_to_do?: string | null; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean }
        Update: { title?: string; objective?: string | null; approach?: string | null; tools_used?: string | null; outcome?: string | null; status?: string; industry?: string | null; potential_impact?: string; what_to_do?: string | null; review_date?: string | null; is_reviewed?: boolean; is_pinned?: boolean; is_archived?: boolean; updated_at?: string }
      }
      entry_tags: { Row: { id: string; tag_id: string; entry_type: string; entry_id: string; created_at: string }; Insert: { id?: string; tag_id: string; entry_type: string; entry_id: string }; Update: never }
      internal_links: { Row: { id: string; user_id: string; source_type: string; source_id: string; target_type: string; target_id: string; created_at: string }; Insert: { id?: string; user_id: string; source_type: string; source_id: string; target_type: string; target_id: string }; Update: never }
    }
  }
}

export type Tag = Database['public']['Tables']['tags']['Row']
export type Learning = Database['public']['Tables']['learnings']['Row']
export type Resource = Database['public']['Tables']['resources']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
export type Tool = Database['public']['Tables']['tools']['Row']
export type Idea = Database['public']['Tables']['ideas']['Row']
export type AiStrategy = Database['public']['Tables']['ai_strategies']['Row']
export type EntryType = 'learning' | 'resource' | 'template' | 'tool' | 'idea' | 'ai_strategy'
export const IMPACT_LEVELS = ['low', 'medium', 'high', 'game_changing'] as const
export type ImpactLevel = typeof IMPACT_LEVELS[number]

// ── v2 extended types ────────────────────────────────────────────────────────
export interface AiStrategy {
  id: string
  user_id: string
  title: string
  objective: string | null
  approach: string | null
  tools_used: string | null
  outcome: string | null
  status: string
  impact_level: string
  industry: string | null
  action_plan: string | null
  review_date: string | null
  is_reviewed: boolean
  is_pinned: boolean
  is_archived: boolean
  created_at: string
  updated_at: string
}
