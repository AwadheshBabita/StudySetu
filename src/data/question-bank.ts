export type Question = {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const questionBank: Question[] = [
  {
    id: 'upsc-demo-polity-001',
    examId: 'upsc-cse',
    subjectId: 'upsc-polity',
    topicId: 'upsc-polity-constitution',
    question: 'भारत का संविधान कब लागू हुआ?',
    options: [
      '15 अगस्त 1947',
      '26 जनवरी 1950',
      '26 नवंबर 1949',
      '2 अक्टूबर 1950'
    ],
    answer: 1,
    explanation:
      'भारत का संविधान 26 जनवरी 1950 को लागू हुआ। 26 नवंबर 1949 को संविधान को अपनाया गया था।'
  },
  {
    id: 'upsc-demo-gs1-001',
    examId: 'upsc-cse',
    subjectId: 'upsc-gs1',
    topicId: 'upsc-gs1-modern-history',
    question: 'भारतीय राष्ट्रीय कांग्रेस की स्थापना किस वर्ष हुई?',
    options: [
      '1885',
      '1887',
      '1905',
      '1919'
    ],
    answer: 0,
    explanation:
      'भारतीय राष्ट्रीय कांग्रेस की स्थापना 1885 में हुई थी।'
  },
  {
    id: 'upsc-demo-economy-001',
    examId: 'upsc-cse',
    subjectId: 'upsc-economy',
    topicId: 'upsc-economy-inflation',
    question: 'मुद्रास्फीति का सामान्य अर्थ क्या है?',
    options: [
      'कीमतों के सामान्य स्तर में लगातार वृद्धि',
      'उत्पादन में हमेशा कमी',
      'बेरोजगारी का समाप्त होना',
      'निर्यात का पूरी तरह बंद होना'
    ],
    answer: 0,
    explanation:
      'मुद्रास्फीति सामान्यतः अर्थव्यवस्था में वस्तुओं और सेवाओं के सामान्य मूल्य स्तर में वृद्धि को कहा जाता है।'
  },
  {
    id: 'upsc-demo-environment-001',
    examId: 'upsc-cse',
    subjectId: 'upsc-environment',
    topicId: 'upsc-environment-biodiversity',
    question: 'जैव विविधता का संबंध मुख्यतः किससे है?',
    options: [
      'जीवों की विविधता',
      'केवल मौसम',
      'केवल मिट्टी',
      'केवल जल'
    ],
    answer: 0,
    explanation:
      'जैव विविधता से तात्पर्य जीवों, प्रजातियों और पारिस्थितिक तंत्रों की विविधता से है।'
  },
  {
    id: 'upsc-demo-csat-001',
    examId: 'upsc-cse',
    subjectId: 'upsc-csat',
    topicId: 'upsc-csat-numeracy',
    question: 'यदि किसी संख्या का 20% = 50 है, तो वह संख्या क्या होगी?',
    options: [
      '100',
      '150',
      '200',
      '250'
    ],
    answer: 3,
    explanation:
      '20% = 50 होने पर 100% = 50 × 100 ÷ 20 = 250।'
  }
];
