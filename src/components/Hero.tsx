import React from 'react';
import { HERO_BANNER_IMAGE } from '../data/services';
import { Compass, Sparkles, ArrowLeft } from 'lucide-react';

interface HeroProps {
  onDiscoverClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onDiscoverClick }) => {
  return (
    <section className="relative overflow-hidden bg-slate-900 min-h-[500px] lg:min-h-[580px] flex flex-col justify-between">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BANNER_IMAGE}
          alt="رحلاتك معنا إلى الإمارات ومصر وتركيا والسعودية"
          className="w-full h-full object-cover object-center transform scale-102 hover:scale-100 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Soft atmospheric overlay gradients to make Arabic white text popping and crisp */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1E3D]/80 via-black/25 to-sky-900/20" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 flex flex-col items-center text-center my-auto">
        
        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg max-w-4xl tracking-tight font-cairo mb-4">
          رحلاتك معنا إلى <span className="text-amber-400">الإمارات</span>، <span className="text-amber-400">مصر</span>، <span className="text-amber-400">تركيا</span>،
        </h1>

        {/* Subtitle with gold accent lines */}
        <div className="flex items-center gap-3 my-2 max-w-2xl w-full justify-center">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent flex-1" />
          <p className="text-lg sm:text-2xl font-bold text-slate-100 drop-shadow-md font-tajawal">
            أفضل العروض والخدمات المتكاملة للسفر والسياحة.
          </p>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-400/80 to-transparent flex-1" />
        </div>

        {/* Discover Now Button (اكتشف الآن) */}
        <div className="mt-8">
          <button
            onClick={onDiscoverClick}
            className="btn-gold px-10 py-3.5 rounded-xl font-black text-xl text-white shadow-xl flex items-center gap-3 group cursor-pointer"
          >
            <span>اكتشف الآن</span>
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </button>
        </div>

      </div>

      {/* Decorative Wave Separator (Navy & Gold Curve) */}
      <div className="relative z-10 w-full overflow-hidden leading-none -mb-1">
        <svg
          className="relative block w-full h-16 sm:h-24 lg:h-28 text-slate-50"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {/* Subtle gold accent border stroke curve */}
          <path
            d="M0,0 C300,90 900,90 1200,0 L1200,120 L0,120 Z"
            fill="#D4AF37"
            opacity="0.35"
          />
          {/* Main wave matching the exact dark blue/white curve in image */}
          <path
            d="M0,15 C320,110 880,110 1200,15 L1200,120 L0,120 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
};
