'use client';

import { useState } from 'react';
import { examCategories } from '@/data/exam-categories';
import { exams } from '@/data/exams';

export default function StudyPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedExam, setSelectedExam] = useState('');

  const filteredExams = selectedCategory
    ? exams.filter(
        (exam) => exam.categoryId === selectedCategory && exam.active
      )
    : [];

  const selectedExamData = exams.find(
    (exam) => exam.id === selectedExam
  );

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedExam('');
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-semibold text-blue-600">
            STUDYSETU • STUDY
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Choose Your Exam
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Select an exam category and examination to access study
            materials, practice, previous year questions and tests.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            1. Select Exam Category
          </h2>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {examCategories
              .filter((category) => category.active)
              .map((category) => {
                const isSelected = selectedCategory === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryChange(category.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                        : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <h3 className="font-bold text-gray-900">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      {category.description}
                    </p>
                  </button>
                );
              })}
          </div>
        </section>

        {selectedCategory && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              2. Select Examination
            </h2>

            {filteredExams.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExams.map((exam) => {
                  const isSelected = selectedExam === exam.id;

                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => setSelectedExam(exam.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-bold text-gray-900">
                        {exam.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-600">
                        {exam.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="mt-4 text-gray-600">
                Exams will be added to this category soon.
              </p>
            )}
          </section>
        )}

        {selectedExamData && (
          <section className="mt-6 rounded-2xl bg-gray-900 p-6 text-white">
            <p className="text-sm font-semibold text-gray-300">
              SELECTED EXAM
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {selectedExamData.name}
            </h2>

            <p className="mt-2 text-gray-300">
              {selectedExamData.description}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white/10 p-4">
                <p className="font-semibold">Notes</p>
                <p className="mt-1 text-sm text-gray-300">
                  Coming next
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <p className="font-semibold">MCQ Practice</p>
                <p className="mt-1 text-sm text-gray-300">
                  Coming next
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <p className="font-semibold">PYQ</p>
                <p className="mt-1 text-sm text-gray-300">
                  Coming next
                </p>
              </div>

              <div className="rounded-xl bg-white/10 p-4">
                <p className="font-semibold">Tests</p>
                <p className="mt-1 text-sm text-gray-300">
                  Coming next
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
