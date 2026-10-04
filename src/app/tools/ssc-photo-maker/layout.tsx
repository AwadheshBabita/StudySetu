import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSC Photo & Signature Maker (CGL, CHSL, GD, MTS) 10-20 KB | ExamSewa",
  description: "एसएससी (SSC CGL, CHSL, GD, MTS) भर्ती के लिए फोटो व सिग्नेचर 10 से 20 KB और 4x2 cm में ऑनलाइन रिसाइज व क्रॉप करें।",
  keywords: [
    "SSC signature resize online",
    "SSC CGL photo size",
    "SSC CHSL signature 10 to 20 kb",
    "SSC photo maker online",
    "ExamSewa SSC tool"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/ssc-photo-maker",
  },
  openGraph: {
    title: "SSC फोटो व सिग्नेचर मेकर - ExamSewa",
    description: "SSC CGL, CHSL, GD, MTS के लिए 10-20 KB सिग्नेचर और फोटो तुरंत तैयार करें।",
    url: "https://examsewa.online/tools/ssc-photo-maker",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "website",
  },
};

export default function SSCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "SSC Photo and Signature Maker",
    "url": "https://examsewa.online/tools/ssc-photo-maker",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Resize and crop photo and signature for SSC CGL, CHSL, GD, MTS forms."
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
