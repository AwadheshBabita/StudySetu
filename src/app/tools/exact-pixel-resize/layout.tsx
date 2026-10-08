import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exact Pixel Resizer - Width x Height पिक्सल में फोटो बदलें | ExamSewa",
  description: "अपनी फोटो या सिग्नेचर को निश्चित पिक्सल डायमेंशन (जैसे 200x230, 140x60, 350x450 पिक्सल) में बदलें। सरकारी परीक्षा पोर्टल्स के 'Invalid Dimensions' एरर से 100% सुरक्षा।",
  keywords: [
    "exact pixel resizer",
    "photo width height pixel resize",
    "photo resize 200x230 online",
    "signature 140x60 pixel converter",
    "change image pixel dimensions",
    "online pixel resizer for govt exams",
    "ssc upsc photo pixel editor",
    "custom width height image resize"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/exact-pixel-resize",
  },
  openGraph: {
    title: "Exact Pixel Resizer - Width x Height पिक्सल में फोटो बदलें | ExamSewa",
    description: "अपनी फोटो या सिग्नेचर को निश्चित पिक्सल डायमेंशन में बदलें। सरकारी परीक्षा पोर्टल्स के इनवैलिड डायमेंशन एरर से पूरी सुरक्षा।",
    url: "https://examsewa.online/tools/exact-pixel-resize",
    type: "website",
  },
};

export default function ExactPixelResizeLayout({
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
            Exact Pixel Resizer: चौड़ाई और ऊँचाई (Width x Height) पिक्सल में फोटो कैसे बदलें?
          </h1>
          <p className="text-slate-600">
            सरकारी नौकरियों (जैसे UPSC, SSC, IBPS, State PSC, NTA NEET/JEE) और विश्वविद्यालयों के ऑनलाइन आवेदन फॉर्म में अक्सर फोटो के केवल KB पर ही नहीं, बल्कि सटीक पिक्सल डायमेंशन (Pixel Width & Height) पर भी सख्त रोक होती है। उदाहरण के लिए, कई पोर्टल्स पर फोटो के लिए <em>200 × 230 पिक्सल</em> और हस्ताक्षर के लिए <em>140 × 60 पिक्सल</em> अनिवार्य होते हैं। यदि आपकी फोटो का साइज एक पिक्सल भी कम या ज्यादा हो जाए, तो पोर्टल तुरंत <strong>'Invalid Image Dimensions'</strong> या <strong>'Image Resolution Not Matched'</strong> का एरर फेंक देता है। हमारा <strong>Exact Pixel Resizer</strong> आपकी तस्वीर को बिना किसी जटिल फोटो एडिटिंग सॉफ्टवेयर के बिल्कुल सटीक पिक्सल माप में बदल देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>सटीक चौड़ाई व ऊँचाई इनपुट (Exact Width & Height):</strong> आप मैन्युअल रूप से अपनी ज़रूरत के पिक्सल सीधे टाइप कर सकते हैं, जिससे पोर्टल पर रिजेक्शन की शून्य संभावना रहती है।</li>
            <li><strong>आस्पेक्ट रेशियो लॉक व अनलॉक (Aspect Ratio Control):</strong> यदि आपको तस्वीर का स्वाभाविक अनुपात बनाए रखना है तो रेशियो लॉक रखें, और यदि पोर्टल ने सख्त विषम माप (जैसे 200x230) माँगा है तो रेशियो अनलॉक करके जबरन उस माप में फिट करें।</li>
            <li><strong>परीक्षा रेडीमेड प्रीसेट्स:</strong> लोकप्रिय भर्ती पोर्टलों के मानक पिक्सल साइज (138x177, 200x230, 350x450, 140x60) एक क्लिक में लोड करने की सुविधा।</li>
            <li><strong>शार्पनेस रिटेंशन:</strong> पिक्सल बदलते समय चेहरे के नैन-नक्श और सिग्नेचर की स्याही को धुंधला होने से बचाने के लिए स्मार्ट बाइलीनियर इंटरपोलेशन तकनीक।</li>
            <li><strong>100% प्राइवेट व सुरक्षित:</strong> पूरी इमेज प्रोसेसिंग आपके ब्राउज़र के भीतर होती है, कोई भी डेटा या फोटो सर्वर पर स्टोर नहीं किया जाता।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में अपनी फोटो या सिग्नेचर फाइल अपलोड करें।</li>
            <li>'Width (चौड़ाई)' और 'Height (ऊँचाई)' बॉक्स में नोटिफिकेशन में दिए गए आवश्यक पिक्सल दर्ज करें (उदा. फोटो हेतु 200 चौड़ाई और 230 ऊँचाई)।</li>
            <li>यदि पोर्टल ने बिल्कुल फिक्स माप माँगा है, तो 'Keep Aspect Ratio' को अनचेक कर दें ताकि फोटो ठीक उसी माप में बदले।</li>
            <li>'Resize Image' बटन दबाएँ और लाइव प्रीव्यू देखें।</li>
            <li>'Download Image' पर क्लिक करके अपनी तैयार JPG/PNG फाइल डाउनलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                आस्पेक्ट रेशियो अनलॉक करने पर क्या चेहरा खिंचा हुआ (Stretch) दिखेगा?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                यदि आपकी मूल फोटो पहले से पासपोर्ट अनुपात (3.5x4.5 सेमी) के करीब है, तो 200x230 पिक्सल में बदलने पर कोई खिंचाव महसूस नहीं होगा। बहुत चौड़ी या लंबी फोटो को पहले क्रॉप कर लेना बेहतर होता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या पिक्सल बदलने से फाइल का KB साइज भी बदलता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, पिक्सल कम करने पर फाइल का KB साइज भी स्वतः कम हो जाता है। यदि इसके बाद भी फाइल का KB एडजस्ट करना हो, तो आप हमारे Exact KB Compressor का उपयोग कर सकते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                हस्ताक्षर (Signature) के लिए सबसे सामान्य पिक्सल माप क्या होता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                अधिकांश प्रतियोगी परीक्षाओं (SSC, IBPS, UPSC) में हस्ताक्षर के लिए 140 पिक्सल चौड़ाई और 60 पिक्सल ऊँचाई (या 160x70 पिक्सल) का मानक उपयोग किया जाता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
