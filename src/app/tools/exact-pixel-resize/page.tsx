'use client';

import { ChangeEvent, useEffect, useState } from 'react';

export default function ExactPixelResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(300);
  const [lockRatio, setLockRatio] = useState(false);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState(90);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [preview, resultUrl]);

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
    };

    img.src = url;
  };

  const updateWidth = (value: number) => {
    setWidth(value);

    if (lockRatio && originalWidth > 0 && originalHeight > 0) {
      setHeight(Math.max(1, Math.round((value / originalWidth) * originalHeight)));
    }
  };

  const updateHeight = (value: number) => {
    setHeight(value);

    if (lockRatio && originalWidth > 0 && originalHeight > 0) {
      setWidth(Math.max(1, Math.round((value / originalHeight) * originalWidth)));
    }
  };

  const resizeImage = () => {
    if (!file || width < 1 || height < 1) {
      setError('Please select an image and enter valid dimensions.');
      return;
    }

    setError('');

    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Your browser does not support image processing.');
        return;
      }

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError('Unable to create the resized image.');
            return;
          }

          const url = URL.createObjectURL(blob);
          setResultUrl(url);
        },
        format,
        quality / 100
      );
    };

    img.src = preview;
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setResultUrl('');
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(300);
    setHeight(300);
    setError('');
  };

  const extension = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Exact Pixel Resize
        </h1>

        <p className="mt-2 text-gray-600">
          Resize your photo to exact width and height in pixels.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800">
            Select Image
          </label>

          <input
            className="mt-3 block w-full rounded-lg border border-gray-300 p-3"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
          />

          {file && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm">
              <p><strong>File:</strong> {file.name}</p>
              <p>
                <strong>Original:</strong> {originalWidth} × {originalHeight}px
              </p>
            </div>
          )}

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        {preview && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Resize Settings</h2>

              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Width (px)</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 p-3"
                    type="number"
                    min="1"
                    value={width}
                    onChange={(e) => updateWidth(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Height (px)</label>
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
                Lock aspect ratio
              </label>

              <div className="mt-5">
                <label className="text-sm text-gray-600">Output Format</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3"
                  value={format}
                  onChange={(e) =>
                    setFormat(e.target.value as typeof format)
                  }
                >
                  <option value="image/jpeg">JPG / JPEG</option>
                  <option value="image/png">PNG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              {format !== 'image/png' && (
                <div className="mt-5">
                  <label className="text-sm text-gray-600">
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
              )}

              <button
                onClick={resizeImage}
                className="mt-6 w-full rounded-lg bg-black px-4 py-3 font-semibold text-white"
              >
                Resize Image
              </button>

              <button
                onClick={reset}
                className="mt-3 w-full rounded-lg border border-gray-300 px-4 py-3 font-medium"
              >
                Reset
              </button>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Preview</h2>

              <div className="mt-4 overflow-hidden rounded-lg bg-gray-100 p-3">
                <img
                  src={preview}
                  alt="Original preview"
                  className="mx-auto max-h-72 object-contain"
                />
              </div>

              <p className="mt-3 text-center text-sm text-gray-600">
                Target: {width} × {height}px
              </p>

              {resultUrl && (
                <>
                  <div className="mt-5 overflow-hidden rounded-lg bg-gray-100 p-3">
                    <img
                      src={resultUrl}
                      alt="Resized result"
                      className="mx-auto max-h-72 object-contain"
                    />
                  </div>

                  <a
                    href={resultUrl}
                    download={`studysetu-${width}x${height}.${extension}`}
                    className="mt-4 block rounded-lg bg-green-600 px-4 py-3 text-center font-semibold text-white"
                  >
                    Download Resized Image
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        <section className="mt-8 rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold">Why exact pixel size matters?</h2>

          <p className="mt-3 text-gray-600">
            Online application forms often require photographs and signatures
            with specific pixel dimensions. This tool lets you create the
            required dimensions directly in your browser.
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Your image is processed locally in your browser and is not uploaded
            to a server.
          </p>
        </section>
      </div>
    </main>
  );
}
