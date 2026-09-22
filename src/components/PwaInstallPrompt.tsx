"use client";

import { useState, useEffect } from "react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);

  useEffect(() => {
    // 1. Service Worker रजिस्ट्रेशन
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // 2. क्या पहले से इंस्टॉल है (Standalone mode)?
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    // 3. क्या यूज़र ने हाल ही में डिसमिस किया है?
    const isDismissed = sessionStorage.getItem("examsewa_pwa_dismissed");
    if (isDismissed === "true") return;

    // 4. BeforeInstallPrompt पकड़ना
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Fallback: 10 सेकंड बाद अगर सपोर्टेड है तो बैनर दिखाएँ
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 10000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      clearTimeout(timer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // अगर ब्राउज़र ऑटो-प्रॉम्प्ट ब्लॉक करे तो सीधा तरीका
      alert("अपने ब्राउज़र के 3-डॉट्स (⋮) पर क्लिक करें और 'Install app' या 'Add to Home screen' चुनें।");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("examsewa_pwa_dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 pointer-events-auto">
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-800 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm">
            ES
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">
              Exam Sewa ऐप
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              1-क्लिक में होमस्क्रीन पर जोड़ें
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition cursor-pointer"
          >
            इंस्टॉल
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white rounded-xl text-sm font-bold active:scale-95 transition cursor-pointer"
            title="बंद करें"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
