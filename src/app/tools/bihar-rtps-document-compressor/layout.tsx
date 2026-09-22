import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bihar RTPS & Scholarship Document Compressor 50KB-100KB | Exam Sewa",
  description: "बिहार RTPS जाति, आय, निवास प्रमाणपत्र एवं UP Scholarship हेतु डॉक्युमेंट को सटीक 50KB से 100KB में कंप्रेस करें। मोहर व हस्ताक्षर की तीक्ष्णता 100% सुरक्षित।",
  keywords: [
    "bihar rtps document compress 100kb",
    "jati aay niwas photo size 50kb to 100kb converter",
    "RTPS bihar document upload error size reducer",
    "up scholarship certificate compress 100kb online",
    "marksheet certificate resize 100kb free",
    "online form document 50kb to 100kb jpg pdf"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/bihar-rtps-document-compressor",
  },
  openGraph: {
    title: "Bihar RTPS & Scholarship Document Compressor 50KB-100KB | Exam Sewa",
    description: "RTPS व छात्रवृत्ति पोर्टल अनुसार प्रमाणपत्र को 50KB-100KB में लॉक करें। मोहर व लिखावट साफ करें।",
    url: "https://examsewa.online/tools/bihar-rtps-document-compressor",
    siteName: "Exam Sewa",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
