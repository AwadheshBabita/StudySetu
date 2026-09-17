import MCQPractice from '@/components/mcq-practice';
import { questionBank } from '@/data/question-bank';

export default function MCQPracticePage() {
  const upscQuestions = questionBank.filter(
    (question) => question.examId === 'upsc-cse'
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <a
          href="/study"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to Study
        </a>

        <h1 className="mt-4 text-3xl font-bold">
          UPSC MCQ Practice
        </h1>

        <p className="mt-2 text-gray-600">
          Practice questions with instant answers, explanations and score.
        </p>
      </div>

      <MCQPractice questions={upscQuestions} />
    </main>
  );
}
