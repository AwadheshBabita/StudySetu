import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Password Protect Online - PDF फाइल पर पासवर्ड लगाएं | ExamSewa",
  description: "अपने संवेदनशील दस्तावेजों, मार्कशीट्स, आधार कार्ड व पहचान पत्रों की PDF फाइलों को मजबूत पासवर्ड से सुरक्षित करें। 128-बिट व 256-बिट क्लाइंट-साइड AES एन्क्रिप्शन। 100% सुरक्षित व मुफ़्त।",
  keywords: [
    "pdf password protect online",
    "add password to pdf free",
    "lock pdf file online",
    "pdf me password kaise lagaye",
    "secure marksheet pdf with password",
    "protect aadhaar pan pdf file",
    "client side pdf encryption tool",
    "free pdf locker online",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/pdf-password",
  },
  openGraph: {
    title: "PDF Password Protect Online - PDF फाइल पर पासवर्ड लगाएं | ExamSewa",
    description: "संवेदनशील दस्तावेजों, मार्कशीट व पहचान पत्रों की PDF फाइलों पर मजबूत पासवर्ड लगाएं। 100% सुरक्षित।",
    url: "https://examsewa.online/tools/pdf-password",
    type: "website",
  },
};

export default function PdfPasswordLayout({
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
            PDF Password Protect: किसी भी PDF दस्तावेज़ पर पासवर्ड लॉक कैसे लगाएं?
          </h1>
          <p className="text-slate-600">
            डिजिटल युग में आधार कार्ड, पैन कार्ड, बैंक पासबुक, शैक्षिक मार्कशीट, डिग्री सर्टिफिकेट और प्रतियोगी परीक्षाओं के एडमिट कार्ड जैसे महत्वपूर्ण दस्तावेज हम ईमेल, व्हाट्सएप या क्लाउड ड्राइव पर साझा करते हैं। यदि इन संवेदनशील दस्तावेजों को बिना किसी सुरक्षा के खुला छोड़ दिया जाए, तो इनके अनधिकृत उपयोग या डेटा चोरी होने का भारी जोखिम रहता है। ExamSewa का <strong>PDF Password Protect Tool</strong> आपको अपनी किसी भी PDF फाइल में एक मजबूत मास्टर पासवर्ड जोड़ने की सुरक्षित सुविधा देता है। एक बार पासवर्ड लॉक लग जाने के बाद, कोई भी व्यक्ति सही पासवर्ड दर्ज किए बिना उस फाइल को न तो खोल सकता है, न पढ़ सकता है और न ही प्रिंट कर सकता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएं:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>मजबूत AES एन्क्रिप्शन:</strong> मानक 128-बिट और 256-बिट एन्क्रिप्शन प्रोटोकॉल का उपयोग, जिसे आधुनिक कंप्यूटरों या हैकिंग टूल्स द्वारा आसानी से तोड़ा नहीं जा सकता।</li>
            <li><strong>पूर्ण दस्तावेज़ गोपनीयता:</strong> पूरी पासवर्ड एन्क्रिप्शन प्रक्रिया सीधे आपके फोन या कंप्यूटर के वेब ब्राउज़र में संपन्न होती है; आपकी मूल फाइल या पासवर्ड किसी रिमोट सर्वर पर नहीं भेजा जाता।</li>
            <li><strong>यूनिवर्सल पीडीएफ कम्पैटिबिलिटी:</strong> इस टूल से लॉक की गई फाइलें एडोब एक्रोबैट (Adobe Acrobat), गूगल क्रोम, मोज़िला फ़ायरफ़ॉक्स, एंड्रॉयड व आईफोन के सभी मानक पीडीएफ व्यूअर्स में सहजता से पासवर्ड मांगकर खुलती हैं।</li>
            <li><strong>ओरिजिनल क्वालिटी सुरक्षा:</strong> पासवर्ड लगाने से मूल दस्तावेज के अक्षरों, डिजिटल हस्ताक्षर, बारकोड या मुहर की गुणवत्ता में रत्ती भर भी गिरावट नहीं आती।</li>
            <li><strong>100% मुफ़्त और असीमित:</strong> बिना किसी रजिस्ट्रेशन, ईमेल लॉगिन या दैनिक सीमा के जितनी चाहें उतनी फाइलों को सुरक्षित करें।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में 'Select PDF File' पर क्लिक करके अपनी लॉक की जाने वाली फाइल चुनें।</li>
            <li>'Enter Password' बॉक्स में अपना इच्छित पासवर्ड टाइप करें।</li>
            <li>'Confirm Password' बॉक्स में पुष्टि के लिए वही पासवर्ड दोबारा दर्ज करें।</li>
            <li>'Protect PDF' बटन पर क्लिक करें—एन्क्रिप्शन प्रक्रिया एक सेकंड से भी कम समय में पूरी हो जाएगी।</li>
            <li>'Download Protected PDF' पर क्लिक करके अपनी पासवर्ड-प्रोटेक्टेड फाइल सुरक्षित करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                यदि मैं अपना सेट किया हुआ पासवर्ड भूल जाऊं तो क्या फाइल रिकवर हो सकती है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                एन्क्रिप्शन मानकों की सुरक्षा के कारण बिना पासवर्ड के फाइल को दोबारा खोलना संभव नहीं होता। इसलिए हमेशा ऐसा पासवर्ड चुनें जिसे आप याद रख सकें या कहीं सुरक्षित नोट कर लें।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या पासवर्ड लगाने से फाइल का साइज बढ़ जाता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                नहीं, केवल कुछ बाइट्स का सुरक्षा हेडर जुड़ता है, जिससे फाइल साइज में लगभग न के बराबर (0.1% से भी कम) परिवर्तन होता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या भविष्य में इस पासवर्ड को हटाया भी जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यदि आपके पास सही पासवर्ड है, तो आप हमारे 'PDF Unlock' टूल का उपयोग करके पासवर्ड को हटाकर फाइल को सामान्य पीडीएफ में बदल सकते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
