import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Photo Crop Tool - फोटो क्रॉप करें (पासपोर्ट व फॉर्म साइज) | ExamSewa",
  description: "किसी भी फोटो को तुरंत पासपोर्ट साइज (3.5x4.5 सेमी), चौकोर (1:1), 4:3 या फ्री-फॉर्म में सटीक क्रॉप करें। सरकारी प्रतियोगी परीक्षाओं, कॉलेज एडमिशन व पहचान पत्रों हेतु 100% मुफ़्त व सुरक्षित।",
  keywords: [
    "photo crop online",
    "crop photo for exam form",
    "passport size photo cropper free",
    "photo crop tool online without losing quality",
    "online image cropper for govt exam",
    "mobile photo crop tool free",
    "photo ka size kaise kate",
    "fast passport photo crop online"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/photo-crop",
  },
  openGraph: {
    title: "Online Photo Crop Tool - फोटो क्रॉप करें (पासपोर्ट व फॉर्म साइज) | ExamSewa",
    description: "फोटो को तुरंत पासपोर्ट साइज (3.5x4.5 सेमी) या फ्री-फॉर्म में सटीक क्रॉप करें। 100% मुफ़्त व सुरक्षित।",
    url: "https://examsewa.online/tools/photo-crop",
    type: "website",
  },
};

export default function PhotoCropLayout({
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
            Online Photo Crop Tool: सरकारी परीक्षा फॉर्म के लिए फोटो को सही अनुपात में कैसे क्रॉप करें?
          </h1>
          <p className="text-slate-600">
            सरकारी भर्ती परीक्षाओं (जैसे SSC, UPSC, Railway, State Police, Banking) या कॉलेज प्रवेश के ऑनलाइन आवेदन भरते समय सबसे पहली जरूरत एक साफ और सही अनुपात में कटी हुई पासपोर्ट फोटो की होती है। उम्मीदवार अक्सर अपने स्मार्टफोन से पूरी फोटो या सेल्फी खींच लेते हैं जिसमें सिर के ऊपर बहुत अधिक खाली जगह, कमर से नीचे का हिस्सा, या अगल-बगल की अनावश्यक वस्तुएं आ जाती हैं। यदि ऐसी बिना क्रॉप की गई फोटो अपलोड की जाती है, तो सिस्टम पर चेहरा बहुत छोटा दिखाई देता है या अनुपात बिगड़ने के कारण आवेदन पत्र अस्वीकार (Reject) हो जाता है। ExamSewa का <strong>Online Photo Crop Tool</strong> आपको बिना किसी जटिल सॉफ्टवेयर के अपनी फोटो में से मुख्य चेहरे और कंधों वाले हिस्से को आधिकारिक <strong>3.5 × 4.5 सेमी</strong> अनुपात में तुरंत क्रॉप करने की सुविधा देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>फिक्स्ड पासपोर्ट आस्पेक्ट रेशियो (Standard 3.5:4.5 Ratio):</strong> क्रॉप बॉक्स का अनुपात सरकारी परीक्षा मानकों के अनुसार लॉक रहता है, जिससे चेहरा कभी खिंचा हुआ या चपटा नहीं दिखता।</li>
            <li><strong>मल्टीपल क्रॉप प्रीसेट्स (1:1, 4:3, 16:9, Freeform):</strong> पासपोर्ट फोटो के अलावा चौकोर प्रोफाइल फोटो, मार्कशीट या अन्य दस्तावेजों के लिए भी तुरंत फ्रेम बदलने की सुविधा।</li>
            <li><strong>शून्य पिक्सल लॉस (Lossless Cropping):</strong> फोटो काटने के बाद चेहरे की चमक, आंखों की पुतली और किनारों की स्पष्टता पूरी तरह बरकरार रहती है ताकि पोर्टल पर 'Blur Photo' का एरर न आए।</li>
            <li><strong>टच-फ्रेंडली स्मूथ कंट्रोल्स:</strong> स्मार्टफोन की स्क्रीन पर उंगलियों से आसानी से क्रॉप बॉक्स को छोटा-बड़ा और स्थानांतरित करने की सुविधा।</li>
            <li><strong>100% क्लाइंट-साइड सुरक्षा:</strong> पूरी इमेज क्रॉपिंग आपके फोन या कंप्यूटर के ब्राउज़र में प्रोसेस होती है; आपकी निजी फोटो किसी बाहरी सर्वर पर अपलोड नहीं की जाती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'Select Photo' पर क्लिक करके अपने डिवाइस से मूल फोटो अपलोड करें।</li>
            <li>अपनी आवश्यकता के अनुसार 'Passport (3.5:4.5)' या कोई अन्य क्रॉप रेशियो चुनें।</li>
            <li>क्रॉप ग्रिड को इस तरह व्यवस्थित करें कि सिर से लेकर कंधों तक का हिस्सा (लगभग 70-80% फेस कवरेज) फ्रेम के अंदर आ जाए।</li>
            <li>'Crop Image' बटन पर क्लिक करके कटे हुए हिस्से का लाइव प्रीव्यू देखें।</li>
            <li>'Download Cropped Photo' पर क्लिक करके तैयार फाइल को JPG फॉर्मेट में तुरंत सुरक्षित करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                पासपोर्ट फोटो क्रॉप करते समय चेहरा कितना बड़ा दिखना चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                आधिकारिक नियमों के अनुसार, चेहरे का हिस्सा (सिर के ऊपर से ठोड़ी तक) फोटो के कुल फ्रेम का लगभग 70% से 80% हिस्सा कवर करना चाहिए, और दोनों कान साफ दिखने चाहिए।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या क्रॉप करने से फोटो की क्वालिटी खराब होती है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, यह टूल केवल चुने गए हिस्से को बिना किसी अनावश्यक कंप्रेशन के मूल रिज़ॉल्यूशन पर काटता है, जिससे क्लैरिटी पूरी तरह सुरक्षित रहती है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्रॉप करने के बाद इसका फाइल साइज (20KB - 50KB) कैसे सेट करें?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                यहाँ से क्रॉप की गई फोटो को डाउनलोड करने के बाद आप हमारे 'Exact KB Compressor' या 'Quick Compress' टूल का उपयोग करके मनचाहा साइज (जैसे 40 KB) आसानी से पा सकते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
