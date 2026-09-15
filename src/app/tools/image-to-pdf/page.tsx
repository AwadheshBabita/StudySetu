'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

type ImageItem = {
  id: string;
  file: File;
  preview: string;
};

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    return () => {
      images.forEach((item) => URL.revokeObjectURL(item.preview));
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [images, pdfUrl]);

  const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setPdfUrl('');

    const files = Array.from(event.target.files || []);
    const valid = files.filter(
      (file) =>
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/webp'
    );

    if (!valid.length) {
      setError('Please select JPG, PNG or WebP images.');
      return;
    }

    const newImages = valid.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((current) => [...current, ...newImages]);
    event.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages((current) => {
      const item = current.find((image) => image.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return current.filter((image) => image.id !== id);
    });
    setPdfUrl('');
  };

  const clearAll = () => {
    images.forEach((item) => URL.revokeObjectURL(item.preview));
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setImages([]);
    setPdfUrl('');
    setError('');
  };

  const createPdf = async () => {
    if (!images.length) {
      setError('Please add at least one image.');
      return;
    }

    setProcessing(true);
    setError('');
    setPdfUrl('');

    try {
      const pdf = await PDFDocument.create();

      for (const item of images) {
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        let embedded;

        if (item.file.type === 'image/png') {
          embedded = await pdf.embedPng(bytes);
        } else {
          embedded = await pdf.embedJpg(bytes);
        }

        const width = embedded.width;
        const height = embedded.height;
        const page = pdf.addPage([width, height]);

        page.drawImage(embedded, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as BlobPart], {
        type: 'application/pdf',
      });

      setPdfUrl(URL.createObjectURL(blob));
    } catch {
      setError('Could not create PDF. Please try another image.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm font-semibold text-blue-400">
            STUDYSETU • PDF TOOL
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            Image to PDF
          </h1>
          <p className="mt-3 text-slate-400">
            Convert multiple JPG, PNG or WebP images into one PDF.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 px-5 py-12 text-center hover:border-blue-500">
            <span className="text-lg font-semibold">
              Select Images
            </span>
            <span className="mt-2 text-sm text-slate-400">
              JPG, PNG or WebP • Multiple images supported
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
          </label>

          {error && (
            <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {images.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-800"
                  >
                    <img
                      src={item.preview}
                      alt={`Image ${index + 1}`}
                      className="h-32 w-full object-contain"
                    />
                    <div className="flex items-center justify-between p-2">
                      <span className="text-xs text-slate-400">
                        Page {index + 1}
                      </span>
                      <button
                        onClick={() => removeImage(item.id)}
                        className="text-xs font-semibold text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={createPdf}
                  disabled={processing}
                  className="flex-1 rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50"
                >
                  {processing ? 'Creating PDF...' : 'Create PDF'}
                </button>

                <button
                  onClick={clearAll}
                  className="rounded-xl border border-slate-700 px-5 py-3 font-semibold hover:bg-slate-800"
                >
                  Clear All
                </button>
              </div>
            </>
          )}

          {pdfUrl && (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 p-5 text-center">
              <p className="mb-4 font-semibold text-green-400">
                PDF created successfully.
              </p>
              <a
                href={pdfUrl}
                download="studysetu-images.pdf"
                className="inline-block rounded-xl bg-green-600 px-6 py-3 font-semibold hover:bg-green-500"
              >
                Download PDF
              </a>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Images are processed locally in your browser. They are not
            uploaded to a StudySetu server.
          </p>
        </div>
      </section>
    </main>
  );
}
