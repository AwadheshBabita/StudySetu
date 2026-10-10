'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const contactEmail = "examsewa.official@gmail.com";
  const studioEmail = "gayatristudio840@gmail.com";
  const whatsappNumber = "919451118011";

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* हेडर */}
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 rounded-full border border-emerald-200">
            24/7 Support & Helpdesk
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            संपर्क करें <span className="text-blue-600">(Contact Us)</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto">
            किसी भी टूल संबंधी समस्या, सुझाव, सीएससी पार्टनरशिप या नए सरकारी प्रीसेट की मांग के लिए सीधे संपर्क करें।
          </p>
        </div>

        {/* मुख्य संपर्क कार्ड्स ग्रिड */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* WhatsApp व कॉलिंग सपोर्ट */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                💬
              </div>
              <h2 className="text-xl font-bold text-slate-900">WhatsApp व सहायता</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                साइबर कैफ़े, सीएससी संचालकों और छात्रों के लिए त्वरित संदेश सहायता।
              </p>
              <div className="font-mono text-base font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 inline-block">
                +91 9451118011
              </div>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=नमस्ते%20ExamSewa,%20मुझे%20टूल%20के%20संबंध%20में%20जानकारी%20चाहिए।`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-xs"
            >
              <span>WhatsApp पर चैट करें</span>
              <span>→</span>
            </a>
          </div>

          {/* आधिकारिक ईमेल सपोर्ट */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center text-2xl font-bold">
                ✉️
              </div>
              <h2 className="text-xl font-bold text-slate-900">ईमेल सपोर्ट</h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                तकनीकी समस्या, बग रिपोर्ट या आधिकारिक पूछताछ के लिए हमें मेल करें।
              </p>
              <div className="space-y-1.5">
                <div className="font-mono text-xs sm:text-sm font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {contactEmail}
                </div>
                <div className="font-mono text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-150">
                  वैकल्पिक: {studioEmail}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleCopyEmail(contactEmail)}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              <span>{copied ? "ईमेल कॉपी हो गया! ✓" : "ईमेल एड्रेस कॉपी करें"}</span>
            </button>
          </div>

        </div>

        {/* स्टूडियो व संचालन केंद्र कार्ड */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-xl">
              📍
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">संचालन केंद्र व डेवलपर कार्यालय</h3>
              <p className="text-xs text-slate-500">गायत्री स्टूडियो (ExamSewa बेस)</p>
            </div>
          </div>
          
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong>गायत्री स्टूडियो</strong> — फोटो एडिटिंग, डिजिटल सर्विसेज एवं वेब सॉल्यूशंस।<br />
            जनपद: <strong>मऊ (उत्तर प्रदेश), भारत</strong>
          </p>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex flex-wrap gap-4">
            <span>⏱️ उत्तर देने की समय सीमा: 24-48 घंटे</span>
            <span>🔒 सुरक्षित व स्पैम-मुक्त सहायता</span>
          </div>
        </div>

      </div>
    </div>
  );
}
