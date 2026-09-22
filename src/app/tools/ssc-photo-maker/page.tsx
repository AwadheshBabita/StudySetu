import PhotoNameDateClient from "../photo-name-date/page";

export default function SSCPhotoMakerPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* SSC टारगेटेड भर्ती बैनर */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white py-6 px-4 border-b border-blue-900/20 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>🎯</span> SSC भर्ती स्पेशल प्रीसेट (2026)
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            SSC CGL, CHSL व GD फोटो रीसाइज़र (20KB - 50KB)
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            आधिकारिक एसएससी गाइडलाइन (3.5 × 4.5 सेमी) अनुसार नाम व फोटो खींचने की तारीख (DOP) डालें। बिना क्वालिटी खराब किए 100% सटीक सरकारी फॉर्म रेडी आउटपुट।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[11px] font-semibold text-blue-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ साइज़: 20KB - 50KB लॉक</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ अनुपात: 3.5cm x 4.5cm</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ वाइट बैकग्राउंड सपोर्ट</span>
          </div>
        </div>
      </div>

      {/* मूल टूल इंजन */}
      <PhotoNameDateClient />
    </div>
  );
}
