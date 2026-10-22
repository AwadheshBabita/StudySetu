import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Govt Exam Photo & Signature Presets - सभी भर्ती परीक्षाओं के साइज | ExamSewa",
  description: "SSC, UPSC, Railway RRB, State Police, Banking और Defence परीक्षाओं के रेडीमेड फोटो, सिग्नेचर व डॉक्यूमेंट साइज प्रीसेट्स। एक क्लिक में आधिकारिक माप और KB दायरा लोड करें।",
  keywords: [
    "govt exam photo presets",
    "sarkari exam photo signature size list",
    "ssc photo size preset",
    "railway rrb photo dimension template",
    "up police constable photo size preset",
    "all exam photo signature dimensions",
    "exam photo resize preset online",
    "govt job document size chart",
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/exam-presets",
  },
  openGraph: {
    title: "Govt Exam Photo & Signature Presets - सभी भर्ती परीक्षाओं के साइज | ExamSewa",
    description: "SSC, UPSC, Railway, Police व Banking परीक्षाओं के रेडीमेड फोटो व सिग्नेचर साइज प्रीसेट्स। एक क्लिक में आधिकारिक माप सेट करें।",
    url: "https://examsewa.online/tools/exam-presets",
    type: "website",
  },
};

export default function ExamPresetsLayout({
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
            Govt Exam Photo & Signature Presets: सभी भर्ती परीक्षाओं के रेडीमेड साइज चार्ट व टेम्पलेट्स
          </h1>
          <p className="text-slate-600">
            जब कोई अभ्यर्थी या साइबर कैफे संचालक अलग-अलग सरकारी नौकरियों के ऑनलाइन आवेदन भरता है, तो सबसे बड़ी परेशानी यह होती है कि हर परीक्षा आयोग के नियम अलग-अलग होते हैं। SSC में फोटो 20 KB से 50 KB और साइन 10 KB से 20 KB माँगे जाते हैं; वहीं Railway RRB में फोटो 30 KB से 70 KB की सीमा में होनी चाहिए; UP Police में बैकग्राउंड सफेद या ग्रे होना अनिवार्य है; और UPSC में विशिष्ट पिक्सल चौड़ाई व ऊँचाई की शर्त होती है। इन सभी अलग-अलग मापों को याद रखने या बार-बार नोटिफिकेशन खोजने की आवश्यकता को समाप्त करने के लिए ExamSewa का <strong>Govt Exam Presets Tool</strong> भारत की 50 से अधिक प्रमुख भर्ती परीक्षाओं के रेडीमेड आधिकारिक टेम्पलेट्स प्रदान करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख तकनीकी विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>50+ प्रमुख परीक्षाओं के प्रीसेट्स:</strong> SSC (CGL, CHSL, MTS, GD), UPSC (Civil Services, NDA, CDS), Railway (RRB ALP, Technician, NTPC, Group D), UP Police, Bihar RTPS, CTET, NTA NEET/JEE आदि के आधिकारिक नियम एक सूची में उपलब्ध।</li>
            <li><strong>वन-क्लिक ऑटो कॉन्फ़िगरेशन:</strong> बस अपनी लक्षित परीक्षा का नाम चुनें—टूल अपने आप उस परीक्षा के लिए आवश्यक पिक्सल चौड़ाई, ऊँचाई, आस्पेक्ट रेशियो और अधिकतम/न्यूनतम KB सीमा सेट कर देता है।</li>
            <li><strong>नवीनतम भर्ती नोटिफिकेशन अनुसार अपडेटेड:</strong> सभी प्रीसेट्स भर्ती बोर्डों के वर्तमान विज्ञापनों और दिशा-निर्देशों के अनुसार नियमित रूप से अपडेट किए जाते हैं।</li>
            <li><strong>रिजेक्शन एरर से 100% सुरक्षा:</strong> पोर्टल पर 'Invalid Image Resolution' या 'File Size Out of Range' जैसे तकनीकी एरर आने की कोई संभावना नहीं रहती।</li>
            <li><strong>फोटो और सिग्नेचर दोनों का सपोर्ट:</strong> एक ही स्क्रीन पर पहले फोटो और फिर सिग्नेचर का प्रीसेट चुनकर कुछ ही सेकंड्स में दोनों फाइलें तैयार करें।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            स्टेप-बाय-स्टेप उपयोग का तरीका (How to Use):
          </h2>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
            <li>ऊपर दी गई ड्रॉपडाउन सूची में से उस सरकारी परीक्षा को चुनें जिसका ऑनलाइन फॉर्म आप भर रहे हैं।</li>
            <li>अपनी पासपोर्ट फोटो या हस्ताक्षर की इमेज फाइल अपलोड करें।</li>
            <li>टूल स्वतः उस परीक्षा के लिए तय पिक्सल और फाइल साइज सेटिंग्स लागू कर देगा।</li>
            <li>लाइव प्रिव्यू बॉक्स में देखें कि फोटो का क्रॉप और अनुपात सही है या नहीं।</li>
            <li>'Process & Download' बटन पर क्लिक करके तैयार फाइल सीधे डाउनलोड करें और अपने फॉर्म में अपलोड करें।</li>
          </ol>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                यदि मेरी लक्षित परीक्षा इस लिस्ट में न मिले तो क्या करें?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                यदि आपकी कोई विशिष्ट राज्य परीक्षा लिस्ट में नहीं है, तो आप 'Custom Mode' चुनकर नोटिफिकेशन में दिए गए पिक्सल और KB सीधे दर्ज कर सकते हैं या हमारे Exact KB Compressor का उपयोग कर सकते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या यह प्रीसेट फोटो पर नाम और तारीख (DOP) भी जोड़ता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, जिन परीक्षाओं (जैसे SSC या व्यापम) में नाम और DOP अनिवार्य होता है, वहाँ यह टूल अपने आप नीचे टेक्स्ट पट्टी जोड़ने का विकल्प सक्रिय कर देता है।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                क्या इस टूल का उपयोग मोबाइल फोन पर किया जा सकता है?
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह टूल मोबाइल और कंप्यूटर दोनों स्क्रीन्स पर बिना किसी ऐप डाउनलोड के पूरी तरह सुचारू और तेज़ काम करता है।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
