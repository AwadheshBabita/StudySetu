import os

image_tools_seo = {
    "document-scanner": {
        "title": "Smart Document Scanner Online - मैजिक कलर व ऑटो क्रॉप | ExamSewa",
        "desc": "मोबाइल से खींची गई कागज़ात की फोटो को तुरंत साफ़ करें। शैडो रिमूवल, मैजिक कलर व्हाइट बैलेंस और 4-कॉर्नर पर्सपेक्टिव क्रॉप के साथ HD PDF/JPG बनाएं।",
        "keywords": ["smart document scanner online", "magic color scanner", "document photo to clean pdf", "mobile document scan examsewa"]
    },
    "passport-studio-pro": {
        "title": "Passport Photo Studio Pro Online - बैकग्राउंड रिमूवर व A4 शीट | ExamSewa",
        "desc": "ऑनलाइन स्टूडियो क्वालिटी पासपोर्ट फोटो बनाएं। बैकग्राउंड बदलें (सफेद/नीला), ड्रेस सूट लगाएं और 4x6 या A4 शीट पर प्रिंट ग्रिड तैयार करें।",
        "keywords": ["passport photo maker pro", "passport photo background change", "online passport studio", "4x6 passport photo print"]
    },
    "passport-grid-maker": {
        "title": "Passport Photo Grid Maker - 4x6 और A4 शीट पर 6, 8, 12 फोटो सेट करें | ExamSewa",
        "desc": "पासपोर्ट साइज फोटो को 4x6 या A4 पेपर पर 4, 6, 8 या 12 की ग्रिड में प्रिंट करने के लिए तुरंत व्यवस्थित करें। स्टूडियो प्रिंटिंग के लिए उपयुक्त।",
        "keywords": ["passport photo grid maker", "4x6 passport sheet maker", "passport photo print layout", "a4 passport photo sheet"]
    },
    "passport-photo-4x6-maker": {
        "title": "4x6 Passport Photo Sheet Maker - 6/8 फोटो एक क्लिक में | ExamSewa",
        "desc": "मानक 4x6 इंच फोटो पेपर पर पासपोर्ट आकार की तस्वीरें व्यवस्थित करें और सीधे फोटो लैब से प्रिंट आउट लें।",
        "keywords": ["4x6 passport photo maker", "passport photo 4x6 sheet", "online photo printing grid"]
    },
    "photo-crop": {
        "title": "Online Photo Cropper - फ्रीहैंड व फिक्स रेशियो क्रॉप टूल | ExamSewa",
        "desc": "अपनी तस्वीरों को किसी भी अनुपात (1:1, 3:4, 4:6, 16:9) में सटीक क्रॉप करें। बिना क्वालिटी खोए आसान व तेज़ ऑनलाइन क्रॉपर।",
        "keywords": ["online photo crop", "image cropper tool", "crop photo for exam form", "free photo cropper"]
    },
    "photo-resize": {
        "title": "Online Photo Resizer - इमेज रिसाइज करें सेंटीमीटर, इंच और पिक्सल में | ExamSewa",
        "desc": "फोटो का आकार सेंटीमीटर (cm), मिलीमीटर (mm), इंच या पिक्सल में आसानी से बदलें। सरकारी फॉर्म और पासपोर्ट साइज के लिए तैयार करें।",
        "keywords": ["photo resizer online", "image resize in cm mm", "resize photo width height", "photo dimensions changer"]
    },
    "signature-resize": {
        "title": "Signature Resizer Online - सिग्नेचर 10KB से 20KB में बनाएं | ExamSewa",
        "desc": "हस्ताक्षर (Signature) को बिना धुंधला किए 10KB से 20KB या 50KB के अंदर सटीक पिक्सल और ब्लैक-व्हाइट कंट्रास्ट में रिसाइज़ करें।",
        "keywords": ["signature resize online", "signature 10kb to 20kb", "online sign compressor for govt exams", "signature cropper"]
    },
    "exact-pixel-resize": {
        "title": "Exact Pixel Resizer - Width x Height पिक्सल चेंजर | ExamSewa",
        "desc": "फोटो को सटीक पिक्सल माप (जैसे 200x230, 350x450 पिक्सल) में बदलें। परीक्षा पोर्टल के नियमों के अनुसार 100% सटीक फिटिंग।",
        "keywords": ["exact pixel resizer", "photo width height pixel resize", "image pixel dimension editor"]
    },
    "exact-kb-compressor": {
        "title": "Exact KB Photo Compressor - 20KB, 50KB, 100KB फिक्स साइज | ExamSewa",
        "desc": "फोटो या डॉक्यूमेंट को अपनी पसंद के निश्चित KB (जैसे ठीक 20 KB या 50 KB) में कंप्रेस करें। सरकारी अपलोड्स के लिए आदर्श टूल।",
        "keywords": ["exact kb photo compressor", "compress image to exact 50kb", "image size reducer in kb"]
    },
    "image-compressor": {
        "title": "Fast Image Compressor - इमेज साइज कम करें ऑनलाइन | ExamSewa",
        "desc": "JPG, PNG तस्वीरों के साइज को 80% तक कम करें बिना फोटो की विज़ुअल क्वालिटी खराब किए। तेज़ और मुफ़्त टूल।",
        "keywords": ["image compressor online", "reduce image size mb to kb", "compress jpg png"]
    },
    "compressor": {
        "title": "All-in-One Image & File Compressor - फाइल कंप्रेसर | ExamSewa",
        "desc": "सभी प्रकार की फोटो और दस्तावेज़ों के आकार को ऑनलाइन तुरंत कंप्रेस करें ताकि वे किसी भी पोर्टल पर आसानी से अपलोड हो सकें।",
        "keywords": ["online file compressor", "fast image compressor", "compress photo size online"]
    },
    "image-format-converter": {
        "title": "Image Format Converter - JPG, PNG, WEBP, PDF कनवर्टर | ExamSewa",
        "desc": "तस्वीरों का फॉर्मेट एक क्लिक में बदलें—PNG से JPG, JPG से WEBP या PNG में। तेज़, सुरक्षित और मुफ़्त कनवर्टर।",
        "keywords": ["image format converter", "png to jpg converter", "webp to jpg online", "convert image format"]
    },
    "image-scanner": {
        "title": "Online Image Scanner - फोटो को डॉक्यूमेंट लुक में बदलें | ExamSewa",
        "desc": "कैमरे से खींची गई फोटो को सीधे स्कैन किए गए पेपर डॉक्यूमेंट की तरह क्रिस्प, ब्राइट और पढ़ने योग्य बनाएं।",
        "keywords": ["image scanner online", "convert photo to scan", "online document enhancer"]
    },
    "ocr-scanner": {
        "title": "OCR Scanner Online - फोटो से टेक्स्ट निकालें (Text Extractor) | ExamSewa",
        "desc": "किसी भी फोटो, पर्ची या स्क्रीनशॉट में लिखी लिखावट (हिंदी और अंग्रेज़ी) को तुरंत पहचानें और कॉपी करने योग्य टेक्स्ट में बदलें।",
        "keywords": ["ocr scanner online", "image to text converter", "extract text from image", "photo se text copy kare"]
    },
    "id-card-cropper": {
        "title": "4-Corner ID Card Cropper - आधार, पैन, वोटर कार्ड क्रॉपर | ExamSewa",
        "desc": "आईडी कार्ड के चारों कोनों (4 Corners) को एडजस्ट करके तिरछी फोटो को सीधा, समतल और परफेक्ट कार्ड शेप में क्रॉप करें।",
        "keywords": ["id card cropper online", "4 corner image cropper", "crop aadhar pan card", "perspective crop online"]
    }
}

base_dir = "src/app/tools"

for folder, data in image_tools_seo.items():
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

print("\nग्रुप 3 (Image & Studio Tools) का SEO लेआउट सफलतापूर्वक तैयार हो गया!")
