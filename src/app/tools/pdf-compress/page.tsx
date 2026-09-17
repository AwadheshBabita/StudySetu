"use client";

import { ChangeEvent, useState } from "react";
import { PDFDocument } from "pdf-lib";

type Level = "low" | "medium" | "high";

const levels: Record<Level, { scale: number; quality: number }> = {
  low: { scale: 1.25, quality: 0.75 },
  medium: { scale: 1.0, quality: 0.60 },
  high: { scale: 0.85, quality: 0.40 },
};

export default function PdfCompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>("medium");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [outputSize, setOutputSize] = useState<number | null>(null);

  const selectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    if (url) URL.revokeObjectURL(url);
    setUrl("");
    setOutputSize(null);
    setMessage("");
    setProgress("");
    setFile(f);
  };

  const compress = async () => {
    if (!file) {
      setMessage("कृपया पहले एक PDF चुनें।");
      return;
    }

    setBusy(true);
    setMessage("");
    setProgress("PDF लोड हो रही है...");

    try {
      const pdfjs = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as any;
      const inputBytes = new Uint8Array(await file.arrayBuffer());
      const loadingTask = pdfjs.getDocument({
        data: inputBytes,
        disableWorker: true,
      });

      const source = await loadingTask.promise;
      const output = await PDFDocument.create();
      const config = levels[level];
      const totalPages = source.numPages;

      for (let i = 1; i <= totalPages; i++) {
        setProgress(`पेज ${i} / ${totalPages} कंप्रेस हो रहा है...`);
        const page = await source.getPage(i);
        const viewport = page.getViewport({ scale: config.scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        const context = canvas.getContext("2d");

        if (!context) throw new Error("Canvas unavailable.");

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;

        const jpgBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("JPEG fail"))),
            "image/jpeg",
            config.quality
          );
        });

        canvas.width = 0;
        canvas.height = 0;

        const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer());
        const image = await output.embedJpg(jpgBytes);

        const outPage = output.addPage([viewport.width, viewport.height]);
        outPage.drawImage(image, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setProgress("अंतिम PDF तैयार हो रही है...");
      const bytes = await output.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      const buffer = new ArrayBuffer(bytes.byteLength);
      new Uint8Array(buffer).set(bytes);
      const blob = new Blob([buffer], { type: "application/pdf" });

      if (url) URL.revokeObjectURL(url);
      const newUrl = URL.createObjectURL(blob);
      setUrl(newUrl);
      setOutputSize(blob.size);

      const reduction = ((file.size - blob.size) / file.size) * 100;
      setMessage(
        blob.size < file.size
          ? `सफल — साइज ${reduction.toFixed(1)}% कम हो गया।`
          : "साइज और कम नहीं हो सका। कृपया 'High' विकल्प चुनें।"
      );
      setProgress("");
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error ? error.message : "कंप्रेशन में त्रुटि आई।"
      );
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <section className="rounded-2xl border p-6 shadow-sm bg-white">
        <h1 className="text-3xl font-bold">PDF Compressor</h1>
        <p className="mt-2 text-sm text-gray-600">
          फ़ाइल आपके ब्राउज़र में प्रोसेस होती है, सर्वर पर अपलोड नहीं होती।
        </p>

        <input
          className="mt-6 block w-full rounded-lg border p-3"
          type="file"
          accept=".pdf,application/pdf"
          onChange={selectFile}
        />

        {file && (
          <p className="mt-3 text-sm text-gray-700">
            चयनित: <strong>{file.name}</strong> — {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        )}

        <div className="mt-5">
          <label className="block text-sm font-medium mb-1">कंप्रेशन स्तर चुनें:</label>
          <select
            className="w-full rounded-lg border p-3"
            value={level}
            onChange={(e) => setLevel(e.target.value as Level)}
          >
            <option value="low">Low — बेहतर क्वालिटी</option>
            <option value="medium">Medium — संतुलित</option>
            <option value="high">High — छोटा साइज</option>
          </select>
        </div>

        <button
          className="mt-5 w-full rounded-lg bg-blue-600 text-white px-5 py-3 font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
          onClick={compress}
          disabled={!file || busy}
        >
          {busy ? (progress || "कंप्रेस हो रहा है...") : "Compress PDF"}
        </button>

        {progress && (
          <div className="mt-4 text-sm text-blue-600 font-medium">{progress}</div>
        )}

        {message && (
          <div className="mt-4 rounded-lg border p-4 text-sm bg-gray-50">{message}</div>
        )}

        {outputSize !== null && (
          <p className="mt-3 text-sm font-semibold text-green-700">
            नया साइज: {(outputSize / 1024 / 1024).toFixed(2)} MB
          </p>
        )}

        {url && (
          <a
            className="mt-4 block rounded-lg bg-green-600 text-white px-5 py-3 text-center font-semibold hover:bg-green-700 transition"
            href={url}
            download={`${file?.name.replace(/\.pdf$/i, "")}-compressed.pdf`}
          >
            डाउनलोड कंप्रेस्ड PDF
          </a>
        )}
      </section>
    </main>
  );
}
