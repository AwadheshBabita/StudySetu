export interface NoteSection {
  heading: string;
  content: string[];
}

export interface Note {
  id: string;
  examId: string;
  topicId: string;
  title: string;
  shortDescription: string;
  sections: NoteSection[];
  keyPoints: string[];
  available: boolean;
}

export const notes: Note[] = [
  {
    id: "ssc-cgl-reasoning-analogy-notes",
    examId: "ssc-cgl",
    topicId: "reasoning-analogy",
    title: "Analogy — Analogy Reasoning Notes",
    shortDescription:
      "Analogy के basic concepts, types और question solving approach.",
    sections: [
      {
        heading: "Analogy क्या है?",
        content: [
          "Analogy में दो शब्दों, संख्याओं या वस्तुओं के बीच संबंध को पहचानकर उसी संबंध को दूसरे pair पर लागू किया जाता है।",
          "प्रश्न को हल करने के लिए पहले दिए गए pair के बीच logical relationship पहचानें।",
        ],
      },
      {
        heading: "Analogy के प्रमुख प्रकार",
        content: [
          "Word Analogy — दो शब्दों के बीच संबंध।",
          "Number Analogy — संख्याओं के बीच mathematical relationship।",
          "Letter Analogy — अक्षरों की position या pattern पर आधारित संबंध।",
          "Mixed Analogy — शब्द, अक्षर और संख्या के संयुक्त pattern पर आधारित प्रश्न।",
        ],
      },
      {
        heading: "Question Solving Method",
        content: [
          "Step 1: पहले pair के दोनों elements का संबंध पहचानें।",
          "Step 2: उसी relationship को दूसरे element पर लागू करें।",
          "Step 3: सभी options को check करें।",
          "Step 4: सबसे logically matching option चुनें।",
        ],
      },
    ],
    keyPoints: [
      "पहले relationship पहचानें।",
      "केवल surface similarity पर निर्भर न रहें।",
      "Number analogy में basic arithmetic operations check करें।",
      "Letter analogy में alphabet positions उपयोगी हो सकती हैं।",
    ],
    available: true,
  },
];
