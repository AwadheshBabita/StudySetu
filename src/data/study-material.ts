export type StudyMaterialType =
  | 'notes'
  | 'mcq'
  | 'pyq'
  | 'revision'
  | 'topic-test';

export type StudyMaterial = {
  id: string;
  topicId: string;
  type: StudyMaterialType;
  title: string;
  description: string;
  available: boolean;
};

export const studyMaterials: StudyMaterial[] = [
  {
    id: 'analogy-notes',
    topicId: 'reasoning-analogy',
    type: 'notes',
    title: 'Analogy Notes',
    description: 'Short and focused notes for Analogy.',
    available: false,
  },
  {
    id: 'analogy-mcq',
    topicId: 'reasoning-analogy',
    type: 'mcq',
    title: 'Analogy MCQ Practice',
    description: 'Practice questions based on Analogy.',
    available: false,
  },
  {
    id: 'analogy-pyq',
    topicId: 'reasoning-analogy',
    type: 'pyq',
    title: 'Analogy Previous Year Questions',
    description: 'Previous year questions for Analogy.',
    available: false,
  },
  {
    id: 'analogy-revision',
    topicId: 'reasoning-analogy',
    type: 'revision',
    title: 'Analogy One-Page Revision',
    description: 'Quick revision material for Analogy.',
    available: false,
  },
  {
    id: 'analogy-test',
    topicId: 'reasoning-analogy',
    type: 'topic-test',
    title: 'Analogy Topic Test',
    description: 'Test your preparation for Analogy.',
    available: false,
  },
];
