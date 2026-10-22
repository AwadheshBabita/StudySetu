import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bihar RTPS & Scholarship Document Compressor 50KB-100KB | Exam Sewa",
  description: "बिहार RTPS जाति, आय, निवास प्रमाणपत्र एवं UP Scholarship हेतु डॉक्युमेंट को सटीक 50KB से 100KB में कंप्रेस करें। मोहर व हस्ताक्षर की तीक्ष्णता 100% सुरक्षित।",
  keywords: [
    "bihar rtps document compress 100kb",
    "jati aay niwas photo size 50kb to 100kb converter",
    "RTPS bihar document upload error size reducer",
    "up scholarship certificate compress 100kb online",
    "marksheet certificate resize 100kb free",
    "online form document 50kb to 100kb jpg pdf",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/bihar-rtps-document-compressor",
  },
  openGraph: {
    title: "Bihar RTPS & Scholarship Document Compressor 50KB-100KB | Exam Sewa",
    description: "RTPS व छात्रवृत्ति पोर्टल अनुसार प्रमाणपत्र को 50KB-100KB में लॉक करें। मोहर व लिखावट साफ करें।",
    url: "https://examsewa.online/tools/bihar-rtps-document-compressor",
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
            Bihar RTPS Document Compressor: जाति, आय, निवास प्रमाण पत्र 200 KB में कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            बिहार सर्विस प्लस (RTPS Bihar) पोर्टल पर जाति, आय, निवास या ईडब्ल्यूएस प्रमाण पत्र का ऑनलाइन आवेदन करते समय पहचान पत्र और दस्तावेजों का साइज 200 KB से कम होना अनिवार्य है। यह टूल बिना धुंधला किए आपकी फाइल को ठीक 200 KB के अंदर कंप्रेस करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>200 KB स्पेशल लिमिट:</strong> RTPS पोर्टल के सर्वर नियमों के अनुसार सटीक साइज कंप्रेशन।</li>
            <li><strong>साफ लिखावट व मुहर:</strong> दस्तावेज का सीरियल नंबर, बारकोड और हस्ताक्षर पूरी तरह स्पष्ट रहते हैं।</li>
            <li><strong>PDF व JPG दोनों सपोर्ट:</strong> दोनों मान्य फॉर्मैट्स को तेजी से ऑप्टिमाइज़ करने की सुविधा।</li>
            <li><strong>100% प्राइवेट व फ्री:</strong> आपका संवेदनशील दस्तावेज़ ब्राउज़र से बाहर नहीं जाता।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या 200 KB से कम करने पर आवेदन रिजेक्ट होगा?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">नहीं, अगर अक्षर साफ दिख रहे हैं तो RTPS पोर्टल इसे तुरंत स्वीकार करता है।</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या आधार कार्ड की दोनों साइड एक साथ कंप्रेस हो सकती हैं?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, आप दोनों साइड वाले सिंगल पेज या PDF को आसानी से 200 KB के नीचे ला सकते हैं।</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
