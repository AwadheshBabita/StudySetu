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

  // =====================================================
  // UPSC CSE STUDY MATERIAL
  // =====================================================

  {
    id: 'upsc-gs1-ancient-history-notes',
    topicId: 'upsc-gs1-ancient-history',
    type: 'notes',
    title: 'UPSC Notes — Ancient Indian History',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-ancient-history-mcq',
    topicId: 'upsc-gs1-ancient-history',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Ancient Indian History',
    description: 'Topic-wise multiple choice practice',
    available: true
  },
  {
    id: 'upsc-gs1-ancient-history-pyq',
    topicId: 'upsc-gs1-ancient-history',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Ancient Indian History',
    description: 'Previous year question practice',
    available: true
  },
  {
    id: 'upsc-gs1-ancient-history-revision',
    topicId: 'upsc-gs1-ancient-history',
    type: 'revision',
    title: 'One Page Revision — Ancient Indian History',
    description: 'Quick revision material',
    available: true
  },
  {
    id: 'upsc-gs1-ancient-history-test',
    topicId: 'upsc-gs1-ancient-history',
    type: 'topic-test',
    title: 'Topic Test — Ancient Indian History',
    description: 'Topic-wise test',
    available: true
  },

  {
    id: 'upsc-gs1-modern-history-notes',
    topicId: 'upsc-gs1-modern-history',
    type: 'notes',
    title: 'UPSC Notes — Modern Indian History',
    description: 'Topic-wise study notes',
    available: true
  },
  {
    id: 'upsc-gs1-modern-history-mcq',
    topicId: 'upsc-gs1-modern-history',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Modern Indian History',
    description: 'Topic-wise MCQ practice',
    available: true
  },
  {
    id: 'upsc-gs1-modern-history-pyq',
    topicId: 'upsc-gs1-modern-history',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Modern Indian History',
    description: 'Previous year questions',
    available: true
  },
  {
    id: 'upsc-gs1-modern-history-revision',
    topicId: 'upsc-gs1-modern-history',
    type: 'revision',
    title: 'One Page Revision — Modern Indian History',
    description: 'Quick revision material',
    available: true
  },
  {
    id: 'upsc-gs1-modern-history-test',
    topicId: 'upsc-gs1-modern-history',
    type: 'topic-test',
    title: 'Topic Test — Modern Indian History',
    description: 'Topic-wise test',
    available: true
  },

  {
    id: 'upsc-polity-constitution-notes',
    topicId: 'upsc-polity-constitution',
    type: 'notes',
    title: 'UPSC Notes — Indian Constitution',
    description: 'Topic-wise polity notes',
    available: true
  },
  {
    id: 'upsc-polity-constitution-mcq',
    topicId: 'upsc-polity-constitution',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Indian Constitution',
    description: 'Polity MCQ practice',
    available: true
  },
  {
    id: 'upsc-polity-constitution-pyq',
    topicId: 'upsc-polity-constitution',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Indian Constitution',
    description: 'Previous year polity questions',
    available: true
  },
  {
    id: 'upsc-polity-constitution-revision',
    topicId: 'upsc-polity-constitution',
    type: 'revision',
    title: 'One Page Revision — Indian Constitution',
    description: 'Quick polity revision',
    available: true
  },
  {
    id: 'upsc-polity-constitution-test',
    topicId: 'upsc-polity-constitution',
    type: 'topic-test',
    title: 'Topic Test — Indian Constitution',
    description: 'Constitution topic test',
    available: true
  },

  {
    id: 'upsc-economy-basics-notes',
    topicId: 'upsc-economy-basics',
    type: 'notes',
    title: 'UPSC Notes — Basic Economic Concepts',
    description: 'Economy foundation notes',
    available: true
  },
  {
    id: 'upsc-economy-basics-mcq',
    topicId: 'upsc-economy-basics',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Basic Economic Concepts',
    description: 'Economy MCQ practice',
    available: true
  },
  {
    id: 'upsc-economy-basics-pyq',
    topicId: 'upsc-economy-basics',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Economy',
    description: 'Previous year economy questions',
    available: true
  },
  {
    id: 'upsc-economy-basics-revision',
    topicId: 'upsc-economy-basics',
    type: 'revision',
    title: 'One Page Revision — Economy Basics',
    description: 'Quick economy revision',
    available: true
  },
  {
    id: 'upsc-economy-basics-test',
    topicId: 'upsc-economy-basics',
    type: 'topic-test',
    title: 'Topic Test — Economy Basics',
    description: 'Economy topic test',
    available: true
  },

  {
    id: 'upsc-environment-ecology-notes',
    topicId: 'upsc-environment-ecology',
    type: 'notes',
    title: 'UPSC Notes — Ecology Basics',
    description: 'Environment and ecology notes',
    available: true
  },
  {
    id: 'upsc-environment-ecology-mcq',
    topicId: 'upsc-environment-ecology',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Ecology',
    description: 'Environment MCQ practice',
    available: true
  },
  {
    id: 'upsc-environment-ecology-pyq',
    topicId: 'upsc-environment-ecology',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Ecology',
    description: 'Previous year environment questions',
    available: true
  },
  {
    id: 'upsc-environment-ecology-revision',
    topicId: 'upsc-environment-ecology',
    type: 'revision',
    title: 'One Page Revision — Ecology',
    description: 'Quick environment revision',
    available: true
  },
  {
    id: 'upsc-environment-ecology-test',
    topicId: 'upsc-environment-ecology',
    type: 'topic-test',
    title: 'Topic Test — Ecology',
    description: 'Ecology topic test',
    available: true
  },

  {
    id: 'upsc-csat-comprehension-notes',
    topicId: 'upsc-csat-comprehension',
    type: 'notes',
    title: 'UPSC CSAT Notes — Reading Comprehension',
    description: 'CSAT comprehension notes',
    available: true
  },
  {
    id: 'upsc-csat-comprehension-mcq',
    topicId: 'upsc-csat-comprehension',
    type: 'mcq',
    title: 'UPSC CSAT Practice — Reading Comprehension',
    description: 'Comprehension practice',
    available: true
  },
  {
    id: 'upsc-csat-comprehension-pyq',
    topicId: 'upsc-csat-comprehension',
    type: 'pyq',
    title: 'UPSC CSAT PYQ — Reading Comprehension',
    description: 'Previous year CSAT practice',
    available: true
  },
  {
    id: 'upsc-csat-comprehension-revision',
    topicId: 'upsc-csat-comprehension',
    type: 'revision',
    title: 'One Page Revision — CSAT Comprehension',
    description: 'Quick CSAT revision',
    available: true
  },
  {
    id: 'upsc-csat-comprehension-test',
    topicId: 'upsc-csat-comprehension',
    type: 'topic-test',
    title: 'Topic Test — CSAT Comprehension',
    description: 'CSAT topic test',
    available: true
  },

  {
    id: 'upsc-gs1-ancient-history-topic-test',
    topicId: 'upsc-gs1-ancient-history',
    type: 'topic-test',
    title: 'UPSC Topic Test — Ancient Indian History',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-medieval-history-notes',
    topicId: 'upsc-gs1-medieval-history',
    type: 'notes',
    title: 'UPSC Notes — Medieval Indian History',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-medieval-history-mcq',
    topicId: 'upsc-gs1-medieval-history',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Medieval Indian History',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-medieval-history-pyq',
    topicId: 'upsc-gs1-medieval-history',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Medieval Indian History',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-medieval-history-revision',
    topicId: 'upsc-gs1-medieval-history',
    type: 'revision',
    title: 'UPSC One Page Revision — Medieval Indian History',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-medieval-history-topic-test',
    topicId: 'upsc-gs1-medieval-history',
    type: 'topic-test',
    title: 'UPSC Topic Test — Medieval Indian History',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-modern-history-topic-test',
    topicId: 'upsc-gs1-modern-history',
    type: 'topic-test',
    title: 'UPSC Topic Test — Modern Indian History',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-art-culture-notes',
    topicId: 'upsc-gs1-art-culture',
    type: 'notes',
    title: 'UPSC Notes — Art & Culture',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-art-culture-mcq',
    topicId: 'upsc-gs1-art-culture',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Art & Culture',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-art-culture-pyq',
    topicId: 'upsc-gs1-art-culture',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Art & Culture',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-art-culture-revision',
    topicId: 'upsc-gs1-art-culture',
    type: 'revision',
    title: 'UPSC One Page Revision — Art & Culture',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-art-culture-topic-test',
    topicId: 'upsc-gs1-art-culture',
    type: 'topic-test',
    title: 'UPSC Topic Test — Art & Culture',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-history-notes',
    topicId: 'upsc-gs1-world-history',
    type: 'notes',
    title: 'UPSC Notes — World History',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-history-mcq',
    topicId: 'upsc-gs1-world-history',
    type: 'mcq',
    title: 'UPSC MCQ Practice — World History',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-history-pyq',
    topicId: 'upsc-gs1-world-history',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — World History',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-history-revision',
    topicId: 'upsc-gs1-world-history',
    type: 'revision',
    title: 'UPSC One Page Revision — World History',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-history-topic-test',
    topicId: 'upsc-gs1-world-history',
    type: 'topic-test',
    title: 'UPSC Topic Test — World History',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-indian-geography-notes',
    topicId: 'upsc-gs1-indian-geography',
    type: 'notes',
    title: 'UPSC Notes — Indian Geography',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-indian-geography-mcq',
    topicId: 'upsc-gs1-indian-geography',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Indian Geography',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-indian-geography-pyq',
    topicId: 'upsc-gs1-indian-geography',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Indian Geography',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-indian-geography-revision',
    topicId: 'upsc-gs1-indian-geography',
    type: 'revision',
    title: 'UPSC One Page Revision — Indian Geography',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-indian-geography-topic-test',
    topicId: 'upsc-gs1-indian-geography',
    type: 'topic-test',
    title: 'UPSC Topic Test — Indian Geography',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-geography-notes',
    topicId: 'upsc-gs1-world-geography',
    type: 'notes',
    title: 'UPSC Notes — World Geography',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-geography-mcq',
    topicId: 'upsc-gs1-world-geography',
    type: 'mcq',
    title: 'UPSC MCQ Practice — World Geography',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-geography-pyq',
    topicId: 'upsc-gs1-world-geography',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — World Geography',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-geography-revision',
    topicId: 'upsc-gs1-world-geography',
    type: 'revision',
    title: 'UPSC One Page Revision — World Geography',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-world-geography-topic-test',
    topicId: 'upsc-gs1-world-geography',
    type: 'topic-test',
    title: 'UPSC Topic Test — World Geography',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-society-notes',
    topicId: 'upsc-gs1-society',
    type: 'notes',
    title: 'UPSC Notes — Indian Society',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-society-mcq',
    topicId: 'upsc-gs1-society',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Indian Society',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-society-pyq',
    topicId: 'upsc-gs1-society',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Indian Society',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-society-revision',
    topicId: 'upsc-gs1-society',
    type: 'revision',
    title: 'UPSC One Page Revision — Indian Society',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-gs1-society-topic-test',
    topicId: 'upsc-gs1-society',
    type: 'topic-test',
    title: 'UPSC Topic Test — Indian Society',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-comprehension-topic-test',
    topicId: 'upsc-csat-comprehension',
    type: 'topic-test',
    title: 'UPSC Topic Test — Reading Comprehension',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-basic-numeracy-notes',
    topicId: 'upsc-csat-basic-numeracy',
    type: 'notes',
    title: 'UPSC Notes — Basic Numeracy',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-basic-numeracy-mcq',
    topicId: 'upsc-csat-basic-numeracy',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Basic Numeracy',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-basic-numeracy-pyq',
    topicId: 'upsc-csat-basic-numeracy',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Basic Numeracy',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-basic-numeracy-revision',
    topicId: 'upsc-csat-basic-numeracy',
    type: 'revision',
    title: 'UPSC One Page Revision — Basic Numeracy',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-basic-numeracy-topic-test',
    topicId: 'upsc-csat-basic-numeracy',
    type: 'topic-test',
    title: 'UPSC Topic Test — Basic Numeracy',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-data-interpretation-notes',
    topicId: 'upsc-csat-data-interpretation',
    type: 'notes',
    title: 'UPSC Notes — Data Interpretation',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-data-interpretation-mcq',
    topicId: 'upsc-csat-data-interpretation',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Data Interpretation',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-data-interpretation-pyq',
    topicId: 'upsc-csat-data-interpretation',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Data Interpretation',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-data-interpretation-revision',
    topicId: 'upsc-csat-data-interpretation',
    type: 'revision',
    title: 'UPSC One Page Revision — Data Interpretation',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-data-interpretation-topic-test',
    topicId: 'upsc-csat-data-interpretation',
    type: 'topic-test',
    title: 'UPSC Topic Test — Data Interpretation',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-logical-reasoning-notes',
    topicId: 'upsc-csat-logical-reasoning',
    type: 'notes',
    title: 'UPSC Notes — Logical Reasoning',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-logical-reasoning-mcq',
    topicId: 'upsc-csat-logical-reasoning',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Logical Reasoning',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-logical-reasoning-pyq',
    topicId: 'upsc-csat-logical-reasoning',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Logical Reasoning',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-logical-reasoning-revision',
    topicId: 'upsc-csat-logical-reasoning',
    type: 'revision',
    title: 'UPSC One Page Revision — Logical Reasoning',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-logical-reasoning-topic-test',
    topicId: 'upsc-csat-logical-reasoning',
    type: 'topic-test',
    title: 'UPSC Topic Test — Logical Reasoning',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-analytical-ability-notes',
    topicId: 'upsc-csat-analytical-ability',
    type: 'notes',
    title: 'UPSC Notes — Analytical Ability',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-analytical-ability-mcq',
    topicId: 'upsc-csat-analytical-ability',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Analytical Ability',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-analytical-ability-pyq',
    topicId: 'upsc-csat-analytical-ability',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Analytical Ability',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-analytical-ability-revision',
    topicId: 'upsc-csat-analytical-ability',
    type: 'revision',
    title: 'UPSC One Page Revision — Analytical Ability',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-csat-analytical-ability-topic-test',
    topicId: 'upsc-csat-analytical-ability',
    type: 'topic-test',
    title: 'UPSC Topic Test — Analytical Ability',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-national-notes',
    topicId: 'upsc-ca-national',
    type: 'notes',
    title: 'UPSC Notes — National Current Affairs',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-national-mcq',
    topicId: 'upsc-ca-national',
    type: 'mcq',
    title: 'UPSC MCQ Practice — National Current Affairs',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-national-pyq',
    topicId: 'upsc-ca-national',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — National Current Affairs',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-national-revision',
    topicId: 'upsc-ca-national',
    type: 'revision',
    title: 'UPSC One Page Revision — National Current Affairs',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-national-topic-test',
    topicId: 'upsc-ca-national',
    type: 'topic-test',
    title: 'UPSC Topic Test — National Current Affairs',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-international-notes',
    topicId: 'upsc-ca-international',
    type: 'notes',
    title: 'UPSC Notes — International Current Affairs',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-international-mcq',
    topicId: 'upsc-ca-international',
    type: 'mcq',
    title: 'UPSC MCQ Practice — International Current Affairs',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-international-pyq',
    topicId: 'upsc-ca-international',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — International Current Affairs',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-international-revision',
    topicId: 'upsc-ca-international',
    type: 'revision',
    title: 'UPSC One Page Revision — International Current Affairs',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-international-topic-test',
    topicId: 'upsc-ca-international',
    type: 'topic-test',
    title: 'UPSC Topic Test — International Current Affairs',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-government-notes',
    topicId: 'upsc-ca-government',
    type: 'notes',
    title: 'UPSC Notes — Government Schemes & Policies',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-government-mcq',
    topicId: 'upsc-ca-government',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Government Schemes & Policies',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-government-pyq',
    topicId: 'upsc-ca-government',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Government Schemes & Policies',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-government-revision',
    topicId: 'upsc-ca-government',
    type: 'revision',
    title: 'UPSC One Page Revision — Government Schemes & Policies',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-government-topic-test',
    topicId: 'upsc-ca-government',
    type: 'topic-test',
    title: 'UPSC Topic Test — Government Schemes & Policies',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-science-notes',
    topicId: 'upsc-ca-science',
    type: 'notes',
    title: 'UPSC Notes — Science & Technology Current Affairs',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-science-mcq',
    topicId: 'upsc-ca-science',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Science & Technology Current Affairs',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-science-pyq',
    topicId: 'upsc-ca-science',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Science & Technology Current Affairs',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-science-revision',
    topicId: 'upsc-ca-science',
    type: 'revision',
    title: 'UPSC One Page Revision — Science & Technology Current Affairs',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-science-topic-test',
    topicId: 'upsc-ca-science',
    type: 'topic-test',
    title: 'UPSC Topic Test — Science & Technology Current Affairs',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-environment-notes',
    topicId: 'upsc-ca-environment',
    type: 'notes',
    title: 'UPSC Notes — Environment Current Affairs',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-environment-mcq',
    topicId: 'upsc-ca-environment',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Environment Current Affairs',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-environment-pyq',
    topicId: 'upsc-ca-environment',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Environment Current Affairs',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-environment-revision',
    topicId: 'upsc-ca-environment',
    type: 'revision',
    title: 'UPSC One Page Revision — Environment Current Affairs',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-ca-environment-topic-test',
    topicId: 'upsc-ca-environment',
    type: 'topic-test',
    title: 'UPSC Topic Test — Environment Current Affairs',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-constitution-topic-test',
    topicId: 'upsc-polity-constitution',
    type: 'topic-test',
    title: 'UPSC Topic Test — Indian Constitution',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-fundamental-rights-notes',
    topicId: 'upsc-polity-fundamental-rights',
    type: 'notes',
    title: 'UPSC Notes — Fundamental Rights & Duties',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-fundamental-rights-mcq',
    topicId: 'upsc-polity-fundamental-rights',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Fundamental Rights & Duties',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-fundamental-rights-pyq',
    topicId: 'upsc-polity-fundamental-rights',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Fundamental Rights & Duties',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-fundamental-rights-revision',
    topicId: 'upsc-polity-fundamental-rights',
    type: 'revision',
    title: 'UPSC One Page Revision — Fundamental Rights & Duties',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-fundamental-rights-topic-test',
    topicId: 'upsc-polity-fundamental-rights',
    type: 'topic-test',
    title: 'UPSC Topic Test — Fundamental Rights & Duties',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-parliament-notes',
    topicId: 'upsc-polity-parliament',
    type: 'notes',
    title: 'UPSC Notes — Parliament',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-parliament-mcq',
    topicId: 'upsc-polity-parliament',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Parliament',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-parliament-pyq',
    topicId: 'upsc-polity-parliament',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Parliament',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-parliament-revision',
    topicId: 'upsc-polity-parliament',
    type: 'revision',
    title: 'UPSC One Page Revision — Parliament',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-parliament-topic-test',
    topicId: 'upsc-polity-parliament',
    type: 'topic-test',
    title: 'UPSC Topic Test — Parliament',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-judiciary-notes',
    topicId: 'upsc-polity-judiciary',
    type: 'notes',
    title: 'UPSC Notes — Judiciary',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-judiciary-mcq',
    topicId: 'upsc-polity-judiciary',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Judiciary',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-judiciary-pyq',
    topicId: 'upsc-polity-judiciary',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Judiciary',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-judiciary-revision',
    topicId: 'upsc-polity-judiciary',
    type: 'revision',
    title: 'UPSC One Page Revision — Judiciary',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-judiciary-topic-test',
    topicId: 'upsc-polity-judiciary',
    type: 'topic-test',
    title: 'UPSC Topic Test — Judiciary',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-executive-notes',
    topicId: 'upsc-polity-executive',
    type: 'notes',
    title: 'UPSC Notes — Union & State Executive',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-executive-mcq',
    topicId: 'upsc-polity-executive',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Union & State Executive',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-executive-pyq',
    topicId: 'upsc-polity-executive',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Union & State Executive',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-executive-revision',
    topicId: 'upsc-polity-executive',
    type: 'revision',
    title: 'UPSC One Page Revision — Union & State Executive',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-executive-topic-test',
    topicId: 'upsc-polity-executive',
    type: 'topic-test',
    title: 'UPSC Topic Test — Union & State Executive',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-governance-notes',
    topicId: 'upsc-polity-governance',
    type: 'notes',
    title: 'UPSC Notes — Governance',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-governance-mcq',
    topicId: 'upsc-polity-governance',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Governance',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-governance-pyq',
    topicId: 'upsc-polity-governance',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Governance',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-governance-revision',
    topicId: 'upsc-polity-governance',
    type: 'revision',
    title: 'UPSC One Page Revision — Governance',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-polity-governance-topic-test',
    topicId: 'upsc-polity-governance',
    type: 'topic-test',
    title: 'UPSC Topic Test — Governance',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-basics-topic-test',
    topicId: 'upsc-economy-basics',
    type: 'topic-test',
    title: 'UPSC Topic Test — Basic Economic Concepts',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-banking-notes',
    topicId: 'upsc-economy-banking',
    type: 'notes',
    title: 'UPSC Notes — Banking & Monetary System',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-banking-mcq',
    topicId: 'upsc-economy-banking',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Banking & Monetary System',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-banking-pyq',
    topicId: 'upsc-economy-banking',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Banking & Monetary System',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-banking-revision',
    topicId: 'upsc-economy-banking',
    type: 'revision',
    title: 'UPSC One Page Revision — Banking & Monetary System',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-banking-topic-test',
    topicId: 'upsc-economy-banking',
    type: 'topic-test',
    title: 'UPSC Topic Test — Banking & Monetary System',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-budget-notes',
    topicId: 'upsc-economy-budget',
    type: 'notes',
    title: 'UPSC Notes — Budget & Public Finance',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-budget-mcq',
    topicId: 'upsc-economy-budget',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Budget & Public Finance',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-budget-pyq',
    topicId: 'upsc-economy-budget',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Budget & Public Finance',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-budget-revision',
    topicId: 'upsc-economy-budget',
    type: 'revision',
    title: 'UPSC One Page Revision — Budget & Public Finance',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-budget-topic-test',
    topicId: 'upsc-economy-budget',
    type: 'topic-test',
    title: 'UPSC Topic Test — Budget & Public Finance',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-inflation-notes',
    topicId: 'upsc-economy-inflation',
    type: 'notes',
    title: 'UPSC Notes — Inflation',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-inflation-mcq',
    topicId: 'upsc-economy-inflation',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Inflation',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-inflation-pyq',
    topicId: 'upsc-economy-inflation',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Inflation',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-inflation-revision',
    topicId: 'upsc-economy-inflation',
    type: 'revision',
    title: 'UPSC One Page Revision — Inflation',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-inflation-topic-test',
    topicId: 'upsc-economy-inflation',
    type: 'topic-test',
    title: 'UPSC Topic Test — Inflation',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-development-notes',
    topicId: 'upsc-economy-development',
    type: 'notes',
    title: 'UPSC Notes — Economic Development',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-development-mcq',
    topicId: 'upsc-economy-development',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Economic Development',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-development-pyq',
    topicId: 'upsc-economy-development',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Economic Development',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-development-revision',
    topicId: 'upsc-economy-development',
    type: 'revision',
    title: 'UPSC One Page Revision — Economic Development',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-economy-development-topic-test',
    topicId: 'upsc-economy-development',
    type: 'topic-test',
    title: 'UPSC Topic Test — Economic Development',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-ecology-topic-test',
    topicId: 'upsc-environment-ecology',
    type: 'topic-test',
    title: 'UPSC Topic Test — Ecology Basics',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-biodiversity-notes',
    topicId: 'upsc-environment-biodiversity',
    type: 'notes',
    title: 'UPSC Notes — Biodiversity',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-biodiversity-mcq',
    topicId: 'upsc-environment-biodiversity',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Biodiversity',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-biodiversity-pyq',
    topicId: 'upsc-environment-biodiversity',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Biodiversity',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-biodiversity-revision',
    topicId: 'upsc-environment-biodiversity',
    type: 'revision',
    title: 'UPSC One Page Revision — Biodiversity',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-biodiversity-topic-test',
    topicId: 'upsc-environment-biodiversity',
    type: 'topic-test',
    title: 'UPSC Topic Test — Biodiversity',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-climate-notes',
    topicId: 'upsc-environment-climate',
    type: 'notes',
    title: 'UPSC Notes — Climate Change',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-climate-mcq',
    topicId: 'upsc-environment-climate',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Climate Change',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-climate-pyq',
    topicId: 'upsc-environment-climate',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Climate Change',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-climate-revision',
    topicId: 'upsc-environment-climate',
    type: 'revision',
    title: 'UPSC One Page Revision — Climate Change',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-climate-topic-test',
    topicId: 'upsc-environment-climate',
    type: 'topic-test',
    title: 'UPSC Topic Test — Climate Change',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-pollution-notes',
    topicId: 'upsc-environment-pollution',
    type: 'notes',
    title: 'UPSC Notes — Environmental Pollution',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-pollution-mcq',
    topicId: 'upsc-environment-pollution',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Environmental Pollution',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-pollution-pyq',
    topicId: 'upsc-environment-pollution',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Environmental Pollution',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-pollution-revision',
    topicId: 'upsc-environment-pollution',
    type: 'revision',
    title: 'UPSC One Page Revision — Environmental Pollution',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-pollution-topic-test',
    topicId: 'upsc-environment-pollution',
    type: 'topic-test',
    title: 'UPSC Topic Test — Environmental Pollution',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-conservation-notes',
    topicId: 'upsc-environment-conservation',
    type: 'notes',
    title: 'UPSC Notes — Conservation',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-conservation-mcq',
    topicId: 'upsc-environment-conservation',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Conservation',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-conservation-pyq',
    topicId: 'upsc-environment-conservation',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Conservation',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-conservation-revision',
    topicId: 'upsc-environment-conservation',
    type: 'revision',
    title: 'UPSC One Page Revision — Conservation',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-environment-conservation-topic-test',
    topicId: 'upsc-environment-conservation',
    type: 'topic-test',
    title: 'UPSC Topic Test — Conservation',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-physics-notes',
    topicId: 'upsc-science-physics',
    type: 'notes',
    title: 'UPSC Notes — General Physics',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-physics-mcq',
    topicId: 'upsc-science-physics',
    type: 'mcq',
    title: 'UPSC MCQ Practice — General Physics',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-physics-pyq',
    topicId: 'upsc-science-physics',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — General Physics',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-physics-revision',
    topicId: 'upsc-science-physics',
    type: 'revision',
    title: 'UPSC One Page Revision — General Physics',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-physics-topic-test',
    topicId: 'upsc-science-physics',
    type: 'topic-test',
    title: 'UPSC Topic Test — General Physics',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-chemistry-notes',
    topicId: 'upsc-science-chemistry',
    type: 'notes',
    title: 'UPSC Notes — General Chemistry',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-chemistry-mcq',
    topicId: 'upsc-science-chemistry',
    type: 'mcq',
    title: 'UPSC MCQ Practice — General Chemistry',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-chemistry-pyq',
    topicId: 'upsc-science-chemistry',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — General Chemistry',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-chemistry-revision',
    topicId: 'upsc-science-chemistry',
    type: 'revision',
    title: 'UPSC One Page Revision — General Chemistry',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-chemistry-topic-test',
    topicId: 'upsc-science-chemistry',
    type: 'topic-test',
    title: 'UPSC Topic Test — General Chemistry',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biology-notes',
    topicId: 'upsc-science-biology',
    type: 'notes',
    title: 'UPSC Notes — General Biology',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biology-mcq',
    topicId: 'upsc-science-biology',
    type: 'mcq',
    title: 'UPSC MCQ Practice — General Biology',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biology-pyq',
    topicId: 'upsc-science-biology',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — General Biology',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biology-revision',
    topicId: 'upsc-science-biology',
    type: 'revision',
    title: 'UPSC One Page Revision — General Biology',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biology-topic-test',
    topicId: 'upsc-science-biology',
    type: 'topic-test',
    title: 'UPSC Topic Test — General Biology',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-space-notes',
    topicId: 'upsc-science-space',
    type: 'notes',
    title: 'UPSC Notes — Space Technology',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-space-mcq',
    topicId: 'upsc-science-space',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Space Technology',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-space-pyq',
    topicId: 'upsc-science-space',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Space Technology',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-space-revision',
    topicId: 'upsc-science-space',
    type: 'revision',
    title: 'UPSC One Page Revision — Space Technology',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-space-topic-test',
    topicId: 'upsc-science-space',
    type: 'topic-test',
    title: 'UPSC Topic Test — Space Technology',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biotechnology-notes',
    topicId: 'upsc-science-biotechnology',
    type: 'notes',
    title: 'UPSC Notes — Biotechnology',
    description: 'Topic-wise study notes for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biotechnology-mcq',
    topicId: 'upsc-science-biotechnology',
    type: 'mcq',
    title: 'UPSC MCQ Practice — Biotechnology',
    description: 'Topic-wise multiple choice practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biotechnology-pyq',
    topicId: 'upsc-science-biotechnology',
    type: 'pyq',
    title: 'UPSC Previous Year Questions — Biotechnology',
    description: 'Previous year question practice for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biotechnology-revision',
    topicId: 'upsc-science-biotechnology',
    type: 'revision',
    title: 'UPSC One Page Revision — Biotechnology',
    description: 'Quick revision material for UPSC preparation',
    available: true
  },
  {
    id: 'upsc-science-biotechnology-topic-test',
    topicId: 'upsc-science-biotechnology',
    type: 'topic-test',
    title: 'UPSC Topic Test — Biotechnology',
    description: 'Topic-wise practice test for UPSC preparation',
    available: true
  },

];
