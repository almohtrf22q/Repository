import React, { useEffect, useState } from 'react';
import { Download, X, Share } from 'lucide-react';

// Detects the standard Android/Chrome install prompt, and shows manual
// instructions on iOS Safari (which doesn't support beforeinstallprompt).
export const InstallAppPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Already installed / running as standalone app? Never show the prompt.
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    if (isStandalone) return;

    if (sessionStorage.getItem('almuhtarif_install_dismissed')) return;

    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after a short delay so it doesn't interrupt
      // the first paint.
      const t = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(t);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('almuhtarif_install_dismissed', '1');
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm">
      <div className="bg-[#0F1E37] text-white rounded-2xl shadow-2xl border border-amber-500/30 p-4 flex items-start gap-3 font-cairo">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          {isIOS ? (
            <>
              <p className="text-sm font-bold mb-1">ثبّت تطبيق المحترف على جهازك</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                اضغط زر المشاركة <Share className="w-3.5 h-3.5 inline mx-0.5" /> بالأسفل، ثم اختر
                "إضافة إلى الشاشة الرئيسية".
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-bold mb-1">ثبّت تطبيق المحترف على جهازك</p>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">
                وصول أسرع بدون متصفح، مثل أي تطبيق آخر على هاتفك.
              </p>
              <button
                onClick={handleInstall}
                className="w-full py-2 rounded-lg bg-amber-500 text-[#0F1E37] font-black text-xs cursor-pointer"
              >
                تثبيت الآن
              </button>
            </>
          )}
        </div>
        <button onClick={dismiss} className="text-slate-400 hover:text-white cursor-pointer flex-shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
