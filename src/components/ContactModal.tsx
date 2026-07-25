import React from 'react';
import { X, Phone, Mail, MapPin, Clock, Send, MessageCircle } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const whatsapp1 = "https://wa.me/967771234707?text=" + encodeURIComponent("مرحباً المحترف للسفريات والسياحة، أود الاستفسار عن رحلة أو حجز.");
  const whatsapp2 = "https://wa.me/967730550440?text=" + encodeURIComponent("مرحباً المحترف للسفريات والسياحة، أود الاستفسار عن رحلة أو حجز.");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2C59] to-[#153B75] p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black font-cairo">تواصل معنا - المحترف للسفريات والسياحة</h3>
            <p className="text-xs text-amber-300 font-tajawal">خدمات الحج والعمرة والرحلات والتأشيرات</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          <div className="space-y-3.5">
            
            {/* Address / Location */}
            <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
              <div className="w-10 h-10 rounded-lg bg-amber-500 text-slate-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-xs font-bold text-amber-900 font-tajawal">موقعنا الرئيسي</span>
                <span className="text-sm font-black text-[#0F2C59] font-cairo">تعز - الأقروض - الكدمة - الشارع العام</span>
              </div>
            </div>

            {/* Phone Number 1 */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 font-tajawal">للتواصل والاستفسار (رقم 1)</span>
                  <a href="tel:771234707" className="text-base font-black text-[#0F2C59] dir-ltr inline-block font-cairo hover:text-amber-600">
                    771234707
                  </a>
                </div>
              </div>
              <a
                href={whatsapp1}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </a>
            </div>

            {/* Phone Number 2 */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-500 font-tajawal">للتواصل والاستفسار (رقم 2)</span>
                  <a href="tel:730550440" className="text-base font-black text-[#0F2C59] dir-ltr inline-block font-cairo hover:text-amber-600">
                    730550440
                  </a>
                </div>
              </div>
              <a
                href={whatsapp2}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </a>
            </div>

            {/* Email */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 font-tajawal">البريد الإلكتروني الرسمى</span>
                <a href="mailto:info@almuhtarif-travel.com" className="text-sm font-bold text-[#0F2C59] hover:underline">
                  info@almuhtarif-travel.com
                </a>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-500 font-tajawal">أوقات العمل</span>
                <span className="text-sm font-bold text-slate-800 font-tajawal">يومياً - استقبال طلباتكم واستفساراتكم على مدار 24 ساعة</span>
              </div>
            </div>

          </div>

          <div className="pt-2 flex justify-center">
            <button
              onClick={onClose}
              className="w-full btn-navy py-3 rounded-xl font-bold cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
