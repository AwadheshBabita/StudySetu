export type ExamCategory = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

export const examCategories: ExamCategory[] = [
  {
    id: 'ssc',
    name: 'SSC',
    description: 'Staff Selection Commission examinations',
    active: true,
  },
  {
    id: 'railway',
    name: 'Railway',
    description: 'Railway recruitment examinations',
    active: true,
  },
  {
    id: 'banking',
    name: 'Banking',
    description: 'Banking recruitment examinations',
    active: true,
  },
  {
    id: 'state-exams',
    name: 'State Exams',
    description: 'State-level government examinations',
    active: true,
  },
  {
    id: 'police',
    name: 'Police',
    description: 'Police and related recruitment examinations',
    active: true,
  },

  {
    id: 'upsc',
    name: 'UPSC',
    description: 'Union Public Service Commission examinations',
    active: true
  },

];
