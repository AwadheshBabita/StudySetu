import PDFCompressorClient from "../pdf-compressor/page";

export default function GovtExamPDFPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* सरकारी एग्जाम पीडीएफ स्पेशल रेड/क्रिमसन थीम बैनर */}
      <div className="bg-gradient-to-r from-rose-950 via-red-900 to-slate-900 text-white py-6 px-4 border-b border-rose-900/40 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-rose-400/20 text-rose-300 border border-rose-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>📑</span> सरकारी फॉर्म स्पेशल PDF प्रीसेट
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            सरकारी फॉर्म PDF कंप्रेसर (100KB, 200KB, 500KB)
          </h1>
          <p className="text-rose-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            UPSC, SSC, IBPS और राज्य स्तरीय भर्ती फॉर्म के अनुसार PDF को सटीक 100KB या 200KB में कंप्रेस करें। सरकारी मुहर, दस्तखत और फ़ॉन्ट बिल्कुल साफ़ रहेंगे।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[11px] font-semibold text-rose-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ लक्ष्य प्रीसेट: 100KB, 200KB, 500KB</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ मुहर व हस्ताक्षर स्पष्टता लॉक</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ सिंगल व मल्टी-पेज PDF सपोर्ट</span>
          </div>
        </div>
      </div>

      {/* मूल टूल इंजन */}
      <PDFCompressorClient />
    </div>
  );
}
