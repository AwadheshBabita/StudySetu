import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "4x6 Passport Photo Sheet Maker Online 300 DPI (8 & 12 Photos) | Exam Sewa",
  description: "4x6 ग्लॉसी पेपर हेतु 8 व 12 पासपोर्ट फोटो शीट ऑनलाइन बनाएँ। 300 DPI HD प्रिंट रेडी JPG और PDF। सॉलिड ब्लैक कटिंग आउटलाइन और ऑटो स्टूडियो लाइटिंग सपोर्ट।",
  keywords: [
    "4x6 passport photo sheet maker online free",
    "4x6 photo sheet 8 photo maker 300 dpi",
    "12 passport photo on 4x6 paper print online",
    "cyber cafe passport photo print tool without photoshop",
    "passport size photo cutting border black outline",
    "epson canon 4x6 glossy paper passport layout",
    "3.5 x 4.5 cm passport photo sheet maker free"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/passport-photo-4x6-maker",
  },
  openGraph: {
    title: "4x6 Passport Photo Sheet Maker Online 300 DPI | Exam Sewa",
    description: "4x6 ग्लॉसी पेपर पर 8 व 12 पासपोर्ट फोटो शीट तैयार करें। सॉलिड ब्लैक कटिंग बॉर्डर के साथ 300 DPI HD प्रिंट आउटपुट।",
    url: "https://examsewa.online/tools/passport-photo-4x6-maker",
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
            4x6 Passport Photo Maker: 4x6 इंच फोटो पेपर पर प्रिंट लेआउट तैयार करें
          </h1>
          <p className="text-slate-600">
            घर या स्टूडियो में फोटो प्रिंटर से कम से कम खर्च में पासपोर्ट फोटो निकालने के लिए 4x6 शीट सबसे किफायती होती है। बस अपनी फोटो अपलोड करें और यह टूल तुरंत 6 या 8 फोटो की रेडी-टू-प्रिंट शीट तैयार कर देगा।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>6 और 8 फोटो लेआउट:</strong> अपनी जरूरत के हिसाब से फोटो की संख्या चुनें।</li>
            <li><strong>स्टूडियो क्वालिटी एक्सपोर्ट:</strong> बिना किसी पिक्सल फटने के 300 DPI प्रिंट फाइल।</li>
            <li><strong>ऑटो स्पेसिंग:</strong> फोटो के बीच में सही गैप और कटिंग गाइड।</li>
            <li><strong>तुरंत डाउनलोड:</strong> JPG फॉर्मेट में बिना वाटरमार्क डाउनलोड करें।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या यह किसी भी फोटो लैब में प्रिंट हो जाएगा?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, कोई भी स्टूडियो या कलर लैब 4x6 शीट को तुरंत प्रिंट कर देती है।</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या फोटो के चारों तरफ बॉर्डर लगाना जरूरी है?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, इससे फोटो को कैंची से काटने में बहुत आसानी होती है।</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
