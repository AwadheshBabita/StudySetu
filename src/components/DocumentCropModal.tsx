"use client";

import React, { useRef, useState, useEffect } from "react";

interface Point {
  x: number;
  y: number;
}

interface DocumentCropModalProps {
  imageSrc: string;
  isOpen: boolean;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
}

export default function DocumentCropModal({
  imageSrc,
  isOpen,
  onCropComplete,
  onCancel,
}: DocumentCropModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [corners, setCorners] = useState<Point[]>([
    { x: 40, y: 40 },
    { x: 260, y: 40 },
    { x: 260, y: 360 },
    { x: 40, y: 360 },
  ]);

  const [activeHandleIndex, setActiveHandleIndex] = useState<number | null>(null);
  const [imgDimensions, setImgDimensions] = useState({ width: 300, height: 400 });
  const [scaleFactor, setScaleFactor] = useState(1);

  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      imgRef.current = img;
      const screenWidth = Math.min(window.innerWidth - 32, 500);
      const scale = screenWidth / img.width;
      const displayW = screenWidth;
      const displayH = img.height * scale;

      setImgDimensions({ width: displayW, height: displayH });
      setScaleFactor(scale);

      const padX = displayW * 0.08;
      const padY = displayH * 0.08;
      setCorners([
        { x: padX, y: padY },
        { x: displayW - padX, y: padY },
        { x: displayW - padX, y: displayH - padY },
        { x: padX, y: displayH - padY },
      ]);
    };
  }, [isOpen, imageSrc]);

  const getHandles = () => {
    const [tl, tr, br, bl] = corners;
    return [
      { ...tl, isCorner: true, id: 0 },
      { x: (tl.x + tr.x) / 2, y: (tl.y + tr.y) / 2, isCorner: false, id: 4 },
      { ...tr, isCorner: true, id: 1 },
      { x: (tr.x + br.x) / 2, y: (tr.y + br.y) / 2, isCorner: false, id: 5 },
      { ...br, isCorner: true, id: 2 },
      { x: (br.x + bl.x) / 2, y: (br.y + bl.y) / 2, isCorner: false, id: 6 },
      { ...bl, isCorner: true, id: 3 },
      { x: (bl.x + tl.x) / 2, y: (bl.y + tl.y) / 2, isCorner: false, id: 7 },
    ];
  };

  const handlePointerDown = (index: number) => {
    setActiveHandleIndex(index);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeHandleIndex === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, imgDimensions.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, imgDimensions.height));

    setCorners((prev) => {
      const next = [...prev];
      if (activeHandleIndex < 4) {
        next[activeHandleIndex] = { x, y };
      } else if (activeHandleIndex === 4) {
        next[0].y = y; next[1].y = y;
      } else if (activeHandleIndex === 5) {
        next[1].x = x; next[2].x = x;
      } else if (activeHandleIndex === 6) {
        next[2].y = y; next[3].y = y;
      } else if (activeHandleIndex === 7) {
        next[0].x = x; next[3].x = x;
      }
      return next;
    });
  };

  const handlePointerUp = () => {
    setActiveHandleIndex(null);
  };

  const applyPerspectiveCrop = () => {
    if (!imgRef.current) return;

    const img = imgRef.current;
    const origTL = { x: corners[0].x / scaleFactor, y: corners[0].y / scaleFactor };
    const origTR = { x: corners[1].x / scaleFactor, y: corners[1].y / scaleFactor };
    const origBR = { x: corners[2].x / scaleFactor, y: corners[2].y / scaleFactor };
    const origBL = { x: corners[3].x / scaleFactor, y: corners[3].y / scaleFactor };

    const widthTop = Math.hypot(origTR.x - origTL.x, origTR.y - origTL.y);
    const widthBottom = Math.hypot(origBR.x - origBL.x, origBR.y - origBL.y);
    const targetWidth = Math.round(Math.max(widthTop, widthBottom));

    const heightLeft = Math.hypot(origBL.x - origTL.x, origBL.y - origTL.y);
    const heightRight = Math.hypot(origBR.x - origTR.x, origBR.y - origTR.y);
    const targetHeight = Math.round(Math.max(heightLeft, heightRight));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const minX = Math.min(origTL.x, origBL.x);
    const minY = Math.min(origTL.y, origTR.y);
    const cropW = Math.max(origTR.x, origBR.x) - minX;
    const cropH = Math.max(origBL.y, origBR.y) - minY;

    ctx.drawImage(img, minX, minY, cropW, cropH, 0, 0, targetWidth, targetHeight);
    const croppedUrl = canvas.toDataURL("image/jpeg", 0.95);
    onCropComplete(croppedUrl);
  };

  if (!isOpen) return null;

  const pointsSvg = corners.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-between p-4 select-none touch-none">
      <div className="w-full max-w-md flex justify-between items-center text-white pb-2 border-b border-white/20">
        <span className="text-sm font-bold">डॉक्यूमेंट का दायरा चुनें (Crop)</span>
        <button
          onClick={onCancel}
          className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white"
        >
          रद्द करें
        </button>
      </div>

      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative my-auto flex items-center justify-center overflow-hidden rounded-lg shadow-2xl"
        style={{ width: imgDimensions.width, height: imgDimensions.height }}
      >
        {imageSrc && (
          <img
            src={imageSrc}
            alt="Source"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
        )}

        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          width={imgDimensions.width}
          height={imgDimensions.height}
        >
          <polygon
            points={pointsSvg}
            fill="rgba(16, 185, 129, 0.15)"
            stroke="#10B981"
            strokeWidth="2.5"
          />
        </svg>

        {getHandles().map((h) => (
          <div
            key={h.id}
            onPointerDown={() => handlePointerDown(h.id)}
            style={{
              transform: `translate(${h.x - 14}px, ${h.y - 14}px)`,
            }}
            className="absolute top-0 left-0 w-7 h-7 flex items-center justify-center cursor-pointer touch-none z-10"
          >
            <div
              className={`rounded-full border-2 border-white shadow-md transition-transform ${
                h.isCorner
                  ? "w-4 h-4 bg-emerald-500 scale-110"
                  : "w-3.5 h-3.5 bg-emerald-300"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="w-full max-w-md flex items-center justify-between gap-4 pt-3 border-t border-white/20">
        <button
          onClick={() => {
            const padX = imgDimensions.width * 0.05;
            const padY = imgDimensions.height * 0.05;
            setCorners([
              { x: padX, y: padY },
              { x: imgDimensions.width - padX, y: padY },
              { x: imgDimensions.width - padX, y: imgDimensions.height - padY },
              { x: padX, y: imgDimensions.height - padY },
            ]);
          }}
          className="text-xs font-bold text-white/80 bg-white/10 px-3 py-2 rounded-xl"
        >
          फुल रीसेट
        </button>

        <button
          onClick={applyPerspectiveCrop}
          className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white font-black text-sm rounded-xl shadow-lg transition-all"
        >
          आगे बढ़ें (Continue) ➔
        </button>
      </div>
    </div>
  );
}
