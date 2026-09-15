'use client';

import { ChangeEvent, useEffect, useState } from 'react';

export default function SignatureResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(100);
  const [quality, setQuality] = useState(90);
  const [lockRatio, setLockRatio] = useState(false);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];

    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid signature image.');
      return;
    }

    if (selected.size > 10 * 1024 * 1024) {
      setError('Maximum file size is 10 MB.');
      return;
    }

    setError('');
    setFile(selected);

    const url = URL.createObjectURL(selected);
    setPreview(url);

    const img = new Image();

    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    };

    img.src = url;
  };

  const updateWidth = (newWidth: number) => {
    setWidth(newWidth);

    if (lockRatio && originalWidth > 0) {
      setHeight(
        Math.max(1, Math.round((newWidth / originalWidth) * originalHeight))
      );
    }
  };

  const updateHeight = (newHeight: number) => {
    setHeight(newHeight);

    if (lockRatio && originalHeight > 0) {
      setWidth(
        Math.max(1, Math.round((newHeight / originalHeight) * originalWidth))
      );
    }
  };

  const resizeSignature = () => {
    if (!file || !originalWidth || !originalHeight) return;

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Could not process the signature.');
        URL.revokeObjectURL(objectUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Could not create the resized signature.');
            URL.revokeObjectURL(objectUrl);
            return;
          }

          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = downloadUrl;
          link.download = `studysetu-signature-${canvas.width}x${canvas.height}.jpg`;
          link.click();

          URL.revokeObjectURL(downloadUrl);
          URL.revokeObjectURL(objectUrl);
        },
        'image/jpeg',
        quality / 100
      );
    };

    img.src = objectUrl;
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setWidth(300);
    setHeight(100);
    setQuality(90);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setError('');
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Signature Resize
        </h1>

        <p className="mt-2 text-gray-600">
          Resize your signature for online applications and forms.
          Processing happens in your browser.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <label className="block text-sm font-semibold text-gray-800">
            Select Signature
          </label>

          <input
            className="mt-3 block w-full rounded-lg border border-gray-300 p-3"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
          />

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {file && (
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">Original Signature</p>

                <div className="mt-3 flex min-h-48 items-center justify-center rounded-xl border bg-white p-4">
                  <img
                    src={preview}
                    alt="Selected signature"
                    className="max-h-40 max-w-full object-contain"
                  />
                </div>

                <div className="mt-3 text-sm text-gray-600">
                  <p>File: {file.name}</p>
                  <p>
                    Dimensions: {originalWidth} × {originalHeight}px
                  </p>
                  <p>Size: {(file.size / 1024).toFixed(1)} KB</p>
                  <p>Format: {file.type}</p>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-gray-600">Width</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 p-3"
                      type="number"
                      min="1"
                      value={width}
                      onChange={(e) => updateWidth(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">Height</label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 p-3"
                      type="number"
                      min="1"
                      value={height}
                      onChange={(e) => updateHeight(Number(e.target.value))}
                    />
                  </div>
                </div>

                <label className="mt-4 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={lockRatio}
                    onChange={(e) => setLockRatio(e.target.checked)}
                  />
                  Keep aspect ratio
                </label>

                <div className="mt-5">
                  <label className="text-sm font-semibold">
                    Quality: {quality}%
                  </label>

                  <input
                    className="mt-2 w-full"
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                  />
                </div>

                <button
                  type="button"
                  onClick={resizeSignature}
                  className="mt-6 w-full rounded-xl bg-black px-5 py-3 font-semibold text-white hover:opacity-90"
                >
                  Resize & Download
                </button>

                <button
                  type="button"
                  onClick={reset}
                  className="mt-3 w-full rounded-xl border border-gray-300 px-5 py-3 font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 ring-1 ring-gray-200">
          <h2 className="text-xl font-bold">
            Why signature dimensions matter
          </h2>

          <p className="mt-2 text-gray-600">
            Online applications often require a signature within specific
            dimensions and file-size limits. StudySetu prepares the signature
            directly in your browser without uploading it to a server.
          </p>
        </section>
      </div>
    </main>
  );
}
