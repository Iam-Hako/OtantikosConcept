// Central Data Service for Otantikos Concept
// Connects to Supabase with fallback to rich in-memory seed data

import { Product, Category, Order, ReturnRequest, Question, Review, LiveChatSession, LiveChatMessage, WholesaleRequest } from '@/lib/types/ecommerce';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '@/lib/data/initial-seed';
import { createClient } from '@/lib/supabase/client';

// Client-side memory store for instantaneous local testing & zero-push CMS reflection
let memoryProducts: Product[] = [...INITIAL_PRODUCTS];
let memoryCategories: Category[] = [...INITIAL_CATEGORIES];
let memoryOrders: Order[] = [
  {
    id: "ord-test-1",
    order_number: "OTN-2026-78412",
    guest_name: "Ahmet Yılmaz",
    guest_email: "ahmet@example.com",
    guest_phone: "0532 555 1234",
    status: "hazirlaniyor",
    total_amount: 678.90,
    shipping_fee: 0,
    gift_wrap_fee: 50.00,
    has_gift_wrap: true,
    gift_note: "Doğum günün kutlu olsun canım kardeşim!",
    delivery_type: "kargo",
    tracking_number: "TK-987654321",
    tracking_carrier: "Yurtiçi Kargo",
    admin_notes: "Koli içine hediye paketi yapıldı, koku kartı eklendi.",
    payment_status: "paid",
    payment_method: "credit_card",
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    shipping_address: {
      full_name: "Ahmet Yılmaz",
      phone: "0532 555 1234",
      province: "İstanbul",
      district: "Kadıköy",
      full_address: "Moda Cad. No:14 Daire:5",
      invoice_type: "individual",
      identity_number: "12345678901",
    },
    billing_address: {
      full_name: "Ahmet Yılmaz",
      phone: "0532 555 1234",
      province: "İstanbul",
      district: "Kadıköy",
      full_address: "Moda Cad. No:14 Daire:5",
      invoice_type: "individual",
      identity_number: "12345678901",
    },
    items: [
      {
        product_name: "316L Kararmaz Çelik İtalyan Ezme Yılan Zincir Kolye",
        variant_name: "18K Altın Kaplama",
        price: 279.00,
        quantity: 1,
        total: 279.00,
      },
      {
        product_name: "Işıklı ve Sesli Manyetik Uçan Fidget Spinner & Dron Küre",
        variant_name: "Kozmik Mavi",
        price: 349.00,
        quantity: 1,
        total: 349.00,
      }
    ]
  },
  {
    id: "ord-test-2",
    order_number: "OTN-2026-99231",
    guest_name: "Zeynep Kaya",
    guest_email: "zeynep@example.com",
    guest_phone: "0544 888 4321",
    status: "kargoya_verildi",
    total_amount: 649.00,
    shipping_fee: 0,
    gift_wrap_fee: 0,
    has_gift_wrap: false,
    delivery_type: "magaza_teslim",
    admin_notes: "Müşteri Tahtakale şubemizden teslim alacak.",
    payment_status: "paid",
    payment_method: "credit_card",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    shipping_address: {
      full_name: "Zeynep Kaya",
      phone: "0544 888 4321",
      province: "İstanbul",
      district: "Fatih (Eminönü/Tahtakale)",
      full_address: "Eminönü Tahtakale Mağaza Teslim",
      invoice_type: "individual",
    },
    billing_address: {
      full_name: "Zeynep Kaya",
      phone: "0544 888 4321",
      province: "İstanbul",
      district: "Fatih (Eminönü/Tahtakale)",
      full_address: "Eminönü Tahtakale Mağaza Teslim",
      invoice_type: "individual",
    },
    items: [
      {
        product_name: "Eminönü Tahtakale Özel Üretim El İşçiliği Mozaik Masa Lambası",
        variant_name: "Otantik Amber",
        price: 649.00,
        quantity: 1,
        total: 649.00,
      }
    ]
  }
];

let memoryReturns: ReturnRequest[] = [
  {
    id: "ret-1",
    order_id: "ord-test-1",
    order: memoryOrders[0],
    reason: "Beden/Ölçü Uygunsuzluğu",
    details: "Zincir boyunu 50cm olarak düşündüm ancak 45cm kısa geldi, 50cm modeli ile değişim rica ediyorum.",
    status: "talep_alindi",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  }
];

