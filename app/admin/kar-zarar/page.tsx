'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Calendar, 
  Trash2, 
  Download, 
  Printer, 
  RefreshCw, 
  Store, 
  Sparkles, 
  Globe, 
  Package, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle,
  X,
  CreditCard,
  FileText,
  Boxes,
  HelpCircle,
  Percent,
  ReceiptText,
  Tag
} from 'lucide-react';
import { Product, Order, AccountingTransaction, SaleChannel, ProfitSummary, ProductProfitStat } from '@/lib/types/ecommerce';
import { DataService, normalizeTurkish } from '@/lib/data/store-data';
import { actionSaveAccountingTransaction, actionDeleteAccountingTransaction } from '@/app/actions/ecommerce-actions';
import { formatPrice, formatDate } from '@/lib/utils/format';
import { toast } from 'sonner';

type DatePreset = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';
type ActiveTab = 'ledger' | 'product_profit';

export default function KarZararPage() {
  const [transactions, setTransactions] = useState<AccountingTransaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profitStats, setProfitStats] = useState<ProductProfitStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [activeTab, setActiveTab] = useState<ActiveTab>('ledger');
  const [datePreset, setDatePreset] = useState<DatePreset>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form States - SATIŞ GİRİŞİ (Satış Formu)
  const [saleForm, setSaleForm] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0, // Satış Fiyatı
    unitCost: 0, // Alış Maliyeti
    customerName: '', // Zorunlu
    customerPhone: '', // Zorunlu
    saleChannel: 'magaza' as SaleChannel, // Zorunlu: magaza, toptan, website
    paymentMethod: 'nakit',
    documentNo: '',
    notes: '',
    transactionDate: new Date().toISOString().split('T')[0], // Zorunlu
    updateStock: true,
  });

  // Form States - ALIŞ GİRİŞİ (Mal Alımı / Tedarik Formu - Zorunlu Olmayan Esnek Alanlar)
  const [purchaseForm, setPurchaseForm] = useState({
    productId: '',
    productName: '',
    quantity: 10,
    unitPrice: 0, // Birim Alış Fiyatı
    totalPriceInput: '', // Opsiyonel toplam fiyat girildiğinde otomatik birim hesaplama
    supplierName: '', // Opsiyonel
    paymentMethod: 'nakit',
    documentNo: '',
    notes: '',
    transactionDate: new Date().toISOString().split('T')[0],
    updateStock: true,
    updateProductCostPrice: true,
  });

  // Form States - GİDER GİRİŞİ
  const [expenseForm, setExpenseForm] = useState({
    expenseTitle: '',
    amount: 0,
    category: 'genel',
    paymentMethod: 'nakit',
    documentNo: '',
    notes: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  // Load Initial Data
  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [txList, pList, oList, stats] = await Promise.all([
        DataService.getAccountingTransactions(),
        DataService.getAllAdminProducts(),
        DataService.getOrders(),
        DataService.getProductProfitStats(),
      ]);
      setTransactions(txList);
      setProducts(pList);
      setOrders(oList);
      setProfitStats(stats);
    } catch (err) {
      console.error('Data load error:', err);
      toast.error('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Compute Active Date Range
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    if (datePreset === 'today') {
      return { startDate: todayStr, endDate: todayStr };
    }
    if (datePreset === 'week') {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      const sy = start.getFullYear();
      const sm = String(start.getMonth() + 1).padStart(2, '0');
      const sd = String(start.getDate()).padStart(2, '0');
      return { startDate: `${sy}-${sm}-${sd}`, endDate: todayStr };
    }
    if (datePreset === 'month') {
      return { startDate: `${y}-${m}-01`, endDate: todayStr };
    }
    if (datePreset === 'year') {
      return { startDate: `${y}-01-01`, endDate: todayStr };
    }
    if (datePreset === 'custom') {
      return { startDate: customStartDate || '', endDate: customEndDate || '' };
    }
    return { startDate: '', endDate: '' };
  }, [datePreset, customStartDate, customEndDate]);

  // Combined Live Filtered Summary (Calculated on the fly)
  const summary: ProfitSummary = useMemo(() => {
    let totalRevenue = 0;
    let totalCost = 0;
    let totalExpenses = 0;
    let totalSalesCount = 0;
    let totalPurchasesCount = 0;
    const salesByChannel = { magaza: 0, toptan: 0, website: 0 };

    const isDateMatch = (dateStr: string) => {
      if (!dateStr) return true;
      const d = dateStr.split('T')[0];
      if (startDate && d < startDate) return false;
      if (endDate && d > endDate) return false;
      return true;
    };

    // 1. Transactions (Manual Sales, Purchases, Expenses)
    transactions.forEach((tx) => {
      if (!isDateMatch(tx.transaction_date)) return;

      if (tx.type === 'sale') {
        if (channelFilter !== 'all' && tx.sale_channel !== channelFilter) return;

        totalRevenue += tx.total_amount;
        totalCost += (tx.total_cost || (tx.unit_cost ? tx.unit_cost * tx.quantity : 0));
        totalSalesCount++;

        const ch = (tx.sale_channel || 'magaza') as 'magaza' | 'toptan' | 'website';
        if (salesByChannel[ch] !== undefined) {
          salesByChannel[ch] += tx.total_amount;
        }
      } else if (tx.type === 'purchase') {
        if (channelFilter === 'all') {
          totalPurchasesCount++;
        }
      } else if (tx.type === 'expense') {
        if (channelFilter === 'all') {
          totalExpenses += tx.total_amount;
        }
      }
    });

    // 2. Web Orders (Paid online orders from website)
    if (channelFilter === 'all' || channelFilter === 'website') {
      // Build fast product cost map
      const costMap = new Map<string, number>();
      products.forEach((p) => {
        costMap.set(p.id, Number(p.cost_price) || 0);
        costMap.set(p.name.toLowerCase().trim(), Number(p.cost_price) || 0);
      });

      orders.forEach((o) => {
        if (o.payment_status === 'paid' && isDateMatch(o.created_at)) {
          totalRevenue += o.total_amount;
          salesByChannel.website += o.total_amount;
          totalSalesCount++;

          if (Array.isArray(o.items)) {
            o.items.forEach((item) => {
              const uCost = (item.product_id ? costMap.get(item.product_id) : undefined) ||
                costMap.get(item.product_name.toLowerCase().trim()) || 0;
              totalCost += uCost * item.quantity;
            });
          }
        }
      });
    }

    const netProfit = totalRevenue - totalCost - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCost,
      totalExpenses,
      netProfit,
      profitMargin: Math.round(profitMargin * 10) / 10,
      totalSalesCount,
      totalPurchasesCount,
      salesByChannel,
    };
  }, [transactions, orders, products, startDate, endDate, channelFilter]);

  // Filtered Ledger List
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Date filter
      if (startDate && tx.transaction_date < startDate) return false;
      if (endDate && tx.transaction_date > endDate) return false;

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Channel filter
      if (channelFilter !== 'all') {
        if (tx.type === 'sale' && tx.sale_channel !== channelFilter) return false;
        if (tx.type !== 'sale' && channelFilter !== 'all') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = normalizeTurkish(searchQuery);
        const matchName = normalizeTurkish(tx.product_name).includes(q);
        const matchCustomer = tx.customer_name ? normalizeTurkish(tx.customer_name).includes(q) : false;
        const matchPhone = tx.customer_phone ? tx.customer_phone.includes(q) : false;
        const matchSupplier = tx.supplier_name ? normalizeTurkish(tx.supplier_name).includes(q) : false;
        const matchDoc = tx.document_no ? normalizeTurkish(tx.document_no).includes(q) : false;
        if (!matchName && !matchCustomer && !matchPhone && !matchSupplier && !matchDoc) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, startDate, endDate, typeFilter, channelFilter, searchQuery]);

  // Select Product in Sale Form -> Auto populate sale price and unit cost
  const handleSelectProductInSale = (productId: string) => {
    if (!productId) {
      setSaleForm((prev) => ({ ...prev, productId: '', productName: '', unitPrice: 0, unitCost: 0 }));
      return;
    }
    const found = products.find((p) => p.id === productId);
    if (found) {
      // If toptan channel selected, use wholesale_price if present
      const defaultPrice = saleForm.saleChannel === 'toptan' && found.wholesale_price 
        ? found.wholesale_price 
        : found.price;

      setSaleForm((prev) => ({
        ...prev,
        productId: found.id,
        productName: found.name,
        unitPrice: defaultPrice || 0,
        unitCost: Number(found.cost_price) || 0,
      }));
    }
  };

  // Select Product in Purchase Form -> Auto populate current product name and cost
  const handleSelectProductInPurchase = (productId: string) => {
    if (!productId) {
      setPurchaseForm((prev) => ({ ...prev, productId: '', productName: '', unitPrice: 0 }));
      return;
    }
    const found = products.find((p) => p.id === productId);
    if (found) {
      setPurchaseForm((prev) => ({
        ...prev,
        productId: found.id,
        productName: found.name,
        unitPrice: Number(found.cost_price) || 0,
      }));
    }
  };

  // Calculate live profit preview for Sale Modal
  const saleModalCalculated = useMemo(() => {
    const qty = Math.max(1, Number(saleForm.quantity) || 1);
    const uPrice = Number(saleForm.unitPrice) || 0;
    const uCost = Number(saleForm.unitCost) || 0;
    const totalRev = qty * uPrice;
    const totalCst = qty * uCost;
    const profit = totalRev - totalCst;
    const margin = totalRev > 0 ? (profit / totalRev) * 100 : 0;
    return {
      qty,
      uPrice,
      uCost,
      totalRev,
      totalCst,
      profit,
      margin: Math.round(margin * 10) / 10,
    };
  }, [saleForm.quantity, saleForm.unitPrice, saleForm.unitCost]);

  // Handle Submit Sale
  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();

    // Required Validations as explicitly requested by user:
    if (!saleForm.customerName.trim()) {
      toast.error('Lütfen Müşteri Adını giriniz (Zorunlu alan).');
      return;
    }
    if (!saleForm.customerPhone.trim()) {
      toast.error('Lütfen Müşteri Telefon Numarasını giriniz (Zorunlu alan).');
      return;
    }
    if (!saleForm.saleChannel) {
      toast.error('Lütfen Satış Kanalını seçiniz (Mağaza, Toptan veya Website).');
      return;
    }
    if (!saleForm.transactionDate) {
      toast.error('Lütfen Satış Tarihini seçiniz.');
      return;
    }
    if (!saleForm.productName.trim()) {
      toast.error('Lütfen satılan ürün adını giriniz veya listeden seçiniz.');
      return;
    }
    if (saleForm.quantity <= 0) {
      toast.error('Satış adedi en az 1 olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await actionSaveAccountingTransaction({
        type: 'sale',
        product_id: saleForm.productId || null,
        product_name: saleForm.productName.trim(),
        quantity: Number(saleForm.quantity),
        unit_price: Number(saleForm.unitPrice),
        total_amount: saleModalCalculated.totalRev,
        unit_cost: Number(saleForm.unitCost),
        total_cost: saleModalCalculated.totalCst,
        net_profit: saleModalCalculated.profit,
        customer_name: saleForm.customerName.trim(),
        customer_phone: saleForm.customerPhone.trim(),
        sale_channel: saleForm.saleChannel,
        payment_method: saleForm.paymentMethod,
        document_no: saleForm.documentNo.trim() || null,
        notes: saleForm.notes.trim() || null,
        transaction_date: saleForm.transactionDate,
        update_stock: saleForm.updateStock,
      });

      if (res.success) {
        toast.success(`Satış başarıyla kaydedildi! Net Kâr: ${formatPrice(saleModalCalculated.profit)}`);
        setIsSaleModalOpen(false);
        // Reset form
        setSaleForm({
          productId: '',
          productName: '',
          quantity: 1,
          unitPrice: 0,
          unitCost: 0,
          customerName: '',
          customerPhone: '',
          saleChannel: 'magaza',
          paymentMethod: 'nakit',
          documentNo: '',
          notes: '',
          transactionDate: new Date().toISOString().split('T')[0],
          updateStock: true,
        });
        loadAllData();
      } else {
        toast.error(res.error || 'Satış kaydedilemedi.');
      }
    } catch {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit Purchase
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!purchaseForm.productName.trim()) {
      toast.error('Lütfen alınan ürün veya malzeme adını belirtiniz.');
      return;
    }
    const qty = Math.max(1, Number(purchaseForm.quantity) || 1);
    
    // Auto calculate unit price if user typed total purchase price
    let finalUnitPrice = Number(purchaseForm.unitPrice) || 0;
    if (purchaseForm.totalPriceInput && Number(purchaseForm.totalPriceInput) > 0) {
      finalUnitPrice = Number(purchaseForm.totalPriceInput) / qty;
    }

    const totalAmount = qty * finalUnitPrice;

    setIsSubmitting(true);
    try {
      const res = await actionSaveAccountingTransaction({
        type: 'purchase',
        product_id: purchaseForm.productId || null,
        product_name: purchaseForm.productName.trim(),
        quantity: qty,
        unit_price: finalUnitPrice,
        total_amount: totalAmount,
        supplier_name: purchaseForm.supplierName.trim() || null, // Opsiyonel
        payment_method: purchaseForm.paymentMethod || 'nakit', // Opsiyonel
        document_no: purchaseForm.documentNo.trim() || null, // Opsiyonel
        notes: purchaseForm.notes.trim() || null,
        transaction_date: purchaseForm.transactionDate || new Date().toISOString().split('T')[0],
        update_stock: purchaseForm.updateStock,
      });

      if (res.success) {
        toast.success(`Alış / Mal alımı kaydedildi! Toplam Tutar: ${formatPrice(totalAmount)} (Birim: ${formatPrice(finalUnitPrice)})`);
        setIsPurchaseModalOpen(false);
        // Reset form
        setPurchaseForm({
          productId: '',
          productName: '',
          quantity: 10,
          unitPrice: 0,
          totalPriceInput: '',
          supplierName: '',
          paymentMethod: 'nakit',
          documentNo: '',
          notes: '',
          transactionDate: new Date().toISOString().split('T')[0],
          updateStock: true,
          updateProductCostPrice: true,
        });
        loadAllData();
      } else {
        toast.error(res.error || 'Alış kaydedilemedi.');
      }
    } catch {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Submit Expense
  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.expenseTitle.trim()) {
      toast.error('Lütfen gider açıklamasını giriniz.');
      return;
    }
    const amt = Number(expenseForm.amount) || 0;
    if (amt <= 0) {
      toast.error('Gider tutarı 0 TL den büyük olmalıdır.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await actionSaveAccountingTransaction({
        type: 'expense',
        product_name: `[Gider] ${expenseForm.expenseTitle.trim()}`,
        quantity: 1,
        unit_price: amt,
        total_amount: amt,
        payment_method: expenseForm.paymentMethod,
        document_no: expenseForm.documentNo.trim() || null,
        notes: expenseForm.notes.trim() || null,
        transaction_date: expenseForm.transactionDate,
      });

      if (res.success) {
        toast.success(`Gider başarıyla kaydedildi: ${formatPrice(amt)}`);
        setIsExpenseModalOpen(false);
        setExpenseForm({
          expenseTitle: '',
          amount: 0,
          category: 'genel',
          paymentMethod: 'nakit',
          documentNo: '',
          notes: '',
          transactionDate: new Date().toISOString().split('T')[0],
        });
        loadAllData();
      } else {
        toast.error(res.error || 'Gider kaydedilemedi.');
      }
    } catch {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await actionDeleteAccountingTransaction(id);
      if (res.success) {
        toast.success('İşlem silindi.');
        setDeleteConfirmId(null);
        loadAllData();
      } else {
        toast.error(res.error || 'İşlem silinemedi.');
      }
    } catch {
      toast.error('Silme sırasında hata oluştu.');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Dışa aktarılacak kayıt bulunamadı.');
      return;
    }

    const headers = ['Tarih', 'İşlem Türü', 'Kalem / Ürün Adı', 'Kanal', 'Müşteri / Tedarikçi', 'Telefon', 'Adet', 'Birim Fiyat', 'Toplam Tutar', 'Birim Maliyet', 'Net Kâr', 'Ödeme Tipi', 'Belge No', 'Notlar'];
    const rows = filteredTransactions.map((tx) => [
      tx.transaction_date,
      tx.type === 'sale' ? 'Satış' : tx.type === 'purchase' ? 'Alış (Mal Alımı)' : 'Gider',
      `"${(tx.product_name || '').replace(/"/g, '""')}"`,
      tx.sale_channel || '-',
      `"${(tx.customer_name || tx.supplier_name || '').replace(/"/g, '""')}"`,
      `"${tx.customer_phone || ''}"`,
      tx.quantity,
      tx.unit_price,
      tx.total_amount,
      tx.unit_cost || 0,
      tx.net_profit || 0,
      tx.payment_method || '',
      `"${tx.document_no || ''}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `otantikos-muhasebe-raporu-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Muhasebe raporu CSV olarak indirildi.');
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER & ACTION BUTTONS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-900">
              <Calculator className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
              Kâr / Zarar & Alış - Satış Muhasebe Merkezi
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Eminönü Tahtakale dükkan, toptan ve e-ticaret satış gelirleri, mal alımları ve net kâr analiz masası.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsSaleModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Satış Girişi Yap</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPurchaseModalOpen(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <Boxes className="w-4 h-4" />
            <span>+ Alış (Mal Alımı) Gir</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpenseModalOpen(true)}
            className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-900 active:scale-95 text-stone-200 text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <ReceiptText className="w-4 h-4 text-stone-400" />
            <span>+ Gider Ekle</span>
          </button>

          <button
            type="button"
            onClick={loadAllData}
            title="Verileri Yenile"
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* EXECUTIVE FINANCIAL KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. TOPLAM GELİR (CİRO) */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Toplam Satış Geliri</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {formatPrice(summary.totalRevenue)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-medium">
              <span>{summary.totalSalesCount} Satış İşlemi</span>
              <span>•</span>
              <span className="text-blue-700 font-bold">Web + Dükkan + Toptan</span>
            </div>
          </div>
        </div>

        {/* 2. TOPLAM SATILAN MALIN MALİYETİ (ALIŞ) */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Satılan Mal Maliyeti</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-stone-800 tracking-tight">
              {formatPrice(summary.totalCost)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-medium">
              <span>Tedarik / Alış Masrafı</span>
              {summary.totalExpenses > 0 && (
                <span className="text-rose-600 font-bold">+{formatPrice(summary.totalExpenses)} Ek Gider</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. NET KÂR */}
        <div className={`p-5 rounded-3xl border shadow-xs relative overflow-hidden flex flex-col justify-between ${
          summary.netProfit >= 0 
            ? 'bg-emerald-950 text-white border-emerald-900' 
            : 'bg-rose-950 text-white border-rose-900'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
              {summary.netProfit >= 0 ? 'Net Kâr Durumu' : 'Net Zarar Durumu'}
            </span>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
              summary.netProfit >= 0 ? 'bg-emerald-800 text-emerald-200' : 'bg-rose-800 text-rose-200'
            }`}>
              {summary.netProfit >= 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black tracking-tight">
              {summary.netProfit >= 0 ? `+${formatPrice(summary.netProfit)}` : formatPrice(summary.netProfit)}
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-emerald-200/80 font-medium">
              <span>(Gelir - Alış Maliyeti - Giderler)</span>
            </div>
          </div>
        </div>

        {/* 4. KÂR MARJI % */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Net Kâr Marjı</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              %{summary.profitMargin}
            </div>
            <div className="w-full bg-stone-100 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.profitMargin >= 40 ? 'bg-emerald-600' : summary.profitMargin >= 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, summary.profitMargin))}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* CHANNEL BREAKDOWN BADGES */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="font-bold text-stone-700 flex items-center gap-2">
          <span>Kanal Dağılımı:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            <Store className="w-3.5 h-3.5 text-amber-700" />
            <span>Mağaza / Dükkan:</span>
            <strong className="font-black">{formatPrice(summary.salesByChannel.magaza)}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            <span>Toptan Satış:</span>
            <strong className="font-black">{formatPrice(summary.salesByChannel.toptan)}</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
            <Globe className="w-3.5 h-3.5 text-blue-700" />
            <span>E-Ticaret (Website):</span>
            <strong className="font-black">{formatPrice(summary.salesByChannel.website)}</strong>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & FILTER BAR */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4 print:hidden">
        
        {/* Main Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'ledger'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>İşlem Defteri (Tüm Alış & Satışlar)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-700 text-white">
                {filteredTransactions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('product_profit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'product_profit'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Ürün Bazlı Kârlılık Sıralaması</span>
            </button>
          </div>

          {/* Export & Print */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Excel / CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Yazdır</span>
            </button>
          </div>
        </div>

        {/* Date Filter Presets & Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-400 font-semibold mr-1">Dönem:</span>
            {(
              [
                { key: 'today', label: 'Bugün' },
                { key: 'week', label: 'Son 7 Gün' },
                { key: 'month', label: 'Bu Ay' },
                { key: 'year', label: 'Bu Yıl' },
                { key: 'all', label: 'Tüm Zamanlar' },
                { key: 'custom', label: 'Özel Tarih' },
              ] as const
            ).map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setDatePreset(p.key)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  datePreset === p.key
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 animate-in fade-in">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
              <span className="text-stone-400">-</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="p-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
              />
            </div>
          )}

          {/* Channel & Type Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
            >
              <option value="all">Tüm Satış Kanalları</option>
              <option value="magaza">Mağaza / Dükkan Satışı</option>
              <option value="toptan">Toptan Satış</option>
              <option value="website">E-Ticaret (Website)</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none"
            >
              <option value="all">Tüm İşlem Türleri</option>
              <option value="sale">Sadece Satışlar</option>
              <option value="purchase">Sadece Alışlar (Mal Alımı)</option>
              <option value="expense">Sadece Giderler</option>
            </select>
          </div>

        </div>

        {/* Search Input for Ledger */}
        {activeTab === 'ledger' && (
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ürün adı, müşteri adı, telefon numarası veya belge no ile filtreleyin..."
              className="w-full text-xs p-3 pl-10 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:border-amber-600 transition"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          </div>
        )}

      </div>

      {/* TAB 1: İŞLEM DEFTERİ (TRANSACTIONS LEDGER) */}
      {activeTab === 'ledger' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Tür & Kanal</th>
                  <th className="p-4">Ürün / Kalem</th>
                  <th className="p-4">Müşteri / Tedarikçi</th>
                  <th className="p-4 text-right">Adet</th>
                  <th className="p-4 text-right">Birim Fiyat</th>
                  <th className="p-4 text-right">Toplam Tutar</th>
                  <th className="p-4 text-right">Alış Maliyeti</th>
                  <th className="p-4 text-right">Net Kâr</th>
                  <th className="p-4 text-center print:hidden">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-stone-400">
                      <ReceiptText className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                      <p className="font-semibold text-stone-600">Bu filtrelere uygun işlem kaydı bulunamadı.</p>
                      <p className="text-[11px] mt-1 text-stone-400">Yukarıdaki butonlardan yeni Satış veya Alış girişi yapabilirsiniz.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isSale = tx.type === 'sale';
                    const isPurchase = tx.type === 'purchase';
                    const isExpense = tx.type === 'expense';

                    return (
                      <tr key={tx.id} className="hover:bg-stone-50/70 transition">
                        
                        {/* Tarih */}
                        <td className="p-4 whitespace-nowrap font-medium text-stone-600">
                          {formatDate(tx.transaction_date)}
                        </td>

                        {/* Tür & Kanal */}
                        <td className="p-4 whitespace-nowrap">
                          {isSale ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Satış</span>
                              <span className="text-[9px] uppercase px-1 rounded bg-emerald-200/60 font-black">
                                {tx.sale_channel === 'toptan' ? 'Toptan' : tx.sale_channel === 'website' ? 'Web' : 'Dükkan'}
                              </span>
                            </span>
                          ) : isPurchase ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Boxes className="w-3 h-3" />
                              <span>Mal Alımı</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <ArrowDownRight className="w-3 h-3" />
                              <span>Gider</span>
                            </span>
                          )}
                        </td>

                        {/* Ürün Adı */}
                        <td className="p-4 font-bold text-stone-900">
                          <div>{tx.product_name}</div>
                          {tx.notes && <div className="text-[10px] text-stone-400 font-normal italic mt-0.5">{tx.notes}</div>}
                        </td>

                        {/* Müşteri / Tedarikçi */}
                        <td className="p-4">
                          {isSale ? (
                            <div>
                              <div className="font-bold text-stone-900">{tx.customer_name || 'İsimsiz Müşteri'}</div>
                              {tx.customer_phone && (
                                <div className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3" />
                                  <span>{tx.customer_phone}</span>
                                </div>
                              )}
                            </div>
                          ) : isPurchase ? (
                            <div className="text-stone-600 font-medium">
                              {tx.supplier_name || 'Tahtakale / Toptancı'}
                            </div>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>

                        {/* Adet */}
                        <td className="p-4 text-right font-bold text-stone-800">
                          {tx.quantity} adet
                        </td>

                        {/* Birim Fiyat */}
                        <td className="p-4 text-right font-medium text-stone-600">
                          {formatPrice(tx.unit_price)}
                        </td>

                        {/* Toplam Tutar */}
                        <td className="p-4 text-right font-black text-stone-900">
                          {formatPrice(tx.total_amount)}
                        </td>

                        {/* Alış Maliyeti */}
                        <td className="p-4 text-right font-medium text-stone-500">
                          {isSale ? (
                            tx.total_cost ? formatPrice(tx.total_cost) : <span className="text-stone-400">0 TL</span>
                          ) : (
                            <span className="text-stone-400">-</span>
                          )}
                        </td>

                        {/* Net Kâr */}
                        <td className="p-4 text-right font-black whitespace-nowrap">
                          {isSale ? (
                            <span className={Number(tx.net_profit) >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                              {Number(tx.net_profit) >= 0 ? `+${formatPrice(tx.net_profit || 0)}` : formatPrice(tx.net_profit || 0)}
                            </span>
                          ) : (
                            <span className="text-rose-600 font-semibold">
                              -{formatPrice(tx.total_amount)}
                            </span>
                          )}
                        </td>

                        {/* Aksiyon */}
                        <td className="p-4 text-center whitespace-nowrap print:hidden">
                          {deleteConfirmId === tx.id ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDeleteTransaction(tx.id)}
                                className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold"
                              >
                                Evet, Sil
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-stone-200 text-stone-700 rounded-lg text-[10px] font-bold"
                              >
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(tx.id)}
                              title="Kaydı Sil"
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer stats */}
          <div className="p-4 bg-stone-50/50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
            <div>
              Gösterilen: <strong className="text-stone-900">{filteredTransactions.length}</strong> / Toplam: <strong className="text-stone-900">{transactions.length}</strong> işlem
            </div>
            <div className="font-bold text-stone-800">
              Dönem Net Kârı: <span className={summary.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}>{formatPrice(summary.netProfit)}</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: ÜRÜN BAZLI KÂRLILIK ANALİZİ TABLOSU */}
      {activeTab === 'product_profit' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-stone-900">Ürün Kârlılık & Performans Sıralaması</h3>
              <p className="text-xs text-stone-500">Hangi ürünün ne kadar ciro, maliyet ve net kâr sağladığının analizi.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-3.5">Ürün Adı</th>
                  <th className="p-3.5 text-right">Alış (Maliyet)</th>
                  <th className="p-3.5 text-right">Satış Fiyatı</th>
                  <th className="p-3.5 text-right">Toplam Satılan</th>
                  <th className="p-3.5 text-right">Mevcut Stok</th>
                  <th className="p-3.5 text-right">Toplam Satış Geliri</th>
                  <th className="p-3.5 text-right">Toplam Maliyet</th>
                  <th className="p-3.5 text-right">Net Kâr Katkısı</th>
                  <th className="p-3.5 text-right">Kâr Marjı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {profitStats.map((stat, idx) => (
                  <tr key={stat.productId || idx} className="hover:bg-stone-50/70 transition">
                    <td className="p-3.5 font-bold text-stone-900">
                      {stat.productName}
                    </td>
                    <td className="p-3.5 text-right font-medium text-stone-600">
                      {formatPrice(stat.unitCostPrice)}
                    </td>
                    <td className="p-3.5 text-right font-medium text-stone-600">
                      {formatPrice(stat.unitSalePrice)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-stone-800">
                      {stat.totalSoldQuantity} adet
                    </td>
                    <td className="p-3.5 text-right">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        stat.currentStock <= 5 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-800'
                      }`}>
                        {stat.currentStock} adet
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-stone-900">
                      {formatPrice(stat.totalRevenue)}
                    </td>
                    <td className="p-3.5 text-right font-medium text-stone-500">
                      {formatPrice(stat.totalCost)}
                    </td>
                    <td className="p-3.5 text-right font-black text-emerald-700">
                      +{formatPrice(stat.netProfit)}
                    </td>
                    <td className="p-3.5 text-right font-bold text-stone-900">
                      %{stat.profitMargin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: SATIŞ GİRİŞİ (ZORUNLU ALANLAR DAHİL) */}
      {/* ========================================================= */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-900 font-bold">
                  <PlusCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">Yeni Satış Kaydı</h3>
                  <p className="text-[11px] text-stone-500">Dükkan, toptan veya elden yapılan satışı sisteme işleyin.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSaleModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="space-y-4 text-xs">
              
              {/* 1. MÜŞTERİ BİLGİLERİ (ZORUNLU) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
                <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">
                  Müşteri Bilgileri *(Zorunlu Alanlar)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Müşteri Adı Soyadı *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={saleForm.customerName}
                        onChange={(e) => setSaleForm((prev) => ({ ...prev, customerName: e.target.value }))}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full p-2.5 pl-8 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 font-semibold"
                      />
                      <User className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Telefon Numarası *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={saleForm.customerPhone}
                        onChange={(e) => setSaleForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                        placeholder="0532 123 45 67"
                        className="w-full p-2.5 pl-8 bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-amber-600 text-stone-900 font-semibold"
                      />
                      <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-3" />
                    </div>
                  </div>
                </div>

                {/* Satış Kanalı (Zorunlu) */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Satış Kanalı *(Zorunlu)</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'magaza', label: 'Mağazadan (Dükkan)', icon: Store },
                      { key: 'toptan', label: 'Toptan Satış', icon: Sparkles },
                      { key: 'website', label: 'Websitesi / İnternet', icon: Globe },
                    ].map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setSaleForm((prev) => ({ ...prev, saleChannel: c.key as SaleChannel }))}
                        className={`p-2 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                          saleForm.saleChannel === c.key
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                        }`}
                      >
                        <c.icon className="w-4 h-4" />
                        <span className="text-[10px]">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. ÜRÜN SEÇİMİ & FİYAT BİLGİLERİ */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Katalogdan Ürün Seçin veya Yazın *</label>
                  <select
                    value={saleForm.productId}
                    onChange={(e) => handleSelectProductInSale(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  >
                    <option value="">-- Listeden Ürün Seçin --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok: {p.stock} | Perakende: {p.price} TL | Maliyet: {p.cost_price || 0} TL)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Ürün / Kalem Adı *</label>
                  <input
                    type="text"
                    required
                    value={saleForm.productName}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, productName: e.target.value }))}
                    placeholder="Örn: 316L Kararmaz Çelik Kolye"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Satış Adedi *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={saleForm.quantity}
                      onChange={(e) => setSaleForm((prev) => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Satış Birim Fiyatı (TL) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={saleForm.unitPrice}
                      onChange={(e) => setSaleForm((prev) => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Birim Alış Maliyeti (TL)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={saleForm.unitCost}
                      onChange={(e) => setSaleForm((prev) => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* CANLI KÂR HESAPLAMA KUTUSU */}
              <div className="p-3.5 rounded-2xl bg-emerald-950 text-white flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 block">Canlı Kâr Önizlemesi</span>
                  <div className="text-xs text-emerald-100">
                    Ciro: <strong>{formatPrice(saleModalCalculated.totalRev)}</strong> • Maliyet: <strong>{formatPrice(saleModalCalculated.totalCst)}</strong>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-400">
                    +{formatPrice(saleModalCalculated.profit)}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-200">
                    %{saleModalCalculated.margin} Marj
                  </span>
                </div>
              </div>

              {/* 3. DİĞER DETAYLAR (TARİH ZORUNLU, DİĞERLERİ OPSİYONEL) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Satış Tarihi *(Zorunlu)</label>
                  <input
                    type="date"
                    required
                    value={saleForm.transactionDate}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Ödeme Yöntemi (Opsiyonel)</label>
                  <select
                    value={saleForm.paymentMethod}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                  >
                    <option value="nakit">Nakit</option>
                    <option value="kredi_karti">Kredi Kartı / POS</option>
                    <option value="havale_eft">Havale / EFT</option>
                    <option value="veresiye">Veresiye / Açık Hesap</option>
                  </select>
                </div>
              </div>

              {/* Checkbox: Depo Stoğundan Düş */}
              {saleForm.productId && (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saleForm.updateStock}
                    onChange={(e) => setSaleForm((prev) => ({ ...prev, updateStock: e.target.checked }))}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-semibold text-stone-700 text-xs">
                    Bu satışı depo stoğundan otomatik olarak düş ({saleForm.quantity} adet)
                  </span>
                </label>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  <span>Satışı Onayla & Kaydet</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ALIŞ GİRİŞİ (MAL ALIMI - ESNEK & ZORUNSUZ BİLGİLER) */}
      {/* ========================================================= */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-900 font-bold">
                  <Boxes className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">Alış & Mal Alımı Girişi</h3>
                  <p className="text-[11px] text-stone-500">Toptancıdan veya Tahtakale'den aldığınız ürünleri kaydedin.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPurchaseModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-stone-700 mb-1">Mevcut Ürünlerden Seçin (Opsiyonel)</label>
                <select
                  value={purchaseForm.productId}
                  onChange={(e) => handleSelectProductInPurchase(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                >
                  <option value="">-- Yeni / Özel Kalem Gireceğim --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Mevcut Stok: {p.stock} | Kayıtlı Maliyet: {p.cost_price || 0} TL)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Alınan Ürün / Malzeme Adı *</label>
                <input
                  type="text"
                  required
                  value={purchaseForm.productName}
                  onChange={(e) => setPurchaseForm((prev) => ({ ...prev, productName: e.target.value }))}
                  placeholder="Örn: 100 Adet Tahtakale Çelik Bileklik"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Alınan Adet *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={purchaseForm.quantity}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Birim Alış (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={purchaseForm.unitPrice}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPurchaseForm((prev) => ({ 
                        ...prev, 
                        unitPrice: val, 
                        totalPriceInput: (val * prev.quantity).toFixed(2) 
                      }));
                    }}
                    placeholder="Birim Fiyat"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">veya Toplam Alış (TL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={purchaseForm.totalPriceInput}
                    onChange={(e) => {
                      const totalVal = parseFloat(e.target.value) || 0;
                      const uPrice = purchaseForm.quantity > 0 ? (totalVal / purchaseForm.quantity) : 0;
                      setPurchaseForm((prev) => ({ 
                        ...prev, 
                        totalPriceInput: e.target.value,
                        unitPrice: Math.round(uPrice * 100) / 100
                      }));
                    }}
                    placeholder="100 TL"
                    className="w-full p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 font-black focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Alış Özet Bilgi Notu */}
              <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-stone-500">Hesaplanan Toplam Alış Maliyeti:</span>
                <span className="font-black text-stone-900 text-sm">
                  {formatPrice((Number(purchaseForm.unitPrice) || 0) * (Number(purchaseForm.quantity) || 1))}
                </span>
              </div>

              {/* Opsiyonel Tedarikçi ve Detaylar */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Tedarikçi / Toptancı (Opsiyonel)</label>
                  <input
                    type="text"
                    value={purchaseForm.supplierName}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                    placeholder="Örn: Tahtakale İthalatçı"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Fatura / Fiş No (Opsiyonel)</label>
                  <input
                    type="text"
                    value={purchaseForm.documentNo}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, documentNo: e.target.value }))}
                    placeholder="FTR-2026-001"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Alış Tarihi (Opsiyonel)</label>
                  <input
                    type="date"
                    value={purchaseForm.transactionDate}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Ödeme Şekli (Opsiyonel)</label>
                  <select
                    value={purchaseForm.paymentMethod}
                    onChange={(e) => setPurchaseForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-700"
                  >
                    <option value="nakit">Nakit</option>
                    <option value="kredi_karti">Kredi Kartı</option>
                    <option value="havale_eft">Havale / EFT</option>
                    <option value="veresiye">Veresiye / Açık Hesap</option>
                  </select>
                </div>
              </div>

              {/* Checkboxes for Product Sync */}
              {purchaseForm.productId && (
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={purchaseForm.updateStock}
                      onChange={(e) => setPurchaseForm((prev) => ({ ...prev, updateStock: e.target.checked }))}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="font-semibold text-stone-700 text-xs">
                      Alınan adedi ({purchaseForm.quantity} adet) depo stoğuna ekle
                    </span>
                  </label>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Boxes className="w-4 h-4" />}
                  <span>Alışı Kaydet</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: GİDER GİRİŞİ */}
      {/* ========================================================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-900 font-bold">
                  <ReceiptText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold font-serif text-stone-900">Ek İşletme Gideri Ekle</h3>
                  <p className="text-[11px] text-stone-500">Kargo, koli, dükkan masrafları vb. genel giderler.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Gider Başlığı / Açıklaması *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.expenseTitle}
                  onChange={(e) => setExpenseForm((prev) => ({ ...prev, expenseTitle: e.target.value }))}
                  placeholder="Örn: 50 Adet Kargo Kolisi & Ambalaj Masrafı"
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Gider Tutarı (TL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={expenseForm.amount || ''}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="500 TL"
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Gider Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.transactionDate}
                    onChange={(e) => setExpenseForm((prev) => ({ ...prev, transactionDate: e.target.value }))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Vazgeç
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-black text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
                >
                  Gideri Kaydet
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
