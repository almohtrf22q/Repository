import React from 'react';
import { MessageCircle, Phone, Clock, MapPin, Mail, Sparkles } from 'lucide-react';
import { BRAND_LOGO_IMAGE } from '../data/services';

interface ContactBannerProps {
  onOpenContact: () => void;
  onOpenBooking: () => void;
  onOpenAdmin?: () => void;
}

export const ContactBanner: React.FC<ContactBannerProps> = ({ onOpenContact, onOpenBooking, onOpenAdmin }) => {
  const whatsappUrl = "https://wa.me/967771234707?text=" + encodeURIComponent("مرحباً مكتب المحترف للسفريات والسياحة، أود الاستفسار عن الرحلات والحجوزات المتوفرة.");

  return (
    <footer className="relative bg-[#08182E] text-white pt-10 pb-8 overflow-hidden">
      {/* Top curved wave transition */}
      <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main WhatsApp Bar matching reference image bottom section */}
        <div className="bg-gradient-to-r from-[#0E2A54] via-[#0B2244] to-[#0E2A54] border border-amber-500/30 rounded-2xl p-6 lg:p-8 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 mb-12">
          
          {/* Left Text: احجز رحلتك بكل سهولة وسرعة */}
          <div className="text-center lg:text-right">
            <h3 className="text-xl sm:text-2xl font-black text-amber-400 font-cairo">
              احجز رحلتك بكل سهولة وسرعة
            </h3>
            <p className="text-slate-300 text-sm font-bold mt-1 font-tajawal">
              فريق المحترف للسفريات والسياحة وخدمات الحج والعمرة جاهز للرد على جميع استفساراتكم
            </p>
          </div>

          {/* Center Button: تواصل معنا الآن */}
          <div>
            <button
              onClick={onOpenContact}
              className="btn-gold px-8 py-3.5 rounded-xl font-black text-lg text-white shadow-lg hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
            >
              تواصل معنا الآن
            </button>
          </div>

          {/* Right Text + WhatsApp Green Icon: تواصل معنا عبر واتساب للحجز والاستفسار */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 p-3.5 px-5 rounded-2xl transition-all group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </div>
            <div className="text-right">
              <span className="block text-xs text-emerald-400 font-bold font-tajawal">
                واتساب مباشر للحجز والخدمات
              </span>
              <span className="block text-sm sm:text-base font-black text-white font-cairo dir-ltr">
                771234707 - 730550440
              </span>
            </div>
          </a>

        </div>

        {/* Footer Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-8 border-t border-slate-800 text-slate-300 text-sm">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md border border-amber-400/40 overflow-hidden flex items-center justify-center">
                <img src={BRAND_LOGO_IMAGE} alt="المحترف للسفريات" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <span className="text-xl font-black text-white font-cairo">المحترف للسفريات</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-tajawal">
              مكتب "المحترف" للسفريات والسياحة وخدمات الحج والعمرة. خياركم الموثوق للحجوزات والتأشيرات وتذاكر الطيران وتجديد الجوازات.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold text-amber-400 mb-3 font-cairo">روابط سريعة</h4>
            <ul className="space-y-2 text-xs font-bold font-tajawal">
              <li><button onClick={onOpenBooking} className="hover:text-amber-400 transition-colors">حجز طيران مباشر</button></li>
              <li><button onClick={onOpenBooking} className="hover:text-amber-400 transition-colors">برامج العمرة والحج</button></li>
              <li><button onClick={onOpenBooking} className="hover:text-amber-400 transition-colors">استخراج التأشيرات</button></li>
              <li><button onClick={onOpenBooking} className="hover:text-amber-400 transition-colors">تجديد الجوازات المستعجلة</button></li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-base font-bold text-amber-400 mb-3 font-cairo">أبرز الوجهات</h4>
            <ul className="space-y-2 text-xs font-bold font-tajawal">
              <li>رحلات مكة والمدينة (عمرة وحج)</li>
              <li>رحلات الإمارات (دبي / أبوظبي)</li>
              <li>رحلات مصر (القاهرة / شرم الشيخ)</li>
              <li>رحلات تركيا (إسطنبول / طرابزون)</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base font-bold text-amber-400 mb-3 font-cairo">معلومات الاتصال</h4>
            <ul className="space-y-2.5 text-xs text-slate-300 font-tajawal">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" /> 
                <span>موقعنا: تعز - الأقروض - الكدمة - الشارع العام</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 flex-shrink-0" /> 
                <span className="dir-ltr font-bold text-amber-200">771234707 - 730550440</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 flex-shrink-0" /> 
                <span>info@almuhtarif-travel.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" /> 
                <span>خدمة متواصلة على مدار الساعة</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-tajawal">
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} مكتب المحترف للسفريات والسياحة وخدمات الحج والعمرة
          </div>
          <div>
            <a 
              href="#admin" 
              onClick={(e) => { 
                e.preventDefault(); 
                if (onOpenAdmin) onOpenAdmin(); 
                window.location.hash = 'admin';
              }} 
              className="text-slate-500 hover:text-amber-400 text-[11px] font-bold transition-colors cursor-pointer"
            >
              • دخول مدير النظام (#admin)
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
