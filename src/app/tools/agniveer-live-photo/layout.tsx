import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agniveer Army Live Photo Capture (20KB - 50KB) Oval Guide | Exam Sewa",
  description: "Join Indian Army व Agniveer भर्ती परीक्षा हेतु वेबकैम या मोबाइल कैमरे से लाइव फोटो खींचें। फेस ओवल गाइड, 3 सेकंड टाइमर और सटीक 20KB से 50KB ऑनलाइन फॉर्म रेडी आउटपुट।",
  keywords: [
    "Agniveer army live photo capture online",
    "Agniveer online form webcam photo oval guide",
    "Army GD live photo size 20kb to 50kb",
    "join indian army photo upload size compressor",
    "Agniveer Navy live photo capture without app",
    "webcam live photo for army rally form online"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/agniveer-live-photo",
  },
  openGraph: {
    title: "Agniveer Army Live Photo Capture (20KB - 50KB) | Exam Sewa",
    description: "आधिकारिक अग्निवीर रैली गाइडलाइन अनुसार फेस ओवल गाइड के साथ लाइव फोटो कैप्चर करें। 100% सटीक फॉर्म रेडी आउटपुट।",
    url: "https://examsewa.online/tools/agniveer-live-photo",
    siteName: "Exam Sewa",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
