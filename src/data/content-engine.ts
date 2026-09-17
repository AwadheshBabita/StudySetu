export type ContentType =
  | 'notes'
  | 'mcq'
  | 'pyq'
  | 'revision'
  | 'topic-test';

export type StudyContent = {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  type: ContentType;
  title: string;
  summary: string;
  content: string[];
  status: 'draft' | 'published';
};

export const studyContent: StudyContent[] = [
  {
    id: 'upsc-constitution-notes-demo',
    examId: 'upsc-cse',
    subjectId: 'upsc-polity',
    topicId: 'upsc-polity-constitution',
    type: 'notes',
    title: 'Indian Constitution — Basic Notes',
    summary: 'Foundation-level notes for UPSC preparation.',
    content: [
      'भारतीय संविधान भारत के शासन की मूल संवैधानिक व्यवस्था निर्धारित करता है।',
      'संविधान सभा ने संविधान को 26 नवंबर 1949 को अपनाया।',
      'संविधान 26 जनवरी 1950 को लागू हुआ।'
    ],
    status: 'published'
  },
  {
    id: 'upsc-constitution-revision-demo',
    examId: 'upsc-cse',
    subjectId: 'upsc-polity',
    topicId: 'upsc-polity-constitution',
    type: 'revision',
    title: 'Indian Constitution — One Page Revision',
    summary: 'Quick revision points.',
    content: [
      'Adoption: 26 November 1949',
      'Enforcement: 26 January 1950',
      'Constitutional framework: Government, rights, duties and institutions'
    ],
    status: 'published'
  },
  {
    id: 'upsc-constitution-pyq-demo',
    examId: 'upsc-cse',
    subjectId: 'upsc-polity',
    topicId: 'upsc-polity-constitution',
    type: 'pyq',
    title: 'Indian Constitution — PYQ Section',
    summary: 'Previous-year-question content area.',
    content: [
      'Verified previous-year questions will be added here after source verification.',
      'Questions will retain year and source metadata.'
    ],
    status: 'published'
  }
];
