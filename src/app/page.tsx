"use client";

import { useState } from "react";
import Link from "next/link";

interface Tool {
  name: string;
  desc: string;
  href: string;
  icon: string;
  badge: string;
  category: "photo" | "pdf" | "utility";
  accent: string;
  bgLight: string;
  borderHover: string;
}

const tools: Tool[] = [
  {
    name: "Photo Resizer (Exam)",
    desc: "SSC, UPSC, UP Police हेतु सटीक साइज, सेंटीमीटर एवं DOP/DOB नाम-तारीख स्टैम्प",
    href: "/tools/photo-resize",
    icon: "📸",
    badge: "Top Exam",
    category: "photo",
    accent: "text-blue-600 bg-blue-50 border-blue-200",
    bgLight: "hover:bg-blue-50/40",
    borderHover: "hover:border-blue-500",
  },
  {
    name: "Signature Resizer",
    desc: "10-20 KB में सटीक आस्पेक्ट अनुपात, ऑटो-व्हाइट पेपर और डीप ब्लैक इंक कंट्रास्ट",
    href: "/tools/signature-resize",
    icon: "✍️",
    badge: "Auto Ink",
    category: "photo",
    accent: "text-indigo-600 bg-indigo-50 border-indigo-200",
    bgLight: "hover:bg-indigo-50/40",
    borderHover: "hover:border-indigo-500",
  },
  {
    name: "Exact KB Compressor",
    desc: "हाई-क्वालिटी स्मूथिंग के साथ फोटो को ठीक 20KB, 50KB या मनचाहे साइज में फिक्स करें",
    href: "/tools/exact-kb-compressor",
    icon: "⚡",
    badge: "Smart HD",
    category: "photo",
    accent: "text-emerald-600 bg-emerald-50 border-emerald-200",
    bgLight: "hover:bg-emerald-50/40",
    borderHover: "hover:border-emerald-500",
  },
  {
    name: "Exact Pixel & Dimension",
    desc: "फोटो की चौड़ाई और ऊँचाई को Pixels, Centimeters (cm), या Millimeters (mm) में बदलें",
    href: "/tools/exact-pixel-resize",
    icon: "📐",
    badge: "DPI Tool",
    category: "photo",
    accent: "text-amber-600 bg-amber-50 border-amber-200",
    bgLight: "hover:bg-amber-50/40",
    borderHover: "hover:border-amber-500",
  },
  {
    name: "PDF Compressor",
    desc: "बड़ी PDF का साइज 70-80% तक घटाएँ। बिना सर्वर अपलोड किए 100% प्राइवेट व सेफ़",
    href: "/tools/pdf-compress",
    icon: "🗜️",
    badge: "Private",
    category: "pdf",
    accent: "text-rose-600 bg-rose-50 border-rose-200",
    bgLight: "hover:bg-rose-50/40",
    borderHover: "hover:border-rose-500",
  },
  {
    name: "Image to PDF",
    desc: "मल्टीपल तस्वीरों को जोड़ें, क्रम बदलें और तुरंत साफ़ A4 साइज़ PDF फाइल तैयार करें",
    href: "/tools/image-to-pdf",
    icon: "📑",
    badge: "A4 Clean",
    category: "pdf",
    accent: "text-violet-600 bg-violet-50 border-violet-200",
    bgLight: "hover:bg-violet-50/40",
    borderHover: "hover:border-violet-500",
  },
  {
    name: "PDF Merge & Split",
    desc: "कई PDF एक साथ जोड़ें (Merge) या अपनी पसंद के चुनिंदा पेजों को अलग निकालें (Split)",
    href: "/tools/pdf-merge-split",
    icon: "✂️",
    badge: "2-in-1",
    category: "pdf",
    accent: "text-cyan-600 bg-cyan-50 border-cyan-200",
    bgLight: "hover:bg-cyan-50/40",
    borderHover: "hover:border-cyan-500",
  },
  {
    name: "Format Converter",
    desc: "JPG, PNG और आधुनिक WebP फॉर्मेट में तस्वीरों को 1-क्लिक में तुरंत बदलें",
    href: "/tools/image-format-converter",
    icon: "🔄",
    badge: "Lossless",
    category: "utility",
    accent: "text-orange-600 bg-orange-50 border-orange-200",
    bgLight: "hover:bg-orange-50/40",
    borderHover: "hover:border-orange-500",
  },
];

export default function Home() {
  const [filter, setFilter] = useState<"all" | "photo" | "pdf">("all");

  const filteredTools = filter === "all" ? tools : tools.filter((t) => t.category === filter);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-slate-50 text-slate-800">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">Study<span className="text-blue-600">Setu</span></span>
              <span className="text-[10px] font-semibold text-slate-400 block -mt-1 tracking-wider uppercase">Tools Platform</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
              100% Free & In-Browser
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="py-12 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-4 shadow-sm">
          <span>🚀 सरकारी फॉर्म्स एवं ऑनलाइन दस्तावेजों के लिए स्मार्ट टूल्स</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          फास्ट, अनलिमिटेड और <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">प्राइवेट टूल्स</span>
        </h1>
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          न कोई फाइल सर्वर पर जाती है, न कोई कोटा लिमिट। सब कुछ आपके डिवाइस पर सीधे प्रोसेस होता है—सुपरफास्ट और 100% सुरक्षित।
        </p>

        {/* Filter Pills */}
        <div className="mt-8 flex items-center justify-center space-x-2 sm:space-x-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              filter === "all"
                ? "bg-blue-600 text-white shadow-blue-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            सभी टूल्स ({tools.length})
          </button>
          <button
            onClick={() => setFilter("photo")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              filter === "photo"
                ? "bg-blue-600 text-white shadow-blue-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            📸 फ़ोटो और हस्ताक्षर
          </button>
          <button
            onClick={() => setFilter("pdf")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
              filter === "pdf"
                ? "bg-blue-600 text-white shadow-blue-500/20"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            📑 PDF टूल्स
          </button>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-xl ${tool.borderHover} ${tool.bgLight} flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                    {tool.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${tool.accent}`}>
                    {tool.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                <span>टूल इस्तेमाल करें</span>
                <span className="w-6 h-6 rounded-full bg-slate-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Feature Highlights Banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-bold text-base">शून्य इंतज़ार (Zero Latency)</h4>
              <p className="text-xs text-blue-100 mt-1">सर्वर पर फाइल अपलोड होने का झंझट नहीं, क्लिक करते ही तुरंत परिणाम।</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-bold text-base">100% प्राइवेसी सुरक्षा</h4>
              <p className="text-xs text-blue-100 mt-1">आपकी पर्सनल फोटो और आधार/डॉक्यूमेंट फोन से बाहर कहीं नहीं जाते।</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-bold text-base">सटीक सरकारी प्रीसेट्स</h4>
              <p className="text-xs text-blue-100 mt-1">SSC, UPSC, UP Police के नियमों अनुसार 1-क्लिक में रिसाइजिंग।</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">StudySetu — High Speed Browser Utilities</p>
        <p className="mt-1 text-slate-400">© 2026 StudySetu. All processing executed locally on device.</p>
      </footer>
    </main>
  );
}
