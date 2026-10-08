import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WBPSC Photo & Signature Resizer Online - वेस्ट बंगाल पीएससी फॉर्म | ExamSewa",
  description: "पश्चिम बंगाल लोक सेवा आयोग (WBPSC WBCS, क्लर्कशिप, मिसलेनियस) भर्ती फॉर्म हेतु फोटो (20KB-50KB, 200x230 px) और सिग्नेचर (10KB-20KB, 140x60 px) को आधिकारिक नियमों अनुसार ऑनलाइन रीसाइज़ करें।",
  keywords: [
    "wbpsc photo resizer online",
    "wbpsc signature resize 10kb to 20kb",
    "wbpsc photo size 20kb to 50kb",
    "wbcs photo signature dimension converter",
    "west bengal psc online application photo crop",
    "wbpsc clerkship photo resizer free",
    "wbpsc signature 140x60 px crop",
    "wbpsc photo editor online"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/wbpsc-photo-resizer",
  },
  openGraph: {
    title: "WBPSC Photo & Signature Resizer Online - वेस्ट बंगाल पीएससी फॉर्म | ExamSewa",
    description: "WBPSC WBCS व क्लर्कशिप फॉर्म हेतु फोटो (20KB-50KB) और सिग्नेचर (10KB-20KB) को आधिकारिक नियमों अनुसार रीसाइज़ करें।",
    url: "https://examsewa.online/tools/wbpsc-photo-resizer",
    type: "website",
  },
};

export default function WbpscPhotoResizerLayout({
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
            WBPSC Photo & Signature Resizer: वेस्ट बंगाल पीएससी फॉर्म हेतु फोटो और सिग्नेचर कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            पश्चिम बंगाल लोक सेवा आयोग (West Bengal Public Service Commission - WBPSC) द्वारा आयोजित WBCS (कार्यकारी), क्लर्कशिप परीक्षा, मिसलेनियस सर्विसेज, और न्यायिक सेवा भर्तियों के ऑनलाइन आवेदन पत्र भरते समय अभ्यर्थियों को फोटो और हस्ताक्षर अपलोड करने में अक्सर तकनीकी त्रुटियों का सामना करना पड़ता है। आयोग के आधिकारिक नोटिफिकेशन के सख्त नियमों के अनुसार, पासपोर्ट फोटो का आकार <strong>200 × 230 पिक्सल</strong> और फाइल साइज <strong>20 KB से 50 KB</strong> के बीच होना अनिवार्य है। वहीं हस्ताक्षर के लिए आयाम <strong>140 × 60 पिक्सल</strong> और फाइल साइज <strong>10 KB से 20 KB</strong> निर्धारित है। यदि तय पिक्सल या फाइल साइज में थोड़ा सा भी विचलन होता है, तो WBPSC पोर्टल 'Invalid Dimension' या 'File Size Out of Range' का एरर देकर फॉर्म सबमिशन रोक देता है। ExamSewa का <strong>WBPSC Photo & Signature Resizer</strong> आयोग के इन सभी तकनीकी पैमानों को ध्यान में रखकर बनाया गया है ताकि आपकी फाइल बिना किसी झंझट के एक बार में अपलोड हो सके।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>WBPSC आधिकारिक प्रीसेट्स (200×230 px व 140×60 px):</strong> फोटो और हस्ताक्षर के लिए आयोग द्वारा निर्धारित पिक्सल आयाम स्वतः लॉक रहते हैं, जिससे अनुपात बिगड़ने या फोटो खिंचने का कोई खतरा नहीं रहता।</li>
            <li><strong>सख्त केबी दायरा (20-50 KB फोटो / 10-20 KB साइन):</strong> फाइल के बाइट्स को आधिकारिक ब्रैकेट में सटीक रूप से कंप्रेस करता है, जिससे 'Upload Failed' की समस्या पूरी तरह समाप्त हो जाती है।</li>
            <li><strong>फेस अलाइनमेंट व बैकग्राउंड वाइटनिंग:</strong> पासपोर्ट फोटो में चेहरे को केंद्र में रखकर बैकग्राउंड को स्वच्छ व मानक बनाता है और हस्ताक्षर के पीछे की काली परछाई को हटाकर लिखावट को गहरा काला करता है।</li>
            <li><strong>शून्य गुणवत्ता हानि (Zero Blur):</strong> आधुनिक लैनकज़ोस रि-सैंपलिंग एल्गोरिदम का उपयोग, जिससे छोटे पिक्सल आकार में भी उम्मीदवार का चेहरा और हस्ताक्षर के बारीक मोड़ बिल्कुल स्पष्ट रहते हैं।</li>
            <li><strong>100% डेटा गोपनीयता:</strong> पूरी रीसाइज़िंग सीधे आपके फोन या कंप्यूटर के ब्राउज़र में संपन्न होती है; कोई भी निजी फोटो सर्वर पर स्टोर नहीं की जाती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'WBPSC Photo' या 'WBPSC Signature' मोड का चयन करें।</li>
            <li>अपने डिवाइस से मूल फोटो या सफेद कागज़ पर किए गए हस्ताक्षर की इमेज अपलोड करें।</li>
            <li>क्रॉप ग्रिड की मदद से फोटो में चेहरे को या हस्ताक्षर में अक्षरों को सही फ्रेम में लाएं।</li>
            <li>'Resize for WBPSC' बटन पर क्लिक करें—टूल स्वतः आयाम और साइज सेट कर देगा।</li>
            <li>स्क्रीन पर लाइव प्रीव्यू और फाइल साइज चेक करें, फिर 'Download JPG' पर क्लिक करके तैयार फाइल प्राप्त करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                WBPSC पोर्टल पर फोटो का बैकग्राउंड किस रंग का होना चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                WBPSC के दिशा-निर्देशों के अनुसार पासपोर्ट फोटो का बैकग्राउंड सादा हल्का (Light Background) या सफेद होना चाहिए। रंग-बिरंगे या डार्क बैकग्राउंड वाली फोटो रिजेक्ट हो सकती है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                हस्ताक्षर किस पेन से किया जाना चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                कोरे सफेद कागज़ पर काले या गहरे नीले बॉलपेन से साफ लिखावट में हस्ताक्षर करें। कैपिटल लेटर्स (ब्लॉक अक्षरों) में किया गया हस्ताक्षर अमान्य माना जाता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह टूल WBCS और क्लर्कशिप दोनों परीक्षाओं के लिए काम करता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल WBPSC के केंद्रीय वन-टाइम एनरोलमेंट और सभी परीक्षाओं (WBCS, Clerkship, Miscellaneous आदि) के समान तकनीकी मानकों का पालन करता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
