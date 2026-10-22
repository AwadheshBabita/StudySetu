import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF एवं Image कंप्रेसर ऑनलाइन - सरकारी फॉर्म हेतु साइज कम करें | ExamSewa",
  description: "सरकारी नौकरी और प्रतियोगी परीक्षा फॉर्म (SSC, UPSC, Railway, Police) के लिए PDF और फोटो का साइज KB में कम करें। 20KB, 50KB, 100KB, 200KB में सटीक कंप्रेशन बिना क्वालिटी खोए।",
  keywords: [
    "pdf compressor online",
    "image compressor in kb",
    "photo size kam kare",
    "pdf size reducer 100kb 200kb",
    "compress jpg to 20kb 50kb",
    "sarkari form compressor tool",
    "reduce file size online free",
    "photo signature pdf compressor",
    "online document compress tool",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/compressor",
  },
  openGraph: {
    title: "PDF एवं Image कंप्रेसर ऑनलाइन - सरकारी फॉर्म हेतु साइज कम करें | ExamSewa",
    description: "सरकारी नौकरी और प्रतियोगी परीक्षा फॉर्म के लिए PDF और फोटो का साइज KB में कम करें। 20KB, 50KB, 100KB, 200KB सटीक कंप्रेशन।",
    url: "https://examsewa.online/tools/compressor",
    type: "website",
  },
};

export default function CompressorHubLayout({
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
            PDF एवं Image कंप्रेसर हब: सरकारी परीक्षा फॉर्म के लिए सही टूल कैसे चुनें?
          </h1>
          <p className="text-slate-600">
            सरकारी नौकरी (जैसे SSC CGL/GD, UPSC, Railway RRB, State Police, Banking) या कॉलेज एडमिशन फॉर्म भरते समय सबसे ज्यादा समय फाइलों का साइज सेट करने में बर्बाद होता है। अलग-अलग भर्ती आयोगों के नियम अलग-अलग होते हैं—पासपोर्ट फोटो को JPG फॉर्मेट में 20 KB से 50 KB, सिग्नेचर को 10 KB से 20 KB, और मार्कशीट या जाति/निवास प्रमाणपत्रों को PDF फॉर्मेट में 100 KB से 200 KB के बीच अपलोड करना अनिवार्य होता है। ExamSewa का यह ऑल-इन-वन <strong>Compressor Hub</strong> आपकी सभी फाइलों को एक ही प्लेटफॉर्म पर सुरक्षित और सटीक रूप से कंप्रेस करने के लिए बनाया गया है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस हब में उपलब्ध मुख्य टूल्स और उनके कार्य:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>ऑनलाइन PDF कंप्रेसर (PDF Compressor):</strong> जाति प्रमाण पत्र, निवास, ईडब्ल्यूएस, हाईस्कूल/इंटर मार्कशीट जैसी भारी PDF फाइलों को 100 KB, 200 KB या 300 KB के आधिकारिक दायरे में कंप्रेस करें। इसमें अक्षरों की स्पष्टता (Text Sharpness) पूरी तरह सुरक्षित रहती है।</li>
            <li><strong>फास्ट इमेज कंप्रेसर (Image Compressor):</strong> JPG, JPEG और PNG फोटो को बिना धुंधला किए तुरंत 70% से 90% तक हल्का करें। पासपोर्ट फोटो को 20 KB से 50 KB में लॉक करने के लिए सबसे उपयुक्त।</li>
            <li><strong>सिग्नेचर साइज सेटर:</strong> ऑनलाइन आवेदन में हस्ताक्षर के रिजेक्शन से बचने के लिए 10 KB से 20 KB की सटीक बाइनरी साइज रेंज।</li>
            <li><strong>100% डेटा सुरक्षा व प्राइवेसी:</strong> आपकी निजी मार्कशीट या संवेदनशील पहचान पत्र किसी भी बाहरी सर्वर पर अपलोड नहीं होते। फाइल प्रोसेसिंग सीधे आपके ब्राउज़र मेमोरी में संपन्न होती है।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>यदि आपके पास मार्कशीट या सर्टिफिकेट PDF रूप में है, तो ऊपर दिए गए 'PDF कंप्रेसर' विकल्प को चुनें।</li>
            <li>यदि आपके पास पासपोर्ट फोटो या हस्ताक्षर JPG इमेज में है, तो 'Image कंप्रेसर' विकल्प पर क्लिक करें।</li>
            <li>अपने डिवाइस से फाइल अपलोड करें और अपने पोर्टल के अनुसार टारगेट साइज (जैसे 50 KB या 100 KB) चुनें।</li>
            <li>कंप्रेशन पूरा होने के बाद लाइव फाइल साइज देखें और 'Download' बटन पर क्लिक करके फाइल सेव करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                फाइल कंप्रेस करने के बाद क्या सरकारी पोर्टल पर रिजेक्ट हो सकती है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। यह टूल केवल अनावश्यक मेटाडेटा और हेवी रेंडरिंग एलिमेंट्स को हटाता है। फोटो का चेहरा और डाक्यूमेंट्स के रोल नंबर व मोहर बिल्कुल स्पष्ट रहते हैं, जिससे पोर्टल पर 'Invalid File Size' या 'Unreadable Document' का एरर नहीं आता।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या फोटो को PDF में और PDF को फोटो में बदलकर भी कंप्रेस किया जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यदि आपके पास फोटो है और पोर्टल ने PDF मांगी है, तो आप हमारे 'JPG to PDF' टूल का इस्तेमाल करके फिर उसे यहाँ 100 KB में कंप्रेस कर सकते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल के उपयोग की कोई दैनिक सीमा या शुल्क है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, ExamSewa के सभी कंप्रेसर टूल्स छात्रों, साइबर कैफे और जन सेवा केंद्र संचालकों के लिए 100% मुफ़्त और असीमित हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
