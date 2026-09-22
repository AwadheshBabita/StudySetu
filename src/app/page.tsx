"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Tool {
  name: string;
  desc: string;
  href: string;
  icon: string;
  badge?: string;
  category: "photo" | "pdf" | "id" | "utility";
}

const tools: Tool[] = [
  { name: "Photo Resizer (Exam)", desc: "SSC, UPSC, UP Police हेतु सटीक साइज, सेंटीमीटर एवं DOP/DOB नाम-तारीख स्टैम्प", href: "/tools/photo-resize", icon: "📸", badge: "Top Exam", category: "photo" },
  { name: "Signature Resizer", desc: "हस्ताक्षर को 10-20 KB, 20-50 KB में रीसाइज करें एवं बैकग्राउंड सफेद व साफ करें", href: "/tools/signature-resize", icon: "✍️", badge: "Essential", category: "photo" },
  { name: "PDF Compressor", desc: "सरकारी फॉर्म हेतु PDF को 100KB, 200KB या मनचाहे साइज में तुरंत कंप्रेस करें", href: "/tools/pdf-compressor", icon: "🗜️", badge: "Most Used", category: "pdf" },
  { name: "JPG to PDF Maker", desc: "कई JPG, PNG फोटो को मिलाकर 1-क्लिक में सिंगल PDF डॉक्यूमेंट तैयार करें", href: "/tools/jpg-to-pdf", icon: "📄", category: "pdf" },
  { name: "Smart HD Scanner", desc: "मोबाइल कैमरे से खींचे कागज़ात को बिना वॉटरमार्क A4 साइज HD डॉक्यूमेंट बनाएं", href: "/tools/document-scanner", icon: "📱", badge: "Smart HD", category: "id" },
  { name: "Cyber Cafe Multi-Card Print", desc: "1 क्लिक में 5 आधार, पैन या वोटर कार्ड A4 शीट पर सीधे प्रिंट हेतु सेट करें", href: "/tools/id-card-print", icon: "🖨️", badge: "Cyber Cafe", category: "id" },
  { name: "Aadhaar / ID Card Cropper", desc: "PDF या फोटो से फ्रंट और बैक ID कार्ड को सटीक स्टैंडर्ड अनुपात में क्रॉप करें", href: "/tools/id-cropper", icon: "🪪", category: "id" },
  { name: "Photo with Name & Date (DOP)", desc: "पासपोर्ट साइज फोटो पर अपना नाम और परीक्षा की तारीख (DOP/DOB) स्टैम्प करें", href: "/tools/dop-stamp", icon: "🏷️", category: "photo" },
  { name: "PDF to JPG Converter", desc: "PDF के सभी पेजों को हाई-क्वालिटी JPG या PNG तस्वीरों में तुरंत बदलें", href: "/tools/pdf-to-jpg", icon: "🖼️", category: "pdf" },
  { name: "Merge PDF Documents", desc: "दो या दो से अधिक अलग-अलग PDF फाइलों को एक क्रमबद्ध PDF में जोड़ें", href: "/tools/merge-pdf", icon: "📑", category: "pdf" },
  { name: "Split / Extract PDF Pages", desc: "बड़ी PDF फाइल में से केवल जरूरी पेज अलग करें या अलग-अलग टुकड़ों में बांटें", href: "/tools/split-pdf", icon: "✂️", category: "pdf" },
  { name: "Passport Photo 6/8/12 Sheet", desc: "1 फोटो से A4 या 4x6 पेपर पर 6, 8, 12, 16 पासपोर्ट फोटो प्रिंटेबल ग्रिड बनाएं", href: "/tools/passport-grid", icon: "👥", category: "photo" },
  { name: "Image Format Converter", desc: "WEBP, HEIC, PNG को बिना क्वालिटी खोए तुरंत स्टैंडर्ड JPG/JPEG में बदलें", href: "/tools/format-converter", icon: "🔄", category: "photo" },
  { name: "Bulk Image Compressor", desc: "एक साथ 50 फोटो को मनचाहे KB में बिना किसी क्वालिटी नुकसान के कंप्रेस करें", href: "/tools/bulk-compress", icon: "⚡", category: "photo" },
  { name: "Age Calculator for Exams", desc: "नोटिफिकेशन की कट-ऑफ तारीख के अनुसार अपनी सटीक आयु (वर्ष, माह, दिन) निकालें", href: "/tools/age-calculator", icon: "🎂", category: "utility" },
  { name: "Live Typing Speed Tester", desc: "SSC, Railway, High Court स्टेनो व टाइपिंग परीक्षा हेतु हिंदी व इंग्लिश टेस्ट", href: "/tools/typing-test", icon: "⌨️", category: "utility" },
  { name: "Document Whitener & Clean", desc: "छाया (Shadow), पीलापन और क्रीज हटाकर पुराने डॉक्यूमेंट्स को एकदम नया बनाएं", href: "/tools/clean-doc", icon: "✨", category: "id" },
  { name: "Resume / CV Maker", desc: "सरकारी व प्राइवेट जॉब्स के लिए 5 मिनट में प्रोफेशनल हिंदी/इंग्लिश बायोडाटा बनाएं", href: "/tools/resume-builder", icon: "📋", category: "utility" },
  { name: "Thumb Impression Enhancer", desc: "अंगूठे के निशान (Thumb Impression) की स्याही साफ करें और कंट्रास्ट बढ़ाएं", href: "/tools/thumb-enhance", icon: "👍", category: "photo" },
  { name: "QR & Barcode Generator", desc: "एडमिट कार्ड व फॉर्म सत्यापन हेतु तुरंत कस्टम QR कोड या बारकोड तैयार करें", href: "/tools/qr-generator", icon: "🏁", category: "utility" },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredTools = activeCategory === "all" 
    ? tools 
    : tools.filter(t => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-100/70 pb-20">
      <section className="bg-white border-b border-slate-200 py-8 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-3">
          <span>🇮🇳</span> 100% सुरक्षित एवं ब्राउज़र-आधारित साइबर कैफ़े व एग्ज़ाम टूल्स
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          सरकारी परीक्षाओं और कैफ़े हेतु <span className="text-green-600">Exam</span> <span className="text-blue-600">Sewa</span> टूल्स
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
          SSC, UPSC, UP Police, रेलवे व सभी राज्य परीक्षाओं के फॉर्म हेतु फोटो, साइन और PDF को सटीक नियमों में 1-क्लिक में तैयार करें।
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2.5 justify-center items-center mb-8">
          {[
            { id: "all", label: `सभी टूल्स (${tools.length})`, icon: "⚡" },
            { id: "photo", label: "फोटो एवं हस्ताक्षर", icon: "📸" },
            { id: "pdf", label: "PDF टूल्स", icon: "📄" },
            { id: "id", label: "ID व साइबर कैफ़े", icon: "🪪" },
            { id: "utility", label: "उपयोगी टूल्स", icon: "🛠️" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 ${
                activeCategory === tab.id
                  ? "bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-sm"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 20 Cards: Deep Green + Black Border + Pure White Subtext */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredTools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-green-800 via-emerald-900 to-green-950 border-2 border-black shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-3xl p-2.5 bg-black/40 rounded-xl shadow-inner border border-white/20">
                    {tool.icon}
                  </span>
                  {tool.badge && (
                    <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-600 text-white border border-blue-400 shadow-sm">
                      {tool.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  {tool.name}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-white font-normal leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs font-semibold text-emerald-200 group-hover:text-white">
                <span>टूल खोलें</span>
                <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
