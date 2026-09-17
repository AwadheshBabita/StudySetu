import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("http://129.154.228.242:3000"),
  title: "StudySetu — 100% Free Government Exam Tools, Photo/Sign Resizer & PDF Suite",
  description:
    "Free in-browser exam tools: SSC, UPSC photo & signature resizer (10-20KB, DOP stamp), exact KB compressor, A4 PVC ID card print sheet, live CamScanner deskew, and PDF suite.",
  keywords: [
    "StudySetu",
    "SSC photo resizer 20kb to 50kb",
    "signature resize 10kb to 20kb",
    "DOP photo maker online",
    "Aadhaar PVC card print sheet A4",
    "PDF compressor under 100kb",
    "government exam form photo converter",
    "camscanner free online straightener",
    "cyber cafe tools"
  ],
  authors: [{ name: "StudySetu" }],
  openGraph: {
    title: "StudySetu — Fast & Free Online Tools for Students & Cyber Cafes",
    description: "Resize photos & signatures for SSC/UPSC, compress PDFs to target KB, crop PVC cards, and scan documents safely in your browser without upload.",
    url: "http://129.154.228.242:3000",
    siteName: "StudySetu",
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudySetu — Free Exam Utility Suite",
    description: "Fast in-browser photo, signature, PDF & scanner utilities.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
