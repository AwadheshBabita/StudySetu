import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Name & Date Maker - फोटो पर नाम और तारीख (DOP) लिखें | ExamSewa",
  description: "SSC, व्यापम, रेलवे व सरकारी भर्ती फॉर्म्स हेतु अपनी पासपोर्ट फोटो के नीचे सफेद पट्टी पर उम्मीदवार का नाम और फोटो खींचने की तारीख (DOP) जोड़ें। 100% सटीक आयोग नियमों अनुसार।",
  keywords: [
    "photo name date maker online",
    "dop photo editor",
    "add name and date on passport photo",
    "photo par naam aur date kaise likhe",
    "ssc photo name and date generator",
    "passport photo date of photo maker",
    "online name date photo maker for govt exam",
    "dop photo online generator free"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/photo-name-date",
  },
  openGraph: {
    title: "Photo Name & Date Maker - फोटो पर नाम और तारीख (DOP) लिखें | ExamSewa",
    description: "सरकारी भर्ती फॉर्म्स हेतु अपनी पासपोर्ट फोटो के नीचे सफेद पट्टी पर नाम और फोटो की तारीख (DOP) जोड़ें।",
    url: "https://examsewa.online/tools/photo-name-date",
    type: "website",
  },
};

export default function PhotoNameDateLayout({
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
            Photo Name & Date Maker: सरकारी भर्ती फॉर्म के लिए फोटो पर नाम और तारीख (DOP) कैसे लिखें?
          </h1>
          <p className="text-slate-600">
            कर्मचारी चयन आयोग (SSC), राज्य व्यावसायिक परीक्षा मंडल (व्यापम / MP ESB), और कई अन्य सरकारी भर्ती बोर्डों के आधिकारिक नोटिफिकेशन में यह सख्त नियम होता है कि अपलोड की जाने वाली पासपोर्ट साइज फोटो के निचले हिस्से पर उम्मीदवार का नाम और जिस दिन फोटो खिंचवाई गई है वह तारीख यानी <strong>DOP (Date of Photo)</strong> स्पष्ट रूप से छपी होनी चाहिए। यदि अभ्यर्थी बिना नाम/तारीख की साधारण फोटो अपलोड कर देते हैं या हाथ से पेन से लिखकर फोटो खींचते हैं, तो उनका आवेदन पत्र बिना किसी पूर्व सूचना के निरस्त (Reject) कर दिया जाता है। ExamSewa का <strong>Photo Name & Date Maker Tool</strong> आपकी साधारण पासपोर्ट फोटो के नीचे एक पेशेवर सफेद पट्टी जोड़कर आधिकारिक काले अक्षरों में आपका नाम और तारीख कुछ ही सेकंड्स में सेट कर देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>ऑटोमैटिक वाइट टेक्स्ट बार (Solid White Strip):</strong> फोटो के निचले हिस्से में बिना चेहरे या ठोड़ी को काटे एक साफ सफेद पट्टी जोड़ी जाती है जो आयोग के मानकों के 100% अनुकूल होती है।</li>
            <li><strong>मानक बोल्ड टाइपोग्राफी:</strong> सरकारी पोर्टल की जांच मशीनों और अधिकारियों द्वारा आसानी से पढ़े जाने वाले स्पष्ट और गहरे काले (Bold Black) फॉन्ट का उपयोग।</li>
            <li><strong>कस्टम नाम व DOP तारीख इनपुट:</strong> अपना पूरा नाम और कैलेंडर से तारीख चुनें; टूल अपने आप उसे 'DOP: DD/MM/YYYY' के मानक फॉर्मेट में अलाइन करता है।</li>
            <li><strong>3.5 × 4.5 सेमी अनुपात सुरक्षा:</strong> नीचे पट्टी जोड़ने के बाद भी फोटो का समग्र पासपोर्ट अनुपात नहीं बिगड़ता, जिससे अपलोड के समय 'Aspect Ratio' एरर नहीं आता।</li>
            <li><strong>100% सुरक्षित और प्राइवेट:</strong> पूरी इमेज एडिटिंग सीधे आपके फोन या कंप्यूटर के वेब ब्राउज़र में होती है; कोई भी फोटो किसी सर्वर पर अपलोड नहीं की जाती।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दिए गए बॉक्स में अपनी पासपोर्ट साइज फोटो अपलोड करें।</li>
            <li>'Candidate Name' बॉक्स में अपना वही नाम लिखें जो आपके 10वीं के प्रमाणपत्र में दर्ज है।</li>
            <li>'Date of Photo (DOP)' बॉक्स में फोटो खिंचवाने की तारीख दर्ज करें (ध्यान रहे तारीख नोटिफिकेशन से 3 महीने के भीतर की हो)।</li>
            <li>स्क्रीन पर लाइव प्रिव्यू में देखें कि नाम और तारीख सफेद पट्टी पर बिल्कुल साफ दिख रहे हैं या नहीं।</li>
            <li>'Generate & Download Photo' बटन पर क्लिक करके तैयार फाइल को JPG फॉर्मेट में तुरंत डाउनलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                फोटो पर जन्मतिथि (DOB) लिखनी चाहिए या फोटो की तारीख (DOP)?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                यह सबसे आम गलती है। भर्ती आयोग हमेशा 'फोटो खिंचवाने की तारीख' (Date of Photo - DOP) मांगते हैं, न कि जन्मतिथि (DOB)। जन्मतिथि लिखने पर फॉर्म रिजेक्ट हो सकता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                तारीख कितनी पुरानी होनी चाहिए?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                सामान्य नियमानुसार DOP फॉर्म भरने की अंतिम तारीख से अधिकतम 3 महीने पहले तक की होनी चाहिए। उससे ज्यादा पुरानी तारीख डालने से बचें।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह टूल फोटो को 20 KB से 50 KB के साइज में भी रखता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल फाइल को वेब ऑप्टिमाइज़ करके डाउनलोड करता है। यदि आपको बिल्कुल फिक्स साइज चाहिए, तो इसे डाउनलोड करने के बाद हमारे 'Exact KB Compressor' से 40 KB पर लॉक कर सकते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
