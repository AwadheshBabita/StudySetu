"use client";

import React, { useRef, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

interface ScannerCropModalProps {
  imgSrc: string;
  title: string;
  onConfirm: (dataUrl: string) => void;
  onCancel: () => void;
}

export default function ScannerCropModal({
  imgSrc,
  title,
  onConfirm,
  onCancel,
}: ScannerCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cornersRef = useRef<Point[]>([]);
  const activePointIdxRef = useRef<number | null>(null);

  // ऑटो डॉक्यूमेंट/आईडी कार्ड एज डिटेक्शन इंजन (Edge Contrast & Brightness Gradient)
  const detectDocumentCorners = (img: HTMLImageElement): Point[] => {
    const nw = img.naturalWidth || img.width;
    const nh = img.naturalHeight || img.height;
    const sw = 320;
    const sh = Math.max(10, Math.round((nh / nw) * sw));
    const cvs = document.createElement("canvas");
    cvs.width = sw;
    cvs.height = sh;

    const ctx = cvs.getContext("2d");
    if (!ctx) {
      const px = nw * 0.08, py = nh * 0.08;
      return [
        { x: px, y: py },
        { x: nw - px, y: py },
        { x: nw - px, y: nh - py },
        { x: px, y: nh - py }
      ];
    }

    ctx.drawImage(img, 0, 0, sw, sh);
    const imgData = ctx.getImageData(0, 0, sw, sh);
    const data = imgData.data;

    const getLum = (x: number, y: number) => {
      const idx = (y * sw + x) * 4;
      return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    };

    let topY = Math.round(sh * 0.08);
    let bottomY = Math.round(sh * 0.92);
    let leftX = Math.round(sw * 0.08);
    let rightX = Math.round(sw * 0.92);

    // ऊपर से स्कैन
    for (let y = 10; y < sh * 0.4; y += 4) {
      let diffSum = 0;
      for (let x = sw * 0.2; x < sw * 0.8; x += 10) {
        diffSum += Math.abs(getLum(Math.round(x), y + 4) - getLum(Math.round(x), y));
      }
      if (diffSum / ((sw * 0.6) / 10) > 22) {
        topY = y;
        break;
      }
    }

    // नीचे से स्कैन
    for (let y = sh - 10; y > sh * 0.6; y -= 4) {
      let diffSum = 0;
      for (let x = sw * 0.2; x < sw * 0.8; x += 10) {
        diffSum += Math.abs(getLum(Math.round(x), y - 4) - getLum(Math.round(x), y));
      }
      if (diffSum / ((sw * 0.6) / 10) > 22) {
        bottomY = y;
        break;
      }
    }

    // बाएँ से स्कैन
    for (let x = 10; x < sw * 0.4; x += 4) {
      let diffSum = 0;
      for (let y = sh * 0.2; y < sh * 0.8; y += 10) {
        diffSum += Math.abs(getLum(x + 4, Math.round(y)) - getLum(x, Math.round(y)));
      }
      if (diffSum / ((sh * 0.6) / 10) > 22) {
        leftX = x;
        break;
      }
    }

    // दाएँ से स्कैन
    for (let x = sw - 10; x > sw * 0.6; x -= 4) {
      let diffSum = 0;
      for (let y = sh * 0.2; y < sh * 0.8; y += 10) {
        diffSum += Math.abs(getLum(x - 4, Math.round(y)) - getLum(x, Math.round(y)));
      }
      if (diffSum / ((sw * 0.6) / 10) > 22) {
        rightX = x;
        break;
      }
    }

    const scaleX = nw / sw;
    const scaleY = nh / sh;

    return [
      { x: Math.round(leftX * scaleX), y: Math.round(topY * scaleY) },
      { x: Math.round(rightX * scaleX), y: Math.round(topY * scaleY) },
      { x: Math.round(rightX * scaleX), y: Math.round(bottomY * scaleY) },
      { x: Math.round(leftX * scaleX), y: Math.round(bottomY * scaleY) }
    ];
  };


  const drawCropCanvas = (activeIdx: number | null = activePointIdxRef.current) => {
    const cvs = canvasRef.current;
    const img = imgRef.current;
    if (!cvs || !img) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

    const pts = cornersRef.current;
    if (!pts || pts.length !== 4) return;

    // डार्क ओवरले
    ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
    ctx.beginPath();
    ctx.rect(0, 0, cvs.width, cvs.height);
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.closePath();
    ctx.fill("evenodd");

    // बाउंड्री लाइन
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = Math.max(3, Math.round(cvs.width / 320));
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    ctx.lineTo(pts[1].x, pts[1].y);
    ctx.lineTo(pts[2].x, pts[2].y);
    ctx.lineTo(pts[3].x, pts[3].y);
    ctx.closePath();
    ctx.stroke();

    // 4 गोल हैंडल
    const baseRadius = Math.max(18, Math.round(cvs.width / 42));
    pts.forEach((p, i) => {
      const isDragging = activeIdx === i;
      const r = isDragging ? baseRadius * 1.3 : baseRadius;

      ctx.beginPath();
      ctx.arc(p.x, p.y, r + 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = isDragging ? "#16a34a" : "#2563eb";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 0.35, 0, 2 * Math.PI);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    // 2.2x मैग्नीफ़ायर लेंस (डॉक्यूमेंट स्कैनर का ओरिजिनल लेंस)
    if (activeIdx !== null && pts[activeIdx]) {
      const cur = pts[activeIdx];
      const lensRadius = Math.max(70, Math.round(cvs.width / 11));
      const zoom = 2.2;

      let lensX = cur.x;
      let lensY = cur.y - lensRadius - 60;
      if (lensY - lensRadius < 20) lensY = cur.y + lensRadius + 60;
      if (lensX - lensRadius < 20) lensX = lensRadius + 20;
      if (lensX + lensRadius > cvs.width - 20) lensX = cvs.width - lensRadius - 20;

      ctx.save();
      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        img,
        (cur.x / cvs.width) * img.width - (lensRadius / zoom) * (img.width / cvs.width),
        (cur.y / cvs.height) * img.height - (lensRadius / zoom) * (img.height / cvs.height),
        ((lensRadius * 2) / zoom) * (img.width / cvs.width),
        ((lensRadius * 2) / zoom) * (img.height / cvs.height),
        lensX - lensRadius,
        lensY - lensRadius,
        lensRadius * 2,
        lensRadius * 2
      );

      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lensX - 22, lensY);
      ctx.lineTo(lensX + 22, lensY);
      ctx.moveTo(lensX, lensY - 22);
      ctx.lineTo(lensX + 22, lensY);
      ctx.stroke();

      ctx.restore();

      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius, 0, 2 * Math.PI);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2563eb";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lensX, lensY, lensRadius + 2, 0, 2 * Math.PI);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();
    }
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    const cvs = canvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (cvs.width / rect.width),
      y: (clientY - rect.top) * (cvs.height / rect.height),
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    const cvs = canvasRef.current;
    if (!cvs) return;

    let foundIdx: number | null = null;
    let minDist = Math.max(65, cvs.width / 12);

    cornersRef.current.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < minDist) {
        minDist = dist;
        foundIdx = idx;
      }
    });

    if (foundIdx !== null) {
      activePointIdxRef.current = foundIdx;
      drawCropCanvas(foundIdx);
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (activePointIdxRef.current === null) return;
    const cvs = canvasRef.current;
    if (!cvs) return;

    const { x, y } = getCanvasCoords(clientX, clientY);
    const boundedX = Math.max(0, Math.min(cvs.width, x));
    const boundedY = Math.max(0, Math.min(cvs.height, y));

    cornersRef.current[activePointIdxRef.current] = { x: boundedX, y: boundedY };
    requestAnimationFrame(() => drawCropCanvas(activePointIdxRef.current));
  };

  const handlePointerUp = () => {
    if (activePointIdxRef.current !== null) {
      activePointIdxRef.current = null;
      drawCropCanvas(null);
    }
  };

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const cvs = canvasRef.current;
      if (!cvs) return;

      const maxDim = 1200;
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      cvs.width = w;
      cvs.height = h;

      // ऑटो एज डिटेक्शन चलाकर कैनवास स्केल में मैप करना
      const detected = detectDocumentCorners(img);
      const nw = img.naturalWidth || img.width;
      const nh = img.naturalHeight || img.height;
      const toCvsX = w / nw;
      const toCvsY = h / nh;
      cornersRef.current = detected.map((p) => ({
        x: Math.round(p.x * toCvsX),
        y: Math.round(p.y * toCvsY),
      }));
      drawCropCanvas(null);
    };
    img.src = imgSrc;
  }, [imgSrc]);

  const applyWarp = () => {
    const cvs = canvasRef.current;
    const img = imgRef.current;
    if (!cvs || !img) return;

    const scaleX = img.naturalWidth / cvs.width;
    const scaleY = img.naturalHeight / cvs.height;

    // डॉक्यूमेंट स्कैनर की तरह वास्तविक इमेज पिक्सल कोऑर्डिनेट्स
    const pts = cornersRef.current.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    const targetW = 1011;
    const targetH = 638;

    const straightCanvas = document.createElement("canvas");
    straightCanvas.width = targetW;
    straightCanvas.height = targetH;
    const sCtx = straightCanvas.getContext("2d");
    if (!sCtx) return;

    sCtx.imageSmoothingEnabled = true;
    sCtx.imageSmoothingQuality = "high";
    sCtx.fillStyle = "#ffffff";
    sCtx.fillRect(0, 0, targetW, targetH);

    // स्मार्ट स्कैनर (DocumentCropModal) की तरह डायरेक्ट 1:1 क्लीन HD क्रॉप
    const minX = Math.max(0, Math.min(pts[0].x, pts[1].x, pts[2].x, pts[3].x));
    const minY = Math.max(0, Math.min(pts[0].y, pts[1].y, pts[2].y, pts[3].y));
    const maxX = Math.min(img.naturalWidth, Math.max(pts[0].x, pts[1].x, pts[2].x, pts[3].x));
    const maxY = Math.min(img.naturalHeight, Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y));

    const cropW = Math.max(1, maxX - minX);
    const cropH = Math.max(1, maxY - minY);

    // ओरिजिनल हाई-रेज़ोल्यूशन पिक्सल से सीधे 1011x638 कैनवास पर रेंडर (शून्य ब्लर)
    sCtx.drawImage(img, minX, minY, cropW, cropH, 0, 0, targetW, targetH);

    const dataUrl = straightCanvas.toDataURL("image/jpeg", 0.98);
    onConfirm(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-between p-3 select-none">
      <div className="w-full max-w-xl flex items-center justify-between text-white py-1">
        <span className="text-sm font-black flex items-center gap-1.5">
          <span>📐</span> चारों कोनों को कार्ड पर बैठाएँ ({title})
        </span>
        <button
          onClick={onCancel}
          className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer"
        >
          रद्द करें
        </button>
      </div>

      <div className="flex-1 w-full max-w-xl flex items-center justify-center overflow-hidden my-auto p-1">
        <div className="border-2 border-slate-800 rounded-2xl p-1 bg-slate-900 shadow-2xl overflow-hidden select-none touch-none">
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onTouchStart={(e) => {
              if (e.touches.length > 0) {
                const t = e.touches[0];
                handlePointerDown(t.clientX, t.clientY);
              }
            }}
            onTouchMove={(e) => {
              if (activePointIdxRef.current !== null && e.touches.length > 0) {
                if (e.cancelable) e.preventDefault();
                const t = e.touches[0];
                handlePointerMove(t.clientX, t.clientY);
              }
            }}
            onTouchEnd={handlePointerUp}
            className="max-h-[62vh] sm:max-h-[520px] w-auto max-w-full mx-auto cursor-crosshair block select-none rounded-xl"
          />
        </div>
      </div>

      <div className="w-full max-w-xl flex items-center gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="w-1/3 py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95 text-center cursor-pointer"
        >
          रद्द करें
        </button>
        <button
          type="button"
          onClick={applyWarp}
          className="w-2/3 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-md active:scale-95 text-center cursor-pointer"
        >
          📐 कार्ड क्रॉप करें (Crop)
        </button>
      </div>
    </div>
  );
}
