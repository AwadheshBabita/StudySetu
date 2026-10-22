export type FileRequirement = {
  label: string;
  formats: string[];
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  minKb?: number;
  maxKb?: number;
};

export type ExamRequirement = {
  id: string;
  exam: string;
  category: string;
  verified: boolean;
  lastVerified?: string;
  source?: string;
  photo?: FileRequirement;
  signature?: FileRequirement;
  documents?: string[];
  notes?: string[];
};

export const examRequirements: ExamRequirement[] = [
  // ==================== TEACHING / TET ====================
  {
    id: 'ctet',
    exam: 'CTET (Central Teacher Eligibility Test)',
    category: 'teaching',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://ctet.nic.in/',
    photo: {
      label: 'Passport Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 100,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 3,
      maxKb: 30,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'फोटो 3.5 cm × 4.5 cm (10 KB से 100 KB) के मध्य होनी चाहिए।',
      'सिग्नेचर 3.5 cm × 1.5 cm (3 KB से 30 KB) के मध्य होना चाहिए।'
    ]
  },
  {
    id: 'uptet',
    exam: 'UPTET (उत्तर प्रदेश शिक्षक पात्रता परीक्षा)',
    category: 'teaching',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://updeled.gov.in/',
    photo: {
      label: 'Passport Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'फोटो साफ बैकग्राउंड में 20KB से 50KB के बीच होनी चाहिए।',
      'हस्ताक्षर 10KB से 20KB के मध्य होना अनिवार्य है।'
    ]
  },
  {
    id: 'super-tet',
    exam: 'Super TET (UP सहायक अध्यापक भर्ती)',
    category: 'teaching',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://updeled.gov.in/',
    photo: {
      label: 'Passport Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'फोटो 20-50 KB और सिग्नेचर 10-20 KB होना चाहिए।'
    ]
  },
  {
    id: 'bpsc-tre',
    exam: 'BPSC TRE (बिहार शिक्षक भर्ती)',
    category: 'teaching',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://bpsc.bih.nic.in/',
    photo: {
      label: 'Live Webcam Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 100,
      minWidth: 350,
      maxWidth: 600,
      minHeight: 450,
      maxHeight: 700,
    },
    signature: {
      label: 'Signature (Hindi & English)',
      formats: ['JPG', 'JPEG'],
      minKb: 5,
      maxKb: 15,
      minWidth: 140,
      maxWidth: 220,
      minHeight: 60,
      maxHeight: 100,
    },
    notes: [
      'BPSC TRE में लाइव वेबकैम फोटो ली जाती है। बैकग्राउंड सफेद या हल्का होना अनिवार्य है।',
      'हिंदी और अंग्रेजी दोनों हस्ताक्षर अलग-अलग (15 KB से कम) अपलोड करने होते हैं।'
    ]
  },

  // ==================== POLICE ====================
  {
    id: 'up-police-constable',
    exam: 'UP Police Constable',
    category: 'police',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://uppbpb.gov.in/',
    photo: {
      label: 'Passport Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Signature (Black Ink)',
      formats: ['JPG', 'JPEG'],
      minKb: 5,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'चेहरे का आकार फोटो के 70% भाग में दिखना चाहिए। बैकग्राउंड सफेद या हल्का ग्रे।',
      'सिग्नेचर काली स्याही से सफेद कागज पर होना चाहिए (5KB - 20KB)।'
    ]
  },
  {
    id: 'up-police-si',
    exam: 'UP Police Sub Inspector (SI)',
    category: 'police',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://uppbpb.gov.in/',
    photo: {
      label: 'Passport Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 5,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'फोटो 20KB से 50KB और हस्ताक्षर 5KB से 20KB के मध्य।'
    ]
  },

  // ==================== SSC ====================
  {
    id: 'ssc-cgl',
    exam: 'SSC CGL',
    category: 'ssc',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://ssc.gov.in/',
    photo: {
      label: 'Live Photo (Webcam/App)',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 500,
      minHeight: 450,
      maxHeight: 600,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'फोटो ssc.gov.in पोर्टल पर लाइव कैप्चर होती है। टोपी व चश्मा न पहनें।',
      'सिग्नेचर साफ सफेद कागज पर 10KB से 20KB के मध्य होना चाहिए।'
    ]
  },
  {
    id: 'ssc-chsl',
    exam: 'SSC CHSL (10+2)',
    category: 'ssc',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://ssc.gov.in/',
    photo: {
      label: 'Live Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 500,
      minHeight: 450,
      maxHeight: 600,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'सिग्नेचर साइज ठीक 10KB से 20KB के बीच ही मान्य होगा।'
    ]
  },
  {
    id: 'ssc-gd',
    exam: 'SSC GD Constable',
    category: 'ssc',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://ssc.gov.in/',
    photo: {
      label: 'Live Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 500,
      minHeight: 450,
      maxHeight: 600,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'सफेद बैकग्राउंड में लाइव फोटो। सिग्नेचर कैपिटल लेटर्स में न करें।'
    ]
  },

  // ==================== RAILWAY ====================
  {
    id: 'rrb-alp-tech',
    exam: 'RRB ALP / Technician',
    category: 'railway',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://rrbapply.gov.in/',
    photo: {
      label: 'Passport Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 30,
      maxKb: 70,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Signature (Running Hand)',
      formats: ['JPG', 'JPEG'],
      minKb: 30,
      maxKb: 70,
      minWidth: 140,
      maxWidth: 280,
      minHeight: 60,
      maxHeight: 140,
    },
    notes: [
      'फोटो व सिग्नेचर दोनों का साइज़ 30KB से 70KB के बीच होना अनिवार्य है।'
    ]
  },
  {
    id: 'rrb-ntpc',
    exam: 'RRB NTPC',
    category: 'railway',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://rrbapply.gov.in/',
    photo: {
      label: 'Passport Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 30,
      maxKb: 70,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 30,
      maxKb: 70,
      minWidth: 140,
      maxWidth: 280,
      minHeight: 60,
      maxHeight: 140,
    },
    notes: [
      'सफेद बैकग्राउंड और फाइल साइज 30KB से 70KB।'
    ]
  },

  // ==================== UPSC ====================
  {
    id: 'upsc-cse',
    exam: 'UPSC Civil Services (IAS/IPS)',
    category: 'upsc',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://upsconline.nic.in/',
    photo: {
      label: 'Photograph with Name & Date',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 300,
      minWidth: 350,
      maxWidth: 1000,
      minHeight: 350,
      maxHeight: 1000,
    },
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 300,
      minWidth: 350,
      maxWidth: 1000,
      minHeight: 350,
      maxHeight: 1000,
    },
    notes: [
      'फोटो के नीचे छात्र का नाम और फोटो की तारीख (DOP) होना अनिवार्य है।',
      'पिक्सेल डायमेंशन 350×350 से 1000×1000 px, साइज 20KB से 300KB।'
    ]
  },

  // ==================== BANKING ====================
  {
    id: 'ibps-po-clerk',
    exam: 'IBPS PO / Clerk / SO',
    category: 'banking',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://ibps.in/',
    photo: {
      label: 'Passport Photo (200x230 px)',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 200,
      maxWidth: 230,
      minHeight: 230,
      maxHeight: 260,
    },
    signature: {
      label: 'Signature (140x60 px)',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 20,
      minWidth: 140,
      maxWidth: 160,
      minHeight: 60,
      maxHeight: 80,
    },
    notes: [
      'फोटो ठीक 200×230 px (20-50 KB) और सिग्नेचर ठीक 140×60 px (10-20 KB) काली स्याही से।'
    ]
  },

  // ==================== STATE EXAMS ====================
  {
    id: 'upsssc-pet',
    exam: 'UPSSSC PET / Lekhpal',
    category: 'state-exams',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'http://upsssc.gov.in/',
    photo: {
      label: 'Photo (3.5 x 4.5 cm)',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 50,
      minWidth: 350,
      maxWidth: 450,
      minHeight: 450,
      maxHeight: 550,
    },
    signature: {
      label: 'Combined Signature (Eng + Hindi)',
      formats: ['JPG', 'JPEG'],
      minKb: 5,
      maxKb: 30,
      minWidth: 140,
      maxWidth: 280,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'ऊपर अंग्रेजी में साइन और नीचे हिंदी में पूरा नाम लिखना अनिवार्य है।'
    ]
  },
  {
    id: 'bpsc-civil',
    exam: 'BPSC (Civil Services CCE)',
    category: 'state-exams',
    verified: true,
    lastVerified: 'अक्टूबर 2026',
    source: 'https://bpsc.bih.nic.in/',
    photo: {
      label: 'Live Webcam Photo',
      formats: ['JPG', 'JPEG'],
      minKb: 20,
      maxKb: 100,
      minWidth: 350,
      maxWidth: 600,
      minHeight: 450,
      maxHeight: 700,
    },
    signature: {
      label: 'Signature (Hindi & Eng)',
      formats: ['JPG', 'JPEG'],
      minKb: 5,
      maxKb: 25,
      minWidth: 140,
      maxWidth: 240,
      minHeight: 60,
      maxHeight: 120,
    },
    notes: [
      'लाइव फोटो और हिंदी व अंग्रेजी दोनों हस्ताक्षर अलग-अलग (25KB से कम)।'
    ]
  }
];
