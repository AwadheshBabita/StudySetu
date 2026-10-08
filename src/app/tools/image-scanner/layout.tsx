import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Image Scanner - CamScanner Style Auto Edge Crop | Exam Sewa",
  description: "मोबाइल से खींची गई फोटो को CamScanner की तरह ऑटो डिटेक्ट कर सीधा करें। परछाई हटाएँ, A4 में फिट करें और 100KB PDF/JPG डाउनलोड करें।",
  keywords: [
    "online image scanner free",
    "camscanner alternative online without watermark",
    "auto edge detect photo scanner",
    "perspective crop document online a4",
    "mobile photo scanner to clean pdf"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/image-scanner",
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
            Online Image Scanner: साधारण फोटो को स्कैन डॉक्यूमेंट का लुक कैसे दें?
          </h1>
          <p className="text-slate-600">
            फोन के कैमरे से ली गई मार्कशीट या पहचान पत्र की फोटो में अक्सर छाया, बैकग्राउंड का रंग और असमान रोशनी आ जाती है। यह टूल स्मार्ट फिल्टर की मदद से साधारण फोटो के बैकग्राउंड को साफ सफेद और अक्षरों को डार्क करके उसे असली स्कैनर से स्कैन किया हुआ लुक देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>डॉक्यूमेंट एनहांसर:</strong> हल्के पेन और मुहर की लिखावट को गहरा और पढ़ने योग्य बनाता है।</li>
            <li><strong>शैडो रिमूवल:</strong> हाथ या फोन की परछाई को बैकग्राउंड से पूरी तरह साफ़ करता है।</li>
            <li><strong>ब्लैक & व्हाइट और कलर मोड्स:</strong> अपनी जरूरत के हिसाब से ग्रेस्केल या कलर स्कैन मोड चुनें।</li>
            <li><strong>क्रिस्प आउटपुट:</strong> ऑफिस और सरकारी फॉर्म्स में तुरंत अपलोड करने योग्य दस्तावेज।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या इसके लिए मुझे स्कैनर मशीन की जरूरत है?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">नहीं, बस फोन से अच्छी रोशनी में फोटो खींचें और यहाँ प्रोसेस कर लें।</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या बैंक पासबुक और मार्कशीट साफ हो सकती हैं?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, यह सभी तरह के प्रिंटेड और हाथ से लिखे कागजात को साफ करने के लिए आदर्श है।</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
