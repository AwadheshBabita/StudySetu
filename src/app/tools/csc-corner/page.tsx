'use client';

import React from 'react';
import Link from 'next/link';
import FaqSection from '@/components/FaqSection';

interface CscTool {
  id: string;
  title: string;
  desc: string;
  badge: string;
  badgeColor: string;
  icon: string;
  href: string;
  isLive: boolean;
}

// भविष्य में कोई भी नया टूल जोड़ने के लिए बस इस लिस्ट में एंट्री जोड़नी होगी
const cscToolsList: CscTool[] = [
  {
    id: 'photo-name-date',
    title: 'फोटो पर नाम और तारीख (DOP Maker)',
    desc: 'SSC, UPSC व पुलिस फॉर्म हेतु नाम व तारीख स्टैम्प करें। 20KB-50KB फॉर्म रेडी या 300 DPI 4x6 शीट प्रिंट करें।',
    badge: 'HD Print + 20-50KB',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: '📸',
    href: '/tools/photo-name-date',
    isLive: true,
  },
  {
    id: 'pdf-compressor',
    title: 'सरकारी पोर्टल PDF कंप्रेसर',
    desc: 'मार्कशीट और सर्टिफिकेट PDF को बिना टेक्स्ट धुंधला किए सीधे 100KB, 200KB या 300KB की तय लिमिट में कंप्रेस करें।',
    badge: '100KB - 200KB Lock',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    icon: '🗜️',
    href: '/tools/pdf-compressor',
    isLive: true,
  },
  {
    id: 'passport-grid-maker',
    title: 'पासपोर्ट फोटो 4x6 / A4 शीट मेकर',
    desc: '1 फोटो से तुरंत 6 या 8 फोटो की 4x6 शीट और 30 फोटो की A4 प्रिंटेबल शीट कटिंग गाइड बॉर्डर के साथ 300 DPI में तैयार करें।',
    badge: '300 DPI Studio Sheet',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: '🖨️',
    href: '/tools/passport-grid-maker',
    isLive: true,
  },
  {
    id: 'certificate-fitter',
    title: 'सर्टिफिकेट व डॉक्युमेंट कनवर्टर',
    desc: 'आय, जाति, निवास व ई-श्रम कार्ड को स्टेट पोर्टल (UP Scholarship, RTPS) के 50KB-100KB मानक में बिना सील धुंधले किए सेट करें।',
    badge: '50KB - 100KB Lock',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: '📑',
    href: '/tools/certificate-fitter',
    isLive: true,
  },
  {
    id: 'live-photo-capture',
    title: 'लाइव कैमरा फोटो कैप्चर (Oval Guide)',
    desc: 'Agniveer व SSC के लिए लाइव वेबकैम फोटो। अंडाकार फेस गाइड, 3s टाइमर और वाइट बैकग्राउंड से फॉर्म रिजेक्ट नहीं होगा।',
    badge: 'Oval Guide + 20-50KB',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '🤳',
    href: '/tools/live-photo-capture',
    isLive: true,
  },
];

export default function CscCornerHubPage() {
  const cscHubFaqs = [
    {
      q: "CSC / साइबर कैफ़े कॉर्नर क्या है?",
      a: "यह जन सेवा केंद्र (VLEs), साइबर कैफ़े ऑपरेटरों और ऑनलाइन फॉर्म भरने वाले छात्रों के लिए 100% फ्री, फास्ट और क्लाइंट-साइड यूटिलिटी हब है, जहाँ सरकारी भर्ती और प्रमाणपत्र मानकों के अनुसार फाइलें तैयार होती हैं।"
    },
    {
      q: "क्या यहाँ बने दस्तावेजों पर कोई वॉटरमार्क आता है?",
      a: "नहीं, ExamSewa का कोई भी टूल किसी भी फोटो, पीडीएफ या प्रिंट शीट पर वॉटरमार्क नहीं लगाता। सभी आउटपुट 100% ओरिजिनल व ऑफिशियल रहते हैं।"
    },
    {
      q: "क्या प्रिंटर से डायरेक्ट प्रिंट निकालने की सुविधा है?",
      a: "हाँ, फोटो शीट्स और प्रमाणपत्रों में 300 DPI अल्ट्रा-HD रेजोल्यूशन दिया गया है, जिसे Epson, Canon या HP फोटो प्रिंटर से सीधे ग्लॉसी पेपर पर प्रिंट किया जा सकता है।"
    },
    {
      q: "भविष्य में आने वाले नए टूल्स कहाँ दिखेंगे?",
      a: "CSC और साइबर कैफ़े के लिए जितने भी नए एडवांस टूल्स बनेंगे, वे सभी अपने आप इसी CSC कॉर्नर हब में जुड़ते जाएँगे।"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* हेडर बैनर */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black mb-3">
            <span>🏪</span>
            <span>जन सेवा केंद्र व साइबर कैफ़े हब</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black mb-2 tracking-tight">
            CSC / साइबर कैफ़े कॉर्नर
          </h1>
          <p className="text-sm sm:text-base text-amber-50 max-w-2xl leading-relaxed">
            ऑनलाइन फॉर्म, प्रमाणपत्र और फोटो स्टूडियो प्रिंटिंग के लिए 100% फ्री और बिना किसी लिमिट के पेशेवर टूल्स।
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 text-9xl opacity-15 pointer-events-none select-none">
          🏪
        </div>
      </div>

      {/* टूल्स की ग्रिड - ऑटो रेंडरिंग */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {cscToolsList.map((tool) => (
          <Link
            key={tool.id}
            href={tool.href}
            className="group p-5 bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-2xl mb-3 border border-amber-100 group-hover:scale-105 transition-transform">
                {tool.icon}
              </div>
              <div className="flex items-center justify-between mb-1.5">
                <h2 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition">
                  {tool.title}
                </h2>
                {tool.isLive && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                    लाइव
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {tool.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-amber-700 group-hover:translate-x-1 transition-transform">
                टूल खोलें →
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md border ${tool.badgeColor}`}>
                {tool.badge}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* FAQ सेक्शन */}
      <FaqSection 
        title="CSC / साइबर कैफ़े कॉर्नर - अक्सर पूछे जाने वाले सवाल"
        items={cscHubFaqs}
        pageUrl="https://examsewa.online/tools/csc-corner"
      />
    </div>
  );
}
