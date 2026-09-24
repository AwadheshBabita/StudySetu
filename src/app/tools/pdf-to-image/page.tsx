'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [dpiScale, setDpiScale] = useState<number>(1.5); // HD Quality
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type === 'application/pdf' || selected.name.endsWith('.pdf')) {
        setFile(selected);
        setImages([]);
      } else {
        alert('कृपया केवल PDF फ़ाइल चुनें!');
      }
    }
  };

  const convertPdfToImages = async () => {
    if (!file) return;
    setConverting(true);
    setImages([]);

    try {
      // Load pdfjs from CDN dynamically
      const pdfjsLib = await import('pdfjs-dist/build/pdf');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const convertedImages: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: dpiScale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport }).promise;
          const imgUrl = canvas.toDataURL(`image/${format}`, 0.92);
          convertedImages.push(imgUrl);
        }
      }

      setImages(convertedImages);
    } catch (err) {
      console.error(err);
      alert('PDF लोड करने में समस्या आई। कृपया साफ़ PDF चुनें।');
    } finally {
      setConverting(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `page-${index + 1}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.click();
  };

  const downloadAll = () => {
    images.forEach((img, idx) => {
      setTimeout(() => downloadImage(img, idx), idx * 300);
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full hover:bg-green-200 transition-colors">
            ← होमपेज पर वापस जाएँ
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6 text-center">
          <div className="text-4xl mb-2">🖼️</div>
          <h1 className="text-2xl font-black text-slate-800">
            PDF to Image Converter (JPG / PNG)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            PDF के सभी पन्नों को अलग-अलग हाई-क्वालिटी JPG या PNG फ़ोटो में बदलें और तुरंत डाउनलोड करें।
          </p>
        </div>

        {/* Upload & Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-green-500/50 bg-green-50/50 hover:bg-green-50 rounded-xl p-8 text-center cursor-pointer transition-colors"
            >
              <span className="text-4xl block mb-2">📂</span>
              <span className="text-sm font-bold text-green-800 block">
                PDF फ़ाइल चुनें या यहाँ ड्रॉप करें
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                (सुरक्षित व प्राइवेट - फ़ाइल आपके ब्राउज़र में ही प्रोसेस होती है)
              </span>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-xl">📄</span>
                  <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                </div>
                <button
                  onClick={() => { setFile(null); setImages([]); }}
                  className="text-xs text-red-600 font-bold hover:underline shrink-0"
                >
                  बदलें ✕
                </button>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">फ़ॉर्मेट चुनें</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="jpeg">JPG (फ़ोटो फ़ॉर्मेट)</option>
                    <option value="png">PNG (हाई क्लेरिटी)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">क्वालिटी (DPI)</label>
                  <select
                    value={dpiScale}
                    onChange={(e) => setDpiScale(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value={1.0}>नॉर्मल (Standard Size)</option>
                    <option value={1.5}>HD क्वालिटी (Recommended)</option>
                    <option value={2.0}>Ultra HD (High DPI Print)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={convertPdfToImages}
                disabled={converting}
                className="w-full py-3 bg-[#16a34a] hover:bg-[#15803d] disabled:bg-slate-400 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {converting ? (
                  <span>⏳ पन्ने बदले जा रहे हैं...</span>
                ) : (
                  <span>⚡ PDF को तस्वीरों में बदलें</span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {images.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">
                तैयार तस्वीरें (कुल {images.length} पेज)
              </h2>
              {images.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  सभी डाउनलोड करें ⬇️
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center flex flex-col justify-between">
                  <div className="bg-white p-2 border border-slate-200 rounded-lg mb-2 flex items-center justify-center min-h-[140px]">
                    <img src={img} alt={`Page ${idx + 1}`} className="max-h-48 object-contain rounded" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700">पेज {idx + 1}</span>
                    <button
                      onClick={() => downloadImage(img, idx)}
                      className="px-3 py-1 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-bold rounded-md"
                    >
                      डाउनलोड ⬇️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
