import React, { useState } from 'react';
import { DESTINATION_OFFERS } from '../data/offers';
import { DestinationOffer, ServiceType } from '../types';
import { Tag, Star, Clock, MapPin, Sparkles, Send, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface OffersSectionProps {
  onSelectOffer: (offer: DestinationOffer) => void;
  offers?: DestinationOffer[];
}

export const OffersSection: React.FC<OffersSectionProps> = ({ onSelectOffer, offers = DESTINATION_OFFERS }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter out offers that are hidden by the manager
  const visibleOffers = offers.filter((o) => !o.isHidden);

  const filteredOffers = selectedCategory === 'all'
    ? visibleOffers
    : visibleOffers.filter((o) => o.category === selectedCategory);

  return (
    <section id="offers-section" className="py-16 bg-slate-50 border-y border-slate-200/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-700 px-3 py-1 rounded-full text-xs font-bold font-tajawal mb-2 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>عروض ووجهات سياحية حصرية</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F2C59] font-cairo">
              أفضل الوجهات والبرامج السياحية والعمرة
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-bold mt-1 max-w-xl font-tajawal">
              اختر وجهتك المفضلة واستمتع بأسعار حصرية تشمل التذاكر، الفنادق، الفيزا والمواصلات
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'جميع العروض' },
              { id: 'package', label: 'البرامج السياحية' },
              { id: 'hajj_umrah', label: 'عمرة وحج' },
              { id: 'flight', label: 'عروض الطيران' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0F2C59] text-amber-300 shadow-md'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Image & Badge */}
                <div className="relative h-48 overflow-hidden bg-slate-900">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  {/* Discount Tag (Hidden if hideDiscount or isPriceNegotiable is enabled) */}
                  {offer.discountBadge && !offer.hideDiscount && !offer.isPriceNegotiable && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-slate-900 font-extrabold text-[11px] px-2.5 py-1 rounded-lg shadow-md font-tajawal">
                      {offer.discountBadge}
                    </span>
                  )}

                  {/* Negotiable Price Badge on top corner if price is hidden */}
                  {offer.isPriceNegotiable && (
                    <span className="absolute top-3 right-3 bg-[#0F2C59] text-amber-300 border border-amber-400/50 font-black text-[11px] px-2.5 py-1 rounded-lg shadow-md font-tajawal flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>سعر تفاوضي</span>
                    </span>
                  )}

                  {/* Country */}
                  <div className="absolute bottom-3 right-3 text-white flex items-center gap-1 text-xs font-bold font-tajawal">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{offer.city} - {offer.country}</span>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-xs text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-tajawal">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{offer.duration}</span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{offer.rating}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-tajawal">باقة متكاملة</span>
                    </div>

                    <h3 className="text-base font-black text-[#0F2C59] font-cairo leading-snug line-clamp-2">
                      {offer.title}
                    </h3>

                    {/* Highlights */}
                    <ul className="mt-2 space-y-1 text-xs text-slate-600 font-tajawal">
                      {offer.highlights.slice(0, 3).map((hl, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-slate-400 font-tajawal">
                        {offer.isPriceNegotiable ? 'السعر المعلن:' : 'سعر الفرد يبدأ من:'}
                      </span>
                      {offer.isPriceNegotiable ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-sm font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-cairo">
                            سعر تفاوضي
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black text-[#0F2C59] font-cairo">${offer.price}</span>
                          {!offer.hideDiscount && offer.originalPrice > offer.price && (
                            <span className="text-xs text-slate-400 line-through font-tajawal">${offer.originalPrice}</span>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectOffer(offer)}
                      className="bg-[#0F2C59] hover:bg-amber-500 hover:text-slate-900 text-amber-300 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{offer.isPriceNegotiable ? 'استفسار واحجز' : 'احجز الآن'}</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 font-tajawal max-w-md mx-auto shadow-xs">
            <Sparkles className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className="text-base font-black text-[#0F2C59] font-cairo">استفسر عن رحلتك القادمة مباشرة</h4>
            <p className="text-xs text-slate-600 font-bold">
              تواصل مع مكتب المحترف للحصول على أسعار وحجوزات مخصصة لك ولعائلتك حسب الطلب.
            </p>
            <a
              href="https://wa.me/967771234707?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%A7%D9%84%D9%85%D8%AD%D8%AA%D8%B1%D9%81%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D8%A3%D8%B3%D8%B9%D8%A7%D8%B1%20%D8%A7%D9%84%D8%B1%D8%AD%D9%84%D8%A7%D8%AA"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <span>تواصل عبر الواتساب للاستفسار</span>
            </a>
          </div>
        )}

      </div>
    </section>
  );
};
