import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JPG to PDF Converter - Convert Image to A4 PDF Online (Free)",
  description: "Convert JPG, JPEG, and images to standard A4 PDF online for free. Compress to 50KB, 100KB, 200KB for government job applications, marksheets, and documents.",
  keywords: ["jpg to pdf", "jpg to pdf converter", "image to pdf", "a4 pdf converter", "convert photo to pdf", "sarkari pdf maker"],
  alternates: {
    canonical: "https://examsewa.online/tools/jpg-to-pdf",
  },
  openGraph: {
    title: "JPG to PDF Converter - Convert Image to A4 PDF Online",
    description: "Easily convert photos and marksheets into standard A4 PDF with custom KB limits.",
    url: "https://examsewa.online/tools/jpg-to-pdf",
    siteName: "ExamSewa",
    type: "website",
  },
};

export default function JpgToPdfLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
