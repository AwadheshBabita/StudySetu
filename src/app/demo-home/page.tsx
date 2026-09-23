'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ToolItem {
  id: string;
  title: string;
  desc: string;
  icon: string;
  href: string;
  category: 'photo' | 'pdf' | 'calc' | 'scanner';
}

const all20Tools: ToolItem[] = [
  // 1 से 6: मुख्य कोर टूल्स
  {
    id: "1",
    title: "फोटो रिसाइज़र व नाम-तारीख (Name & DOP)",
    desc: "फोटो 20KB-50KB बनाएँ और SSC, UP Police के लिए नाम व तारीख (DOP) जोड़ें।",
    icon: "🖼️",
    href: "/tools/photo-name-date",
    category: "photo"
  },
  {
    id: "2",
    title: "सरकारी पोर्टल PDF कंप्रेसर (PDF Compressor)",
    desc: "मार्कशीट व सर्टिफिकेट PDF को बिना धुंधला किए सीधे 100KB, 200KB में कंप्रेस करें।",
    icon: "📄",
    href: "/tools/pdf-compressor",
    category: "pdf"
  },
  {
    id: "3",
    title: "4×6 / 6 पासपोर्ट फोटो शीट प्रिंटर",
    desc: "6, 8, 12 या 30 पासपोर्ट फोटो 1-क्लिक में 4×6 या A4 शीट पर सेट करके प्रिंट निकालें।",
    icon: "🖨️",
    href: "/tools/passport-grid-maker",
    category: "photo"
  },
  {
    id: "4",
    title: "सर्टिफिकेट व डॉक्यूमेंट रिसाइज़र (Doc Fitter)",
    desc: "कागज़ात, जाति, निवास व मार्कशीट को सरकारी फॉर्म मानक अनुसार रीसाइज करें।",
    icon: "📑",
    href: "/tools/certificate-fitter",
    category: "pdf"
  },
  {
    id: "5",
    title: "लाइव कैमरा फोटो कैप्चर (Oval Guide)",
    desc: "Agniveer व SSC के लिए लाइव वेबकैम फोटो। अंडाकार फेस गाइड और व्हाइट बैकग्राउंड।",
    icon: "🤳",
    href: "/tools/live-photo-capture",
    category: "photo"
  },
  {
    id: "6",
    title: "आईडी कार्ड दोनों साइड प्रिंटर (ID Joiner)",
    desc: "आधार, पैन, वोटर या डीएल के दोनों साइड को 1 A4 पेज पर ऊपर-नीचे सेट करके प्रिंट निकालें।",
    icon: "🪪",
    href: "/tools/id-card-joiner",
    category: "photo"
  },

  // 7 से 20: 22 तारीख वाले अपडेटेड टूल्स
  {
    id: "7",
    title: "Photo Resizer (Exam Special)",
    desc: "SSC, UPSC, UP Police हेतु सटीक साइज, सेंटीमीटर एवं DOP/DOB नाम-तारीख स्टैम्प।",
    icon: "📸",
    href: "/tools/photo-resize",
    category: "photo"
  },
  {
    id: "8",
    title: "Signature Resizer",
    desc: "10-20 KB में सटीक आस्पेक्ट अनुपात, ऑटो-व्हाइट पेपर और डीप ब्लैक इंक कंट्रास्ट।",
    icon: "✍️",
    href: "/tools/signature-resize",
    category: "photo"
  },
  {
    id: "9",
    title: "Exact KB Compressor",
    desc: "हाई-क्वालिटी स्मूथिंग के साथ फोटो को ठीक 20KB, 50KB या मनचाहे साइज में फिक्स करें।",
    icon: "⚡",
    href: "/tools/exact-kb-compressor",
    category: "photo"
  },
  {
    id: "10",
    title: "Exact Pixel & Dimension",
    desc: "फोटो की चौड़ाई और ऊँचाई को Pixels, Centimeters (cm), या Millimeters (mm) में बदलें।",
    icon: "📐",
    href: "/tools/exact-pixel-resize",
    category: "photo"
  },
  {
    id: "11",
    title: "Doc Scanner & Enhancer",
    desc: "कैमरे से खींचे मुड़े या धुंधले कागज़/नोट्स को साफ़ सफ़ेद ज़ेरॉक्स स्टाइल में बदलें।",
    icon: "📑",
    href: "/tools/document-scanner",
    category: "scanner"
  },
  {
    id: "12",
    title: "PVC ID Card Cropper",
    desc: "आईडी कार्ड के फ्रंट व बैक को A4 शीट पर असली PVC स्मार्ट कार्ड साइज़ में प्रिंट करें।",
    icon: "💳",
    href: "/tools/id-card-cropper",
    category: "photo"
  },
  {
    id: "13",
    title: "Age Calculator (Exams)",
    desc: "सरकारी कट-ऑफ डेट पर अपनी सटीक उम्र (वर्ष, माह, दिन) 1 सेकंड में निकालें।",
    icon: "🎂",
    href: "/tools/age-calculator",
    category: "calc"
  },
  {
    id: "14",
    title: "Format Converter (JPG, PNG, WebP)",
    desc: "JPG, PNG और आधुनिक WebP फॉर्मेट में तस्वीरों को 1-क्लिक में तुरंत बदलें।",
    icon: "🔄",
    href: "/tools/image-format-converter",
    category: "photo"
  },
  {
    id: "15",
    title: "PDF Compressor (Size Reducer)",
    desc: "बड़ी PDF का साइज 70-80% तक घटाएँ। बिना सर्वर अपलोड किए 100% प्राइवेट व सेफ़।",
    icon: "🗜️",
    href: "/tools/pdf-compress",
    category: "pdf"
  },
  {
    id: "16",
    title: "Image to PDF (A4 Clean)",
    desc: "मल्टीपल तस्वीरों को जोड़ें, क्रम बदलें और तुरंत साफ़ A4 साइज़ PDF तैयार करें।",
    icon: "📄",
    href: "/tools/image-to-pdf",
    category: "pdf"
  },
  {
    id: "17",
    title: "PDF Merge & Split (2-in-1)",
    desc: "कई PDF एक साथ जोड़ें (Merge) या अपनी पसंद के चुनिंदा पेजों को अलग निकालें (Split)।",
    icon: "✂️",
    href: "/tools/pdf-merge-split",
    category: "pdf"
  },
  {
    id: "18",
    title: "PDF Page Rotate & Delete",
    desc: "उल्टे स्कैन हुए पेजों को 90° सीधा घुमाएँ और अनचाहे पेजों को तुरंत डिलीट करें।",
    icon: "🔄",
    href: "/tools/pdf-rotate-delete",
    category: "pdf"
  },
  {
    id: "19",
    title: "PDF Password Remover",
    desc: "पासवर्ड डालकर PDF से लॉक हमेशा के लिए हटाएँ (100% सुरक्षित और इन-डिवाइस)।",
    icon: "🔓",
    href: "/tools/pdf-password",
    category: "pdf"
  },
  {
    id: "20",
    title: "PDF Watermark Adder",
    desc: "PDF के सभी पेजों पर अपना नाम, ब्रांड या सुरक्षा वॉटरमार्क टेक्स्ट जोड़ें।",
    icon: "💧",
    href: "/tools/pdf-watermark",
    category: "pdf"
  }
];

