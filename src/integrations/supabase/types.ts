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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      api_key_usage_logs: {
        Row: {
          api_key_id: string
          id: string
          ip_address: unknown
          success: boolean
          usage_type: string
          used_at: string
          user_agent: string | null
          user_wallet: string
        }
        Insert: {
          api_key_id: string
          id?: string
          ip_address?: unknown
          success?: boolean
          usage_type: string
          used_at?: string
          user_agent?: string | null
          user_wallet: string
        }
        Update: {
          api_key_id?: string
          id?: string
          ip_address?: unknown
          success?: boolean
          usage_type?: string
          used_at?: string
          user_agent?: string | null
          user_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_key_usage_logs_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          api_key: string
          created_at: string | null
          encrypted_key: string | null
          encryption_version: number | null
          id: string
          last_used_at: string | null
          updated_at: string | null
          user_wallet: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          encrypted_key?: string | null
          encryption_version?: number | null
          id?: string
          last_used_at?: string | null
          updated_at?: string | null
          user_wallet: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          encrypted_key?: string | null
          encryption_version?: number | null
          id?: string
          last_used_at?: string | null
          updated_at?: string | null
          user_wallet?: string
        }
        Relationships: []
      }
      branch_progress: {
        Row: {
          branch_id: string
          completed_missions: Json
          created_at: string
          current_vri: number
          first_cleared_at: string | null
          id: string
          is_cleared: boolean
          last_played_at: string
          max_vri: number
          user_id: string
        }
        Insert: {
          branch_id: string
          completed_missions?: Json
          created_at?: string
          current_vri?: number
          first_cleared_at?: string | null
          id?: string
          is_cleared?: boolean
          last_played_at?: string
          max_vri: number
          user_id: string
        }
        Update: {
          branch_id?: string
          completed_missions?: Json
          created_at?: string
          current_vri?: number
          first_cleared_at?: string | null
          id?: string
          is_cleared?: boolean
          last_played_at?: string
          max_vri?: number
          user_id?: string
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          created_at: string | null
          id: string
          payload_encrypted: string
          session_id: string | null
          sha256_hash: string
          vault_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload_encrypted: string
          session_id?: string | null
          sha256_hash: string
          vault_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payload_encrypted?: string
          session_id?: string | null
          sha256_hash?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "story_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_logs_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_free_claims: {
        Row: {
          claim_date: string
          created_at: string
          id: string
          user_wallet: string
        }
        Insert: {
          claim_date?: string
          created_at?: string
          id?: string
          user_wallet: string
        }
        Update: {
          claim_date?: string
          created_at?: string
          id?: string
          user_wallet?: string
        }
        Relationships: []
      }
      debut_badges: {
        Row: {
          badge_id: string | null
          created_at: string | null
          id: string
          tx_digest: string | null
          vault_id: string | null
        }
        Insert: {
          badge_id?: string | null
          created_at?: string | null
          id?: string
          tx_digest?: string | null
          vault_id?: string | null
        }
        Update: {
          badge_id?: string | null
          created_at?: string | null
          id?: string
          tx_digest?: string | null
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debut_badges_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      debut_cards: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          token_id: string | null
          tx_digest: string | null
          vault_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          token_id?: string | null
          tx_digest?: string | null
          vault_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          token_id?: string | null
          tx_digest?: string | null
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "debut_cards_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_progress: {
        Row: {
          branch_id: string
          choices_made: Json | null
          completed_at: string | null
          created_at: string | null
          current_beat: string
          current_turn: number
          episode_id: string
          id: string
          is_completed: boolean | null
          mission_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          branch_id: string
          choices_made?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_beat?: string
          current_turn?: number
          episode_id: string
          id?: string
          is_completed?: boolean | null
          mission_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          branch_id?: string
          choices_made?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_beat?: string
          current_turn?: number
          episode_id?: string
          id?: string
          is_completed?: boolean | null
          mission_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      idol_cards: {
        Row: {
          id: string
          minted_at: string | null
          token_id: string | null
          tx_digest: string | null
          vault_id: string | null
        }
        Insert: {
          id?: string
          minted_at?: string | null
          token_id?: string | null
          tx_digest?: string | null
          vault_id?: string | null
        }
        Update: {
          id?: string
          minted_at?: string | null
          token_id?: string | null
          tx_digest?: string | null
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "idol_cards_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      idols: {
        Row: {
          Category: string
          Concept: string
          created_at: string | null
          description: string | null
          Gender: string
          id: number
          name: string
          persona_prompt: string | null
          personality: string | null
          profile_image: string | null
        }
        Insert: {
          Category: string
          Concept: string
          created_at?: string | null
          description?: string | null
          Gender: string
          id?: number
          name: string
          persona_prompt?: string | null
          personality?: string | null
          profile_image?: string | null
        }
        Update: {
          Category?: string
          Concept?: string
          created_at?: string | null
          description?: string | null
          Gender?: string
          id?: number
          name?: string
          persona_prompt?: string | null
          personality?: string | null
          profile_image?: string | null
        }
        Relationships: []
      }
      idolsx: {
        Row: {
          created_at: string | null
          description: string
          id: number
          name: string
          persona_prompt: string
          personality: string
          profile_image: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: number
          name: string
          persona_prompt: string
          personality: string
          profile_image: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: number
          name?: string
          persona_prompt?: string
          personality?: string
          profile_image?: string
        }
        Relationships: []
      }
      memory_cards: {
        Row: {
          branch_id: string | null
          branch_year: number | null
          caption: string | null
          choice_hash: string
          created_at: string | null
          id: string
          image_url: string | null
          moment_hash: string
          rarity: number
          scene_id: number
          token_id: string | null
          tx_digest: string | null
          value_type: string | null
          vault_id: string | null
          vri_value: number | null
        }
        Insert: {
          branch_id?: string | null
          branch_year?: number | null
          caption?: string | null
          choice_hash: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          moment_hash: string
          rarity: number
          scene_id: number
          token_id?: string | null
          tx_digest?: string | null
          value_type?: string | null
          vault_id?: string | null
          vri_value?: number | null
        }
        Update: {
          branch_id?: string | null
          branch_year?: number | null
          caption?: string | null
          choice_hash?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          moment_hash?: string
          rarity?: number
          scene_id?: number
          token_id?: string | null
          tx_digest?: string | null
          value_type?: string | null
          vault_id?: string | null
          vri_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_cards_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      photocard_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_unlimited: boolean
          remaining_credits: number
          serial_key: string
          total_credits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_unlimited?: boolean
          remaining_credits?: number
          serial_key: string
          total_credits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_unlimited?: boolean
          remaining_credits?: number
          serial_key?: string
          total_credits?: number
          updated_at?: string
        }
        Relationships: []
      }
      photocard_usage: {
        Row: {
          created_at: string
          credits_used: number
          generation_type: string | null
          id: string
          serial_key: string
          user_wallet: string
        }
        Insert: {
          created_at?: string
          credits_used?: number
          generation_type?: string | null
          id?: string
          serial_key: string
          user_wallet: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          generation_type?: string | null
          id?: string
          serial_key?: string
          user_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "photocard_usage_serial_key_fkey"
            columns: ["serial_key"]
            isOneToOne: false
            referencedRelation: "photocard_keys"
            referencedColumns: ["serial_key"]
          },
        ]
      }
      pool_participants: {
        Row: {
          boxes_purchased: number | null
          created_at: string | null
          hearts_given: number | null
          hearts_purchased: number | null
          id: string
          missions_completed: number | null
          participation_score: number | null
          pool_id: string
          rank: number | null
          reward_claim_tx: string | null
          reward_claimed: boolean | null
          reward_earned: number | null
          total_purchases: number | null
          updated_at: string | null
          user_id: string
          vri_contributed: number | null
        }
        Insert: {
          boxes_purchased?: number | null
          created_at?: string | null
          hearts_given?: number | null
          hearts_purchased?: number | null
          id?: string
          missions_completed?: number | null
          participation_score?: number | null
          pool_id: string
          rank?: number | null
          reward_claim_tx?: string | null
          reward_claimed?: boolean | null
          reward_earned?: number | null
          total_purchases?: number | null
          updated_at?: string | null
          user_id: string
          vri_contributed?: number | null
        }
        Update: {
          boxes_purchased?: number | null
          created_at?: string | null
          hearts_given?: number | null
          hearts_purchased?: number | null
          id?: string
          missions_completed?: number | null
          participation_score?: number | null
          pool_id?: string
          rank?: number | null
          reward_claim_tx?: string | null
          reward_claimed?: boolean | null
          reward_earned?: number | null
          total_purchases?: number | null
          updated_at?: string | null
          user_id?: string
          vri_contributed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_participants_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "reward_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_history: {
        Row: {
          amount_sui: number
          created_at: string | null
          id: string
          item_name: string
          metadata: Json | null
          purchase_type: string
          quantity: number | null
          transaction_hash: string | null
          user_id: string
          user_wallet: string
        }
        Insert: {
          amount_sui: number
          created_at?: string | null
          id?: string
          item_name: string
          metadata?: Json | null
          purchase_type: string
          quantity?: number | null
          transaction_hash?: string | null
          user_id: string
          user_wallet: string
        }
        Update: {
          amount_sui?: number
          created_at?: string | null
          id?: string
          item_name?: string
          metadata?: Json | null
          purchase_type?: string
          quantity?: number | null
          transaction_hash?: string | null
          user_id?: string
          user_wallet?: string
        }
        Relationships: []
      }
      reward_distributions: {
        Row: {
          distributed_at: string | null
          distribution_tx: string | null
          id: string
          pool_id: string
          reward_amount: number | null
          reward_metadata: Json | null
          reward_type: string
          user_id: string
        }
        Insert: {
          distributed_at?: string | null
          distribution_tx?: string | null
          id?: string
          pool_id: string
          reward_amount?: number | null
          reward_metadata?: Json | null
          reward_type: string
          user_id: string
        }
        Update: {
          distributed_at?: string | null
          distribution_tx?: string | null
          id?: string
          pool_id?: string
          reward_amount?: number | null
          reward_metadata?: Json | null
          reward_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_distributions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "reward_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_pools: {
        Row: {
          created_at: string | null
          current_value: number | null
          end_date: string
          id: string
          min_participation_score: number | null
          min_purchase_amount: number | null
          pool_name: string
          pool_type: string
          reward_metadata: Json | null
          reward_type: string
          start_date: string
          status: string
          target_metric: string | null
          target_value: number | null
          total_reward_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          end_date: string
          id?: string
          min_participation_score?: number | null
          min_purchase_amount?: number | null
          pool_name: string
          pool_type: string
          reward_metadata?: Json | null
          reward_type: string
          start_date: string
          status?: string
          target_metric?: string | null
          target_value?: number | null
          total_reward_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          end_date?: string
          id?: string
          min_participation_score?: number | null
          min_purchase_amount?: number | null
          pool_name?: string
          pool_type?: string
          reward_metadata?: Json | null
          reward_type?: string
          start_date?: string
          status?: string
          target_metric?: string | null
          target_value?: number | null
          total_reward_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      story_sessions: {
        Row: {
          choices_made: Json | null
          completed_at: string | null
          created_at: string | null
          current_turn: number | null
          expires_at: string | null
          id: string
          is_completed: boolean | null
          scene_id: number
          session_type: string
          vault_id: string | null
        }
        Insert: {
          choices_made?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_turn?: number | null
          expires_at?: string | null
          id?: string
          is_completed?: boolean | null
          scene_id: number
          session_type: string
          vault_id?: string | null
        }
        Update: {
          choices_made?: Json | null
          completed_at?: string | null
          created_at?: string | null
          current_turn?: number | null
          expires_at?: string | null
          id?: string
          is_completed?: boolean | null
          scene_id?: number
          session_type?: string
          vault_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "story_sessions_vault_id_fkey"
            columns: ["vault_id"]
            isOneToOne: false
            referencedRelation: "vaults"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gemini_keys: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          updated_at: string | null
          user_wallet: string
        }
        Insert: {
          api_key: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_wallet: string
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_wallet?: string
        }
        Relationships: []
      }
      user_photocard_keys: {
        Row: {
          activated_at: string
          created_at: string
          id: string
          serial_key: string
          user_wallet: string
        }
        Insert: {
          activated_at?: string
          created_at?: string
          id?: string
          serial_key: string
          user_wallet: string
        }
        Update: {
          activated_at?: string
          created_at?: string
          id?: string
          serial_key?: string
          user_wallet?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_photocard_keys_serial_key_fkey"
            columns: ["serial_key"]
            isOneToOne: false
            referencedRelation: "photocard_keys"
            referencedColumns: ["serial_key"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_vri: {
        Row: {
          created_at: string
          empathy_vri: number
          global_rank: number | null
          id: string
          last_updated: string
          love_vri: number
          total_vri: number
          trust_vri: number
          user_id: string
        }
        Insert: {
          created_at?: string
          empathy_vri?: number
          global_rank?: number | null
          id?: string
          last_updated?: string
          love_vri?: number
          total_vri?: number
          trust_vri?: number
          user_id: string
        }
        Update: {
          created_at?: string
          empathy_vri?: number
          global_rank?: number | null
          id?: string
          last_updated?: string
          love_vri?: number
          total_vri?: number
          trust_vri?: number
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      vaults: {
        Row: {
          created_at: string | null
          debut_done: boolean | null
          id: string
          idol_id: number | null
          level: number | null
          rise_points: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          debut_done?: boolean | null
          id?: string
          idol_id?: number | null
          level?: number | null
          rise_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          debut_done?: boolean | null
          id?: string
          idol_id?: number | null
          level?: number | null
          rise_points?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaults_idol_id_fkey"
            columns: ["idol_id"]
            isOneToOne: false
            referencedRelation: "idolsx"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaults_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vri_leaderboard: {
        Row: {
          cleared_branches: number | null
          empathy_vri: number | null
          global_rank: number | null
          last_updated: string | null
          love_vri: number | null
          total_vri: number | null
          trust_vri: number | null
          user_id: string | null
          wallet_address: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_idol_access_rate: { Args: never; Returns: boolean }
      claim_daily_free_box: {
        Args: { user_wallet_param: string }
        Returns: Json
      }
      get_basic_idol_data: {
        Args: never
        Returns: {
          created_at: string
          id: number
          name: string
          profile_image: string
        }[]
      }
      get_current_auth_uid: { Args: never; Returns: string }
      get_current_user_wallet: { Args: never; Returns: string }
      get_daily_free_box_status: {
        Args: { user_wallet_param: string }
        Returns: Json
      }
      get_public_idol_data: {
        Args: never
        Returns: {
          category: string
          concept: string
          created_at: string
          gender: string
          id: number
          name: string
          profile_image: string
        }[]
      }
      get_public_idols: {
        Args: never
        Returns: {
          category: string
          concept: string
          created_at: string
          gender: string
          id: number
          name: string
          profile_image: string
        }[]
      }
      get_safe_idol_data: { Args: { idol_id: number }; Returns: Json }
      has_active_api_key: {
        Args: { user_wallet_param: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      hash_api_key: { Args: { key_to_hash: string }; Returns: string }
      is_admin_user: { Args: never; Returns: boolean }
      migrate_api_key_to_hash: {
        Args: { user_wallet_param: string }
        Returns: boolean
      }
      user_has_activated_key: {
        Args: { key_to_check: string }
        Returns: boolean
      }
      verify_api_key: {
        Args: { provided_key: string; user_wallet_param: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
