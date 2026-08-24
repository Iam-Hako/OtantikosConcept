// Direct Supabase Data Layer for Otantikos Concept
// Connects directly to Supabase PostgreSQL without mock/dummy placeholders

import { 
  Product, 
  Category, 
  Order, 
  ReturnRequest, 
  Question, 
  Review, 
  LiveChatSession, 
  LiveChatMessage, 
  WholesaleRequest 
} from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/client';

export function normalizeTurkish(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'i')
    .replace(/ı/g, 'i')
    .replace(/Ş/g, 's')
    .replace(/ş/g, 's')
    .replace(/Ğ/g, 'g')
    .replace(/ğ/g, 'g')
    .replace(/Ü/g, 'u')
    .replace(/ü/g, 'u')
    .replace(/Ç/g, 'c')
    .replace(/ç/g, 'c')
    .replace(/Ö/g, 'o')
    .replace(/ö/g, 'o')
    .toLowerCase()
    .trim();
}

export const DataService = {
  
  // ==========================================
  // 1. PRODUCTS
  // ==========================================
  async getProducts(): Promise<Product[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          specifications:product_specifications(*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getProducts error:', error.message);
        return [];
      }
      return (data as Product[]) || [];
    } catch (err) {
      console.error('getProducts exception:', err);
      return [];
    }
  },

  async getAllAdminProducts(): Promise<Product[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          specifications:product_specifications(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase getAllAdminProducts error:', error.message);
        return [];
      }
      return (data as Product[]) || [];
    } catch (err) {
      console.error('getAllAdminProducts exception:', err);
      return [];
    }
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          specifications:product_specifications(*)
        `)
        .eq('slug', slug)
        .single();

      if (error || !data) return null;
      return data as Product;
    } catch {
      return null;
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          images:product_images(*),
          variants:product_variants(*),
          specifications:product_specifications(*)
        `)
        .eq('id', id)
        .single();

      if (error || !data) return null;
      return data as Product;
    } catch {
      return null;
    }
  },

  async search(query: string): Promise<Product[]> {
    const products = await this.getProducts();
    if (!query.trim()) return products;
    const normalizedQuery = normalizeTurkish(query);

    return products.filter((p) => {
      const nameMatch = normalizeTurkish(p.name).includes(normalizedQuery);
      const skuMatch = normalizeTurkish(p.sku).includes(normalizedQuery);
      const catMatch = p.category?.name ? normalizeTurkish(p.category.name).includes(normalizedQuery) : false;
      const descMatch = p.description ? normalizeTurkish(p.description).includes(normalizedQuery) : false;
      const specMatch = p.specifications?.some(
        (s) => normalizeTurkish(s.spec_key).includes(normalizedQuery) || normalizeTurkish(s.spec_value).includes(normalizedQuery)
      );
      return nameMatch || skuMatch || catMatch || descMatch || specMatch;
    });
  },

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    const supabase = createClient();
    
    // Prepare core product object
    const prodPayload = {
      name: productData.name,
      slug: productData.slug,
      description: productData.description || null,
      short_description: productData.short_description || null,
      price: productData.price,
      stock: productData.stock,
      sku: productData.sku,
      category_id: productData.category_id || null,
      is_featured: productData.is_featured ?? false,
      is_new: productData.is_new ?? false,
      is_active: productData.is_active ?? true,
      video_url: productData.video_url || null,
      updated_at: new Date().toISOString(),
    };

    let productId = productData.id;

    if (productId && !productId.startsWith('prod-temp')) {
      await supabase.from('products').update(prodPayload).eq('id', productId);
    } else {
      const { data: newProd, error } = await supabase.from('products').insert(prodPayload).select().single();
      if (newProd) {
        productId = newProd.id;
      }
    }

    if (productId) {
      // Save images
      if (productData.images && productData.images.length > 0) {
        await supabase.from('product_images').delete().eq('product_id', productId);
        const imagesToInsert = productData.images.map((img, i) => ({
          product_id: productId,
          image_url: img.image_url,
          is_cover: img.is_cover ?? (i === 0),
          display_order: img.display_order ?? (i + 1),
          alt_text: img.alt_text || productData.name,
        }));
        await supabase.from('product_images').insert(imagesToInsert);
      }

      // Save specifications
      if (productData.specifications && productData.specifications.length > 0) {
        await supabase.from('product_specifications').delete().eq('product_id', productId);
        const specsToInsert = productData.specifications.map((spec, i) => ({
          product_id: productId,
          spec_key: spec.spec_key,
          spec_value: spec.spec_value,
          display_order: spec.display_order ?? (i + 1),
        }));
        await supabase.from('product_specifications').insert(specsToInsert);
      }

      // Save variants
      if (productData.variants && productData.variants.length > 0) {
        await supabase.from('product_variants').delete().eq('product_id', productId);
        const variantsToInsert = productData.variants.map((v) => ({
          product_id: productId,
          name: v.name,
          value: v.value,
          stock: v.stock,
          is_active: v.is_active ?? true,
        }));
        await supabase.from('product_variants').insert(variantsToInsert);
      }
    }

    const saved = await this.getProductById(productId!);
    return saved || (productData as Product);
  },

  async updateQuickStockAndPrice(productId: string, newStock: number, newPrice: number): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock, price: newPrice, updated_at: new Date().toISOString() })
        .eq('id', productId);

      return !error;
    } catch {
      return false;
    }
  },

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', productId);
      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // 2. CATEGORIES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error || !data) return [];
      return data as Category[];
    } catch {
      return [];
    }
  },

  async saveCategory(cat: Partial<Category>): Promise<Category> {
    const supabase = createClient();
    const payload = {
      name: cat.name,
      slug: cat.slug,
      description: cat.description || null,
      image_url: cat.image_url || null,
      display_order: cat.display_order || 1,
      is_active: cat.is_active ?? true,
      updated_at: new Date().toISOString(),
    };

    if (cat.id && !cat.id.startsWith('cat-temp')) {
      const { data } = await supabase.from('categories').update(payload).eq('id', cat.id).select().single();
      return (data as Category) || (cat as Category);
    } else {
      const { data } = await supabase.from('categories').insert(payload).select().single();
      return (data as Category) || (cat as Category);
    }
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);
      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // 3. ORDERS
  // ==========================================
  async getOrders(userId?: string): Promise<Order[]> {
    try {
      const supabase = createClient();
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data as Order[];
    } catch {
      return [];
    }
  },

  async getOrderByNumber(orderNumber: string, emailOrName?: string): Promise<Order | null> {
    try {
      const supabase = createClient();
      const cleanNumber = orderNumber.trim().toUpperCase();
      
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('order_number', cleanNumber)
        .single();

      if (error || !data) return null;

      if (emailOrName && emailOrName.trim()) {
        const queryNorm = emailOrName.trim().toLowerCase();
        const guestEmail = (data.guest_email || '').toLowerCase();
        const recipientName = (data.shipping_address?.full_name || '').toLowerCase();

        if (!guestEmail.includes(queryNorm) && !recipientName.includes(queryNorm)) {
          return null;
        }
      }

      return data as Order;
    } catch {
      return null;
    }
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const supabase = createClient();
    
    const { data: newOrder, error } = await supabase
      .from('orders')
      .insert({
        order_number: orderData.order_number,
        user_id: orderData.user_id || null,
        guest_email: orderData.guest_email || null,
        guest_name: orderData.guest_name || null,
        guest_phone: orderData.guest_phone || null,
        status: 'siparis_alindi',
        total_amount: orderData.total_amount || 0,
        shipping_fee: orderData.shipping_fee || 0,
        gift_wrap_fee: orderData.gift_wrap_fee || 0,
        has_gift_wrap: orderData.has_gift_wrap || false,
        gift_note: orderData.gift_note || null,
        delivery_type: orderData.delivery_type || 'kargo',
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        payment_status: 'paid',
        payment_method: 'credit_card',
      })
      .select()
      .single();

    if (error || !newOrder) {
      throw new Error(`Sipariş oluşturulamadı: ${error?.message}`);
    }

    // Insert order items
    if (orderData.items && orderData.items.length > 0) {
      const itemsToInsert = orderData.items.map((item) => ({
        order_id: newOrder.id,
        product_id: item.product_id || null,
        variant_id: item.variant_id || null,
        product_name: item.product_name,
        variant_name: item.variant_name || null,
        price: item.price,
        quantity: item.quantity,
        total: item.total,
      }));
      await supabase.from('order_items').insert(itemsToInsert);

      // Decrement stock in Supabase
      for (const it of orderData.items) {
        if (it.product_id) {
          const { data: currentProd } = await supabase.from('products').select('stock').eq('id', it.product_id).single();
          if (currentProd) {
            const nextStock = Math.max(0, currentProd.stock - it.quantity);
            await supabase.from('products').update({ stock: nextStock }).eq('id', it.product_id);
          }
        }
      }
    }

    const completeOrder = await this.getOrderByNumber(newOrder.order_number);
    return completeOrder || (newOrder as Order);
  },

  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    trackingNumber?: string,
    trackingCarrier?: string,
    adminNotes?: string
  ): Promise<boolean> {
    try {
      const supabase = createClient();
      const payload: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (trackingNumber !== undefined) payload.tracking_number = trackingNumber;
      if (trackingCarrier !== undefined) payload.tracking_carrier = trackingCarrier;
      if (adminNotes !== undefined) payload.admin_notes = adminNotes;

      const { error } = await supabase.from('orders').update(payload).eq('id', orderId);
      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // 4. RMA (RETURNS & EXCHANGES)
  // ==========================================
  async getReturns(userId?: string): Promise<ReturnRequest[]> {
    try {
      const supabase = createClient();
      let query = supabase
        .from('return_requests')
        .select('*, order:orders(*)')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data as ReturnRequest[];
    } catch {
      return [];
    }
  },

  async createReturn(req: Partial<ReturnRequest>): Promise<ReturnRequest> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('return_requests')
      .insert({
        order_id: req.order_id,
        user_id: req.user_id || null,
        reason: req.reason,
        details: req.details || '',
        status: 'talep_alindi',
      })
      .select('*, order:orders(*)')
      .single();

    if (error || !data) {
      throw new Error(`İade talebi oluşturulamadı: ${error?.message}`);
    }
    return data as ReturnRequest;
  },

  async updateReturnStatus(returnId: string, status: ReturnRequest['status'], adminResponse?: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const payload: any = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (adminResponse !== undefined) payload.admin_response = adminResponse;

      const { error } = await supabase.from('return_requests').update(payload).eq('id', returnId);
      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // 5. Q&A (QUESTIONS & ANSWERS)
  // ==========================================
  async getQuestions(productId?: string): Promise<Question[]> {
    try {
      const supabase = createClient();
      let query = supabase.from('questions').select('*').order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId).eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data as Question[];
    } catch {
      return [];
    }
  },

  async addQuestion(productId: string, userName: string, userEmail: string, questionText: string): Promise<Question> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('questions')
      .insert({
        product_id: productId,
        user_name: userName,
        user_email: userEmail,
        question_text: questionText,
        is_approved: false,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Soru iletilemedi: ${error?.message}`);
    }
    return data as Question;
  },

  async answerAndApproveQuestion(questionId: string, answerText: string, isApproved = true): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('questions')
        .update({
          answer_text: answerText,
          is_approved: isApproved,
          answered_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // 6. REVIEWS
  // ==========================================
  async getReviews(productId?: string): Promise<Review[]> {
    try {
      const supabase = createClient();
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });

      if (productId) {
        query = query.eq('product_id', productId).eq('is_approved', true);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      return data as Review[];
    } catch {
      return [];
    }
  },

  async addReview(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        user_name: userName,
        rating,
        comment,
        is_approved: true,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Yorum kaydedilemedi: ${error?.message}`);
    }
    return data as Review;
  },

  async moderateReview(reviewId: string, isApproved: boolean): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId);

      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // 7. LIVE CHAT (REALTIME SESSIONS)
  // ==========================================
  async getChatSessions(): Promise<LiveChatSession[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select('*, messages:live_chat_messages(*)')
        .order('updated_at', { ascending: false });

      if (error || !data) return [];
      return data as LiveChatSession[];
    } catch {
      return [];
    }
  },

  async getChatSession(sessionId: string): Promise<LiveChatSession | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select('*, messages:live_chat_messages(*)')
        .eq('session_id', sessionId)
        .single();

      if (error || !data) return null;
      return data as LiveChatSession;
    } catch {
      return null;
    }
  },

  async sendMessage(
    sessionId: string,
    senderType: 'customer' | 'admin',
    messageText: string,
    customerName?: string,
    customerEmail?: string
  ): Promise<LiveChatMessage> {
    const supabase = createClient();
    
    // Ensure session exists
    let { data: session } = await supabase
      .from('live_chat_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (!session) {
      const { data: newSess } = await supabase
        .from('live_chat_sessions')
        .insert({
          session_id: sessionId,
          customer_name: customerName || 'Ziyaretçi',
          customer_email: customerEmail || null,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();
      session = newSess;
    } else {
      await supabase
        .from('live_chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('session_id', sessionId);
    }

    const { data: newMsg, error } = await supabase
      .from('live_chat_messages')
      .insert({
        session_id: sessionId,
        sender_type: senderType,
        message_text: messageText,
      })
      .select()
      .single();

    if (error || !newMsg) {
      throw new Error(`Mesaj iletilemedi: ${error?.message}`);
    }
    return newMsg as LiveChatMessage;
  },

  // ==========================================
  // 8. WHOLESALE B2B
  // ==========================================
  async getWholesaleRequests(): Promise<WholesaleRequest[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('wholesale_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data as WholesaleRequest[];
    } catch {
      return [];
    }
  },

  async addWholesaleRequest(req: Omit<WholesaleRequest, 'id' | 'status' | 'created_at'>): Promise<WholesaleRequest> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('wholesale_requests')
      .insert({
        company_name: req.company_name,
        contact_name: req.contact_name,
        email: req.email,
        phone: req.phone,
        city: req.city,
        estimated_volume: req.estimated_volume || null,
        notes: req.notes || '',
        status: 'beklemede',
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Toptan teklif talebi kaydedilemedi: ${error?.message}`);
    }
    return data as WholesaleRequest;
  }

};