export default function DemoHomePage() {
  const [activeTab, setActiveTab] = useState<'all' | 'photo' | 'pdf' | 'calc' | 'scanner'>('all');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://examsewa.online';
    const text = 'Exam Sewa - सरकारी फॉर्म, फोटो, साइन और PDF टूल्स बिल्कुल फ्री!';
    if (navigator.share) {
      navigator.share({ title: 'Exam Sewa', text, url: shareUrl }).catch(() => {});
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + shareUrl)}`, '_blank');
    }
  };

  const handleCopy = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://examsewa.online';
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTools = activeTab === 'all' 
    ? all20Tools 
    : all20Tools.filter(t => t.category === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      <main className="max-w-6xl mx-auto px-4 pt-4">
        <p className="text-center text-xs sm:text-sm font-semibold text-slate-600 mb-3">
          सरकारी फॉर्म, ऑनलाइन कैफ़े कार्य और छात्र कैलकुलेटर।
        </p>

        {/* 1. शेयर और लिंक कॉपी */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded-full text-xs font-bold shadow-xs transition-colors"
          >
            <span>💬</span> WhatsApp पर शेयर करें
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-full text-xs font-bold shadow-xs transition-colors"
          >
            <span>🔗</span> {copied ? 'कॉपी हो गया!' : 'लिंक कॉपी करें'}
          </button>
        </div>

        {/* 2. फ़िल्टर टैब्स */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'all'
                ? 'bg-[#16a34a] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            सभी टूल्स (All)
          </button>
          <button
            onClick={() => setActiveTab('photo')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'photo'
                ? 'bg-[#16a34a] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>📷</span> फ़ोटो व साइन
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'pdf'
                ? 'bg-[#16a34a] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>📄</span> PDF दस्तावेज़
          </button>
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'calc'
                ? 'bg-[#16a34a] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>🧮</span> छात्र कैलकुलेटर
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'scanner'
                ? 'bg-[#16a34a] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>📱</span> इमेज स्कैनर
          </button>
        </div>

        {/* 3. CSC ऑरेंज बैनर */}
        <div className="mb-4">
          <Link
            href="/csc-corner"
            className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏪</span>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold leading-tight">
                  CSC / साइबर कैफ़े कॉर्नर (सभी 5 टूल्स देखें)
                </h2>
                <p className="text-[11px] text-orange-100 font-medium">
                  जन सेवा केंद्र स्पेशल यूटिलिटीज़
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-white/20 rounded-full border border-white/30 shrink-0">
              हब →
            </span>
          </Link>
        </div>

        {/* 4. ब्लू गाइड बैनर */}
        <div className="mb-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏛️</span>
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/50 text-blue-100 border border-blue-400/40 inline-block mb-1">
                  नया गाइड
                </span>
                <h3 className="text-sm sm:text-base font-extrabold leading-tight">
                  राज्य-स्तरीय परीक्षा गाइड व प्रीसेट्स
                </h3>
                <p className="text-xs text-blue-100">
                  MPSC, WBPSC, TNPSC व रेलवे भर्ती के सटीक फोटो व साइन नियम
                </p>
              </div>
            </div>
            <Link
              href="/tools/rules-guide"
              className="px-4 py-2 bg-white text-blue-700 hover:bg-blue-50 text-xs font-bold rounded-xl text-center shadow-xs transition-colors shrink-0"
            >
              नियम देखें व साइज करें →
            </Link>
          </div>
        </div>

        {/* 5. 20 कार्ड्स: ग्रीन ग्रेडिएंट, व्हाइट टाइटल, ब्लैक विवरण */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {filteredTools.map((t) => (
            <Link
              key={t.id}
              href={t.href}
              style={{
                background: 'linear-gradient(135deg, #15803d 0%, #16a34a 60%, #10b981 100%)',
                boxShadow: '0 4px 12px -2px rgba(22, 163, 74, 0.25)'
              }}
              className="group flex flex-col justify-between p-3.5 sm:p-4 rounded-xl border border-green-500/40 hover:brightness-105 hover:shadow-lg transition-all duration-150 min-h-[135px] text-white"
            >
              <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <span className="text-2xl shrink-0 leading-none drop-shadow-sm">{t.icon}</span>
                  <h3 className="text-base sm:text-[17px] font-extrabold text-white leading-tight line-clamp-1 group-hover:text-green-100 transition-colors">
                    {t.title}
                  </h3>
                </div>
                <p className="text-xs text-slate-950 font-semibold leading-relaxed line-clamp-2 pl-0.5">
                  {t.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-black/15 flex items-center justify-between mt-2">
                <span className="text-xs font-black text-slate-950 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  टूल खोलें →
                </span>
                <span 
                  className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-950/15 text-slate-950 border border-black/20"
                >
                  लाइव टूल
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
