import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Watermark to PDF Online - पीडीएफ पर वॉटरमार्क लगाएं | ExamSewa",
  description: "अपने स्टडी नोट्स, ई-बुक्स, क्वेश्चन पेपर्स और आधिकारिक पीडीएफ दस्तावेजों पर टेक्स्ट या लोगो वॉटरमार्क जोड़ें। ओपेसिटी, फॉन्ट साइज व एंगल कंट्रोल के साथ 100% सुरक्षित और मुफ्त टूल।",
  keywords: [
    "add watermark to pdf online",
    "pdf watermark tool free",
    "pdf par watermark kaise lagaye",
    "stamp pdf document online",
    "protect study notes with watermark",
    "custom text watermark on pdf",
    "coaching notes watermark generator",
    "free pdf watermarking tool"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/pdf-watermark",
  },
  openGraph: {
    title: "Add Watermark to PDF Online - पीडीएफ पर वॉटरमार्क लगाएं | ExamSewa",
    description: "स्टडी नोट्स, ई-बुक्स व दस्तावेजों पर टेक्स्ट या लोगो वॉटरमार्क जोड़ें। 100% सुरक्षित और मुफ्त टूल।",
    url: "https://examsewa.online/tools/pdf-watermark",
    type: "website",
  },
};

export default function PdfWatermarkLayout({
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
            Add Watermark to PDF: अपने स्टडी नोट्स और दस्तावेजों पर कस्टम वॉटरमार्क कैसे लगाएं?
          </h1>
          <p className="text-slate-600">
            डिजिटल शिक्षा और ऑनलाइन स्टडी मटेरियल के दौर में प्रतियोगी परीक्षाओं की तैयारी करवाने वाले शिक्षक, कोचिंग संस्थान, जन सेवा केंद्र (CSC) संचालक और छात्र अपने हाथ से बनाए गए नोट्स, मॉडल टेस्ट पेपर्स, और महत्वपूर्ण ई-बुक्स पीडीएफ फॉर्मेट में साझा करते हैं। लेकिन अक्सर यह सामग्री बिना किसी अनुमति के दूसरे प्लेटफॉर्म्स या टेलीग्राम ग्रुप्स द्वारा चुराकर अपने नाम से प्रसारित कर दी जाती है। अपने बौद्धिक संपदा अधिकार (Copyright) और ब्रांड पहचान की रक्षा के लिए दस्तावेज़ पर वॉटरमार्क लगाना सबसे प्रभावी तरीका है। ExamSewa का <strong>PDF Watermark Tool</strong> आपको अपनी पीडीएफ के प्रत्येक पन्ने पर पारदर्शी (Semi-transparent) टेक्स्ट स्टैम्प जैसे <em>'CONFIDENTIAL'</em>, <em>'FOR EXAM PURPOSE ONLY'</em>, या अपने संस्थान का नाम जोड़ने की त्वरित और सटीक सुविधा देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>कस्टम टेक्स्ट व ट्रांसपेरेंसी कंट्रोल:</strong> अपनी पसंद का कोई भी शब्द या वाक्य लिखें तथा उसकी पारदर्शिता (Opacity) को स्लाइडर से नियंत्रित करें ताकि मूल लिखावट पढ़ने में कोई रुकावट न आए।</li>
            <li><strong>फ्लेक्सिबल एंगल व पोजिशनिंग (45° Diagonal / Horizontal):</strong> वॉटरमार्क को तिरछा (45 डिग्री विकर्ण) रखें या पन्ने के केंद्र, ऊपर अथवा नीचे क्षैतिज रूप से सेट करें।</li>
            <li><strong>बैच पेज वॉटरमार्किंग (All Pages in Seconds):</strong> पीडीएफ में चाहे 5 पन्ने हों या 100 पन्ने, यह टूल एक ही क्लिक में सभी पन्नों पर समान रूप से वॉटरमार्क लागू करता है।</li>
            <li><strong>फॉन्ट व कलर कस्टमाइज़ेशन:</strong> अक्षरों का आकार (Font Size), रंग (ग्रे, लाल, नीला आदि) और बोल्डनेस अपनी आवश्यकतानुसार समायोजित करें।</li>
            <li><strong>100% क्लाइंट-साइड गोपनीयता:</strong> पूरी वॉटरमार्किंग प्रक्रिया सीधे आपके मोबाइल या लैपटॉप के ब्राउज़र में संपन्न होती है; आपकी अनमोल अध्ययन सामग्री किसी बाहरी सर्वर पर अपलोड नहीं होती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'Select PDF File' पर क्लिक करके अपनी फाइल अपलोड करें।</li>
            <li>'Watermark Text' बॉक्स में वह नाम या टेक्स्ट दर्ज करें जो आप पन्नों पर दिखाना चाहते हैं।</li>
            <li>फॉन्ट साइज, एंगल (जैसे 45°) और पारदर्शिता (जैसे 30% या 40%) का स्तर सेट करें।</li>
            <li>लाइव प्रिव्यू में देखें कि वॉटरमार्क मूल अक्षरों को छिपाए बिना सुंदर और स्पष्ट दिख रहा है या नहीं।</li>
            <li>'Apply Watermark' पर क्लिक करें और कुछ ही सेकंड में 'Download Watermarked PDF' बटन से फाइल सेव करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                वॉटरमार्क के लिए सबसे आदर्श पारदर्शिता (Opacity) क्या होनी चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                सामान्यतः 20% से 35% के बीच की ओपेसिटी सबसे उत्तम मानी जाती है। इससे वॉटरमार्क साफ दिखाई भी देता है और नीचे लिखे मुख्य टेक्स्ट को पढ़ने या प्रिंट करने में कोई परेशानी नहीं होती।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या वॉटरमार्क लगाने के बाद पीडीएफ का साइज बहुत बड़ा हो जाता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, क्योंकि वॉटरमार्क केवल एक वेक्टर टेक्स्ट लेयर के रूप में जुड़ता है, जिससे फाइल साइज में मात्र कुछ किलोबाइट्स का ही अंतर आता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह टूल हिंदी या अन्य भारतीय भाषाओं के टेक्स्ट को सपोर्ट करता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह मानक यूनिकोड आधारित टेक्स्ट को सपोर्ट करता है, जिससे आप हिंदी, अंग्रेजी या किसी भी फॉन्ट में वॉटरमार्क लगा सकते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
