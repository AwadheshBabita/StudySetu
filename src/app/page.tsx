import Link from "next/link";

const tools = [
  {
    name: "Photo Resizer (Exam)",
    desc: "SSC, UPSC, UP Police हेतु सटीक साइज व नाम-तारीख (DOP) स्टैम्प",
    href: "/tools/photo-resize",
    icon: "🖼️",
    badge: "Top Exam"
  },
  {
    name: "Signature Resizer",
    desc: "10-20 KB में सटीक अनुपात और गहरी स्याही (Auto Ink Contrast)",
    href: "/tools/signature-resize",
    icon: "✍️",
    badge: "Auto Ink"
  },
  {
    name: "Exact KB Compressor",
    desc: "फोटो की क्वालिटी बनाए रखते हुए मनचाहे KB में फिक्स करें",
    href: "/tools/exact-kb-compressor",
    icon: "📉",
    badge: "Smart HD"
  },
  {
    name: "Exact Pixel & Dimension",
    desc: "चौड़ाई व ऊँचाई को px, cm या mm में सटीक रूप से सेट करें",
    href: "/tools/exact-pixel-resize",
    icon: "📐",
    badge: "DPI Tool"
  },
  {
    name: "PDF Compressor",
    desc: "बड़ी PDF का साइज बिना सर्वर अपलोड किए 70-80% तक घटाएँ",
    href: "/tools/pdf-compress",
    icon: "🗜️",
    badge: "Private"
  },
  {
    name: "Image to PDF",
    desc: "फोटो को क्रमबद्ध करके उच्च-गुणवत्ता A4 PDF में बदलें",
    href: "/tools/image-to-pdf",
    icon: "📑",
    badge: "A4 Fit"
  },
  {
    name: "PDF Merge & Split",
    desc: "कई PDF एक साथ जोड़ें या खास पेजों को अलग निकालें",
    href: "/tools/pdf-merge-split",
    icon: "✂️",
    badge: "Dual Tool"
  },
  {
    name: "Format Converter",
    desc: "JPG, PNG और WebP फॉर्मेट में 1-क्लिक में तुरंत बदलें",
    href: "/tools/image-format-converter",
    icon: "🔄",
    badge: "Lossless"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
            100% Free & Unlimited Client-Side Tools
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-blue-700">
            StudySetu Tools Hub
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-600">
            सरकारी परीक्षाओं और फॉर्म्स के लिए सबसे तेज़ और सुरक्षित टूल्स। आपकी फाइलें आपके डिवाइस में ही प्रोसेस होती हैं।
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{tool.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {tool.badge}
                  </span>
                </div>
                <h2 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                  {tool.name}
                </h2>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-blue-600 flex items-center justify-between">
                <span>ओपन करें</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-14 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
          © StudySetu — Fast, Private, In-Browser Tools. No Server Uploads.
        </footer>
      </div>
    </main>
  );
}
