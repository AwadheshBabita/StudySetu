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
  source?: string;
  photo?: FileRequirement;
  signature?: FileRequirement;
  documents?: string[];
  notes?: string[];
};

export const examRequirements: ExamRequirement[] = [
  {
    id: 'ssc-cgl-2026',
    exam: 'SSC CGL 2026',
    category: 'SSC',
    verified: false,
    source: 'https://ssc.gov.in/',
    signature: {
      label: 'Signature',
      formats: ['JPG', 'JPEG'],
      minKb: 10,
      maxKb: 20,
    },
    notes: [
      'Signature image should be about 6.0 cm wide × 2.0 cm high.',
      'Signature should be clear and not blurred or miniature.',
      'Photo requirements should be followed according to the current SSC application module/notification.',
      'Always verify the latest official notification before final submission.',
    ],
  },
];
