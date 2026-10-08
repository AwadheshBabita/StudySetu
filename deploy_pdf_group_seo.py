import os

pdf_tools_seo = {
    "pdf-split": {
        "title": "PDF Splitter Online - PDF पेज अलग-अलग करें मुफ़्त में | ExamSewa",
        "desc": "बड़ी PDF फ़ाइलों में से चुनिंदा पेज अलग करें या हर पेज को अलग PDF बनाएं। बिना क्वालिटी खोए सुरक्षित और मुफ़्त ऑनलाइन टूल।",
        "keywords": ["split pdf online", "pdf ke page alag kaise kare", "extract pdf pages", "pdf splitter examsewa"]
    },
    "pdf-merge": {
        "title": "PDF Merger Online - कई PDF को एक साथ जोड़ें | ExamSewa",
        "desc": "दो या दो से अधिक PDF फ़ाइलों को आसानी से एक ही क्रमबद्ध PDF दस्तावेज़ में जोड़ें। तेज़, सुरक्षित और उपयोग में आसान।",
        "keywords": ["merge pdf online", "pdf jode online", "combine pdf files", "pdf merger tool"]
    },
    "pdf-merge-split": {
        "title": "PDF Merge & Split Tool - PDF जोड़ें और अलग करें | ExamSewa",
        "desc": "एक ही जगह पर PDF फाइलों को मर्ज करें या उनके पेजों को अलग करें। सभी प्रकार के दस्तावेज़ों के लिए ऑल-इन-वन PDF टूल।",
        "keywords": ["pdf merge and split", "pdf combine split online", "all in one pdf tool"]
    },
    "pdf-protect": {
        "title": "PDF Password Protect - PDF पर पासवर्ड लॉक लगाएं | ExamSewa",
        "desc": "अपने निजी दस्तावेज़ों और PDF फ़ाइलों को सुरक्षित पासवर्ड से लॉक करें। 128-bit एन्क्रिप्शन से डेटा को सुरक्षित रखें।",
        "keywords": ["lock pdf online", "pdf par password kaise lagaye", "protect pdf file", "secure pdf"]
    },
    "pdf-unlock": {
        "title": "PDF Unlocker Online - PDF का पासवर्ड हटाएं | ExamSewa",
        "desc": "सुरक्षित PDF फाइलों से पासवर्ड लॉक हटाएं ताकि उन्हें आसानी से पढ़ा, एडिट या प्रिंट किया जा सके।",
        "keywords": ["unlock pdf online", "pdf password remove", "pdf unlock kaise kare", "pdf password remover"]
    },
    "pdf-password": {
        "title": "PDF Password Manager - लॉक व अनलॉक PDF टूल | ExamSewa",
        "desc": "PDF फाइलों में सुरक्षा पासवर्ड लगाएं या ज्ञात पासवर्ड हटाकर अनप्रोटेक्टेड PDF डाउनलोड करें।",
        "keywords": ["pdf password tool", "lock unlock pdf", "manage pdf password"]
    },
    "pdf-compress": {
        "title": "PDF Compressor - PDF का साइज कम करें (KB में) | ExamSewa",
        "desc": "सरकारी फॉर्म और ऑनलाइन आवेदनों के लिए PDF का साइज 100 KB, 200 KB या 500 KB में कम करें बिना क्वालिटी खोए।",
        "keywords": ["compress pdf online", "pdf size kam kare", "reduce pdf size 100kb", "pdf compressor"]
    },
    "pdf-compressor": {
        "title": "Online PDF Size Reducer - मनचाहे साइज में कंप्रेस करें | ExamSewa",
        "desc": "उच्च गुणवत्ता बनाए रखते हुए भारी PDF फ़ाइलों के आकार को तुरंत कम करें। तेज़ और सुरक्षित वेब टूल।",
        "keywords": ["reduce pdf file size", "pdf mb to kb", "online pdf compressor"]
    },
    "govt-exam-pdf-compressor": {
        "title": "Govt Exam PDF Compressor - सरकारी फॉर्म PDF साइज सेटर | ExamSewa",
        "desc": "SSC, UPSC, UP Police और अन्य सरकारी फॉर्मों के नियमों के अनुसार PDF को 100-200 KB में सटीक कंप्रेस करें।",
        "keywords": ["govt exam pdf compressor", "ssc pdf size 200kb", "job form document resize"]
    },
    "pdf-rotate-delete": {
        "title": "PDF Rotate & Delete Pages - पेज घुमाएं या हटाएं | ExamSewa",
        "desc": "उलटे PDF पेजों को 90°, 180° घुमाकर सीधा करें या गैर-ज़रूरी पेजों को एक क्लिक में दस्तावेज़ से हटाएं।",
        "keywords": ["rotate pdf pages", "delete pages from pdf", "pdf sidha kaise kare", "organize pdf"]
    },
    "pdf-to-jpg": {
        "title": "PDF to JPG Converter - PDF से फोटो (JPG) बनाएं | ExamSewa",
        "desc": "PDF के हर पेज को हाई-क्वालिटी JPG/PNG इमेज में बदलें। बिना वॉटरमार्क तुरंत डाउनलोड करें।",
        "keywords": ["pdf to jpg online", "pdf se photo banaye", "convert pdf to image", "pdf to image converter"]
    },
    "jpg-to-pdf": {
        "title": "JPG to PDF Converter - फोटो से PDF बनाएं | ExamSewa",
        "desc": "अपनी तस्वीरों, रसीदों या स्कैन किए गए डाक्यूमेंट्स को मिलाकर एक क्लिक में A4 PDF तैयार करें।",
        "keywords": ["jpg to pdf online", "photo se pdf kaise banaye", "image to pdf maker"]
    },
    "pdf-watermark": {
        "title": "PDF Watermark Tool - PDF पर नाम या लोगो वॉटरमार्क लगाएं | ExamSewa",
        "desc": "दस्तावेज़ों की चोरी रोकने के लिए PDF पर कस्टम टेक्स्ट या लोगो वॉटरमार्क जोड़ें। पारदर्शी व सुरक्षित।",
        "keywords": ["add watermark to pdf", "pdf watermark online", "stamp pdf pages"]
    }
}

base_dir = "src/app/tools"

for folder, data in pdf_tools_seo.items():
    target_path = os.path.join(base_dir, folder)
    if os.path.exists(target_path):
        canonical_url = f"https://examsewa.online/tools/{folder}"
        layout_code = f'''import type {{ Metadata }} from "next";

export const metadata: Metadata = {{
  title: "{data['title']}",
  description: "{data['desc']}",
  keywords: {str(data['keywords'])},
  alternates: {{
    canonical: "{canonical_url}",
  }},
  openGraph: {{
    title: "{data['title']}",
    description: "{data['desc']}",
    url: "{canonical_url}",
    type: "website",
  }},
}};

export default function Layout({{
  children,
}}: {{
  children: React.ReactNode;
}}) {{
  return <>{children}</>;
}}
'''
        layout_file = os.path.join(target_path, "layout.tsx")
        with open(layout_file, "w", encoding="utf-8") as f:
            f.write(layout_code)
        print(f"✅ SEO Layout बनाया गया: /tools/{folder}")
    else:
        print(f"⚠️ फ़ोल्डर नहीं मिला: /tools/{folder}")

print("\nPDF टूल्स का SEO लेआउट सफलतापूर्वक तैयार हो गया!")
