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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          created_at: string
          diver_id: string
          id: string
          notes: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["booking_status"]
          trip_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          diver_id: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          trip_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          diver_id?: string
          id?: string
          notes?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          trip_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_diver_id_fkey"
            columns: ["diver_id"]
            isOneToOne: false
            referencedRelation: "diver_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      dive_centers: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          facebook: string | null
          id: string
          instagram: string | null
          location: string | null
          logo_url: string | null
          name: string
          operating_hours: string | null
          tiktok: string | null
          updated_at: string
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          operating_hours?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          facebook?: string | null
          id?: string
          instagram?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          operating_hours?: string | null
          tiktok?: string | null
          updated_at?: string
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      diver_profiles: {
        Row: {
          avatar_url: string | null
          certification:
            | Database["public"]["Enums"]["certification_level"]
            | null
          created_at: string
          emergency_contact: string | null
          full_name: string
          id: string
          logged_dives: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          certification?:
            | Database["public"]["Enums"]["certification_level"]
            | null
          created_at?: string
          emergency_contact?: string | null
          full_name: string
          id?: string
          logged_dives?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          certification?:
            | Database["public"]["Enums"]["certification_level"]
            | null
          created_at?: string
          emergency_contact?: string | null
          full_name?: string
          id?: string
          logged_dives?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_id: string | null
          sender_name: string
          trip_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_id?: string | null
          sender_name: string
          trip_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_id?: string | null
          sender_name?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          is_read: boolean
          title: string
          trip_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          title: string
          trip_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          title?: string
          trip_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_invites: {
        Row: {
          accepted: boolean
          created_at: string
          dive_center_id: string
          expires_at: string
          id: string
          invite_token: string
          invited_email: string
          role: Database["public"]["Enums"]["staff_role"]
        }
        Insert: {
          accepted?: boolean
          created_at?: string
          dive_center_id: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_email: string
          role?: Database["public"]["Enums"]["staff_role"]
        }
        Update: {
          accepted?: boolean
          created_at?: string
          dive_center_id?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_email?: string
          role?: Database["public"]["Enums"]["staff_role"]
        }
        Relationships: [
          {
            foreignKeyName: "staff_invites_dive_center_id_fkey"
            columns: ["dive_center_id"]
            isOneToOne: false
            referencedRelation: "dive_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          created_at: string
          dive_center_id: string
          id: string
          role: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          dive_center_id: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          dive_center_id?: string
          id?: string
          role?: Database["public"]["Enums"]["staff_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_dive_center_id_fkey"
            columns: ["dive_center_id"]
            isOneToOne: false
            referencedRelation: "dive_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          available_spots: number
          created_at: string
          departure_point: string
          description: string | null
          difficulty: Database["public"]["Enums"]["trip_difficulty"] | null
          dive_center_id: string
          dive_site: string
          gear_rental_available: boolean | null
          id: string
          min_certification:
            | Database["public"]["Enums"]["certification_level"]
            | null
          price_usd: number
          status: Database["public"]["Enums"]["trip_status"]
          title: string
          total_spots: number
          trip_date: string
          trip_time: string
          updated_at: string
          whatsapp_group_url: string | null
        }
        Insert: {
          available_spots: number
          created_at?: string
          departure_point: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["trip_difficulty"] | null
          dive_center_id: string
          dive_site: string
          gear_rental_available?: boolean | null
          id?: string
          min_certification?:
            | Database["public"]["Enums"]["certification_level"]
            | null
          price_usd: number
          status?: Database["public"]["Enums"]["trip_status"]
          title: string
          total_spots: number
          trip_date: string
          trip_time: string
          updated_at?: string
          whatsapp_group_url?: string | null
        }
        Update: {
          available_spots?: number
          created_at?: string
          departure_point?: string
          description?: string | null
          difficulty?: Database["public"]["Enums"]["trip_difficulty"] | null
          dive_center_id?: string
          dive_site?: string
          gear_rental_available?: boolean | null
          id?: string
          min_certification?:
            | Database["public"]["Enums"]["certification_level"]
            | null
          price_usd?: number
          status?: Database["public"]["Enums"]["trip_status"]
          title?: string
          total_spots?: number
          trip_date?: string
          trip_time?: string
          updated_at?: string
          whatsapp_group_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trips_dive_center_id_fkey"
            columns: ["dive_center_id"]
            isOneToOne: false
            referencedRelation: "dive_centers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_cancellation: { Args: { _booking_id: string }; Returns: boolean }
      assign_dive_center_admin_role: {
        Args: { _user_id: string }
        Returns: undefined
      }
      auto_complete_past_trips: { Args: never; Returns: undefined }
      confirm_booking: { Args: { _booking_id: string }; Returns: boolean }
      create_notification: {
        Args: {
          _body: string
          _title: string
          _trip_id?: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      get_user_dive_center_id: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_confirmed_diver: {
        Args: { _trip_id: string; _user_id: string }
        Returns: boolean
      }
      is_dive_center_admin: {
        Args: { _center_id: string; _user_id: string }
        Returns: boolean
      }
      is_dive_center_staff: {
        Args: { _center_id: string; _user_id: string }
        Returns: boolean
      }
      staff_can_view_diver: {
        Args: { _diver_profile_id: string; _staff_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "diver" | "dive_center_admin" | "dive_center_staff"
      booking_status:
        | "pending"
        | "confirmed"
        | "rejected"
        | "cancelled"
        | "cancellation_requested"
      certification_level:
        | "open_water"
        | "advanced_open_water"
        | "rescue_diver"
        | "divemaster"
        | "instructor"
        | "none"
      staff_role: "admin" | "staff"
      trip_difficulty: "beginner" | "intermediate" | "advanced"
      trip_status: "draft" | "published" | "completed" | "cancelled"
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
      app_role: ["diver", "dive_center_admin", "dive_center_staff"],
      booking_status: [
        "pending",
        "confirmed",
        "rejected",
        "cancelled",
        "cancellation_requested",
      ],
      certification_level: [
        "open_water",
        "advanced_open_water",
        "rescue_diver",
        "divemaster",
        "instructor",
        "none",
      ],
      staff_role: ["admin", "staff"],
      trip_difficulty: ["beginner", "intermediate", "advanced"],
      trip_status: ["draft", "published", "completed", "cancelled"],
    },
  },
} as const
