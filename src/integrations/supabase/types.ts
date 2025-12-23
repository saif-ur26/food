export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      daily_meals: {
        Row: {
          created_at: string
          day_of_week: string
          id: string
          items: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: string
          id?: string
          items?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: string
          id?: string
          items?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          applicable_plans: string[]
          created_at: string
          description: string | null
          discount_amount: number
          discount_percentage: number
          end_date: string | null
          id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          applicable_plans?: string[]
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_percentage?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          name: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          applicable_plans?: string[]
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_percentage?: number
          end_date?: string | null
          id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          address: string
          created_at: string
          customer_name: string
          id: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          phone: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address: string
          created_at?: string
          customer_name: string
          id?: string
          payment_type: Database["public"]["Enums"]["payment_type"]
          phone: string
          plan_type: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string
          created_at?: string
          customer_name?: string
          id?: string
          payment_type?: Database["public"]["Enums"]["payment_type"]
          phone?: string
          plan_type?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pricing_plans: {
        Row: {
          created_at: string
          current_price: number
          days: number
          id: string
          is_active: boolean
          name: string
          original_price: number
          plan_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_price: number
          days: number
          id?: string
          is_active?: boolean
          name: string
          original_price: number
          plan_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_price?: number
          days?: number
          id?: string
          is_active?: boolean
          name?: string
          original_price?: number
          plan_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      user_roles_empty: {
        Args: Record<string, unknown>
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status: "pending" | "delivered" | "cancelled"
      payment_type: "prepaid" | "postpaid"
      plan_type: "daily" | "weekly" | "monthly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}