// Generado con `supabase gen types` (EPIC 0 · U6). No editar a mano:
// regenerar tras cambios de esquema.

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
      bookings: {
        Row: {
          created_at: string
          duracion: number | null
          estado: string
          fecha_label: string | null
          hora: string | null
          id: string
          inicio_iso: string | null
          noches: number | null
          nota: string | null
          perro: string | null
          recogida: string | null
          tipo: string
          user_id: string
          walker_id: string
        }
        Insert: {
          created_at?: string
          duracion?: number | null
          estado?: string
          fecha_label?: string | null
          hora?: string | null
          id?: string
          inicio_iso?: string | null
          noches?: number | null
          nota?: string | null
          perro?: string | null
          recogida?: string | null
          tipo: string
          user_id: string
          walker_id: string
        }
        Update: {
          created_at?: string
          duracion?: number | null
          estado?: string
          fecha_label?: string | null
          hora?: string | null
          id?: string
          inicio_iso?: string | null
          noches?: number | null
          nota?: string | null
          perro?: string | null
          recogida?: string | null
          tipo?: string
          user_id?: string
          walker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_walker_id_fkey"
            columns: ["walker_id"]
            isOneToOne: false
            referencedRelation: "walkers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          de: string
          foto: string | null
          id: string
          texto: string
          thread_id: string
        }
        Insert: {
          created_at?: string
          de: string
          foto?: string | null
          id?: string
          texto: string
          thread_id: string
        }
        Update: {
          created_at?: string
          de?: string
          foto?: string | null
          id?: string
          texto?: string
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
          created_at: string
          id: string
          user_id: string
          walker_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
          walker_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
          walker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_threads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_threads_walker_id_fkey"
            columns: ["walker_id"]
            isOneToOne: false
            referencedRelation: "walkers"
            referencedColumns: ["id"]
          },
        ]
      }
      dogs: {
        Row: {
          created_at: string
          id: string
          nombre: string
          notas: string | null
          owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nombre: string
          notas?: string | null
          owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string
          notas?: string | null
          owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dogs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          color: string | null
          id: string
          nombre: string
          tagline: string | null
          text_color: string | null
        }
        Insert: {
          color?: string | null
          id: string
          nombre: string
          tagline?: string | null
          text_color?: string | null
        }
        Update: {
          color?: string | null
          id?: string
          nombre?: string
          tagline?: string | null
          text_color?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          costo_treats: number
          descripcion: string | null
          emoji: string | null
          id: string
          nombre: string
          partner_id: string
        }
        Insert: {
          costo_treats: number
          descripcion?: string | null
          emoji?: string | null
          id: string
          nombre: string
          partner_id: string
        }
        Update: {
          costo_treats?: number
          descripcion?: string | null
          emoji?: string | null
          id?: string
          nombre?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          nombre: string | null
        }
        Insert: {
          created_at?: string
          id: string
          nombre?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nombre?: string | null
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          costo_treats: number
          created_at: string
          direccion: string | null
          estado: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          costo_treats: number
          created_at?: string
          direccion?: string | null
          estado?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          costo_treats?: number
          created_at?: string
          direccion?: string | null
          estado?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          autor: string
          id: string
          texto: string
          walker_id: string
        }
        Insert: {
          autor: string
          id?: string
          texto: string
          walker_id: string
        }
        Update: {
          autor?: string
          id?: string
          texto?: string
          walker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_walker_id_fkey"
            columns: ["walker_id"]
            isOneToOne: false
            referencedRelation: "walkers"
            referencedColumns: ["id"]
          },
        ]
      }
      treat_balances: {
        Row: {
          saldo: number
          updated_at: string
          user_id: string
        }
        Insert: {
          saldo?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          saldo?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treat_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treat_transactions: {
        Row: {
          counterparty: string | null
          created_at: string
          delta: number
          emoji: string | null
          id: string
          idempotency_key: string | null
          kind: string
          label: string | null
          note: string | null
          photo_url: string | null
          ref: string | null
          user_id: string
          walker_id: string | null
        }
        Insert: {
          counterparty?: string | null
          created_at?: string
          delta: number
          emoji?: string | null
          id?: string
          idempotency_key?: string | null
          kind: string
          label?: string | null
          note?: string | null
          photo_url?: string | null
          ref?: string | null
          user_id: string
          walker_id?: string | null
        }
        Update: {
          counterparty?: string | null
          created_at?: string
          delta?: number
          emoji?: string | null
          id?: string
          idempotency_key?: string | null
          kind?: string
          label?: string | null
          note?: string | null
          photo_url?: string | null
          ref?: string | null
          user_id?: string
          walker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treat_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      treats: {
        Row: {
          descripcion: string | null
          emoji: string | null
          id: string
          nombre: string
          precio: number
        }
        Insert: {
          descripcion?: string | null
          emoji?: string | null
          id: string
          nombre: string
          precio: number
        }
        Update: {
          descripcion?: string | null
          emoji?: string | null
          id?: string
          nombre?: string
          precio?: number
        }
        Relationships: []
      }
      walkers: {
        Row: {
          anios_experiencia: number
          barrio: string | null
          bio: string | null
          dias_no_disponibles: number[]
          disponible_ahora: boolean
          distancia_km: number
          especialidades: string[]
          foto: string | null
          galeria: string[]
          id: string
          nombre: string
          nota_recogida: string | null
          num_resenas: number
          ofrece_estancia: boolean
          paseos_completados: number
          precio_estancia_noche: number | null
          rating: number
          tags: string[]
          texto_perros: string | null
          tiempo_respuesta: string | null
          tiene_perros: boolean | null
          verificado: boolean
        }
        Insert: {
          anios_experiencia?: number
          barrio?: string | null
          bio?: string | null
          dias_no_disponibles?: number[]
          disponible_ahora?: boolean
          distancia_km?: number
          especialidades?: string[]
          foto?: string | null
          galeria?: string[]
          id: string
          nombre: string
          nota_recogida?: string | null
          num_resenas?: number
          ofrece_estancia?: boolean
          paseos_completados?: number
          precio_estancia_noche?: number | null
          rating?: number
          tags?: string[]
          texto_perros?: string | null
          tiempo_respuesta?: string | null
          tiene_perros?: boolean | null
          verificado?: boolean
        }
        Update: {
          anios_experiencia?: number
          barrio?: string | null
          bio?: string | null
          dias_no_disponibles?: number[]
          disponible_ahora?: boolean
          distancia_km?: number
          especialidades?: string[]
          foto?: string | null
          galeria?: string[]
          id?: string
          nombre?: string
          nota_recogida?: string | null
          num_resenas?: number
          ofrece_estancia?: boolean
          paseos_completados?: number
          precio_estancia_noche?: number | null
          rating?: number
          tags?: string[]
          texto_perros?: string | null
          tiempo_respuesta?: string | null
          tiene_perros?: boolean | null
          verificado?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_treat_tx: {
        Args: {
          p_counterparty?: string
          p_delta: number
          p_emoji?: string
          p_idempotency_key: string
          p_kind: string
          p_label?: string
          p_note?: string
          p_photo_url?: string
          p_ref?: string
          p_user: string
          p_walker_id?: string
        }
        Returns: number
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
