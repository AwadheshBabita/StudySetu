export type Exam = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  active: boolean;
};

export const exams: Exam[] = [
  {
    id: 'ssc-cgl',
    name: 'SSC CGL',
    categoryId: 'ssc',
    description: 'Staff Selection Commission Combined Graduate Level',
    active: true,
  },
  {
    id: 'ssc-chsl',
    name: 'SSC CHSL',
    categoryId: 'ssc',
    description: 'Staff Selection Commission Combined Higher Secondary Level',
    active: true,
  },
  {
    id: 'ssc-mts',
    name: 'SSC MTS',
    categoryId: 'ssc',
    description: 'Staff Selection Commission Multi-Tasking Staff',
    active: true,
  },
  {
    id: 'ssc-gd',
    name: 'SSC GD',
    categoryId: 'ssc',
    description: 'SSC General Duty Constable recruitment examination',
    active: true,
  },
  {
    id: 'rrb-ntpc',
    name: 'RRB NTPC',
    categoryId: 'railway',
    description: 'Railway Recruitment Board Non-Technical Popular Categories',
    active: true,
  },
  {
    id: 'rrb-group-d',
    name: 'RRB Group D',
    categoryId: 'railway',
    description: 'Railway Recruitment Board Group D recruitment',
    active: true,
  },
  {
    id: 'rrb-alp',
    name: 'RRB ALP',
    categoryId: 'railway',
    description: 'Railway Recruitment Board Assistant Loco Pilot',
    active: true,
  },
  {
    id: 'ibps-po',
    name: 'IBPS PO',
    categoryId: 'banking',
    description: 'IBPS Probationary Officer recruitment examination',
    active: true,
  },
  {
    id: 'ibps-clerk',
    name: 'IBPS Clerk',
    categoryId: 'banking',
    description: 'IBPS clerical recruitment examination',
    active: true,
  },
  {
    id: 'sbi-po',
    name: 'SBI PO',
    categoryId: 'banking',
    description: 'State Bank of India Probationary Officer examination',
    active: true,
  },
  {
    id: 'sbi-clerk',
    name: 'SBI Clerk',
    categoryId: 'banking',
    description: 'State Bank of India Junior Associate examination',
    active: true,
  },

  {
    id: 'upsc-cse',
    categoryId: 'state',
    name: 'UPSC Civil Services Examination',
    description: 'UPSC Civil Services Examination study and practice module',
    active: true
  },

];
