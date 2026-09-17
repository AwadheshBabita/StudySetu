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
  description: string;
  status: 'draft' | 'published';
  access: 'free' | 'premium';
};

export type MCQQuestion = {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
};

export type TestDefinition = {
  id: string;
  examId: string;
  title: string;
  type: 'topic-test' | 'mock-test';
  questionIds: string[];
  durationMinutes: number;
  negativeMarking: boolean;
  published: boolean;
};
