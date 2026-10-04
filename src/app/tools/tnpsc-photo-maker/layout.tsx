import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TNPSC Photo & Signature Maker Online (Name & Date, 20-50 KB) | ExamSewa",
  description: "तमिलनाडु लोक सेवा आयोग (TNPSC Group 1, 2, 4) भर्ती के लिए पासपोर्ट फोटो पर नाम-तारीख जोड़ें और हस्ताक्षर 20-50 KB में ऑनलाइन रिसाइज व क्रॉप करें।",
  keywords: [
    "TNPSC photo maker",
    "TNPSC photo with name and date",
    "TNPSC signature resize online",
    "TNPSC Group 4 photo size",
    "Tamil Nadu PSC photo crop",
    "ExamSewa TNPSC tool"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/tnpsc-photo-maker",
  },
  openGraph: {
    title: "TNPSC फोटो व साइन मेकर - ExamSewa",
    description: "TNPSC परीक्षा के लिए नाम व तारीख वाली फोटो और हस्ताक्षर 20-50 KB में तुरंत तैयार करें।",
    url: "https://examsewa.online/tools/tnpsc-photo-maker",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "website",
  },
};

export default function TNPSCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TNPSC Photo and Signature Maker",
    "url": "https://examsewa.online/tools/tnpsc-photo-maker",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Resize, crop and add name and date to photo and signature for TNPSC Tamil Nadu recruitment forms."
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
