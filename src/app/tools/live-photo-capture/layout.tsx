import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Govt Exam Live Webcam Photo Tool - लाइव फोटो कैप्चर | ExamSewa",
  description: "सरकारी नौकरी और ऑनलाइन भर्ती परीक्षाओं हेतु लैपटॉप या मोबाइल कैमरे से सीधे लाइव फोटो कैप्चर करें। ऑटो फेस-गाइड, सही अनुपात और मानक पिक्सल व KB साइज में इंस्टेंट डाउनलोड।",
  keywords: [
    "live photo capture online",
    "webcam photo for govt exam",
    "online form camera capture",
    "live webcam passport photo maker",
    "sarkari exam live photo taker",
    "webcam photo resizer 20kb 50kb",
    "capture passport photo with laptop camera",
    "live photo crop tool"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/live-photo-capture",
  },
  openGraph: {
    title: "Govt Exam Live Webcam Photo Tool - लाइव फोटो कैप्चर | ExamSewa",
    description: "सरकारी नौकरी और भर्ती परीक्षाओं हेतु कैमरे से सीधे लाइव फोटो कैप्चर करें। मानक पिक्सल व KB साइज में इंस्टेंट डाउनलोड।",
    url: "https://examsewa.online/tools/live-photo-capture",
    type: "website",
  },
};

export default function LivePhotoCaptureLayout({
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
            Govt Exam Live Webcam Photo Tool: परीक्षा फॉर्म हेतु कैमरे से सीधे लाइव फोटो कैसे लें?
          </h1>
          <p className="text-slate-600">
            आधुनिक भर्ती प्रणालियों (जैसे अग्निवीर सेना भर्ती, कई राज्य पुलिस आयोग, रेलवे और विशेष प्रतियोगी परीक्षाएं) में फर्जीवाड़े और प्रॉक्सी आवेदनों को रोकने के लिए अब पहले से खींची गई पुरानी फोटो अपलोड करने की अनुमति नहीं होती; वे सीधे ऑनलाइन आवेदन के समय लाइव वेबकैम से फोटो कैप्चर करने की मांग करते हैं। कई बार उम्मीदवार जब साधारण कैमरे या मोबाइल ब्राउज़र से फोटो खींचते हैं, तो चेहरा तिरछा हो जाता है, रोशनी कम होती है, या सिर का अनुपात पासपोर्ट नियमों के अनुसार नहीं बैठता। ExamSewa का <strong>Live Webcam Photo Tool</strong> आपको स्क्रीन पर एक पेशेवर फेस-गाइड फ्रेम और ऑटो-ब्राइटनेस टूल्स प्रदान करता है जिससे आप बिना किसी गलती के पहली ही बार में सही सरकारी मानकों वाली लाइव फोटो कैप्चर कर सकते हैं।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>ओवल फेस-गाइडलाइन फ्रेम (Oval Alignment Guide):</strong> स्क्रीन पर चेहरे और कंधों की सही दूरी बनाए रखने के लिए एक विजुअल फ्रेम दिखाई देता है, जिससे आपका सिर बिल्कुल केंद्र में रहता है।</li>
            <li><strong>ऑटो-कंट्रास्ट व ब्राइटनेस सुधार:</strong> यदि कमरे में रोशनी थोड़ी कम है, तो टूल कैमरे के फीड को डिजिटल रूप से ऑप्टिमाइज़ करके चेहरे पर पर्याप्त रोशनी और स्पष्टता लाता है।</li>
            <li><strong>मिरर इमेज करेक्शन (No Flip Distortion):</strong> वेबकैम में अक्सर चेहरा उल्टा (Mirrored) दिखता है; यह टूल कैप्चर करते ही उसे स्वाभाविक और आधिकारिक रूप में सीधा कर देता है।</li>
            <li><strong>मानक 20 KB से 50 KB एक्सपोर्ट:</strong> फोटो खींचने के तुरंत बाद उसे सीधे सरकारी पोर्टल्स के अनुकूल साइज और रेजोल्यूशन में डाउनलोड करने का विकल्प।</li>
            <li><strong>100% प्राइवेट व सुरक्षित:</strong> कैमरे का वीडियो फीड केवल आपके डिवाइस के ब्राउज़र में प्रोसेस होता है; कोई भी वीडियो या फोटो किसी सर्वर पर स्ट्रीम या रिकॉर्ड नहीं होती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए 'Start Camera' बटन पर क्लिक करें और ब्राउज़र में कैमरा एक्सेस की अनुमति (Allow) दें।</li>
            <li>कैमरे के सामने सीधे बैठें ताकि आपके चेहरे पर सामने से रोशनी पड़े और दोनों कान साफ दिखाई दें।</li>
            <li>स्क्रीन पर बने ओवल फ्रेम के भीतर अपने चेहरे को बिल्कुल बीच में सेट करें।</li>
            <li>'Capture Photo' बटन दबाएं—तस्वीर तुरंत स्क्रीन पर प्रिव्यू के रूप में दिखाई देगी।</li>
            <li>यदि फोटो पसंद न आए तो 'Retake' करें, अन्यथा 'Download Photo' पर क्लिक करके मानक JPG में सुरक्षित करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल का उपयोग मोबाइल फोन के फ्रंट कैमरे से किया जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल मोबाइल फोन के फ्रंट कैमरे और लैपटॉप/कंप्यूटर के किसी भी वेबकैम के साथ पूरी तरह अनुकूल है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                लाइव फोटो लेते समय बैकग्राउंड कैसा होना चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हमेशा किसी सादे सफेद या हल्के रंग की दीवार के सामने बैठकर ही लाइव फोटो कैप्चर करें ताकि बैकग्राउंड में कोई हलचल या वस्तु न दिखे।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या लाइव फोटो लेते समय चश्मा पहनना चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, वेबकैम की रोशनी चश्मे के शीशे पर चमक (Glare) पैदा करती है, इसलिए फोटो कैप्चर करते समय चश्मा उतारना ही सर्वोत्तम है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