let memoryQuestions: Question[] = [
  {
    id: "q-1",
    product_id: "prod-jwl-1",
    user_name: "Buse T.",
    question_text: "Kolye havuzda ya da duşta kararma yapar mı, klor ve kimyasallara dayanıklı mıdır?",
    answer_text: "Merhaba Buse Hanım, ürünümüz 316L medikal çelikten üretilmiştir. Duşta, denizde ve günlük kullanımda kesinlikle kararma veya paslanma yapmaz. Güvenle kullanabilirsiniz.",
    is_approved: true,
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    answered_at: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: "q-2",
    product_id: "prod-toy-1",
    user_name: "Murat K.",
    question_text: "Uçan kürenin yedek pervanesi veya şarj aleti kutudan çıkıyor mu?",
    answer_text: "Merhaba Murat Bey, kutu içerisinde USB hızlı şarj kablosu ve Türkçe kullanım kılavuzu yer almaktadır. Pervaneler esnek koruyucu gövde içinde korumalıdır.",
    is_approved: true,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    answered_at: new Date(Date.now() - 3600000 * 20).toISOString(),
  }
];

let memoryReviews: Review[] = [
  {
    id: "rev-1",
    product_id: "prod-jwl-1",
    user_name: "Selin D.",
    rating: 5,
    comment: "Eminönü'nden daha önce de alışveriş yapmıştım, internetten sipariş verdim ertesi gün elime ulaştı. Kalitesi harika, altın gibi parlıyor ve hiç kararmadı!",
    is_approved: true,
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
  },
  {
    id: "rev-2",
    product_id: "prod-gft-1",
    user_name: "Caner Y.",
    rating: 5,
    comment: "Mozaik lamba inanılmaz otantik bir hava kattı salona. Paketleme çok özenliydi, camlar sapasağlam geldi. Teşekkürler Otantikos!",
    is_approved: true,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

let memoryChatSessions: LiveChatSession[] = [
  {
    id: "chat-1",
    session_id: "sess-12345",
    customer_name: "Emre Akın",
    customer_email: "emre@example.com",
    status: "active",
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 60000).toISOString(),
    messages: [
      {
        id: "msg-1",
        session_id: "sess-12345",
        sender_type: "customer",
        message_text: "Merhabalar, Tahtakale mağazanızdan bugün sipariş versem aynı gün elden teslim alabilir miyim?",
        created_at: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: "msg-2",
        session_id: "sess-12345",
        sender_type: "admin",
        message_text: "Merhaba Emre Bey! Evet, saat 17:00'ye kadar verilen Mağazadan Teslim (Click & Collect) siparişlerinizi aynı gün Eminönü mağazamızdan teslim alabilirsiniz.",
        created_at: new Date(Date.now() - 1500000).toISOString(),
      }
    ]
  }
];

let memoryWholesaleRequests: WholesaleRequest[] = [
  {
    id: "ws-1",
    company_name: "Anatolia Hediyelik Ltd. Şti.",
    contact_name: "Kemal Bey",
    email: "kemal@anatoliahediyelik.com",
    phone: "0533 111 2233",
    city: "İzmir",
    estimated_volume: "500 - 1.000 Adet / Ay",
    notes: "Çelik İtalyan ezme kolye ve mozaik lamba modelleriniz için toptan katalog ve fiyat teklifi istiyoruz.",
    status: "beklemede",
    created_at: new Date(Date.now() - 3600000 * 50).toISOString(),
  }
];

export const DataService = {
  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), variants:product_variants(*), specifications:product_specifications(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch {
      // Fallback
    }
    return memoryProducts;
  },

  async getAllAdminProducts(): Promise<Product[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*), images:product_images(*), variants:product_variants(*), specifications:product_specifications(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Product[];
      }
    } catch {
      // Fallback
    }
    return memoryProducts;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const products = await this.getProducts();
    const product = products.find((p) => p.slug === slug);
    return product || null;
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getAllAdminProducts();
    return products.find((p) => p.id === id) || null;
  },

  async saveProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const supabase = createClient();
      if (productData.id && productData.id.startsWith('prod-')) {
        // Local update
      } else if (productData.id) {
        await supabase.from('products').upsert(productData);
      }
    } catch {
      // Fallback
    }

    const existingIdx = memoryProducts.findIndex((p) => p.id === productData.id);
    if (existingIdx > -1) {
      memoryProducts[existingIdx] = {
        ...memoryProducts[existingIdx],
        ...productData,
        updated_at: new Date().toISOString(),
      } as Product;
      return memoryProducts[existingIdx];
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: productData.name || 'Yeni Ürün',
        slug: productData.slug || `yeni-urun-${Date.now()}`,
        description: productData.description || '',
        short_description: productData.short_description || '',
        price: productData.price || 0,
        stock: productData.stock || 0,
        sku: productData.sku || `SKU-${Date.now()}`,
        category_id: productData.category_id || null,
        category: memoryCategories.find(c => c.id === productData.category_id) || null,
        is_featured: productData.is_featured ?? false,
        is_new: productData.is_new ?? true,
        is_active: productData.is_active ?? true,
        rating: 5.0,
        review_count: 0,
        video_url: productData.video_url || null,
        images: productData.images || [],
        variants: productData.variants || [],
        specifications: productData.specifications || [],
        created_at: new Date().toISOString(),
      };
      memoryProducts.unshift(newProduct);
      return newProduct;
    }
  },

  async updateQuickStockAndPrice(productId: string, newStock: number, newPrice: number): Promise<boolean> {
    try {
      const supabase = createClient();
      await supabase
        .from('products')
        .update({ stock: newStock, price: newPrice, updated_at: new Date().toISOString() })
        .eq('id', productId);
    } catch {
      // Ignore
    }

    const idx = memoryProducts.findIndex((p) => p.id === productId);
    if (idx > -1) {
      memoryProducts[idx].stock = newStock;
      memoryProducts[idx].price = newPrice;
      memoryProducts[idx].updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      await supabase.from('products').delete().eq('id', productId);
    } catch {
      // Ignore
    }
    memoryProducts = memoryProducts.filter((p) => p.id !== productId);
    return true;
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data && data.length > 0) {
        return data as Category[];
      }
    } catch {
      // Fallback
    }
    return memoryCategories;
  },

  async saveCategory(cat: Partial<Category>): Promise<Category> {
    try {
      const supabase = createClient();
      if (cat.id && !cat.id.startsWith('cat-')) {
        await supabase.from('categories').upsert(cat);
      }
    } catch {
      // Fallback
    }

    const existingIdx = memoryCategories.findIndex((c) => c.id === cat.id);
    if (existingIdx > -1) {
      memoryCategories[existingIdx] = {
        ...memoryCategories[existingIdx],
        ...cat,
      } as Category;
      return memoryCategories[existingIdx];
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: cat.name || 'Yeni Kategori',
        slug: cat.slug || `kategori-${Date.now()}`,
        description: cat.description || '',
        image_url: cat.image_url || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
        display_order: cat.display_order ?? (memoryCategories.length + 1),
        is_active: cat.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      memoryCategories.push(newCat);
      return newCat;
    }
  },

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      await supabase.from('categories').delete().eq('id', categoryId);
    } catch {
      // Ignore
    }
    memoryCategories = memoryCategories.filter((c) => c.id !== categoryId);
    return true;
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data as Order[];
      }
    } catch {
      // Fallback
    }
    return memoryOrders;
  },

  async getOrderByNumber(orderNumber: string, email?: string): Promise<Order | null> {
    const orders = await this.getOrders();
    const cleanNumber = orderNumber.trim().toUpperCase();
    const order = orders.find((o) => {
      const numMatch = o.order_number.toUpperCase() === cleanNumber;
      if (!email) return numMatch;
      const emailMatch = 
        (o.guest_email && o.guest_email.toLowerCase() === email.trim().toLowerCase()) ||
        (o.shipping_address?.full_name?.toLowerCase().includes(email.trim().toLowerCase()));
      return numMatch && emailMatch;
    });
    return order || null;
  },

  async createOrder(order: Partial<Order>): Promise<Order> {
    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      order_number: order.order_number || `OTN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      user_id: order.user_id || null,
      guest_email: order.guest_email || null,
      guest_name: order.guest_name || null,
      guest_phone: order.guest_phone || null,
      status: 'siparis_alindi',
      total_amount: order.total_amount || 0,
      shipping_fee: order.shipping_fee || 0,
      gift_wrap_fee: order.gift_wrap_fee || 0,
      has_gift_wrap: order.has_gift_wrap || false,
      gift_note: order.gift_note || null,
      delivery_type: order.delivery_type || 'kargo',
      shipping_address: order.shipping_address!,
      billing_address: order.billing_address!,
      tracking_number: null,
      tracking_carrier: null,
      admin_notes: null,
      payment_status: 'paid',
      payment_method: 'credit_card',
      created_at: new Date().toISOString(),
      items: order.items || [],
    };

    try {
      const supabase = createClient();
      await supabase.from('orders').insert({
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
      });
    } catch {
      // Fallback
    }

    // Deduct stock for products & variants
    newOrder.items?.forEach((item) => {
      const prod = memoryProducts.find((p) => p.id === item.product_id || p.name === item.product_name);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
        if (item.variant_name && prod.variants) {
          const v = prod.variants.find((vr) => vr.value === item.variant_name);
          if (v) {
            v.stock = Math.max(0, v.stock - item.quantity);
          }
        }
      }
    });

    memoryOrders.unshift(newOrder);
    return newOrder;
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
      await supabase
        .from('orders')
        .update({
          status,
          tracking_number: trackingNumber,
          tracking_carrier: trackingCarrier,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    } catch {
      // Ignore
    }

    const order = memoryOrders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      if (trackingNumber !== undefined) order.tracking_number = trackingNumber;
      if (trackingCarrier !== undefined) order.tracking_carrier = trackingCarrier;
      if (adminNotes !== undefined) order.admin_notes = adminNotes;
      order.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  // RETURNS (RMA)
  async getReturns(): Promise<ReturnRequest[]> {
    return memoryReturns;
  },

  async createReturn(req: Partial<ReturnRequest>): Promise<ReturnRequest> {
    const newReturn: ReturnRequest = {
      id: `ret-${Date.now()}`,
      order_id: req.order_id!,
      user_id: req.user_id || null,
      reason: req.reason || 'Diğer',
      details: req.details || '',
      status: 'talep_alindi',
      created_at: new Date().toISOString(),
      order: memoryOrders.find((o) => o.id === req.order_id),
    };
    memoryReturns.unshift(newReturn);
    return newReturn;
  },

  async updateReturnStatus(returnId: string, status: ReturnRequest['status'], adminResponse?: string): Promise<boolean> {
    const ret = memoryReturns.find((r) => r.id === returnId);
    if (ret) {
      ret.status = status;
      if (adminResponse !== undefined) ret.admin_response = adminResponse;
      ret.updated_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  // QUESTIONS (Q&A)
  async getQuestions(productId?: string): Promise<Question[]> {
    if (productId) {
      return memoryQuestions.filter((q) => q.product_id === productId && q.is_approved);
    }
    return memoryQuestions;
  },

  async addQuestion(productId: string, userName: string, userEmail: string, questionText: string): Promise<Question> {
    const newQ: Question = {
      id: `q-${Date.now()}`,
      product_id: productId,
      user_name: userName,
      user_email: userEmail,
      question_text: questionText,
      is_approved: false, // Must be approved by admin
      created_at: new Date().toISOString(),
    };
    memoryQuestions.unshift(newQ);
    return newQ;
  },

  async answerAndApproveQuestion(questionId: string, answerText: string, isApproved = true): Promise<boolean> {
    const q = memoryQuestions.find((item) => item.id === questionId);
    if (q) {
      q.answer_text = answerText;
      q.is_approved = isApproved;
      q.answered_at = new Date().toISOString();
      return true;
    }
    return false;
  },

  // REVIEWS
  async getReviews(productId?: string): Promise<Review[]> {
    if (productId) {
      return memoryReviews.filter((r) => r.product_id === productId && r.is_approved);
    }
    return memoryReviews;
  },

  async addReview(productId: string, userName: string, rating: number, comment: string): Promise<Review> {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      product_id: productId,
      user_name: userName,
      rating,
      comment,
      is_approved: true, // Default public or moderated
      created_at: new Date().toISOString(),
    };
    memoryReviews.unshift(newRev);
    return newRev;
  },

  async moderateReview(reviewId: string, isApproved: boolean): Promise<boolean> {
    const r = memoryReviews.find((item) => item.id === reviewId);
    if (r) {
      r.is_approved = isApproved;
      return true;
    }
    return false;
  },

  // LIVE CHAT
  async getChatSessions(): Promise<LiveChatSession[]> {
    return memoryChatSessions;
  },

  async getChatSession(sessionId: string): Promise<LiveChatSession | null> {
    return memoryChatSessions.find((s) => s.session_id === sessionId) || null;
  },

  async sendMessage(sessionId: string, senderType: 'customer' | 'admin', messageText: string, customerName?: string, customerEmail?: string): Promise<LiveChatMessage> {
    let session = memoryChatSessions.find((s) => s.session_id === sessionId);
    if (!session) {
      session = {
        id: `chat-${Date.now()}`,
        session_id: sessionId,
        customer_name: customerName || 'Ziyaretçi',
        customer_email: customerEmail || null,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: [],
      };
      memoryChatSessions.unshift(session);
    }

    const newMsg: LiveChatMessage = {
      id: `msg-${Date.now()}`,
      session_id: sessionId,
      sender_type: senderType,
      message_text: messageText,
      created_at: new Date().toISOString(),
    };

    session.messages = session.messages || [];
    session.messages.push(newMsg);
    session.last_message = newMsg;
    session.updated_at = new Date().toISOString();

    return newMsg;
  },

  // WHOLESALE
  async getWholesaleRequests(): Promise<WholesaleRequest[]> {
    return memoryWholesaleRequests;
  },

  async addWholesaleRequest(req: Omit<WholesaleRequest, 'id' | 'status' | 'created_at'>): Promise<WholesaleRequest> {
    const newReq: WholesaleRequest = {
      ...req,
      id: `ws-${Date.now()}`,
      status: 'beklemede',
      created_at: new Date().toISOString(),
    };
    memoryWholesaleRequests.unshift(newReq);
    return newReq;
  }
};
