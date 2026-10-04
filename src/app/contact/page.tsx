'use client';

import React, { useState } from 'react';

export default function ContactPage() {
  const [copied, setCopied] = useState(false);

  const contactEmail = "examsewa.official@gmail.com"; // अपनी आधिकारिक ईमेल यहाँ रख सकते हैं
  const whatsappNumber = "919876543210"; // यहाँ अपना WhatsApp नंबर बदल सकते हैं

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappFeedbackMsg = encodeURIComponent(
    "नमस्ते Exam Sewa टीम,\n\nमुझे वेबसाइट के संबंध में एक सुझाव/नया टूल जुड़वाने का अनुरोध करना है:\n"
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
        
        <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full mb-3">
          छात्र सहायता व संपर्क
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          सुझाव, फीडबैक या संपर्क करें
        </h1>
        <p className="text-sm text-slate-600 mb-8 max-w-md mx-auto">
          Exam Sewa को छात्रों के लिए और बेहतर बनाने में मदद करें। कोई कमी दिखे या किसी नए टूल की ज़रूरत हो, तो हमें सीधे बताएं।
        </p>

        <div className="space-y-4 text-left">
          
          {/* WhatsApp सीधा संपर्क */}
          <a
            href={`https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${whatsappFeedbackMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition group"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">WhatsApp पर सीधे सुझाव भेजें</h3>
                <p className="text-xs text-emerald-700">तेज़ प्रतिक्रिया के लिए मैसेज करें</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition">
              मैसेज करें →
            </span>
          </a>

          {/* ईमेल संपर्क */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✉️</span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">ईमेल द्वारा संपर्क करें</h3>
                <p className="text-xs font-mono text-slate-600">{contactEmail}</p>
              </div>
            </div>
            <button
              onClick={handleCopyEmail}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition"
            >
              {copied ? '✅ कॉपी हुआ' : '📋 कॉपी करें'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
