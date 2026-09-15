'use client';

import { ChangeEvent, useEffect, useState } from 'react';

type ResizeMode = 'width' | 'height' | 'percentage';

export default function PhotoResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [mode, setMode] = useState<ResizeMode>('width');
  const [value, setValue] = useState<number>(500);
  const [quality, setQuality] = useState<number>(90);
  const [lockRatio, setLockRatio] = useState(true);
  const [width, setWidth] = useState(500);
  const [height, setHeight] = useState(500);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>(
    'image/jpeg'
  );
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
      setError('Please select a valid image file.');
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
      setValue(img.naturalWidth);
    };

    img.src = url;
  };

  const updateWidth = (newWidth: number) => {
    setWidth(newWidth);

    if (lockRatio && originalWidth > 0) {
      setHeight(Math.max(1, Math.round((newWidth / originalWidth) * originalHeight)));
    }
  };

  const updateHeight = (newHeight: number) => {
    setHeight(newHeight);

    if (lockRatio && originalHeight > 0) {
      setWidth(Math.max(1, Math.round((newHeight / originalHeight) * originalWidth)));
    }
  };

  const resizeImage = async () => {
    if (!file || !originalWidth || !originalHeight) return;

    let targetWidth = width;
    let targetHeight = height;

    if (mode === 'width') {
      targetWidth = Math.max(1, Math.round(value));

      if (lockRatio) {
        targetHeight = Math.max(
          1,
          Math.round((targetWidth / originalWidth) * originalHeight)
        );
      }
    }

    if (mode === 'height') {
      targetHeight = Math.max(1, Math.round(value));

      if (lockRatio) {
        targetWidth = Math.max(
          1,
          Math.round((targetHeight / originalHeight) * originalWidth)
        );
      }
    }

    if (mode === 'percentage') {
      const percentage = Math.max(1, Math.min(1000, value));
      targetWidth = Math.max(1, Math.round(originalWidth * percentage / 100));
      targetHeight = Math.max(1, Math.round(originalHeight * percentage / 100));
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Could not process the image.');
        URL.revokeObjectURL(objectUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const extension =
        outputFormat === 'image/png'
          ? 'png'
          : outputFormat === 'image/webp'
            ? 'webp'
            : 'jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Could not create the resized image.');
            URL.revokeObjectURL(objectUrl);
            return;
          }

          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = downloadUrl;
          link.download = `studysetu-photo-${targetWidth}x${targetHeight}.${extension}`;
          link.click();

          URL.revokeObjectURL(downloadUrl);
          URL.revokeObjectURL(objectUrl);
        },
        outputFormat,
        quality / 100
      );
    };

    img.src = objectUrl;
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(500);
    setHeight(500);
    setValue(500);
    setError('');
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Photo Resize</h1>

        <p className="mt-2 text-gray-600">
          Resize your photo for online applications and forms.
          Processing happens in your browser.
        </p>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <label className="block text-sm font-semibold text-gray-800">
            Select Photo
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
                <p className="text-sm font-semibold">Original Photo</p>

                <img
                  src={preview}
                  alt="Selected photo"
                  className="mt-3 max-h-80 w-full rounded-xl border object-contain"
                />

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
                <label className="text-sm font-semibold">Resize Mode</label>

                <select
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ResizeMode)}
                >
                  <option value="width">By Width</option>
                  <option value="height">By Height</option>
                  <option value="percentage">By Percentage</option>
                </select>

                {mode !== 'percentage' && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
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
                )}

                {mode === 'percentage' && (
                  <div className="mt-4">
                    <label className="text-sm text-gray-600">
                      Percentage
                    </label>
                    <input
                      className="mt-1 w-full rounded-lg border border-gray-300 p-3"
                      type="number"
                      min="1"
                      max="1000"
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                    />
                  </div>
                )}

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
                    Output Format
                  </label>

                  <select
                    className="mt-2 w-full rounded-lg border border-gray-300 p-3"
                    value={outputFormat}
                    onChange={(e) =>
                      setOutputFormat(
                        e.target.value as 'image/jpeg' | 'image/png' | 'image/webp'
                      )
                    }
                  >
                    <option value="image/jpeg">JPG</option>
                    <option value="image/png">PNG</option>
                    <option value="image/webp">WebP</option>
                  </select>
                </div>

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
                  onClick={resizeImage}
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
          <h2 className="text-xl font-bold">Why does photo size matter?</h2>
          <p className="mt-2 text-gray-600">
            Government and online application forms often require specific
            image dimensions and file-size limits. StudySetu helps prepare
            your photo directly in the browser without uploading it to a
            server.
          </p>
        </section>
      </div>
    </main>
  );
}
