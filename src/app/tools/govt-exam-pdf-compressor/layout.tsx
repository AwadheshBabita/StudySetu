import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Govt Exam Target PDF Compressor 100KB, 200KB, 500KB | Exam Sewa",
  description: "सरकारी फॉर्म, UPSC, SSC, IBPS व रेलवे हेतु PDF को 100KB, 200KB या 500KB में तुरंत कंप्रेस करें। मुहर, हस्ताक्षर और लिखावट 100% स्पष्ट। मल्टी-पेज सपोर्ट।",
  keywords: [
    "compress pdf to 100kb online free for govt job form",
    "compress pdf to 200kb without losing quality",
    "upsc ssc pdf size reducer 100kb 200kb",
    "reduce pdf file size below 100kb online",
    "multi page target pdf compressor govt exams",
    "pdf compressor for online application free"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/govt-exam-pdf-compressor",
  },
  openGraph: {
    title: "Govt Exam Target PDF Compressor (100KB, 200KB) | Exam Sewa",
    description: "सरकारी नौकरी फॉर्म के लिए PDF को सटीक 100KB, 200KB में कंप्रेस करें। टेक्स्ट व मुहर की स्पष्टता सुरक्षित।",
    url: "https://examsewa.online/tools/govt-exam-pdf-compressor",
    siteName: "Exam Sewa",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
