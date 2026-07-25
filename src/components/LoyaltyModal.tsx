import React, { useState } from 'react';
import { LoyaltyProfile } from '../types';
import { X, Award, Star, Gift, Phone, CheckCircle2, Search, ArrowLeft, Sparkles } from 'lucide-react';

interface LoyaltyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyModal: React.FC<LoyaltyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [phone, setPhone] = useState('771234707');
  const [profile, setProfile] = useState<LoyaltyProfile | null>({
    phone: '771234707',
    customerName: 'محمد أحمد',
    points: 340,
    tier: 'gold',
    completedBookingsCount: 5,
    rewards: [
      { id: 'r1', title: 'خصم 50$ على حجز تذكرة الطيران القادمة', pointsRequired: 200, discountAmount: 50, unlocked: true },
      { id: 'r2', title: 'خصم 15% على برامج العمرة المتميزة', pointsRequired: 300, discountAmount: 15, unlocked: true },
      { id: 'r3', title: 'تأشيرة دبي مجانية مع باقة العائلات', pointsRequired: 600, discountAmount: 100, unlocked: false }
    ]
  });

  const [redeemedReward, setRedeemedReward] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setProfile({
      phone,
      customerName: 'عميل المحترف المميز',
      points: Math.floor(100 + Math.random() * 400),
      tier: 'gold',
      completedBookingsCount: Math.floor(2 + Math.random() * 6),
      rewards: [
        { id: 'r1', title: 'خصم 50$ على حجز تذكرة الطيران القادمة', pointsRequired: 200, discountAmount: 50, unlocked: true },
        { id: 'r2', title: 'خصم 15% على برامج العمرة المتميزة', pointsRequired: 300, discountAmount: 15, unlocked: true },
        { id: 'r3', title: 'تأشيرة سياحية مجانية أو خصم VIP', pointsRequired: 500, discountAmount: 100, unlocked: false }
      ]
    });
  };

  const handleRedeem = (rewardId: string, title: string) => {
    setRedeemedReward(`تم استبدال المكافأة (${title}) بنجاح! كود الخصم الخاص بك هو: LOYALTY-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-700 to-amber-900 text-amber-200';
      case 'silver': return 'from-slate-400 to-slate-600 text-slate-100';
      case 'gold': return 'from-amber-400 to-amber-600 text-slate-900';
      case 'diamond': return 'from-cyan-400 to-blue-600 text-white';
      default: return 'from-amber-500 to-amber-700 text-white';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'المستوى البرونزي';
      case 'silver': return 'المستوى الفضي';
      case 'gold': return 'المستوى الذهبي VIP';
      case 'diamond': return 'المستوى الماسي المتميز';
      default: return 'المستوى الذهبي';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F2C59] via-[#16386C] to-[#0F2C59] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-xl font-black font-cairo">برنامج ولاء "نقاط المحترف"</h3>
              <p className="text-xs text-amber-300 font-tajawal">احصل على نقاط مع كل حجز واستبدلها بخصومات وجوائز</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {/* Phone lookup */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              <input
                type="tel"
                required
                placeholder="أدخل رقم الجوال لمعاينة نقاطك..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <button type="submit" className="btn-gold px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1 cursor-pointer">
              <Search className="w-4 h-4" />
              <span>فحص النقاط</span>
            </button>
          </form>

          {redeemedReward && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 font-tajawal animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{redeemedReward}</span>
            </div>
          )}

          {profile && (
            <div className="space-y-4">
              
              {/* Badge Card */}
              <div className={`p-4 rounded-2xl bg-gradient-to-r ${getTierColor(profile.tier)} shadow-lg flex items-center justify-between`}>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest font-tajawal opacity-80 block">عضوية المحترف المعتمدة</span>
                  <h4 className="text-lg font-black font-cairo mt-0.5">{profile.customerName}</h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-black/20 text-xs font-bold px-2.5 py-1 rounded-lg backdrop-blur-xs font-tajawal">
                      {getTierName(profile.tier)}
                    </span>
                    <span className="text-xs font-bold font-tajawal opacity-90">
                      {profile.completedBookingsCount} حجوزات منجزة
                    </span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl text-center border border-white/20 min-w-[100px]">
                  <span className="block text-[10px] font-bold uppercase font-tajawal opacity-80">رصيد النقاط</span>
                  <span className="text-2xl font-black font-cairo">{profile.points}</span>
                  <span className="block text-[9px] font-bold font-tajawal">نقطة</span>
                </div>
              </div>

              {/* Reward Vouchers List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2 font-cairo flex items-center gap-1.5">
                  <Gift className="w-4 h-4 text-amber-500" />
                  <span>المكافآت والخصومات المتاحة لاستبدال نقاطك:</span>
                </h4>

                <div className="space-y-2">
                  {profile.rewards.map((r) => {
                    const canRedeem = profile.points >= r.pointsRequired;
                    return (
                      <div key={r.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs font-tajawal">
                        <div>
                          <span className="font-bold text-[#0F2C59] block">{r.title}</span>
                          <span className="text-[11px] text-slate-500">يتطلب: {r.pointsRequired} نقطة</span>
                        </div>

                        <button
                          disabled={!canRedeem}
                          onClick={() => handleRedeem(r.id, r.title)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer transition-all ${
                            canRedeem 
                              ? 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-xs' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {canRedeem ? 'استبدال الآن' : 'نقاط غير كافية'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
