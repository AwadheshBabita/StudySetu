import CertificateFitterClient from "../certificate-fitter/page";

export default function BiharRTPSDocumentPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* RTPS / Scholarship स्पेशल ई-गवर्नेंस थीम बैनर */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 text-white py-6 px-4 border-b border-purple-900/30 shadow-inner">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-purple-400/20 text-purple-300 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <span>📜</span> RTPS व छात्रवृत्ति स्पेशल प्रीसेट
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            जाति, आय, निवास व मार्कशीट कंप्रेसर (50KB - 100KB)
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            बिहार RTPS और स्कॉलरशिप पोर्टल गाइडलाइन अनुसार प्रमाणपत्र को 50KB से 100KB में सेट करें। ब्राइटनेस ट्यूनर से सरकारी मोहर व हस्ताक्षर बिल्कुल साफ रखें।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-[11px] font-semibold text-purple-200">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ साइज़: 50KB - 100KB लॉक</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ मोहर व लिखावट एनहांसर</span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg">✓ JPG एवं PDF दोनों आउटपुट</span>
          </div>
        </div>
      </div>

      {/* मूल टूल इंजन */}
      <CertificateFitterClient />
    </div>
  );
}
