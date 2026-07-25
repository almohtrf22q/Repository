import React, { useState } from 'react';
import { AppointmentSlot, ServiceType } from '../types';
import { X, Calendar, Clock, User, Phone, CheckCircle2, Send, MapPin, Building2 } from 'lucide-react';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const [submittedSlot, setSubmittedSlot] = useState<AppointmentSlot | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    serviceType: 'flight' as ServiceType,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:00 AM',
    notes: ''
  });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '03:30 PM', '04:30 PM', '06:00 PM', '07:30 PM'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const apptId = 'APPT-' + Math.floor(1000 + Math.random() * 9000);
    const slotObj: AppointmentSlot = {
      id: apptId,
      customerName: formData.name,
      phone: formData.phone,
      serviceType: formData.serviceType,
      date: formData.date,
      timeSlot: formData.timeSlot,
      notes: formData.notes,
      status: 'confirmed',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSubmittedSlot(slotObj);
  };

  const sendWhatsAppAppointment = () => {
    if (!submittedSlot) return;
    const msg = `مرحباً مكتب المحترف للسفريات، أود تأكيد موعد زيارة المكتب (رقم الموعد: ${submittedSlot.id}):
- الاسم: ${submittedSlot.customerName}
- الهاتف: ${submittedSlot.phone}
- التاريخ: ${submittedSlot.date}
- الوقت: ${submittedSlot.timeSlot}
- الفرع: تعز - الأقروض - الكدمة - الشارع العام`;

    window.open(`https://wa.me/967771234707?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#153B75] p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black font-cairo">حجز موعد زيارة المكتب إلكترونياً</h3>
            <p className="text-xs text-amber-300 font-tajawal">مكتب المحترف - تعز - الأقروض - الكدمة - الشارع العام</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6">
          {submittedSlot ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full font-cairo">
                  رمز الموعد: {submittedSlot.id}
                </span>
                <h4 className="text-2xl font-black text-[#0F2C59] font-cairo mt-2">
                  تم تأكيد الموعد بنجاح!
                </h4>
                <p className="text-slate-600 text-xs font-bold max-w-sm mx-auto font-tajawal mt-1">
                  ننتظر زيارتكم في التاريخ المحدد لمباشرة وتسهيل كافة معاملات السفر والجوازات.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-tajawal space-y-1.5 text-right">
                <div className="flex justify-between"><span className="text-slate-500">اسم الزائر:</span> <span className="font-bold">{submittedSlot.customerName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">التاريخ والوقت:</span> <span className="font-bold">{submittedSlot.date} | {submittedSlot.timeSlot}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">الموقع:</span> <span className="font-bold text-amber-700">تعز - الأقروض - الكدمة</span></div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={sendWhatsAppAppointment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>تأكيد عبر الواتساب</span>
                </button>
                <button
                  onClick={() => { setSubmittedSlot(null); onClose(); }}
                  className="bg-slate-200 text-slate-800 font-bold px-5 py-2.5 rounded-xl text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-tajawal flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>احجز موعدك لتجنب الانتظار والحصول على خدمة مخصصة وسريعة بالمكتب.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">الاسم الكريم *</label>
                  <input
                    type="text"
                    required
                    placeholder="اسم الزائر"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">رقم الجوال *</label>
                  <input
                    type="tel"
                    required
                    placeholder="77x xxx xxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">اختر التاريخ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">نوع الخدمة المطلوب استشارتها</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="flight">حجز طيران وتذاكر</option>
                    <option value="passport">تجديد أو استخراج جواز سفر</option>
                    <option value="hajj_umrah">برامج الحج والعمرة</option>
                    <option value="visas">تأشيرات وزيارات</option>
                    <option value="buses">حافلات ونقل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-tajawal">اختر الوقت المناسب للزيارة *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, timeSlot: slot })}
                      className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        formData.timeSlot === slot
                          ? 'bg-[#0F2C59] text-amber-300 border-[#0F2C59] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn-gold w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>تأكيد الموعد الإلكتروني</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
