import React, { useState } from 'react';
import { Compass, Menu, X, Phone, Calendar, Send, MapPin, Mail, QrCode, Bell, Award, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { BRAND_LOGO_IMAGE } from '../data/services';

interface HeaderProps {
  onOpenBooking: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onScrollToServices: () => void;
  onOpenTrackOrder: () => void;
  onOpenAppointment: () => void;
  onOpenLoyalty: () => void;
  onOpenNotifications: () => void;
  onOpenAdmin: () => void;
  onScrollToOffers: () => void;
  onScrollToMap: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBooking,
  onOpenAbout,
  onOpenContact,
  onScrollToServices,
  onOpenTrackOrder,
  onOpenAppointment,
  onOpenLoyalty,
  onOpenNotifications,
  onOpenAdmin,
  onScrollToOffers,
  onScrollToMap,
  unreadCount = 2
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Contact & Quick Nav Bar */}
      <div className="bg-[#0B1E3D] text-slate-200 text-xs font-bold py-1.5 border-b border-amber-500/30 font-tajawal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2">
          
          {/* Location */}
          <div className="flex items-center gap-1.5 text-amber-300 cursor-pointer" onClick={onScrollToMap}>
            <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>موقعنا: تعز - الأقروض - الكدمة - الشارع العام</span>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            
            <button
              onClick={onOpenTrackOrder}
              className="text-amber-400 hover:text-white flex items-center gap-1 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 cursor-pointer transition-all"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>تتبع طلبك بالرمز</span>
            </button>

            <button
              onClick={onOpenLoyalty}
              className="text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">برنامج الولاء</span>
            </button>

            <div className="flex items-center gap-1.5 dir-ltr hidden sm:flex">
              <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <a href="tel:771234707" className="hover:text-amber-300 transition-colors">771234707</a>
              <span className="text-slate-500">-</span>
              <a href="tel:730550440" className="hover:text-amber-300 transition-colors">730550440</a>
            </div>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-amber-400/40 group-hover:scale-105 transition-transform duration-300 overflow-hidden flex items-center justify-center">
                <img
                  src={BRAND_LOGO_IMAGE}
                  alt="شعار المحترف للسفريات والسياحة"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-[#0F2C59] leading-none font-cairo">
                المحترف
              </span>
              <span className="text-xs font-bold text-amber-600 tracking-wide font-tajawal mt-1">
                للسفريات والسياحة
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 font-bold text-slate-700 text-sm">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-amber-600 border-b-2 border-amber-500 pb-1 font-extrabold transition-colors cursor-pointer"
            >
              الرئيسية
            </button>
            <button 
              onClick={onScrollToServices}
              className="hover:text-amber-600 transition-colors pb-1 cursor-pointer"
            >
              خدماتنا
            </button>
            <button 
              onClick={onScrollToOffers}
              className="hover:text-amber-600 transition-colors pb-1 cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>العروض والوجهات</span>
            </button>
            <button 
              onClick={onOpenAppointment}
              className="hover:text-amber-600 transition-colors pb-1 cursor-pointer"
            >
              حجز موعد
            </button>
            <button 
              onClick={onOpenTrackOrder}
              className="hover:text-amber-600 transition-colors pb-1 cursor-pointer"
            >
              تتبع الطلب
            </button>
            <button 
              onClick={onOpenAbout}
              className="hover:text-amber-600 transition-colors pb-1 cursor-pointer"
            >
              من نحن
            </button>
            <button 
              onClick={onOpenContact}
              className="hover:text-amber-600 transition-colors pb-1 cursor-pointer"
            >
              اتصل بنا
            </button>
          </nav>

          {/* Header Action Button & Notifications */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="الإشعارات"
            >
              <Bell className="w-5 h-5 text-[#0F2C59]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Smart Booking CTA Button */}
            <button
              onClick={onOpenBooking}
              className="btn-navy px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 group cursor-pointer shadow-md"
            >
              <Calendar className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>الحجز الذكي المباشر</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <Bell className="w-5 h-5 text-[#0F2C59]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-900 text-[9px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-3 font-bold animate-in slide-in-from-top-2 text-sm">
          <button 
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-amber-600 font-extrabold"
          >
            الرئيسية
          </button>
          <button 
            onClick={() => { onScrollToServices(); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-slate-700 hover:text-amber-600"
          >
            خدماتنا الرئيسية
          </button>
          <button 
            onClick={() => { onScrollToOffers(); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-slate-700 hover:text-amber-600"
          >
            العروض والوجهات السياحية
          </button>
          <button 
            onClick={() => { onOpenTrackOrder(); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-[#0F2C59] font-black flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-amber-500" />
            <span>تتبع الطلب لحظياً (QR)</span>
          </button>
          <button 
            onClick={() => { onOpenAppointment(); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-slate-700 hover:text-amber-600"
          >
            حجز موعد زيارة المكتب
          </button>
          <button 
            onClick={() => { onOpenLoyalty(); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-slate-700 hover:text-amber-600"
          >
            برنامج الولاء والخصومات
          </button>
          <button 
            onClick={() => { onOpenAbout(); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-slate-700 hover:text-amber-600"
          >
            من نحن
          </button>
          <button 
            onClick={() => { onOpenContact(); setMobileMenuOpen(false); }}
            className="block w-full text-right py-2 text-slate-700 hover:text-amber-600"
          >
            اتصل بنا
          </button>
          <div className="pt-2">
            <button
              onClick={() => { onOpenBooking(); setMobileMenuOpen(false); }}
              className="w-full btn-navy py-3 rounded-xl text-center font-bold flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>الحجز الذكي المباشر</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
