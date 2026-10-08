import os

exam_tools_seo = {
    "ssc-photo-maker": {
        "title": "SSC Photo & Signature Maker Online - CGL, CHSL, GD, MTS | ExamSewa",
        "desc": "SSC परीक्षा फॉर्म के लिए फोटो पर नाम और डेट ऑफ फोटो (DOP) जोड़ें। 20KB से 50KB में सटीक साइज और रेजोल्यूशन के साथ JPG बनाएं।",
        "keywords": ["ssc photo maker", "ssc photo with name date", "ssc photo resizer 20kb 50kb", "ssc signature resize"]
    },
    "rrb-railway-photo-maker": {
        "title": "Railway RRB Photo & Signature Resizer Online - ALP, Tech, NTPC | ExamSewa",
        "desc": "रेलवे भर्ती (RRB/RRC) के आधिकारिक नियमों अनुसार फोटो और सिग्नेचर को 30KB-70KB में ऑनलाइन रिसाइज़ और कंप्रेस करें।",
        "keywords": ["railway photo resizer", "rrb alp photo maker", "railway signature size", "rrb ntpc photo tool"]
    },
    "up-police-photo-resizer": {
        "title": "UP Police Photo & Signature Maker - कांस्टेबल व SI भर्ती | ExamSewa",
        "desc": "यूपी पुलिस भर्ती बोर्ड (UPPRPB) के नियमानुसार 20KB-50KB फोटो और 5KB-20KB सिग्नेचर ऑनलाइन बनाएं। सफेद बैकग्राउंड सपोर्ट।",
        "keywords": ["up police photo resize", "upprpb photo signature size", "up police constable photo maker"]
    },
    "bihar-rtps-document-compressor": {
        "title": "Bihar RTPS Document Compressor - जाति, आय, निवास 200 KB | ExamSewa",
        "desc": "बिहार RTPS (Service Plus) पोर्टल पर जाति, आय, और निवास प्रमाण पत्र अपलोड करने के लिए PDF/इमेज को 200 KB से कम में कंप्रेस करें।",
        "keywords": ["bihar rtps document compress", "service plus bihar document 200kb", "jati aay niwas compress online"]
    },
    "agniveer-live-photo": {
        "title": "Agniveer Live Photo Capture & Resizer - आर्मी, नेवी, एयरफोर्स | ExamSewa",
        "desc": "अग्निवीर भर्ती के लिए लाइव वेबकैम से स्पष्ट तस्वीर खींचें और नियमों के अनुसार सही साइज व बैकग्राउंड में डाउनलोड करें।",
        "keywords": ["agniveer live photo capture", "army agniveer photo size", "join indian army photo maker"]
    },
    "live-photo-capture": {
        "title": "Govt Exam Live Webcam Photo Tool - लाइव फोटो कैप्चर | ExamSewa",
        "desc": "सरकारी नौकरियों के ऑनलाइन आवेदन के लिए सीधे लैपटॉप या मोबाइल कैमरे से लाइव फोटो कैप्चर करें और ऑटो-क्रॉप करें।",
        "keywords": ["live photo capture online", "webcam photo for govt exam", "online form camera capture"]
    },
    "mpsc-photo-resizer": {
        "title": "MPSC Photo & Signature Resizer - महाराष्ट्र लोक सेवा आयोग | ExamSewa",
        "desc": "MPSC ऑनलाइन एप्लिकेशन के लिए आवश्यक पिक्सल (Width x Height) और 50KB साइज में फोटो व सिग्नेचर रिसाइज़ करें।",
        "keywords": ["mpsc photo resizer", "mpsc signature dimension", "maharashtra psc photo tool"]
    },
    "wbpsc-photo-resizer": {
        "title": "WBPSC Photo & Signature Maker - West Bengal PSC | ExamSewa",
        "desc": "WBPSC भर्ती पोर्टल के आधिकारिक निर्देशों के अनुसार फोटो (100KB) और सिग्नेचर को तुरंत सही माप में बदलें।",
        "keywords": ["wbpsc photo resizer", "west bengal psc photo size", "wbpsc signature resize"]
    },
    "tnpsc-photo-maker": {
        "title": "TNPSC Photo & Signature Resizer Online - Tamil Nadu PSC | ExamSewa",
        "desc": "TNPSC परीक्षा के लिए नाम और तारीख वाली फोटो तथा सिग्नेचर को तय पिक्सल और KB में ऑनलाइन तैयार करें।",
        "keywords": ["tnpsc photo maker", "tnpsc photo date name", "tamil nadu psc photo resize"]
    },
    "exam-presets": {
        "title": "Govt Exam Photo & Signature Presets - सभी परीक्षाओं के साइज | ExamSewa",
        "desc": "SSC, UPSC, Banking, Railway और राज्य भर्ती परीक्षाओं के रेडीमेड फोटो-साइन साइज प्रीसेट्स। एक क्लिक में लागू करें।",
        "keywords": ["exam photo presets", "all govt exam photo size list", "photo dimension presets"]
    },
    "exam-requirements": {
        "title": "Govt Exam Photo & Signature Guidelines - नियम व साइज चार्ट | ExamSewa",
        "desc": "सभी प्रमुख प्रतियोगी परीक्षाओं के फोटो, सिग्नेचर और डॉक्यूमेंट अपलोड के नवीनतम नियम, साइज, और गाइडलाइन्स।",
        "keywords": ["exam photo requirements", "govt exam photo guidelines", "photo signature size list 2026"]
    },
    "exam-guide": {
        "title": "Online Form Fill Guide - फोटो व डॉक्यूमेंट अपलोड गाइड | ExamSewa",
        "desc": "बिना रिजेक्शन के सरकारी नौकरी के फॉर्म भरने के लिए फोटो, साइन और डॉक्यूमेंट स्कैन करने की संपूर्ण मार्गदर्शिका।",
        "keywords": ["form fill guide", "how to upload photo without rejection", "govt job application tips"]
    }
}

base_dir = "src/app/tools"

for folder, data in exam_tools_seo.items():
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

print("\nग्रुप 2 (Exam Tools) का SEO लेआउट सफलतापूर्वक तैयार हो गया!")
