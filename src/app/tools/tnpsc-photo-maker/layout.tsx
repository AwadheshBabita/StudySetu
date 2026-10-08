import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TNPSC Photo & Signature Maker Online - Group 1, 2, 4, VAO | ExamSewa",
  description: "तमिलनाडु लोक सेवा आयोग (TNPSC OTR) भर्ती फॉर्म्स हेतु फोटो (20KB-50KB, नाम व तारीख DOP सहित) और सिग्नेचर (10KB-20KB) को आधिकारिक नियमों अनुसार ऑनलाइन तैयार करें। 100% सटीक व सुरक्षित।",
  keywords: [
    "tnpsc photo maker online",
    "tnpsc signature resize 10kb to 20kb",
    "tnpsc photo size 20kb to 50kb",
    "tnpsc group 4 photo resizer",
    "tnpsc otr photo with name and date",
    "tnpsc signature dimension converter",
    "tamil nadu psc online application photo crop",
    "tnpsc photo compressor free"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/tnpsc-photo-maker",
  },
  openGraph: {
    title: "TNPSC Photo & Signature Maker Online - Group 1, 2, 4, VAO | ExamSewa",
    description: "TNPSC OTR व भर्ती फॉर्म्स हेतु फोटो (20-50KB, नाम व DOP सहित) और सिग्नेचर (10-20KB) को आधिकारिक नियमों अनुसार बनाएं।",
    url: "https://examsewa.online/tools/tnpsc-photo-maker",
    type: "website",
  },
};

export default function TnpscPhotoMakerLayout({
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
            TNPSC Photo & Signature Maker: तमिलनाडु लोक सेवा आयोग OTR फॉर्म हेतु फोटो व साइन कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            तमिलनाडु लोक सेवा आयोग (Tamil Nadu Public Service Commission - TNPSC) द्वारा आयोजित Group 1, Group 2, Group 4, ग्राम प्रशासनिक अधिकारी (VAO), और अन्य तकनीकी पदों के वन-टाइम रजिस्ट्रेशन (OTR) और आवेदन पत्र भरते समय फोटो और हस्ताक्षर के बेहद कड़े नियम लागू होते हैं। आयोग के आधिकारिक नोटिफिकेशन के अनुसार, पासपोर्ट साइज फोटो का फाइल साइज <strong>20 KB से 50 KB</strong> और आयाम <strong>3.5 सेमी × 4.5 सेमी (लगभग 200 × 230 पिक्सल)</strong> होना चाहिए। सबसे महत्वपूर्ण बात यह है कि फोटो के निचले हिस्से पर उम्मीदवार का नाम और फोटो खींचने की तारीख यानी <strong>DOP (Date of Photo)</strong> स्पष्ट रूप से अंकित होना अनिवार्य है। बिना नाम व तारीख वाली साधारण फोटो अपलोड करने पर आवेदन सीधे निरस्त हो जाता है। वहीं हस्ताक्षर के लिए फाइल साइज <strong>10 KB से 20 KB</strong> तथा आयाम <strong>6.0 सेमी × 2.0 सेमी</strong> निर्धारित है। ExamSewa का <strong>TNPSC Photo & Signature Maker</strong> इन सभी आधिकारिक मापदंडों का कड़ाई से पालन करते हुए आपकी फाइलों को तुरंत तैयार करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>ऑटोमैटिक नाम व DOP स्ट्रिप:</strong> फोटो के निचले हिस्से में बिना चेहरा काटे एक सफेद पट्टी पर उम्मीदवार का नाम और हालिया तारीख (DOP) मानक बोल्ड फॉन्ट में जोड़ता है।</li>
            <li><strong>आधिकारिक TNPSC आस्पेक्ट रेशियो लॉक:</strong> फोटो (3.5 × 4.5 सेमी) और सिग्नेचर (6.0 × 2.0 सेमी) का फ्रेम स्वतः सेट रहता है जिससे अनुपात बिगड़ने का कोई जोखिम नहीं होता।</li>
            <li><strong>सख्त केबी दायरा (20-50 KB फोटो / 10-20 KB साइन):</strong> फाइल को ठीक उसी डिजिटल ब्रैकेट में कंप्रेस करता है जो TNPSC पोर्टल पर स्वीकृत है, जिससे 'File Size Mismatch' का एरर नहीं आता।</li>
            <li><strong>बैकग्राउंड वाइटनिंग व इंक एन्हांसर:</strong> हस्ताक्षर के पीछे के पीलेपन को हटाकर पृष्ठभूमि को सादा सफेद करता है और लिखावट को गहरा काला बनाता है।</li>
            <li><strong>100% डेटा प्राइवेसी:</strong> इमेज प्रोसेसिंग सीधे आपके मोबाइल या कंप्यूटर के ब्राउज़र में संपन्न होती है; कोई भी निजी फोटो सर्वर पर अपलोड नहीं की जाती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'TNPSC Photo' या 'TNPSC Signature' मोड चुनें।</li>
            <li>अपने डिवाइस से फोटो या कोरे कागज पर किए गए हस्ताक्षर की इमेज अपलोड करें।</li>
            <li>यदि फोटो बना रहे हैं, तो अपना पूरा नाम और हाल की तारीख (DOP) दर्ज करें।</li>
            <li>क्रॉप ग्रिड की मदद से चेहरे को फ्रेम के बीच में सेट करें।</li>
            <li>'Generate TNPSC Image' पर क्लिक करें और लाइव प्रीव्यू चेक करें।</li>
            <li>'Download JPG' बटन दबाकर तैयार फाइल डाउनलोड करें और OTR पोर्टल पर अपलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                TNPSC फोटो पर तारीख (DOP) कितनी पुरानी हो सकती है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                आयोग के नियमों के अनुसार फोटो नोटिफिकेशन जारी होने की तारीख से अधिकतम 3 महीने के भीतर खिंचवाई गई होनी चाहिए। ज्यादा पुरानी तारीख डालने से बचें।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या हस्ताक्षर के लिए नीली या काली स्याही अनिवार्य है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                TNPSC सादे सफेद कागज पर नीले या काले बॉलपेन से किए गए स्पष्ट हस्ताक्षर मांगता है। पेंसिल या स्केच पेन से किए गए हस्ताक्षर मान्य नहीं होते।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह टूल Group 4 और VAO दोनों के लिए काम करता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, TNPSC के केंद्रीय OTR सिस्टम और सभी परीक्षाओं (Group 1, 2, 4, VAO आदि) के लिए फोटो व सिग्नेचर के तकनीकी मानक एक समान होते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
