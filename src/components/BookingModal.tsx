import React, { useState, useRef } from 'react';
import { ServiceType, BookingRequest, UploadedDocument } from '../types';
import { 
  X, Plane, FileText, Compass, Users, Bus, Hotel, Send, CheckCircle2, 
  Phone, Calendar, User, Upload, Trash2, FileCheck, Download, CreditCard, 
  QrCode, ShieldCheck, Wallet, DollarSign, Building2
} from 'lucide-react';
import { generateBookingPDF } from '../utils/pdfGenerator';
import { generateQRCodeDataUrl } from '../utils/qrUtils';

interface BookingModalProps {
  isOpen: boolean;
  initialService?: ServiceType;
  onClose: () => void;
  onBookingCreated?: (booking: BookingRequest) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  initialService = 'flight',
  onClose,
  onBookingCreated
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<ServiceType>(initialService);
  const [step, setStep] = useState<'details' | 'documents' | 'payment' | 'confirmation'>('details');
  const [createdBooking, setCreatedBooking] = useState<BookingRequest | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    destination: 'الإمارات (دبي)',
    travelDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    passengers: 1,
    notes: '',
    paymentMethod: 'e_wallet' as 'e_wallet' | 'card' | 'bank_transfer' | 'office_cash'
  });

  // Uploaded Documents
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (type: ServiceType) => {
    setActiveTab(type);
    setStep('details');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    
    const newDocs: UploadedDocument[] = filesArray.map((file: File) => ({
      id: 'doc-' + Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type.includes('image') ? 'صورة' : 'ملف PDF',
      uploadedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }));

    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleFinalSubmit = async () => {
    // Generate Order ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MUH-2026-${randomNum}`;
    const now = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

    const qrText = `مكتب المحترف للسفريات والسياحة\nطلب رقم: ${orderId}\nالعميل: ${formData.fullName}\nالهاتف: ${formData.phone}\nالخدمة: ${getTabName(activeTab)}`;
    const qrData = await generateQRCodeDataUrl(qrText);
    setQrCodeUrl(qrData);

    const estimatedAmount = activeTab === 'flight' ? 380 : activeTab === 'hajj_umrah' ? 320 : activeTab === 'visas' ? 180 : 250;

    const newBooking: BookingRequest = {
      orderId,
      serviceType: activeTab,
      serviceTitle: getTabName(activeTab),
      customerName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      destination: formData.destination,
      travelDate: formData.travelDate,
      returnDate: formData.returnDate,
      passengers: Number(formData.passengers),
      notes: formData.notes,
      status: documents.length > 0 ? 'documents_review' : 'pending',
      createdAt: now,
      updatedAt: now,
      documents,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === 'office_cash' ? 'pending' : 'deposit_paid',
      totalAmount: estimatedAmount * Number(formData.passengers),
      qrCodeUrl: qrData,
      loyaltyPointsEarned: Math.floor(estimatedAmount / 10)
    };

    setCreatedBooking(newBooking);
    setStep('confirmation');

    if (onBookingCreated) {
      onBookingCreated(newBooking);
    }
  };

  const handleDownloadPDF = async () => {
    if (createdBooking) {
      await generateBookingPDF(createdBooking);
    }
  };

  const sendWhatsAppBooking = () => {
    if (!createdBooking) return;
    const message = `مرحباً مكتب المحترف للسفريات والسياحة، تم تقديم حجز رقم: (${createdBooking.orderId}):
- الاسم: ${createdBooking.customerName}
- الهاتف: ${createdBooking.phone}
- الخدمة: ${createdBooking.serviceTitle}
- الوجهة: ${createdBooking.destination}
- تاريخ السفر: ${createdBooking.travelDate}
- عدد الأشخاص: ${createdBooking.passengers}
- طريقة الدفع: ${createdBooking.paymentMethod}
- عدد المستندات المرفقة: ${createdBooking.documents.length}
يرجى المتابعة وتأكيد الحجز.`;

    window.open(`https://wa.me/967771234707?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getTabName = (tab: ServiceType) => {
    switch (tab) {
      case 'flight': return 'حجز تذاكر طيران';
      case 'passport': return 'تجديد واستخراج جوازات';
      case 'hajj_umrah': return 'برامج الحج والعمرة';
      case 'visas': return 'تأشيرات وزيارات سياحية';
      case 'buses': return 'حافلات ونقل دولي';
      case 'hotels': return 'حجز فنادق ومنتجعات';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className="bg-[#0F2C59] p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black font-cairo">نظام الحجز الذكي المباشر</span>
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-tajawal">
                QR & PDF
              </span>
            </div>
            <p className="text-xs text-amber-300 font-tajawal">المحترف للسفريات والسياحة - رفع المستندات وتأكيد لحظي</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        {step !== 'confirmation' && (
          <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto flex-shrink-0">
            {[
              { id: 'flight', label: 'طيران', icon: Plane },
              { id: 'passport', label: 'جوازات', icon: FileText },
              { id: 'hajj_umrah', label: 'عمرة وحج', icon: Compass },
              { id: 'visas', label: 'تأشيرات', icon: Users },
              { id: 'buses', label: 'حافلات', icon: Bus },
              { id: 'hotels', label: 'فنادق', icon: Hotel },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as ServiceType)}
                  className={`flex-1 min-w-[85px] py-3 px-2 text-xs font-bold flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-amber-500 text-[#0F2C59] bg-white shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {step === 'confirmation' && createdBooking ? (
            <div className="text-center py-4 space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full mb-1">
                  رقم الطلب: {createdBooking.orderId}
                </span>
                <h4 className="text-2xl font-black text-[#0F2C59] font-cairo">
                  تم إصدار وتأكيد طلب الحجز بنجاح!
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm font-bold max-w-md mx-auto font-tajawal mt-1">
                  تم توليد ملف PDF رسمي ومستند يحتوي على رمز QR للتحقق والتتبع الفوري
                </p>
              </div>

              {/* QR and Summary Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-lg mx-auto flex flex-col sm:flex-row items-center gap-4 text-right">
                {qrCodeUrl && (
                  <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs flex-shrink-0 flex flex-col items-center">
                    <img src={qrCodeUrl} alt="رمز QR للطلب" className="w-28 h-28 object-contain" />
                    <span className="text-[10px] font-bold text-slate-500 mt-1">امسح للتحقق</span>
                  </div>
                )}
                <div className="space-y-1.5 text-xs font-tajawal text-slate-700 flex-1 w-full">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">الخدمة المطلوبة:</span>
                    <span className="font-bold text-[#0F2C59]">{createdBooking.serviceTitle}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">اسم العميل:</span>
                    <span className="font-bold text-[#0F2C59]">{createdBooking.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">الوجهة وتاريخ السفر:</span>
                    <span className="font-bold text-[#0F2C59]">{createdBooking.destination} ({createdBooking.travelDate})</span>
                  </div>
                  <div className="flex justify-between pb-1">
                    <span className="text-slate-500">المستندات المرفقة:</span>
                    <span className="font-bold text-emerald-700">{createdBooking.documents.length} مستند مرفق</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800 font-extrabold">
                    <span>نقاط الولاء المكتسبة:</span>
                    <span>+{createdBooking.loyaltyPointsEarned} نقطة</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto bg-[#0F2C59] hover:bg-[#153B75] text-amber-300 font-black px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل سند الحجز (PDF)</span>
                </button>

                <button
                  onClick={sendWhatsAppBooking}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال النسخة عبر الواتساب</span>
                </button>
              </div>

            </div>
          ) : step === 'payment' ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200/80 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-950 font-bold font-tajawal">
                  خطوة الدفع وتأكيد الحجز: يمكنك اختيار وسيلة الدفع المناسبة أو الدفع نقداً عند استلام الوثائق في مقر المكتب (تعز - الأقروض - الكدمة).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#0F2C59] mb-3 font-cairo">اختر طريقة الدفع المناسبة:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Yemeni E-Wallets */}
                  <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    formData.paymentMethod === 'e_wallet' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="e_wallet"
                      checked={formData.paymentMethod === 'e_wallet'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'e_wallet' })}
                      className="mt-1 accent-amber-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F2C59] font-cairo">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span>المحافظ الإلكترونية (حاسب / ام فلوس / كاش / جيب)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-tajawal">دفع سريع عبر المحافظ المحلية المعتمدة في اليمن.</p>
                    </div>
                  </label>

                  {/* Office Cash */}
                  <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    formData.paymentMethod === 'office_cash' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="office_cash"
                      checked={formData.paymentMethod === 'office_cash'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'office_cash' })}
                      className="mt-1 accent-amber-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F2C59] font-cairo">
                        <Building2 className="w-4 h-4 text-amber-600" />
                        <span>الدفع نقداً بمقر المكتب (الأقروض - الكدمة)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-tajawal">حجز مؤكد وتسديد المبلغ عند الاستلام بمكتبنا المباشر.</p>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    formData.paymentMethod === 'bank_transfer' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank_transfer"
                      checked={formData.paymentMethod === 'bank_transfer'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                      className="mt-1 accent-amber-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F2C59] font-cairo">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span>تحويل بنكي / صرافة</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-tajawal">عبر شبكات الصرافة والبنك بالتنسيق المباشر.</p>
                    </div>
                  </label>

                  {/* Cards */}
                  <label className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                    formData.paymentMethod === 'card' ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/30' : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'card' })}
                      className="mt-1 accent-amber-600"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-[#0F2C59] font-cairo">
                        <CreditCard className="w-4 h-4 text-indigo-600" />
                        <span>البطاقات المصرفية (فيزا / ماستركارد)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 font-tajawal">دفع إلكتروني محمي وآمن للرحلات والتأشيرات.</p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-tajawal space-y-2">
                <div className="font-bold text-[#0F2C59] text-sm font-cairo border-b pb-1">ملخص الحجز والمرفقات</div>
                <div className="flex justify-between"><span className="text-slate-500">الخدمة:</span> <span className="font-bold">{getTabName(activeTab)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">العميل:</span> <span className="font-bold">{formData.fullName} ({formData.phone})</span></div>
                <div className="flex justify-between"><span className="text-slate-500">الوجهة والتاريخ:</span> <span className="font-bold">{formData.destination} - {formData.travelDate}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">المستندات المرفقة:</span> <span className="font-bold text-emerald-700">{documents.length} ملفات</span></div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs"
                >
                  رجوع للتعديل
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="btn-gold flex-1 py-3 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <QrCode className="w-4 h-4" />
                  <span>إنشاء الطلب وتوليد رمز QR والـ PDF</span>
                </button>
              </div>

            </div>
          ) : (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">الاسم الثلاثي أو الكامل *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="أدخل الاسم مثل الجواز"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">رقم الجوال والواتساب *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="77x xxx xxx / 73x xxx xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">الوجهة أو مكان الرحلة *</label>
                  <select
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                  >
                    <option value="الإمارات (دبي / أبوظبي)">الإمارات العربية المتحدة (دبي / أبوظبي)</option>
                    <option value="المملكة العربية السعودية (مكة / المدينة)">المملكة العربية السعودية (عمرة / حج / مواصلات)</option>
                    <option value="جمهورية مصر العربية (القاهرة / شرم الشيخ)">جمهورية مصر العربية (القاهرة / شرم)</option>
                    <option value="جمهورية تركيا (إسطنبول / طرابزون)">جمهورية تركيا (إسطنبول / طرابزون)</option>
                    <option value="الأردن / عمان">الأردن / عمان (علاج وسياحة)</option>
                    <option value="وجهة أو خط سير آخر">خط سير آخر / تجديد جواز داخل اليمن</option>
                  </select>
                </div>

                {/* Travel Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">تاريخ السفر المطلوب *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="date"
                      required
                      value={formData.travelDate}
                      onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                      className="w-full pr-9 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Passengers count */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">عدد المسافرين</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">البريد الإلكتروني (اختياري)</label>
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                  />
                </div>

              </div>

              {/* Document Upload Area */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50/70">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="block text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-500" />
                      رفع المستندات المطلوبة (صورة الجواز / الهوية / الصور الشخصية)
                    </span>
                    <span className="text-[11px] text-slate-500 font-tajawal">يمكنك إرفاق صور واضحة بالجوال أو ملفات PDF مباشرة</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0F2C59] hover:bg-[#153B75] text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>اختر ملفات</span>
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* List of uploaded documents */}
                {documents.length > 0 ? (
                  <div className="space-y-2 mt-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <div>
                            <span className="font-bold text-slate-800 block truncate max-w-[200px] sm:max-w-[300px]">{doc.name}</span>
                            <span className="text-[10px] text-slate-400">{doc.type} • {doc.size}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-[11px] text-slate-400 font-tajawal">
                    لم يتم إرفاق مستندات حتى الآن (يمكنك إضافتها لاحقاً أو تقديم الطلب الآن)
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">ملاحظات إضافية أو تفاصيل سكن ومواعيد</label>
                <textarea
                  rows={2}
                  placeholder="أدخل أي ملاحظات حول السكن أو المواعيد الفضلية..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="btn-gold flex-1 py-3 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>الانتقال لخطوة الدفع وتأكيد الحجز</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
