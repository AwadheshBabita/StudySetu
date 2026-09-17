"use client";

import { useState, ChangeEvent } from "react";
import jsPDF from "jspdf";

interface ImageItem {
  id: string;
  name: string;
  src: string;
  width: number;
  height: number;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [margin, setMargin] = useState<number>(10);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);

    const newItems: Promise<ImageItem>[] = Array.from(files).map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const src = event.target?.result as string;
          const img = new Image();
          img.onload = () => {
            resolve({
              id: Math.random().toString(36).substring(2, 9),
              name: file.name,
              src,
              width: img.width,
              height: img.height,
            });
          };
          img.src = src;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newItems).then((loaded) => {
      setImages((prev) => [...prev, ...loaded]);
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setProcessing(true);

    try {
      const doc = new jsPDF({
        orientation: orientation,
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const printWidth = pageWidth - margin * 2;
      const printHeight = pageHeight - margin * 2;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) doc.addPage("a4", orientation);

        const img = images[i];
        const ratio = Math.min(printWidth / img.width, printHeight / img.height);
        const w = img.width * ratio;
        const h = img.height * ratio;
        const x = margin + (printWidth - w) / 2;
        const y = margin + (printHeight - h) / 2;

        doc.addImage(img.src, "JPEG", x, y, w, h, undefined, "FAST");
      }

      const pdfBlob = doc.output("blob");
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      const url = URL.createObjectURL(pdfBlob);
      setDownloadUrl(url);
    } catch (err) {
      console.error(err);
      alert("PDF बनाने में समस्या आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          Image to PDF Converter
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          तस्वीरों को क्रमबद्ध करके उच्च-गुणवत्ता A4 PDF में बदलें
        </p>

        {/* Upload Box */}
        <div className="mt-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-6 text-center">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            id="multiImgInput"
            className="hidden"
          />
          <label
            htmlFor="multiImgInput"
            className="cursor-pointer inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            📑 फोटो चुनें (एक या अधिक)
          </label>
          <p className="text-xs text-slate-500 mt-2">JPG, PNG फाइल्स सपोर्टेड</p>
        </div>

        {images.length > 0 && (
          <div className="mt-6 space-y-5">
            {/* Settings */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">पेज ओरिएंटेशन</label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white"
                >
                  <option value="portrait">Portrait (सीधा)</option>
                  <option value="landscape">Landscape (आड़ा)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">मार्जिन (Border)</label>
                <select
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white"
                >
                  <option value="0">बिना मार्जिन (0 mm)</option>
                  <option value="10">सामान्य मार्जिन (10 mm)</option>
                  <option value="20">चौड़ा मार्जिन (20 mm)</option>
                </select>
              </div>
            </div>

            {/* Selected Images List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-600 uppercase">चयनित तस्वीरें ({images.length})</p>
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-white"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                    <img src={img.src} alt="thumb" className="w-10 h-10 object-cover rounded border" />
                    <span className="text-sm truncate max-w-[150px] sm:max-w-xs">{img.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                      className="p-1 text-slate-500 hover:text-blue-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                    <button
                      onClick={() => removeImage(img.id)}
                      className="p-1 text-red-500 hover:text-red-700 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <button
              onClick={generatePdf}
              disabled={processing}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {processing ? "PDF तैयार हो रही है..." : "PDF बनाएँ और डाउनलोड करें"}
            </button>
          </div>
        )}

        {/* Result Area */}
        {downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">PDF सफलतापूर्वक तैयार हो गई!</p>
            <a
              href={downloadUrl}
              download="studysetu-document.pdf"
              className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
            >
              📥 डाउनलोड PDF
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
