import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate Fitter Tool - मार्कशीट व प्रमाण पत्र A4 पर सेट करें | ExamSewa",
  description: "मार्कशीट, जाति, आय या निवास प्रमाण पत्र की फोटो को मानक A4 पेपर साइज में सही मार्जिन और ओरिएंटेशन के साथ फिट करें। साइबर कैफे व CSC हेतु बेस्ट प्रिंटिंग टूल।",
  keywords: [
    "certificate fitter online",
    "marksheet a4 paper fit",
    "document a4 print setter",
    "certificate printing tool",
    "csc document print helper"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/certificate-fitter",
  },
  openGraph: {
    title: "Certificate Fitter Tool - मार्कशीट व प्रमाण पत्र A4 पर सेट करें | ExamSewa",
    description: "मार्कशीट, जाति, आय या निवास प्रमाण पत्र की फोटो को मानक A4 पेपर साइज में सही मार्जिन और ओरिएंटेशन के साथ फिट करें।",
    url: "https://examsewa.online/tools/certificate-fitter",
    type: "website",
  },
};

export default function CertificateFitterLayout({
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
            Certificate Fitter Tool: मार्कशीट व सरकारी प्रमाण पत्रों को A4 पेपर पर कैसे फिट करें?
          </h1>
          <p className="text-slate-600">
            साइबर कैफे, जन सेवा केंद्र (CSC) और छात्रों के सामने सबसे आम समस्या यह आती है कि जब वे मोबाइल कैमरे से खींची गई मार्कशीट, जाति, आय, निवास या जन्म प्रमाण पत्र की फोटो प्रिंट करते हैं, तो वह या तो A4 पेपर से बाहर कट जाती है या फिर बहुत छोटी और अजीब अनुपात में छपती है। हमारा <strong>Certificate Fitter Tool</strong> आपकी फोटो को अंतरराष्ट्रीय A4 अनुपात (210 × 297 मिमी) में स्वतः अलाइन करता है, जिससे प्रिंटिंग हमेशा सही और पेशेवर दिखती है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>मानक A4 प्रिंट अलाइनमेंट:</strong> यह टूल प्रमाणपत्र को A4 पेज के सटीक भौतिक अनुपात में स्केल करता है, जिससे कोई भी ज़रूरी मोहर या हस्ताक्षर किनारे से नहीं कटता।</li>
            <li><strong>सुरक्षित प्रिंटिंग मार्जिन:</strong> इंकजेट या लेजर प्रिंटर के रोलर्स द्वारा पेज पकड़ने के लिए चारों ओर आवश्यक सुरक्षा मार्जिन स्वतः जोड़ दिया जाता है।</li>
            <li><strong>पोर्ट्रेट और लैंडस्केप मोड्स:</strong> सर्टिफिकेट सीधा हो या चौड़ा, आप एक क्लिक में पेज का ओरिएंटेशन अपनी आवश्यकतानुसार बदल सकते हैं।</li>
            <li><strong>हाई-डेफिनिशन PDF एक्सपोर्ट:</strong> इमेज को संपीड़ित किए बिना 300 DPI के करीब शार्पनेस के साथ सीधे रेडी-टू-प्रिंट PDF या JPG में डाउनलोड करें।</li>
            <li><strong>क्लाइंट-साइड प्राइवेसी:</strong> आपका प्रमाणपत्र या संवेदनशील पहचान पत्र किसी भी सर्वर पर अपलोड नहीं होता; संपूर्ण प्रोसेसिंग आपके डिवाइस की मेमोरी में होती है।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए अपलोड बॉक्स में अपने सर्टिफिकेट या मार्कशीट की साफ फोटो चुनें।</li>
            <li>यदि फोटो तिरछी है, तो रोटेट बटन की मदद से उसे सीधा (90° या 180°) कर लें।</li>
            <li>सर्टिफिकेट के आकार के अनुसार 'Portrait' (सीधा) या 'Landscape' (चौड़ा) विकल्प चुनें।</li>
            <li>स्क्रीन पर A4 शीट का लाइव प्रीव्यू देखें और आवश्यकतानुसार मार्जिन एडजस्ट करें।</li>
            <li>'Download PDF' बटन पर क्लिक करके सीधे प्रिंटर पर भेजें या सेव करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल से पुरानी मुड़ी हुई मार्कशीट का प्रिंट साफ आएगा?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल इमेज के अनुपात को ठीक करता है। यदि आप पहले हमारे Document Scanner टूल से फोटो का पीलापन हटाकर यहाँ लाएँगे, तो प्रिंट बिल्कुल ओरिजिनल जैसा निकलेगा।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                A4 साइज में प्रिंट करने पर क्या फॉन्ट या रोल नंबर फटते हैं?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, यह ओरिजिनल फाइल रेजोल्यूशन को सुरक्षित रखता है जिससे रोल नंबर, बारकोड और क्यूआर कोड स्पष्ट रूप से स्कैन होते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह जन सेवा केंद्र (CSC) संचालकों के लिए मुफ्त है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल सभी जन सेवा केंद्र (VLE) और साइबर कैफे संचालकों के लिए 100% मुफ़्त और असीमित उपयोग हेतु उपलब्ध है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
