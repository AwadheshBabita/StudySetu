import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fast Image Compressor - फोटो साइज 20KB से 50KB में बनाएं | ExamSewa",
  description: "JPG, JPEG और PNG फोटो का साइज बिना क्वालिटी खोए 80% तक कम करें। सरकारी परीक्षा फॉर्म्स (SSC, UPSC, Railway, Police) हेतु 20KB से 50KB में सटीक इमेज कंप्रेशन।",
  keywords: [
    "image compressor online",
    "photo size kam kare",
    "compress image 20kb to 50kb",
    "reduce jpg image size online",
    "photo kb reducer for govt exam",
    "online picture compressor without losing quality",
    "signature image compressor 10kb to 20kb",
    "fast photo size reducer in kb"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/image-compressor",
  },
  openGraph: {
    title: "Fast Image Compressor - फोटो साइज 20KB से 50KB में बनाएं | ExamSewa",
    description: "JPG, JPEG और PNG फोटो का साइज बिना क्वालिटी खोए कम करें। सरकारी परीक्षा फॉर्म्स हेतु 20KB से 50KB में सटीक इमेज कंप्रेशन।",
    url: "https://examsewa.online/tools/image-compressor",
    type: "website",
  },
};

export default function ImageCompressorLayout({
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
            Online Image Compressor: फोटो और सिग्नेचर का साइज 20KB से 50KB में कैसे कम करें?
          </h1>
          <p className="text-slate-600">
            जब हम मोबाइल फोन के हाई-रेजोल्यूशन कैमरे से पासपोर्ट साइज फोटो या हस्ताक्षर की तस्वीर खींचते हैं, तो उसका फाइल साइज आमतौर पर 2 MB से 5 MB के बीच आता है। लेकिन जब हम SSC, UPSC, Railway Recruitment Board (RRB), State Police Bharti, Banking या कॉलेज एडमिशन पोर्टल पर आवेदन करते हैं, तो वहाँ स्पष्ट निर्देश होता है कि फोटो का साइज <strong>20 KB से 50 KB</strong> और हस्ताक्षर का साइज <strong>10 KB से 20 KB</strong> के बीच ही होना चाहिए। साधारण कंप्रेशन टूल्स फोटो का साइज घटाते समय चेहरे के पिक्सल को इतना धुंधला (Blur) कर देते हैं कि फॉर्म रिजेक्ट हो जाता है। हमारा <strong>Fast Image Compressor</strong> आधुनिक वेब कैनवास तकनीक से केवल गैर-ज़रूरी मेटाडेटा और हेवी रेंडरिंग बाइट्स को हटाकर फोटो के ओरिजिनल चेहरे की चमक और लिखावट को बनाए रखते हुए सटीक KB साइज देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>स्मार्ट विज़ुअल क्वालिटी स्लाइडर:</strong> लाइव स्लाइडर की मदद से आप अपनी आँखों से देखकर तय कर सकते हैं कि फोटो की शार्पनेस कितनी रखनी है और फाइल साइज कितना घटाना है।</li>
            <li><strong>सरकारी परीक्षा साइज प्रीसेट्स (20-50 KB & 10-20 KB):</strong> एक क्लिक में अपनी फाइल को सरकारी नौकरी पोर्टल्स के कड़े मापदंडों के अनुसार सेट करने की सुविधा।</li>
            <li><strong>मल्टीपल इमेज फॉर्मेट सपोर्ट:</strong> यह टूल JPG, JPEG, PNG और आधुनिक WEBP फाइलों को आसानी से प्रोसेस करता है और मानक JPG में एक्सपोर्ट करता है जो हर पोर्टल पर मान्य है।</li>
            <li><strong>शून्य पिक्सल ब्लर (No Visual Loss):</strong> चेहरे के नैन-नक्श, आँखों की पुतली और बैकग्राउंड का रंग बिल्कुल साफ रहता है; ज़ूम करने पर भी धुंधलापन नहीं आता।</li>
            <li><strong>100% क्लाइंट-साइड सुरक्षा:</strong> आपकी निजी फोटो या हस्ताक्षर इंटरनेट पर किसी भी सर्वर पर अपलोड नहीं किए जाते; सारी प्रोसेसिंग आपके मोबाइल या लैपटॉप की मेमोरी में होती है।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए 'Select Image' बॉक्स पर क्लिक करके अपनी पासपोर्ट फोटो या सिग्नेचर की इमेज चुनें।</li>
            <li>स्क्रीन पर अपनी फोटो का मूल साइज (जैसे 2.4 MB) और कंप्रेस होने के बाद का अनुमानित साइज लाइव देखें।</li>
            <li>क्वालिटी स्लाइडर को बाईं या दाईं ओर खिसकाकर अपनी आवश्यकतानुसार साइज (जैसे 35 KB या 45 KB) पर सेट करें।</li>
            <li>लाइव प्रिव्यू में चेहरे और लिखावट की स्पष्टता की जाँच करें।</li>
            <li>'Download Compressed Image' बटन पर क्लिक करके तैयार फाइल को सीधे डाउनलोड करें और अपने फॉर्म में अपलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या फोटो कंप्रेस करने से उसके पिक्सल डायमेंशन (चौड़ाई x ऊँचाई) बदल जाते हैं?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, यह कंप्रेसर फोटो के भौतिक पिक्सल अनुपात (Resolution) को बिल्कुल सुरक्षित रखता है; यह केवल फाइल के डिजिटल वजन (KB) को कम करता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल से सिग्नेचर को 10 KB से 20 KB में कंप्रेस किया जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, स्लाइडर को थोड़ा कम करके आप हस्ताक्षर को आसानी से 12 KB से 18 KB की सुरक्षित सीमा में ला सकते हैं, जिससे स्याही की लिखावट एकदम स्पष्ट रहेगी।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                अगर पोर्टल केवल JPG मांग रहा हो और मेरी फोटो PNG हो तो क्या यह काम करेगा?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल कंप्रेस करते समय PNG फाइल को स्वतः मानक JPG फॉर्मेट में बदल देता है ताकि पोर्टल पर 'Invalid Format' का एरर न आए।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
