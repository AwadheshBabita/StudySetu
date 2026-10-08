import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Format Converter - JPG, PNG, WEBP कनवर्टर ऑनलाइन | ExamSewa",
  description: "तस्वीरों का फॉर्मेट एक क्लिक में बदलें—PNG से JPG, JPG से PNG या WEBP से JPG/PNG में। सरकारी परीक्षा फॉर्म्स हेतु 'Invalid File Format' एरर से 100% सुरक्षा। तेज़, मुफ़्त और सुरक्षित वेब टूल।",
  keywords: [
    "image format converter online",
    "png to jpg converter",
    "webp to jpg converter online",
    "convert photo to jpeg online",
    "jpg to png converter",
    "change image format for govt form",
    "free online picture converter",
    "photo extension changer online"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/image-format-converter",
  },
  openGraph: {
    title: "Image Format Converter - JPG, PNG, WEBP कनवर्टर ऑनलाइन | ExamSewa",
    description: "तस्वीरों का फॉर्मेट एक क्लिक में बदलें—PNG से JPG, JPG से PNG या WEBP से JPG/PNG में। सरकारी फॉर्म्स हेतु 100% सुरक्षित।",
    url: "https://examsewa.online/tools/image-format-converter",
    type: "website",
  },
};

export default function ImageFormatConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* SEO Guide Article Container (आईडी कार्ड जॉइनर जैसा फुल रिच कंटेंट) */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            Image Format Converter: JPG, PNG और WEBP तस्वीरों का फॉर्मेट ऑनलाइन कैसे बदलें?
          </h1>
          <p className="text-slate-600">
            सरकारी नौकरियों (जैसे SSC, UPSC, Railway, State Police, Banking) और यूनिवर्सिटी एडमिशन पोर्टलों पर आवेदन करते समय तकनीकी नियमों में अक्सर साफ लिखा होता है कि केवल <strong>.JPG या .JPEG</strong> फॉर्मेट की फाइलें ही स्वीकार की जाएंगी। कई बार जब छात्र अपने स्मार्टफोन से फोटो खींचते हैं या इंटरनेट से डाक्यूमेंट्स डाउनलोड करते हैं, तो वे <strong>.WEBP, .PNG या .HEIC</strong> एक्सटेंशन में सेव होते हैं। ऐसे फोटो को सीधे अपलोड करने पर पोर्टल तुरंत <em>'Invalid File Extension'</em> या <em>'Only JPG Files Allowed'</em> का एरर दिखा देता है। ExamSewa का <strong>Image Format Converter</strong> किसी भी इमेज के फॉर्मेट को सेकंडों में बिना उसकी पिक्चर क्वालिटी खराब किए सीधे मानक JPG, PNG या WEBP में बदल देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>मल्टी-फॉर्मेट यूनिवर्सल सपोर्ट:</strong> WEBP से JPG, PNG से JPG, JPG से PNG, और BMP/GIF से मानक वेब फॉर्मेट्स में त्वरित रूपांतरण (Instant Conversion)।</li>
            <li><strong>पारदर्शिता का सुरक्षित समाधान (Smart Alpha Handling):</strong> PNG फोटो को JPG में बदलते समय पारदर्शी (Transparent) बैकग्राउंड को स्वतः शुद्ध सफेद बैकग्राउंड में बदलता है, जिससे पासपोर्ट फोटो का बैकग्राउंड काला या खराब नहीं होता।</li>
            <li><strong>शून्य पिक्सल लॉस (No Quality Loss):</strong> फॉर्मेट बदलने के दौरान इमेज के रेजोल्यूशन, कलर्स और शार्पनेस में कोई गिरावट नहीं आती।</li>
            <li><strong>तेज़ और हल्का इंजन:</strong> बिना किसी सॉफ्टवेयर को इंस्टॉल किए सीधे मोबाइल या लैपटॉप के वेब ब्राउज़र में तेज़ी से कार्य करता है।</li>
            <li><strong>100% डेटा सुरक्षा:</strong> आपकी कोई भी व्यक्तिगत फोटो, मार्कशीट या हस्ताक्षर किसी बाहरी सर्वर पर अपलोड नहीं होते; पूरा प्रोसेस क्लाइंट-साइड ब्राउज़र मेमोरी में संपन्न होता है।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए अपलोड बॉक्स में अपनी वह फोटो चुनें जिसका फॉर्मेट बदलना है।</li>
            <li>'Target Format' विकल्प में से अपनी पसंद का फॉर्मेट (उदा. JPG / JPEG या PNG) चुनें।</li>
            <li>'Convert Image' बटन पर क्लिक करें—कन्वर्जन पलक झपकते ही पूरा हो जाएगा।</li>
            <li>स्क्रीन पर कन्वर्ट हुई नई इमेज का प्रिव्यू देखें।</li>
            <li>'Download Converted Image' पर क्लिक करके अपनी तैयार फाइल डाउनलोड करें और बेझिझक अपने फॉर्म में अपलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                सरकारी परीक्षा फॉर्म्स के लिए JPG और PNG में से कौन सा फॉर्मेट बेहतर है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                99% सरकारी और भर्ती पोर्टलों पर केवल JPG/JPEG फॉर्मेट ही मांगा जाता है क्योंकि यह हल्का होता है और सर्वर पर तेज़ी से लोड होता है। इसलिए हमेशा JPG में कन्वर्ट करना सबसे सुरक्षित है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या गूगल से डाउनलोड की गई WEBP फोटो को JPG में बदला जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल आधुनिक WEBP फॉर्मेट को पूरी तरह सपोर्ट करता है और उसे एक क्लिक में हाई-क्वालिटी JPG इमेज में बदल देता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या फॉर्मेट बदलने के बाद फाइल का KB साइज बढ़ जाता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                PNG से JPG में बदलने पर फाइल साइज आमतौर पर काफी कम हो जाता है। यदि साइज को और कम करना हो, तो आप हमारे 'Exact KB Compressor' टूल का उपयोग कर सकते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
