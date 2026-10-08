import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Age Calculator for Govt Exams - उम्र की सटीक गणना | ExamSewa",
  description: "सरकारी नौकरी के फॉर्म भरने के लिए किसी भी कट-ऑफ तारीख पर अपनी सही उम्र (वर्ष, माह, दिन) मिनटों में निकालें।",
  keywords: [
    "age calculator for govt exams",
    "online age calculator",
    "dob to cutoff age calculate",
    "sarkari exam age calculator"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/age-calculator",
  },
  openGraph: {
    title: "Online Age Calculator for Govt Exams - उम्र की सटीक गणना | ExamSewa",
    description: "सरकारी नौकरी के फॉर्म भरने के लिए किसी भी कट-ऑफ तारीख पर अपनी सही उम्र (वर्ष, माह, दिन) मिनटों में निकालें।",
    url: "https://examsewa.online/tools/age-calculator",
    type: "website",
  },
};

export default function AgeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* SEO Guide Article Container (आईडी कार्ड जॉइनर जैसा फुल कंटेंट) */}
      <section className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-8 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-5">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            Online Age Calculator: सरकारी फॉर्म के लिए सही उम्र (वर्ष, माह, दिन) कैसे निकालें?
          </h1>
          <p className="text-slate-600">
            सरकारी भर्तियों (SSC, UPSC, Railway, Police, Banking) के नोटिफिकेशन में हमेशा एक निश्चित कट-ऑफ तारीख (जैसे 01 जनवरी या 01 जुलाई) दी होती है। उस तय तारीख पर उम्मीदवार की न्यूनतम उम्र (18 वर्ष) और अधिकतम उम्र की गणना करनी होती है। यह कैलकुलेटर आपकी जन्मतिथि और कट-ऑफ तारीख के आधार पर दिन, महीने और साल की सटीक गणना करता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>सटीक दिन और माह गणना:</strong> लीप ईयर (29 फरवरी) और हर महीने के 30/31 दिनों के गणितीय नियमों के साथ 100% सही परिणाम।</li>
            <li><strong>कट-ऑफ डेट सेलेक्टर:</strong> नोटिफिकेशन में मांगी गई किसी भी खास तारीख को डालकर उम्र निकालने की सुविधा।</li>
            <li><strong>परीक्षा पात्रता जाँच:</strong> तुरंत देखें कि आप परीक्षा के लिए योग्य हैं या ओवरएज/अंडरएज हो रहे हैं।</li>
            <li><strong>तेज़ और बिना विज्ञापन:</strong> तुरंत एक क्लिक में स्पष्ट आयु परिणाम स्क्रीन पर प्राप्त करें।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-3">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">कट-ऑफ तारीख क्या होती है?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                भर्ती आयोग जिस विशेष तारीख को आधार मानकर आपकी उम्र की गणना करता है (जैसे 01-08-2026), उसे कट-ऑफ डेट कहते हैं।
              </p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">क्या यह गणना सरकारी आयोगों में 100% मान्य है?</h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                हाँ, यह वही मानक प्रणाली उपयोग करता है जो कर्मचारी चयन आयोग और अन्य भर्ती बोर्ड इस्तेमाल करते हैं।
              </p>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
