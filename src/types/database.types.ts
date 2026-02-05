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
      erp_orders: {
        Row: {
          created_at: string | null
          id: string
          order_number: string
          sale_date: string
          store_id: string
          total_value: number
          upload_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_number: string
          sale_date: string
          store_id: string
          total_value: number
          upload_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_number?: string
          sale_date?: string
          store_id?: string
          total_value?: number
          upload_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "erp_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      ifood_orders: {
        Row: {
          api_status: string | null
          created_at: string | null
          id: string
          order_number: string
          original_json: Json | null
          sale_date: string
          store_id: string
          total_value: number
        }
        Insert: {
          api_status?: string | null
          created_at?: string | null
          id?: string
          order_number: string
          original_json?: Json | null
          sale_date: string
          store_id: string
          total_value: number
        }
        Update: {
          api_status?: string | null
          created_at?: string | null
          id?: string
          order_number?: string
          original_json?: Json | null
          sale_date?: string
          store_id?: string
          total_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "ifood_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          duration_seconds: number | null
          execution_date: string | null
          id: string
          message: string | null
          status: string | null
          store_id: string | null
        }
        Insert: {
          duration_seconds?: number | null
          execution_date?: string | null
          id?: string
          message?: string | null
          status?: string | null
          store_id?: string | null
        }
        Update: {
          duration_seconds?: number | null
          execution_date?: string | null
          id?: string
          message?: string | null
          status?: string | null
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          region_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          store_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          name: string
          region_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          store_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          region_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      reconciliations: {
        Row: {
          erp_order_id: string | null
          erp_value: number | null
          id: string
          ifood_order_id: string | null
          ifood_value: number | null
          reference_date: string
          status: Database["public"]["Enums"]["reconciliation_status"]
          store_id: string
          updated_at: string | null
          value_difference: number | null
        }
        Insert: {
          erp_order_id?: string | null
          erp_value?: number | null
          id?: string
          ifood_order_id?: string | null
          ifood_value?: number | null
          reference_date: string
          status: Database["public"]["Enums"]["reconciliation_status"]
          store_id: string
          updated_at?: string | null
          value_difference?: number | null
        }
        Update: {
          erp_order_id?: string | null
          erp_value?: number | null
          id?: string
          ifood_order_id?: string | null
          ifood_value?: number | null
          reference_date?: string
          status?: Database["public"]["Enums"]["reconciliation_status"]
          store_id?: string
          updated_at?: string | null
          value_difference?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reconciliations_erp_order_id_fkey"
            columns: ["erp_order_id"]
            isOneToOne: false
            referencedRelation: "erp_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_ifood_order_id_fkey"
            columns: ["ifood_order_id"]
            isOneToOne: false
            referencedRelation: "ifood_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reconciliations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          created_at: string | null
          erp_code: string
          id: string
          ifood_code: string | null
          name: string
          region_id: string | null
        }
        Insert: {
          created_at?: string | null
          erp_code: string
          id?: string
          ifood_code?: string | null
          name: string
          region_id?: string | null
        }
        Update: {
          created_at?: string | null
          erp_code?: string
          id?: string
          ifood_code?: string | null
          name?: string
          region_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      upload_history: {
        Row: {
          errors: Json | null
          filename: string
          id: string
          status: string | null
          total_records: number | null
          upload_date: string | null
          user_id: string | null
          valid_records: number | null
        }
        Insert: {
          errors?: Json | null
          filename: string
          id?: string
          status?: string | null
          total_records?: number | null
          upload_date?: string | null
          user_id?: string | null
          valid_records?: number | null
        }
        Update: {
          errors?: Json | null
          filename?: string
          id?: string
          status?: string | null
          total_records?: number | null
          upload_date?: string | null
          user_id?: string | null
          valid_records?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "upload_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      reconciliation_status:
        | "reconciled"
        | "divergent"
        | "pending_erp"
        | "pending_ifood"
      user_role: "store" | "regional" | "corporate"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof Database["public"]["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
      schema: keyof Database
    }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
  ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
