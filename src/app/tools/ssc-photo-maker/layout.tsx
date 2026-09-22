import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SSC Photo Resizer with Name & Date (20KB - 50KB) - CGL, CHSL, GD | Exam Sewa",
  description: "SSC CGL, CHSL, MTS, Stenographer व GD कांस्टेबल परीक्षा हेतु 3.5x4.5 सेमी फोटो पर नाम व तारीख (DOP) जोड़ें। सटीक 20KB से 50KB ऑनलाइन फॉर्म रेडी JPG तैयार करें।",
  keywords: [
    "SSC CGL photo resizer 20KB to 50KB",
    "SSC photo with date and name maker online",
    "SSC form photo dimension 3.5 x 4.5 cm",
    "SSC online application photo date stamp",
    "photo resizer for ssc exam free online",
    "SSC GD photo size 20kb 50kb compressor"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/ssc-photo-maker",
  },
  openGraph: {
    title: "SSC Photo Resizer with Name & Date (20KB - 50KB) | Exam Sewa",
    description: "आधिकारिक एसएससी गाइडलाइन अनुसार नाम व DOP डालें। बिना क्वालिटी खराब किए 100% सटीक फॉर्म रेडी आउटपुट।",
    url: "https://examsewa.online/tools/ssc-photo-maker",
    siteName: "Exam Sewa",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
