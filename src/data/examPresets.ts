export interface ExamConfig {
  slug: string;
  title: string;
  hindiTitle: string;
  desc: string;
  photoSpec: { widthMm: number; heightMm: number; minKb: number; maxKb: number; note: string; hasDop: boolean };
  signSpec: { widthMm: number; heightMm: number; minKb: number; maxKb: number; note: string; inkColor: string };
  instructions: string[];
}

export const EXAM_PRESETS: Record<string, ExamConfig> = {
  "up-police": {
    slug: "up-police",
    title: "UP Police Constable / SI Photo & Sign Resizer",
    hindiTitle: "यूपी पुलिस फोटो एवं हस्ताक्षर रिसाइज़र",
    desc: "UPPRPB भर्ती परीक्षा हेतु 20KB-50KB फोटो और 5KB-20KB ब्लैक इंक सिग्नेचर एक क्लिक में तैयार करें।",
    photoSpec: { widthMm: 35, heightMm: 45, minKb: 20, maxKb: 50, note: "सफ़ेद या हल्के ग्रे रंग का बैकग्राउंड अनिवार्य", hasDop: false },
    signSpec: { widthMm: 35, heightMm: 15, minKb: 5, maxKb: 20, note: "काली स्याही (Black Pen) से सादे कागज़ पर", inkColor: "Black" },
    instructions: [
      "फोटो 6 महीने से अधिक पुरानी न हो।",
      "दोनों कान और चेहरा स्पष्ट रूप से दिखाई देना चाहिए।",
      "सिग्नेचर केवल काली स्याही से ही मान्य है।"
    ]
  },
  "ssc": {
    slug: "ssc",
    title: "SSC CGL / CHSL / GD Photo & Signature Maker",
    hindiTitle: "एसएससी भर्ती फोटो एवं सिग्नेचर मेकर",
    desc: "SSC के नए नियमों के अनुसार 20KB-50KB फोटो और 10KB-20KB सिग्नेचर सटीक अनुपात में बनाएं।",
    photoSpec: { widthMm: 35, heightMm: 45, minKb: 20, maxKb: 50, note: "चश्मा या टोपी न पहनें, साफ़ बैकग्राउंड", hasDop: false },
    signSpec: { widthMm: 40, heightMm: 20, minKb: 10, maxKb: 20, note: "नीली या काली स्याही से स्पष्ट हस्ताक्षर", inkColor: "Black/Blue" },
    instructions: [
      "फ़ोटो का आकार 3.5 सेमी चौड़ाई x 4.5 सेमी ऊंचाई होना चाहिए।",
      "सिग्नेचर 4.0 सेमी चौड़ाई x 2.0 सेमी ऊंचाई में होना चाहिए।"
    ]
  },
  "upsc": {
    slug: "upsc",
    title: "UPSC Civil Services Photo & Sign Resizer",
    hindiTitle: "यूपीएससी सिविल सेवा फोटो एवं साइन टूल",
    desc: "UPSC OTR हेतु फोटो पर नाम व तिथि (DOPO) स्टैम्प और 20KB-300KB साइज कनवर्टर।",
    photoSpec: { widthMm: 35, heightMm: 45, minKb: 20, maxKb: 300, note: "फोटो पर छात्र का नाम और फोटो खींचने की तारीख अनिवार्य", hasDop: true },
    signSpec: { widthMm: 35, heightMm: 15, minKb: 20, maxKb: 300, note: "स्पष्ट हस्ताक्षर 20KB से 300KB के बीच", inkColor: "Black" },
    instructions: [
      "UPSC नए नियमों के अनुसार फोटो नोटिफिकेशन जारी होने के 10 दिन के भीतर की होनी चाहिए।",
      "फोटो के निचले हिस्से पर उम्मीदवार का नाम और तारीख साफ़ लिखी हो।"
    ]
  },
  "railway-rrb": {
    slug: "railway-rrb",
    title: "Railway RRB ALP / Technician / NTPC Photo Resizer",
    hindiTitle: "रेलवे भर्ती फोटो एवं सिग्नेचर टूल",
    desc: "रेलवे भर्ती बोर्ड (RRB) के लिए 30KB-70KB फोटो व सिग्नेचर एक क्लिक में तैयार करें।",
    photoSpec: { widthMm: 35, heightMm: 45, minKb: 30, maxKb: 70, note: "सफ़ेद बैकग्राउंड और स्पष्ट कलर फोटो", hasDop: false },
    signSpec: { widthMm: 50, heightMm: 20, minKb: 30, maxKb: 70, note: "सादे सफ़ेद कागज़ पर रनिंग हैंडराइटिंग", inkColor: "Black/Blue" },
    instructions: [
      "हस्ताक्षर कैपिटल अक्षरों में नहीं होना चाहिए।",
      "फोटो का बैकग्राउंड केवल सफ़ेद होना चाहिए।"
    ]
  }
};
