import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MPSC Photo & Signature Resizer Online - महाराष्ट्र लोक सेवा आयोग | ExamSewa",
  description: "महाराष्ट्र लोक सेवा आयोग (MPSC) ऑनलाइन भर्ती फॉर्म हेतु फोटो और सिग्नेचर को तय पिक्सल (Width x Height) और 50KB की सीमा में रिसाइज़ करें। रिजेक्शन एरर से 100% सुरक्षा।",
  keywords: [
    "mpsc photo resizer online",
    "mpsc signature dimension converter",
    "maharashtra psc photo size 50kb",
    "mpsc online application photo crop",
    "mpsc signature resize 10kb to 50kb",
    "mpsc photo background rules",
    "online mpsc form photo tool",
    "mpsc exam document resizer",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/mpsc-photo-resizer",
  },
  openGraph: {
    title: "MPSC Photo & Signature Resizer Online - महाराष्ट्र लोक सेवा आयोग | ExamSewa",
    description: "MPSC ऑनलाइन भर्ती फॉर्म हेतु फोटो और सिग्नेचर को तय पिक्सल और 50KB में रिसाइज़ करें।",
    url: "https://examsewa.online/tools/mpsc-photo-resizer",
    type: "website",
  },
};

export default function MpscPhotoResizerLayout({
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
            MPSC Photo & Signature Resizer: महाराष्ट्र PSC ऑनलाइन फॉर्म के अनुसार फोटो व साइन कैसे बनाएं?
          </h1>
          <p className="text-slate-600">
            महाराष्ट्र लोक सेवा आयोग (Maharashtra Public Service Commission - MPSC) के तहत आयोजित होने वाली राज्य सेवा परीक्षा (Rajyaseva), कंबाइंड ग्रुप B/C, पुलिस उपनिरीक्षक (PSI), बिक्री कर निरीक्षक (STI), और अन्य भर्ती परीक्षाओं के ऑनलाइन आवेदन भरते समय फोटो और हस्ताक्षर के कड़े तकनीकी नियम होते हैं। MPSC के आधिकारिक पोर्टल पर फोटो का आकार सामान्यतः <strong>50 KB से अधिक नहीं</strong> होना चाहिए और पिक्सल अनुपात तय सीमा में होना चाहिए। थोड़ी सी भी लापरवाही या गलत पिक्सल होने पर पोर्टल 'Invalid Resolution' या 'File Size Exceeds 50KB' का एरर दे देता है। ExamSewa का <strong>MPSC Photo & Signature Resizer</strong> आयोग के सभी नवीनतम दिशा-निर्देशों के अनुसार फाइलों को सेकंडों में तैयार करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>आधिकारिक MPSC पिक्सल प्रीसेट:</strong> MPSC पोर्टल द्वारा निर्धारित सटीक चौड़ाई और ऊँचाई (Dimensions) को एक क्लिक में स्वतः लागू करता है।</li>
            <li><strong>50 KB सख्त साइज लॉक:</strong> बाइनरी कंप्रेशन तकनीक द्वारा फोटो और हस्ताक्षर के साइज को 40 KB से 48 KB के बीच सुरक्षित रूप से लॉक करता है ताकि सर्वर पर कभी रिजेक्शन न हो।</li>
            <li><strong>सिग्नेचर कंट्रास्ट बूस्टर:</strong> सादे सफेद कागज़ पर किए गए हस्ताक्षर की स्याही को गहरा और बैकग्राउंड को साफ़ सफेद करता है, जिससे हस्ताक्षर एकदम स्पष्ट दिखता है।</li>
            <li><strong>सफेद बैकग्राउंड ऑप्टिमाइज़ेशन:</strong> पासपोर्ट फोटो के बैकग्राउंड को हल्का और चेहरा स्पष्ट रखने के लिए ऑटो-ब्राइटनेस टूल्स।</li>
            <li><strong>100% डेटा सुरक्षा:</strong> आपकी फोटो और हस्ताक्षर केवल आपके कंप्यूटर या मोबाइल के ब्राउज़र में प्रोसेस होते हैं, किसी बाहरी सर्वर पर अपलोड नहीं होते।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में अपनी हाल ही में ली गई पासपोर्ट फोटो या हस्ताक्षर की इमेज चुनें।</li>
            <li>'MPSC Photo' या 'MPSC Signature' में से जो भी फाइल तैयार करनी हो, उस विकल्प को चुनें।</li>
            <li>टूल स्वतः MPSC के आधिकारिक पिक्सल और फाइल साइज सेटिंग्स को अप्लाई कर देगा।</li>
            <li>स्क्रीन पर लाइव प्रिव्यू में चेहरे की स्थिति और हस्ताक्षर की स्पष्टता जांचें।</li>
            <li>'Download File' पर क्लिक करके मानक JPG फॉर्मेट में डाउनलोड करें और MPSC पोर्टल पर बिना किसी एरर के अपलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                MPSC फॉर्म के लिए फोटो का बैकग्राउंड किस रंग का होना चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                MPSC के आधिकारिक दिशा-निर्देशों के अनुसार फोटो का बैकग्राउंड सादा सफेद (White) या बहुत हल्का होना चाहिए। रंग-बिरंगे या डार्क बैकग्राउंड वाली फोटो रिजेक्ट हो सकती है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                हस्ताक्षर के लिए कौन सा पेन इस्तेमाल करना अनिवार्य है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                सफेद कोरे कागज़ पर काली स्याही (Black Ink) के पेन से हस्ताक्षर करना सबसे सुरक्षित है। हस्ताक्षर हमेशा रनिंग हैंडराइटिंग में होना चाहिए, ब्लॉक लेटर्स में नहीं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल से MPSC हॉल टिकट (Hall Ticket) पर फोटो की क्वालिटी सही आएगी?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल फाइल साइज कम करते समय पिक्सल की शार्पनेस को सुरक्षित रखता है, जिससे एडमिट कार्ड पर फोटो और साइन बिल्कुल साफ प्रिंट होते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
