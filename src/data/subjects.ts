export type Subject = {
  id: string;
  examId: string;
  name: string;
  description: string;
  active: boolean;
};

export const subjects: Subject[] = [
  { id: 'ssc-cgl-reasoning', examId: 'ssc-cgl', name: 'General Intelligence & Reasoning', description: 'Logical reasoning and problem solving', active: true },
  { id: 'ssc-cgl-quant', examId: 'ssc-cgl', name: 'Quantitative Aptitude', description: 'Arithmetic and mathematical concepts', active: true },
  { id: 'ssc-cgl-english', examId: 'ssc-cgl', name: 'English', description: 'Grammar, vocabulary and comprehension', active: true },
  { id: 'ssc-cgl-gk', examId: 'ssc-cgl', name: 'General Awareness', description: 'History, geography, polity and science', active: true },

  { id: 'ssc-chsl-reasoning', examId: 'ssc-chsl', name: 'General Intelligence', description: 'Reasoning and logical ability', active: true },
  { id: 'ssc-chsl-quant', examId: 'ssc-chsl', name: 'Quantitative Aptitude', description: 'Basic mathematics and arithmetic', active: true },
  { id: 'ssc-chsl-english', examId: 'ssc-chsl', name: 'English Language', description: 'Grammar, vocabulary and comprehension', active: true },
  { id: 'ssc-chsl-gk', examId: 'ssc-chsl', name: 'General Awareness', description: 'General knowledge and current affairs', active: true },

  { id: 'ssc-mts-reasoning', examId: 'ssc-mts', name: 'General Intelligence & Reasoning', description: 'Reasoning and logical ability', active: true },
  { id: 'ssc-mts-quant', examId: 'ssc-mts', name: 'Numerical & Mathematical Ability', description: 'Basic numerical ability', active: true },
  { id: 'ssc-mts-english', examId: 'ssc-mts', name: 'English Language', description: 'Basic English language skills', active: true },
  { id: 'ssc-mts-gk', examId: 'ssc-mts', name: 'General Awareness', description: 'General awareness and current affairs', active: true },

  { id: 'ssc-gd-reasoning', examId: 'ssc-gd', name: 'General Intelligence & Reasoning', description: 'Reasoning and analytical ability', active: true },
  { id: 'ssc-gd-quant', examId: 'ssc-gd', name: 'Elementary Mathematics', description: 'Basic mathematics', active: true },
  { id: 'ssc-gd-gk', examId: 'ssc-gd', name: 'General Knowledge & Awareness', description: 'General knowledge and current affairs', active: true },
  { id: 'ssc-gd-english', examId: 'ssc-gd', name: 'English / Hindi', description: 'Language ability', active: true },

  { id: 'rrb-ntpc-math', examId: 'rrb-ntpc', name: 'Mathematics', description: 'Railway examination mathematics', active: true },
  { id: 'rrb-ntpc-reasoning', examId: 'rrb-ntpc', name: 'General Intelligence & Reasoning', description: 'Reasoning and logical ability', active: true },
  { id: 'rrb-ntpc-gk', examId: 'rrb-ntpc', name: 'General Awareness', description: 'General awareness and current affairs', active: true },

  { id: 'rrb-group-d-math', examId: 'rrb-group-d', name: 'Mathematics', description: 'Basic mathematics', active: true },
  { id: 'rrb-group-d-reasoning', examId: 'rrb-group-d', name: 'General Intelligence & Reasoning', description: 'Reasoning ability', active: true },
  { id: 'rrb-group-d-science', examId: 'rrb-group-d', name: 'General Science', description: 'Physics, chemistry and life science', active: true },
  { id: 'rrb-group-d-gk', examId: 'rrb-group-d', name: 'General Awareness', description: 'General knowledge and current affairs', active: true },

  { id: 'rrb-alp-math', examId: 'rrb-alp', name: 'Mathematics', description: 'Railway examination mathematics', active: true },
  { id: 'rrb-alp-reasoning', examId: 'rrb-alp', name: 'General Intelligence & Reasoning', description: 'Reasoning ability', active: true },
  { id: 'rrb-alp-science', examId: 'rrb-alp', name: 'General Science', description: 'Science concepts', active: true },

  { id: 'ibps-po-quant', examId: 'ibps-po', name: 'Quantitative Aptitude', description: 'Banking mathematics and data interpretation', active: true },
  { id: 'ibps-po-reasoning', examId: 'ibps-po', name: 'Reasoning Ability', description: 'Logical and analytical reasoning', active: true },
  { id: 'ibps-po-english', examId: 'ibps-po', name: 'English Language', description: 'English language and comprehension', active: true },
  { id: 'ibps-po-awareness', examId: 'ibps-po', name: 'General / Banking Awareness', description: 'Banking and general awareness', active: true },

  { id: 'ibps-clerk-quant', examId: 'ibps-clerk', name: 'Numerical Ability', description: 'Numerical and arithmetic ability', active: true },
  { id: 'ibps-clerk-reasoning', examId: 'ibps-clerk', name: 'Reasoning Ability', description: 'Logical reasoning', active: true },
  { id: 'ibps-clerk-english', examId: 'ibps-clerk', name: 'English Language', description: 'English language skills', active: true },
  { id: 'ibps-clerk-awareness', examId: 'ibps-clerk', name: 'General / Banking Awareness', description: 'Banking and general awareness', active: true },

  { id: 'sbi-po-quant', examId: 'sbi-po', name: 'Quantitative Aptitude', description: 'Quantitative aptitude and data analysis', active: true },
  { id: 'sbi-po-reasoning', examId: 'sbi-po', name: 'Reasoning & Computer Aptitude', description: 'Reasoning and computer aptitude', active: true },
  { id: 'sbi-po-english', examId: 'sbi-po', name: 'English Language', description: 'English language and comprehension', active: true },
  { id: 'sbi-po-awareness', examId: 'sbi-po', name: 'General / Banking Awareness', description: 'Banking and financial awareness', active: true },

  { id: 'sbi-clerk-quant', examId: 'sbi-clerk', name: 'Numerical Ability', description: 'Numerical and arithmetic ability', active: true },
  { id: 'sbi-clerk-reasoning', examId: 'sbi-clerk', name: 'Reasoning Ability', description: 'Logical reasoning', active: true },
  { id: 'sbi-clerk-english', examId: 'sbi-clerk', name: 'English Language', description: 'English language skills', active: true },
  { id: 'sbi-clerk-awareness', examId: 'sbi-clerk', name: 'General / Banking Awareness', description: 'General and banking awareness', active: true },

  {
    id: 'upsc-gs1',
    examId: 'upsc-cse',
    name: 'General Studies Paper I',
    description: 'History, Geography, Society, Culture and related areas',
    active: true
  },
  {
    id: 'upsc-csat',
    examId: 'upsc-cse',
    name: 'CSAT / General Studies Paper II',
    description: 'Comprehension, reasoning, numeracy and analytical ability',
    active: true
  },
  {
    id: 'upsc-current-affairs',
    examId: 'upsc-cse',
    name: 'Current Affairs',
    description: 'Current events and important contemporary developments',
    active: true
  },
  {
    id: 'upsc-polity',
    examId: 'upsc-cse',
    name: 'Indian Polity & Governance',
    description: 'Constitution, polity, governance and institutional topics',
    active: true
  },
  {
    id: 'upsc-economy',
    examId: 'upsc-cse',
    name: 'Indian Economy',
    description: 'Economic concepts, development and public finance',
    active: true
  },
  {
    id: 'upsc-environment',
    examId: 'upsc-cse',
    name: 'Environment & Ecology',
    description: 'Ecology, biodiversity, environment and climate-related topics',
    active: true
  },
  {
    id: 'upsc-science',
    examId: 'upsc-cse',
    name: 'Science & Technology',
    description: 'General science and technology-related topics',
    active: true
  },

];
