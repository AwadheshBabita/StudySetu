"use client";

import { useState, useRef, ChangeEvent } from "react";

export default function IdCardCropperPage() {
  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [backImg, setBackImg] = useState<string | null>(null);
  const [cardBorder, setCardBorder] = useState<boolean>(true);
  const [layoutMode, setLayoutMode] = useState<"single" | "three">("single");
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const cropToCardRatio = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Standard PVC ratio ~ 1.586
          const targetRatio = 85.6 / 53.98;
          const currentRatio = img.naturalWidth / img.naturalHeight;

          let sX = 0, sY = 0, sW = img.naturalWidth, sH = img.naturalHeight;
          if (currentRatio > targetRatio) {
            sW = img.naturalHeight * targetRatio;
            sX = (img.naturalWidth - sW) / 2;
          } else {
            sH = img.naturalWidth / targetRatio;
            sY = (img.naturalHeight - sH) / 2;
          }

          const canvas = document.createElement("canvas");
          canvas.width = 1011;
          canvas.height = 638;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Canvas error");

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, sX, sY, sW, sH, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.96));
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFrontUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const cropped = await cropToCardRatio(file);
      setFrontImg(cropped);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    } catch {
      alert("फोटो लोड करने में समस्या आई");
    }
  };

  const handleBackUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const cropped = await cropToCardRatio(file);
      setBackImg(cropped);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    } catch {
      alert("फोटो लोड करने में समस्या आई");
    }
  };

  const generatePrintableSheet = async () => {
    if (!frontImg || !backImg) {
      alert("कृपया कार्ड का फ्रंट (Front) और बैक (Back) दोनों भाग अपलोड करें!");
      return;
    }
    setProcessing(true);

    try {
      const loadImg = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      const [imgFront, imgBack] = await Promise.all([loadImg(frontImg), loadImg(backImg)]);

      // 300 DPI A4 Canvas (2480 x 3508 pixels)
      const canvas = document.createElement("canvas");
      canvas.width = 2480;
      canvas.height = 3508;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unsupported");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cardWidth = 1011;
      const cardHeight = 638;
      const gap = 120;
      const startX = (canvas.width - (cardWidth * 2 + gap)) / 2;

      const drawCard = (img: HTMLImageElement, x: number, y: number) => {
        ctx.save();
        const radius = 28;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + cardWidth - radius, y);
        ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radius);
        ctx.lineTo(x + cardWidth, y + cardHeight - radius);
        ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - radius, y + cardHeight);
        ctx.lineTo(x + radius, y + cardHeight);
        ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(img, x, y, cardWidth, cardHeight);
        ctx.restore();

        if (cardBorder) {
          ctx.save();
          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + cardWidth - radius, y);
          ctx.quadraticCurveTo(x + cardWidth, y, x + cardWidth, y + radius);
          ctx.lineTo(x + cardWidth, y + cardHeight - radius);
          ctx.quadraticCurveTo(x + cardWidth, y + cardHeight, x + cardWidth - radius, y + cardHeight);
          ctx.lineTo(x + radius, y + cardHeight);
          ctx.quadraticCurveTo(x, y + cardHeight, x, y + cardHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
      };

      const rows = layoutMode === "single" ? 1 : 3;
      const rowGap = 160;
      const initialY = 320;

      for (let i = 0; i < rows; i++) {
        const curY = initialY + i * (cardHeight + rowGap);
        drawCard(imgFront, startX, curY);
        drawCard(imgBack, startX + cardWidth + gap, curY);
      }

      ctx.fillStyle = "#64748b";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "StudySetu ID Card Sheet (300 DPI - Standard 85.6mm x 54mm PVC Size - Direct Print)",
        canvas.width / 2,
        220
      );

      const blob = await new Promise<Blob | null>((res) => {
        canvas.toBlob((b) => res(b), "image/jpeg", 0.98);
      });

      if (blob) {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        setDownloadUrl(URL.createObjectURL(blob));
      }
    } catch (err) {
      console.error(err);
      alert("प्रिंट शीट बनाने में त्रुटि आई।");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 text-slate-800">
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-700 text-center">
          ID Card / PVC Print Cropper
        </h1>
        <p className="text-sm text-slate-500 text-center mt-1">
          पहचान पत्र (आधार, पैन, वोटर ID) को ऑटो-क्रॉप करके A4 शीट पर असली स्मार्ट कार्ड साइज़ में प्रिंट करें
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {/* Front Upload */}
          <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-5 text-center flex flex-col items-center justify-center min-h-[160px]">
            <input
              type="file"
              accept="image/*"
              ref={frontInputRef}
              onChange={handleFrontUpload}
              className="hidden"
            />
            {frontImg ? (
              <div className="space-y-2">
                <img
                  src={frontImg}
                  alt="Front Preview"
                  className="h-24 w-40 object-cover rounded border shadow-sm mx-auto"
                />
                <span className="text-[11px] text-emerald-600 font-bold block">✓ ऑटो-क्रॉप्ड (PVC Ratio)</span>
                <button
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  className="text-xs text-blue-600 font-bold hover:underline block"
                >
                  बदलें (Change Front)
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => frontInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  💳 कार्ड का फ्रंट (Front) चुनें
                </button>
                <p className="text-[11px] text-slate-400 mt-2">आगे का भाग अपलोड करें</p>
              </div>
            )}
          </div>

          {/* Back Upload */}
          <div className="border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-xl p-5 text-center flex flex-col items-center justify-center min-h-[160px]">
            <input
              type="file"
              accept="image/*"
              ref={backInputRef}
              onChange={handleBackUpload}
              className="hidden"
            />
            {backImg ? (
              <div className="space-y-2">
                <img
                  src={backImg}
                  alt="Back Preview"
                  className="h-24 w-40 object-cover rounded border shadow-sm mx-auto"
                />
                <span className="text-[11px] text-emerald-600 font-bold block">✓ ऑटो-क्रॉप्ड (PVC Ratio)</span>
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="text-xs text-blue-600 font-bold hover:underline block"
                >
                  बदलें (Change Back)
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => backInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
                >
                  💳 कार्ड का बैक (Back) चुनें
                </button>
                <p className="text-[11px] text-slate-400 mt-2">पीछे का भाग अपलोड करें</p>
              </div>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="mt-6 space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cardBorder}
                onChange={(e) => setCardBorder(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 w-4 h-4"
              />
              <span className="text-xs sm:text-sm font-semibold text-slate-700">
                कटिंग गाइड बॉर्डर (Cutting Guide Line)
              </span>
            </label>
            <span className="text-xs font-bold text-slate-500">A4 @ 300 DPI</span>
          </div>

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase">प्रिंट लेआउट:</span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setLayoutMode("single")}
                className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                  layoutMode === "single" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"
                }`}
              >
                1 कार्ड (Standard)
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode("three")}
                className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                  layoutMode === "three" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"
                }`}
              >
                3 कार्ड्स (Cyber Cafe Sheet)
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={generatePrintableSheet}
          disabled={processing || !frontImg || !backImg}
          className="w-full mt-5 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {processing ? "शीट तैयार हो रही है..." : "🖨️ A4 PVC प्रिंट शीट तैयार करें"}
        </button>

        {downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">A4 प्रिंट शीट तैयार है!</p>
            <p className="text-xs text-green-700 mt-1">
              {layoutMode === "single" ? "1 कार्ड" : "3 कार्ड्स"} लेआउट — सीधे 100% स्केल पर प्रिंट करें।
            </p>
            <a
              href={downloadUrl}
              download="studysetu-pvc-id-sheet.jpg"
              className="inline-block mt-3 bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-green-700 transition"
            >
              📥 डाउनलोड A4 प्रिंट शीट
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
