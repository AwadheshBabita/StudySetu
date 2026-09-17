"use client";

import { useState, useRef, ChangeEvent } from "react";

export default function IdCardCropperPage() {
  const [frontImg, setFrontImg] = useState<string | null>(null);
  const [backImg, setBackImg] = useState<string | null>(null);
  const [cardBorder, setCardBorder] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFrontUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFrontImg(reader.result as string);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    };
    reader.readAsDataURL(file);
  };

  const handleBackUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBackImg(reader.result as string);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    };
    reader.readAsDataURL(file);
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

      // Pure White Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Standard CR80 PVC Card Dimensions at 300 DPI:
      // 85.6 mm x 53.98 mm ≈ 1011 x 638 pixels
      const cardWidth = 1011;
      const cardHeight = 638;

      const gap = 120; // gap between front and back
      const startX = (canvas.width - (cardWidth * 2 + gap)) / 2;
      const startY = 350; // top margin for easy printing & cutting

      // Helper to draw rounded card
      const drawCard = (img: HTMLImageElement, x: number, y: number) => {
        ctx.save();
        const radius = 35; // rounded card corner
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

      // Draw Front Card
      drawCard(imgFront, startX, startY);

      // Draw Back Card
      drawCard(imgBack, startX + cardWidth + gap, startY);

      // Add Print / Cutting guidelines text
      ctx.fillStyle = "#64748b";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        "StudySetu ID Card Print Sheet (300 DPI - Standard 85.6mm x 54mm PVC Size)",
        canvas.width / 2,
        startY - 80
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
          पहचान पत्र (आधार, पैन, वोटर ID) का फ्रंट और बैक जोड़कर A4 साइज़ में प्रिंटेबल शीट तैयार करें
        </p>

        {/* Upload Boxes Grid */}
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
        <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={cardBorder}
              onChange={(e) => setCardBorder(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 w-4 h-4"
            />
            <span className="text-xs sm:text-sm font-semibold text-slate-700">
              कटिंग बॉर्डर (Cutting Guide Border) जोड़ें
            </span>
          </label>
          <span className="text-xs font-bold text-slate-500">A4 @ 300 DPI</span>
        </div>

        {/* Action Button */}
        <button
          onClick={generatePrintableSheet}
          disabled={processing || !frontImg || !backImg}
          className="w-full mt-5 bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
        >
          {processing ? "शीट तैयार हो रही है..." : "🖨️ A4 PVC प्रिंट शीट तैयार करें"}
        </button>

        {/* Result & Download */}
        {downloadUrl && (
          <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-center">
            <p className="text-sm font-bold text-green-800">A4 प्रिंट शीट सफलतापूर्वक तैयार हो गई!</p>
            <p className="text-xs text-green-700 mt-1">
              मानक 85.6mm × 54mm साइज़ — फोटो पेपर पर 100% स्केल पर सीधे प्रिंट करें।
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
