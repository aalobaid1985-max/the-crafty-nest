// Auto-generated placeholder — run `npx supabase gen types typescript --local > types/supabase.ts` after linking project.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      customers: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      addresses: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      categories: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      products: {
        Row: {
          id: string
          slug: string
          name_ar: string
          name_en: string
          description_ar: string | null
          description_en: string | null
          age_min: number
          age_max: number
          interaction_type: string
          skill_tags: string[]
          is_active: boolean
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string
          price_kwd: number
          is_default: boolean
          is_active: boolean
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      product_images: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      inventory: {
        Row: {
          id: string
          variant_id: string
          quantity_on_hand: number
          quantity_reserved: number
          low_stock_threshold: number
          last_updated_at: string
        }
        Insert: Record<string, unknown>
        Update: {
          quantity_on_hand?: number
          quantity_reserved?: number
          low_stock_threshold?: number
        }
      }
      inventory_movements: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      discount_codes: {
        Row: {
          id: string
          code: string
          type: 'percentage' | 'fixed_kwd' | 'free_shipping'
          value: number
          min_order_kwd: number | null
          max_uses: number | null
          times_used: number
          valid_from: string | null
          valid_until: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Record<string, unknown>
        Update: {
          is_active?: boolean
          times_used?: number
        }
      }
      gift_cards: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      carts: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      cart_items: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_method: 'knet' | 'visa' | 'mastercard' | 'cod'
          payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded'
          delivery_slot: string | null
          subtotal_kwd: number
          discount_kwd: number
          delivery_fee_kwd: number
          cod_fee_kwd: number
          gift_card_applied_kwd: number
          total_kwd: number
          currency: string
          notes: string | null
          address_snapshot: Json
          created_at: string
          updated_at: string
        }
        Insert: Record<string, unknown>
        Update: {
          status?: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          payment_status?: 'unpaid' | 'paid' | 'failed' | 'refunded'
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          variant_id: string | null
          product_snapshot: Json
          quantity: number
          unit_price_kwd: number
          total_kwd: number
        }
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
      }
      payment_transactions: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      shipments: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      product_reviews: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      wishlists: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
      store_settings: { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }
    }
    Views: {
      inventory_available: { Row: Record<string, unknown> }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      kuwait_governorate: 'capital' | 'hawalli' | 'farwaniya' | 'ahmadi' | 'jahra' | 'mubarak_al_kabeer'
      interaction_type: 'solo' | 'parent_child' | 'peer_group'
      skill_tag: 'fine_motor' | 'gross_motor' | 'creativity' | 'counting_math' | 'letters_language' | 'colors_shapes' | 'problem_solving' | 'social_emotional' | 'science_stem' | 'storytelling'
      order_status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded'
      payment_method: 'knet' | 'visa' | 'mastercard' | 'cod'
      payment_gateway: 'myfatoorah' | 'cod'
      transaction_status: 'initiated' | 'paid' | 'failed' | 'refunded'
      shipment_carrier: 'aramex' | 'self_delivery' | 'customer_pickup'
      shipment_status: 'label_created' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed'
      inventory_movement_type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'damage'
      discount_type: 'percentage' | 'fixed_kwd' | 'free_shipping'
      user_role: 'customer' | 'admin' | 'inventory_staff' | 'delivery_staff'
      delivery_slot: '09:00-12:00' | '12:00-15:00' | '15:00-18:00' | '18:00-21:00'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
