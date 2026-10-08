import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UP Police Photo & Signature Resizer (20KB - 50KB) - Constable, SI | Exam Sewa",
  description: "UP Police कांस्टेबल, SI व लिपिक भर्ती हेतु फोटो (20KB-50KB) एवं हस्ताक्षर (10KB-20KB) ऑनलाइन रिसाइज करें। 3.5x4.5 सेमी अनुपात और 100% सरकारी फॉर्म रेडी आउटपुट।",
  keywords: [
    "UP Police photo resizer 20KB to 50KB",
    "UP Police constable photo signature maker online",
    "UP Police signature size 10kb to 20kb converter",
    "UPPRPB photo upload size and dimension online free",
    "UP Police exam photo with name and date generator",
    "photo resizer for up police form 2026"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/up-police-photo-resizer",
  },
  openGraph: {
    title: "UP Police Photo & Signature Resizer (20KB - 50KB) | Exam Sewa",
    description: "आधिकारिक UPPRPB गाइडलाइन अनुसार फोटो व हस्ताक्षर रिसाइज करें। 100% सुरक्षित क्लाइंट-साइड टूल।",
    url: "https://examsewa.online/tools/up-police-photo-resizer",
    siteName: "Exam Sewa",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}

      {/* SEO Guide Article Container (आईडी कार्ड जॉइनर जैसा फुल कंटेंट) */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            UP Police Photo & Signature Resizer: कांस्टेबल व SI भर्ती के लिए फोटो कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            उत्तर प्रदेश पुलिस भर्ती एवं प्रोन्नति बोर्ड (UPPRPB) के नियमानुसार फोटो 20KB से 50KB तथा हस्ताक्षर 5KB से 20KB के बीच होना चाहिए। फोटो का बैकग्राउंड सफेद या हल्का ग्रे होना अनिवार्य है। यह टूल आपके दस्तावेजों को सटीक माप में तैयार करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>फोटो साइज: 20KB - 50KB:</strong> यूपी पुलिस पोर्टल के लिए सटीक साइज कंप्रेशन।</li>
            <li><strong>सिग्नेचर साइज: 5KB - 20KB:</strong> हस्ताक्षर को मानक 3.5 सेमी x 1.5 सेमी माप में फिट करता है।</li>
            <li><strong>लाइट बैकग्राउंड एडॉप्टर:</strong> बैकग्राउंड को हल्का और साफ करने के लिए स्मार्ट कंट्रास्ट टूल्स।</li>
            <li><strong>इंस्टेंट डाउनलोड:</strong> बिना किसी झंझट के तुरंत स्वीकार्य JPG फॉर्मेट में सेव करें।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">यूपी पुलिस में फोटो का बैकग्राउंड कैसा होना चाहिए?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">बोर्ड के अनुसार सफेद या बहुत हल्का ग्रे (Light Grey) बैकग्राउंड ही मान्य है।</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">सिग्नेचर के लिए कौन सी स्याही इस्तेमाल करें?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">काली स्याही (Black Ink) से किए गए हस्ताक्षर सबसे स्पष्ट और सुरक्षित माने जाते हैं।</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
