import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "राज्य व केंद्रीय सरकारी परीक्षा फोटो, साइन व डाक्यूमेंट गाइड | ExamSewa",
  description: "UP Police, UPSSSC, SSC, RRB रेलवे, MPSC, WBPSC, TNPSC भर्ती परीक्षाओं के लिए फोटो साइज (KB), हस्ताक्षर स्याही, डायमेंशन व डाक्यूमेंट्स के सटीक नियम और ऑनलाइन टूल्स।",
  keywords: [
    "UP Police photo size",
    "SSC photo signature guidelines",
    "RRB railway photo maker",
    "MPSC signature resize",
    "सरकारी फॉर्म फोटो साइज",
    "ऑनलाइन फॉर्म फोटो नियम",
    "ExamSewa exam guide"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/exam-guide",
  },
  openGraph: {
    title: "राज्य व केंद्रीय परीक्षा भर्ती फोटो व साइन गाइड - ExamSewa",
    description: "सभी सरकारी भर्ती परीक्षाओं के सटीक फोटो, हस्ताक्षर और दस्तावेज़ नियम एक जगह।",
    url: "https://examsewa.online/tools/exam-guide",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "article",
  },
};

export default function ExamGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "सरकारी परीक्षा फॉर्म के लिए फोटो और हस्ताक्षर कैसे तैयार करें",
    "description": "UP Police, SSC, रेलवे और राज्य PSC परीक्षाओं के लिए सही KB साइज और डायमेंशन में फोटो-साइन तैयार करने की गाइड।",
    "step": [
      {
        "@type": "HowToStep",
        "name": "परीक्षा के नियम देखें",
        "text": "अपनी परीक्षा (UP Police, SSC, RRB आदि) का चयन करके उसके निर्धारित फोटो व साइन KB साइज और बैकग्राउंड की जांच करें।"
      },
      {
        "@type": "HowToStep",
        "name": "संबंधित ऑनलाइन टूल खोलें",
        "text": "एक क्लिक में दिए गए टूल लिंक पर जाएं और अपनी फोटो या हस्ताक्षर अपलोड करें।"
      },
      {
        "@type": "HowToStep",
        "name": "सटीक साइज में डाउनलोड करें",
        "text": "निर्धारित चौड़ाई, ऊंचाई और KB में क्रॉप या रिसाइज करके सीधे फॉर्म में अपलोड करने के लिए सुरक्षित करें।"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {children}
    </>
  );
}
