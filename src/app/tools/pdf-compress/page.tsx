'use client';

import { ChangeEvent, useState } from 'react';

export default function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');

    const selected = event.target.files?.[0];

    if (!selected) return;

    if (selected.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      return;
    }

    if (selected.size > 25 * 1024 * 1024) {
      setError('Maximum file size is 25 MB.');
      return;
    }

    setFile(selected);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold text-blue-400">
            STUDYSETU • PDF TOOL
          </p>

          <h1 className="text-3xl font-bold sm:text-4xl">
            PDF Compressor
          </h1>

          <p className="mt-3 text-slate-400">
            Reduce PDF file size before uploading it to an application,
            website or online form.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 px-5 py-14 text-center hover:border-blue-500">
            <span className="text-lg font-semibold">
              Select PDF
            </span>

            <span className="mt-2 text-sm text-slate-400">
              PDF only • Maximum 25 MB
            </span>

            <input
              type="file"
              accept="application/pdf"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {file && (
            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-5">
              <p className="font-semibold">{file.name}</p>

              <p className="mt-2 text-sm text-slate-400">
                Original size: {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>

              <div className="mt-5 rounded-lg bg-amber-500/10 p-4 text-sm text-amber-300">
                PDF compression will be processed locally in your browser
                when the compression engine is enabled.
              </div>
            </div>
          )}

          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-5">
            <h2 className="text-lg font-bold">
              Why does PDF file size matter?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Many government forms, exam applications and document portals
              have strict file-size limits. A smaller PDF is easier to
              upload, share and store.
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Your selected PDF is not uploaded to a StudySetu server.
          </p>
        </div>
      </section>
    </main>
  );
}
