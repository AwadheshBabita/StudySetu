import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Govt Exam Form Fill Guide - फोटो, साइन व डॉक्यूमेंट अपलोड नियम | ExamSewa",
  description: "सरकारी नौकरी और प्रतियोगी परीक्षाओं (SSC, UPSC, Railway, Police, Banking) के ऑनलाइन फॉर्म भरते समय फोटो, हस्ताक्षर और डाक्यूमेंट्स अपलोड करने के संपूर्ण नियम व रिजेक्शन से बचने की गाइड।",
  keywords: [
    "govt exam form fill guide",
    "photo signature upload rules",
    "sarkari form me photo kaise upload kare",
    "dop photo date and name guidelines",
    "signature rejection reasons online form",
    "ssc railway photo upload guidelines",
    "online application document size rules",
    "avoid form rejection govt jobs"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/exam-guide",
  },
  openGraph: {
    title: "Govt Exam Form Fill Guide - फोटो, साइन व डॉक्यूमेंट अपलोड नियम | ExamSewa",
    description: "सरकारी नौकरी और प्रतियोगी परीक्षाओं के ऑनलाइन फॉर्म भरते समय फोटो, हस्ताक्षर और डाक्यूमेंट्स अपलोड करने के संपूर्ण नियम व रिजेक्शन से बचने की गाइड।",
    url: "https://examsewa.online/tools/exam-guide",
    type: "website",
  },
};

export default function ExamGuideLayout({
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
            Govt Exam Form Fill Guide: बिना रिजेक्शन के सरकारी नौकरी का ऑनलाइन फॉर्म कैसे भरें?
          </h1>
          <p className="text-slate-600">
            हर वर्ष लाखों योग्य अभ्यर्थियों के ऑनलाइन आवेदन पत्र (जैसे SSC CGL/CHSL/GD, UPSC, Railway RRB, State Police, Teaching Exams) केवल इस वजह से निरस्त (Reject) कर दिए जाते हैं क्योंकि उनकी अपलोड की गई पासपोर्ट फोटो, हस्ताक्षर या शैक्षिक प्रमाणपत्र आयोग के तकनीकी मानकों पर खरे नहीं उतरते। फॉर्म भरते समय छोटी सी लापरवाही—जैसे चश्मा पहनकर फोटो खींचना, हस्ताक्षर का बहुत छोटा या धुंधला होना, या फाइल साइज का कुछ बाइट्स ज्यादा होना—आपकी महीनों की तैयारी को बेकार कर सकती है। यह विस्तृत गाइड आपको परीक्षा आयोगों द्वारा निर्धारित सभी तकनीकी नियमों को सरलता से समझने और रिजेक्शन से बचने का सटीक रास्ता बताती है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            सरकारी परीक्षा फॉर्म्स के मुख्य तकनीकी नियम:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>पासपोर्ट फोटो के मानक (Photo Specifications):</strong> फोटो हाल ही की (आमतौर पर नोटिफिकेशन से 3 महीने के भीतर) होनी चाहिए। दोनों कान, आँखें और कंधे बिना किसी छाया के साफ दिखने चाहिए। बैकग्राउंड हमेशा सादा सफेद या हल्का ग्रे होना चाहिए। टोपी, धूप का चश्मा या मास्क लगाना सख्त वर्जित है।</li>
            <li><strong>नाम और तारीख वाली फोटो (DOP - Date of Photo):</strong> SSC और कुछ राज्य भर्ती आयोगों में फोटो के नीचे उम्मीदवार का नाम और जिस दिन फोटो खिंचवाई गई है वह तारीख (DOP) स्पष्ट सफेद पट्टी पर काले अक्षरों में लिखी होना अनिवार्य होता है।</li>
            <li><strong>हस्ताक्षर के नियम (Signature Guidelines):</strong> हस्ताक्षर हमेशा सफेद कोरे कागज़ पर काली या नीली स्याही के बॉल पेन से किया होना चाहिए। कभी भी सभी अक्षर बड़े (CAPITAL LETTERS) में लिखकर साइन न करें; हमेशा रनिंग हैंडराइटिंग (प्रवाहपूर्ण लिखावट) में ही हस्ताक्षर करें।</li>
            <li><strong>फाइल फॉर्मेट व साइज सीमा:</strong> फोटो सामान्यतः JPG/JPEG फॉर्मेट में 20 KB से 50 KB, सिग्नेचर 10 KB से 20 KB, तथा मार्कशीट व जाति/निवास प्रमाणपत्र PDF फॉर्मेट में 100 KB से 200 KB या 300 KB के बीच माँगे जाते हैं।</li>
            <li><strong>लाइव वेबकैम फोटो (Live Capture):</strong> कई आधुनिक परीक्षाओं में पहले से खींची फोटो के बजाय वेबकैम से लाइव फोटो ली जाती है। इसमें चेहरे पर सामने से पर्याप्त रोशनी होनी चाहिए और नजरें सीधे कैमरे के लेंस पर होनी चाहिए।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            रिजेक्शन से बचने के लिए स्टेप-बाय-स्टेप चेकलिस्ट (Pre-Upload Checklist):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>फॉर्म भरने से पहले संबंधित भर्ती का आधिकारिक विज्ञापन (Official Notification) खोलकर फोटो-साइन का साइज और पिक्सल चार्ट देख लें।</li>
            <li>हमारे 'Smart Document Scanner' टूल से अपने कागजात का पीलापन और परछाई हटाकर उन्हें क्रिस्प सफेद बैकग्राउंड दें।</li>
            <li>फोटो और हस्ताक्षर को सही अनुपात में क्रॉप करने के लिए 'Photo Resizer' या संबंधित परीक्षा प्रीसेट का उपयोग करें।</li>
            <li>'Exact KB Compressor' से फाइल साइज को पोर्टल की अधिकतम सीमा से 1-2 KB कम पर सेट करें (उदा. 50 KB सीमा के लिए 45-48 KB रखें)।</li>
            <li>फाइनल सबमिट करने से पहले आवेदन के प्रिव्यू पेज पर फोटो और हस्ताक्षर को ज़ूम करके जांचें कि वे साफ पढ़े जा रहे हैं या नहीं।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या नज़र का सादा चश्मा (Spectacles) पहनकर खींची फोटो मान्य होती है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                अधिकांश भर्ती बोर्ड (विशेषकर SSC और रेलवे) चश्मे के शीशे पर पड़ने वाली चमक (Glare) के कारण फोटो निरस्त कर देते हैं। सबसे सुरक्षित यही है कि फोटो खिंचवाते समय चश्मा उतार दें।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                अगर हस्ताक्षर कैपिटल लेटर्स में कर दिए जाएँ तो क्या फॉर्म रिजेक्ट हो जाएगा?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, भर्ती आयोगों के स्पष्ट निर्देश होते हैं कि ब्लॉक या कैपिटल लेटर्स में लिखे नाम को हस्ताक्षर नहीं माना जाता और ऐसे आवेदन निरस्त कर दिए जाते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या सेल्फी फोटो सरकारी नौकरी के फॉर्म में अपलोड की जा सकती है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। सेल्फी में कैमरे का एंगल झुका हुआ होता है और चेहरे का अनुपात बिगड़ जाता है। हमेशा सामने से खींची गई पासपोर्ट फोटो ही मान्य होती है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
