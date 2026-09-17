"use client";

import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

type CompressionLevel = "low" | "medium" | "high";

const SETTINGS = {
  low: { scale: 1.5, quality: 0.82 },
  medium: { scale: 1.2, quality: 0.65 },
  high: { scale: 0.9, quality: 0.45 },
} as const;

export default function PdfCompressPage() {
  const [selected, setSelected] = useState<File | null>(null);
  const [level, setLevel] = useState<CompressionLevel>("medium");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setMessage("ERROR: Please select a PDF file.");
      return;
    }
    setSelected(file);
    setMessage("");
  }

  async function compressPdf() {
    if (!selected || busy) return;

    setBusy(true);
    setMessage("Compressing PDF...");

    try {
      const data = new Uint8Array(await selected.arrayBuffer());

      const pdfjs = pdfjsLib as typeof pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const source = await pdfjs.getDocument({ data }).promise;
      const output = await PDFDocument.create();
      const settings = SETTINGS[level];

      for (let pageNo = 1; pageNo <= source.numPages; pageNo++) {
        const page = await source.getPage(pageNo);
        const viewport = page.getViewport({ scale: settings.scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Canvas is not available.");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvas: canvas,
          canvasContext: context,
          viewport,
        }).promise;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/jpeg", settings.quality)
        );

        if (!blob) throw new Error(`JPEG conversion failed on page ${pageNo}.`);

        const imageBytes = new Uint8Array(await blob.arrayBuffer());
        const image = await output.embedJpg(imageBytes);

        const outPage = output.addPage([viewport.width, viewport.height]);
        outPage.drawImage(image, {
          x: 0,
          y: 0,
          width: viewport.width,
          height: viewport.height,
        });
      }

      const result = await output.save();
      const resultBuffer = new ArrayBuffer(result.byteLength);
      new Uint8Array(resultBuffer).set(result);
      const blob = new Blob([resultBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${selected.name}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const oldSize = selected.size;
      const newSize = blob.size;
      const percent =
        oldSize > 0 ? Math.max(0, Math.round((1 - newSize / oldSize) * 100)) : 0;

      setMessage(
        `SUCCESS: ${source.numPages} page(s) processed | ${Math.round(
          oldSize / 1024
        )} KB → ${Math.round(newSize / 1024)} KB | ${percent}% smaller`
      );
    } catch (error) {
      console.error(error);
      setMessage(
        `ERROR: ${error instanceof Error ? error.message : "PDF compression failed."}`
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">PDF Compress</h1>
        <p className="mt-2 text-sm text-gray-600">
          Reduce PDF size directly in your browser.
        </p>

        <label className="mt-6 block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center">
          <span className="font-medium">
            {selected ? selected.name : "Choose PDF file"}
          </span>
          <input
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />
        </label>

        <div className="mt-5">
          <label className="text-sm font-medium">Compression level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CompressionLevel)}
            className="mt-2 w-full rounded-lg border px-3 py-2"
            disabled={busy}
          >
            <option value="low">Low — better quality</option>
            <option value="medium">Medium — balanced</option>
            <option value="high">High — smaller size</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => void compressPdf()}
          disabled={!selected || busy}
          className="mt-6 w-full rounded-lg px-4 py-3 font-semibold disabled:opacity-50"
        >
          {busy ? "Compressing..." : "Compress PDF"}
        </button>

        {message && (
          <p className="mt-4 rounded-lg border p-3 text-sm">{message}</p>
        )}
      </div>
    </main>
  );
}
