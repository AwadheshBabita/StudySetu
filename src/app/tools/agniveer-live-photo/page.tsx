import LivePhotoCaptureClient from "../live-photo-capture/page";

export default function AgniveerLivePhotoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Agniveer स्पेशल मिलिट्री ग्रीन थीम बैनर */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-950 text-white py-6 px-4 border-b border-emerald-900/40 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>🎖️</span> अग्निवीर सेना भर्ती स्पेशल प्रीसेट
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            अग्निवीर लाइव वेबकैम फोटो कैप्चर (20KB - 50KB)
          </h1>
          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            आर्मी जीडी, क्लर्क व टेक्निकल ऑनलाइन फॉर्म हेतु मोबाइल या लैपटॉप कैमरे से फेस ओवल गाइड में लाइव फोटो खींचें। 100% सरकारी फॉर्म रेडी आउटपुट।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[11px] font-semibold text-emerald-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ साइज़: 20KB - 50KB ऑटो-लॉक</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ फेस ओवल गाइड सपोर्ट</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ 3 सेकंड टाइमर व कैमरा स्विच</span>
          </div>
        </div>
      </div>

      {/* मूल टूल इंजन */}
      <LivePhotoCaptureClient />
    </div>
  );
}
