// Otantikos Concept TypeScript Definitions

export type UserRole = 'customer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductSpecification {
  id?: string;
  product_id?: string;
  spec_key: string;
  spec_value: string;
  display_order: number;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  name: string; // e.g. "Renk", "Model", "Boyut"
  value: string; // e.g. "18K Altın Kaplama", "Mavi"
  price_override?: number | null;
  stock: number;
  sku?: string | null;
  image_url?: string | null;
  is_active: boolean;
}

export interface ProductImage {
  id?: string;
  product_id?: string;
  image_url: string;
  is_cover: boolean;
  display_order: number;
  alt_text?: string | null;
}

export interface Product {
  id: string;
  category_id?: string | null;
  category?: Category | null;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  price: number; // Perakende Satış Fiyatı
  cost_price?: number | null; // Alış / Tedarik Maliyet Fiyatı (Opsiyonel)
  wholesale_price?: number | null; // Toptan Satış Fiyatı (Opsiyonel)
  stock: number; // Toplam Depo Stoğu
  sku?: string | null; // Barkod / Ürün Kodu (Opsiyonel)
  is_published: boolean; // Web Sitesinde Satışta mı? (true: Sitede Yayında, false: Sadece Depo Stoğu)
  video_url?: string | null;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  specifications?: ProductSpecification[];
}

export type OrderStatus = 'siparis_alindi' | 'hazirlaniyor' | 'kargoya_verildi' | 'teslim_edildi' | 'iptal_edildi';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DeliveryType = 'kargo' | 'magaza_teslim' | 'pickup' | 'adrese_teslim';

export interface AddressData {
  full_name: string;
  phone: string;
  province: string;
  district: string;
  neighborhood?: string;
  full_address: string;
  postal_code?: string;
  courier_note?: string;
  // Invoice details
  invoice_type: 'individual' | 'corporate';
  identity_number?: string; // TCKN for individual
  company_title?: string;
  tax_office?: string;
  tax_number?: string;
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id?: string | null;
  variant_id?: string | null;
  product_name: string;
  variant_name?: string | null;
  price: number;
  unit_price?: number;
  quantity: number;
  total: number;
  total_price?: number;
  image_url?: string;
}

export interface Order {
  id: string;
  order_number: string; // OTN-2026-XXXXX
  user_id?: string | null;
  guest_email?: string | null;
  guest_name?: string | null;
  guest_phone?: string | null;
  status: OrderStatus;
  total_amount: number;
  shipping_fee: number;
  gift_wrap_fee: number;
  has_gift_wrap: boolean;
  gift_note?: string | null;
  delivery_type: DeliveryType;
  shipping_address: AddressData;
  billing_address: AddressData;
  tracking_number?: string | null;
  tracking_carrier?: string | null;
  admin_notes?: string | null;
  payment_status: PaymentStatus;
  payment_method: string;
  created_at: string;
  updated_at?: string;
  items?: OrderItem[];
}

export type ReturnStatus = 'talep_alindi' | 'onaylandi' | 'reddedildi' | 'tamamlandi';

export interface ReturnRequest {
  id: string;
  order_id: string;
  order_item_id?: string | null;
  user_id?: string | null;
  reason: string;
  details?: string | null;
  status: ReturnStatus;
  admin_response?: string | null;
  created_at: string;
  updated_at?: string;
  order?: Order;
}

export interface Question {
  id: string;
  product_id: string;
  product?: Product;
  user_id?: string | null;
  user_name: string;
  user_email?: string | null;
  question_text: string;
  answer_text?: string | null;
  is_approved: boolean;
  created_at: string;
  answered_at?: string | null;
}

export interface Review {
  id: string;
  product_id: string;
  product?: Product;
  user_id?: string | null;
  user_name: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
}

export interface LiveChatMessage {
  id: string;
  session_id: string;
  sender_type: 'customer' | 'admin';
  message_text: string;
  created_at: string;
}

export interface LiveChatSession {
  id: string;
  session_id: string;
  user_id?: string | null;
  customer_name: string;
  customer_email?: string | null;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
  messages?: LiveChatMessage[];
  last_message?: LiveChatMessage;
  unread_count?: number;
}

export interface InStockAlert {
  id: string;
  product_id: string;
  email: string;
  is_notified: boolean;
  created_at: string;
}

export interface WholesaleRequest {
  id: string;
  contact_name: string;
  phone: string;
  address: string;
  notes?: string | null;
  company_name?: string | null;
  email?: string | null;
  city?: string | null;
  estimated_volume?: string | null;
  status: string;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  variant?: ProductVariant | null;
  quantity: number;
}

// Accounting & Profit/Loss Types
export type AccountingTransactionType = 'purchase' | 'sale' | 'expense';
export type SaleChannel = 'magaza' | 'toptan' | 'website';

export interface AccountingTransaction {
  id: string;
  type: AccountingTransactionType;
  product_id?: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  unit_cost?: number | null; // Satış anındaki birim alış maliyeti
  total_cost?: number | null; // Satış anındaki toplam alış maliyeti
  net_profit?: number | null; // Satış işlemindeki net kâr = total_amount - total_cost
  customer_name?: string | null; // Satışta zorunlu
  customer_phone?: string | null; // Satışta zorunlu
  sale_channel?: SaleChannel | null; // Satışta zorunlu ('magaza' | 'toptan' | 'website')
  supplier_name?: string | null; // Alışta opsiyonel
  payment_method?: string | null; // Opsiyonel (Nakit, Kredi Kartı, Havale/EFT, Veresiye)
  document_no?: string | null; // Opsiyonel (Fatura / Fiş No)
  notes?: string | null; // Opsiyonel
  transaction_date: string; // Zorunlu (YYYY-MM-DD)
  update_stock?: boolean; // Stoğa işlendi mi?
  created_at: string;
  updated_at?: string;
}

export interface ProfitSummary {
  totalRevenue: number;
  totalCost: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  totalSalesCount: number;
  totalPurchasesCount: number;
  salesByChannel: {
    magaza: number;
    toptan: number;
    website: number;
  };
}

export interface ProductProfitStat {
  productId?: string | null;
  productName: string;
  totalSoldQuantity: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  currentStock: number;
  unitCostPrice: number;
  unitSalePrice: number;
}

