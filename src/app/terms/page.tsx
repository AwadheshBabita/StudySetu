import React from "react";
import Link from "next/link";

export const metadata = {
  title: "नियम एवं शर्तें (Terms of Service) | ExamSewa",
  description: "ExamSewa पोर्टल और टूल्स के उपयोग से जुड़े नियम, शर्तें और उपयोगकर्ता दिशानिर्देश।",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        
        <div className="border-b border-slate-100 pb-5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            कानूनी दिशानिर्देश • Legal Terms
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            नियम एवं शर्तें (Terms of Service)
          </h1>
          <p className="text-xs text-slate-400 mt-1">अंतिम अद्यतन: सितंबर 2026</p>
        </div>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">1. सेवा की स्वीकृति (Acceptance of Terms)</h2>
          <p>
            ExamSewa पोर्टल पर उपलब्ध किसी भी टूल, कैलकुलेटर या दस्तावेज़ प्रोसेसिंग सेवा का उपयोग करके आप इन नियमों और शर्तों का पूर्णतः पालन करने के लिए बाध्य हैं। यदि आप इन शर्तों से सहमत नहीं हैं, तो कृपया पोर्टल की सेवाओं का उपयोग न करें।
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">2. टूल्स का उद्देश्य और उपयोग (Use of Tools)</h2>
          <p>
            हमारे सभी टूल्स (जैसे PDF कंप्रेसर, फ़ोटो रिसाइज़र, सिग्नेचर क्रॉपर और डॉक्यूमेंट स्कैनर) केवल छात्रों, अभिभावकों और साइबर कैफ़े संचालकों की सहायता हेतु ऑनलाइन फॉर्म भरने की प्रक्रिया को सरल बनाने के लिए प्रदान किए गए हैं। इनका उपयोग किसी भी अनधिकृत, अवैध या किसी अन्य व्यक्ति के दस्तावेज़ों के दुरुपयोग के लिए नहीं किया जा सकता।
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">3. क्लाइंट-साइड सुरक्षा और डेटा गोपनीयता (Client-side Security)</h2>
          <p>
            हमारे टूल्स आपके डिवाइस के ब्राउज़र के अंदर ही (क्लाइंट-साइड) काम करते हैं। हम उपयोगकर्ताओं की निजी तस्वीरें, हस्ताक्षर या अंकपत्र किसी सर्वर पर अपलोड या संग्रहीत नहीं करते हैं। प्रोसेसिंग पूरी होने के बाद दस्तावेज़ को सुरक्षित रखने की ज़िम्मेदारी पूरी तरह उपयोगकर्ता की होती है।
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">4. बौद्धिक संपदा अधिकार (Intellectual Property)</h2>
          <p>
            ExamSewa का डिज़ाइन, लोगो, इंटरफ़ेस और एल्गोरिदम हमारी बौद्धिक संपदा हैं। किसी भी अन्य वेबसाइट या व्यावसायिक सेवा द्वारा इस प्लेटफ़ॉर्म के कोड या इंटरफ़ेस की अनधिकृत नकल करना प्रतिबंधित है।
          </p>
        </section>

        <section className="space-y-3 text-sm text-slate-600 leading-relaxed">
          <h2 className="text-base font-bold text-slate-900">5. शर्तों में परिवर्तन (Modifications)</h2>
          <p>
            हम बिना किसी पूर्व सूचना के इन नियमों और नीतियों को समय-समय पर अपडेट करने का अधिकार सुरक्षित रखते हैं। किसी भी प्रश्न या शिकायत के लिए आप हमारे <Link href="/contact" className="text-blue-600 underline font-medium">संपर्क पृष्ठ</Link> के माध्यम से संपर्क कर सकते हैं।
          </p>
        </section>

      </div>
    </div>
  );
}
