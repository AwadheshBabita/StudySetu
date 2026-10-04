import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WBPSC Photo & Signature Resizer Online (20-100 KB) | ExamSewa",
  description: "पश्चिम बंगाल PSC (WBCS, Clerkship, Miscellaneous) भर्ती के लिए पासपोर्ट फोटो और हस्ताक्षर 3.5x4.5 cm और 100 KB में ऑनलाइन रिसाइज व क्रॉप करें।",
  keywords: [
    "WBPSC photo resize",
    "WBPSC signature resize online",
    "WBPSC clerkship photo size",
    "West Bengal PSC photo crop",
    "ExamSewa WBPSC tool"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/wbpsc-photo-resizer",
  },
  openGraph: {
    title: "WBPSC फोटो व साइन रिसाइज़र - ExamSewa",
    description: "WBPSC परीक्षा के लिए सटीक 20-100 KB और डायमेंशन में फोटो और हस्ताक्षर तुरंत तैयार करें।",
    url: "https://examsewa.online/tools/wbpsc-photo-resizer",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "website",
  },
};

export default function WBPSCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "WBPSC Photo and Signature Resizer",
    "url": "https://examsewa.online/tools/wbpsc-photo-resizer",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Resize and crop photo and signature for WBPSC West Bengal recruitment forms."
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
