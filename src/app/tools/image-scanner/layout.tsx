import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Online Image Scanner - CamScanner Style Auto Edge Crop | Exam Sewa",
  description: "मोबाइल से खींची गई फोटो को CamScanner की तरह ऑटो डिटेक्ट कर सीधा करें। परछाई हटाएँ, A4 में फिट करें और 100KB PDF/JPG डाउनलोड करें।",
  keywords: [
    "online image scanner free",
    "camscanner alternative online without watermark",
    "auto edge detect photo scanner",
    "perspective crop document online a4",
    "mobile photo scanner to clean pdf"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/image-scanner",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
