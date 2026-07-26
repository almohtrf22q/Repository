import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingRequest, DestinationOffer } from '../types';
import { 
  X, Lock, User, Key, ShieldCheck, DollarSign, Tag, CheckCircle2, 
  Clock, FileText, Download, Plus, Edit2, Trash2, Eye, EyeOff, LogOut, 
  Search, Filter, TrendingUp, Users, AlertCircle, RefreshCw, FileSpreadsheet, HardDriveDownload,
  MessageSquare, UserCheck, FolderCheck, Calendar, Phone, Mail, ChevronRight, SlidersHorizontal, Percent, Sparkles
} from 'lucide-react';
import { generateBookingPDF } from '../utils/pdfGenerator';
import { exportBookingsToCSV, exportBackupJSON } from '../utils/exportUtils';
import heroBannerImg from '../assets/images/travel_hero_banner_1784982740709.jpg';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  offers: DestinationOffer[];
  onUpdateOfferPrice: (offerId: string, newPrice: number, newOriginalPrice?: number) => void;
  onUpdateOfferToggle?: (offerId: string, updates: Partial<DestinationOffer>) => void;
  onBatchOfferToggle?: (updates: Partial<DestinationOffer>) => void;
  onAddOffer: (newOffer: DestinationOffer) => void;
  onDeleteOffer: (offerId: string) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  offers,
  onUpdateOfferPrice,
  onUpdateOfferToggle,
  onBatchOfferToggle,
  onAddOffer,
  onDeleteOffer
}) => {
  // Authentication State — token is validated server-side, never a hardcoded
  // password check in the frontend bundle.
  const [adminToken, setAdminToken] = useState<string | null>(() => sessionStorage.getItem('almuhtarif_admin_token'));
  const isAuthenticated = !!adminToken;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Bookings live on the server (Netlify Function + database), so the admin
  // sees every customer's booking regardless of device/browser.
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');

  const fetchBookings = async (token: string) => {
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const res = await fetch('/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401) {
        sessionStorage.removeItem('almuhtarif_admin_token');
        setAdminToken(null);
        return;
      }
      if (!res.ok) throw new Error('fetch_failed');
      const data = await res.json();
      setBookings(data);
    } catch {
      setBookingsError('تعذر تحميل الحجوزات من الخادم. تحقق من الاتصال وحاول مجددًا.');
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && adminToken) {
      fetchBookings(adminToken);
    }
  }, [isOpen, adminToken]);

  const onUpdateBookingStatus = async (orderId: string, newStatus: string) => {
    if (!adminToken) return;
    setBookings((prev) => prev.map((b) => (b.orderId === orderId ? { ...b, status: newStatus as any } : b)));
    try {
      await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ orderId, status: newStatus })
      });
    } catch {
      setBookingsError('فشل تحديث حالة الطلب على الخادم.');
    }
  };

  const onUpdatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    if (!adminToken) return;
    setBookings((prev) => prev.map((b) => (b.orderId === orderId ? { ...b, paymentStatus: newPaymentStatus as any } : b)));
    try {
      await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ orderId, paymentStatus: newPaymentStatus })
      });
    } catch {
      setBookingsError('فشل تحديث حالة الدفع على الخادم.');
    }
  };

  const onDeleteBooking = async (orderId: string) => {
    if (!adminToken) return;
    setBookings((prev) => prev.filter((b) => b.orderId !== orderId));
    try {
      await fetch(`/api/bookings?orderId=${encodeURIComponent(orderId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    } catch {
      setBookingsError('فشل حذف الطلب من الخادم.');
    }
  };

  // Active Tab: 'bookings' | 'customers' | 'offers' | 'stats'
  const [activeTab, setActiveTab] = useState<'bookings' | 'customers' | 'offers' | 'stats'>('bookings');

  // Booking Search/Filter
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Offer Modal/State
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editOriginalPrice, setEditOriginalPrice] = useState<number>(0);

  // New Offer Form State
  const [showAddOfferForm, setShowAddOfferForm] = useState(false);
  const [newOfferData, setNewOfferData] = useState({
    title: '',
    country: 'اليمن',
    city: 'عدن',
    price: 250,
    originalPrice: 300,
    discountBadge: 'عرض خاص',
    duration: '5 أيام',
    highlights: 'تذاكر مؤكدة، فندق 4 نجوم، استقبال بالمطار',
    category: 'package' as const,
    isPriceNegotiable: false,
    hideDiscount: false,
    isHidden: false
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      if (!res.ok) {
        setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        return;
      }
      const { token } = await res.json();
      sessionStorage.setItem('almuhtarif_admin_token', token);
      setAdminToken(token);
    } catch {
      setLoginError('تعذر الاتصال بالخادم. حاول مجددًا.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('almuhtarif_admin_token');
    setAdminToken(null);
    setUsername('');
    setPassword('');
    setBookings([]);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = b.orderId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.customerName.includes(bookingSearch) ||
      b.phone.includes(bookingSearch);
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Unique Customer Aggregation
  const uniqueCustomersMap = new Map<string, {
    key: string;
    name: string;
    phone: string;
    email?: string;
    totalBookings: number;
    totalSpent: number;
    bookings: BookingRequest[];
    lastBookingDate: string;
    documents: { id: string; name: string; size: string }[];
  }>();

  bookings.forEach((b) => {
    const key = (b.phone || b.customerName).trim();
    const existing = uniqueCustomersMap.get(key);
    const docs = b.documents || [];
    if (!existing) {
      uniqueCustomersMap.set(key, {
        key,
        name: b.customerName,
        phone: b.phone,
        email: b.email,
        totalBookings: 1,
        totalSpent: b.totalAmount || 0,
        bookings: [b],
        lastBookingDate: b.createdAt,
        documents: [...docs]
      });
    } else {
      existing.totalBookings += 1;
      existing.totalSpent += (b.totalAmount || 0);
      existing.bookings.push(b);
      docs.forEach((doc) => {
        if (!existing.documents.some((d) => d.id === doc.id)) {
          existing.documents.push(doc);
        }
      });
    }
  });

  const searchLower = bookingSearch.toLowerCase().trim();
  const customerList = Array.from(uniqueCustomersMap.values()).filter((c) => {
    if (!searchLower) return true;
    return (
      c.name.toLowerCase().includes(searchLower) ||
      c.phone.toLowerCase().includes(searchLower) ||
      (c.email && c.email.toLowerCase().includes(searchLower))
    );
  });

  const totalRevenue = bookings.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalPassengers = bookings.reduce((acc, curr) => acc + (curr.passengers || 1), 0);

  const handleSavePriceEdit = (offerId: string) => {
    onUpdateOfferPrice(offerId, Number(editPrice), Number(editOriginalPrice));
    setEditingOfferId(null);
  };

  const handleCreateOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: DestinationOffer = {
      id: 'offer-custom-' + Date.now(),
      title: newOfferData.title,
      country: newOfferData.country,
      city: newOfferData.city,
      price: Number(newOfferData.price),
      originalPrice: Number(newOfferData.originalPrice),
      discountBadge: newOfferData.discountBadge,
      image: heroBannerImg,
      duration: newOfferData.duration,
      highlights: newOfferData.highlights.split('،').map((s) => s.trim()).filter(Boolean),
      rating: 4.9,
      featured: true,
      category: newOfferData.category,
      isPriceNegotiable: newOfferData.isPriceNegotiable,
      hideDiscount: newOfferData.hideDiscount,
      isHidden: newOfferData.isHidden
    };

    onAddOffer(created);
    setShowAddOfferForm(false);
    setNewOfferData({
      title: '',
      country: 'اليمن',
      city: 'عدن',
      price: 250,
      originalPrice: 300,
      discountBadge: 'عرض خاص',
      duration: '5 أيام',
      highlights: 'تذاكر مؤكدة، فندق 4 نجوم، استقبال بالمطار',
      category: 'package',
      isPriceNegotiable: false,
      hideDiscount: false,
      isHidden: false
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            className="bg-white rounded-2xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
          >
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#0B1E3D] via-[#0F2C59] to-[#153B75] p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0 border-b border-amber-500/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black font-cairo flex items-center gap-2">
                <span>لوحة تحكم مدير المكتب</span>
                {isAuthenticated && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    نشط الآن
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-300 font-tajawal">إدارة الحجوزات، الجوازات، وتحديث أسعار العروض - مكتب المحترف</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج الإدارة</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {/* LOGIN SCREEN */}
          {!isAuthenticated ? (
            <div className="max-w-md mx-auto py-8 sm:py-12 space-y-6 animate-in fade-in">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#0F2C59] text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg border border-amber-400/40">
                  <Lock className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-black text-[#0F2C59] font-cairo">تسجيل دخول الإدارة</h4>
                <p className="text-xs text-slate-500 font-tajawal font-bold">
                  أدخل اسم المستخدم وكلمة المرور الخاصة بمدير مكتب المحترف
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2 font-tajawal">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">اسم المستخدم</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">كلمة المرور</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-navy w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>{loginLoading ? 'جارٍ التحقق...' : 'تأكيد وتسجيل الدخول'}</span>
                </button>
              </form>
            </div>
          ) : (
            
            /* AUTHENTICATED DASHBOARD */
            <div className="space-y-6 animate-in fade-in">
              
              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'bookings'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>إدارة الطلبات ({bookings.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'customers'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>سجل العملاء والمسافرين ({customerList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('offers')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'offers'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Tag className="w-4 h-4" />
                    <span>تعديل العروض والأسعار ({offers.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'stats'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-md'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>التقرير المالي</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-bold font-tajawal px-3">
                  مرحباً بك، المدير المباشر
                </div>
              </div>

              {/* TAB 1: BOOKINGS MANAGEMENT */}
              {activeTab === 'bookings' && (
                <div className="space-y-4">

                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-tajawal">
                    <span className="text-slate-500">
                      {bookingsLoading ? 'جارٍ تحميل الحجوزات من الخادم...' : `${bookings.length} حجز — من جميع العملاء والأجهزة`}
                    </span>
                    <button
                      type="button"
                      onClick={() => adminToken && fetchBookings(adminToken)}
                      className="flex items-center gap-1 text-navy-700 font-bold hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> تحديث
                    </button>
                  </div>
                  {bookingsError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 font-tajawal">
                      {bookingsError}
                    </div>
                  )}

                  {/* Search and Filter */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 relative">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                      <input
                        type="text"
                        placeholder="ابحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pr-10 pl-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="all">جميع الحالات</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="documents_review">فحص المستندات</option>
                        <option value="processing">جاري المعالجة والإصدار</option>
                        <option value="ready">جاهز للتسليم</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي / لم يتم الاتفاق</option>
                      </select>
                    </div>
                  </div>

                  {/* Download & Export Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-600 font-tajawal">
                      تنزيل وتقارير الإدارة ({filteredBookings.length} طلب)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => exportBookingsToCSV(filteredBookings)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="تنزيل كشف الحجوزات ملف إكسل Excel / CSV"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>تنزيل تقرير Excel</span>
                      </button>

                      <button
                        onClick={() => exportBackupJSON(bookings, offers)}
                        className="bg-[#0F2C59] hover:bg-[#16386C] text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                        title="تنزيل نسخة احتياطية كاملة من الحجوزات والعروض"
                      >
                        <HardDriveDownload className="w-4 h-4" />
                        <span>حفظ نسخة احتياطية</span>
                      </button>
                    </div>
                  </div>

                  {/* Bookings Table / Cards */}
                  {filteredBookings.length > 0 ? (
                    <div className="space-y-3">
                      {filteredBookings.map((b) => (
                        <div key={b.orderId} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow space-y-3 font-tajawal">
                          
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#0F2C59] text-amber-300 font-mono text-xs font-black px-2.5 py-1 rounded-lg">
                                #{b.orderId}
                              </span>
                              <span className="font-black text-[#0F2C59] text-sm font-cairo">{b.serviceTitle}</span>
                              <span className="text-[11px] text-slate-400 font-bold">({b.createdAt})</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => generateBookingPDF(b)}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                title="طباعة سند الحجز"
                              >
                                <Download className="w-3.5 h-3.5 text-[#0F2C59]" />
                                <span>طباعة PDF</span>
                              </button>

                              {onDeleteBooking && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من حذف طلب الحجز رقم #${b.orderId} للعميل (${b.customerName}) لعدم الاتفاق؟\nسيتم حذف الطلب نهائياً من اللوحة.`)) {
                                      onDeleteBooking(b.orderId);
                                    }
                                  }}
                                  className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 border border-red-200 cursor-pointer transition-colors shadow-2xs"
                                  title="حذف طلب الحجز لعدم الاتفاق"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-red-600" />
                                  <span>حذف (عدم الاتفاق)</span>
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                              <span className="text-slate-400 block font-bold">العميل والجوال:</span>
                              <span className="font-black text-slate-800">{b.customerName}</span>
                              <span className="block text-slate-600 font-mono text-[11px] dir-ltr text-right">{b.phone}</span>
                            </div>

                            <div>
                              <span className="text-slate-400 block font-bold">تفاصيل الرحلة:</span>
                              <span className="font-bold text-slate-800">{b.destination}</span>
                              <span className="block text-slate-500 text-[11px]">تاريخ السفر: {b.travelDate} ({b.passengers} شخص)</span>
                              {b.hostAbsherPhone && (
                                <span className="block text-emerald-700 font-bold text-[11px]">جوال المستضيف (أبشر): {b.hostAbsherPhone}</span>
                              )}
                              {b.hostIqamaNumber && (
                                <span className="block text-blue-900 font-bold text-[11px]">إقامة المستضيف: {b.hostIqamaNumber}</span>
                              )}
                            </div>

                            <div>
                              <span className="text-slate-400 block font-bold">السداد والمبلغ:</span>
                              <span className="font-black text-emerald-700">${b.totalAmount} USD</span>
                              <span className="block text-slate-500 text-[11px]">نقاط ولاء: +{b.loyaltyPointsEarned}</span>
                            </div>
                          </div>

                          {/* Documents list */}
                          {b.documents && b.documents.length > 0 && (
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                              <span className="font-bold text-[#0F2C59] block mb-1">الوثائق وجوازات السفر المرفقة:</span>
                              <div className="flex flex-wrap gap-2">
                                {b.documents.map((doc) => (
                                  <span key={doc.id} className="bg-white border border-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-700 flex items-center gap-1">
                                    <FileText className="w-3 h-3 text-amber-600" />
                                    <span>{doc.name}</span>
                                    <span className="text-slate-400">({doc.size})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Quick Controls */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-600">تحديث الحالة:</span>
                              <select
                                value={b.status}
                                onChange={(e) => onUpdateBookingStatus(b.orderId, e.target.value)}
                                className="bg-amber-50 border border-amber-300 rounded-lg px-2.5 py-1 font-bold text-amber-900 outline-none focus:ring-1 focus:ring-amber-500"
                              >
                                <option value="pending">قيد الانتظار والمراجعة</option>
                                <option value="documents_review">جاري تدقيق الوثائق والجوازات</option>
                                <option value="processing">جاري المعالجة والإصدار</option>
                                <option value="ready">جاهز للتسليم والإنهاء</option>
                                <option value="completed">مكتمل بنجاح</option>
                                <option value="cancelled">ملغي (عدم الاتفاق)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-600">حالة السداد:</span>
                              <select
                                value={b.paymentStatus}
                                onChange={(e) => onUpdatePaymentStatus(b.orderId, e.target.value)}
                                className="bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 font-bold text-slate-800 outline-none"
                              >
                                <option value="paid">مدفوع بالكامل</option>
                                <option value="deposit_paid">تم دفع العربون المبدئي</option>
                                <option value="pending">في انتظار السداد</option>
                              </select>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                      <p className="text-slate-500 text-xs font-bold font-tajawal">لا يوجد طلبات تطابق معايير البحث حالياً.</p>
                    </div>
                  )}

                </div>
              )}

              {/* TAB: REGISTERED CUSTOMERS DIRECTORY */}
              {activeTab === 'customers' && (
                <div className="space-y-4 font-tajawal">
                  
                  {/* Informational Banner & Stats */}
                  <div className="bg-[#0F2C59] p-4 sm:p-5 rounded-2xl text-white flex flex-wrap items-center justify-between gap-4 shadow-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-5 h-5 text-amber-400" />
                        <h4 className="text-lg font-black font-cairo text-white">سجل العملاء والمسافرين المحفوظين</h4>
                      </div>
                      <p className="text-xs text-slate-300 font-bold mt-1">
                        يتم حفظ كل عميل تلقائياً في قاعدة البيانات فور إتمام الحجز مع ربط جميع جوازاته والمستندات بملفه.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center border border-white/10">
                        <span className="text-[10px] text-amber-300 block font-bold">إجمالي العملاء</span>
                        <span className="text-lg font-black text-white font-mono">{uniqueCustomersMap.size}</span>
                      </div>
                      <div className="bg-white/10 px-3 py-1.5 rounded-xl text-center border border-white/10">
                        <span className="text-[10px] text-amber-300 block font-bold">إجمالي الطلبات</span>
                        <span className="text-lg font-black text-white font-mono">{bookings.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Customer Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      placeholder="البحث عن عميل باسمه، رقم هاتفه، أو بريده الإلكتروني..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                    />
                  </div>

                  {/* Customer Cards List */}
                  {customerList.length > 0 ? (
                    <div className="space-y-4">
                      {customerList.map((customer) => {
                        const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
                        const waNumber = cleanPhone.startsWith('967') ? cleanPhone : `967${cleanPhone}`;
                        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(`مرحباً ${customer.name}، تواصل معك مكتب المحترف للسفريات بخصوص حجوزاتك.`)}`;

                        return (
                          <div key={customer.key} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
                            
                            {/* Customer Profile Header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#0F2C59] text-amber-400 font-bold flex items-center justify-center font-cairo text-sm shadow-xs">
                                  {customer.name.slice(0, 2)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-black text-[#0F2C59] text-sm font-cairo">{customer.name}</h5>
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                      عميل موثق
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-bold mt-0.5">
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3 text-amber-600" />
                                      <span className="font-mono text-slate-700">{customer.phone}</span>
                                    </span>
                                    {customer.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span>{customer.email}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>مراسلة واتساب</span>
                                </a>

                                <span className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl">
                                  المبلغ: ${customer.totalSpent} USD
                                </span>
                              </div>
                            </div>

                            {/* Customer Bookings Sub-list */}
                            <div className="space-y-2">
                              <span className="text-xs font-bold text-[#0F2C59] block">
                                الحجوزات والمعاملات المسجلة للعميل ({customer.bookings.length} طلب):
                              </span>

                              <div className="grid grid-cols-1 gap-2">
                                {customer.bookings.map((b) => (
                                  <div key={b.orderId} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-[#0F2C59] text-amber-300 font-mono text-[11px] font-bold px-2 py-0.5 rounded">
                                        #{b.orderId}
                                      </span>
                                      <span className="font-bold text-slate-800">{b.serviceTitle}</span>
                                      <span className="text-slate-400 text-[11px]">({b.destination})</span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className="text-slate-500 font-bold text-[11px]">التاريخ: {b.travelDate}</span>
                                      <span className="font-black text-emerald-700 font-mono">${b.totalAmount} USD</span>
                                      
                                      <button
                                        onClick={() => generateBookingPDF(b)}
                                        className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                      >
                                        <Download className="w-3 h-3 text-[#0F2C59]" />
                                        <span>سند PDF</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Customer Uploaded Passports/Documents */}
                            {customer.documents && customer.documents.length > 0 && (
                              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/80 text-xs space-y-1.5">
                                <span className="font-bold text-amber-950 block flex items-center gap-1.5">
                                  <FolderCheck className="w-4 h-4 text-amber-600" />
                                  <span>جوازات السفر والوثائق المرفقة لهذا العميل ({customer.documents.length}):</span>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {customer.documents.map((doc) => (
                                    <div key={doc.id} className="bg-white border border-amber-300 px-3 py-1 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-2xs">
                                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                                      <span>{doc.name}</span>
                                      <span className="text-slate-400 text-[10px]">({doc.size})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                      <Users className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-slate-500 text-xs font-bold">لم يتم العثور على عملاء يطابقون كلمة البحث.</p>
                    </div>
                  )}

                </div>
              )}

              {/* TAB 2: OFFERS & PRICING MANAGEMENT */}
              {activeTab === 'offers' && (
                <div className="space-y-5">
                  
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-black text-[#0F2C59] font-cairo">إدارة العروض والأسعار والخصومات بالواجهة</h4>
                      <p className="text-xs text-slate-500 font-bold font-tajawal">تحكّم كامل في إخفاء/إظهار العروض والخصومات والأسعار أو تحويلها لأسعار تفاوضية</p>
                    </div>

                    <button
                      onClick={() => setShowAddOfferForm(!showAddOfferForm)}
                      className="btn-gold px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة عرض سياحي جديد</span>
                    </button>
                  </div>

                  {/* Master Controls Section */}
                  <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-amber-500/40 shadow-md space-y-3 font-tajawal">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                        <div>
                          <h5 className="font-black text-amber-300 text-sm font-cairo">أزرار التحكم الجماعي بالعروض والأسعار</h5>
                          <p className="text-[11px] text-slate-300">تطبيق أو إلغاء الخصومات والأسعار والعروض فورياً بكبسة زر واحدة</p>
                        </div>
                      </div>

                      {/* Summary Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                        <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700">
                          العروض: {offers.length}
                        </span>
                        <span className="bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30">
                          سعر تفاوضي: {offers.filter(o => o.isPriceNegotiable).length}
                        </span>
                        <span className="bg-red-500/20 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/30">
                          مخفي من الواجهة: {offers.filter(o => o.isHidden).length}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-800">
                      {/* Toggle All Prices Negotiable */}
                      <button
                        type="button"
                        onClick={() => {
                          const allNegotiable = offers.length > 0 && offers.every(o => o.isPriceNegotiable);
                          if (onBatchOfferToggle) onBatchOfferToggle({ isPriceNegotiable: !allNegotiable });
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          offers.length > 0 && offers.every(o => o.isPriceNegotiable)
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>
                          {offers.length > 0 && offers.every(o => o.isPriceNegotiable)
                            ? 'إظهار الأسعار الرقمية للجميع'
                            : 'إخفاء كافة الأسعار (تحويل لسعر تفاوضي)'}
                        </span>
                      </button>

                      {/* Toggle All Discounts Hidden */}
                      <button
                        type="button"
                        onClick={() => {
                          const allDiscountsHidden = offers.length > 0 && offers.every(o => o.hideDiscount);
                          if (onBatchOfferToggle) onBatchOfferToggle({ hideDiscount: !allDiscountsHidden });
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          offers.length > 0 && offers.every(o => o.hideDiscount)
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                        }`}
                      >
                        <Percent className="w-4 h-4" />
                        <span>
                          {offers.length > 0 && offers.every(o => o.hideDiscount)
                            ? 'إظهار كافة الخصومات'
                            : 'إخفاء كافة الخصومات والشعارات'}
                        </span>
                      </button>

                      {/* Toggle All Offers Hidden */}
                      <button
                        type="button"
                        onClick={() => {
                          const allOffersHidden = offers.length > 0 && offers.every(o => o.isHidden);
                          if (onBatchOfferToggle) onBatchOfferToggle({ isHidden: !allOffersHidden });
                        }}
                        className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                          offers.length > 0 && offers.every(o => o.isHidden)
                            ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        }`}
                      >
                        {offers.length > 0 && offers.every(o => o.isHidden) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span>
                          {offers.length > 0 && offers.every(o => o.isHidden)
                            ? 'إرجاع وإظهار كافة العروض بالواجهة'
                            : 'إخفاء كافة العروض من الواجهة'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Add New Offer Modal/Form */}
                  {showAddOfferForm && (
                    <form onSubmit={handleCreateOfferSubmit} className="bg-white p-5 rounded-2xl border-2 border-amber-400/80 shadow-md space-y-4 font-tajawal animate-in fade-in">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h5 className="font-black text-[#0F2C59] text-sm font-cairo">إضافة برنامج أو عرض سياحي جديد</h5>
                        <button type="button" onClick={() => setShowAddOfferForm(false)} className="text-slate-400 hover:text-slate-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">عنوان العرض *</label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: عرض صلالة الخضراء"
                            value={newOfferData.title}
                            onChange={(e) => setNewOfferData({ ...newOfferData, title: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">الدولة والمدينة *</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required
                              placeholder="عمان"
                              value={newOfferData.country}
                              onChange={(e) => setNewOfferData({ ...newOfferData, country: e.target.value })}
                              className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                            />
                            <input
                              type="text"
                              required
                              placeholder="صلالة"
                              value={newOfferData.city}
                              onChange={(e) => setNewOfferData({ ...newOfferData, city: e.target.value })}
                              className="w-1/2 p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">التصنيف *</label>
                          <select
                            value={newOfferData.category}
                            onChange={(e) => setNewOfferData({ ...newOfferData, category: e.target.value as any })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                          >
                            <option value="package">برنامج سياحي متكامل</option>
                            <option value="hajj_umrah">عمرة وحج</option>
                            <option value="flight">عرض طيران وتذاكر</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">السعر المبدئي ($) *</label>
                          <input
                            type="number"
                            required
                            value={newOfferData.price}
                            onChange={(e) => setNewOfferData({ ...newOfferData, price: Number(e.target.value) })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">السعر الأصلي قبل الخصم ($)</label>
                          <input
                            type="number"
                            value={newOfferData.originalPrice}
                            onChange={(e) => setNewOfferData({ ...newOfferData, originalPrice: Number(e.target.value) })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-slate-700 mb-1">شارة الخصم / الشعار</label>
                          <input
                            type="text"
                            placeholder="خصم 15%"
                            value={newOfferData.discountBadge}
                            onChange={(e) => setNewOfferData({ ...newOfferData, discountBadge: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      {/* Options Checkboxes */}
                      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-200 text-xs font-bold text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <input
                            type="checkbox"
                            checked={newOfferData.isPriceNegotiable}
                            onChange={(e) => setNewOfferData({ ...newOfferData, isPriceNegotiable: e.target.checked })}
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span>تحويل السعر فوراً إلى (سعر تفاوضي)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <input
                            type="checkbox"
                            checked={newOfferData.hideDiscount}
                            onChange={(e) => setNewOfferData({ ...newOfferData, hideDiscount: e.target.checked })}
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span>إخفاء شارات الخصم</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                          <input
                            type="checkbox"
                            checked={newOfferData.isHidden}
                            onChange={(e) => setNewOfferData({ ...newOfferData, isHidden: e.target.checked })}
                            className="rounded text-amber-500 focus:ring-amber-400"
                          />
                          <span>إخفاء العرض مؤقتاً من الواجهة</span>
                        </label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowAddOfferForm(false)}
                          className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                        >
                          إلغاء
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 btn-navy text-amber-300 font-bold text-xs rounded-xl"
                        >
                          نشر العرض الجديد
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Offers Grid list */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offers.map((off) => (
                      <div
                        key={off.id}
                        className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 font-tajawal ${
                          off.isHidden
                            ? 'bg-slate-100/90 border-red-300/80 shadow-2xs opacity-85'
                            : 'bg-white border-slate-200 shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Status Row Badges */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Visible or Hidden Badge */}
                              {off.isHidden ? (
                                <span className="bg-red-100 text-red-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-red-200">
                                  <EyeOff className="w-3 h-3 text-red-600" />
                                  <span>مخفي من الواجهة</span>
                                </span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-emerald-200">
                                  <Eye className="w-3 h-3 text-emerald-600" />
                                  <span>معروض للعملاء</span>
                                </span>
                              )}

                              {/* Price Status Badge */}
                              {off.isPriceNegotiable ? (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300">
                                  <Sparkles className="w-3 h-3 text-amber-600" />
                                  <span>سعر تفاوضي</span>
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 border border-slate-200">
                                  <DollarSign className="w-3 h-3 text-slate-500" />
                                  <span>سعر رقمي (${off.price})</span>
                                </span>
                              )}

                              {/* Discount Status Badge */}
                              {!off.hideDiscount && off.discountBadge && (
                                <span className="bg-blue-100 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                                  {off.discountBadge}
                                </span>
                              )}
                              {off.hideDiscount && (
                                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                  الخصم مخفي
                                </span>
                              )}
                            </div>

                            <span className="text-xs font-bold text-slate-500">{off.city} - {off.country}</span>
                          </div>

                          <h5 className="font-black text-[#0F2C59] text-sm font-cairo">{off.title}</h5>
                          <span className="text-xs text-slate-500 block mt-0.5">المدة: {off.duration}</span>
                        </div>

                        {/* Individual Toggles & Action Row */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                            <span className="text-[11px] font-bold text-slate-600">تحكم بالمظهر السريع:</span>
                            
                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Toggle Hide Offer */}
                              <button
                                type="button"
                                onClick={() => onUpdateOfferToggle && onUpdateOfferToggle(off.id, { isHidden: !off.isHidden })}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                  off.isHidden
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                }`}
                                title={off.isHidden ? 'إعادة الإظهار بالواجهة' : 'إخفاء العرض عن العملاء'}
                              >
                                {off.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                <span>{off.isHidden ? 'إرجاع وإظهار' : 'إخفاء العرض'}</span>
                              </button>

                              {/* Toggle Negotiable Price */}
                              <button
                                type="button"
                                onClick={() => onUpdateOfferToggle && onUpdateOfferToggle(off.id, { isPriceNegotiable: !off.isPriceNegotiable })}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                  off.isPriceNegotiable
                                    ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                }`}
                                title="تبديل بين السعر الرقمي والسعر التفاوضي"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>{off.isPriceNegotiable ? 'إلغاء التفاوضي (إظهار الرقم)' : 'سعر تفاوضي'}</span>
                              </button>

                              {/* Toggle Discount Visibility */}
                              <button
                                type="button"
                                onClick={() => onUpdateOfferToggle && onUpdateOfferToggle(off.id, { hideDiscount: !off.hideDiscount })}
                                className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                  off.hideDiscount
                                    ? 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                                }`}
                                title="إخفاء أو إظهار شارات الخصم"
                              >
                                <Tag className="w-3.5 h-3.5" />
                                <span>{off.hideDiscount ? 'إظهار الخصم' : 'إخفاء الخصم'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Price Display and Edit */}
                          {editingOfferId === off.id ? (
                            <div className="space-y-2 animate-in fade-in pt-1">
                              <span className="text-xs font-bold text-[#0F2C59] block">تعديل السعر الحالي:</span>
                              <div className="flex items-center gap-2">
                                <div>
                                  <label className="text-[10px] text-slate-400 block font-bold">السعر النهائي ($)</label>
                                  <input
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(Number(e.target.value))}
                                    className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-emerald-700"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] text-slate-400 block font-bold">السعر السابق ($)</label>
                                  <input
                                    type="number"
                                    value={editOriginalPrice}
                                    onChange={(e) => setEditOriginalPrice(Number(e.target.value))}
                                    className="w-24 p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-500"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleSavePriceEdit(off.id)}
                                  className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                                >
                                  حفظ السعر
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingOfferId(null)}
                                  className="mt-4 bg-slate-200 text-slate-700 font-bold px-2 py-1.5 rounded-lg text-xs cursor-pointer"
                                >
                                  إلغاء
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between pt-1">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-bold">الحالة المعلنة بالسعر:</span>
                                {off.isPriceNegotiable ? (
                                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-cairo inline-block">
                                    سعر تفاوضي (غير معروض كـ USD)
                                  </span>
                                ) : (
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-lg font-black text-[#0F2C59] font-cairo">${off.price} USD</span>
                                    {!off.hideDiscount && off.originalPrice > off.price && (
                                      <span className="text-xs text-slate-400 line-through">${off.originalPrice}</span>
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingOfferId(off.id);
                                    setEditPrice(off.price);
                                    setEditOriginalPrice(off.originalPrice);
                                  }}
                                  className="bg-[#0F2C59] text-amber-300 hover:bg-[#153B75] px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>تعديل السعر</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeleteOffer(off.id)}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                  title="حذف العرض"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 3: FINANCIAL & STATS */}
              {activeTab === 'stats' && (
                <div className="space-y-6 font-tajawal">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
                      <DollarSign className="w-6 h-6 text-emerald-600 mx-auto" />
                      <span className="text-xs font-bold text-slate-400 block">إجمالي المبيعات التقديرية</span>
                      <span className="text-2xl font-black text-[#0F2C59] font-cairo">${totalRevenue} USD</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
                      <FileText className="w-6 h-6 text-amber-500 mx-auto" />
                      <span className="text-xs font-bold text-slate-400 block">إجمالي طلبات الحجز</span>
                      <span className="text-2xl font-black text-[#0F2C59] font-cairo">{bookings.length} طلب</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
                      <Users className="w-6 h-6 text-blue-600 mx-auto" />
                      <span className="text-xs font-bold text-slate-400 block">عدد المسافرين المعتمدين</span>
                      <span className="text-2xl font-black text-[#0F2C59] font-cairo">{totalPassengers} مسافر</span>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
                      <Tag className="w-6 h-6 text-purple-600 mx-auto" />
                      <span className="text-xs font-bold text-slate-400 block">العروض والبرامج النشطة</span>
                      <span className="text-2xl font-black text-[#0F2C59] font-cairo">{offers.length} برنامج</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-2">
                    <h5 className="font-bold font-cairo text-sm text-[#0F2C59]">تقرير الإدارة الفوري المعتمد:</h5>
                    <p>
                      • جميع المعاملات المدخلة عبر التطبيق يتم توليد سندات PDF فورية لها مع كود QR مخصص للتحقق بالمكتب.<br />
                      • تتوفر خدمة التدقيق السريع للجوازات واستخراج الفيزا المباشرة بمقر تعز - الكدمة الشارع العام.
                    </p>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
