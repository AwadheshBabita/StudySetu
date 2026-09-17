export type UPSCContentType =
  | "notes"
  | "mcq"
  | "pyq"
  | "revision"
  | "topic-test";

export interface UPSCContent {
  id: string;
  examId: string;
  subjectId: string;
  topicId: string;
  type: UPSCContentType;
  title: string;
  description: string;
  status: "draft" | "published";
  access: "free" | "premium";
  content: string[];
}

export const upscContent: UPSCContent[] = [
  {
    id: "upsc-content-polity-constitution-notes",
    examId: "upsc-cse",
    subjectId: "upsc-polity",
    topicId: "upsc-polity-constitution",
    type: "notes",
    title: "Indian Constitution – Complete Notes",
    description: "Foundation notes covering the Indian Constitution.",
    status: "published",
    access: "free",
    content: [
      "The Constitution of India is the supreme legal framework of the country.",
      "It defines the structure, powers and functions of government.",
      "It also protects fundamental rights and establishes constitutional principles.",
      "Important areas include the Preamble, Fundamental Rights, Directive Principles, Fundamental Duties and constitutional institutions.",
    ],
  },
  {
    id: "upsc-content-polity-constitution-mcq",
    examId: "upsc-cse",
    subjectId: "upsc-polity",
    topicId: "upsc-polity-constitution",
    type: "mcq",
    title: "Indian Constitution – MCQ Practice",
    description: "Practice questions for UPSC Constitution preparation.",
    status: "published",
    access: "free",
    content: [
      "Practice objective questions on constitutional features.",
      "Focus areas include the Preamble, Fundamental Rights and constitutional amendments.",
      "Review the explanation after attempting each question.",
    ],
  },
  {
    id: "upsc-content-polity-constitution-pyq",
    examId: "upsc-cse",
    subjectId: "upsc-polity",
    topicId: "upsc-polity-constitution",
    type: "pyq",
    title: "Indian Constitution – PYQ",
    description: "Previous-year-question practice collection.",
    status: "published",
    access: "free",
    content: [
      "Use previous-year questions to understand UPSC question patterns.",
      "Classify questions by constitutional concept and difficulty.",
      "Revise the underlying concept after every question.",
    ],
  },
  {
    id: "upsc-content-polity-constitution-revision",
    examId: "upsc-cse",
    subjectId: "upsc-polity",
    topicId: "upsc-polity-constitution",
    type: "revision",
    title: "Indian Constitution – One Page Revision",
    description: "Quick revision points for last-minute preparation.",
    status: "published",
    access: "free",
    content: [
      "Preamble: constitutional objectives and guiding values.",
      "Fundamental Rights: Part III of the Constitution.",
      "Directive Principles: Part IV of the Constitution.",
      "Fundamental Duties: Article 51A.",
      "Constitutional amendments are made through the procedure provided in Article 368.",
    ],
  },
  {
    id: "upsc-content-polity-constitution-topic-test",
    examId: "upsc-cse",
    subjectId: "upsc-polity",
    topicId: "upsc-polity-constitution",
    type: "topic-test",
    title: "Indian Constitution – Topic Test",
    description: "Topic-level assessment for Constitution preparation.",
    status: "published",
    access: "free",
    content: [
      "Test your understanding of constitutional structure and principles.",
      "Attempt the complete topic test before checking the explanations.",
      "Use the result to identify areas requiring further revision.",
    ],
  },
];

export default upscContent;
