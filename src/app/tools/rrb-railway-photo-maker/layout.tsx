import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RRB Railway Photo & Signature Maker Online - ALP, NTPC, Group D, Technician | ExamSewa",
  description: "रेलवे भर्ती बोर्ड (RRB ALP, Technician, NTPC, Group D, RPF) ऑनलाइन फॉर्म्स हेतु फोटो और सिग्नेचर को 30KB से 70KB के दायरे में आधिकारिक नियमों अनुसार रीसाइज़ व क्रॉप करें। 100% सटीक व सुरक्षित।",
  keywords: [
    "rrb railway photo maker online",
    "rrb alp photo size 30kb to 70kb",
    "railway photo signature resizer online",
    "rrb ntpc photo crop tool",
    "railway group d photo specifications",
    "rrb technician signature resize online",
    "rpf constable photo resizer free",
    "online railway exam photo editor"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/rrb-railway-photo-maker",
  },
  openGraph: {
    title: "RRB Railway Photo & Signature Maker Online - ALP, NTPC, Group D, Technician | ExamSewa",
    description: "रेलवे भर्ती बोर्ड (RRB) फॉर्म्स हेतु फोटो और सिग्नेचर को 30KB से 70KB के दायरे में आधिकारिक नियमों अनुसार बनाएं।",
    url: "https://examsewa.online/tools/rrb-railway-photo-maker",
    type: "website",
  },
};

export default function RrbRailwayPhotoMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            RRB Railway Photo & Signature Maker: रेलवे भर्ती फॉर्म हेतु फोटो व हस्ताक्षर कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            रेलवे भर्ती बोर्ड (Railway Recruitment Board - RRB) द्वारा आयोजित सहायक लोको पायलट (ALP), तकनीशियन (Technician), गैर-तकनीकी लोकप्रिय श्रेणियां (NTPC), ग्रुप डी (Level-1 Group D), और आरपीएफ (RPF SI व कांस्टेबल) जैसी विशाल भर्तियों में हर साल लाखों अभ्यर्थी ऑनलाइन आवेदन करते हैं। रेलवे के आधिकारिक नोटिफिकेशन में फोटो और हस्ताक्षर अपलोड करने के कड़े नियम होते हैं। अधिकांश सरकारी परीक्षाओं में जहाँ 20 से 50 KB मांगा जाता है, वहीं रेलवे भर्ती बोर्ड के पोर्टल पर फोटो और हस्ताक्षर दोनों के लिए अनिवार्य फाइल साइज <strong>30 KB से 70 KB</strong> तय होता है। फोटो का आयाम <strong>35 मिमी चौड़ाई × 45 मिमी ऊँचाई (लगभग 320 × 240 पिक्सल)</strong> होना चाहिए और बैकग्राउंड सादा सफेद होना अनिवार्य है। यदि फोटो में हल्का सा भी चश्मा, टोपी, परछाई या 30 KB से कम साइज होता है, तो रेलवे का ऑटोमैटिक वैलिडेशन सॉफ्टवेयर आवेदन तुरंत निरस्त (Reject) कर देता है। ExamSewa का <strong>RRB Railway Photo & Signature Maker</strong> इन सभी तकनीकी नियमों का शत-प्रतिशत पालन करते हुए फाइलों को सटीक रूप से तैयार करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>सख्त रेलवे साइज दायरा (30 KB से 70 KB लॉक):</strong> फोटो और हस्ताक्षर दोनों को ठीक 30 KB से 70 KB के बीच संतुलित रखता है, जिससे 'File Size Less Than 30 KB' का एरर कभी नहीं आता।</li>
            <li><strong>आधिकारिक RRB डायमेंशन प्रीसेट्स:</strong> फोटो के लिए 35×45 मिमी (320×240 px) और हस्ताक्षर के लिए 50×20 मिमी का मानक लॉक रेशियो, जिससे तस्वीर खिंचती या चपटी नहीं होती।</li>
            <li><strong>व्हाइट बैकग्राउंड व फेस अलाइनमेंट:</strong> साधारण बैकग्राउंड को हटाकर शुद्ध सफेद करने की सुविधा और दोनों कानों व चेहरे को 70% फ्रेम में केंद्रित करने वाला गाइडेड ग्रिड।</li>
            <li><strong>सिग्नेचर कंट्रास्ट बूस्टर:</strong> कोरे सफेद कागज़ पर किए गए दस्तखत की लिखावट को गहरा काला बनाता है और परछाई को हटाकर साफ एक्सपोर्ट करता है।</li>
            <li><strong>100% क्लाइंट-साइड गोपनीयता:</strong> पूरी प्रोसेसिंग सीधे आपके डिवाइस के वेब ब्राउज़र में होती है; कोई भी निजी फोटो या हस्ताक्षर सर्वर पर अपलोड नहीं होता।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'Railway Photo' या 'Railway Signature' विकल्प चुनें।</li>
            <li>अपने डिवाइस से बिना चश्मे/टोपी वाली साफ फोटो या सफेद कागज़ पर किए गए हस्ताक्षर अपलोड करें।</li>
            <li>क्रॉप फ्रेम की सहायता से चेहरे को केंद्र में रखें ताकि दोनों कान साफ दिखाई दें।</li>
            <li>'Make Railway Photo / Signature' बटन पर क्लिक करें—टूल स्वतः 30-70 KB के बीच सही पिक्सल सेट कर देगा।</li>
            <li>स्क्रीन पर लाइव प्रीव्यू और साइज चेक करें, फिर 'Download JPG' बटन दबाकर फाइल सुरक्षित करें और RRB पोर्टल पर अपलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या रेलवे फॉर्म में नजर का चश्मा (Spectacles) पहनकर खिंचवाई फोटो मान्य है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं। RRB के नियमों के अनुसार फोटो में किसी भी तरह का चश्मा (धूप का या नजर का) पहनना पूरी तरह वर्जित है। चश्मे पर लाइट का रिफ्लेक्शन आने से चेहरा स्पष्ट नहीं दिखता और फॉर्म रिजेक्ट हो जाता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                रेलवे में हस्ताक्षर किस प्रकार और किस पेन से किया जाना चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                सादे बिना लाइन वाले सफेद कागज़ पर काले या नीले पेन से सामान्य रनिंग हैंडराइटिंग में हस्ताक्षर करें। केवल कैपिटल लेटर्स (BLOCK LETTERS) में नाम लिखना हस्ताक्षर नहीं माना जाता।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह टूल RRB के नए रिक्रूटमेंट पोर्टल (rrbapply.gov.in) के अनुकूल है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल रेलवे के नए वन-टाइम रजिस्ट्रेशन और ऑनलाइन आवेदन पोर्टल (rrbapply.gov.in) के सभी तकनीकी दिशा-निर्देशों का पूरी तरह पालन करता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
