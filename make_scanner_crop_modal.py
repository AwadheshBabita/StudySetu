with open("src/app/tools/document-scanner/page.tsx", "r", encoding="utf-8") as f:
    scanner_code = f.read()

import re

# 1. detectDocumentCorners फ़ंक्शन निकालना
detect_fn = re.search(r'(const detectDocumentCorners = [\s\S]*?return corners;\s*\};)', scanner_code)
detect_code = detect_fn.group(1) if detect_fn else ""

# 2. drawCropCanvas फ़ंक्शन निकालना
draw_fn = re.search(r'(const drawCropCanvas = [\s\S]*?\n  \};\n\n  \/\/ 3\.)', scanner_code)
if not draw_fn:
    draw_fn = re.search(r'(const drawCropCanvas = [\s\S]*?\n  \};)', scanner_code)
draw_code = draw_fn.group(1) if draw_fn else ""

# 3. handleCropApply या perspective warp निकालना
apply_fn = re.search(r'(const handleCropApply = async \(\) => [\s\S]*?\n  \};)', scanner_code)
apply_code = apply_fn.group(1) if apply_fn else ""

# पूरा स्टैंडअलोन ScannerCropModal कंपोनेंट तैयार करना
modal_ts = f'''"use client";

import React, { useRef, useEffect } from "react";

interface Point {{
  x: number;
  y: number;
}}

interface ScannerCropModalProps {{
  imageSrc: string;
  title: string;
  onApplyCrop: (croppedDataUrl: string) => void;
  onCancel: () => void;
}}

export default function ScannerCropModal({{
  imageSrc,
  title,
  onApplyCrop,
  onCancel,
}}: ScannerCropModalProps) {{
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const cornersRef = useRef<Point[]>([]);
  const activePointIdxRef = useRef<number | null>(null);
  const currentSrcRef = useRef<string>(imageSrc);

  {detect_code}

  // 90° रोटेशन इंजन
  const rotateSourceImage = () => {{
    const img = imgRef.current;
    if (!img) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = img.height;
    tempCanvas.height = img.width;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    const rotatedData = tempCanvas.toDataURL("image/jpeg", 0.95);
    currentSrcRef.current = rotatedData;

    const newImg = new Image();
    newImg.onload = () => {{
      imgRef.current = newImg;
      const cvs = canvasRef.current;
      if (cvs) {{
        cvs.width = newImg.width;
        cvs.height = newImg.height;
        cornersRef.current = detectDocumentCorners(newImg);
        drawCropCanvas(null);
      }}
    }};
    newImg.src = rotatedData;
  }};

  {draw_code}

  const getCanvasCoords = (clientX: number, clientY: number) => {{
    const cvs = canvasRef.current;
    if (!cvs) return {{ x: 0, y: 0 }};
    const rect = cvs.getBoundingClientRect();
    const scaleX = cvs.width / rect.width;
    const scaleY = cvs.height / rect.height;
    return {{
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }};
  }};

  const handlePointerDown = (clientX: number, clientY: number) => {{
    const {{ x, y }} = getCanvasCoords(clientX, clientY);
    const cvs = canvasRef.current;
    if (!cvs) return;

    const hitRadius = Math.max(35, cvs.width * 0.075);
    const pts = cornersRef.current;
    let closestIdx = -1;
    let minDist = hitRadius;

    pts.forEach((p, idx) => {{
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < minDist) {{
        minDist = d;
        closestIdx = idx;
      }}
    }});

    if (closestIdx !== -1) {{
      activePointIdxRef.current = closestIdx;
      drawCropCanvas(closestIdx);
    }}
  }};

  const handlePointerMove = (clientX: number, clientY: number) => {{
    if (activePointIdxRef.current === null) return;
    const {{ x, y }} = getCanvasCoords(clientX, clientY);
    const cvs = canvasRef.current;
    if (!cvs) return;

    const clampedX = Math.max(0, Math.min(cvs.width, x));
    const clampedY = Math.max(0, Math.min(cvs.height, y));

    cornersRef.current[activePointIdxRef.current] = {{ x: clampedX, y: clampedY }};
    drawCropCanvas(activePointIdxRef.current);
  }};

  const handlePointerUp = () => {{
    if (activePointIdxRef.current !== null) {{
      activePointIdxRef.current = null;
      drawCropCanvas(null);
    }}
  }};

  // सीधा आईडी कार्ड अनुपात (85.6mm x 54mm = 1012x638) में सीधा करना
  const handleWarpCrop = () => {{
    const img = imgRef.current;
    const pts = cornersRef.current;
    if (!img || pts.length !== 4) return;

    const outW = 1012;
    const outH = 638;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const slices = 320;
    for (let i = 0; i < slices; i++) {{
      const t1 = i / slices;
      const t2 = (i + 1) / slices;

      const lx1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
      const ly1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
      const rx1 = pts[1].x + (pts[2].x - pts[1].x) * t1;
      const ry1 = pts[1].y + (pts[2].y - pts[1].y) * t1;

      const dy1 = t1 * outH;
      const dy2 = t2 * outH;
      const dh = dy2 - dy1;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, dy1, outW, dh + 0.8);
      ctx.clip();

      const angle = Math.atan2(ry1 - ly1, rx1 - lx1);
      const spanW = Math.hypot(rx1 - lx1, ry1 - ly1);

      ctx.translate(0, dy1);
      ctx.scale(outW / spanW, 1);
      ctx.rotate(-angle);
      ctx.drawImage(img, -lx1, -ly1);
      ctx.restore();
    }}

    const croppedData = canvas.toDataURL("image/jpeg", 0.95);
    onApplyCrop(croppedData);
  }};

  useEffect(() => {{
    const img = new Image();
    img.onload = () => {{
      imgRef.current = img;
      const cvs = canvasRef.current;
      if (cvs) {{
        cvs.width = img.width;
        cvs.height = img.height;
        cornersRef.current = detectDocumentCorners(img);
        drawCropCanvas(null);
      }}
    }};
    img.src = imageSrc;
  }}, [imageSrc]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 select-none">
      <div className="w-full max-w-xl mx-auto flex items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <span className="text-white text-xs font-bold">{title}</span>
          <button
            type="button"
            onClick={rotateSourceImage}
            className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded-lg border border-white/20 flex items-center space-x-1"
          >
            <span>🔄</span>
            <span>90° घुमाएँ</span>
          </button>
        </div>
        <button
          onClick={onCancel}
          className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-lg border border-slate-700"
        >
          ✕ रद्द करें
        </button>
      </div>

      <div className="flex-1 w-full max-w-xl mx-auto flex items-center justify-center p-1 overflow-hidden">
        <div className="border-2 border-slate-900 rounded-2xl p-1 bg-slate-950 shadow-2xl overflow-hidden select-none max-h-full">
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
            onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onTouchStart={(e) => {{
              const t = e.touches[0];
              if (t) handlePointerDown(t.clientX, t.clientY);
            }}}
            onTouchMove={(e) => {{
              const t = e.touches[0];
              if (t) handlePointerMove(t.clientX, t.clientY);
            }}}
            onTouchEnd={handlePointerUp}
            className="max-h-[65vh] w-auto max-w-full mx-auto cursor-crosshair block select-none shadow-lg"
          />
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto pt-2 pb-1">
        <button
          type="button"
          onClick={handleWarpCrop}
          className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-lg transition active:scale-98"
        >
          ✓ सीधा क्रॉप करें व शीट पर सेट करें
        </button>
      </div>
    </div>
  );
}}
'''

with open("src/app/tools/id-card-joiner-demo/ScannerCropModal.tsx", "w", encoding="utf-8") as f:
    f.write(modal_ts)

print("SCANNER_CROP_MODAL_CREATED_SUCCESSFULLY")
