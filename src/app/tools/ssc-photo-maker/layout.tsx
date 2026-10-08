import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSC Photo & Signature Maker Online - CGL, CHSL, MTS, GD | ExamSewa",
  description: "कर्मचारी चयन आयोग (SSC) फॉर्म्स हेतु फोटो (20KB-50KB, 3.5x4.5 सेमी) और सिग्नेचर (10KB-20KB, 140x60 px) को आधिकारिक नियमों अनुसार ऑनलाइन तैयार करें। फॉर्म रिजेक्शन से 100% सुरक्षा।",
  keywords: [
    "ssc photo maker online",
    "ssc signature resize 10kb to 20kb",
    "ssc photo size 20kb to 50kb",
    "ssc cgl photo resizer online",
    "ssc chsl signature crop tool",
    "ssc gd photo size converter",
    "ssc mts photo requirements online maker",
    "sarkari ssc photo maker free"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/ssc-photo-maker",
  },
  openGraph: {
    title: "SSC Photo & Signature Maker Online - CGL, CHSL, MTS, GD | ExamSewa",
    description: "SSC CGL, CHSL, MTS व GD फॉर्म्स हेतु फोटो (20-50KB) और सिग्नेचर (10-20KB) को आधिकारिक नियमों अनुसार बनाएं।",
    url: "https://examsewa.online/tools/ssc-photo-maker",
    type: "website",
  },
};

export default function SscPhotoMakerLayout({
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
            SSC Photo & Signature Maker: कर्मचारी चयन आयोग फॉर्म हेतु फोटो व हस्ताक्षर कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            कर्मचारी चयन आयोग (Staff Selection Commission - SSC) द्वारा आयोजित CGL, CHSL, MTS, Constable GD, CPO SI, और स्टेनोग्राफर जैसी प्रमुख भर्ती परीक्षाओं में हर साल लाखों आवेदन केवल फोटो और हस्ताक्षर की तकनीकी खामियों के कारण सीधे निरस्त (Reject) कर दिए जाते हैं। आयोग के आधिकारिक नोटिफिकेशन में स्पष्ट दिशा-निर्देश होते हैं कि पासपोर्ट साइज फोटो का डिजिटल वजन <strong>20 KB से 50 KB</strong> और आयाम <strong>3.5 सेमी चौड़ाई × 4.5 सेमी ऊँचाई</strong> होना चाहिए। वहीं हस्ताक्षर के लिए फाइल साइज <strong>10 KB से 20 KB</strong> तथा आयाम <strong>4.0 सेमी चौड़ाई × 2.0 सेमी ऊँचाई (लगभग 140 × 60 पिक्सल)</strong> तय है। फोटो में चश्मा (Spectacles), टोपी (Cap), या तिरछा चेहरा होने पर फॉर्म तुरंत रिजेक्ट हो जाता है। ExamSewa का <strong>SSC Photo & Signature Maker</strong> इन सभी आधिकारिक मापदंडों का कड़ाई से पालन करते हुए आपकी फाइलों को बिना किसी रिजेक्शन जोखिम के तैयार करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>आधिकारिक SSC डायमेंशन लॉक:</strong> फोटो के लिए 3.5 × 4.5 सेमी अनुपात और सिग्नेचर के लिए 140 × 60 पिक्सल का स्वतः लॉक फ्रेम, जिससे अपलोड के दौरान आस्पेक्ट रेशियो की गड़बड़ी नहीं होती।</li>
            <li><strong>सटीक फाइल साइज ब्रैकेट:</strong> फोटो को ठीक 20 से 50 KB के बीच और हस्ताक्षर को 10 से 20 KB के दायरे में कंप्रेस करता है, जिससे 'Invalid File Size' का एरर कभी नहीं आता।</li>
            <li><strong>बैकग्राउंड व फेस अलाइनमेंट गाइड:</strong> चेहरे को फ्रेम के मध्य में रखने और बैकग्राउंड को मानक हल्का/सफेद बनाने के लिए सरल विजुअल ग्रिड।</li>
            <li><strong>सिग्नेचर डार्कनर व वाइटनर:</strong> साधारण कागज के पीलेपन को हटाकर बैकग्राउंड को स्वच्छ सफेद करता है और स्याही को गहरा काला बनाता है ताकि हस्ताक्षर स्पष्ट दिखे।</li>
            <li><strong>100% क्लाइंट-साइड सुरक्षा:</strong> इमेज प्रोसेसिंग सीधे आपके मोबाइल या कंप्यूटर के ब्राउज़र में संपन्न होती है; कोई भी निजी फोटो सर्वर पर स्टोर नहीं की जाती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'SSC Photo' या 'SSC Signature' विकल्प चुनें।</li>
            <li>अपने डिवाइस से फोटो या सफेद कागज़ पर किए गए हस्ताक्षर की इमेज अपलोड करें।</li>
            <li>क्रॉप ग्रिड की मदद से चेहरे को दोनों कान स्पष्ट दिखाते हुए या हस्ताक्षर को फ्रेम के अंदर व्यवस्थित करें।</li>
            <li>'Make SSC Photo / Signature' बटन पर क्लिक करें—टूल स्वतः सही पिक्सल और KB सेट कर देगा।</li>
            <li>स्क्रीन पर लाइव प्रीव्यू और साइज चेक करें, फिर 'Download JPG' पर क्लिक करके तैयार फाइल प्राप्त करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या SSC फॉर्म में चश्मा या टोपी लगाकर खिंचाई गई फोटो मान्य है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                बिल्कुल नहीं। SSC के नियमों के अनुसार फोटो में नजर का चश्मा (Spectacles), धूप का चश्मा या किसी भी प्रकार की टोपी पहनना सख्त वर्जित है। ऐसा करने पर आवेदन स्वतः रद्द हो जाता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                हस्ताक्षर कैपिटल अक्षरों (BLOCK LETTERS) में कर सकते हैं क्या?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, केवल कैपिटल लेटर्स में लिखे गए नाम को हस्ताक्षर नहीं माना जाता। हमेशा सामान्य रनिंग हैंडराइटिंग में सादे सफेद कागज पर काले पेन से हस्ताक्षर करें।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह टूल SSC के नए पोर्टल (ssc.gov.in) के नियमों के अनुकूल है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल SSC के नवीनतम पोर्टल और भर्ती नोटिफिकेशनों में दिए गए सभी पिक्सल और फाइल साइज नियमों का पूरी तरह पालन करता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
