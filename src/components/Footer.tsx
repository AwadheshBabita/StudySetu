import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full mt-16 font-sans">
      {/* 1. मुख्य 4 कॉलम कार्ड सेक्शन (एम्बर / डार्क रिच टोन) */}
      <div className="relative bg-slate-200 border-t border-slate-300 pt-12 pb-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          
          {/* कार्ड 1: ब्रांड लोगो व परिचय */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-5 rounded-2xl border border-emerald-600/35 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-blue-500/20 border border-white/20">
                ES
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-white block leading-tight">
                  Exam<span className="text-blue-500 font-black drop-shadow-xs">Sewa</span>
                </span>
                <span className="text-[11px] text-white font-bold uppercase tracking-wider">
                  Online Tool Suite
                </span>
              </div>
            </div>
            <p className="text-xs text-emerald-100 leading-relaxed">
              छात्रों, सीएससी और साइबर कैफ़े के लिए 100% सुरक्षित और तेज़ ऑनलाइन डॉक्यूमेंट व फोटो टूल्स।
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 border border-amber-400/30 text-emerald-200 hover:text-white font-semibold">
                ⚡ 300 DPI प्रिंट
              </span>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 border border-amber-400/30 text-emerald-200 hover:text-white font-semibold">
                🔒 100% सेफ
              </span>
            </div>
          </div>

          {/* कार्ड 2: फोटो व स्टूडियो टूल्स */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-5 rounded-2xl border border-emerald-600/35 shadow-xl space-y-3">
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-2 border-b border-emerald-500/25 pb-2">
              <span className="w-1.5 h-4 bg-emerald-400 rounded-full shrink-0 shadow-xs"></span>
              फोटो व स्टूडियो टूल्स
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tools/passport-photo-4x6-maker" className="text-emerald-100 hover:text-emerald-300 flex items-center justify-between group transition">
                  <span>4×6 पासपोर्ट शीट मेकर</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">HOT</span>
                </Link>
              </li>
              <li>
                <Link href="/tools/photo-name-date" className="text-emerald-100 hover:text-emerald-300 transition block">
                  पासपोर्ट फोटो (नाम व तारीख)
                </Link>
              </li>
              <li>
                <Link href="/tools/signature-resize" className="text-emerald-100 hover:text-emerald-300 transition block">
                  सिग्नेचर रिसाइज़र व A4 स्कैनर
                </Link>
              </li>
              <li>
                <Link href="/tools/id-card-joiner" className="text-emerald-100 hover:text-emerald-300 transition block">
                  आईडी कार्ड जॉइनर (Front+Back)
                </Link>
              </li>
              <li>
                <Link href="/tools/document-crop" className="text-emerald-100 hover:text-emerald-300 transition block">
                  डॉक्यूमेंट क्रॉपर
                </Link>
              </li>
            </ul>
          </div>

          {/* कार्ड 3: PDF व डॉक्यूमेंट टूल्स */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-5 rounded-2xl border border-emerald-600/35 shadow-xl space-y-3">
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-2 border-b border-emerald-500/25 pb-2">
              <span className="w-1.5 h-4 bg-emerald-400 rounded-full shrink-0 shadow-xs"></span>
              PDF व डॉक्यूमेंट टूल्स
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tools/exact-kb-compressor" className="text-emerald-100 hover:text-emerald-300 flex items-center justify-between group transition">
                  <span>सटीक KB कंप्रेसर</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded font-bold">TOP</span>
                </Link>
              </li>
              <li>
                <Link href="/tools/jpg-to-pdf" className="text-emerald-100 hover:text-emerald-300 transition block">
                  इमेज से A4 सरकारी PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-compressor" className="text-emerald-100 hover:text-emerald-300 transition block">
                  PDF कंप्रेसर
                </Link>
              </li>
              <li>
                <Link href="/tools/pdf-merge-split" className="text-emerald-100 hover:text-emerald-300 transition block">
                  PDF मर्ज व स्प्लिट
                </Link>
              </li>
              <li>
                <Link href="/tools/document-scanner" className="text-emerald-100 hover:text-emerald-300 transition block">
                  स्मार्ट डॉक्यूमेंट स्कैनर
                </Link>
              </li>
              <li>
                <Link href="/tools/certificate-fitter" className="text-emerald-100 hover:text-emerald-300 transition block">
                  सर्टिफिकेट A4 फिटर
                </Link>
              </li>
            </ul>
          </div>

          {/* कार्ड 4: भर्ती स्पेशल व CSC */}
          <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-5 rounded-2xl border border-emerald-600/35 shadow-xl space-y-3">
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide flex items-center gap-2 border-b border-emerald-500/25 pb-2">
              <span className="w-1.5 h-4 bg-emerald-400 rounded-full shrink-0 shadow-xs"></span>
              भर्ती स्पेशल व CSC
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tools/up-police-photo-resizer" className="text-emerald-100 hover:text-emerald-300 transition block">
                  UP Police फोटो व साइन
                </Link>
              </li>
              <li>
                <Link href="/tools/ssc-photo-maker" className="text-emerald-100 hover:text-emerald-300 transition block">
                  SSC लाइव फोटो व साइन
                </Link>
              </li>
              <li>
                <Link href="/tools/rrb-railway-photo-maker" className="text-emerald-100 hover:text-emerald-300 transition block">
                  Railway RRB फोटो मेकर
                </Link>
              </li>
              <li>
                <Link href="/tools/bihar-rtps-document-compressor" className="text-emerald-100 hover:text-emerald-300 transition block">
                  Bihar RTPS डॉक्यूमेंट्स
                </Link>
              </li>
              <li>
                <Link href="/tools/csc-corner" className="text-emerald-100 hover:text-emerald-300 transition block">
                  सीएससी / जनसेवा केंद्र हब
                </Link>
              </li>
              <li>
                <Link href="/tools/age-calculator" className="text-emerald-100 hover:text-emerald-300 transition block">
                  सरकारी परीक्षा आयु कैलकुलेटर
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 2. बॉटम बार (रॉयल ब्लू ग्रेडिएंट + साफ़ सफ़ेद टेक्स्ट) */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-t border-blue-500/30 py-6 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* कानूनी लिंक्स */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 text-xs font-bold text-white">
            <Link href="/about" className="hover:text-emerald-300 transition">About Us</Link>
            <Link href="/contact" className="hover:text-emerald-300 transition">Contact Us</Link>
            <Link href="/privacy-policy" className="hover:text-emerald-300 transition">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-emerald-300 transition">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-emerald-300 transition">Disclaimer</Link>
          </div>

          {/* कॉपीराइट व ईमेल */}
          <div className="border-t border-white/15 pt-3.5 flex flex-col sm:flex-row justify-between items-center text-xs text-blue-100 gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} ExamSewa. सर्वाधिकार सुरक्षित। यह एक स्वतंत्र शैक्षणिक प्लेटफ़ॉर्म है।</p>
            <p className="flex items-center gap-1.5">
              <span className="text-blue-200">सहायता:</span>
              <span className="font-mono font-bold text-emerald-300">examsewa.official@gmail.com</span>
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
