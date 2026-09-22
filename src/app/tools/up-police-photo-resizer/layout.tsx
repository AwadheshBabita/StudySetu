import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UP Police Photo & Signature Resizer (20KB - 50KB) - Constable, SI | Exam Sewa",
  description: "UP Police कांस्टेबल, SI व लिपिक भर्ती हेतु फोटो (20KB-50KB) एवं हस्ताक्षर (10KB-20KB) ऑनलाइन रिसाइज करें। 3.5x4.5 सेमी अनुपात और 100% सरकारी फॉर्म रेडी आउटपुट।",
  keywords: [
    "UP Police photo resizer 20KB to 50KB",
    "UP Police constable photo signature maker online",
    "UP Police signature size 10kb to 20kb converter",
    "UPPRPB photo upload size and dimension online free",
    "UP Police exam photo with name and date generator",
    "photo resizer for up police form 2026"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/up-police-photo-resizer",
  },
  openGraph: {
    title: "UP Police Photo & Signature Resizer (20KB - 50KB) | Exam Sewa",
    description: "आधिकारिक UPPRPB गाइडलाइन अनुसार फोटो व हस्ताक्षर रिसाइज करें। 100% सुरक्षित क्लाइंट-साइड टूल।",
    url: "https://examsewa.online/tools/up-police-photo-resizer",
    siteName: "Exam Sewa",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
