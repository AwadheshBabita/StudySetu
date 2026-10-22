import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF & JPG Converter Online | मुफ़्त वर्ड टू पीडीएफ व जेपीजी कनवर्टर | ExamSewa",
  description:
    "Microsoft Word (.docx, .doc) फ़ाइलों को मूल लेआउट, फ़ॉन्ट, टेबल और भारतीय भाषाओं सहित 100% सटीक PDF या हाई-क्वालिटी JPG में बदलें। सुरक्षित, मुफ़्त और तेज़।",
  keywords: [
    "word to pdf converter online hindi",
    "word to jpg image converter",
    "docx to pdf converter high quality",
    "convert word to pdf without font change",
    "hindi font docx to pdf kruti dev mangal",
    "word to image converter 300 dpi",
    "free docx to pdf tool examsewa"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/word-to-pdf-jpg",
  },
  openGraph: {
    title: "Word to PDF & JPG Converter | ExamSewa",
    description: "Word (.docx, .doc) फ़ाइलों को शत-प्रतिशत मूल डिज़ाइन व भारतीय भाषाओं के साथ PDF या 300 DPI JPG में बदलें।",
    url: "https://examsewa.online/tools/word-to-pdf-jpg",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Word to PDF & JPG Converter - ExamSewa",
    description: "अपनी Word फ़ाइल को सीधे HD PDF या JPG इमेज में बदलें। 100% मुफ़्त एवं सुरक्षित।",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "Word to PDF & JPG Converter",
      "url": "https://examsewa.online/tools/word-to-pdf-jpg",
      "applicationCategory": "UtilityApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript. Requires HTML5.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "INR"
      },
      "description": "मुफ़्त ऑनलाइन टूल जो Microsoft Word फ़ाइलों को PDF और हाई-क्वालिटी JPG इमेज में बदलता है।"
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "क्या Word से PDF बनाते समय हिंदी फ़ॉन्ट (जैसे मंगल या कृतिदेव) बदलेंगे?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "नहीं, ExamSewa का इंजन भारतीय भाषाओं के फॉन्ट स्टैक और कॉम्प्लेक्स टेक्स्ट शेपिंग को सपोर्ट करता है, जिससे मूल लेआउट और फ़ॉन्ट सुरक्षित रहते हैं।"
          }
        },
        {
          "@type": "Question",
          "name": "क्या यह टूल 300 DPI की उच्च गुणवत्ता वाली JPG इमेज बनाता है?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "हाँ, हमारा कन्वर्टर 300 DPI और फुल एंटी-एलियासिंग के साथ क्रिस्टल-क्लियर JPG फ़ाइल तैयार करता है जो प्रिंटिंग और ऑनलाइन अपलोड दोनों के लिए उपयुक्त है।"
          }
        },
        {
          "@type": "Question",
          "name": "क्या मेरी अपलोड की गई फ़ाइलें सर्वर पर सुरक्षित हैं?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "हाँ, कन्वर्जन प्रक्रिया समाप्त होते ही सभी फ़ाइलें सर्वर की मेमोरी से तुरंत स्थायी रूप से हटा दी जाती हैं।"
          }
        }
      ]
    }
  ]
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
