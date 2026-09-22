import PhotoNameDateClient from "../photo-name-date/page";

export default function UPPolicePhotoPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* UP Police स्पेशल खाकी-थीम बैनर */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-slate-900 text-white py-6 px-4 border-b border-amber-950/30 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>🛡️</span> UPPRPB भर्ती स्पेशल प्रीसेट
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            UP Police फोटो व हस्ताक्षर रीसाइज़र (20KB - 50KB)
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            कांस्टेबल, सब-इंस्पेक्टर (SI) व अन्य पदों के लिए 3.5 × 4.5 सेमी फोटो पर नाम/DOP जोड़ें और सटीक 20KB-50KB फॉर्म रेडी फाइल तैयार करें।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[11px] font-semibold text-amber-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ फोटो साइज़: 20KB - 50KB</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ हस्ताक्षर सपोर्ट: 10KB - 20KB</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ चेहरा 70% कवर्ड अनुपात</span>
          </div>
        </div>
      </div>

      {/* मूल टूल इंजन */}
      <PhotoNameDateClient />
    </div>
  );
}
