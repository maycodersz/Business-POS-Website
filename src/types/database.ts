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
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          expense_date: string
          id: string
          owner_id: string
          related_purchase_batch_id: string | null
          related_sale_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          expense_date?: string
          id?: string
          owner_id: string
          related_purchase_batch_id?: string | null
          related_sale_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          expense_date?: string
          id?: string
          owner_id?: string
          related_purchase_batch_id?: string | null
          related_sale_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_related_purchase_batch_id_fkey"
            columns: ["related_purchase_batch_id"]
            isOneToOne: false
            referencedRelation: "purchase_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_related_sale_id_fkey"
            columns: ["related_sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string
          id: string
          movement_type: string
          notes: string | null
          owner_id: string
          product_id: string
          purchase_batch_id: string | null
          quantity_change: number
          reference_id: string | null
          reference_type: string | null
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          movement_type: string
          notes?: string | null
          owner_id: string
          product_id: string
          purchase_batch_id?: string | null
          quantity_change: number
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          movement_type?: string
          notes?: string | null
          owner_id?: string
          product_id?: string
          purchase_batch_id?: string | null
          quantity_change?: number
          reference_id?: string | null
          reference_type?: string | null
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_purchase_batch_id_fkey"
            columns: ["purchase_batch_id"]
            isOneToOne: false
            referencedRelation: "purchase_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          created_at: string
          id: string
          owner_id: string
          product_id: string
          updated_at: string
          variant_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          owner_id: string
          product_id: string
          updated_at?: string
          variant_name: string
        }
        Update: {
          created_at?: string
          id?: string
          owner_id?: string
          product_id?: string
          updated_at?: string
          variant_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_batches: {
        Row: {
          created_at: string
          id: string
          landed_unit_cost: number | null
          notes: string | null
          other_fee: number
          owner_id: string
          product_id: string
          purchase_date: string
          quantity: number
          quantity_available: number
          shipping_fee: number
          supplier_id: string | null
          total_item_cost: number | null
          total_purchase_cost: number | null
          unit_price: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          landed_unit_cost?: number | null
          notes?: string | null
          other_fee?: number
          owner_id: string
          product_id: string
          purchase_date?: string
          quantity: number
          quantity_available: number
          shipping_fee?: number
          supplier_id?: string | null
          total_item_cost?: number | null
          total_purchase_cost?: number | null
          unit_price: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          landed_unit_cost?: number | null
          notes?: string | null
          other_fee?: number
          owner_id?: string
          product_id?: string
          purchase_date?: string
          quantity?: number
          quantity_available?: number
          shipping_fee?: number
          supplier_id?: string | null
          total_item_cost?: number | null
          total_purchase_cost?: number | null
          unit_price?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_batches_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_batches_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_items: {
        Row: {
          cogs: number | null
          created_at: string
          gross_profit: number | null
          id: string
          owner_id: string
          product_id: string
          purchase_batch_id: string
          quantity_sold: number
          revenue: number | null
          sale_id: string
          selling_price: number
          unit_cogs: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          cogs?: number | null
          created_at?: string
          gross_profit?: number | null
          id?: string
          owner_id: string
          product_id: string
          purchase_batch_id: string
          quantity_sold: number
          revenue?: number | null
          sale_id: string
          selling_price: number
          unit_cogs: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          cogs?: number | null
          created_at?: string
          gross_profit?: number | null
          id?: string
          owner_id?: string
          product_id?: string
          purchase_batch_id?: string
          quantity_sold?: number
          revenue?: number | null
          sale_id?: string
          selling_price?: number
          unit_cogs?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_purchase_batch_id_fkey"
            columns: ["purchase_batch_id"]
            isOneToOne: false
            referencedRelation: "purchase_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          created_at: string
          customer_name: string | null
          id: string
          notes: string | null
          owner_id: string
          platform: string | null
          sale_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          owner_id: string
          platform?: string | null
          sale_date?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_name?: string | null
          id?: string
          notes?: string | null
          owner_id?: string
          platform?: string | null
          sale_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          created_at: string
          facebook_link: string | null
          id: string
          messenger_link: string | null
          name: string
          notes: string | null
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          facebook_link?: string | null
          id?: string
          messenger_link?: string | null
          name: string
          notes?: string | null
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          facebook_link?: string | null
          id?: string
          messenger_link?: string | null
          name?: string
          notes?: string | null
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      adjust_inventory_batch: {
        Args: {
          p_notes?: string | null
          p_purchase_batch_id: string
          p_quantity_delta: number
        }
        Returns: string
      }
      create_sale_from_batch: {
        Args: {
          p_customer_name?: string | null
          p_expense_amount?: number | null
          p_expense_category?: string | null
          p_notes?: string | null
          p_platform?: string | null
          p_purchase_batch_id: string
          p_quantity_sold: number
          p_sale_date?: string
          p_selling_price: number
        }
        Returns: string
      }
      delete_sale_and_restore_inventory: {
        Args: {
          p_sale_id: string
        }
        Returns: string
      }
      update_sale_from_batch: {
        Args: {
          p_customer_name?: string | null
          p_notes?: string | null
          p_platform?: string | null
          p_quantity_sold: number
          p_sale_date?: string
          p_sale_id: string
          p_selling_price: number
        }
        Returns: string
      }
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

