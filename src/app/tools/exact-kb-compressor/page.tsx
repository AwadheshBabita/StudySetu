'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type OutputFormat = 'image/jpeg' | 'image/webp';

export default function ExactKbCompressorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [targetKb, setTargetKb] = useState(100);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/jpeg');
  const [resultUrl, setResultUrl] = useState('');
  const [resultFile, setResultFile] = useState<Blob | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [preview, resultUrl]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    setError('');
    setResultFile(null);

    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl('');
    }

    if (!selected) {
      setFile(null);
      setPreview('');
      return;
    }

    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('Maximum file size is 10 MB.');
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const loadImage = (source: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Unable to read image.'));
      image.src = source;
    });

  const canvasBlob = (
    canvas: HTMLCanvasElement,
    format: OutputFormat,
    imageQuality: number
  ): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Image compression failed.'));
        },
        format,
        imageQuality
      );
    });

  const compressToTarget = async () => {
    if (!file || !preview) {
      setError('Please select an image first.');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const image = await loadImage(preview);

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas is not supported in this browser.');
      }

      if (outputFormat === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0);

      const targetBytes = Math.max(1, targetKb) * 1024;

      let low = 0.05;
      let high = 1;
      let bestBlob: Blob | null = null;
      let bestDifference = Number.POSITIVE_INFINITY;

      for (let i = 0; i < 12; i += 1) {
        const currentQuality = (low + high) / 2;
        const blob = await canvasBlob(
          canvas,
          outputFormat,
          currentQuality
        );

        const difference = Math.abs(blob.size - targetBytes);

        if (difference < bestDifference) {
          bestDifference = difference;
          bestBlob = blob;
          setQuality(Math.round(currentQuality * 100));
        }

        if (blob.size > targetBytes) {
          high = currentQuality;
        } else {
          low = currentQuality;
        }
      }

      if (!bestBlob) {
        throw new Error('Could not create compressed image.');
      }

      if (bestBlob.size > targetBytes && targetBytes < bestBlob.size) {
        const lowestQualityBlob = await canvasBlob(
          canvas,
          outputFormat,
          0.05
        );

        if (lowestQualityBlob.size <= targetBytes) {
          bestBlob = lowestQualityBlob;
          setQuality(5);
        }
      }

      const url = URL.createObjectURL(bestBlob);

      setResultFile(bestBlob);
      setResultUrl(url);
    } catch (compressionError) {
      setError(
        compressionError instanceof Error
          ? compressionError.message
          : 'Compression failed.'
      );
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (!resultUrl || !resultFile) return;

    const extension = outputFormat === 'image/webp' ? 'webp' : 'jpg';
    const link = document.createElement('a');

    link.href = resultUrl;
    link.download = `studysetu-compressed.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const resetTool = () => {
    if (preview) URL.revokeObjectURL(preview);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setFile(null);
    setPreview('');
    setResultUrl('');
    setResultFile(null);
    setTargetKb(100);
    setQuality(80);
    setOutputFormat('image/jpeg');
    setError('');
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <a
            href="/"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to StudySetu
          </a>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Exact KB Compressor
          </h1>

          <p className="mt-2 max-w-2xl text-gray-600">
            Compress your photo to an application-friendly file size.
            Processing happens directly in your browser.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              1. Select Photo
            </h2>

            <label className="mt-4 block cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 text-center transition hover:border-blue-500 hover:bg-blue-50">
              <span className="text-sm font-medium text-gray-700">
                Choose JPG, PNG or WebP
              </span>

              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="mt-3 block w-full text-sm"
              />
            </label>

            {file && (
              <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm">
                <p>
                  <strong>File:</strong> {file.name}
                </p>
                <p className="mt-1">
                  <strong>Original size:</strong> {formatSize(file.size)}
                </p>
              </div>
            )}

            {preview && (
              <div className="mt-5 overflow-hidden rounded-xl border bg-gray-100 p-3">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Preview
                </p>

                <img
                  src={preview}
                  alt="Selected photo preview"
                  className="mx-auto max-h-72 max-w-full rounded-lg object-contain"
                />
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              2. Compression Settings
            </h2>

            <label className="mt-5 block text-sm font-medium text-gray-700">
              Target file size (KB)
            </label>

            <input
              type="number"
              min="5"
              max="5000"
              value={targetKb}
              onChange={(e) =>
                setTargetKb(Math.max(5, Number(e.target.value)))
              }
              className="mt-2 w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-blue-500"
            />

            <p className="mt-1 text-xs text-gray-500">
              Example: 20 KB, 50 KB, 100 KB, 200 KB
            </p>

            <label className="mt-5 block text-sm font-medium text-gray-700">
              Output format
            </label>

            <select
              value={outputFormat}
              onChange={(e) =>
                setOutputFormat(e.target.value as OutputFormat)
              }
              className="mt-2 w-full rounded-xl border border-gray-300 p-3"
            >
              <option value="image/jpeg">JPG / JPEG</option>
              <option value="image/webp">WebP</option>
            </select>

            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <p className="text-sm font-semibold text-blue-900">
                Automatic compression
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-800">
                StudySetu automatically searches for the best image quality
                close to your requested file size.
              </p>
            </div>

            <button
              type="button"
              onClick={compressToTarget}
              disabled={!file || processing}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {processing ? 'Compressing...' : 'Compress to Target KB'}
            </button>

            <button
              type="button"
              onClick={resetTool}
              className="mt-3 w-full rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
          </section>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {resultFile && (
          <section className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6">
            <h2 className="text-lg font-bold text-green-900">
              Compression Complete
            </h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-gray-500">Original</p>
                <p className="mt-1 font-semibold">
                  {file ? formatSize(file.size) : '-'}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-gray-500">Compressed</p>
                <p className="mt-1 font-semibold">
                  {formatSize(resultFile.size)}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4">
                <p className="text-xs text-gray-500">Quality</p>
                <p className="mt-1 font-semibold">{quality}%</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-green-800">
              Target: {targetKb} KB · Actual: {formatSize(resultFile.size)}
            </p>

            <button
              type="button"
              onClick={downloadResult}
              className="mt-5 rounded-xl bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800"
            >
              Download Compressed Image
            </button>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Why does file size matter?
          </h2>

          <div className="mt-3 space-y-3 text-sm leading-6 text-gray-600">
            <p>
              Many online application forms specify a maximum photo or
              signature file size. A photo can look correct but still be
              rejected if its file size is too large.
            </p>

            <p>
              Exact KB compression helps prepare an image for those
              application requirements while keeping as much visual quality
              as possible.
            </p>

            <p>
              Always check the official application notification for the
              required dimensions, format and file-size limit before uploading.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-gray-900 p-6 text-sm leading-6 text-gray-300">
          <h2 className="font-semibold text-white">
            Privacy-first processing
          </h2>

          <p className="mt-2">
            Your selected image is processed locally in your browser. StudySetu
            does not need to upload the image to a server for this tool.
          </p>
        </section>
      </div>
    </main>
  );
}
