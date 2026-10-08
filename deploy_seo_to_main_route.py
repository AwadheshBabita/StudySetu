import os, shutil

target_dir = "src/app/tools/id-card-joiner"
os.makedirs(target_dir, exist_ok=True)

# 1. डेमो पेज से सारा तैयार और टेस्ट किया हुआ क्लाइंट कोड लेना
with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    client_code = f.read()

# इसे IdCardJoinerClient कंपोनेंट में बदलना
client_code = client_code.replace("export default function IdCardJoinerDemoPage()", "export default function IdCardJoinerClient()")

with open(os.path.join(target_dir, "IdCardJoinerClient.tsx"), "w", encoding="utf-8") as f:
    f.write(client_code)

# 2. उसी रूट पर असली SEO Server page.tsx तैयार करना
seo_page_code = """import type { Metadata } from "next";
import IdCardJoinerClient from "./IdCardJoinerClient";

export const metadata: Metadata = {
  title: "ID Card Joiner Online - आधार, पैन, वोटर कार्ड A4 पर दोनों साइड जोड़ें",
  description: "आधार कार्ड, पैन कार्ड या किसी भी आईडी कार्ड के आगे और पीछे (Front & Back) के भाग को एक ही A4 शीट पर सीधे जोड़ें। ऑटो क्रॉप, मैजिक कलर एन्हांस और कस्टम KB में JPG/PDF डाउनलोड करें।",
  keywords: [
    "id card joiner online",
    "aadhar card front back join a4",
    "pan card both sides print tool",
    "id card a4 printing online",
    "smart id card scanner examsewa",
    "id card 100kb download"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/id-card-joiner",
  },
  openGraph: {
    title: "ID Card Joiner Online - दोनों साइड का कार्ड A4 पर सेट करें",
    description: "आईडी कार्ड के दोनों हिस्सों को मोबाइल से स्कैन व क्रॉप करके एक ही A4 पेज पर अगल-बगल या ऊपर-नीचे प्रिंट के लिए तैयार करें।",
    url: "https://examsewa.online/tools/id-card-joiner",
    type: "website",
  },
};

export default function IdCardJoinerPage() {
  return (
    <main className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* मुख्य इंटरेक्टिव आईडी कार्ड टूल */}
      <IdCardJoinerClient />

      {/* नीचे गूगल रैंकिंग और यूज़र गाइड के लिए SEO सामग्री */}
      <section className="w-full max-w-3xl mx-auto px-4 py-10 space-y-8 text-slate-800 border-t border-slate-200 mt-6 bg-white/70 rounded-3xl mb-12 shadow-xs">
        <article className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
          <h1 className="text-lg sm:text-xl font-black text-slate-900 border-b pb-2">
            ID Card Joiner Online: A4 शीट पर दोनों साइड का कार्ड कैसे जोड़ें?
          </h1>
          <p className="text-slate-600">
            सरकारी कार्यों, फॉर्म भरने या प्रिंट आउट निकालने के लिए अक्सर हमें आधार कार्ड, पैन कार्ड, ड्राइविंग लाइसेंस या वोटर आईडी के दोनों हिस्सों (Front और Back) को एक ही पेज पर सेट करना पड़ता है। यह ऑनलाइन टूल बिना किसी भारी सॉफ़्टवेयर (जैसे Photoshop) के, सीधे आपके मोबाइल ब्राउज़र में कुछ ही सेकंड में दोनों साइड्स को मानक A4 पेपर पर सेट कर देता है।
          </p>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            इस टूल की प्रमुख विशेषताएँ:
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li><strong>स्मार्ट 4-कॉर्नर क्रॉपर:</strong> तिरछी या किसी भी कोण से खींची गई तस्वीर को सीधा व समतल करता है।</li>
            <li><strong>मैजिक कलर (Auto Enhance):</strong> कैमरे की छाया और मटमैलेपन को हटाकर कागज़ को दूध जैसा सफ़ेद और अक्षरों को क्रिस्प बनाता है।</li>
            <li><strong>लेआउट विकल्प:</strong> कार्ड्स को मानक <em>अगल-बगल</em> या <em>ऊपर-नीचे</em> अपनी ज़रूरत के अनुसार सेट करें।</li>
            <li><strong>परफेक्ट फाइल साइज़ (KB कंट्रोल):</strong> 10 KB से 300 KB प्रीसेट्स और कस्टम स्लाइडर से सरकारी पोर्टल्स के लिए मनचाहा साइज़ तैयार करें।</li>
            <li><strong>डायरेक्ट शेयर व प्रिंट:</strong> सीधे WhatsApp पर भेजें या हाई-क्वालिटी JPG व A4 PDF डाउनलोड करें।</li>
          </ul>

          <h2 className="text-sm sm:text-base font-bold text-slate-900 pt-2">
            अक्सर पूछे जाने वाले सवाल (FAQs)
          </h2>
          <div className="space-y-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs">क्या मेरी तस्वीरें या दस्तावेज़ सर्वर पर सेव होते हैं?</h3>
              <p className="text-slate-600 text-[11px] mt-1">नहीं, सारी प्रोसेसिंग पूरी तरह आपके ब्राउज़र (डिवाइस) के अंदर होती है। आपका डेटा 100% सुरक्षित और निजी रहता है।</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-xs">क्या प्रिंट निकालने पर कार्ड का साइज़ ओरिजिनल जैसा रहेगा?</h3>
              <p className="text-slate-600 text-[11px] mt-1">हाँ, यह टूल मानक 85.6mm × 54mm अनुपात (असली आईडी कार्ड साइज़) को A4 शीट पर सही अनुपात में प्लेस करता है।</p>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
"""

with open(os.path.join(target_dir, "page.tsx"), "w", encoding="utf-8") as f:
    f.write(seo_page_code)

print("DEPLOYED_TO_MAIN_ID_CARD_JOINER_ROUTE_SUCCESS")
