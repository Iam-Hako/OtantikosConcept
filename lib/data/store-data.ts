// Central High-Resilience Data Layer for Otantikos Concept
// Connects to Supabase PostgreSQL with automated client-side & local state synchronization

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

// In-Memory Runtime Store (Empty until user or Supabase adds real items)
let runtimeProducts: Product[] = [];
let runtimeCategories: Category[] = [];
let runtimeOrders: Order[] = [];
let runtimeReturns: ReturnRequest[] = [];
let runtimeQuestions: Question[] = [];
let runtimeReviews: Review[] = [];
let runtimeChatSessions: LiveChatSession[] = [];
let runtimeWholesale: WholesaleRequest[] = [];

// LocalStorage Synchronization Helpers
function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const val = localStorage.getItem(`otantikos_${key}`);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`otantikos_${key}`, JSON.stringify(data));
  } catch {
    // Ignore
  }
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

      if (!error && data) {
        runtimeProducts = data as Product[];
        setLocal('products', runtimeProducts);
        return runtimeProducts;
      }
    } catch {
      // Fallback
    }

    const localProds = getLocal<Product[]>('products', runtimeProducts);
    return localProds.filter(p => p.is_active);
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

      if (!error && data) {
        runtimeProducts = data as Product[];
        setLocal('products', runtimeProducts);
        return runtimeProducts;
      }
    } catch {
      // Fallback
    }

    return getLocal<Product[]>('products', runtimeProducts);
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
        .maybeSingle();

      if (!error && data) {
        return data as Product;
      }
    } catch {
      // Fallback
    }
    const products = await this.getProducts();
    return products.find(p => p.slug === slug) || null;
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
        .maybeSingle();

      if (!error && data) {
        return data as Product;
      }
    } catch {
      // Fallback
    }
    const products = await this.getAllAdminProducts();
    return products.find(p => p.id === id) || null;
  },

  async search(query: string): Promise<Product[]> {
    const products = await this.getProducts();
    if (!query.trim()) return products;
    const q = normalizeTurkish(query);

    return products.filter((p) => {
      const nameMatch = normalizeTurkish(p.name).includes(q);
      const skuMatch = normalizeTurkish(p.sku).includes(q);
      const catMatch = p.category?.name ? normalizeTurkish(p.category.name).includes(q) : false;
      const descMatch = p.description ? normalizeTurkish(p.description).includes(q) : false;
      return nameMatch || skuMatch || catMatch || descMatch;
    });
  },

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    const localList = getLocal<Product[]>('products', runtimeProducts);
    const existingIdx = localList.findIndex(p => p.id === productData.id || p.slug === productData.slug);

    let savedProduct: Product;

    const categories = await this.getCategories();
    const resolvedCat = categories.find(c => c.id === productData.category_id) || null;
    const formattedVariants = (productData.variants || []).map((v, i) => ({
      ...v,
      id: v.id || `var-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
    }));

    if (existingIdx > -1) {
      savedProduct = {
        ...localList[existingIdx],
        ...productData,
        category: productData.category_id !== undefined ? resolvedCat : localList[existingIdx].category,
        variants: productData.variants !== undefined ? formattedVariants : localList[existingIdx].variants,
        updated_at: new Date().toISOString(),
      } as Product;
      localList[existingIdx] = savedProduct;
    } else {
      savedProduct = {
        id: productData.id || `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        name: productData.name || 'Yeni Ürün',
        slug: productData.slug || `yeni-urun-${Date.now()}`,
        description: productData.description || '',
        short_description: productData.short_description || '',
        price: Number(productData.price || 0),
        stock: Number(productData.stock || 0),
        sku: productData.sku || `SKU-${Date.now()}`,
        category_id: productData.category_id || null,
        category: resolvedCat,
        is_featured: productData.is_featured ?? false,
        is_new: productData.is_new ?? true,
        is_active: productData.is_active ?? true,
        rating: 5.0,
        review_count: 0,
        video_url: productData.video_url || null,
        images: productData.images && productData.images.length > 0 ? productData.images : [{ image_url: '/images/logo.webp', is_cover: true, display_order: 1 }],
        variants: formattedVariants,
        specifications: productData.specifications || [],
        created_at: new Date().toISOString(),
      };
      localList.unshift(savedProduct);
    }

    runtimeProducts = localList;
    setLocal('products', localList);

    // Persist parent product and sub-tables to Supabase
    try {
      const supabase = createClient();
      const isCustomId = savedProduct.id.startsWith('prod-');
      
      const { data: upsertedProduct, error: prodErr } = await supabase
        .from('products')
        .upsert({
          id: isCustomId ? undefined : savedProduct.id,
          name: savedProduct.name,
          slug: savedProduct.slug,
          description: savedProduct.description,
          short_description: savedProduct.short_description,
          price: savedProduct.price,
          stock: savedProduct.stock,
          sku: savedProduct.sku,
          category_id: savedProduct.category_id && !savedProduct.category_id.startsWith('cat-') ? savedProduct.category_id : null,
          is_featured: savedProduct.is_featured,
          is_new: savedProduct.is_new,
          is_active: savedProduct.is_active,
          video_url: savedProduct.video_url,
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (!prodErr && upsertedProduct) {
        const prodDbId = upsertedProduct.id;
        savedProduct.id = prodDbId;
        setLocal('products', localList);

        // Sync Images
        if (savedProduct.images && savedProduct.images.length > 0) {
          await supabase.from('product_images').delete().eq('product_id', prodDbId);
          await supabase.from('product_images').insert(
            savedProduct.images.map((img, i) => ({
              product_id: prodDbId,
              image_url: img.image_url,
              is_cover: img.is_cover || i === 0,
              display_order: img.display_order || i + 1,
            }))
          );
        }

        // Sync Variants
        if (savedProduct.variants && savedProduct.variants.length > 0) {
          await supabase.from('product_variants').delete().eq('product_id', prodDbId);
          await supabase.from('product_variants').insert(
            savedProduct.variants.map((v) => ({
              product_id: prodDbId,
              name: v.name,
              value: v.value,
              stock: v.stock,
              price_override: v.price_override || null,
              is_active: v.is_active ?? true,
            }))
          );
        }

        // Sync Specifications
        if (savedProduct.specifications && savedProduct.specifications.length > 0) {
          await supabase.from('product_specifications').delete().eq('product_id', prodDbId);
          await supabase.from('product_specifications').insert(
            savedProduct.specifications.map((s, i) => ({
              product_id: prodDbId,
              spec_key: s.spec_key,
              spec_value: s.spec_value,
              display_order: s.display_order || i + 1,
            }))
          );
        }
      }
    } catch {
      // Fallback to local
    }

    return savedProduct;
  },

  async updateQuickStockAndPrice(productId: string, newStock: number, newPrice: number): Promise<boolean> {
    const localList = getLocal<Product[]>('products', runtimeProducts);
    const idx = localList.findIndex(p => p.id === productId);
    if (idx > -1) {
      localList[idx].stock = newStock;
      localList[idx].price = newPrice;
      localList[idx].updated_at = new Date().toISOString();
      runtimeProducts = localList;
      setLocal('products', localList);
    }

    try {
      const supabase = createClient();
      if (!productId.startsWith('prod-')) {
        await supabase.from('products').update({ stock: newStock, price: newPrice }).eq('id', productId);
      }
    } catch {
      // Ignore
    }
    return true;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    let localList = getLocal<Product[]>('products', runtimeProducts);
    localList = localList.filter(p => p.id !== productId);
    runtimeProducts = localList;
    setLocal('products', localList);

    try {
      const supabase = createClient();
      if (!productId.startsWith('prod-')) {
        await supabase.from('products').delete().eq('id', productId);
      }
    } catch {
      // Ignore
    }
    return true;
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
        .order('display_order', { ascending: true });

      if (!error && data) {
        runtimeCategories = data as Category[];
        setLocal('categories', runtimeCategories);
        return runtimeCategories;
      }
    } catch {
      // Fallback
    }

    return getLocal<Category[]>('categories', runtimeCategories);
  },

  async saveCategory(cat: Partial<Category>): Promise<Category> {
    const list = getLocal<Category[]>('categories', runtimeCategories);
    const idx = list.findIndex(c => c.id === cat.id || c.slug === cat.slug);

    let savedCat: Category;
    if (idx > -1) {
      savedCat = { ...list[idx], ...cat } as Category;
      list[idx] = savedCat;
    } else {
      savedCat = {
        id: cat.id || `cat-${Date.now()}`,
        name: cat.name || 'Yeni Kategori',
        slug: cat.slug || `kategori-${Date.now()}`,
        description: cat.description || '',
        image_url: cat.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
        display_order: cat.display_order ?? (list.length + 1),
        is_active: cat.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      list.push(savedCat);
    }

    runtimeCategories = list;
    setLocal('categories', list);

    try {
      const supabase = createClient();
      const isCustomId = savedCat.id.startsWith('cat-');
      const { data, error } = await supabase
        .from('categories')
        .upsert({
          id: isCustomId ? undefined : savedCat.id,
          name: savedCat.name,
          slug: savedCat.slug,
          description: savedCat.description,
          image_url: savedCat.image_url,
          display_order: savedCat.display_order,
          is_active: savedCat.is_active,
        }, { onConflict: 'slug' })
        .select()
        .single();

      if (!error && data) {
        savedCat.id = data.id;
        setLocal('categories', list);
      }
    } catch {
      // Local fallback
    }

    return savedCat;
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    let list = getLocal<Category[]>('categories', runtimeCategories);
    list = list.filter(c => c.id !== categoryId);
    runtimeCategories = list;
    setLocal('categories', list);

    try {
      const supabase = createClient();
      if (!categoryId.startsWith('cat-')) {
        await supabase.from('categories').delete().eq('id', categoryId);
      }
    } catch {
      // Ignore
    }
    return true;
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
      
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      
      if (!error && data) {
        if (!userId) {
          runtimeOrders = data as Order[];
          setLocal('orders', runtimeOrders);
        }
        return data as Order[];
      }
    } catch {
      // Fallback
    }

    const localOrders = getLocal<Order[]>('orders', runtimeOrders);
    if (userId) return localOrders.filter(o => o.user_id === userId);
    return localOrders;
  },

  async getOrderByNumber(orderNumber: string, emailOrName?: string): Promise<Order | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .maybeSingle();

      if (!error && data) {
        const found = data as Order;
        if (emailOrName && emailOrName.trim()) {
          const q = emailOrName.trim().toLowerCase();
          const guestEmail = (found.guest_email || '').toLowerCase();
          const name = (found.shipping_address?.full_name || '').toLowerCase();
          if (!guestEmail.includes(q) && !name.includes(q)) return null;
        }
        return found;
      }
    } catch {
      // Fallback
    }

    const orders = await this.getOrders();
    const cleanNumber = orderNumber.trim().toUpperCase();
    const found = orders.find(o => o.order_number.toUpperCase() === cleanNumber);
    if (!found) return null;

    if (emailOrName && emailOrName.trim()) {
      const q = emailOrName.trim().toLowerCase();
      const guestEmail = (found.guest_email || '').toLowerCase();
      const name = (found.shipping_address?.full_name || '').toLowerCase();
      if (!guestEmail.includes(q) && !name.includes(q)) return null;
    }
    return found;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: orderData.order_number || `OTN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
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
      shipping_address: orderData.shipping_address!,
      billing_address: orderData.billing_address!,
      tracking_number: null,
      tracking_carrier: null,
      admin_notes: null,
      payment_status: 'paid',
      payment_method: 'credit_card',
      created_at: new Date().toISOString(),
      items: orderData.items || [],
    };

    const orders = getLocal<Order[]>('orders', runtimeOrders);
    orders.unshift(newOrder);
    runtimeOrders = orders;
    setLocal('orders', orders);

    // Deduct stock locally
    const prods = getLocal<Product[]>('products', runtimeProducts);
    newOrder.items?.forEach((item) => {
      const p = prods.find(pr => pr.id === item.product_id || pr.name === item.product_name);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
        if (item.variant_id && p.variants) {
          const v = p.variants.find(vr => vr.id === item.variant_id);
          if (v) v.stock = Math.max(0, v.stock - item.quantity);
        }
      }
    });
    setLocal('products', prods);

    // Persist Order and Order Items in Supabase
    try {
      const supabase = createClient();
      const { data: orderRow, error: orderErr } = await supabase
        .from('orders')
        .insert({
          order_number: newOrder.order_number,
          user_id: newOrder.user_id,
          guest_email: newOrder.guest_email,
          guest_name: newOrder.guest_name,
          guest_phone: newOrder.guest_phone,
          status: newOrder.status,
          total_amount: newOrder.total_amount,
          shipping_fee: newOrder.shipping_fee,
          gift_wrap_fee: newOrder.gift_wrap_fee,
          has_gift_wrap: newOrder.has_gift_wrap,
          gift_note: newOrder.gift_note,
          delivery_type: newOrder.delivery_type,
          shipping_address: newOrder.shipping_address,
          billing_address: newOrder.billing_address,
          payment_status: newOrder.payment_status,
          payment_method: newOrder.payment_method,
        })
        .select('id')
        .single();

      if (!orderErr && orderRow && newOrder.items && newOrder.items.length > 0) {
        newOrder.id = orderRow.id;
        await supabase.from('order_items').insert(
          newOrder.items.map((item) => ({
            order_id: orderRow.id,
            product_id: item.product_id && !item.product_id.startsWith('prod-') ? item.product_id : null,
            product_name: item.product_name,
            variant_name: item.variant_name || null,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          }))
        );
      }
    } catch {
      // Local fallback
    }

    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    trackingNumber?: string,
    trackingCarrier?: string,
    adminNotes?: string
  ): Promise<boolean> {
    const orders = getLocal<Order[]>('orders', runtimeOrders);
    const order = orders.find(o => o.id === orderId || o.order_number === orderId);
    if (order) {
      order.status = status;
      if (trackingNumber !== undefined) order.tracking_number = trackingNumber;
      if (trackingCarrier !== undefined) order.tracking_carrier = trackingCarrier;
      if (adminNotes !== undefined) order.admin_notes = adminNotes;
      order.updated_at = new Date().toISOString();
      setLocal('orders', orders);
    }

    try {
      const supabase = createClient();
      const updateData: any = { status };
      if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
      if (trackingCarrier !== undefined) updateData.tracking_carrier = trackingCarrier;
      if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

      if (!orderId.startsWith('ord-')) {
        await supabase.from('orders').update(updateData).eq('id', orderId);
      } else if (order?.order_number) {
        await supabase.from('orders').update(updateData).eq('order_number', order.order_number);
      }
    } catch {
      // Ignore
    }
    return true;
  },

  // ==========================================
  // 4. RMA (RETURNS & EXCHANGES)
  // ==========================================
  async getReturns(userId?: string): Promise<ReturnRequest[]> {
    try {
      const supabase = createClient();
      let query = supabase.from('returns').select('*, order:orders(*)').order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (!error && data) {
        runtimeReturns = data as ReturnRequest[];
        setLocal('returns', runtimeReturns);
        return runtimeReturns;
      }
    } catch {
      // Fallback
    }

    const returns = getLocal<ReturnRequest[]>('returns', runtimeReturns);
    if (userId) return returns.filter(r => r.user_id === userId);
    return returns;
  },

  async createReturn(req: Partial<ReturnRequest>): Promise<ReturnRequest> {
    const orders = await this.getOrders();
    const newReturn: ReturnRequest = {
      id: `ret-${Date.now()}`,
      order_id: req.order_id!,
      user_id: req.user_id || null,
      reason: req.reason || 'Diğer',
      details: req.details || '',
      status: 'talep_alindi',
      created_at: new Date().toISOString(),
      order: orders.find(o => o.id === req.order_id || o.order_number === req.order_id),
    };

    const returns = getLocal<ReturnRequest[]>('returns', runtimeReturns);
    returns.unshift(newReturn);
    runtimeReturns = returns;
    setLocal('returns', returns);

    try {
      const supabase = createClient();
      const { data } = await supabase.from('returns').insert({
        order_id: newReturn.order?.id && !newReturn.order.id.startsWith('ord-') ? newReturn.order.id : req.order_id,
        user_id: newReturn.user_id,
        reason: newReturn.reason,
        details: newReturn.details,
        status: newReturn.status,
      }).select('id').single();

      if (data) {
        newReturn.id = data.id;
        setLocal('returns', returns);
      }
    } catch {
      // Fallback
    }

    return newReturn;
  },

  async updateReturnStatus(returnId: string, status: ReturnRequest['status'], adminResponse?: string): Promise<boolean> {
    const returns = getLocal<ReturnRequest[]>('returns', runtimeReturns);
    const ret = returns.find(r => r.id === returnId);
    if (ret) {
      ret.status = status;
      if (adminResponse !== undefined) ret.admin_response = adminResponse;
      ret.updated_at = new Date().toISOString();
      setLocal('returns', returns);
    }

    try {
      const supabase = createClient();
      if (!returnId.startsWith('ret-')) {
        await supabase.from('returns').update({
          status,
          admin_response: adminResponse,
        }).eq('id', returnId);
      }
    } catch {
      // Fallback
    }

    return true;
  },

  // ==========================================
  // 5. Q&A (QUESTIONS & ANSWERS)
  // ==========================================
  async getQuestions(productId?: string): Promise<Question[]> {
    try {
      const supabase = createClient();
      let query = supabase.from('questions').select('*').order('created_at', { ascending: false });
      if (productId && !productId.startsWith('prod-')) {
        query = query.eq('product_id', productId).eq('is_approved', true);
      }
      const { data, error } = await query;
      if (!error && data) {
        runtimeQuestions = data as Question[];
        setLocal('questions', runtimeQuestions);
        return runtimeQuestions;
      }
    } catch {
      // Fallback
    }

    const questions = getLocal<Question[]>('questions', runtimeQuestions);
    if (productId) return questions.filter(q => q.product_id === productId && q.is_approved);
    return questions;
  },

  async addQuestion(productId: string, userName: string, userEmail: string, questionText: string): Promise<Question> {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      product_id: productId,
      user_name: userName,
      user_email: userEmail,
      question_text: questionText,
      is_approved: false,
      created_at: new Date().toISOString(),
    };

    const questions = getLocal<Question[]>('questions', runtimeQuestions);
    questions.unshift(newQ);
    runtimeQuestions = questions;
    setLocal('questions', questions);

    try {
      const supabase = createClient();
      const { data } = await supabase.from('questions').insert({
        product_id: !productId.startsWith('prod-') ? productId : null,
        user_name: userName,
        user_email: userEmail,
        question_text: questionText,
        is_approved: false,
      }).select('id').single();

      if (data) {
        newQ.id = data.id;
        setLocal('questions', questions);
      }
    } catch {
      // Fallback
    }

    return newQ;
  },

  async answerAndApproveQuestion(questionId: string, answerText: string, isApproved = true): Promise<boolean> {
    const questions = getLocal<Question[]>('questions', runtimeQuestions);
    const q = questions.find(item => item.id === questionId);
    if (q) {
      q.answer_text = answerText;
      q.is_approved = isApproved;
      q.answered_at = new Date().toISOString();
      setLocal('questions', questions);
    }

    try {
      const supabase = createClient();
      if (!questionId.startsWith('q-')) {
        await supabase.from('questions').update({
          answer_text: answerText,
          is_approved: isApproved,
          answered_at: new Date().toISOString(),
        }).eq('id', questionId);
      }
    } catch {
      // Fallback
    }

    return true;
  },

  // ==========================================
  // 6. REVIEWS
  // ==========================================
  async getReviews(productId?: string): Promise<Review[]> {
    try {
      const supabase = createClient();
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (productId && !productId.startsWith('prod-')) {
        query = query.eq('product_id', productId).eq('is_approved', true);
      }
      const { data, error } = await query;
      if (!error && data) {
        runtimeReviews = data as Review[];
        setLocal('reviews', runtimeReviews);
        return runtimeReviews;
      }
    } catch {
      // Fallback
    }

    const reviews = getLocal<Review[]>('reviews', runtimeReviews);
    if (productId) return reviews.filter(r => r.product_id === productId && r.is_approved);
    return reviews;
  },

  async addReview(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      product_id: productId,
      user_name: userName,
      rating,
      comment,
      is_approved: true,
      created_at: new Date().toISOString(),
    };

    const reviews = getLocal<Review[]>('reviews', runtimeReviews);
    reviews.unshift(newRev);
    runtimeReviews = reviews;
    setLocal('reviews', reviews);

    try {
      const supabase = createClient();
      const { data } = await supabase.from('reviews').insert({
        product_id: !productId.startsWith('prod-') ? productId : null,
        user_name: userName,
        rating,
        comment,
        is_approved: true,
      }).select('id').single();

      if (data) {
        newRev.id = data.id;
        setLocal('reviews', reviews);
      }
    } catch {
      // Fallback
    }

    return newRev;
  },

  async moderateReview(reviewId: string, isApproved: boolean): Promise<boolean> {
    const reviews = getLocal<Review[]>('reviews', runtimeReviews);
    const r = reviews.find(item => item.id === reviewId);
    if (r) {
      r.is_approved = isApproved;
      setLocal('reviews', reviews);
    }

    try {
      const supabase = createClient();
      if (!reviewId.startsWith('rev-')) {
        await supabase.from('reviews').update({
          is_approved: isApproved,
        }).eq('id', reviewId);
      }
    } catch {
      // Fallback
    }

    return true;
  },

  // ==========================================
  // 7. LIVE CHAT (REALTIME SESSIONS & MESSAGES)
  // ==========================================
  async getChatSessions(): Promise<LiveChatSession[]> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch('/api/live-chat');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            runtimeChatSessions = data;
            setLocal('all_chat_sessions', data);
            return data;
          }
        }
      } catch {
        // Fallback
      }
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select(`
          *,
          messages:live_chat_messages(*)
        `)
        .order('updated_at', { ascending: false });

      if (!error && data) {
        data.forEach((s: any) => {
          if (s.messages && Array.isArray(s.messages)) {
            s.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            s.last_message = s.messages[s.messages.length - 1] || null;
          }
        });
        runtimeChatSessions = data as LiveChatSession[];
        setLocal('all_chat_sessions', runtimeChatSessions);
        return runtimeChatSessions;
      }
    } catch {
      // Fallback to local
    }
    return getLocal<LiveChatSession[]>('all_chat_sessions', runtimeChatSessions);
  },

  async getChatSession(sessionId: string): Promise<LiveChatSession | null> {
    if (typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/live-chat?session_id=${encodeURIComponent(sessionId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.session_id) {
            return data as LiveChatSession;
          }
        }
      } catch {
        // Fallback
      }
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select(`
          *,
          messages:live_chat_messages(*)
        `)
        .eq('session_id', sessionId)
        .maybeSingle();

      if (!error && data) {
        if (data.messages && Array.isArray(data.messages)) {
          data.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          data.last_message = data.messages[data.messages.length - 1] || null;
        }
        return data as LiveChatSession;
      }
    } catch {
      // Fallback
    }

    const sessions = getLocal<LiveChatSession[]>('all_chat_sessions', runtimeChatSessions);
    return sessions.find(s => s.session_id === sessionId) || null;
  },

  async sendMessage(
    sessionId: string,
    senderType: 'customer' | 'admin',
    messageText: string,
    customerName?: string,
    customerEmail?: string
  ): Promise<LiveChatMessage> {
    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      session_id: sessionId,
      sender_type: senderType,
      message_text: messageText,
      created_at: new Date().toISOString(),
    };

    // 1. Update local state immediately for instant feedback
    const sessions = getLocal<LiveChatSession[]>('all_chat_sessions', runtimeChatSessions);
    let session = sessions.find(s => s.session_id === sessionId);
    if (!session) {
      session = {
        id: `chat-${sessionId}`,
        session_id: sessionId,
        customer_name: customerName || 'Ziyaretçi',
        customer_email: customerEmail || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [newMsg],
        last_message: newMsg,
      };
      sessions.unshift(session);
    } else {
      session.messages = session.messages || [];
      session.messages.push(newMsg);
      session.last_message = newMsg;
      session.updated_at = new Date().toISOString();
      if (customerName && session.customer_name === 'Ziyaretçi') {
        session.customer_name = customerName;
      }
      if (customerEmail && !session.customer_email) {
        session.customer_email = customerEmail;
      }
    }

    runtimeChatSessions = sessions;
    setLocal('all_chat_sessions', sessions);

    // 2. BroadcastChannel for 0ms cross-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('otantikos_live_chat');
        bc.postMessage({
          type: 'new_message',
          sessionId,
          senderType,
          message: newMsg,
          session,
        });
        bc.close();
      } catch {
        // Ignore
      }
    }

    // 3. Post to Server API (Shared across all devices & browsers)
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/live-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            sender_type: senderType,
            message_text: messageText,
            customer_name: session.customer_name,
            customer_email: session.customer_email,
          }),
        });
      } catch {
        // API fallback
      }
    }

    // 4. Also persist to Supabase if database tables are present
    try {
      const supabase = createClient();
      await supabase
        .from('live_chat_sessions')
        .upsert({
          session_id: sessionId,
          customer_name: session.customer_name,
          customer_email: session.customer_email,
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'session_id' });

      await supabase
        .from('live_chat_messages')
        .insert({
          session_id: sessionId,
          sender_type: senderType,
          message_text: messageText,
        });
    } catch {
      // Graceful fallback
    }

    return newMsg;
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

      if (!error && data) {
        runtimeWholesale = data as WholesaleRequest[];
        setLocal('wholesale', runtimeWholesale);
        return runtimeWholesale;
      }
    } catch {
      // Fallback
    }

    return getLocal<WholesaleRequest[]>('wholesale', runtimeWholesale);
  },

  async addWholesaleRequest(req: Omit<WholesaleRequest, 'id' | 'status' | 'created_at'>): Promise<WholesaleRequest> {
    const newReq: WholesaleRequest = {
      ...req,
      id: `ws-${Date.now()}`,
      status: 'beklemede',
      created_at: new Date().toISOString(),
    };

    const list = getLocal<WholesaleRequest[]>('wholesale', runtimeWholesale);
    list.unshift(newReq);
    runtimeWholesale = list;
    setLocal('wholesale', list);

    try {
      const supabase = createClient();
      const { data } = await supabase.from('wholesale_requests').insert({
        company_name: req.company_name,
        contact_name: req.contact_name,
        email: req.email,
        phone: req.phone,
        city: req.city,
        estimated_volume: req.estimated_volume,
        notes: req.notes,
        status: 'beklemede',
      }).select('id').single();

      if (data) {
        newReq.id = data.id;
        setLocal('wholesale', list);
      }
    } catch {
      // Fallback
    }

    return newReq;
  }
};
