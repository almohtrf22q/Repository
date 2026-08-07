import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookingRequest, DestinationOffer, ServiceItem, SiteTheme, ServiceType, UploadedDocument } from '../types';
import { 
  X, Lock, User, Key, ShieldCheck, DollarSign, Tag, CheckCircle2, 
  Clock, FileText, Download, Plus, Edit2, Trash2, Eye, EyeOff, LogOut, 
  Search, Filter, TrendingUp, Users, AlertCircle, RefreshCw, FileSpreadsheet, HardDriveDownload,
  MessageSquare, UserCheck, FolderCheck, Calendar, Phone, Mail, ChevronRight, SlidersHorizontal, Percent, Sparkles,
  Palette, Grid, Image, Maximize2, FileCheck, Layers, Settings, Globe, Camera, Upload
} from 'lucide-react';
import { generateBookingPDF } from '../utils/pdfGenerator';
import { exportBookingsToCSV, exportBackupJSON } from '../utils/exportUtils';

export const PRESET_STOCK_IMAGES = [
  { label: 'طيران ومطارات', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80' },
  { label: 'مكة والعمرة', url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=800&q=80' },
  { label: 'المدينة المنورة', url: 'https://images.unsplash.com/photo-1565552070098-0073a126829c?auto=format&fit=crop&w=800&q=80' },
  { label: 'دبي وبرج خليفة', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
  { label: 'القاهرة والأهرامات', url: 'https://images.unsplash.com/photo-1572252821143-0259e211f3d6?auto=format&fit=crop&w=800&q=80' },
  { label: 'تركيا وإسطنبول', url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80' },
  { label: 'لندن وبريطانيا', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
  { label: 'كوالالمبور وماليزيا', url: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80' },
  { label: 'جوازات وتأشيرات', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80' },
  { label: 'حافلات ونقل بري', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80' },
  { label: 'فنادق فاخرة', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80' },
  { label: 'سياحة وشواطئ', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' }
];

export const handleImageFileUpload = (
  e: React.ChangeEvent<HTMLInputElement>,
  onSuccess: (base64Url: string) => void
) => {
  const file = e.target.files?.[0];
  if (file) {
    if (file.size > 8 * 1024 * 1024) {
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 8 ميجابايت');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        onSuccess(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }
};

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Offers CRUD
  offers: DestinationOffer[];
  onUpdateOfferPrice: (offerId: string, newPrice: number, newOriginalPrice?: number) => void;
  onUpdateOfferToggle?: (offerId: string, updates: Partial<DestinationOffer>) => void;
  onBatchOfferToggle?: (updates: Partial<DestinationOffer>) => void;
  onAddOffer: (newOffer: DestinationOffer) => void;
  onEditOffer?: (updatedOffer: DestinationOffer) => void;
  onDeleteOffer: (offerId: string) => void;

  // Services CRUD
  services?: ServiceItem[];
  onAddService?: (newService: ServiceItem) => void;
  onEditService?: (updatedService: ServiceItem) => void;
  onDeleteService?: (serviceId: string) => void;

  // Themes
  currentTheme?: SiteTheme;
  onChangeTheme?: (theme: SiteTheme) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  offers,
  onUpdateOfferPrice,
  onUpdateOfferToggle,
  onBatchOfferToggle,
  onAddOffer,
  onEditOffer,
  onDeleteOffer,
  services = [],
  onAddService,
  onEditService,
  onDeleteService,
  currentTheme = 'navy',
  onChangeTheme
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

  const onAddBooking = async (newBooking: BookingRequest) => {
    if (!adminToken) return;
    setBookings((prev) => [newBooking, ...prev]);
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify(newBooking)
      });
    } catch {
      setBookingsError('فشل حفظ الحجز اليدوي على الخادم.');
    }
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'customers' | 'offers' | 'services' | 'themes' | 'stats'>('bookings');

  // Search & Filters
  const [bookingSearch, setBookingSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Image Preview Lightbox State
  const [selectedImagePreview, setSelectedImagePreview] = useState<{ url: string; title: string; docName?: string } | null>(null);

  // Manual Add Booking Modal State
  const [showAddBookingForm, setShowAddBookingForm] = useState(false);
  const [manualBookingData, setManualBookingData] = useState({
    customerName: '',
    phone: '',
    email: '',
    serviceType: 'flight' as ServiceType,
    serviceTitle: 'حجز طيران',
    destination: '',
    travelDate: new Date().toISOString().split('T')[0],
    passengers: 1,
    totalAmount: 350,
    paymentMethod: 'office_cash' as const,
    paymentStatus: 'paid' as const,
    status: 'issued' as const,
    notes: 'تم التسجيل يدويًا عبر إدارة المكتب',
    hostAbsherPhone: '',
    hostIqamaNumber: ''
  });

  // Edit Offer Modal State
  const [editingOffer, setEditingOffer] = useState<DestinationOffer | null>(null);
  const [showAddOfferForm, setShowAddOfferForm] = useState(false);
  const [newOfferData, setNewOfferData] = useState<DestinationOffer>({
    id: '',
    title: '',
    country: 'اليمن',
    city: 'عدن',
    price: 250,
    originalPrice: 300,
    discountBadge: 'عرض خاص',
    duration: '5 أيام',
    highlights: ['تذاكر مؤكدة', 'فندق 4 نجوم', 'استقبال بالمطار'],
    rating: 4.9,
    category: 'package',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    isPriceNegotiable: false,
    hideDiscount: false,
    isHidden: false
  });

  // Edit/Add Service Form State
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceFormData, setServiceFormData] = useState({
    id: '',
    title: '',
    subtitle: '',
    description: '',
    featuresText: '',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'
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
    documents: UploadedDocument[];
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
      c.phone.includes(searchLower) ||
      (c.email && c.email.toLowerCase().includes(searchLower))
    );
  });

  // Handlers for manual booking
  const handleSubmitManualBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualBookingData.customerName || !manualBookingData.phone) {
      alert('يرجى كتابة اسم العميل ورقم الهاتف');
      return;
    }
    const orderId = `MHT-ADMIN-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().split('T')[0];

    const newBooking: BookingRequest = {
      orderId,
      serviceType: manualBookingData.serviceType,
      serviceTitle: manualBookingData.serviceTitle || 'حجز يدوي',
      customerName: manualBookingData.customerName,
      phone: manualBookingData.phone,
      email: manualBookingData.email,
      destination: manualBookingData.destination || 'وجهة غير محددة',
      travelDate: manualBookingData.travelDate,
      passengers: Number(manualBookingData.passengers) || 1,
      totalAmount: Number(manualBookingData.totalAmount) || 0,
      paymentMethod: manualBookingData.paymentMethod,
      paymentStatus: manualBookingData.paymentStatus,
      status: manualBookingData.status,
      notes: manualBookingData.notes,
      hostAbsherPhone: manualBookingData.hostAbsherPhone,
      hostIqamaNumber: manualBookingData.hostIqamaNumber,
      createdAt: now,
      updatedAt: now,
      documents: [],
      loyaltyPointsEarned: 25
    };

    if (onAddBooking) {
      onAddBooking(newBooking);
    }
    setShowAddBookingForm(false);
    alert(`تمت إضافة أمر الحجز الجديد #${orderId} بنجاح!`);
  };

  // Handlers for Offer Form
  const handleSaveOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      if (onEditOffer) {
        onEditOffer(editingOffer);
      } else {
        onUpdateOfferPrice(editingOffer.id, editingOffer.price, editingOffer.originalPrice);
      }
      setEditingOffer(null);
      alert('تم تحديث العرض بنجاح!');
    } else if (showAddOfferForm) {
      const offerId = `offer-${Date.now()}`;
      onAddOffer({
        ...newOfferData,
        id: offerId,
        highlights: typeof newOfferData.highlights === 'string' 
          ? (newOfferData.highlights as string).split('،').map(s => s.trim()).filter(Boolean)
          : newOfferData.highlights
      });
      setShowAddOfferForm(false);
      alert('تمت إضافة العرض الجديد بنجاح!');
    }
  };

  // Handlers for Service Form
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceFormData({
      id: `service-${Date.now()}`,
      title: '',
      subtitle: '',
      description: '',
      featuresText: 'حجز فوري ومؤكد، أسعار خاصة ومنافسة، متابعة مستمرة على مدار الساعة',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'
    });
    setShowServiceForm(true);
  };

  const handleOpenEditService = (service: ServiceItem) => {
    setEditingService(service);
    setServiceFormData({
      id: service.id,
      title: service.title,
      subtitle: service.subtitle,
      description: service.description,
      featuresText: service.features.join('، '),
      image: service.image
    });
    setShowServiceForm(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.title) {
      alert('يرجى إضافة عنوان الخدمة');
      return;
    }

    const featuresArray = serviceFormData.featuresText
      .split(/[،,]/)
      .map((f) => f.trim())
      .filter(Boolean);

    const serviceObj: ServiceItem = {
      id: serviceFormData.id || `custom-${Date.now()}`,
      title: serviceFormData.title,
      subtitle: serviceFormData.subtitle || 'خدمة سفر ومتابعة متكاملة',
      description: serviceFormData.description || serviceFormData.subtitle,
      features: featuresArray.length > 0 ? featuresArray : ['حجز فوري ومؤكد', 'دعم فني متواصل'],
      image: serviceFormData.image || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80'
    };

    if (editingService && onEditService) {
      onEditService(serviceObj);
      alert('تم تحديث الخدمة بنجاح!');
    } else if (onAddService) {
      onAddService(serviceObj);
      alert('تمت إضافة الخدمة الجديدة بنجاح إلى القائمة والحجز السريع!');
    }

    setShowServiceForm(false);
    setEditingService(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-cairo">
        
        {/* Main Admin Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[96vh] sm:max-h-[92vh] flex flex-col overflow-hidden text-slate-800 my-auto"
        >
          {/* Header Bar */}
          <div className="bg-[#0F2C59] text-white p-3 sm:p-5 flex items-center justify-between border-b border-amber-500/30 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-sm sm:text-xl font-black text-amber-300 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span>لوحة تحكم إدارة مكتب المحترف</span>
                  <span className="text-[9px] sm:text-[10px] bg-amber-400/20 text-amber-200 px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap">
                    التحكم الشامل
                  </span>
                </h2>
                <p className="hidden sm:block text-xs text-slate-300 font-tajawal">
                  إدارة كاملة للحجوزات، العروض، الخدمات، الثيمات، والوثائق
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* If NOT Authenticated: Show Login Form */}
          {!isAuthenticated ? (
            <div className="p-6 sm:p-12 max-w-md mx-auto my-auto w-full text-center overflow-y-auto">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[#0F2C59] mb-1 font-cairo">تسجيل دخول المدير</h3>
              <p className="text-xs text-slate-500 font-bold mb-6 font-tajawal">
                ادخل بيانات مدير المكتب المعتمدة للوصول لكافة الصلاحيات
              </p>

              <form onSubmit={handleLogin} className="space-y-4 text-right">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold">
                    {loginError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-[#0F2C59] hover:bg-[#153B75] text-amber-300 font-black text-sm rounded-xl transition-all shadow-lg cursor-pointer disabled:opacity-60"
                >
                  {loginLoading ? 'جارٍ التحقق...' : 'دخول لوحة التحكم'}
                </button>
              </form>
            </div>
          ) : (
            /* Authenticated Admin Dashboard View */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              
              {/* Horizontal Scrollable Navigation Tabs Bar */}
              <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center justify-between gap-2 text-xs font-bold shrink-0 overflow-x-auto scroll-smooth">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'bookings'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>الحجوزات ({bookings.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'customers'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>العملاء والوثائق ({customerList.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('offers')}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'offers'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                    <span>العروض ({offers.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('services')}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'services'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>الخدمات ({services.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('themes')}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'themes'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                    <span>الثيمات والمظهر</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                      activeTab === 'stats'
                        ? 'bg-[#0F2C59] text-amber-300 shadow-xs'
                        : 'text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>الإحصائيات</span>
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>

              {/* TAB 1: BOOKINGS MANAGEMENT */}
              {activeTab === 'bookings' && (
                <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold">
                    <span className="text-slate-500">
                      {bookingsLoading ? 'جارٍ تحميل الحجوزات من الخادم...' : `${bookings.length} حجز — من جميع العملاء والأجهزة`}
                    </span>
                    <button
                      type="button"
                      onClick={() => adminToken && fetchBookings(adminToken)}
                      className="flex items-center gap-1 text-[#0F2C59] hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> تحديث
                    </button>
                  </div>
                  {bookingsError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-700 font-bold">
                      {bookingsError}
                    </div>
                  )}

                  {/* Responsive Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-xl w-full">
                      <div className="relative flex-1 w-full">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="بحث برقم الطلب، اسم العميل، أو الجوال..."
                          value={bookingSearch}
                          onChange={(e) => setBookingSearch(e.target.value)}
                          className="w-full pr-9 pl-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                      </div>

                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold outline-none w-full sm:w-auto"
                      >
                        <option value="all">كل الحالات</option>
                        <option value="pending">قيد الانتظار</option>
                        <option value="documents_review">تدقيق المستندات</option>
                        <option value="processing">جاري المعالجة</option>
                        <option value="issued">تم الإصدار / جاهز</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => setShowAddBookingForm(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-all flex-1 sm:flex-none whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة أمر حجز جديد</span>
                      </button>

                      <button
                        onClick={() => exportBookingsToCSV(filteredBookings)}
                        className="bg-[#0F2C59] text-amber-300 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 cursor-pointer hover:bg-[#153B75] flex-1 sm:flex-none whitespace-nowrap"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>تصدير Excel</span>
                      </button>
                    </div>
                  </div>

                  {/* Bookings Table / Cards */}
                  <div className="space-y-3">
                    {filteredBookings.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 font-bold text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        لا توجد طلبات حجز تطابق البحث
                      </div>
                    ) : (
                      filteredBookings.map((b) => (
                        <div
                          key={b.orderId}
                          className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs hover:border-amber-400 transition-all space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2.5">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <span className="font-black text-[#0F2C59] text-sm">{b.orderId}</span>
                              <span className="text-[11px] sm:text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                                {b.serviceTitle}
                              </span>
                              <span className="text-[10px] sm:text-[11px] text-slate-400 font-tajawal">{b.createdAt}</span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                              {/* Status Selector */}
                              <select
                                value={b.status}
                                onChange={(e) => onUpdateBookingStatus(b.orderId, e.target.value)}
                                className="flex-1 sm:flex-none px-2 py-1.5 sm:py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-[11px] sm:text-xs font-bold outline-none cursor-pointer text-center"
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="documents_review">تدقيق المستندات</option>
                                <option value="processing">جاري المعالجة</option>
                                <option value="issued">تم الإصدار / جاهز</option>
                                <option value="completed">مكتمل</option>
                                <option value="cancelled">ملغي</option>
                              </select>

                              {/* Payment Selector */}
                              <select
                                value={b.paymentStatus}
                                onChange={(e) => onUpdatePaymentStatus(b.orderId, e.target.value)}
                                className="flex-1 sm:flex-none px-2 py-1.5 sm:py-1 bg-blue-50 border border-blue-300 text-blue-900 rounded-lg text-[11px] sm:text-xs font-bold outline-none cursor-pointer text-center"
                              >
                                <option value="pending">غير مدفوع</option>
                                <option value="deposit_paid">تم دفع العربون</option>
                                <option value="paid">مدفوع بالكامل</option>
                              </select>

                              {/* Delete Order Button */}
                              {onDeleteBooking && (
                                <button
                                  onClick={() => {
                                    if (confirm(`هل أنت تأكد من حذف أمر الحجز رقم ${b.orderId}؟`)) {
                                      onDeleteBooking(b.orderId);
                                    }
                                  }}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer shrink-0"
                                  title="حذف هذا الأمر"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-tajawal">
                            <div>
                              <span className="text-slate-400 block font-bold">بيانات العميل:</span>
                              <span className="font-bold text-slate-800 block text-sm">{b.customerName}</span>
                              <span className="text-slate-600 font-mono dir-ltr text-right block">{b.phone}</span>
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
                              <span className="text-slate-400 block font-bold">المبلغ والإجمالي:</span>
                              <span className="font-black text-[#0F2C59] text-sm">${b.totalAmount}</span>
                              <span className="block text-slate-500 text-[11px]">طريقة الدفع: {b.paymentMethod === 'e_wallet' ? 'محفظة إلكترونية' : b.paymentMethod === 'office_cash' ? 'نقدًا بالمكتب' : 'تحويل بنكي'}</span>
                            </div>
                          </div>

                          {/* Customer Uploaded Images & Documents Section */}
                          {b.documents && b.documents.length > 0 && (
                            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                              <span className="text-xs font-bold text-[#0F2C59] block mb-1.5 flex items-center gap-1">
                                <FileCheck className="w-3.5 h-3.5 text-amber-500" />
                                <span>وثائق وصور العميل المرفقة ({b.documents.length}):</span>
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {b.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg shadow-2xs hover:border-amber-400 transition-all"
                                  >
                                    {doc.previewUrl ? (
                                      <div
                                        onClick={() => setSelectedImagePreview({ url: doc.previewUrl!, title: doc.name, docName: b.customerName })}
                                        className="w-10 h-10 rounded overflow-hidden bg-slate-100 border border-slate-300 cursor-pointer flex-shrink-0 group relative"
                                      >
                                        <img src={doc.previewUrl} alt={doc.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Maximize2 className="w-3.5 h-3.5 text-white" />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 rounded bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
                                        <FileText className="w-5 h-5" />
                                      </div>
                                    )}

                                    <div className="text-[11px]">
                                      <span className="font-bold text-slate-800 block truncate max-w-[140px]">{doc.name}</span>
                                      <span className="text-[10px] text-slate-400">{doc.size}</span>
                                    </div>

                                    {doc.previewUrl && (
                                      <a
                                        href={doc.previewUrl}
                                        download={doc.name}
                                        className="p-1 text-slate-500 hover:text-amber-600 rounded cursor-pointer"
                                        title="تحميل الصورة"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CUSTOMERS DATABASE & DOCUMENTS */}
              {activeTab === 'customers' && (
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="بحث عن اسم العميل، رقم الهاتف..."
                        value={bookingSearch}
                        onChange={(e) => setBookingSearch(e.target.value)}
                        className="w-full pr-9 pl-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">
                      إجمالي العملاء: {customerList.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {customerList.map((cust) => (
                      <div key={cust.key} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                              {cust.name.substring(0, 1)}
                            </div>
                            <div>
                              <h4 className="font-black text-[#0F2C59] text-sm">{cust.name}</h4>
                              <span className="text-xs font-mono text-slate-500">{cust.phone}</span>
                            </div>
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-black text-amber-600 block">${cust.totalSpent}</span>
                            <span className="text-[10px] text-slate-400">{cust.totalBookings} حجز</span>
                          </div>
                        </div>

                        {/* Customer uploaded documents gallery */}
                        {cust.documents && cust.documents.length > 0 ? (
                          <div>
                            <span className="text-[11px] font-bold text-slate-500 block mb-1">الوثائق والصور المرفقة:</span>
                            <div className="flex flex-wrap gap-2">
                              {cust.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  onClick={() => doc.previewUrl && setSelectedImagePreview({ url: doc.previewUrl, title: doc.name, docName: cust.name })}
                                  className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs cursor-pointer hover:border-amber-400 transition-all"
                                >
                                  {doc.previewUrl ? (
                                    <img src={doc.previewUrl} alt={doc.name} className="w-8 h-8 object-cover rounded border border-slate-300" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-amber-600" />
                                  )}
                                  <span className="font-bold text-slate-700 text-[10px] truncate max-w-[100px]">{doc.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">لا توجد وثائق مرفقة</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: OFFERS MANAGEMENT */}
              {activeTab === 'offers' && (
                <div className="p-4 flex-1 overflow-y-auto space-y-4 font-cairo">
                  {/* Top Bar with Batch Actions & Add Button */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 to-[#0F2C59] p-4 rounded-xl text-white shadow-md">
                    <div>
                      <h3 className="font-black text-amber-300 text-sm flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4 text-amber-400" />
                        <span>لوحة التحكم الكامل بالأسعار والخصومات والصور</span>
                      </h3>
                      <p className="text-[11px] text-slate-300 font-tajawal mt-0.5">
                        يمكنك تغيير الصور، تعديل الأسعار، إخفاء/إظهار الأسعار، إضافة وتعديل نسبة الخصومات فورياً
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {onBatchOfferToggle && (
                        <>
                          <button
                            onClick={() => onBatchOfferToggle({ isPriceNegotiable: true })}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                            title="إخفاء جميع الأسعار وجعلها تفاوضية"
                          >
                            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                            <span>إخفاء كل الأسعار</span>
                          </button>
                          <button
                            onClick={() => onBatchOfferToggle({ isPriceNegotiable: false })}
                            className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-400/30 px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                            title="إظهار جميع الأسعار المحددة"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>إظهار كل الأسعار</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setEditingOffer(null);
                          setShowAddOfferForm(true);
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm cursor-pointer transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة عرض جديد</span>
                      </button>
                    </div>
                  </div>

                  {/* Offers Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map((offer) => (
                      <div key={offer.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all space-y-2 p-3 flex flex-col justify-between">
                        <div>
                          {/* Image Thumbnail with Direct Image Change Camera Button */}
                          <div className="relative h-36 rounded-lg overflow-hidden bg-slate-900 group">
                            <img src={offer.image} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <label className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-black px-2.5 py-1.5 rounded-lg cursor-pointer flex items-center gap-1 shadow-lg">
                                <Camera className="w-3.5 h-3.5" />
                                <span>تغيير الصورة</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    handleImageFileUpload(e, (base64) => {
                                      if (onUpdateOfferToggle) {
                                        onUpdateOfferToggle(offer.id, { image: base64 });
                                      } else if (onEditOffer) {
                                        onEditOffer({ ...offer, image: base64 });
                                      }
                                    });
                                  }}
                                />
                              </label>
                            </div>

                            {/* Discount Badge */}
                            {!offer.hideDiscount && offer.discountBadge && (
                              <div className="absolute top-2 right-2 bg-amber-500 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-md shadow-xs">
                                {offer.discountBadge}
                              </div>
                            )}

                            {/* Negotiable Price Badge */}
                            {offer.isPriceNegotiable && (
                              <div className="absolute top-2 left-2 bg-[#0F2C59] text-amber-300 border border-amber-400/40 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                                <EyeOff className="w-3 h-3 text-amber-400" />
                                <span>السعر مخفي (تفاوضي)</span>
                              </div>
                            )}
                          </div>

                          {/* Title & Location */}
                          <div className="mt-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-[#0F2C59] text-xs line-clamp-1">{offer.title}</h4>
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{offer.duration}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-tajawal">{offer.city} - {offer.country}</span>
                          </div>

                          {/* Price & Hide Control */}
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mt-2 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500 font-bold">تعديل الأسعار المباشرة:</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateOfferToggle) {
                                    onUpdateOfferToggle(offer.id, { isPriceNegotiable: !offer.isPriceNegotiable });
                                  }
                                }}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 transition-all cursor-pointer ${
                                  offer.isPriceNegotiable
                                    ? 'bg-amber-500/20 text-amber-800 border border-amber-500/40'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {offer.isPriceNegotiable ? (
                                  <>
                                    <EyeOff className="w-3 h-3 text-amber-700" />
                                    <span>السعر مخفي</span>
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                    <span>السعر ظاهر</span>
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <label className="text-[9px] text-slate-500 block">السعر المخفض ($)</label>
                                <input
                                  type="number"
                                  value={offer.price}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    onUpdateOfferPrice(offer.id, val, offer.originalPrice);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded font-black text-amber-700 text-xs"
                                />
                              </div>

                              <div>
                                <label className="text-[9px] text-slate-500 block">السعر قبل الخصم ($)</label>
                                <input
                                  type="number"
                                  value={offer.originalPrice}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    onUpdateOfferPrice(offer.id, offer.price, val);
                                  }}
                                  className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-slate-500 line-through text-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Quick Discount Percent Application */}
                          <div className="mt-2">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">تطبيق خصم سريع بضغطة زر:</span>
                            <div className="flex flex-wrap gap-1">
                              {[10, 15, 20, 25, 30, 50].map((pct) => (
                                <button
                                  key={pct}
                                  type="button"
                                  onClick={() => {
                                    const orig = offer.originalPrice > offer.price ? offer.originalPrice : offer.price;
                                    const newP = Math.round(orig * (1 - pct / 100));
                                    if (onUpdateOfferToggle) {
                                      onUpdateOfferToggle(offer.id, {
                                        price: newP,
                                        originalPrice: orig,
                                        discountBadge: `خصم ${pct}%`,
                                        isPriceNegotiable: false,
                                        hideDiscount: false
                                      });
                                    }
                                  }}
                                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded text-[10px] font-extrabold cursor-pointer transition-all"
                                >
                                  %{pct}
                                </button>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateOfferToggle) {
                                    onUpdateOfferToggle(offer.id, {
                                      price: offer.originalPrice || offer.price,
                                      discountBadge: '',
                                      hideDiscount: true
                                    });
                                  }
                                }}
                                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[10px] font-bold cursor-pointer"
                              >
                                إلغاء الخصم
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t mt-3">
                          <button
                            onClick={() => setEditingOffer(offer)}
                            className="px-3 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>التعديل الشامل</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`هل أنت تأكد من حذف العرض ${offer.title}؟`)) {
                                onDeleteOffer(offer.id);
                              }
                            }}
                            className="px-2.5 py-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1 border border-rose-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SERVICES MANAGEMENT */}
              {activeTab === 'services' && (
                <div className="p-4 flex-1 overflow-y-auto space-y-4">
                  <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <h3 className="font-black text-[#0F2C59] text-sm">إدارة خدمات الموقع والحجز السريع</h3>
                      <p className="text-[11px] text-slate-500 font-tajawal">
                        يمكنك إضافة، تعديل، أو حذف أي خدمة لتظهر مباشرة للعملاء
                      </p>
                    </div>

                    <button
                      onClick={handleOpenAddService}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة خدمة جديدة</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((serv) => (
                      <div key={serv.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="w-16 h-16 rounded-xl bg-slate-100 p-2 border border-slate-200 mb-2 flex items-center justify-center">
                            <img src={serv.image} alt={serv.title} className="max-w-full max-h-full object-contain" />
                          </div>
                          <h4 className="font-black text-[#0F2C59] text-sm">{serv.title}</h4>
                          <p className="text-xs text-slate-500 font-bold mb-2">{serv.subtitle}</p>
                          <ul className="text-[11px] text-slate-600 space-y-1 list-disc pr-4 font-tajawal">
                            {serv.features.map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t">
                          <button
                            onClick={() => handleOpenEditService(serv)}
                            className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold border border-blue-200 flex items-center gap-1 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>تعديل</span>
                          </button>

                          {onDeleteService && (
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت تأكد من حذف خدمة (${serv.title})؟`)) {
                                  onDeleteService(serv.id);
                                }
                              }}
                              className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold border border-rose-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: THEMES MANAGEMENT */}
              {activeTab === 'themes' && (
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  <div className="bg-gradient-to-r from-[#0F2C59] via-[#1E3A8A] to-amber-600 text-white p-5 rounded-2xl shadow-md border border-amber-400/30">
                    <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                      <Palette className="w-5 h-5 text-amber-300" />
                      <span>ثيمات ومظهر الموقع الديناميكية</span>
                    </h3>
                    <p className="text-xs text-slate-200 mt-1 font-tajawal">
                      اختر الثيم المفضل لمكتبك لتغيير الألوان والشكل الخارجي لكافة أجزاء الموقع فورًا
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Theme 1: Navy & Gold */}
                    <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      currentTheme === 'navy' ? 'border-amber-500 ring-4 ring-amber-500/20 bg-amber-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <div className="h-24 rounded-xl bg-gradient-to-r from-[#0F2C59] to-[#0B1E3D] p-3 text-white flex flex-col justify-between mb-3 border border-amber-400/40">
                        <span className="text-xs font-black text-amber-300">مكتب المحترف للسفريات</span>
                        <div className="flex gap-1">
                          <span className="w-4 h-4 rounded-full bg-[#0F2C59] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-[#D4AF37] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-slate-50 border border-slate-300"></span>
                        </div>
                      </div>
                      <h4 className="font-black text-[#0F2C59] text-sm">🔵 الكلاسيكي الملكي (Navy & Gold)</h4>
                      <p className="text-xs text-slate-500 font-tajawal mt-1 mb-3">الأزرق الملكي الداكن مع لمسات ذهبية فخمة</p>
                      <button
                        onClick={() => onChangeTheme && onChangeTheme('navy')}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTheme === 'navy' ? 'bg-amber-500 text-slate-900 font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {currentTheme === 'navy' ? '✓ الثيم المفعل حاليًا' : 'تطبيق هذا الثيم'}
                      </button>
                    </div>

                    {/* Theme 2: Emerald & Gold */}
                    <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      currentTheme === 'emerald' ? 'border-emerald-500 ring-4 ring-emerald-500/20 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <div className="h-24 rounded-xl bg-gradient-to-r from-[#064E3B] to-[#022C22] p-3 text-white flex flex-col justify-between mb-3 border border-emerald-400/40">
                        <span className="text-xs font-black text-emerald-300">رحلات الحج والعمرة</span>
                        <div className="flex gap-1">
                          <span className="w-4 h-4 rounded-full bg-[#064E3B] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-[#10B981] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-amber-400 border border-slate-300"></span>
                        </div>
                      </div>
                      <h4 className="font-black text-emerald-900 text-sm">🟢 الزمردي الإسلامي (Emerald & Gold)</h4>
                      <p className="text-xs text-slate-500 font-tajawal mt-1 mb-3">الأخضر الزمردي الراقي لعشاق العمرة والحج</p>
                      <button
                        onClick={() => onChangeTheme && onChangeTheme('emerald')}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTheme === 'emerald' ? 'bg-emerald-600 text-white font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {currentTheme === 'emerald' ? '✓ الثيم المفعل حاليًا' : 'تطبيق هذا الثيم'}
                      </button>
                    </div>

                    {/* Theme 3: Midnight Dark */}
                    <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      currentTheme === 'dark' ? 'border-amber-500 ring-4 ring-amber-500/20 bg-slate-900' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <div className="h-24 rounded-xl bg-gradient-to-r from-[#0F172A] to-[#020617] p-3 text-white flex flex-col justify-between mb-3 border border-slate-700">
                        <span className="text-xs font-black text-amber-400">الليل الداكن الفاخر</span>
                        <div className="flex gap-1">
                          <span className="w-4 h-4 rounded-full bg-[#0F172A] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-[#F59E0B] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-slate-800 border border-slate-500"></span>
                        </div>
                      </div>
                      <h4 className="font-black text-slate-900 text-sm">🌑 الليل الداكن (Midnight Dark)</h4>
                      <p className="text-xs text-slate-500 font-tajawal mt-1 mb-3">ثيم ليلي داكن وأنيق ومريح للعينين</p>
                      <button
                        onClick={() => onChangeTheme && onChangeTheme('dark')}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTheme === 'dark' ? 'bg-amber-500 text-slate-900 font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {currentTheme === 'dark' ? '✓ الثيم المفعل حاليًا' : 'تطبيق هذا الثيم'}
                      </button>
                    </div>

                    {/* Theme 4: Imperial Purple */}
                    <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      currentTheme === 'purple' ? 'border-purple-500 ring-4 ring-purple-500/20 bg-purple-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <div className="h-24 rounded-xl bg-gradient-to-r from-[#3B0764] to-[#2E0249] p-3 text-white flex flex-col justify-between mb-3 border border-purple-400/40">
                        <span className="text-xs font-black text-purple-300">الأرجواني الملكي</span>
                        <div className="flex gap-1">
                          <span className="w-4 h-4 rounded-full bg-[#3B0764] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-[#A855F7] border border-white"></span>
                        </div>
                      </div>
                      <h4 className="font-black text-purple-900 text-sm">🟣 الأرجواني الفاخر (Royal Purple)</h4>
                      <p className="text-xs text-slate-500 font-tajawal mt-1 mb-3">الأرجواني الفاخر والمتميز</p>
                      <button
                        onClick={() => onChangeTheme && onChangeTheme('purple')}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTheme === 'purple' ? 'bg-purple-600 text-white font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {currentTheme === 'purple' ? '✓ الثيم المفعل حاليًا' : 'تطبيق هذا الثيم'}
                      </button>
                    </div>

                    {/* Theme 5: Burgundy Ruby */}
                    <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      currentTheme === 'ruby' ? 'border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/30' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}>
                      <div className="h-24 rounded-xl bg-gradient-to-r from-[#4C0519] to-[#2A020D] p-3 text-white flex flex-col justify-between mb-3 border border-rose-400/40">
                        <span className="text-xs font-black text-rose-300">العنابي الياقوتي</span>
                        <div className="flex gap-1">
                          <span className="w-4 h-4 rounded-full bg-[#4C0519] border border-white"></span>
                          <span className="w-4 h-4 rounded-full bg-[#F43F5E] border border-white"></span>
                        </div>
                      </div>
                      <h4 className="font-black text-rose-900 text-sm">🔴 العنابي الياقوتي (Burgundy Ruby)</h4>
                      <p className="text-xs text-slate-500 font-tajawal mt-1 mb-3">اللون العنابي الملوكي الياقوتي</p>
                      <button
                        onClick={() => onChangeTheme && onChangeTheme('ruby')}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentTheme === 'ruby' ? 'bg-rose-600 text-white font-black' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {currentTheme === 'ruby' ? '✓ الثيم المفعل حاليًا' : 'تطبيق هذا الثيم'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: STATS & REPORTS */}
              {activeTab === 'stats' && (
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 block">إجمالي المبيعات</span>
                      <span className="text-2xl font-black text-[#0F2C59]">
                        ${bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 block">عدد الطلبات المكتملة</span>
                      <span className="text-2xl font-black text-emerald-600">
                        {bookings.filter(b => b.status === 'completed' || b.status === 'issued').length}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 block">عدد العملاء المسجلين</span>
                      <span className="text-2xl font-black text-amber-600">
                        {customerList.length}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="font-black text-[#0F2C59] text-sm">نسخ احتياطي للبيانات</h4>
                    <button
                      onClick={() => exportBackupJSON(bookings, offers)}
                      className="bg-[#0F2C59] text-amber-300 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 cursor-pointer hover:bg-[#153B75]"
                    >
                      <HardDriveDownload className="w-4 h-4" />
                      <span>تحميل النسخة الاحتياطية الكاملة (JSON)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </motion.div>

        {/* IMAGE PREVIEW LIGHTBOX MODAL */}
        {selectedImagePreview && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center space-y-3">
              <div className="w-full flex items-center justify-between text-white border-b border-slate-700 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-amber-300">{selectedImagePreview.title}</h4>
                  {selectedImagePreview.docName && (
                    <span className="text-xs text-slate-300 block">العميل: {selectedImagePreview.docName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={selectedImagePreview.url}
                    download={selectedImagePreview.title}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل</span>
                  </a>
                  <button
                    onClick={() => setSelectedImagePreview(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="w-full flex-1 overflow-auto flex items-center justify-center p-2 bg-slate-950/50 rounded-xl border border-slate-800">
                <img
                  src={selectedImagePreview.url}
                  alt={selectedImagePreview.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        )}

        {/* MANUAL ADD BOOKING FORM MODAL */}
        {showAddBookingForm && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-[#0F2C59] text-base">إضافة أمر حجز جديد يدويًا</h3>
                <button onClick={() => setShowAddBookingForm(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmitManualBooking} className="space-y-3 text-xs font-bold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">اسم العميل *</label>
                    <input
                      type="text"
                      required
                      placeholder="اسم العميل الكامل"
                      value={manualBookingData.customerName}
                      onChange={(e) => setManualBookingData({ ...manualBookingData, customerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">رقم الهاتف والجوال *</label>
                    <input
                      type="text"
                      required
                      placeholder="77XXXXXXX"
                      value={manualBookingData.phone}
                      onChange={(e) => setManualBookingData({ ...manualBookingData, phone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">نوع الخدمة *</label>
                    <select
                      value={manualBookingData.serviceType}
                      onChange={(e) => setManualBookingData({ 
                        ...manualBookingData, 
                        serviceType: e.target.value,
                        serviceTitle: e.target.options[e.target.selectedIndex].text
                      })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="flight">حجز طيران</option>
                      <option value="passport">تجديد واستخراج جواز سفر</option>
                      <option value="hajj_umrah">خدمات الحج والعمرة</option>
                      <option value="visas">تأشيرات وزيارات عائلية</option>
                      <option value="buses">حافلات ونقل جماعي</option>
                      <option value="hotels">حجز فنادق</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">تفاصيل الوجهة أو الخدمة</label>
                    <input
                      type="text"
                      placeholder="صنعاء ← جدة / دبي / القاهرة"
                      value={manualBookingData.destination}
                      onChange={(e) => setManualBookingData({ ...manualBookingData, destination: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">تاريخ السفر</label>
                    <input
                      type="date"
                      value={manualBookingData.travelDate}
                      onChange={(e) => setManualBookingData({ ...manualBookingData, travelDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">إجمالي المبلغ ($)</label>
                    <input
                      type="number"
                      value={manualBookingData.totalAmount}
                      onChange={(e) => setManualBookingData({ ...manualBookingData, totalAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">حالة الطلب</label>
                    <select
                      value={manualBookingData.status}
                      onChange={(e) => setManualBookingData({ ...manualBookingData, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="documents_review">تدقيق المستندات</option>
                      <option value="processing">جاري المعالجة</option>
                      <option value="issued">تم الإصدار / جاهز</option>
                      <option value="completed">مكتمل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">حالة الدفع</label>
                    <select
                      value={manualBookingData.paymentStatus}
                      onChange={(e) => setManualBookingData({ ...manualBookingData, paymentStatus: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="paid">مدفوع بالكامل</option>
                      <option value="deposit_paid">دفع العربون</option>
                      <option value="pending">غير مدفوع</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">ملاحظات إضافية</label>
                  <textarea
                    rows={2}
                    value={manualBookingData.notes}
                    onChange={(e) => setManualBookingData({ ...manualBookingData, notes: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBookingForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold cursor-pointer"
                  >
                    حفظ الحجز الجديد
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
                    {/* ADD / EDIT SERVICE MODAL */}
        {showServiceForm && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-cairo">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-[#0F2C59] text-base">
                  {editingService ? 'تعديل بيانات الخدمة' : 'إضافة خدمة جديدة للحجز السريع'}
                </h3>
                <button onClick={() => setShowServiceForm(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-3 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">اسم الخدمة الرئيسي *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: حجز قطار الحرمين السريع / تأشيرة الصين"
                    value={serviceFormData.title}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">العنوان الفرعي الوصفي</label>
                  <input
                    type="text"
                    placeholder="متابعة سريعة وإجراءات رسمية مؤكدة"
                    value={serviceFormData.subtitle}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">شرح مفصل للخدمة</label>
                  <textarea
                    rows={2}
                    placeholder="اكتب وصفًا كاملاً للميزات وتفاصيل الطلب..."
                    value={serviceFormData.description}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block mb-1">الميزات الرئيسية (افصل بينها بفواصل)</label>
                  <input
                    type="text"
                    placeholder="حجز فوري، أسعار منافسة، متابعة مستمرة"
                    value={serviceFormData.featuresText}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, featuresText: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Service Image Section */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <label className="block font-black text-[#0F2C59] text-xs flex items-center gap-1">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>صورة/أيقونة الخدمة (تغيير أو رفع جديدة):</span>
                  </label>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="رابط الصورة المباشر"
                      value={serviceFormData.image}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, image: e.target.value })}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />

                    <label className="bg-[#0F2C59] hover:bg-slate-800 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع من الجهاز</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, (url) => setServiceFormData({ ...serviceFormData, image: url }))}
                      />
                    </label>
                  </div>

                  {/* Stock Library Grid for Services */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">اختر من الصور الجاهزة الفاخرة:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
                      {PRESET_STOCK_IMAGES.map((stk, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setServiceFormData({ ...serviceFormData, image: stk.url })}
                          className={`relative h-10 rounded border overflow-hidden cursor-pointer group transition-all ${
                            serviceFormData.image === stk.url ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200 hover:border-slate-400'
                          }`}
                          title={stk.label}
                        >
                          <img src={stk.url} alt={stk.label} className="w-full h-full object-cover" />
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center font-tajawal truncate px-0.5">
                            {stk.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Image Preview */}
                  {serviceFormData.image && (
                    <div className="relative h-24 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 mt-2">
                      <img src={serviceFormData.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                        معاينة الصورة
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowServiceForm(false)}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#0F2C59] text-amber-300 rounded-lg font-bold cursor-pointer"
                  >
                    حفظ الخدمة
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT OFFER MODAL */}
        {(showAddOfferForm || editingOffer) && (
          <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 font-cairo">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-black text-[#0F2C59] text-base flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-500" />
                  <span>{editingOffer ? 'تعديل وتحديد بيانات العرض بالكامل' : 'إضافة عرض وتخفيض جديد'}</span>
                </h3>
                <button
                  onClick={() => {
                    setShowAddOfferForm(false);
                    setEditingOffer(null);
                  }}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveOffer} className="space-y-4 text-xs font-bold text-slate-700">
                {/* Title */}
                <div>
                  <label className="block mb-1">عنوان العرض الرئيسي *</label>
                  <input
                    type="text"
                    required
                    placeholder="رحلة دبي الفاخرة شاملة التذكرة والفندق"
                    value={editingOffer ? editingOffer.title : newOfferData.title}
                    onChange={(e) => {
                      if (editingOffer) setEditingOffer({ ...editingOffer, title: e.target.value });
                      else setNewOfferData({ ...newOfferData, title: e.target.value });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                {/* Country, City, Duration, Category */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">الدولة</label>
                    <input
                      type="text"
                      placeholder="الإمارات / السعودية / مصر"
                      value={editingOffer ? editingOffer.country : newOfferData.country}
                      onChange={(e) => {
                        if (editingOffer) setEditingOffer({ ...editingOffer, country: e.target.value });
                        else setNewOfferData({ ...newOfferData, country: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">المدينة</label>
                    <input
                      type="text"
                      placeholder="دبي / مكة المكرمة / القاهرة"
                      value={editingOffer ? editingOffer.city : newOfferData.city}
                      onChange={(e) => {
                        if (editingOffer) setEditingOffer({ ...editingOffer, city: e.target.value });
                        else setNewOfferData({ ...newOfferData, city: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">مدة العرض</label>
                    <input
                      type="text"
                      placeholder="5 أيام / 4 ليالي"
                      value={editingOffer ? editingOffer.duration : newOfferData.duration}
                      onChange={(e) => {
                        if (editingOffer) setEditingOffer({ ...editingOffer, duration: e.target.value });
                        else setNewOfferData({ ...newOfferData, duration: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">تصنيف العرض</label>
                    <select
                      value={editingOffer ? editingOffer.category : newOfferData.category}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        if (editingOffer) setEditingOffer({ ...editingOffer, category: val });
                        else setNewOfferData({ ...newOfferData, category: val });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="package">برنامج سياحي متكامل</option>
                      <option value="hajj_umrah">عمرة وحج</option>
                      <option value="flight">تذاكر طيران</option>
                      <option value="visa">تأشيرة وفيزا</option>
                    </select>
                  </div>
                </div>

                {/* Pricing & Discount Control Box */}
                <div className="bg-amber-50/70 border border-amber-300/80 p-3 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-1.5">
                    <span className="font-black text-[#0F2C59] text-xs flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>التحكم بالأسعار والخصومات:</span>
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold">حساب تلقائي دقيق</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-800">السعر الأساسي قبل الخصم ($)</label>
                      <input
                        type="number"
                        value={editingOffer ? editingOffer.originalPrice : newOfferData.originalPrice}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (editingOffer) setEditingOffer({ ...editingOffer, originalPrice: val });
                          else setNewOfferData({ ...newOfferData, originalPrice: val });
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-amber-900 font-black">السعر المخفض الحالي ($) *</label>
                      <input
                        type="number"
                        required
                        value={editingOffer ? editingOffer.price : newOfferData.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (editingOffer) setEditingOffer({ ...editingOffer, price: val });
                          else setNewOfferData({ ...newOfferData, price: val });
                        }}
                        className="w-full px-3 py-2 bg-white border border-amber-400 rounded-lg text-xs font-black text-amber-700"
                      />
                    </div>
                  </div>

                  {/* Interactive Discount Percentage Buttons */}
                  <div>
                    <label className="block mb-1 text-[11px] text-slate-600">تطبيق نسبة خصم تلقائية ومباشرة:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[10, 15, 20, 25, 30, 40, 50].map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            const current = editingOffer || newOfferData;
                            const orig = current.originalPrice > current.price ? current.originalPrice : current.price;
                            const calcPrice = Math.round(orig * (1 - pct / 100));
                            const badge = `خصم ${pct}%`;

                            if (editingOffer) {
                              setEditingOffer({
                                ...editingOffer,
                                originalPrice: orig,
                                price: calcPrice,
                                discountBadge: badge,
                                hideDiscount: false
                              });
                            } else {
                              setNewOfferData({
                                ...newOfferData,
                                originalPrice: orig,
                                price: calcPrice,
                                discountBadge: badge,
                                hideDiscount: false
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-md text-[11px] font-black cursor-pointer transition-all shadow-2xs"
                        >
                          خصم {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Discount Badge Input */}
                  <div>
                    <label className="block mb-1">شارة ونشاط الخصم المكتوبة (Badge Text)</label>
                    <input
                      type="text"
                      placeholder="خصم 25% بمناسبة الموسم / عرض خاص محدودة"
                      value={editingOffer ? editingOffer.discountBadge || '' : newOfferData.discountBadge || ''}
                      onChange={(e) => {
                        if (editingOffer) setEditingOffer({ ...editingOffer, discountBadge: e.target.value });
                        else setNewOfferData({ ...newOfferData, discountBadge: e.target.value });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Price Display Toggles */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <span className="block font-black text-[#0F2C59] text-xs">خيارات الرؤية والعرض للعميل:</span>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingOffer ? !!editingOffer.isPriceNegotiable : !!newOfferData.isPriceNegotiable}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (editingOffer) setEditingOffer({ ...editingOffer, isPriceNegotiable: checked });
                        else setNewOfferData({ ...newOfferData, isPriceNegotiable: checked });
                      }}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>🔒 إخفاء السعر الرقمي تماماً (جعل السعر تفاوضي عند الطلب والتواصل)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingOffer ? !!editingOffer.hideDiscount : !!newOfferData.hideDiscount}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (editingOffer) setEditingOffer({ ...editingOffer, hideDiscount: checked });
                        else setNewOfferData({ ...newOfferData, hideDiscount: checked });
                      }}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>🏷️ إخفاء شارة ونسبة الخصم من الكارت</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingOffer ? !!editingOffer.isHidden : !!newOfferData.isHidden}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (editingOffer) setEditingOffer({ ...editingOffer, isHidden: checked });
                        else setNewOfferData({ ...newOfferData, isHidden: checked });
                      }}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                    />
                    <span>👁️ إخفاء العرض مؤقتاً من الصفحة الرئيسية</span>
                  </label>
                </div>

                {/* Offer Image Control */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                  <label className="block font-black text-[#0F2C59] text-xs flex items-center gap-1">
                    <Camera className="w-4 h-4 text-amber-500" />
                    <span>صورة العرض (رفع صورة جديدة أو اختيار صورة جاهزة):</span>
                  </label>

                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="رابط صورة العرض مباشر"
                      value={editingOffer ? editingOffer.image : newOfferData.image}
                      onChange={(e) => {
                        if (editingOffer) setEditingOffer({ ...editingOffer, image: e.target.value });
                        else setNewOfferData({ ...newOfferData, image: e.target.value });
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />

                    <label className="bg-[#0F2C59] hover:bg-slate-800 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 shadow-xs whitespace-nowrap">
                      <Upload className="w-3.5 h-3.5" />
                      <span>رفع من جهازك</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleImageFileUpload(e, (url) => {
                            if (editingOffer) setEditingOffer({ ...editingOffer, image: url });
                            else setNewOfferData({ ...newOfferData, image: url });
                          });
                        }}
                      />
                    </label>
                  </div>

                  {/* Stock Library Grid for Offers */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">اختر من المعرض الجاهز للرحلات:</span>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-slate-200 rounded-lg">
                      {PRESET_STOCK_IMAGES.map((stk, idx) => {
                        const currentImg = editingOffer ? editingOffer.image : newOfferData.image;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (editingOffer) setEditingOffer({ ...editingOffer, image: stk.url });
                              else setNewOfferData({ ...newOfferData, image: stk.url });
                            }}
                            className={`relative h-10 rounded border overflow-hidden cursor-pointer group transition-all ${
                              currentImg === stk.url ? 'ring-2 ring-amber-500 border-amber-500' : 'border-slate-200 hover:border-slate-400'
                            }`}
                            title={stk.label}
                          >
                            <img src={stk.url} alt={stk.label} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center font-tajawal truncate px-0.5">
                              {stk.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Image Preview */}
                  {(editingOffer?.image || newOfferData?.image) && (
                    <div className="relative h-28 rounded-lg overflow-hidden border border-slate-300 bg-slate-900 mt-2">
                      <img
                        src={editingOffer ? editingOffer.image : newOfferData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 right-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded">
                        معاينة الصورة العلوية
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddOfferForm(false);
                      setEditingOffer(null);
                    }}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg font-bold cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-extrabold rounded-lg shadow-md cursor-pointer"
                  >
                    حفظ وتحديث العرض
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </AnimatePresence>
  );
};
