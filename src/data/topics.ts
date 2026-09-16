export type Topic = {
  id: string;
  subjectId: string;
  name: string;
  active: boolean;
};

export const topics: Topic[] = [
  // SSC CGL
  { id: 'cgl-reasoning-analogy', subjectId: 'ssc-cgl-reasoning', name: 'Analogy', active: true },
  { id: 'cgl-reasoning-classification', subjectId: 'ssc-cgl-reasoning', name: 'Classification', active: true },
  { id: 'cgl-reasoning-coding', subjectId: 'ssc-cgl-reasoning', name: 'Coding-Decoding', active: true },
  { id: 'cgl-reasoning-series', subjectId: 'ssc-cgl-reasoning', name: 'Series', active: true },

  { id: 'cgl-quant-number', subjectId: 'ssc-cgl-quant', name: 'Number System', active: true },
  { id: 'cgl-quant-percentage', subjectId: 'ssc-cgl-quant', name: 'Percentage', active: true },
  { id: 'cgl-quant-profit', subjectId: 'ssc-cgl-quant', name: 'Profit & Loss', active: true },
  { id: 'cgl-quant-average', subjectId: 'ssc-cgl-quant', name: 'Average', active: true },

  { id: 'cgl-english-grammar', subjectId: 'ssc-cgl-english', name: 'Grammar', active: true },
  { id: 'cgl-english-vocabulary', subjectId: 'ssc-cgl-english', name: 'Vocabulary', active: true },
  { id: 'cgl-english-comprehension', subjectId: 'ssc-cgl-english', name: 'Comprehension', active: true },

  { id: 'cgl-gk-history', subjectId: 'ssc-cgl-gk', name: 'History', active: true },
  { id: 'cgl-gk-geography', subjectId: 'ssc-cgl-gk', name: 'Geography', active: true },
  { id: 'cgl-gk-polity', subjectId: 'ssc-cgl-gk', name: 'Indian Polity', active: true },
  { id: 'cgl-gk-science', subjectId: 'ssc-cgl-gk', name: 'General Science', active: true },

  // SSC CHSL
  { id: 'chsl-reasoning-analogy', subjectId: 'ssc-chsl-reasoning', name: 'Analogy', active: true },
  { id: 'chsl-reasoning-series', subjectId: 'ssc-chsl-reasoning', name: 'Series', active: true },
  { id: 'chsl-reasoning-coding', subjectId: 'ssc-chsl-reasoning', name: 'Coding-Decoding', active: true },
  { id: 'chsl-quant-number', subjectId: 'ssc-chsl-quant', name: 'Number System', active: true },
  { id: 'chsl-quant-percentage', subjectId: 'ssc-chsl-quant', name: 'Percentage', active: true },
  { id: 'chsl-quant-profit', subjectId: 'ssc-chsl-quant', name: 'Profit & Loss', active: true },
  { id: 'chsl-english-grammar', subjectId: 'ssc-chsl-english', name: 'Grammar', active: true },
  { id: 'chsl-english-vocabulary', subjectId: 'ssc-chsl-english', name: 'Vocabulary', active: true },
  { id: 'chsl-gk-history', subjectId: 'ssc-chsl-gk', name: 'History', active: true },
  { id: 'chsl-gk-geography', subjectId: 'ssc-chsl-gk', name: 'Geography', active: true },
  { id: 'chsl-gk-science', subjectId: 'ssc-chsl-gk', name: 'General Science', active: true },

  // SSC MTS
  { id: 'mts-reasoning-analogy', subjectId: 'ssc-mts-reasoning', name: 'Analogy', active: true },
  { id: 'mts-reasoning-series', subjectId: 'ssc-mts-reasoning', name: 'Series', active: true },
  { id: 'mts-reasoning-coding', subjectId: 'ssc-mts-reasoning', name: 'Coding-Decoding', active: true },
  { id: 'mts-quant-number', subjectId: 'ssc-mts-quant', name: 'Number System', active: true },
  { id: 'mts-quant-percentage', subjectId: 'ssc-mts-quant', name: 'Percentage', active: true },
  { id: 'mts-quant-profit', subjectId: 'ssc-mts-quant', name: 'Profit & Loss', active: true },
  { id: 'mts-english-grammar', subjectId: 'ssc-mts-english', name: 'Grammar', active: true },
  { id: 'mts-english-vocabulary', subjectId: 'ssc-mts-english', name: 'Vocabulary', active: true },
  { id: 'mts-gk-history', subjectId: 'ssc-mts-gk', name: 'History', active: true },
  { id: 'mts-gk-geography', subjectId: 'ssc-mts-gk', name: 'Geography', active: true },
  { id: 'mts-gk-science', subjectId: 'ssc-mts-gk', name: 'General Science', active: true },

  // SSC GD
  { id: 'gd-reasoning-analogy', subjectId: 'ssc-gd-reasoning', name: 'Analogy', active: true },
  { id: 'gd-reasoning-series', subjectId: 'ssc-gd-reasoning', name: 'Series', active: true },
  { id: 'gd-reasoning-coding', subjectId: 'ssc-gd-reasoning', name: 'Coding-Decoding', active: true },
  { id: 'gd-quant-number', subjectId: 'ssc-gd-quant', name: 'Number System', active: true },
  { id: 'gd-quant-percentage', subjectId: 'ssc-gd-quant', name: 'Percentage', active: true },
  { id: 'gd-quant-profit', subjectId: 'ssc-gd-quant', name: 'Profit & Loss', active: true },
  { id: 'gd-gk-history', subjectId: 'ssc-gd-gk', name: 'History', active: true },
  { id: 'gd-gk-geography', subjectId: 'ssc-gd-gk', name: 'Geography', active: true },
  { id: 'gd-gk-science', subjectId: 'ssc-gd-gk', name: 'General Science', active: true },
  { id: 'gd-english-grammar', subjectId: 'ssc-gd-english', name: 'Grammar', active: true },

  // Railway
  { id: 'ntpc-math-number', subjectId: 'rrb-ntpc-math', name: 'Number System', active: true },
  { id: 'ntpc-math-percentage', subjectId: 'rrb-ntpc-math', name: 'Percentage', active: true },
  { id: 'ntpc-math-profit', subjectId: 'rrb-ntpc-math', name: 'Profit & Loss', active: true },
  { id: 'ntpc-reasoning-series', subjectId: 'rrb-ntpc-reasoning', name: 'Series', active: true },
  { id: 'ntpc-reasoning-coding', subjectId: 'rrb-ntpc-reasoning', name: 'Coding-Decoding', active: true },
  { id: 'ntpc-gk-history', subjectId: 'rrb-ntpc-gk', name: 'History', active: true },
  { id: 'ntpc-gk-geography', subjectId: 'rrb-ntpc-gk', name: 'Geography', active: true },

  { id: 'groupd-math-number', subjectId: 'rrb-group-d-math', name: 'Number System', active: true },
  { id: 'groupd-math-percentage', subjectId: 'rrb-group-d-math', name: 'Percentage', active: true },
  { id: 'groupd-reasoning-series', subjectId: 'rrb-group-d-reasoning', name: 'Series', active: true },
  { id: 'groupd-reasoning-coding', subjectId: 'rrb-group-d-reasoning', name: 'Coding-Decoding', active: true },
  { id: 'groupd-science-physics', subjectId: 'rrb-group-d-science', name: 'Physics', active: true },
  { id: 'groupd-science-chemistry', subjectId: 'rrb-group-d-science', name: 'Chemistry', active: true },
  { id: 'groupd-gk-history', subjectId: 'rrb-group-d-gk', name: 'History', active: true },
  { id: 'groupd-gk-geography', subjectId: 'rrb-group-d-gk', name: 'Geography', active: true },

  { id: 'alp-math-number', subjectId: 'rrb-alp-math', name: 'Number System', active: true },
  { id: 'alp-math-percentage', subjectId: 'rrb-alp-math', name: 'Percentage', active: true },
  { id: 'alp-reasoning-series', subjectId: 'rrb-alp-reasoning', name: 'Series', active: true },
  { id: 'alp-reasoning-coding', subjectId: 'rrb-alp-reasoning', name: 'Coding-Decoding', active: true },
  { id: 'alp-science-physics', subjectId: 'rrb-alp-science', name: 'Physics', active: true },
  { id: 'alp-science-electricity', subjectId: 'rrb-alp-science', name: 'Electricity', active: true },

  // Banking
  { id: 'ibpspo-quant-percentage', subjectId: 'ibps-po-quant', name: 'Percentage', active: true },
  { id: 'ibpspo-quant-profit', subjectId: 'ibps-po-quant', name: 'Profit & Loss', active: true },
  { id: 'ibpspo-reasoning-series', subjectId: 'ibps-po-reasoning', name: 'Series', active: true },
  { id: 'ibpspo-reasoning-puzzle', subjectId: 'ibps-po-reasoning', name: 'Puzzles', active: true },
  { id: 'ibpspo-english-grammar', subjectId: 'ibps-po-english', name: 'Grammar', active: true },
  { id: 'ibpspo-english-comprehension', subjectId: 'ibps-po-english', name: 'Reading Comprehension', active: true },
  { id: 'ibpspo-awareness-banking', subjectId: 'ibps-po-awareness', name: 'Banking Awareness', active: true },
  { id: 'ibpspo-awareness-current', subjectId: 'ibps-po-awareness', name: 'Current Affairs', active: true },

  { id: 'ibpsclerk-quant-percentage', subjectId: 'ibps-clerk-quant', name: 'Percentage', active: true },
  { id: 'ibpsclerk-quant-average', subjectId: 'ibps-clerk-quant', name: 'Average', active: true },
  { id: 'ibpsclerk-reasoning-series', subjectId: 'ibps-clerk-reasoning', name: 'Series', active: true },
  { id: 'ibpsclerk-reasoning-puzzle', subjectId: 'ibps-clerk-reasoning', name: 'Puzzles', active: true },
  { id: 'ibpsclerk-english-grammar', subjectId: 'ibps-clerk-english', name: 'Grammar', active: true },
  { id: 'ibpsclerk-awareness-banking', subjectId: 'ibps-clerk-awareness', name: 'Banking Awareness', active: true },

  { id: 'sbipo-quant-percentage', subjectId: 'sbi-po-quant', name: 'Percentage', active: true },
  { id: 'sbipo-quant-profit', subjectId: 'sbi-po-quant', name: 'Profit & Loss', active: true },
  { id: 'sbipo-reasoning-puzzle', subjectId: 'sbi-po-reasoning', name: 'Puzzles', active: true },
  { id: 'sbipo-reasoning-series', subjectId: 'sbi-po-reasoning', name: 'Series', active: true },
  { id: 'sbipo-english-grammar', subjectId: 'sbi-po-english', name: 'Grammar', active: true },
  { id: 'sbipo-awareness-banking', subjectId: 'sbi-po-awareness', name: 'Banking Awareness', active: true },

  { id: 'sbiclerk-quant-percentage', subjectId: 'sbi-clerk-quant', name: 'Percentage', active: true },
  { id: 'sbiclerk-quant-average', subjectId: 'sbi-clerk-quant', name: 'Average', active: true },
  { id: 'sbiclerk-reasoning-series', subjectId: 'sbi-clerk-reasoning', name: 'Series', active: true },
  { id: 'sbiclerk-reasoning-puzzle', subjectId: 'sbi-clerk-reasoning', name: 'Puzzles', active: true },
  { id: 'sbiclerk-english-grammar', subjectId: 'sbi-clerk-english', name: 'Grammar', active: true },
  { id: 'sbiclerk-awareness-banking', subjectId: 'sbi-clerk-awareness', name: 'Banking Awareness', active: true },
];
