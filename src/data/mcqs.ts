export interface MCQOption {
  id: string;
  text: string;
}

export interface MCQ {
  id: string;
  examId: string;
  topicId: string;
  question: string;
  options: MCQOption[];
  correctOptionId: string;
  explanation: string;
}

export const mcqs: MCQ[] = [
  {
    id: "ssc-cgl-analogy-mcq-001",
    examId: "ssc-cgl",
    topicId: "reasoning-analogy",
    question: "Book : Reading :: Pen : ?",
    options: [
      { id: "a", text: "Writing" },
      { id: "b", text: "Drawing" },
      { id: "c", text: "Speaking" },
      { id: "d", text: "Walking" },
    ],
    correctOptionId: "a",
    explanation:
      "Book का उपयोग Reading के लिए होता है, उसी प्रकार Pen का उपयोग Writing के लिए होता है।",
  },
  {
    id: "ssc-cgl-analogy-mcq-002",
    examId: "ssc-cgl",
    topicId: "reasoning-analogy",
    question: "Doctor : Hospital :: Teacher : ?",
    options: [
      { id: "a", text: "Court" },
      { id: "b", text: "School" },
      { id: "c", text: "Market" },
      { id: "d", text: "Bank" },
    ],
    correctOptionId: "b",
    explanation:
      "Doctor सामान्यतः Hospital में कार्य करता है, उसी प्रकार Teacher School में कार्य करता है।",
  },
  {
    id: "ssc-cgl-analogy-mcq-003",
    examId: "ssc-cgl",
    topicId: "reasoning-analogy",
    question: "3 : 9 :: 4 : ?",
    options: [
      { id: "a", text: "8" },
      { id: "b", text: "12" },
      { id: "c", text: "16" },
      { id: "d", text: "20" },
    ],
    correctOptionId: "c",
    explanation:
      "3 का square 9 है। उसी प्रकार 4 का square 16 होगा।",
  },
  {
    id: "ssc-cgl-analogy-mcq-004",
    examId: "ssc-cgl",
    topicId: "reasoning-analogy",
    question: "Bird : Nest :: Lion : ?",
    options: [
      { id: "a", text: "Den" },
      { id: "b", text: "Stable" },
      { id: "c", text: "Kennel" },
      { id: "d", text: "Burrow" },
    ],
    correctOptionId: "a",
    explanation:
      "Bird का रहने का स्थान Nest है, जबकि Lion का रहने का स्थान Den है।",
  },
  {
    id: "ssc-cgl-analogy-mcq-005",
    examId: "ssc-cgl",
    topicId: "reasoning-analogy",
    question: "Eye : See :: Ear : ?",
    options: [
      { id: "a", text: "Speak" },
      { id: "b", text: "Hear" },
      { id: "c", text: "Touch" },
      { id: "d", text: "Walk" },
    ],
    correctOptionId: "b",
    explanation:
      "Eye का उपयोग See करने के लिए होता है, उसी प्रकार Ear का उपयोग Hear करने के लिए होता है।",
  },
];
