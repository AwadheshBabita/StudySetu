import TestEngine from '@/components/test-engine';
import { questionBank } from '@/data/question-bank';

export default function MockTestPage() {
  const questions = questionBank.filter(
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
          UPSC Mock Test
        </h1>

        <p className="mt-2 text-gray-600">
          Mixed UPSC practice test with score calculation.
        </p>
      </div>

      <TestEngine
        questions={questions}
        title="UPSC Mock Test"
      />
    </main>
  );
}
