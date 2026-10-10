import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* हेडर सेक्शन */}
        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 rounded-full">
            Our Story & Mission
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            हमारे बारे में <span className="text-blue-600">(About ExamSewa)</span>
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
            छात्रों, सीएससी और साइबर कैफ़े संचालकों के लिए 100% सुरक्षित, सटीक और तेज़ ऑनलाइन टूल सुइट।
          </p>
        </div>

        {/* मुख्य परिचय कार्ड */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-5 bg-blue-600 rounded-full"></span>
            हमारा विज़न और उद्देश्य
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            सरकारी नौकरियों (जैसे <strong>SSC, UP Police, Railway, UPSC, State PSCs</strong>) के ऑनलाइन फॉर्म भरते समय सबसे बड़ी परेशानी सही अनुपात, रिज़ॉल्यूशन (DPI) और सटीक फाइल साइज (KB) में फोटो, हस्ताक्षर और दस्तावेज़ तैयार करने की होती है। 
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            <strong>ExamSewa (एग्जाम सेवा)</strong> का मुख्य उद्देश्य इन सभी जटिल प्रक्रियाओं को मात्र एक क्लिक में, पूरी तरह नि:शुल्क और बिना किसी व्यक्तिगत डेटा को सर्वर पर अपलोड किए सुरक्षित बनाना है।
          </p>
        </div>

        {/* फाउंडर और यात्रा (Founder Profile & Story) कार्ड */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-750 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/10 pb-6">
            {/* प्रोफ़ाइल फ़ोटो */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-lg shrink-0 bg-slate-800">
              <img
                src="/founder.jpg"
                alt="Awadhesh Chauhan - Founder ExamSewa"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="space-y-1 text-center sm:text-left flex-1">
              <span className="text-amber-400 text-xs font-bold tracking-wider uppercase">Founder & Developer</span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">अवधेश चौहान (Awadhesh Chauhan)</h3>
              <p className="text-slate-300 text-xs sm:text-sm font-medium">फ़ोटो एडिटर, ग्राफ़िक डिज़ाइनर एवं वेब डेवलपर</p>
              <p className="text-amber-200/90 text-xs pt-1">📍 गायत्री स्टूडियो — मऊ (उत्तर प्रदेश)</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            <p>
              इस प्लेटफ़ॉर्म की नींव <strong>गायत्री स्टूडियो (मऊ)</strong> के ज़मीनी अनुभवों से पड़ी। एक व्यावसायिक फ़ोटो एडिटर और ग्राफ़िक डिज़ाइनर के रूप में काम करते हुए, हमने हज़ारों छात्रों और साइबर कैफ़े संचालकों को सरकारी फ़ॉर्म रिजेक्शन और फ़ोटो/साइन की सही KB सेटिंग के लिए परेशान होते देखा।
            </p>
            <p>
              उसी ज़मीनी अनुभव और वेब डेवलपमेंट तकनीक को मिलाकर हमने <strong>ExamSewa</strong> को तैयार किया—ताकि जो काम स्टूडियो में भारी सॉफ्टवेयर से होता था, वह हर छात्र और सीएससी संचालक अपने मोबाइल या कंप्यूटर पर सेकंडों में मुफ़्त कर सके।
            </p>
          </div>

          {/* डिजिटल सिग्नेचर व क्रेडेंशियल्स */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-300 w-full sm:w-auto">
              <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">📸 10+ वर्ष एडिटिंग अनुभव</span>
              <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">🔒 100% क्लाइंट-साइड सुरक्षा</span>
            </div>

            {/* डिजिटल सिग्नेचर */}
            <div className="text-center sm:text-right shrink-0">
              <div className="bg-white/90 p-1.5 rounded-lg inline-block border border-white/20">
                <img
                  src="/signature.png"
                  alt="Awadhesh Chauhan Signature"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-1">हस्ताक्षरित / Founder, ExamSewa</p>
            </div>
          </div>

        </div>

        {/* संपर्क व सपोर्ट कार्ड */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <h3 className="text-lg font-bold text-slate-900">कोई सवाल या सुझाव है?</h3>
            <p className="text-xs sm:text-sm text-slate-600">स्थान: मऊ (उत्तर प्रदेश) | ईमेल: examsewa.official@gmail.com</p>
          </div>
          <Link
            href="/contact"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm transition"
          >
            संपर्क करें (Contact Us)
          </Link>
        </div>

      </div>
    </div>
  );
}
