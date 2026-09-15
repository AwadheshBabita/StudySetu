'use client';

import { ChangeEvent, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

type Mode = 'merge' | 'split';

export default function PdfMergeSplitPage() {
  const [mode, setMode] = useState<Mode>('merge');
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [splitPage, setSplitPage] = useState('1');

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setResultUrl('');

    const selected = Array.from(event.target.files || []);

    if (!selected.length) return;

    const invalid = selected.find(
      (file) => file.type !== 'application/pdf'
    );

    if (invalid) {
      setError('Please select PDF files only.');
      return;
    }

    const tooLarge = selected.find(
      (file) => file.size > 25 * 1024 * 1024
    );

    if (tooLarge) {
      setError('Maximum file size is 25 MB per PDF.');
      return;
    }

    setFiles(selected);
  };

  const mergePdfs = async () => {
    if (!files.length) {
      setError('Please select at least one PDF.');
      return;
    }

    setProcessing(true);
    setError('');
    setResultUrl('');

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const sourcePdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(
          sourcePdf,
          sourcePdf.getPageIndices()
        );

        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: 'application/pdf',
      });

      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError('Unable to merge the selected PDF files.');
    } finally {
      setProcessing(false);
    }
  };

  const splitPdf = async () => {
    if (!files.length) {
      setError('Please select a PDF.');
      return;
    }

    const pageNumber = Number(splitPage);

    if (!Number.isInteger(pageNumber) || pageNumber < 1) {
      setError('Please enter a valid page number.');
      return;
    }

    setProcessing(true);
    setError('');
    setResultUrl('');

    try {
      const bytes = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(bytes);
      const pageIndex = pageNumber - 1;

      if (pageIndex >= sourcePdf.getPageCount()) {
        setError(
          `This PDF has ${sourcePdf.getPageCount()} pages.`
        );
        return;
      }

      const outputPdf = await PDFDocument.create();
      const [page] = await outputPdf.copyPages(sourcePdf, [pageIndex]);
      outputPdf.addPage(page);

      const pdfBytes = await outputPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: 'application/pdf',
      });

      setResultUrl(URL.createObjectURL(blob));
    } catch {
      setError('Unable to split the selected PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcess = () => {
    if (mode === 'merge') {
      mergePdfs();
    } else {
      splitPdf();
    }
  };

  const reset = () => {
    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
    }

    setFiles([]);
    setError('');
    setResultUrl('');
    setSplitPage('1');
  };

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            PDF Merge & Split
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Merge multiple PDFs or extract a page from a PDF.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Files are processed locally in your browser.
          </p>
        </div>

        <div className="mb-6 flex rounded-xl border p-1">
          <button
            type="button"
            onClick={() => {
              setMode('merge');
              setError('');
              setResultUrl('');
            }}
            className={`flex-1 rounded-lg px-4 py-3 font-semibold ${
              mode === 'merge'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : ''
            }`}
          >
            Merge PDFs
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('split');
              setError('');
              setResultUrl('');
            }}
            className={`flex-1 rounded-lg px-4 py-3 font-semibold ${
              mode === 'split'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : ''
            }`}
          >
            Split PDF
          </button>
        </div>

        <section className="rounded-2xl border p-6 shadow-sm">
          <label className="block">
            <span className="mb-2 block font-semibold">
              {mode === 'merge'
                ? 'Select PDF files'
                : 'Select a PDF file'}
            </span>

            <input
              type="file"
              accept="application/pdf"
              multiple={mode === 'merge'}
              onChange={handleFiles}
              className="block w-full rounded-lg border p-3"
            />
          </label>

          {mode === 'split' && (
            <div className="mt-5">
              <label className="mb-2 block font-semibold">
                Page number to extract
              </label>

              <input
                type="number"
                min="1"
                value={splitPage}
                onChange={(e) => setSplitPage(e.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
              <p className="font-semibold">
                Selected files: {files.length}
              </p>

              <ul className="mt-2 space-y-1 text-sm">
                {files.map((file) => (
                  <li key={`${file.name}-${file.size}`}>
                    {file.name} —{' '}
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleProcess}
              disabled={processing || files.length === 0}
              className="rounded-lg bg-black px-6 py-3 font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black"
            >
              {processing
                ? 'Processing...'
                : mode === 'merge'
                  ? 'Merge PDFs'
                  : 'Extract Page'}
            </button>

            <button
              type="button"
              onClick={reset}
              className="rounded-lg border px-6 py-3 font-semibold"
            >
              Reset
            </button>
          </div>

          {resultUrl && (
            <div className="mt-6 rounded-xl border p-5">
              <p className="mb-3 font-semibold">
                Your PDF is ready.
              </p>

              <a
                href={resultUrl}
                download={
                  mode === 'merge'
                    ? 'studysetu-merged.pdf'
                    : 'studysetu-extracted-page.pdf'
                }
                className="inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white dark:bg-white dark:text-black"
              >
                Download PDF
              </a>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl border p-6">
          <h2 className="text-xl font-bold">
            PDF Merge & Split — StudySetu
          </h2>

          <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
            Combine multiple PDF documents into one file or extract
            a specific page from a PDF. This tool is designed for
            students and applicants preparing documents for exams and
            online applications.
          </p>
        </section>
      </div>
    </main>
  );
}
