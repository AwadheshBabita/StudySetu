import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agniveer Army Live Photo Capture (20KB - 50KB) Oval Guide | Exam Sewa",
  description: "Join Indian Army व Agniveer भर्ती परीक्षा हेतु वेबकैम या मोबाइल कैमरे से लाइव फोटो खींचें। फेस ओवल गाइड, 3 सेकंड टाइमर और सटीक 20KB से 50KB ऑनलाइन फॉर्म रेडी आउटपुट।",
  keywords: [
    "Agniveer army live photo capture online",
    "Agniveer online form webcam photo oval guide",
    "Army GD live photo size 20kb to 50kb",
    "join indian army photo upload size compressor",
    "Agniveer Navy live photo capture without app",
    "webcam live photo for army rally form online"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/agniveer-live-photo",
  },
  openGraph: {
    title: "Agniveer Army Live Photo Capture (20KB - 50KB) | Exam Sewa",
    description: "आधिकारिक अग्निवीर रैली गाइडलाइन अनुसार फेस ओवल गाइड के साथ लाइव फोटो कैप्चर करें। 100% सटीक फॉर्म रेडी आउटपुट।",
    url: "https://examsewa.online/tools/agniveer-live-photo",
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
            Agniveer Live Photo Capture: आर्मी, नेवी व एयरफोर्स फॉर्म के लिए लाइव फोटो कैसे लें?
          </h1>
          <p className="text-slate-600">
            अग्निवीर भर्ती पोर्टल (Join Indian Army, Navy, Airforce) पर फॉर्म भरते समय सीधे वेबकैम से लाइव फोटो कैप्चर करनी होती है। अक्सर खराब लाइटिंग या गलत फ्रेम के कारण फॉर्म रिजेक्ट हो जाता है। यह टूल चेहरे के सही अनुपात और बैकग्राउंड लाइटिंग के साथ लाइव फोटो कैप्चर करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>रियल-टाइम फेस गाइडलाइन:</strong> चेहरे को सही दूरी और सीध में रखने के लिए ओवल फेस बॉर्डर।</li>
            <li><strong>ऑटो ब्राइटनेस व कंट्रास्ट:</strong> कम रोशनी वाले कमरों में भी चेहरे पर आवश्यक चमक लाता है।</li>
            <li><strong>आधिकारिक साइज आउटपुट:</strong> अग्निवीर पोर्टल के तय KB और पिक्सल माप में तुरंत डाउनलोड।</li>
            <li><strong>मोबाइल व लैपटॉप सपोर्ट:</strong> फ्रंट कैमरा और बाहरी वेबकैम दोनों पर सुचारू काम करता है।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या टोपी या चश्मा पहनकर फोटो ले सकते हैं?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">नहीं, दोनों कान और आंखें बिना किसी कवर के बिल्कुल साफ दिखनी चाहिए।</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">फोटो के पीछे की दीवार कैसी होनी चाहिए?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">कोशिश करें कि पीछे सादी और हल्के रंग या सफेद दीवार हो।</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
