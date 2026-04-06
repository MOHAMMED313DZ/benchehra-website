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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          activity_id: number
          category_ar: string
          category_en: string
          coach_id: number | null
          description_ar: string
          description_en: string
          is_active: boolean | null
          schedule_info_ar: string | null
          schedule_info_en: string | null
          target_audience_ar: string | null
          target_audience_en: string | null
          title_ar: string
          title_en: string
        }
        Insert: {
          activity_id?: number
          category_ar: string
          category_en: string
          coach_id?: number | null
          description_ar: string
          description_en: string
          is_active?: boolean | null
          schedule_info_ar?: string | null
          schedule_info_en?: string | null
          target_audience_ar?: string | null
          target_audience_en?: string | null
          title_ar: string
          title_en: string
        }
        Update: {
          activity_id?: number
          category_ar?: string
          category_en?: string
          coach_id?: number | null
          description_ar?: string
          description_en?: string
          is_active?: boolean | null
          schedule_info_ar?: string | null
          schedule_info_en?: string | null
          target_audience_ar?: string | null
          target_audience_en?: string | null
          title_ar?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      admin_profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          announcement_id: number
          author_id: number | null
          content_ar: string
          content_en: string
          publish_date: string | null
          title_ar: string
          title_en: string
        }
        Insert: {
          announcement_id?: number
          author_id?: number | null
          content_ar: string
          content_en: string
          publish_date?: string | null
          title_ar: string
          title_en: string
        }
        Update: {
          announcement_id?: number
          author_id?: number | null
          content_ar?: string
          content_en?: string
          publish_date?: string | null
          title_ar?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      news: {
        Row: {
          author_id: number | null
          content_ar: string
          content_en: string
          featured_image_url: string | null
          news_id: number
          publish_date: string | null
          title_ar: string
          title_en: string
        }
        Insert: {
          author_id?: number | null
          content_ar: string
          content_en: string
          featured_image_url?: string | null
          news_id?: number
          publish_date?: string | null
          title_ar: string
          title_en: string
        }
        Update: {
          author_id?: number | null
          content_ar?: string
          content_en?: string
          featured_image_url?: string | null
          news_id?: number
          publish_date?: string | null
          title_ar?: string
          title_en?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      photo_albums: {
        Row: {
          album_id: number
          description_ar: string | null
          description_en: string | null
          title_ar: string
          title_en: string
        }
        Insert: {
          album_id?: number
          description_ar?: string | null
          description_en?: string | null
          title_ar: string
          title_en: string
        }
        Update: {
          album_id?: number
          description_ar?: string | null
          description_en?: string | null
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      photos: {
        Row: {
          album_id: number | null
          caption_ar: string | null
          caption_en: string | null
          photo_id: number
          photo_url: string
        }
        Insert: {
          album_id?: number | null
          caption_ar?: string | null
          caption_en?: string | null
          photo_id?: number
          photo_url: string
        }
        Update: {
          album_id?: number | null
          caption_ar?: string | null
          caption_en?: string | null
          photo_id?: number
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "photo_albums"
            referencedColumns: ["album_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          id: string
          phone_number: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone_number?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone_number?: string | null
          user_id?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          activity_id: number | null
          date_of_birth: string
          email: string | null
          full_name: string
          phone_number: string
          registration_id: number
          status: string | null
          submission_date: string | null
        }
        Insert: {
          activity_id?: number | null
          date_of_birth: string
          email?: string | null
          full_name: string
          phone_number: string
          registration_id?: number
          status?: string | null
          submission_date?: string | null
        }
        Update: {
          activity_id?: number | null
          date_of_birth?: string
          email?: string | null
          full_name?: string
          phone_number?: string
          registration_id?: number
          status?: string | null
          submission_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["activity_id"]
          },
        ]
      }
      reports: {
        Row: {
          attachment_url: string | null
          description: string
          issue_type: string
          location: string
          report_id: number
          reporter_info: string | null
          status: string | null
          submission_date: string | null
        }
        Insert: {
          attachment_url?: string | null
          description: string
          issue_type: string
          location: string
          report_id?: number
          reporter_info?: string | null
          status?: string | null
          submission_date?: string | null
        }
        Update: {
          attachment_url?: string | null
          description?: string
          issue_type?: string
          location?: string
          report_id?: number
          reporter_info?: string | null
          status?: string | null
          submission_date?: string | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          bio_ar: string | null
          bio_en: string | null
          category: string
          full_name_ar: string
          full_name_en: string
          photo_url: string | null
          position_ar: string
          position_en: string
          staff_id: number
        }
        Insert: {
          bio_ar?: string | null
          bio_en?: string | null
          category: string
          full_name_ar: string
          full_name_en: string
          photo_url?: string | null
          position_ar: string
          position_en: string
          staff_id?: number
        }
        Update: {
          bio_ar?: string | null
          bio_en?: string | null
          category?: string
          full_name_ar?: string
          full_name_en?: string
          photo_url?: string | null
          position_ar?: string
          position_en?: string
          staff_id?: number
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          content: string
          rating: number | null
          status: string | null
          submission_date: string | null
          testimonial_id: number
        }
        Insert: {
          author_name: string
          content: string
          rating?: number | null
          status?: string | null
          submission_date?: string | null
          testimonial_id?: number
        }
        Update: {
          author_name?: string
          content?: string
          rating?: number | null
          status?: string | null
          submission_date?: string | null
          testimonial_id?: number
        }
        Relationships: []
      }
      user_activities: {
        Row: {
          activity_id: number
          enrolled_at: string
          id: string
          user_id: string
        }
        Insert: {
          activity_id: number
          enrolled_at?: string
          id?: string
          user_id: string
        }
        Update: {
          activity_id?: number
          enrolled_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["activity_id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          password_hash: string
          role: string | null
          user_id: number
          username: string
        }
        Insert: {
          created_at?: string | null
          password_hash: string
          role?: string | null
          user_id?: number
          username: string
        }
        Update: {
          created_at?: string | null
          password_hash?: string
          role?: string | null
          user_id?: number
          username?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          description_ar: string | null
          description_en: string | null
          title_ar: string
          title_en: string
          upload_date: string | null
          video_id: number
          video_url: string
        }
        Insert: {
          description_ar?: string | null
          description_en?: string | null
          title_ar: string
          title_en: string
          upload_date?: string | null
          video_id?: number
          video_url: string
        }
        Update: {
          description_ar?: string | null
          description_en?: string | null
          title_ar?: string
          title_en?: string
          upload_date?: string | null
          video_id?: number
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
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
