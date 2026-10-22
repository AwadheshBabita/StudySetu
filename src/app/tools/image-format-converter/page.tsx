"use client";

import { useState, useRef, ChangeEvent } from "react";
import Link from "next/link";

type OutputFormat = "jpeg" | "png" | "webp" | "pdf" | "bmp" | "ico" | "tiff" | "gif";

interface ImageMeta {
  name: string;
  originalSizeKB: number;
  width: number;
  height: number;
  type: string;
}

export default function ImageFormatConverterPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [meta, setMeta] = useState<ImageMeta | null>(null);
  const [targetFormat, setTargetFormat] = useState<OutputFormat>("jpeg");
  const [quality, setQuality] = useState<number>(0.92);
  const [targetKB, setTargetKB] = useState<string>("");
  const [icoSize, setIcoSize] = useState<number>(32);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [resultKB, setResultKB] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setResultKB(null);

    const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || "image";
    const sizeKB = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setMeta({
          name: baseName,
          originalSizeKB: sizeKB,
          width: img.width,
          height: img.height,
          type: file.type || "इमेज"
        });
        setImageSrc(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleConvert = async () => {
    if (!imageSrc || !meta) return;
    setProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      // 1. PDF जेनरेशन
      if (targetFormat === "pdf") {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }

        canvas.toBlob((blob) => {
          if (!blob) {
            setProcessing(false);
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = (reader.result as string).split(",")[1];
            const pdfDoc = createSimplePdf(base64data, img.width, img.height);
            const pdfBlob = new Blob([pdfDoc], { type: "application/pdf" });
            const url = URL.createObjectURL(pdfBlob);
            setDownloadUrl(url);
            setResultKB(Math.round(pdfBlob.size / 1024));
            setProcessing(false);
          };
          reader.readAsDataURL(blob);
        }, "image/jpeg", 0.95);
        return;
      }

      // 2. BMP जेनरेशन
      if (targetFormat === "bmp") {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const bmpBlob = generateBmpBlob(imageData);
          const url = URL.createObjectURL(bmpBlob);
          setDownloadUrl(url);
          setResultKB(Math.round(bmpBlob.size / 1024));
        }
        setProcessing(false);
        return;
      }

      // 3. TIFF जेनरेशन (प्योर बाइनरी)
      if (targetFormat === "tiff") {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const tiffBlob = generateTiffBlob(imageData);
          const url = URL.createObjectURL(tiffBlob);
          setDownloadUrl(url);
          setResultKB(Math.round(tiffBlob.size / 1024));
        }
        setProcessing(false);
        return;
      }

      // 4. Canvas आधारित (JPEG, PNG, WEBP, ICO, GIF)
      const canvas = document.createElement("canvas");
      let w = img.width;
      let h = img.height;

      if (targetFormat === "ico") {
        w = icoSize;
        h = icoSize;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setProcessing(false);
        return;
      }

      if (targetFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }

      ctx.drawImage(img, 0, 0, w, h);

      const mimeType = targetFormat === "ico" ? "image/png" : `image/${targetFormat}`;

      // टारगेट KB (JPEG/WEBP)
      if (targetKB && parseInt(targetKB, 10) > 0 && (targetFormat === "jpeg" || targetFormat === "webp")) {
        const targetBytes = parseInt(targetKB, 10) * 1024;
        let minQ = 0.05;
        let maxQ = 0.98;
        let bestBlob: Blob | null = null;

        for (let i = 0; i < 6; i++) {
          const currentQ = (minQ + maxQ) / 2;
          const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, mimeType, currentQ));
          if (!blob) break;
          bestBlob = blob;
          if (blob.size > targetBytes) {
            maxQ = currentQ;
          } else {
            minQ = currentQ;
          }
        }

        if (bestBlob) {
          const url = URL.createObjectURL(bestBlob);
          setDownloadUrl(url);
          setResultKB(Math.round(bestBlob.size / 1024));
        }
        setProcessing(false);
        return;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);
            setResultKB(Math.round(blob.size / 1024));
          }
          setProcessing(false);
        },
        mimeType,
        (targetFormat === "png" || targetFormat === "gif") ? undefined : quality
      );
    } catch (err) {
      console.error(err);
      alert("कन्वर्ट करने में समस्या आई, कृपया पुनः प्रयास करें।");
      setProcessing(false);
    }
  };

  // BMP बाइनरी बिल्डर
  function generateBmpBlob(imageData: ImageData): Blob {
    const width = imageData.width;
    const height = imageData.height;
    const extraBytes = (4 - ((width * 3) % 4)) % 4;
    const imageSize = (width * 3 + extraBytes) * height;
    const fileSize = 54 + imageSize;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);

    view.setUint16(0, 0x4d42, true);
    view.setUint32(2, fileSize, true);
    view.setUint32(10, 54, true);
    view.setUint32(14, 40, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(34, imageSize, true);

    let offset = 54;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        view.setUint8(offset++, imageData.data[idx + 2]);
        view.setUint8(offset++, imageData.data[idx + 1]);
        view.setUint8(offset++, imageData.data[idx]);
      }
      for (let p = 0; p < extraBytes; p++) {
        view.setUint8(offset++, 0);
      }
    }
    return new Blob([buffer], { type: "image/bmp" });
  }

  // TIFF बाइनरी बिल्डर (Little Endian, Baseline RGB)
  function generateTiffBlob(imageData: ImageData): Blob {
    const width = imageData.width;
    const height = imageData.height;
    const numPixels = width * height;
    const dataSize = numPixels * 3;
    const numEntries = 12;
    const ifdOffset = 8;
    const ifdSize = 2 + numEntries * 12 + 4;
    const valuesOffset = ifdOffset + ifdSize;
    const bitsPerSampleOffset = valuesOffset; // 6 bytes
    const xResOffset = bitsPerSampleOffset + 6; // 8 bytes
    const yResOffset = xResOffset + 8; // 8 bytes
    const imageDataOffset = yResOffset + 8;
    const totalSize = imageDataOffset + dataSize;

    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);

    // Header
    view.setUint16(0, 0x4949, true); // II (Little Endian)
    view.setUint16(2, 42, true);
    view.setUint32(4, ifdOffset, true);

    // IFD Entries
    view.setUint16(ifdOffset, numEntries, true);
    let entryOffset = ifdOffset + 2;

    const addEntry = (tag: number, type: number, count: number, valOrOffset: number) => {
      view.setUint16(entryOffset, tag, true);
      view.setUint16(entryOffset + 2, type, true);
      view.setUint32(entryOffset + 4, count, true);
      view.setUint32(entryOffset + 8, valOrOffset, true);
      entryOffset += 12;
    };

    addEntry(0x0100, 4, 1, width); // ImageWidth
    addEntry(0x0101, 4, 1, height); // ImageLength
    addEntry(0x0102, 3, 3, bitsPerSampleOffset); // BitsPerSample
    addEntry(0x0103, 3, 1, 1); // Compression (1 = uncompressed)
    addEntry(0x0106, 3, 1, 2); // PhotometricInterpretation (2 = RGB)
    addEntry(0x0111, 4, 1, imageDataOffset); // StripOffsets
    addEntry(0x0115, 3, 1, 3); // SamplesPerPixel
    addEntry(0x0116, 4, 1, height); // RowsPerStrip
    addEntry(0x0117, 4, 1, dataSize); // StripByteCounts
    addEntry(0x011a, 5, 1, xResOffset); // XResolution
    addEntry(0x011b, 5, 1, yResOffset); // YResolution
    addEntry(0x0128, 3, 1, 2); // ResolutionUnit (2 = Inch)

    view.setUint32(entryOffset, 0, true); // Next IFD offset = 0

    // Extra Values
    view.setUint16(bitsPerSampleOffset, 8, true);
    view.setUint16(bitsPerSampleOffset + 2, 8, true);
    view.setUint16(bitsPerSampleOffset + 4, 8, true);

    // 72/1 DPI
    view.setUint32(xResOffset, 72, true);
    view.setUint32(xResOffset + 4, 1, true);
    view.setUint32(yResOffset, 72, true);
    view.setUint32(yResOffset + 4, 1, true);

    // Image Data (RGB)
    let dOff = imageDataOffset;
    for (let i = 0; i < numPixels; i++) {
      const pIdx = i * 4;
      view.setUint8(dOff++, imageData.data[pIdx]);     // R
      view.setUint8(dOff++, imageData.data[pIdx + 1]); // G
      view.setUint8(dOff++, imageData.data[pIdx + 2]); // B
    }

    return new Blob([buffer], { type: "image/tiff" });
  }

  // A4 / इमेज PDF स्ट्रक्चर
  function createSimplePdf(base64Jpg: string, width: number, height: number): Uint8Array {
    const ptWidth = Math.round(width * 0.75);
    const ptHeight = Math.round(height * 0.75);
    const binaryImg = atob(base64Jpg);
    const imgLength = binaryImg.length;

    const header = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
    const pages = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
    const page = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${ptWidth} ${ptHeight}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;
    const xobj = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imgLength} >>\nstream\n`;
    const xobjEnd = `\nendstream\nendobj\n`;
    const contentStream = `q\n${ptWidth} 0 0 ${ptHeight} 0 0 cm\n/Im1 Do\nQ`;
    const content = `5 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`;

    const enc = new TextEncoder();
    const p1 = enc.encode(header + pages + page + xobj);
    const pImg = new Uint8Array(imgLength);
    for (let i = 0; i < imgLength; i++) pImg[i] = binaryImg.charCodeAt(i);
    const p2 = enc.encode(xobjEnd + content + `xref\n0 6\n0000000000 65535 f \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n10\n%%EOF`);

    const full = new Uint8Array(p1.length + pImg.length + p2.length);
    full.set(p1, 0);
    full.set(pImg, p1.length);
    full.set(p2, p1.length + pImg.length);
    return full;
  }

  const formats: { id: OutputFormat; label: string; badge: string }[] = [
    { id: "jpeg", label: "JPG / JPEG", badge: "सरकारी मानक" },
    { id: "png", label: "PNG", badge: "साफ व पारदर्शी" },
    { id: "webp", label: "WEBP", badge: "लाइटवेट वेब" },
    { id: "pdf", label: "PDF", badge: "A4 डॉक" },
    { id: "tiff", label: "TIFF", badge: "प्रिंट व स्कैन" },
    { id: "bmp", label: "BMP", badge: "बिटमैप" },
    { id: "ico", label: "ICO", badge: "फेविकॉन" },
    { id: "gif", label: "GIF", badge: "वेब ग्राफ़िक्स" },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-2 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300">
        
        {/* शीर्ष नेवबार */}
        <div className="bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📷</span>
            <span className="font-bold text-sm tracking-wide">ExamSewa - इमेज फॉर्मेट कनवर्टर</span>
          </div>
          <Link
            href="/"
            className="text-xs bg-slate-700/80 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-200 transition-colors"
          >
            ← होम
          </Link>
        </div>

        <div className="p-4 space-y-4">
          
          {/* प्रीव्यू बॉक्स */}
          <div className="w-full min-h-[220px] max-h-[300px] border border-slate-200 rounded-xl bg-slate-50/70 flex flex-col items-center justify-center p-3 relative overflow-hidden">
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Preview"
                className="max-h-[200px] w-auto max-w-full object-contain rounded-md"
              />
            ) : (
              <div className="text-center text-slate-400">
                <div className="text-4xl mb-1">🖼️</div>
                <p className="text-xs font-semibold text-slate-500">कोई फोटो लोड नहीं है</p>
                <p className="text-[11px] text-slate-400 mt-0.5">फोटो लोड करके फॉर्मेट बदलें</p>
              </div>
            )}

            {meta && (
              <div className="w-full bg-slate-800/90 text-white text-[11px] py-1 px-3 mt-2 rounded flex justify-between items-center">
                <span className="truncate max-w-[150px]">{meta.name}</span>
                <span>{meta.width}×{meta.height} px | {meta.originalSizeKB} KB</span>
              </div>
            )}
          </div>

          {/* फोटो लोड बटन */}
          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="w-full border-2 border-dashed border-blue-400 hover:border-blue-600 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>📁</span> फोटो लोड करें
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.avif"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* आउटपुट फॉर्मेट चयन (4 कॉलम ग्रिड - कुल 8 फॉर्मेट्स) */}
          <div className="border border-slate-200 rounded-xl p-3 bg-white relative pt-4">
            <span className="absolute -top-2.5 left-3 bg-white px-2 text-[11px] font-bold text-slate-600">
              आउटपुट फॉर्मेट चुनें
            </span>
            <div className="grid grid-cols-4 gap-2">
              {formats.map((fmt) => {
                const isSelected = targetFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setTargetFormat(fmt.id);
                      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
                      setDownloadUrl(null);
                      setResultKB(null);
                    }}
                    className={`py-2 px-1 rounded-lg border text-center transition-all flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-[#0f172a] text-white border-[#0f172a] shadow"
                        : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-[11px] font-bold leading-tight">{fmt.label}</span>
                    <span className={`text-[8.5px] mt-0.5 leading-none ${isSelected ? "text-emerald-300" : "text-slate-500"}`}>
                      {fmt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* सेटिंग्स: टारगेट KB और क्वालिटी */}
          <div className="grid grid-cols-2 gap-2">
            
            {/* Target KB बॉक्स */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-white relative pt-3.5">
              <span className="absolute -top-2 left-2.5 bg-white px-1.5 text-[10px] font-bold text-slate-600">
                Target File (KB)
              </span>
              <div className="flex items-center gap-1.5 mb-2">
                <input
                  type="number"
                  placeholder="उदा. 50"
                  value={targetKB}
                  disabled={targetFormat !== "jpeg" && targetFormat !== "webp"}
                  onChange={(e) => setTargetKB(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-300 rounded px-2 py-1 focus:outline-blue-500 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
              <div className="flex justify-between gap-1">
                {["20", "50", "100"].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    disabled={targetFormat !== "jpeg" && targetFormat !== "webp"}
                    onClick={() => setTargetKB(kb)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition-colors ${
                      targetKB === kb
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                    }`}
                  >
                    {kb}K
                  </button>
                ))}
              </div>
            </div>

            {/* क्वालिटी या ICO साइज़ बॉक्स */}
            <div className="border border-slate-200 rounded-xl p-2.5 bg-white relative pt-3.5">
              <span className="absolute -top-2 left-2.5 bg-white px-1.5 text-[10px] font-bold text-slate-600">
                {targetFormat === "ico" ? "Favicon Size" : "Resolution (Quality)"}
              </span>

              {targetFormat === "ico" ? (
                <div className="flex justify-between gap-1 mt-2">
                  {[16, 32, 48].map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setIcoSize(sz)}
                      className={`flex-1 py-1 rounded text-[10px] font-bold border ${
                        icoSize === sz
                          ? "bg-[#0f172a] text-white border-[#0f172a]"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <div className="text-right text-[10px] font-bold text-slate-500 mb-1">
                    {Math.round(quality * 100)}% HD
                  </div>
                  <div className="flex justify-between gap-1">
                    {[
                      { val: 0.7, label: "Medium" },
                      { val: 0.85, label: "High" },
                      { val: 0.95, label: "Max" }
                    ].map((q) => (
                      <button
                        key={q.label}
                        type="button"
                        disabled={targetFormat === "png" || targetFormat === "bmp" || targetFormat === "tiff" || targetFormat === "gif"}
                        onClick={() => setQuality(q.val)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold border ${
                          quality === q.val && targetFormat !== "png" && targetFormat !== "bmp" && targetFormat !== "tiff" && targetFormat !== "gif"
                            ? "bg-[#0f172a] text-white border-[#0f172a]"
                            : "bg-slate-50 text-slate-700 border-slate-200 disabled:opacity-40"
                        }`}
                      >
                        {q.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* मुख्य एक्शन बटन */}
          <button
            onClick={handleConvert}
            disabled={!imageSrc || processing}
            type="button"
            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {processing ? (
              <span>⏳ प्रोसेसिंग हो रही है...</span>
            ) : (
              <span>⚡ OK (सटीक {targetFormat.toUpperCase()} में बदलें)</span>
            )}
          </button>

          {/* डाउनलोड कार्ड */}
          {downloadUrl && (
            <div className="border border-emerald-300 bg-emerald-50 rounded-xl p-3 flex items-center justify-between gap-2 animate-in fade-in">
              <div>
                <p className="text-xs font-bold text-emerald-900">
                  सफलतापूर्वक बदल दिया गया! 🎉
                </p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  नया साइज: <b>{resultKB} KB</b> (ओरिजिनल: {meta?.originalSizeKB} KB)
                </p>
              </div>
              <a
                href={downloadUrl}
                download={`${meta?.name || "image"}_converted.${targetFormat === "ico" ? "ico" : targetFormat}`}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3.5 rounded-lg shadow transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>📥</span> डाउनलोड
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
