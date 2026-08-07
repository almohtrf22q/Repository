import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ServiceType, BookingRequest, UploadedDocument } from '../types';
import { 
  X, Plane, FileText, Compass, Users, Bus, Hotel, Send, CheckCircle2, 
  Phone, Calendar, User, Upload, Trash2, FileCheck, Download, CreditCard, 
  QrCode, ShieldCheck, Wallet, DollarSign, Building2, Info, MapPin, Hash, Briefcase, BedDouble, UserCheck, AlertCircle
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
  const [activeTab, setActiveTab] = useState<ServiceType>(initialService);
  const [step, setStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [createdBooking, setCreatedBooking] = useState<BookingRequest | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Comprehensive Form State
  const [formData, setFormData] = useState({
    // Common
    fullName: '',
    phone: '',
    email: '',
    notes: '',
    paymentMethod: 'e_wallet' as 'e_wallet' | 'card' | 'bank_transfer' | 'office_cash',

    // 1. Flight
    flightOrigin: 'صنعاء (SAH)',
    flightDestination: 'جدة (JED)',
    travelDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    adultsCount: 1,
    childrenCount: 0,
    infantsCount: 0,

    // 2. Passport
    passportServiceType: 'تجديد جواز سفر',
    nationalId: '',
    occupation: '',

    // 3. Hajj & Umrah
    hajjUmrahProgramType: 'عمرة جوية',
    hajjUmrahMonth: 'عمرة شعبان / رمضان المبارك',
    hajjPassengers: 1,
    roomType: 'رباعية',
    hostAbsherPhone: '',
    hostIqamaNumber: '',

    // 4. Visas
    visaDestinationCountry: 'المملكة العربية السعودية',
    visaType: 'سياحية',
    expectedTravelDate: new Date().toISOString().split('T')[0],

    // 5. Buses
    departureStation: 'تعز (الأقروض / الحوبان)',
    arrivalStation: 'الرياض - المملكة العربية السعودية',
    busTravelDate: new Date().toISOString().split('T')[0],
    busPassengers: 1,
    transportCompany: 'شركة النقل الجماعي (الرويشان)',

    // 6. Hotels
    hotelCityOrName: 'مكة المكرمة - فندق أنجم أو ما يماثله',
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    hotelRoomType: 'مزدوجة (دبل)',
    hotelRoomCount: 1,
    hotelAdults: 2,
    hotelChildren: 0
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
    
    filesArray.forEach((file: File) => {
      const docId = 'doc-' + Math.random().toString(36).substring(2, 9);
      const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

      if (isImage) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const previewUrl = event.target?.result as string;
          const newDoc: UploadedDocument = {
            id: docId,
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: getDocTypeLabel(activeTab),
            previewUrl,
            uploadedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          };
          setDocuments((prev) => [...prev, newDoc]);
        };
        reader.readAsDataURL(file);
      } else {
        const newDoc: UploadedDocument = {
          id: docId,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          type: 'مستند PDF',
          uploadedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        };
        setDocuments((prev) => [...prev, newDoc]);
      }
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const getDocTypeLabel = (tab: ServiceType) => {
    switch (tab) {
      case 'flight': return 'صورة جواز السفر';
      case 'passport': return 'البطاقة / الصورة الشخصية / الجواز القديم';
      case 'hajj_umrah': return 'صورة الجواز + صورة إقامة المستضيف';
      case 'visas': return 'الجواز / كشف حساب / صور شخصية';
      case 'buses': return 'صورة الهوية / الجواز للمطابقة';
      case 'hotels': return 'إثبات الشخصية / الجواز';
    }
  };

  const getDocGuidance = (tab: ServiceType) => {
    switch (tab) {
      case 'flight': return 'يرجى إرفاق صورة جواز السفر ساري المفعول لكل مسافر';
      case 'passport': return 'المستندات المطلوبة: صورة البطاقة الشخصية، صورة شخصية خلفية بيضاء، وصورة الجواز القديم إن وجد';
      case 'hajj_umrah': return 'المستندات المطلوبة لتذكرة/تأشيرة العمرة: 1. صورة جواز السفر  2. صورة إقامة المستضيف.';
      case 'visas': return 'المستندات المطلوبة: صورة الجواز، صورة شخصية، وكشف حساب بنكي (PDF) للفيز السياحية إن وجد';
      case 'buses': return 'المستندات المطلوبة: صورة الهوية الوطنية أو الجواز للمطابقة بالنقاط الأمنية';
      case 'hotels': return 'المستندات المطلوبة: صورة جواز السفر أو الهوية لإثبات الشخصية عند دخول الفندق';
    }
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handleFinalSubmit = async () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `MUH-2026-${randomNum}`;
    const now = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

    let destinationStr = '';
    let travelDateStr = '';
    let passengersCount = 1;

    if (activeTab === 'flight') {
      destinationStr = `${formData.flightOrigin} ← ${formData.flightDestination}`;
      travelDateStr = formData.returnDate ? `${formData.travelDate} (العودة: ${formData.returnDate})` : formData.travelDate;
      passengersCount = Number(formData.adultsCount) + Number(formData.childrenCount) + Number(formData.infantsCount);
    } else if (activeTab === 'passport') {
      destinationStr = `معاملة جوازات: ${formData.passportServiceType}`;
      travelDateStr = 'فوري عند تسليم الوثائق';
      passengersCount = 1;
    } else if (activeTab === 'hajj_umrah') {
      destinationStr = `برنامج ${formData.hajjUmrahProgramType} - سكن ${formData.roomType}`;
      travelDateStr = formData.hajjUmrahMonth;
      passengersCount = Number(formData.hajjPassengers);
    } else if (activeTab === 'visas') {
      destinationStr = `تأشيرة ${formData.visaType} - ${formData.visaDestinationCountry}`;
      travelDateStr = formData.expectedTravelDate;
      passengersCount = 1;
    } else if (activeTab === 'buses') {
      destinationStr = `رحلة حافلة: ${formData.departureStation} ← ${formData.arrivalStation}`;
      travelDateStr = formData.busTravelDate;
      passengersCount = Number(formData.busPassengers);
    } else if (activeTab === 'hotels') {
      destinationStr = `فندق: ${formData.hotelCityOrName} (${formData.hotelRoomType})`;
      travelDateStr = `${formData.checkInDate} إلى ${formData.checkOutDate}`;
      passengersCount = Number(formData.hotelAdults) + Number(formData.hotelChildren);
    }

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
      destination: destinationStr,
      travelDate: travelDateStr,
      passengers: passengersCount,
      notes: formData.notes,
      status: documents.length > 0 ? 'documents_review' : 'pending',
      createdAt: now,
      updatedAt: now,
      documents,
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentMethod === 'office_cash' ? 'pending' : 'deposit_paid',
      totalAmount: estimatedAmount * passengersCount,
      qrCodeUrl: qrData,
      loyaltyPointsEarned: Math.floor(estimatedAmount / 10),

      // Specific fields
      adultsCount: Number(formData.adultsCount),
      childrenCount: Number(formData.childrenCount),
      infantsCount: Number(formData.infantsCount),
      nationalId: formData.nationalId,
      passportServiceType: formData.passportServiceType,
      occupation: formData.occupation,
      hajjUmrahProgramType: formData.hajjUmrahProgramType,
      hajjUmrahMonth: formData.hajjUmrahMonth,
      roomType: formData.roomType,
      hostAbsherPhone: formData.hostAbsherPhone,
      hostIqamaNumber: formData.hostIqamaNumber,
      visaType: formData.visaType,
      destinationCountry: formData.visaDestinationCountry,
      departureStation: formData.departureStation,
      arrivalStation: formData.arrivalStation,
      transportCompany: formData.transportCompany,
      hotelName: formData.hotelCityOrName,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      roomCount: Number(formData.hotelRoomCount)
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
    let extraDetails = '';

    if (activeTab === 'flight') {
      extraDetails = `• تفاصيل المسافرين: ${formData.adultsCount} بالغين | ${formData.childrenCount} أطفال | ${formData.infantsCount} رُضع\n• خط السير: ${createdBooking.destination}`;
    } else if (activeTab === 'passport') {
      extraDetails = `• نوع المعاملة: ${formData.passportServiceType}\n• الرقم الوطني/الهوية: ${formData.nationalId || 'غير مدخل'}\n• المهنة: ${formData.occupation || 'غير مدخل'}`;
    } else if (activeTab === 'hajj_umrah') {
      extraDetails = `• نوع البرنامج: ${formData.hajjUmrahProgramType}\n• شهر/تاريخ الرحلة: ${formData.hajjUmrahMonth}\n• نوع الغرفة: ${formData.roomType}\n• رقم جوال المستضيف (المربوط بـ أبشر): ${formData.hostAbsherPhone || 'غير مدخل'}\n• رقم إقامة المستضيف: ${formData.hostIqamaNumber || 'غير مدخل'}`;
    } else if (activeTab === 'visas') {
      extraDetails = `• الدولة المطلوبة: ${formData.visaDestinationCountry}\n• نوع التأشيرة: ${formData.visaType}\n• تاريخ السفر المتوقع: ${formData.expectedTravelDate}`;
    } else if (activeTab === 'buses') {
      extraDetails = `• محطة المغادرة: ${formData.departureStation}\n• محطة الوصول: ${formData.arrivalStation}\n• تاريخ الرحلة: ${formData.busTravelDate}\n• شركة النقل: ${formData.transportCompany}`;
    } else if (activeTab === 'hotels') {
      extraDetails = `• المدينة/الفندق: ${formData.hotelCityOrName}\n• تاريخ الدخول: ${formData.checkInDate} / الخروج: ${formData.checkOutDate}\n• نوع الغرف: ${formData.hotelRoomType} (${formData.hotelRoomCount} غرفة)`;
    }

    const message = `مرحباً مكتب المحترف للسفريات والسياحة، تم تقديم حجز رقم: (${createdBooking.orderId}):
- الاسم الكامل (مطابق للجواز/الهوية): ${createdBooking.customerName}
- رقم الجوال والواتساب: ${createdBooking.phone}
- الخدمة: ${createdBooking.serviceTitle}
${extraDetails}
- ملاحظات خاصة: ${formData.notes || 'لا يوجد'}
- طريقة الدفع: ${createdBooking.paymentMethod}
- عدد المستندات المرفقة: ${createdBooking.documents.length}

يرجى المتابعة وتأكيد الحجز والإصدار.`;

    window.open(`https://wa.me/967771234707?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getTabName = (tab: ServiceType) => {
    switch (tab) {
      case 'flight': return 'حجز تذاكر طيران';
      case 'passport': return 'استخراج وتجديد الجوازات';
      case 'hajj_umrah': return 'برامج العمرة والحج';
      case 'visas': return 'تأشيرات وزيارات سياحية';
      case 'buses': return 'حافلات ونقل دولي';
      case 'hotels': return 'حجز فنادق ومنتجعات';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]"
          >
        
        {/* Header Bar */}
        <div className="bg-[#0F2C59] p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black font-cairo">نظام الحجز الإلكتروني والرفع المباشر</span>
              <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full font-tajawal">
                QR & PDF
              </span>
            </div>
            <p className="text-xs text-amber-300 font-tajawal">المحترف للسفريات والسياحة - بيانات مكتملة وتأكيد لحظي</p>
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
              { id: 'flight', label: 'طيران ✈️', icon: Plane },
              { id: 'passport', label: 'جوازات 🛂', icon: FileText },
              { id: 'hajj_umrah', label: 'عمرة وحج 🕋', icon: Compass },
              { id: 'visas', label: 'تأشيرات 📝', icon: Users },
              { id: 'buses', label: 'حافلات 🚌', icon: Bus },
              { id: 'hotels', label: 'فنادق 🏨', icon: Hotel },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id as ServiceType)}
                  className={`flex-1 min-w-[90px] py-3 px-2 text-xs font-bold flex flex-col items-center gap-1 border-b-2 transition-all cursor-pointer ${
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
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {step === 'confirmation' && createdBooking ? (
            <div className="text-center py-3 space-y-5 animate-in fade-in duration-300 font-tajawal">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="inline-block bg-amber-100 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full mb-1">
                  رقم الطلب: {createdBooking.orderId}
                </span>
                <h4 className="text-2xl font-black text-[#0F2C59] font-cairo">
                  تم تسجيل وتقديم طلب الحجز بنجاح!
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm font-bold max-w-md mx-auto font-tajawal mt-1">
                  تم حفظ كافة بيانات الخدمة المخصصة وتوليد سند رسمي يحتوي على رمز QR مخصص
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
                    <span className="text-slate-500">تفاصيل الخدمة/الوجهة:</span>
                    <span className="font-bold text-[#0F2C59]">{createdBooking.destination}</span>
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
                  type="button"
                  onClick={handleDownloadPDF}
                  className="w-full sm:w-auto bg-[#0F2C59] hover:bg-[#153B75] text-amber-300 font-black px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل سند الحجز (PDF)</span>
                </button>

                <button
                  type="button"
                  onClick={sendWhatsAppBooking}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال النسخة عبر الواتساب</span>
                </button>
              </div>

            </div>
          ) : step === 'payment' ? (
            <div className="space-y-5 animate-in fade-in duration-200 font-tajawal">
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200/80 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-950 font-bold">
                  اختر طريقة التسديد المناسبة لتأكيد طلبك في قسم ({getTabName(activeTab)}). يمكنك أيضاً الدفع نقداً عند استلام الوثائق في مقر المكتب (تعز - الأقروض - الكدمة).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#0F2C59] mb-3 font-cairo">وسائل الدفع والتسديد المتاحة:</h4>
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
                      <p className="text-[11px] text-slate-500 mt-1">دفع سريع ومباشر عبر المحافظ الرقمية في اليمن.</p>
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
                      <p className="text-[11px] text-slate-500 mt-1">تسجيل وتثبيت الطلب والتسديد المباشر بالمكتب.</p>
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
                      <p className="text-[11px] text-slate-500 mt-1">عبر شبكات النجم والامتياز والشركات المعتمدة.</p>
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
                      <p className="text-[11px] text-slate-500 mt-1">دفع إلكتروني آمن للحجوزات الدولية والتأشيرات.</p>
                    </div>
                  </label>

                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-[#0F2C59] text-sm font-cairo border-b pb-1">ملخص بيانات الخدمة والمستندات</div>
                <div className="flex justify-between"><span className="text-slate-500">القسم:</span> <span className="font-bold">{getTabName(activeTab)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">صاحب الطلب:</span> <span className="font-bold">{formData.fullName} ({formData.phone})</span></div>
                <div className="flex justify-between"><span className="text-slate-500">المستندات المرفقة:</span> <span className="font-bold text-emerald-700">{documents.length} ملفات جاهزة للطباعة</span></div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
                >
                  رجوع لتعديل البيانات
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="btn-gold flex-1 py-3 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <QrCode className="w-4 h-4" />
                  <span>تأكيد الحجز وتوليد السند المباشر</span>
                </button>
              </div>

            </div>
          ) : (
            <form onSubmit={handleProceedToPayment} className="space-y-4 font-tajawal">
              
              {/* Shared Common Header Inputs (Name & Phone) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الثلاثي أو الكامل (باللغة العربية أو الإنجليزية) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="أدخل الاسم الكامل باللغة العربية أو الإنجليزية"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">💡 يمكن كتابة الاسم باللغة العربية أو الإنجليزية كما في وثائق السفر</span>
                </div>

                {/* Phone & WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الجوال والواتساب للتواصل *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    <input
                      type="tel"
                      required
                      placeholder="77x xxx xxx / 73x xxx xxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pr-9 pl-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* DYNAMIC FIELDS PER TAB */}

              {/* TAB 1: FLIGHT ✈️ */}
              {activeTab === 'flight' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5 border-b pb-1">
                    <Plane className="w-4 h-4 text-amber-500" />
                    <span>تفاصيل رحلة الطيران وحجز التذاكر:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Origin & Destination */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">محطة المغادرة (من) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: صنعاء / عدن / سيئون"
                        value={formData.flightOrigin}
                        onChange={(e) => setFormData({ ...formData, flightOrigin: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">وجهة الوصول (إلى) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: جدة / دبي / القاهرة / إسطنبول"
                        value={formData.flightDestination}
                        onChange={(e) => setFormData({ ...formData, flightDestination: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Travel Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ السفر (الذهاب) *</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="date"
                          required
                          value={formData.travelDate}
                          onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Return Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ العودة (اختياري / ذهاب وإياب)</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="date"
                          value={formData.returnDate}
                          onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Passengers Breakdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">تقسيم عدد المسافرين بالتفصيل لمعرفة التسعيرة الدقيقة:</label>
                    <div className="grid grid-cols-3 gap-2 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">بالغين (12+ سنة)</span>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={formData.adultsCount}
                          onChange={(e) => setFormData({ ...formData, adultsCount: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">أطفال (2-11 سنة)</span>
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={formData.childrenCount}
                          onChange={(e) => setFormData({ ...formData, childrenCount: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-700 block mb-1">رُضع (تحت سنتين)</span>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.infantsCount}
                          onChange={(e) => setFormData({ ...formData, infantsCount: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني لإرسال التذاكر الإلكترونية (اختياري)</label>
                    <input
                      type="email"
                      placeholder="e.g. passenger@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PASSPORT 🛂 */}
              {activeTab === 'passport' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5 border-b pb-1">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>بيانات خدمة استخراج وتجديد جوازات السفر:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Service Type Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع الخدمة المطلوبة *</label>
                      <select
                        value={formData.passportServiceType}
                        onChange={(e) => setFormData({ ...formData, passportServiceType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      >
                        <option value="تجديد جواز سفر">تجديد جواز سفر (المنتهي / القريب الانتهاء)</option>
                        <option value="إصدار جديد لأول مرة">إصدار جواز جديد (لأول مرة)</option>
                        <option value="بدل فاقد">استخراج بدل فاقد</option>
                        <option value="بدل تالف">استخراج بدل تالف</option>
                        <option value="إضافة طفل للجواز">إضافة طفل / مضافين</option>
                      </select>
                    </div>

                    {/* National ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الرقم الوطني / رقم الهوية الشخصية *</label>
                      <div className="relative">
                        <Hash className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="أدخل الرقم الوطني المكون من 11 رقم"
                          value={formData.nationalId}
                          onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Occupation */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">المهنة / جهة العمل (لتدوينها بالجواز الرسمية) *</label>
                      <div className="relative">
                        <Briefcase className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="text"
                          required
                          placeholder="مثال: مهندس / طالب / رجل أعمال / حرة..."
                          value={formData.occupation}
                          onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HAJJ & UMRAH 🕋 */}
              {activeTab === 'hajj_umrah' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5 border-b pb-1">
                    <Compass className="w-4 h-4 text-amber-500" />
                    <span>بيانات وتفاصيل رحلة العمرة أو الحج:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Program Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع البرنامج المطلوب *</label>
                      <select
                        value={formData.hajjUmrahProgramType}
                        onChange={(e) => setFormData({ ...formData, hajjUmrahProgramType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      >
                        <option value="عمرة جوية">رحلة عمرة جوية (شاملة الطيران والسكن)</option>
                        <option value="عمرة برية">رحلة عمرة برية (حافلات VIP حديثة)</option>
                        <option value="برنامج الحج">برنامج الحج الرسمي المعتمد</option>
                        <option value="باقة VIP خاصة">باقة VIP خاصة VIP</option>
                        <option value="باقة اقتصادية">باقة اقتصادية ميسرة</option>
                      </select>
                    </div>

                    {/* Month / Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">شهر / تاريخ الرحلة المفضل *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: عمرة شعبان / عمرة رمضان المبارك / تاريخ محدد"
                        value={formData.hajjUmrahMonth}
                        onChange={(e) => setFormData({ ...formData, hajjUmrahMonth: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Room Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع الغرفة المطلوبة بالفندق *</label>
                      <select
                        value={formData.roomType}
                        onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      >
                        <option value="رباعية">رباعية (4 أسرة)</option>
                        <option value="ثلاثية">ثلاثية (3 أسرة)</option>
                        <option value="ثنائية">ثنائية (سريران / دبل)</option>
                        <option value="مفردة">مفردة خاصة (سنجل)</option>
                      </select>
                    </div>

                    {/* Persons count */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">إجمالي عدد المعتمرين / الحجاج *</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formData.hajjPassengers}
                        onChange={(e) => setFormData({ ...formData, hajjPassengers: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Host Absher Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رقم جوال صاحب الإقامة المربوط بـ أبشر *</label>
                      <input
                        type="tel"
                        required
                        placeholder="05xxxxxxx / +9665xxxxxxx"
                        value={formData.hostAbsherPhone}
                        onChange={(e) => setFormData({ ...formData, hostAbsherPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Host Iqama Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رقم إقامة المستضيف (السعودية) *</label>
                      <input
                        type="text"
                        required
                        placeholder="أدخل رقم إقامة المستضيف المكون من 10 أرقام"
                        value={formData.hostIqamaNumber}
                        onChange={(e) => setFormData({ ...formData, hostIqamaNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: VISAS 📝 */}
              {activeTab === 'visas' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5 border-b pb-1">
                    <Users className="w-4 h-4 text-amber-500" />
                    <span>بيانات طلب التأشيرة والزيارات الدولية:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Destination Country */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الدولة المراد السفر إليها (الوجهة) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: السعودية / الإمارات / مصر / تركيا / شنجن..."
                        value={formData.visaDestinationCountry}
                        onChange={(e) => setFormData({ ...formData, visaDestinationCountry: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Visa Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع التأشيرة المطلوبة *</label>
                      <select
                        value={formData.visaType}
                        onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      >
                        <option value="سياحية">تأشيرة سياحية الإلكترونية</option>
                        <option value="زيارة عائلية / تجارية">تأشيرة زيارة عائلية / تجارية</option>
                        <option value="عمل">تأشيرة عمل وتوظيف</option>
                        <option value="علاجية">تأشيرة علاج وتسهيلات طبية</option>
                        <option value="دراسیة">تأشيرة دراسية وفترة تدريب</option>
                      </select>
                    </div>

                    {/* Travel Date */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ السفر المتوقع *</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="date"
                          required
                          value={formData.expectedTravelDate}
                          onChange={(e) => setFormData({ ...formData, expectedTravelDate: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: BUSES 🚌 */}
              {activeTab === 'buses' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5 border-b pb-1">
                    <Bus className="w-4 h-4 text-amber-500" />
                    <span>تفاصيل رحلة الحافلة والنقل الجماعي الدولي:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Departure Station */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">محطة المغادرة (من) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: تعز (الأقروض / الحوبان / صنعاء / عدن)"
                        value={formData.departureStation}
                        onChange={(e) => setFormData({ ...formData, departureStation: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Arrival Station */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">محطة الوصول (إلى) *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: الرياض / شرورة / جدة / مكة المكرمة"
                        value={formData.arrivalStation}
                        onChange={(e) => setFormData({ ...formData, arrivalStation: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Bus Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الرحلة المطلوب *</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="date"
                          required
                          value={formData.busTravelDate}
                          onChange={(e) => setFormData({ ...formData, busTravelDate: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Bus Passengers */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عدد الركاب *</label>
                      <input
                        type="number"
                        min="1"
                        max="40"
                        value={formData.busPassengers}
                        onChange={(e) => setFormData({ ...formData, busPassengers: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Preferred Transport Company */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">شركة النقل المفضلة (اختياري)</label>
                      <input
                        type="text"
                        placeholder="مثال: شركة الرويشان / شركة البركة / النور / الجماعي..."
                        value={formData.transportCompany}
                        onChange={(e) => setFormData({ ...formData, transportCompany: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: HOTELS 🏨 */}
              {activeTab === 'hotels' && (
                <div className="space-y-3.5 animate-in fade-in">
                  <div className="text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5 border-b pb-1">
                    <Hotel className="w-4 h-4 text-amber-500" />
                    <span>بيانات حجز الفنادق والإقامة السكنية:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Hotel Name or City */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">المدينة والدولة أو اسم الفندق بالتحديد *</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: مكة المكرمة - فندق أنجم / دبي - فندق الماريوت"
                        value={formData.hotelCityOrName}
                        onChange={(e) => setFormData({ ...formData, hotelCityOrName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Check In */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ تسجيل الدخول (Check-in) *</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="date"
                          required
                          value={formData.checkInDate}
                          onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Check Out */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ تسجيل الخروج (Check-out) *</label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                        <input
                          type="date"
                          required
                          value={formData.checkOutDate}
                          onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                          className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Room Type */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع الغرف المطلوبة *</label>
                      <select
                        value={formData.hotelRoomType}
                        onChange={(e) => setFormData({ ...formData, hotelRoomType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      >
                        <option value="مفردة (سنجل)">مفردة (سنجل)</option>
                        <option value="مزدوجة (دبل / توين)">مزدوجة (دبل / توين)</option>
                        <option value="ثلاثية (تريبل)">ثلاثية (تريبل)</option>
                        <option value="رباعية (كواد)">رباعية (كواد)</option>
                        <option value="جناح عائلي (Suite)">جناح عائلي (Suite)</option>
                      </select>
                    </div>

                    {/* Number of Rooms */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عدد الغرف *</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={formData.hotelRoomCount}
                        onChange={(e) => setFormData({ ...formData, hotelRoomCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    {/* Guests Count */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عدد الأشخاص البالغين *</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.hotelAdults}
                        onChange={(e) => setFormData({ ...formData, hotelAdults: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عدد الأطفال (تحت 12 سنة)</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.hotelChildren}
                        onChange={(e) => setFormData({ ...formData, hotelChildren: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Document Upload Area with Dynamic Guidance */}
              <div className="border border-dashed border-[#0F2C59]/30 rounded-xl p-3.5 bg-slate-50/80 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="block text-xs font-black text-[#0F2C59] font-cairo flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-amber-500" />
                      رفع مستندات قسم ({getTabName(activeTab)})
                    </span>
                    <span className="text-[11px] text-amber-900 font-bold block mt-0.5">
                      📌 {getDocGuidance(activeTab)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#0F2C59] hover:bg-[#153B75] text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>إرفاق ملفات/صور</span>
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
                  <div className="space-y-2 mt-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                        <div className="flex items-center justify-between">
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
                        {doc.previewUrl && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-3">
                            <img
                              src={doc.previewUrl}
                              alt={doc.name}
                              className="w-16 h-12 object-cover rounded-md border border-slate-200 shadow-xs"
                            />
                            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              تم إرفاق الصورة وجاهزة للطباعة بالسند الرسمي
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-2 text-[11px] text-slate-400 font-tajawal">
                    لم يتم إرفاق ملفات حتى الآن (يمكنك التقديم الآن وإرفاق الوثائق لاحقاً عبر الواتساب)
                  </div>
                )}
              </div>

              {/* Additional Notes Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">ملاحظات وطلبات خاصة إضافية</label>
                <textarea
                  rows={2}
                  placeholder={
                    activeTab === 'flight' ? 'أدخل ملاحظات حول طلبات الوزن الإضافي، المقاعد، الكراسي المتحركة...' :
                    activeTab === 'passport' ? 'أدخل أي ملاحظات حول مكان التسليم أو الاستعجال...' :
                    activeTab === 'hajj_umrah' ? 'ملاحظات مثل وجود كبار سن، كراسي متحركة، ترتيبات خاصة...' :
                    activeTab === 'visas' ? 'ملاحظات حول السفارة أو موعد المقابلة المفضل...' :
                    activeTab === 'buses' ? 'طلب حجز مقاعد أمامية أو اختيار جهة الباص...' :
                    'طلب سرير إضافي، ترتيبات شهر عسل، إطلالة خاصة...'
                  }
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none"
                />
              </div>

              {/* Submit Action */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="submit"
                  className="btn-gold flex-1 py-3 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>الانتقال لخطوة الدفع وتوليد السند المباشر</span>
                </button>
              </div>

            </form>
          )}
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
