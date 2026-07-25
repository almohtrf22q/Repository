import React from 'react';
import { SERVICES_DATA } from '../data/services';
import { ServiceItem } from '../types';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  return (
    <section id="services" className="py-12 sm:py-16 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: خدماتنا */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-amber-600 flex-1" />
            <div className="w-3 h-3 bg-amber-500 rotate-45 shadow-xs" />
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2C59] tracking-wide font-cairo">
              خدماتنا
            </h2>
            <div className="w-3 h-3 bg-amber-500 rotate-45 shadow-xs" />
            <div className="h-[2px] bg-gradient-to-l from-transparent via-amber-500 to-amber-600 flex-1" />
          </div>
          <p className="mt-2 text-slate-600 font-bold text-base sm:text-lg max-w-2xl font-tajawal">
            نقدم باقة شاملة من أرقى خدمات السفر والسياحة والمعاملات للعملاء والشركات
          </p>
        </div>

        {/* 6 Service Cards Grid (Matching reference screenshot exactly) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SERVICES_DATA.map((service) => (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="service-card rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer group relative overflow-hidden"
            >
              {/* Image Icon Box */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 mb-4 relative flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <img
                  src={service.image}
                  alt={service.title}
                  className="max-w-full max-h-full object-contain drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Card Title */}
              <h3 className="text-xl font-bold text-[#0F2C59] group-hover:text-amber-600 transition-colors font-cairo mb-2">
                {service.title}
              </h3>

              {/* Subtitle / Short description */}
              <p className="text-xs sm:text-sm text-slate-500 font-bold line-clamp-2 mb-4 font-tajawal">
                {service.subtitle}
              </p>

              {/* Interactive badge on hover */}
              <div className="mt-auto pt-2 flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:translate-x-[-4px] transition-transform">
                <span>طلب الخدمة والتفاصيل</span>
                <ArrowLeft className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
