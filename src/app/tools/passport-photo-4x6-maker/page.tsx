import PassportGridClient from "../passport-grid-maker/page";

export default function PassportPhoto4x6Page() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* 4x6 स्टूडियो स्पेशल एम्बर/गोल्डन थीम बैनर */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-stone-900 text-white py-6 px-4 border-b border-amber-900/40 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>🖨️</span> सीएससी व स्टूडियो 4x6 स्पेशल प्रीसेट
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            4×6 पासपोर्ट फोटो शीट मेकर (300 DPI HD प्रिंट)
          </h1>
          <p className="text-amber-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            बिना फोटोशॉप के 4×6 ग्लॉसी पेपर पर 8 व 12 पासपोर्ट फोटो तुरंत सेट करें। कैंची से काटने हेतु सॉलिड ब्लैक आउटलाइन और 300 DPI एचडी प्रिंट रेडी JPG/PDF।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[11px] font-semibold text-amber-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ 4x6 लैंडस्केप (8 फोटो) व पोर्ट्रेट (12 फोटो)</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ सॉलिड ब्लैक कटिंग आउटलाइन बॉर्डर</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ 300 DPI लैब क्वालिटी आउटपुट</span>
          </div>
        </div>
      </div>

      {/* मूल टूल इंजन */}
      <PassportGridClient />
    </div>
  );
}
