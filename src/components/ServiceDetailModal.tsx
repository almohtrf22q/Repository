import React, { useState } from 'react';
import { ServiceItem, ServiceType } from '../types';
import { X, Check, Send, PhoneCall, Calendar, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

interface ServiceDetailModalProps {
  service: ServiceItem | null;
  onClose: () => void;
  onOpenBookingForService: (serviceType: ServiceType) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  onClose,
  onOpenBookingForService
}) => {
  if (!service) return null;

  const whatsappMessage = encodeURIComponent(`مرحباً المحترف للسفريات، أود الاستفسار والحجز لخدمة: ${service.title}`);
  const whatsappUrl = `https://wa.me/967771234707?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#0F2C59] via-[#153B75] to-[#0F2C59] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 p-1.5 flex items-center justify-center border border-amber-400/30">
              <img src={service.image} alt={service.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-cairo">{service.title}</h3>
              <p className="text-xs text-amber-300 font-tajawal">{service.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Main image banner & Description */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="w-32 h-32 flex-shrink-0 flex items-center justify-center bg-white rounded-xl p-2 shadow-sm border border-slate-200/60">
              <img src={service.image} alt={service.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="space-y-2 text-right">
              <p className="text-slate-700 leading-relaxed font-bold font-tajawal text-sm sm:text-base">
                {service.description}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-amber-700 text-xs font-extrabold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>ضمان أفضل سعر وخدمة فائقة السرعة</span>
              </div>
            </div>
          </div>

          {/* Key Features List */}
          <div>
            <h4 className="text-base font-bold text-[#0F2C59] mb-3 font-cairo flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>مميزات الخدمة المعروضة:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.features.map((feature, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/60">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-tajawal">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive CTA Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onOpenBookingForService(service.id);
              }}
              className="w-full sm:flex-1 btn-gold py-3 px-4 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Calendar className="w-5 h-5" />
              <span>تقديم طلب حجز مباشر</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <Send className="w-5 h-5" />
              <span>استفسار فوراً عبر الواتساب</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
