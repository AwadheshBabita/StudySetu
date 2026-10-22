import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter - Convert Image to A4 PDF Online (Free)",
  description: "Convert JPG, JPEG, and images to standard A4 PDF online for free. Compress to 50KB, 100KB, 200KB for government job applications, marksheets, and documents.",
  keywords: [
    "jpg to pdf",
    "jpg to pdf converter",
    "image to pdf",
    "a4 pdf converter",
    "convert photo to pdf",
    "sarkari pdf maker",
    "photo se pdf kaise banaye 200kb me",
    "marksheet jpg to pdf a4",
    "mobile photo ko pdf me convert kare",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/jpg-to-pdf",
  },
  openGraph: {
    title: "JPG to PDF Converter - Convert Image to A4 PDF Online",
    description: "Easily convert photos and marksheets into standard A4 PDF with custom KB limits.",
    url: "https://examsewa.online/tools/jpg-to-pdf",
    siteName: "ExamSewa",
    type: "website",
  },
};

export default function JpgToPdfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}

      {/* SEO Guide Article Container (आईडी कार्ड जॉइनर जैसा फुल कंटेंट) */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            JPG to PDF Converter: फोटो और रसीदों से एक A4 PDF कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            मार्कशीट, आधार कार्ड, बैंक पासबुक या रसीदों की अलग-अलग तस्वीरों को मिलाकर एक सिंगल PDF फाइल तैयार करने का सबसे आसान टूल। सभी तस्वीरों को जोड़ें और एक स्टैंडर्ड PDF फाइल पाएं।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>A4 ऑटो-फिट:</strong> तस्वीरों को मानक A4 पेज साइज और सही मार्जिन में फिट करता है।</li>
            <li><strong>मल्टी-इमेज मर्ज:</strong> जितनी चाहें उतनी फोटो एक ही PDF में शामिल करें।</li>
            <li><strong>इमेज री-ऑर्डर:</strong> फाइलों के क्रम को ड्रैग करके आगे-पीछे सेट करें।</li>
            <li><strong>साइज ऑप्टिमाइज़ेशन:</strong> PDF को हल्का रखता है ताकि पोर्टल पर अपलोड करने में आसानी हो।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या PNG या WEBP फोटो भी सपोर्टेड हैं?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, यह JPG, JPEG, PNG सभी सामान्य इमेज फॉर्मेट्स को सपोर्ट करता है।</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या पेज का ओरिएंटेशन पोर्ट्रेट या लैंडस्केप कर सकते हैं?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">हाँ, फोटो के आकार के अनुसार ओरिएंटेशन अपने आप एडजस्ट हो जाता है।</p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
