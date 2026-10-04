import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MPSC Photo & Signature Resizer Online - 50 KB Lock | ExamSewa",
  description: "महाराष्ट्र लोक सेवा आयोग (MPSC) भर्ती के लिए पासपोर्ट फोटो और हस्ताक्षर 3.5x4.5 cm और 50 KB में ऑनलाइन रिसाइज व क्रॉप करें।",
  keywords: [
    "MPSC photo resize",
    "MPSC signature resize online",
    "MPSC photo size 50 kb",
    "Maharashtra PSC photo crop",
    "ExamSewa MPSC tool"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/mpsc-photo-resizer",
  },
  openGraph: {
    title: "MPSC फोटो व साइन रिसाइज़र - ExamSewa",
    description: "MPSC परीक्षा के लिए सटीक 50 KB और डायमेंशन में फोटो और हस्ताक्षर तुरंत तैयार करें।",
    url: "https://examsewa.online/tools/mpsc-photo-resizer",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "website",
  },
};

export default function MPSCLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "MPSC Photo and Signature Resizer",
    "url": "https://examsewa.online/tools/mpsc-photo-resizer",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "All",
    "description": "Resize and crop photo and signature for MPSC Maharashtra recruitment under 50 KB."
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
