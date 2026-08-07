import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';
import { X, Bell, Sparkles, CheckCircle2, Info, Gift, Tag, ExternalLink } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification?: (notif: AppNotification) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              
              {/* Header */}
              <div className="bg-[#0F2C59] p-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-amber-400 absolute -top-0.5 -right-0.5 animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black font-cairo">مركز الإشعارات والتنبيهات</h3>
                    <p className="text-xs text-amber-300 font-tajawal">آخر التحديثات والعروض وتنبيهات الحجز</p>
                  </div>
                </div>

                <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Action bar */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-tajawal">
                <span className="text-slate-600 font-bold">إجمالي الإشعارات ({notifications.length})</span>
                <button
                  onClick={onMarkAllAsRead}
                  className="text-[#0F2C59] hover:text-amber-600 font-bold underline cursor-pointer"
                >
                  تعليم الكل كقروء
                </button>
              </div>

              {/* Notification Items */}
              <div className="p-4 overflow-y-auto flex-1 space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onSelectNotification && onSelectNotification(n)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        n.read 
                          ? 'bg-white border-slate-200' 
                          : 'bg-amber-50/60 border-amber-300/80 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          n.type === 'offer' ? 'bg-amber-500/20 text-amber-600' :
                          n.type === 'order' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-blue-500/20 text-blue-600'
                        }`}>
                          {n.type === 'offer' ? <Gift className="w-4 h-4" /> :
                           n.type === 'order' ? <CheckCircle2 className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-[#0F2C59] font-cairo">{n.title}</h4>
                            <span className="text-[10px] text-slate-400 font-tajawal">{n.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-tajawal mt-1 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 text-xs font-tajawal">
                    لا يوجد إشعارات جديدة حالياً
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-tajawal">
                تنبيهات فورية ومحدثة من المحترف للسفريات والسياحة
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
