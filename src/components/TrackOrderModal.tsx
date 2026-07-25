import React, { useState } from 'react';
import { BookingRequest } from '../types';
import { 
  X, Search, QrCode, CheckCircle2, Clock, FileText, Send, Download, 
  MapPin, AlertCircle, ShieldCheck, FileCheck, ArrowRight
} from 'lucide-react';
import { generateBookingPDF } from '../utils/pdfGenerator';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBookings?: BookingRequest[];
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  userBookings = []
}) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<BookingRequest | null>(
    userBookings.length > 0 ? userBookings[0] : null
  );
  const [errorMsg, setErrorMsg] = useState('');

  // Sample fallback orders if user searches without booking first
  const mockOrders: Record<string, BookingRequest> = {
    'MUH-2026-8942': {
      orderId: 'MUH-2026-8942',
      serviceType: 'flight',
      serviceTitle: 'حجز طيران - دبي',
      customerName: 'محمد أحمد العثماني',
      phone: '771234707',
      email: 'mohammed@example.com',
      destination: 'الإمارات (دبي)',
      travelDate: '2026-08-15',
      passengers: 2,
      status: 'processing',
      createdAt: '2026-07-24',
      updatedAt: '2026-07-25',
      documents: [
        { id: '1', name: 'صورة_جواز_السفر.pdf', size: '1.2 MB', type: 'PDF', uploadedAt: '10:30 AM' }
      ],
      paymentMethod: 'e_wallet',
      paymentStatus: 'paid',
      totalAmount: 760,
      loyaltyPointsEarned: 76
    },
    'MUH-2026-1042': {
      orderId: 'MUH-2026-1042',
      serviceType: 'hajj_umrah',
      serviceTitle: 'برنامج العمرة المتميز VIP',
      customerName: 'عبدالرحمن قاسم',
      phone: '730550440',
      destination: 'مكة المكرمة والمدينة المنورة',
      travelDate: '2026-09-01',
      passengers: 4,
      status: 'ready',
      createdAt: '2026-07-20',
      updatedAt: '2026-07-25',
      documents: [
        { id: '1', name: 'جوازات_العائلة.pdf', size: '3.4 MB', type: 'PDF', uploadedAt: '02:15 PM' }
      ],
      paymentMethod: 'office_cash',
      paymentStatus: 'paid',
      totalAmount: 1280,
      loyaltyPointsEarned: 128
    }
  };

  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const cleanQuery = searchQuery.trim().toUpperCase();

    // Check bookings made on this device first (fastest, no network needed)
    const foundUserBooking = userBookings.find(
      (b) => b.orderId.toUpperCase() === cleanQuery || b.phone.includes(cleanQuery)
    );

    if (foundUserBooking) {
      setSelectedOrder(foundUserBooking);
      return;
    }

    // Check mock/demo orders
    if (mockOrders[cleanQuery]) {
      setSelectedOrder(mockOrders[cleanQuery]);
      return;
    }

    // Fall back to the server, so a customer can track an order number even
    // from a different phone/browser than the one they booked with.
    setSearching(true);
    try {
      const res = await fetch(`/api/bookings?orderId=${encodeURIComponent(cleanQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        return;
      }
    } catch {
      // ignore, fall through to not-found message
    } finally {
      setSearching(false);
    }

    setErrorMsg('لم يتم العثور على طلب بهذا الرقم أو الجوال. يمكنك التأكد من الرقم أو التواصل مباشرة معنا.');
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'documents_review': return 2;
      case 'processing': return 3;
      case 'issued': case 'ready': return 4;
      case 'completed': return 5;
      default: return 1;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'تم تقديم الطلب وفي انتظار المراجعة';
      case 'documents_review': return 'جاري تدقيق وفحص المستندات والجوازات';
      case 'processing': return 'جاري معالجة وإصدار التذكرة/التأشيرة';
      case 'issued': case 'ready': return 'تم الإصدار والطلب جاهز للتسليم أو الاستلام';
      case 'completed': return 'تم إكمال الطلب بنجاح';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0F2C59] p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <QrCode className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-xl font-black font-cairo">تتبع حالة الطلب لحظياً</h3>
              <p className="text-xs text-amber-300 font-tajawal">استعلام فوري عن التذاكر والتأشيرات وجوازات السفر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="text"
                required
                placeholder="أدخل رقم الطلب (مثال: MUH-2026-8942) أو رقم الجوال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="btn-gold px-5 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer flex-shrink-0 disabled:opacity-60"
            >
              <span>{searching ? 'جارٍ البحث...' : 'بحث عن الطلب'}</span>
            </button>
          </form>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2 font-tajawal">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Select from User Recent Bookings */}
          {userBookings.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-500 font-tajawal">طلباتك الحالية المسجلة بالدورة:</span>
              <div className="flex flex-wrap gap-2">
                {userBookings.map((b) => (
                  <button
                    key={b.orderId}
                    onClick={() => { setSelectedOrder(b); setErrorMsg(''); }}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      selectedOrder?.orderId === b.orderId 
                        ? 'bg-[#0F2C59] text-amber-300 border-[#0F2C59]' 
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    #{b.orderId} - {b.serviceTitle}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Display Order Info */}
          {selectedOrder ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Order Header Badge */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#0F2C59] font-cairo">
                      #{selectedOrder.orderId}
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full font-tajawal">
                      {selectedOrder.serviceTitle}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-tajawal block mt-0.5">
                    العميل: {selectedOrder.customerName} ({selectedOrder.phone})
                  </span>
                </div>

                <div className="text-left">
                  <span className="block text-[10px] text-slate-400 font-tajawal">تاريخ الإنشاء</span>
                  <span className="text-xs font-bold text-slate-800 font-cairo">{selectedOrder.createdAt}</span>
                </div>
              </div>

              {/* Status Stepper */}
              <div>
                <h4 className="text-xs font-bold text-slate-600 mb-3 font-tajawal">مسار معالجة الطلب:</h4>
                <div className="grid grid-cols-5 gap-1 text-center font-tajawal">
                  {[
                    { step: 1, label: 'استلام الطلب' },
                    { step: 2, label: 'فحص المستندات' },
                    { step: 3, label: 'جاري المعالجة' },
                    { step: 4, label: 'جاهز للتسليم' },
                    { step: 5, label: 'مكتمل' },
                  ].map((s) => {
                    const currentStep = getStatusStep(selectedOrder.status);
                    const isCompleted = currentStep >= s.step;
                    const isCurrent = currentStep === s.step;

                    return (
                      <div key={s.step} className="flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                          isCompleted
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                        </div>
                        <span className={`text-[10px] sm:text-xs leading-tight font-bold ${
                          isCurrent ? 'text-amber-600 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Current Status Message Box */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="block text-xs font-bold text-emerald-950 font-cairo">الحالة الحالية للطلب:</span>
                  <span className="text-xs font-bold text-emerald-800 font-tajawal">
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              {/* Details & Documents */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-tajawal">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-[#0F2C59] border-b pb-1">تفاصيل السفر</div>
                  <div className="flex justify-between"><span className="text-slate-500">الوجهة:</span> <span className="font-bold">{selectedOrder.destination}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">تاريخ السفر:</span> <span className="font-bold">{selectedOrder.travelDate}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">المسافرين:</span> <span className="font-bold">{selectedOrder.passengers} شخص</span></div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="font-bold text-[#0F2C59] border-b pb-1">المستندات المرفقة</div>
                  {selectedOrder.documents && selectedOrder.documents.length > 0 ? (
                    selectedOrder.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between text-[11px] text-slate-700">
                        <span className="truncate">{doc.name}</span>
                        <span className="text-emerald-600 font-bold">مرفق ✓</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-slate-400 text-[11px]">لا يوجد مستندات مرفقة</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => generateBookingPDF(selectedOrder)}
                  className="w-full sm:w-auto flex-1 bg-[#0F2C59] hover:bg-[#153B75] text-amber-300 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل سند الحجز والـ PDF</span>
                </button>

                <a
                  href={`https://wa.me/967771234707?text=${encodeURIComponent(`استفسار عن الطلب رقم #${selectedOrder.orderId}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>محادثة الإدارة حول الطلب</span>
                </a>
              </div>

            </div>
          ) : (
            <div className="text-center py-8 text-slate-500 text-xs font-bold font-tajawal">
              قم بأدخال رقم الطلب أعلاه لمعاينة حالة المعالجة والتفاصيل وتنزيل السند.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
