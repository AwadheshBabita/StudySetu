import React from "react";
import Link from "next/link";

export const metadata = {
  title: "अस्वीकरण (Disclaimer) | ExamSewa",
  description: "ExamSewa गैर-सरकारी शैक्षणिक व तकनीकी सहायक पोर्टल है। हमारा आधिकारिक सरकारी संस्थाओं से कोई सीधा संबंध नहीं है।",
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        
        <div className="border-b border-slate-100 pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            महत्वपूर्ण अस्वीकरण • Legal Disclaimer
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            अस्वीकरण (Disclaimer)
          </h1>
          <p className="text-xs text-slate-400 mt-1">अंतिम अद्यतन: सितंबर 2026</p>
        </div>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">1. गैर-सरकारी संस्था प्रकटीकरण (Non-Governmental Entity)</h2>
          <p className="bg-amber-50/70 p-4 rounded-xl border border-amber-200/60 text-amber-950 font-medium">
            <strong>महत्वपूर्ण सूचना:</strong> ExamSewa किसी भी केंद्र सरकार, राज्य सरकार, कर्मचारी चयन आयोग (SSC), लोक सेवा आयोग (UPSC/State PSCs), रेलवे भर्ती बोर्ड (RRB) या किसी अन्य सरकारी भर्ती एजेंसी से संबद्ध, अधिकृत या संचालित नहीं है। यह एक स्वतंत्र, गैर-सरकारी छात्र सहायता पोर्टल है।
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">2. सूचना की सटीकता और फॉर्म गाइडलाइन्स (Accuracy of Information)</h2>
          <p>
            इस पोर्टल पर प्रदर्शित विभिन्न परीक्षाओं के फोटो, हस्ताक्षर और दस्तावेज़ साइज़ से जुड़ी आवश्यकताएं केवल सूचनात्मक सहायता के लिए संकलित की गई हैं। यद्यपि हम जानकारी को अद्यतन रखने का पूरा प्रयास करते हैं, फिर भी उपयोगकर्ताओं को सलाह दी जाती है कि वे फॉर्म भरने से पूर्व संबंधित भर्ती आयोग की आधिकारिक अधिसूचना (Official Notification) का सत्यापन अवश्य करें।
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">3. दस्तावेज़ प्रोसेसिंग की ज़िम्मेदारी (Document Processing Limitation)</h2>
          <p>
            ExamSewa के टूल्स केवल फाइल का आकार, आयाम और रिज़ॉल्यूशन बदलने में सहायता करते हैं। किसी भी प्रतियोगी परीक्षा या आधिकारिक फॉर्म में फोटो/हस्ताक्षर के अस्वीकृत (Reject) होने पर यह प्लेटफ़ॉर्म किसी भी प्रकार से ज़िम्मेदार नहीं होगा। कृपया अपने तैयार किए गए दस्तावेज़ों की स्पष्टता फॉर्म सबमिट करने से पहले स्वयं जाँचें।
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">4. बाहरी लिंक (External Links)</h2>
          <p>
            इस पोर्टल पर उपयोगकर्ताओं की सुविधा के लिए विभिन्न आधिकारिक सरकारी वेबसाइटों या अन्य स्रोतों के हाइपरलिंक्स हो सकते हैं। उन बाहरी वेबसाइटों की सामग्री और उनकी नीतियों पर हमारा कोई नियंत्रण नहीं है।
          </p>
        </section>

      </div>
    </div>
  );
}
