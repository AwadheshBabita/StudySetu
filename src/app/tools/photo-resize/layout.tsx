import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Photo Resizer - पासपोर्ट फोटो साइज व पिक्सल बदलें | ExamSewa",
  description: "अपनी पासपोर्ट साइज फोटो को सेंटीमीटर (3.5x4.5 सेमी), पिक्सल (200x230 px) या इंच में सटीक रूप से रीसाइज़ करें। सरकारी प्रतियोगी परीक्षाओं (SSC, UPSC, Railway, Police) हेतु 100% सटीक और सुरक्षित।",
  keywords: [
    "photo resizer online",
    "photo resize in kb and cm",
    "passport size photo resize 3.5x4.5",
    "photo resize for ssc upsc railway",
    "online picture dimension converter",
    "photo height width resize online",
    "crop and resize passport photo free",
    "sarkari photo resizer tool"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/photo-resizer",
  },
  openGraph: {
    title: "Online Photo Resizer - पासपोर्ट फोटो साइज व पिक्सल बदलें | ExamSewa",
    description: "अपनी पासपोर्ट फोटो को सेंटीमीटर, पिक्सल या इंच में सटीक रूप से रीसाइज़ करें। सरकारी प्रतियोगी परीक्षाओं हेतु 100% सुरक्षित।",
    url: "https://examsewa.online/tools/photo-resizer",
    type: "website",
  },
};

export default function PhotoResizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* SEO Guide Article Container */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            Online Photo Resizer: सरकारी नौकरी और प्रतियोगी परीक्षाओं हेतु फोटो का साइज कैसे बदलें?
          </h1>
          <p className="text-slate-600">
            सरकारी भर्तियों (जैसे SSC CGL/CHSL, UPSC सिविल सेवा, Railway RRB, State Police, Banking IBPS) और विश्वविद्यालय प्रवेश परीक्षाओं के ऑनलाइन आवेदन भरते समय फोटो का सही आकार होना सबसे पहली शर्त होती है। हर भर्ती आयोग अपनी गाइडलाइन में फोटो के आयाम (Dimensions) अलग-अलग इकाइयों में मांगता है—कोई <em>3.5 सेमी × 4.5 सेमी</em> मांगता है, कोई <em>200 × 230 पिक्सल</em>, तो कोई <em>1.38 × 1.77 इंच</em>। साधारण क्रॉपिंग टूल्स में यूनिट बदलने की सुविधा न होने के कारण अक्सर फोटो स्ट्रेच (खिंची हुई) या धुंधली हो जाती है। ExamSewa का <strong>Online Photo Resizer Tool</strong> आपको सेंटीमीटर, मिलीमीटर, इंच और पिक्सल—चारों प्रमुख इकाइयों में अपनी फोटो को बिना चेहरा बिगाड़े बिल्कुल सटीक अनुपात में रीसाइज़ करने की पूरी सुविधा प्रदान करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>मल्टी-यूनिट डायमेंशन सपोर्ट (cm, mm, inch, px):</strong> अपनी परीक्षा नोटिफिकेशन के अनुसार सीधे माप चुनें—चाहे वह सेंटीमीटर हो, मिलीमीटर हो या पिक्सल।</li>
            <li><strong>इंटेलिजेंट आस्पेक्ट रेशियो लॉक:</strong> चेहरे और सिर के स्वाभाविक अनुपात को सुरक्षित रखता है ताकि फोटो न तो चपटी दिखे और न ही खिंची हुई।</li>
            <li><strong>मानक पासपोर्ट प्रीसेट्स:</strong> भारतीय पासपोर्ट/परीक्षा मानक (3.5×4.5 cm), पैन कार्ड (2.5×3.5 cm), और यूएस वीजा (2×2 inch) के एक-क्लिक रेडीमेड मोड्स।</li>
            <li><strong>फाइल साइज ऑप्टिमाइज़ेशन (KB Control):</strong> रीसाइज़िंग के साथ-साथ फाइल के डिजिटल वजन को 20 KB से 50 KB के सुरक्षित दायरे में बनाए रखने की सुविधा।</li>
            <li><strong>100% क्लाइंट-साइड सुरक्षा:</strong> इमेज प्रोसेसिंग पूरी तरह आपके डिवाइस के ब्राउज़र में होती है, कोई भी फोटो किसी सर्वर पर अपलोड नहीं की जाती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में अपनी पासपोर्ट फोटो अपलोड करें।</li>
            <li>माप की इकाई (Unit) चुनें—जैसे Pixels (px) या Centimeters (cm)।</li>
            <li>'Width' (चौड़ाई) और 'Height' (ऊँचाई) बॉक्स में आवश्यक माप दर्ज करें (उदा. 3.5 और 4.5 सेमी)।</li>
            <li>क्रॉप बॉक्स को ड्रैग करके चेहरे और कंधों को सही केंद्र में सेट करें।</li>
            <li>'Resize Image' पर क्लिक करें और लाइव प्रिव्यू की जाँच करें।</li>
            <li>'Download Image' बटन दबाकर तैयार फोटो तुरंत सुरक्षित करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                पासपोर्ट साइज फोटो का मानक सेंटीमीटर और पिक्सल माप क्या होता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                सेंटीमीटर में मानक पासपोर्ट फोटो 3.5 सेमी चौड़ी और 4.5 सेमी ऊँची होती है। डिजिटल पिक्सल में यह आमतौर पर 200 DPI पर लगभग 275×354 पिक्सल या 300 DPI पर 413×531 पिक्सल के बराबर होती है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल से सिग्नेचर (हस्ताक्षर) को भी रीसाइज़ किया जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, आप इकाई में पिक्सल चुनकर चौड़ाई 140 px और ऊँचाई 60 px दर्ज करके अपने हस्ताक्षर को भी आधिकारिक माप में बदल सकते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                रीसाइज़ करने के बाद फोटो की क्लैरिटी कम तो नहीं होगी?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, हमारा रीसाइज़र एडवांस्ड लैनकज़ोस रि-सैंपलिंग (Lanczos Resampling) का उपयोग करता है जिससे पिक्सल रिसाइज के दौरान चेहरे की शार्पनेस पूरी तरह बनी रहती है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
