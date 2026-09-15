'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type OutputFormat = 'jpeg' | 'png' | 'webp';

export default function ImageFormatConverterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [format, setFormat] = useState<OutputFormat>('jpeg');
  const [quality, setQuality] = useState(90);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [preview, resultUrl]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    setError('');
    setResultUrl('');

    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setFile(null);
      setPreview('');
      setError('Please select a valid image file.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      setPreview('');
      setError('Maximum file size is 10 MB.');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const convertImage = () => {
    if (!file) {
      setError('Please upload an image first.');
      return;
    }

    setProcessing(true);
    setError('');
    setResultUrl('');

    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext('2d');

      if (!context) {
        setError('Your browser does not support image conversion.');
        setProcessing(false);
        return;
      }

      if (format === 'jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0);

      const mimeType =
        format === 'jpeg'
          ? 'image/jpeg'
          : format === 'png'
            ? 'image/png'
            : 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Could not convert the image.');
            setProcessing(false);
            return;
          }

          setResultUrl(URL.createObjectURL(blob));
          setProcessing(false);
        },
        mimeType,
        format === 'png' ? undefined : quality / 100
      );
    };

    image.onerror = () => {
      setError('Could not read the selected image.');
      setProcessing(false);
    };

    image.src = URL.createObjectURL(file);
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setResultUrl('');
    setError('');
    setFormat('jpeg');
    setQuality(90);
  };

  const extension = format === 'jpeg' ? 'jpg' : format;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="mb-8 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-600">
          StudySetu Tool
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Image Format Converter
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Convert your image between JPG, PNG and WebP directly in your
          browser.
        </p>
      </section>

      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-8">
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
          <label className="cursor-pointer">
            <span className="block text-lg font-semibold">
              Upload an image
            </span>

            <span className="mt-2 block text-sm text-gray-500">
              JPG, JPEG, PNG or WebP • Maximum 10 MB
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="mt-5 block w-full cursor-pointer text-sm"
            />
          </label>
        </div>

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {file && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-3 font-semibold">Original Image</h2>

              <div className="overflow-hidden rounded-xl border bg-gray-50 p-3">
                {preview && (
                  <img
                    src={preview}
                    alt="Original preview"
                    className="mx-auto max-h-72 max-w-full object-contain"
                  />
                )}
              </div>

              <p className="mt-3 text-sm text-gray-600">
                <strong>File:</strong> {file.name}
              </p>

              <p className="text-sm text-gray-600">
                <strong>Size:</strong> {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>

            <div>
              <h2 className="mb-3 font-semibold">Conversion Settings</h2>

              <label className="block text-sm font-medium">
                Output format
              </label>

              <select
                value={format}
                onChange={(e) =>
                  setFormat(e.target.value as OutputFormat)
                }
                className="mt-2 w-full rounded-lg border px-3 py-2"
              >
                <option value="jpeg">JPG / JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>

              {format !== 'png' && (
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Quality
                    </label>
                    <span className="text-sm text-gray-600">
                      {quality}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="mt-3 w-full"
                  />
                </div>
              )}

              <button
                onClick={convertImage}
                disabled={processing}
                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
              >
                {processing ? 'Converting...' : 'Convert Image'}
              </button>

              <button
                onClick={reset}
                className="mt-3 w-full rounded-lg border px-5 py-3 font-semibold"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {resultUrl && (
          <div className="mt-8 rounded-xl border bg-gray-50 p-5 text-center">
            <h2 className="text-xl font-semibold">Conversion Complete</h2>

            <img
              src={resultUrl}
              alt="Converted preview"
              className="mx-auto mt-5 max-h-80 max-w-full rounded-lg object-contain"
            />

            <a
              href={resultUrl}
              download={`studysetu-converted.${extension}`}
              className="mt-5 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"
            >
              Download {extension.toUpperCase()}
            </a>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border bg-gray-50 p-6">
        <h2 className="text-xl font-bold">Why convert image formats?</h2>

        <p className="mt-3 text-gray-600">
          Different websites and online application forms may require
          different image formats. JPG is commonly used for photographs,
          PNG is useful when lossless quality is required, and WebP can
          provide smaller files for web use.
        </p>

        <p className="mt-3 text-sm text-gray-500">
          Your image is processed locally in your browser and is not
          uploaded to a StudySetu server.
        </p>
      </section>
    </main>
  );
}
