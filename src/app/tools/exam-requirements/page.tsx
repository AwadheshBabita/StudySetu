'use client';

import { ChangeEvent, useState } from 'react';
import { examCategories } from '@/data/exam-categories';
import {
  examRequirements,
  ExamRequirement,
  FileRequirement,
} from '@/data/exam-requirements';

type CheckResult = {
  status: 'pass' | 'fail' | 'info';
  message: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function getImageDimensions(file: File) {
  const url = URL.createObjectURL(file);

  try {
    const dimensions = await new Promise<{ width: number; height: number }>(
      (resolve, reject) => {
        const image = new Image();

        image.onload = () =>
          resolve({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });

        image.onerror = () => reject(new Error('Unable to read image.'));
        image.src = url;
      }
    );

    return dimensions;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function checkFile(
  file: File,
  requirement: FileRequirement
): Promise<CheckResult[]> {
  const results: CheckResult[] = [];

  const kb = file.size / 1024;

  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedFormats = requirement.formats.map((format) =>
    format.toLowerCase().replace('.', '')
  );

  if (!allowedFormats.includes(extension)) {
    results.push({
      status: 'fail',
      message: `${file.name}: format .${extension} is not allowed.`,
    });
  } else {
    results.push({
      status: 'pass',
      message: `${file.name}: format is accepted.`,
    });
  }

  if (requirement.minKb !== undefined && kb < requirement.minKb) {
    results.push({
      status: 'fail',
      message: `${file.name}: file size is below the minimum.`,
    });
  }

  if (requirement.maxKb !== undefined && kb > requirement.maxKb) {
    results.push({
      status: 'fail',
      message: `${file.name}: file size exceeds the maximum.`,
    });
  }

  if (
    requirement.minKb === undefined &&
    requirement.maxKb === undefined
  ) {
    results.push({
      status: 'info',
      message: `${file.name}: file size is ${formatBytes(file.size)}.`,
    });
  }

  const isImage = file.type.startsWith('image/');

  if (
    isImage &&
    (
      requirement.minWidth !== undefined ||
      requirement.maxWidth !== undefined ||
      requirement.minHeight !== undefined ||
      requirement.maxHeight !== undefined
    )
  ) {
    try {
      const { width, height } = await getImageDimensions(file);

      if (
        requirement.minWidth !== undefined &&
        width < requirement.minWidth
      ) {
        results.push({
          status: 'fail',
          message: `${file.name}: width is below the minimum.`,
        });
      }

      if (
        requirement.maxWidth !== undefined &&
        width > requirement.maxWidth
      ) {
        results.push({
          status: 'fail',
          message: `${file.name}: width exceeds the maximum.`,
        });
      }

      if (
        requirement.minHeight !== undefined &&
        height < requirement.minHeight
      ) {
        results.push({
          status: 'fail',
          message: `${file.name}: height is below the minimum.`,
        });
      }

      if (
        requirement.maxHeight !== undefined &&
        height > requirement.maxHeight
      ) {
        results.push({
          status: 'fail',
          message: `${file.name}: height exceeds the maximum.`,
        });
      }

      if (
        (requirement.minWidth === undefined ||
          width >= requirement.minWidth) &&
        (requirement.maxWidth === undefined ||
          width <= requirement.maxWidth) &&
        (requirement.minHeight === undefined ||
          height >= requirement.minHeight) &&
        (requirement.maxHeight === undefined ||
          height <= requirement.maxHeight)
      ) {
        results.push({
          status: 'pass',
          message: `${file.name}: dimensions ${width} × ${height}px are accepted.`,
        });
      }
    } catch {
      results.push({
        status: 'fail',
        message: `${file.name}: could not read image dimensions.`,
      });
    }
  }

  return results;
}

export default function ExamRequirementsPage() {
  const [selectedExam, setSelectedExam] =
    useState<ExamRequirement | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredExams = selectedCategory
    ? examRequirements.filter((exam) => exam.category === selectedCategory)
    : [];
  const [photo, setPhoto] = useState<File | null>(null);
  const [signature, setSignature] = useState<File | null>(null);
  const [results, setResults] = useState<CheckResult[]>([]);
  const [checking, setChecking] = useState(false);

  const handleExamChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const exam =
      examRequirements.find((item) => item.id === event.target.value) ||
      null;

    setSelectedExam(exam);
    setPhoto(null);
    setSignature(null);
    setResults([]);
  };

  const runChecker = async () => {
    if (!selectedExam) return;

    setChecking(true);
    setResults([]);

    if (!selectedExam.verified) {
      setResults([{
        status: 'info',
        message: 'Official requirements for this exam are not verified yet. Please check the latest official notification before submission.',
      }]);
      setChecking(false);
      return;
    }

    try {
      const nextResults: CheckResult[] = [];

      if (selectedExam.photo && photo) {
        nextResults.push(
          ...(await checkFile(photo, selectedExam.photo))
        );
      }

      if (selectedExam.signature && signature) {
        nextResults.push(
          ...(await checkFile(signature, selectedExam.signature))
        );
      }

      if (!photo && selectedExam.photo) {
        nextResults.push({
          status: 'info',
          message: 'Photo has not been selected.',
        });
      }

      if (!signature && selectedExam.signature) {
        nextResults.push({
          status: 'info',
          message: 'Signature has not been selected.',
        });
      }

      if (!nextResults.length) {
        nextResults.push({
          status: 'info',
          message: 'No files are available for checking yet.',
        });
      }

      setResults(nextResults);
    } finally {
      setChecking(false);
    }
  };

  const reset = () => {
    setPhoto(null);
    setSignature(null);
    setResults([]);
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Exam Requirements Checker
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Check application files against verified exam requirements.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Requirements will be added only after official verification.
          </p>
        </div>

        <section className="rounded-2xl border p-6 shadow-sm">
          <label className="block">
            <span className="mb-2 block font-semibold">
              Select Category
            </span>

            <select
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value);
                setSelectedExam(null);
                setPhoto(null);
                setSignature(null);
                setResults([]);
              }}
              className="mb-4 w-full rounded-lg border bg-transparent p-3"
            >
              <option value="">Select a category</option>
              {examCategories
                .filter((category) => category.active)
                .map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
            </select>

            <span className="mb-2 block font-semibold">
              Select Exam
            </span>

            <select
              value={selectedExam?.id || ''}
              onChange={handleExamChange}
              className="w-full rounded-lg border bg-transparent p-3"
            >
              <option value="">
                Select an exam
              </option>

              {filteredExams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.exam}
                </option>
              ))}
            </select>
          </label>

          {selectedCategory && filteredExams.length === 0 && (
            <div className="mt-5 rounded-xl border p-4">
              <p className="font-semibold">
                Requirements database is ready.
              </p>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                No exam profile has been published yet. Official
                requirements will be added here after verification.
              </p>
            </div>
          )}

          {selectedExam && (
            <div className="mt-6 space-y-5">
              <div className="rounded-xl border p-4">
                <h2 className="text-xl font-bold">
                  {selectedExam.exam}
                </h2>

                <p className="mt-1 text-sm">
                  Category: {selectedExam.category}
                </p>

                <p className="mt-2 text-sm">
                  Status:{' '}
                  {selectedExam.verified
                    ? 'Verified'
                    : 'Pending verification'}
                </p>
              </div>

              {selectedExam.photo && (
                <label className="block">
                  <span className="mb-2 block font-semibold">
                    Upload Photo
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPhoto(event.target.files?.[0] || null)
                    }
                    className="block w-full rounded-lg border p-3"
                  />
                </label>
              )}

              {selectedExam.signature && (
                <label className="block">
                  <span className="mb-2 block font-semibold">
                    Upload Signature
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setSignature(event.target.files?.[0] || null)
                    }
                    className="block w-full rounded-lg border p-3"
                  />
                </label>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={runChecker}
                  disabled={checking}
                  className="rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {checking ? 'Checking...' : 'Check Files'}
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="rounded-lg border px-6 py-3 font-semibold"
                >
                  Reset
                </button>
              </div>

              {results.length > 0 && (
                <div className="rounded-xl border p-4">
                  <h3 className="font-bold">Checker Results</h3>

                  <ul className="mt-3 space-y-2 text-sm">
                    {results.map((result, index) => (
                      <li
                        key={`${result.message}-${index}`}
                        className="rounded-lg border p-3"
                      >
                        <span className="font-semibold">
                          {result.status === 'pass'
                            ? '✓ PASS'
                            : result.status === 'fail'
                              ? '✗ FAIL'
                              : '• INFO'}
                        </span>{' '}
                        {result.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border p-6">
          <h2 className="text-xl font-bold">
            How StudySetu Checker Works
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            StudySetu will maintain exam-specific requirements in a
            structured database. The checker can validate file format,
            file size and image dimensions. Only verified requirements
            should be published to students.
          </p>
        </section>
      </div>
    </main>
  );
}
