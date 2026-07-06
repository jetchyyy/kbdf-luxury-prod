export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain: string | null;
          logo_url: string | null;
          primary_color: string;
          accent_color: string;
          currency_symbol: string;
          timezone: string;
          store_settings: Json;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          domain?: string | null;
          logo_url?: string | null;
          primary_color?: string;
          accent_color?: string;
          currency_symbol?: string;
          timezone?: string;
          store_settings?: Json;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };

      roles: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          description: string | null;
          permissions: Json;
          is_system_role: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          description?: string | null;
          permissions?: Json;
          is_system_role?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['roles']['Insert']>;
      };

      admin_users: {
        Row: {
          id: string;
          auth_id: string;
          tenant_id: string | null;
          role_id: string | null;
          email: string;
          full_name: string;
          avatar_url: string | null;
          is_superadmin: boolean;
          is_active: boolean;
          access_overview: boolean;
          access_analytics: boolean;
          access_items: boolean;
          access_users: boolean;
          access_settings: boolean;
          access_leads: boolean;
          access_expenses: boolean;
          access_categories: boolean;
          access_roles: boolean;
          access_payment_methods: boolean;
          access_orders: boolean;
          access_promo_codes: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id: string;
          tenant_id?: string | null;
          role_id?: string | null;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          is_superadmin?: boolean;
          is_active?: boolean;
          access_overview?: boolean;
          access_analytics?: boolean;
          access_items?: boolean;
          access_users?: boolean;
          access_settings?: boolean;
          access_leads?: boolean;
          access_expenses?: boolean;
          access_categories?: boolean;
          access_roles?: boolean;
          access_payment_methods?: boolean;
          access_orders?: boolean;
          access_promo_codes?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['admin_users']['Insert']>;
      };

      categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };

      items: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          price: number;
          original_price: number | null;
          quantity: number;
          sku: string | null;
           brand: string | null;
          condition: 'new' | 'preloved_excellent' | 'preloved_good' | 'preloved_fair';
          stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
          image_urls: string[];
           sizes: { size: string; quantity: number }[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          price: number;
          original_price?: number | null;
          quantity?: number;
          sku?: string | null;
          brand?: string | null;
          condition?: 'new' | 'preloved_excellent' | 'preloved_good' | 'preloved_fair';
          stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
          image_urls?: string[];
          sizes?: { size: string; quantity: number }[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['items']['Insert']>;
      };

      leads: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string | null;
          status: 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message?: string | null;
          status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'archived';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['leads']['Insert']>;
      };

      expense_categories: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          color: string;
          is_predefined: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          color?: string;
          is_predefined?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['expense_categories']['Insert']>;
      };

      expenses: {
        Row: {
          id: string;
          tenant_id: string;
          category_id: string | null;
          title: string;
          amount: number;
          date: string;
          description: string | null;
          receipt_url: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          category_id?: string | null;
          title: string;
          amount: number;
          date?: string;
          description?: string | null;
          receipt_url?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };

      payment_methods: {
        Row: {
          id: string;
          tenant_id: string;
          name: string;
          type: 'qr' | 'bank_transfer' | 'cod' | 'custom';
          account_name: string | null;
          account_number: string | null;
          qr_code_url: string | null;
          instructions: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          name: string;
          type?: 'qr' | 'bank_transfer' | 'cod' | 'custom';
          account_name?: string | null;
          account_number?: string | null;
          qr_code_url?: string | null;
          instructions?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payment_methods']['Insert']>;
      };

      orders: {
        Row: {
          id: string;
          tenant_id: string;
          customer_id: string | null;
          tracking_number: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_email: string;
          customer_phone: string;
          customer_fb_link: string | null;
          shipping_province: string;
          shipping_city: string;
          shipping_barangay: string;
          shipping_street: string;
          shipping_landmark: string | null;
          delivery_method: string;
          payment_method_id: string | null;
          payment_method_type: string;
          proof_of_payment_url: string | null;
          subtotal: number;
          shipping_fee: number;
          total: number;
          status: 'pending_verification' | 'verified' | 'processing' | 'shipped' | 'completed' | 'cancelled';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tenant_id: string;
          customer_id?: string | null;
          tracking_number: string;
          customer_first_name: string;
          customer_last_name: string;
          customer_email: string;
          customer_phone: string;
          customer_fb_link?: string | null;
          shipping_province: string;
          shipping_city: string;
          shipping_barangay: string;
          shipping_street: string;
          shipping_landmark?: string | null;
          delivery_method: string;
          payment_method_id?: string | null;
          payment_method_type: string;
          proof_of_payment_url?: string | null;
          subtotal?: number;
          shipping_fee?: number;
          total?: number;
          status?: 'pending_verification' | 'verified' | 'processing' | 'shipped' | 'completed' | 'cancelled';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };

      order_items: {
        Row: {
          id: string;
          order_id: string;
          item_id: string | null;
          title: string;
          price: number;
          quantity: number;
          size: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          item_id?: string | null;
          title: string;
          price: number;
          quantity?: number;
          size?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
    };
  };
}

// Convenience row types
export type Tenant = Database['public']['Tables']['tenants']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Item = Database['public']['Tables']['items']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type ExpenseCategory = Database['public']['Tables']['expense_categories']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'] & {
  promo_code_id?: string | null;
  discount_amount?: number;
};
export type OrderItem = Database['public']['Tables']['order_items']['Row'];

export interface PromoCode {
  id: string;
  tenant_id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Permission module names
export type PermissionModule =
  | 'overview'
  | 'analytics'
  | 'items'
  | 'categories'
  | 'users'
  | 'roles'
  | 'leads'
  | 'expenses'
  | 'payment_methods'
  | 'settings'
  | 'orders'
  | 'promo_codes';

export type PermissionAction = 'create' | 'read' | 'edit' | 'delete';

export type RolePermissions = {
  [K in PermissionModule]?: Partial<Record<PermissionAction, boolean>>;
};
