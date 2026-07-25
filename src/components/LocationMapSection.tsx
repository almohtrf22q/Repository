import React from 'react';
import { MapPin, Phone, Clock, Mail, Compass, Navigation, Building2, Send, ExternalLink } from 'lucide-react';

export const LocationMapSection: React.FC = () => {
  const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent("تعز الأقروض الكدمة الشارع العام");

  return (
    <section id="location-section" className="py-16 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 px-3.5 py-1 rounded-full text-xs font-bold font-tajawal border border-amber-500/20">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>مقر مكتب المحترف المباشر</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] font-cairo">
            موقعنا ومراكز تقديم الخدمة المباشرة
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm font-bold font-tajawal">
            يسعدنا استقبالكم في مقرنا الرئيسي لتسليم وثائق الجوازات والمعاملات وتأكيد الحجوزات
          </p>
        </div>

        {/* Grid Map + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Info Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#0F2C59] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col justify-between border border-amber-500/30">
            <div className="space-y-6">
              
              <div>
                <span className="text-xs font-bold text-amber-400 font-tajawal block uppercase tracking-wider">العنوان التفصيلي</span>
                <h3 className="text-2xl font-black font-cairo text-white mt-1">
                  تعز - الأقروض - الكدمة - الشارع العام
                </h3>
                <p className="text-slate-300 text-xs leading-relaxed font-tajawal mt-2">
                  موقع متميز وسهل الوصول في الشارع العام بمنطقة الكدمة بالأقروض، يتيح لكم إنجاز وتخليص كافة معاملات السفر والجوازات بيسر وسهولة.
                </p>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-700/80 text-xs font-tajawal">
                
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold">أرقام التواصل الهاتفي والواتساب:</span>
                    <a href="tel:771234707" className="text-sm font-black text-amber-300 hover:underline dir-ltr inline-block">771234707</a>
                    <span className="text-slate-500 mx-2">|</span>
                    <a href="tel:730550440" className="text-sm font-black text-amber-300 hover:underline dir-ltr inline-block">730550440</a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold">أوقات العمل واستقبال المراجعين:</span>
                    <span className="text-xs font-bold text-slate-200">يومياً - خدمة متواصلة واستقبال المراجعين والحجوزات 24 ساعة</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-slate-400 font-bold">البريد الإلكتروني المعتمد:</span>
                    <a href="mailto:info@almuhtarif-travel.com" className="text-xs font-bold text-slate-200 hover:underline">info@almuhtarif-travel.com</a>
                  </div>
                </div>

              </div>

            </div>

            {/* Direct Directions Button */}
            <div className="pt-6 border-t border-slate-700/80 flex flex-col sm:flex-row gap-3">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold flex-1 py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md text-slate-950"
              >
                <Navigation className="w-4 h-4" />
                <span>فتح الاتجاهات عبر الخريطة</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href="https://wa.me/967771234707?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%88%D9%82%D8%B9%20%D8%A7%D9%84%D9%85%D9%83%D8%AA%D8%A8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>موقعنا عبر الواتساب</span>
              </a>
            </div>

          </div>

          {/* Interactive Visual Map Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-md relative min-h-[380px] flex flex-col">
            
            {/* Visual Simulated Map Interface */}
            <div className="relative flex-1 bg-[#12233B] p-6 text-white overflow-hidden flex flex-col justify-between">
              
              {/* Decorative Map Grid overlay */}
              <div 
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)`,
                  backgroundSize: `24px 24px`,
                  backgroundPosition: `0 0, 12px 12px`
                }}
              />

              {/* Map Top Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold text-amber-300 font-tajawal flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>الفرع الرئيسي متاح للخدمة</span>
                </div>

                <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 text-xs font-bold font-cairo">
                  تعز - اليمن
                </div>
              </div>

              {/* Centered Map Pin Visual */}
              <div className="relative z-10 text-center my-8">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 animate-pulse absolute -inset-2" />
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-xl border-2 border-white mx-auto text-slate-950 font-black">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                <h4 className="text-xl font-black font-cairo text-amber-300 mt-3">
                  مكتب المحترف للسفريات والسياحة
                </h4>
                <p className="text-slate-300 text-xs font-bold font-tajawal mt-1">
                  تعز - الأقروض - الكدمة - الشارع العام
                </p>
              </div>

              {/* Map Controls Footer */}
              <div className="relative z-10 bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 flex flex-wrap items-center justify-between text-xs font-tajawal gap-2">
                <div className="flex items-center gap-2 text-slate-200">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>خط عرض: 13.58 | خط طول: 44.02</span>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>تكبير الخريطة في غوغل مابس</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
