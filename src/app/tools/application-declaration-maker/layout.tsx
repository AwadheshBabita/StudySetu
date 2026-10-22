import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "आवेदन एवं घोषणा पत्र मेकर (A4 Print Ready) | Application & Declaration Maker Online",
  description:
    "बैंक शाखा प्रबंधक, पुलिस थाना, स्कूल-कॉलेज और तहसील हेतु हिंदी एवं अंग्रेजी में प्रार्थना-पत्र व स्व-घोषणा पत्र ऑनलाइन तैयार करें। A4 PDF एवं JPG डाउनलोड सुविधा के साथ मुफ्त टूल।",
  keywords: [
    "application maker online free",
    "declaration form maker hindi",
    "prarthana patra maker hindi",
    "aavedan patra kaise likhe",
    "police complaint application format hindi",
    "bank application maker online",
    "self declaration form hindi pdf",
    "swaghoshna patra maker",
    "shikayat patra format up police",
    "leave application format hindi english",
    "application letter print a4 online",
    "csc application generator tool",
    "tehsil paimayish application format"
  ],
  alternates: {
    canonical: "https://examsewa.online/tools/application-declaration-maker",
  },
  openGraph: {
    title: "आवेदन एवं घोषणा पत्र मेकर (A4 Print Ready) | ExamSewa",
    description: "बैंक, पुलिस, स्कूल और तहसील हेतु प्रार्थना-पत्र व स्व-घोषणा पत्र तुरंत तैयार करें और A4 में प्रिंट/PDF निकालें।",
    url: "https://examsewa.online/tools/application-declaration-maker",
    siteName: "ExamSewa",
    locale: "hi_IN",
    type: "website",
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ExamSewa आवेदन एवं घोषणा पत्र मेकर",
    "url": "https://examsewa.online/tools/application-declaration-maker",
    "description": "ऑनलाइन बैंक प्रार्थना-पत्र, पुलिस शिकायत, स्कूल अवकाश और स्व-घोषणा पत्र जनरेटर टूल।",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
