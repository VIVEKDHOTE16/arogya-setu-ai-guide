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
      chat_conversations: {
        Row: {
          bot_response: string
          created_at: string
          disease_found: boolean | null
          disease_id: string | null
          id: string
          misinformation_detected: boolean | null
          misinformation_report_id: string | null
          session_id: string
          user_query: string
        }
        Insert: {
          bot_response: string
          created_at?: string
          disease_found?: boolean | null
          disease_id?: string | null
          id?: string
          misinformation_detected?: boolean | null
          misinformation_report_id?: string | null
          session_id: string
          user_query: string
        }
        Update: {
          bot_response?: string
          created_at?: string
          disease_found?: boolean | null
          disease_id?: string | null
          id?: string
          misinformation_detected?: boolean | null
          misinformation_report_id?: string | null
          session_id?: string
          user_query?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "diseases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_misinformation_report_id_fkey"
            columns: ["misinformation_report_id"]
            isOneToOne: false
            referencedRelation: "misinformation_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      diseases: {
        Row: {
          category: string
          causes: string[] | null
          cdc_verified: boolean | null
          created_at: string
          description: string
          disease_name: string
          featured: boolean | null
          id: string
          mohfw_verified: boolean | null
          name_hindi: string | null
          precautions: string[]
          prevalence: string | null
          related_diseases: string[] | null
          remedies: string[] | null
          seasonal: boolean | null
          severity: string
          symptoms: string[]
          treatments: string[]
          updated_at: string
          who_verified: boolean | null
        }
        Insert: {
          category: string
          causes?: string[] | null
          cdc_verified?: boolean | null
          created_at?: string
          description: string
          disease_name: string
          featured?: boolean | null
          id?: string
          mohfw_verified?: boolean | null
          name_hindi?: string | null
          precautions: string[]
          prevalence?: string | null
          related_diseases?: string[] | null
          remedies?: string[] | null
          seasonal?: boolean | null
          severity: string
          symptoms: string[]
          treatments: string[]
          updated_at?: string
          who_verified?: boolean | null
        }
        Update: {
          category?: string
          causes?: string[] | null
          cdc_verified?: boolean | null
          created_at?: string
          description?: string
          disease_name?: string
          featured?: boolean | null
          id?: string
          mohfw_verified?: boolean | null
          name_hindi?: string | null
          precautions?: string[]
          prevalence?: string | null
          related_diseases?: string[] | null
          remedies?: string[] | null
          seasonal?: boolean | null
          severity?: string
          symptoms?: string[]
          treatments?: string[]
          updated_at?: string
          who_verified?: boolean | null
        }
        Relationships: []
      }
      misinformation_reports: {
        Row: {
          correct_information: string
          created_at: string
          disease_id: string | null
          frequency_count: number | null
          id: string
          misinformation_type: string
          region: string | null
          updated_at: string
          user_consented_location: boolean | null
          user_location: string | null
          user_query: string
        }
        Insert: {
          correct_information: string
          created_at?: string
          disease_id?: string | null
          frequency_count?: number | null
          id?: string
          misinformation_type: string
          region?: string | null
          updated_at?: string
          user_consented_location?: boolean | null
          user_location?: string | null
          user_query: string
        }
        Update: {
          correct_information?: string
          created_at?: string
          disease_id?: string | null
          frequency_count?: number | null
          id?: string
          misinformation_type?: string
          region?: string | null
          updated_at?: string
          user_consented_location?: boolean | null
          user_location?: string | null
          user_query?: string
        }
        Relationships: [
          {
            foreignKeyName: "misinformation_reports_disease_id_fkey"
            columns: ["disease_id"]
            isOneToOne: false
            referencedRelation: "diseases"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
