export type MaterialType =
  | "notes"
  | "mcq"
  | "pyq"
  | "revision"
  | "topic-test"
  | "mock-test";

export interface MaterialTypeInfo {
  id: MaterialType;
  name: string;
  description: string;
}

export const materialTypes: MaterialTypeInfo[] = [
  {
    id: "notes",
    name: "Notes",
    description: "Topic-wise detailed study notes",
  },
  {
    id: "mcq",
    name: "MCQ Practice",
    description: "Practice questions with answers",
  },
  {
    id: "pyq",
    name: "Previous Year Questions",
    description: "Previous year exam questions",
  },
  {
    id: "revision",
    name: "One Page Revision",
    description: "Quick revision material",
  },
  {
    id: "topic-test",
    name: "Topic Test",
    description: "Topic-wise practice test",
  },
  {
    id: "mock-test",
    name: "Mock Test",
    description: "Full exam-style practice test",
  },
];
