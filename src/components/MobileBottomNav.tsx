import React from 'react';
import { Home, Grid, Sparkles, Search, Calendar, ShieldCheck } from 'lucide-react';

interface MobileBottomNavProps {
  onGoHome: () => void;
  onScrollToServices: () => void;
  onScrollToOffers: () => void;
  onOpenTrackOrder: () => void;
  onOpenBooking: () => void;
  onOpenAdmin?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onGoHome,
  onScrollToServices,
  onScrollToOffers,
  onOpenTrackOrder,
  onOpenBooking
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] py-1.5 px-2 font-tajawal">
      <div className="max-w-md mx-auto flex items-center justify-around">
        
        {/* Home */}
        <button
          onClick={onGoHome}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-95 transition-all p-1 cursor-pointer"
        >
          <Home className="w-5 h-5 text-slate-700" />
          <span className="text-[10px] font-bold">الرئيسية</span>
        </button>

        {/* Services */}
        <button
          onClick={onScrollToServices}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-95 transition-all p-1 cursor-pointer"
        >
          <Grid className="w-5 h-5 text-slate-700" />
          <span className="text-[10px] font-bold">الخدمات</span>
        </button>

        {/* Quick Booking CTA (Highlighted Central Button) */}
        <button
          onClick={onOpenBooking}
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer active:scale-95 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0F2C59] via-[#1E3A8A] to-amber-500 text-white flex items-center justify-center shadow-lg border-2 border-white">
            <Calendar className="w-6 h-6 text-amber-300" />
          </div>
          <span className="text-[10px] font-black text-[#0F2C59] mt-0.5">حجز سريع</span>
        </button>

        {/* Offers */}
        <button
          onClick={onScrollToOffers}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-95 transition-all p-1 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span className="text-[10px] font-bold">العروض</span>
        </button>

        {/* Track Order */}
        <button
          onClick={onOpenTrackOrder}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-600 hover:text-amber-600 active:scale-95 transition-all p-1 cursor-pointer"
        >
          <Search className="w-5 h-5 text-slate-700" />
          <span className="text-[10px] font-bold">تتبع الطلب</span>
        </button>

      </div>
    </div>
  );
};
