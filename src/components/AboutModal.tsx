import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, ShieldCheck, Clock, Users, Globe, CheckCircle } from 'lucide-react';
import { BRAND_LOGO_IMAGE } from '../data/services';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBooking: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenBooking }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
          >
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0F2C59] to-[#153B75] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white p-0.5 shadow-md border border-amber-400/40 overflow-hidden flex items-center justify-center">
                  <img src={BRAND_LOGO_IMAGE} alt="شعار المحترف" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h3 className="text-xl font-black font-cairo">من نحن - مكتب المحترف للسفريات والسياحة</h3>
                  <p className="text-xs text-amber-300 font-tajawal">خبرة تمتد لأكثر من 15 عاماً في حلول السفر المتكاملة</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/60 leading-relaxed font-tajawal text-slate-800 text-sm sm:text-base font-bold">
                مكتب <span className="text-[#0F2C59] font-black">المحترف للسفريات والسياحة</span> هو وجهتكم الأولى والأكثر موثوقية لتنظيم كافة رحلات السفر، واستخراج التأشيرات، وحجوزات الطيران والفنادق، وخدمات المعتمرين وحجاج بيت الله الحرام بأعلى معايير الدقة والسرعة.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Award className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-xl font-black text-[#0F2C59] font-cairo">+15 عاماً</div>
                  <div className="text-xs font-bold text-slate-500 font-tajawal">خبرة في السفر والسياحة</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Users className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-xl font-black text-[#0F2C59] font-cairo">+50,000</div>
                  <div className="text-xs font-bold text-slate-500 font-tajawal">عميل سعيد ومستفيد</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Globe className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <div className="text-xl font-black text-[#0F2C59] font-cairo">100+ وجهة</div>
                  <div className="text-xs font-bold text-slate-500 font-tajawal">شراكات دولية رسمية</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-base font-bold text-[#0F2C59] font-cairo">لماذا يختار العملاء مكتب المحترف؟</h4>
                <div className="space-y-2">
                  {[
                    'سرعة فائقة في معالجة واستخراج التأشيرات والجوازات المستعجلة',
                    'عقود مباشرة مع الخطوط الجوية وفنادق الإمارات ومصر وتركيا والمملكة',
                    'دعم ومتابعة مستمرة على مدار الساعة طوال أيام الأسبوع',
                    'أسعار شفافة بدون أي رسوم خفية أو إضافية'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-2.5 text-xs sm:text-sm font-bold text-slate-700 font-tajawal">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    onClose();
                    onOpenBooking();
                  }}
                  className="btn-gold py-3 px-6 rounded-xl font-black text-sm cursor-pointer"
                >
                  احجز رحلتك معنا الآن
                </button>
              </div>

            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
