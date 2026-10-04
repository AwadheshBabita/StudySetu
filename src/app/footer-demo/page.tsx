import React from 'react';
import Link from 'next/link';

export default function FooterDemo() {
  const categories = [
    {
      title: "फोटो व हस्ताक्षर",
      icon: "📷",
      links: [
        { name: "पासपोर्ट फोटो (नाम/तारीख)", href: "/tools/photo-name-date", badge: "Popular" },
        { name: "सिग्नेचर रिसाइज़र व A4 स्कैनर", href: "/tools/signature-resize" },
        { name: "4×6 पासपोर्ट फोटो शीट", href: "/tools/passport-photo-4x6-maker" },
        { name: "फोटो एंड डॉक क्रॉपर", href: "/tools/photo-crop" },
        { name: "पासपोर्ट फोटो ग्रिड (A4)", href: "/tools/passport-grid-maker" },
        { name: "लाइव वेबकैम फोटो कैप्चर", href: "/tools/live-photo-capture" },
        { name: "सटीक पिक्सेल रिसाइज़र", href: "/tools/exact-pixel-resize" },
        { name: "सटीक KB कंप्रेसर", href: "/tools/exact-kb-compressor" },
      ]
    },
    {
      title: "डॉक्यूमेंट व कार्ड",
      icon: "🪪",
      links: [
        { name: "स्मार्ट डॉक्यूमेंट स्कैनर", href: "/tools/document-scanner" },
        { name: "आईडी कार्ड जॉइनर (Front+Back)", href: "/tools/id-card-joiner", badge: "Top" },
        { name: "आईडी कार्ड सिंगल क्रॉपर", href: "/tools/id-card-cropper" },
        { name: "सर्टिफिकेट A4 फिटर", href: "/tools/certificate-fitter" },
      ]
    },
    {
      title: "PDF टूल्स",
      icon: "📄",
      links: [
        { name: "इमेज से A4 सरकारी PDF", href: "/tools/jpg-to-pdf" },
        { name: "PDF कंप्रेसर", href: "/tools/pdf-compressor" },
        { name: "PDF मर्ज व स्प्लिट", href: "/tools/pdf-merge-split" },
        { name: "PDF से JPG कनवर्टर", href: "/tools/pdf-to-jpg" },
        { name: "PDF पासवर्ड प्रोटेक्ट/रिमूवर", href: "/tools/pdf-password" },
      ]
    },
    {
      title: "एग्जाम यूटिलिटीज",
      icon: "⚙️",
      links: [
        { name: "सरकारी परीक्षा आयु कैलकुलेटर", href: "/tools/age-calculator" },
        { name: "ऑल इंडिया एग्जाम प्रीसेट्स", href: "/tools/exam-presets" },
        { name: "सीएससी / जनसेवा केंद्र हब", href: "/tools/csc-corner" },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-12 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">प्रोटोटाइप डेमो</span>
        <h1 className="text-2xl font-black text-slate-800">नया आधुनिक फुटर डिज़ाइन प्रिव्यू</h1>
        <p className="text-sm text-slate-500">यह डेमो पेज मुख्य साइट को छुए बिना अलग से चल रहा है।</p>
      </div>

      <footer className="max-w-6xl mx-auto w-full mt-16 bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>{cat.icon}</span> {cat.title}
              </h4>
              <ul className="space-y-2 text-xs">
                {cat.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link href={link.href} className="text-slate-600 hover:text-blue-600 transition flex items-center justify-between group">
                      <span>{link.name}</span>
                      {link.badge && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.2 rounded font-semibold">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© 2026 ExamSewa. छात्र व साइबर कैफ़े के लिए समर्पित।</p>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <span>🔒</span> 100% प्राइवेट व नो-सर्वर अपलोड
          </div>
        </div>
      </footer>
    </div>
  );
}
