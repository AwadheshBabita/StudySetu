import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Govt Exam Target PDF Compressor 100KB, 200KB, 500KB | Exam Sewa",
  description: "सरकारी फॉर्म, UPSC, SSC, IBPS व रेलवे हेतु PDF को 100KB, 200KB या 500KB में तुरंत कंप्रेस करें। मुहर, हस्ताक्षर और लिखावट 100% स्पष्ट। मल्टी-पेज सपोर्ट।",
  keywords: [
    "compress pdf to 100kb online free for govt job form",
    "compress pdf to 200kb without losing quality",
    "upsc ssc pdf size reducer 100kb 200kb",
    "reduce pdf file size below 100kb online",
    "multi page target pdf compressor govt exams",
    "pdf compressor for online application free",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/govt-exam-pdf-compressor",
  },
  openGraph: {
    title: "Govt Exam Target PDF Compressor (100KB, 200KB) | Exam Sewa",
    description: "सरकारी नौकरी फॉर्म के लिए PDF को सटीक 100KB, 200KB में कंप्रेस करें। टेक्स्ट व मुहर की स्पष्टता सुरक्षित।",
    url: "https://examsewa.online/tools/govt-exam-pdf-compressor",
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
            Govt Exam PDF Compressor: सरकारी फॉर्म के लिए PDF 100KB-200KB में बनाएं
          </h1>
          <p className="text-slate-600">
            UPSC, SSC, State PSC, और रेलवे भर्ती पोर्टल्स पर डाक्यूमेंट्स अपलोड करने के लिए 100 KB, 200 KB या 300 KB की सख्त लिमिट होती है। यह टूल खास तौर पर सरकारी फॉर्म्स के मानकों के हिसाब से PDF का आकार छोटा करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>परीक्षा स्पेशल प्रीसेट्स:</strong> 100KB, 200KB, 300KB और 500KB के रेडीमेड टारगेट्स।</li>
            <li><strong>अक्षरों की स्पष्टता बरकरार:</strong> साइज छोटा होने के बावजूद प्रमाणपत्र के रोल नंबर और नाम साफ रहते हैं।</li>
            <li><strong>जीरो सर्वर रिस्क:</strong> सरकारी दस्तावेज 100% सुरक्षित रहते हैं क्योंकि प्रोसेसिंग आपके डिवाइस पर होती है।</li>
            <li><strong>पोर्टल रिजेक्शन से मुक्ति:</strong> आधिकारिक अपलोड मानकों के 100% अनुकूल।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या RTPS या SSC पोर्टल इसे स्वीकार करेगा?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, यह स्टैंडर्ड कंप्रेस्ड PDF बनाता है जो हर सरकारी सर्वर पर बिना एरर अपलोड होता है।</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या सर्टिफिकेट का स्टाम्प और सिग्नेचर साफ दिखेगा?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, स्मार्ट ऑप्टिमाइज़ेशन से महत्वपूर्ण डिटेल्स सुरक्षित रहती हैं।</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
