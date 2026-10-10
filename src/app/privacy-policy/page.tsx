import React from "react";
import Link from "next/link";

export const metadata = {
  title: "गोपनीयता नीति (Privacy Policy) | ExamSewa",
  description: "ExamSewa पर उपयोगकर्ता डेटा सुरक्षा, 100% क्लाइंट-साइड फ़ोटो प्रोसेसिंग और कुकी नीतियों की विस्तृत जानकारी।",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        
        <div className="border-b border-slate-100 pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            User Privacy & Data Protection
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3">
            गोपनीयता नीति (Privacy Policy)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">अंतिम अपडेट: 2026</p>
        </div>

        <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
              1. 100% क्लाइंट-साइड सुरक्षा (Zero Server Upload)
            </h2>
            <p>
              ExamSewa (<strong>examsewa.online</strong>) आपकी व्यक्तिगत फ़ोटो, हस्ताक्षर और दस्तावेज़ों की पूर्ण गोपनीयता सुनिश्चित करता है। हमारे सभी टूल्स (फ़ोटो रीसाइज़र, सिग्नेचर क्रॉप, नाम/तारीख जोड़ना आदि) सीधे आपके डिवाइस के वेब ब्राउज़र में प्रोसेस होते हैं। <strong>आपकी फ़ाइलें कभी भी हमारे सर्वर पर अपलोड या सुरक्षित नहीं की जाती हैं।</strong>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
              2. कुकीज़ एवं तृतीय-पक्ष विज्ञापन (Google AdSense)
            </h2>
            <p>
              हम वेबसाइट अनुभव को सुगम बनाने और सर्वर संचालन खर्च के लिए तृतीय-पक्ष विज्ञापन प्रदाताओं (जैसे Google AdSense) का उपयोग कर सकते हैं। Google अपने उपयोगकर्ताओं को उनकी पिछली विज़िट के आधार पर प्रासंगिक विज्ञापन दिखाने के लिए <em>DART कुकीज़</em> का उपयोग कर सकता है। उपयोगकर्ता चाहें तो Google विज्ञापन सेटिंग्स में जाकर इसे प्रबंधित कर सकते हैं।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
              3. एनालिटिक्स एवं सर्वर लॉग
            </h2>
            <p>
              अन्य मानक वेबसाइटों की तरह, प्लेटफ़ॉर्म की सुरक्षा, गति और ट्रैफ़िक लोड को समझने के लिए बेसिक गैर-व्यक्तिगत जानकारी (जैसे ब्राउज़र प्रकार, विज़िट किया गया समय, स्क्रीन साइज़) रिकॉर्ड की जा सकती है। इसमें कोई भी व्यक्तिगत या संवेदनशील पहचान शामिल नहीं होती।
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-emerald-600 rounded-full"></span>
              4. संपर्क व सहायता
            </h2>
            <p>
              यदि आपको इस गोपनीयता नीति के संबंध में कोई संदेह या प्रश्न है, तो आप हमें सीधे आधिकारिक ईमेल पर संपर्क कर सकते हैं:
            </p>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 inline-block font-mono text-xs sm:text-sm font-semibold text-emerald-800">
              examsewa.official@gmail.com
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
