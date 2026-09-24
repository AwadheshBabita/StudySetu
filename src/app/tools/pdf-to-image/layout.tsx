import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "PDF to Image Converter (JPG / PNG) - Exam Sewa",
  description: "PDF फाइल के सभी पन्नों को हाई-क्वालिटी JPG या PNG तस्वीरों में बदलें। 100% सुरक्षित और फ्री इन-ब्राउज़र कनवर्टर।",
  openGraph: {
    title: "PDF to Image Converter (JPG / PNG) - Exam Sewa",
    description: "PDF के पन्नों को अलग-अलग JPG या PNG फोटो में बदलें।",
    url: "https://examsewa.online/tools/pdf-to-image",
    siteName: "Exam Sewa",
    type: "website",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
