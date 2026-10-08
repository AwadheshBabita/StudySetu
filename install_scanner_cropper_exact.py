with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    text = f.read()

# 1. State Replacement (Only Cropper State)
old_state = """  // क्रॉपर स्टेट
  const [cropTarget, setCropTarget] = useState<ActiveTarget>(null);
  const [cropImgSrc, setCropImgSrc] = useState<string | null>(null);
  const [corners, setCorners] = useState<Point[]>([
    { x: 30, y: 30 },
    { x: 250, y: 30 },
    { x: 250, y: 170 },
    { x: 30, y: 170 },
  ]);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [cropImgDims, setCropImgDims] = useState<{ width: number; height: number }>({ width: 300, height: 200 });

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);
  const cropContainerRef = useRef<HTMLDivElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);"""

new_state = """  // क्रॉपर स्टेट (स्मार्ट डॉक्यूमेंट स्कैनर का कैनवास सिस्टम)
  const [cropTarget, setCropTarget] = useState<ActiveTarget>(null);
  const [cropImgSrc, setCropImgSrc] = useState<string | null>(null);
  const cropCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cropImgRef = useRef<HTMLImageElement | null>(null);
  const cropCornersRef = useRef<Point[]>([]);
  const cropActivePointIdxRef = useRef<number | null>(null);

  const fileInputFrontRef = useRef<HTMLInputElement>(null);
  const fileInputBackRef = useRef<HTMLInputElement>(null);"""

if old_state in text:
    text = text.replace(old_state, new_state)

# 2. Logic Replacement (Only Cropper functions up to Canvas Sheet Generator)
start_marker = "  const handleFileChange = (file: File | undefined, target: 'front' | 'back') => {"
end_marker = "  // --- कैनवास शीट जनरेटर"

p_start = text.find(start_marker)
p_end = text.find(end_marker)

if p_start != -1 and p_end != -1:
    exact_scanner_logic = """  const handleFileChange = (file: File | undefined, target: 'front' | 'back') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setCropImgSrc(src);
      setCropTarget(target);

      const img = new Image();
      img.onload = () => {
        cropImgRef.current = img;
        setTimeout(() => {
          const cvs = cropCanvasRef.current;
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

          const padX = w * 0.08;
          const padY = h * 0.08;
          cropCornersRef.current = [
            { x: padX, y: padY },
            { x: w - padX, y: padY },
            { x: w - padX, y: h - padY },
            { x: padX, y: h - padY },
          ];
          drawCropCanvas(null);
        }, 100);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // 🎯 स्मार्ट डॉक्यूमेंट स्कैनर का ओरिजिनल drawCropCanvas (2.2x लेंस + ग्रिड)
  const drawCropCanvas = (activeIdx: number | null = cropActivePointIdxRef.current) => {
    const cvs = cropCanvasRef.current;
    const img = cropImgRef.current;
    if (!cvs || !img) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

    const pts = cropCornersRef.current;
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

    // 2.2x मैग्नीफ़ायर लेंस
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
    const cvs = cropCanvasRef.current;
    if (!cvs) return { x: 0, y: 0 };
    const rect = cvs.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (cvs.width / rect.width),
      y: (clientY - rect.top) * (cvs.height / rect.height)
    };
  };

  const handlePointerDown = (clientX: number, clientY: number) => {
    const { x, y } = getCanvasCoords(clientX, clientY);
    const cvs = cropCanvasRef.current;
    if (!cvs) return;

    let foundIdx: number | null = null;
    let minDist = Math.max(65, cvs.width / 12);

    cropCornersRef.current.forEach((pt, idx) => {
      const dist = Math.hypot(pt.x - x, pt.y - y);
      if (dist < minDist) {
        minDist = dist;
        foundIdx = idx;
      }
    });

    if (foundIdx !== null) {
      cropActivePointIdxRef.current = foundIdx;
      drawCropCanvas(foundIdx);
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (cropActivePointIdxRef.current === null) return;
    const cvs = cropCanvasRef.current;
    if (!cvs) return;

    const { x, y } = getCanvasCoords(clientX, clientY);
    const boundedX = Math.max(0, Math.min(cvs.width, x));
    const boundedY = Math.max(0, Math.min(cvs.height, y));

    cropCornersRef.current[cropActivePointIdxRef.current] = { x: boundedX, y: boundedY };
    requestAnimationFrame(() => drawCropCanvas(cropActivePointIdxRef.current));
  };

  const handlePointerUp = () => {
    if (cropActivePointIdxRef.current !== null) {
      cropActivePointIdxRef.current = null;
      drawCropCanvas(null);
    }
  };

  const applyPerspectiveWarp = (
    image: HTMLImageElement,
    srcPts: Point[],
    dstW: number,
    dstH: number
  ): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = dstW;
    canvas.height = dstH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const [tl, tr, br, bl] = srcPts;
    const segs = 32;
    for (let y = 0; y < segs; y++) {
      const v0 = y / segs;
      const v1 = (y + 1) / segs;
      for (let x = 0; x < segs; x++) {
        const u0 = x / segs;
        const u1 = (x + 1) / segs;

        const p00 = {
          x: (1 - u0) * ((1 - v0) * tl.x + v0 * bl.x) + u0 * ((1 - v0) * tr.x + v0 * br.x),
          y: (1 - u0) * ((1 - v0) * tl.y + v0 * bl.y) + u0 * ((1 - v0) * tr.y + v0 * br.y),
        };
        const p10 = {
          x: (1 - u1) * ((1 - v0) * tl.x + v0 * bl.x) + u1 * ((1 - v0) * tr.x + v0 * br.x),
          y: (1 - u1) * ((1 - v0) * tl.y + v0 * bl.y) + u1 * ((1 - v0) * tr.y + v0 * br.y),
        };
        const p01 = {
          x: (1 - u0) * ((1 - v1) * tl.x + v1 * bl.x) + u0 * ((1 - v1) * tr.x + v1 * br.x),
          y: (1 - u0) * ((1 - v1) * tl.y + v1 * bl.y) + u0 * ((1 - v1) * tr.y + v1 * br.y),
        };

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(u0 * dstW, v0 * dstH);
        ctx.lineTo(u1 * dstW, v0 * dstH);
        ctx.lineTo(u1 * dstW, v1 * dstH);
        ctx.lineTo(u0 * dstW, v1 * dstH);
        ctx.closePath();
        ctx.clip();

        const dx = p10.x - p00.x;
        const dy = p10.y - p00.y;
        const sx = Math.hypot(dx, dy) / (dstW / segs);
        const ang = Math.atan2(dy, dx);

        ctx.translate(u0 * dstW, v0 * dstH);
        ctx.rotate(-ang);
        ctx.scale(1 / (sx || 1), 1 / (sx || 1));
        ctx.drawImage(image, -p00.x, -p00.y);
        ctx.restore();
      }
    }
    return canvas;
  };

  const handleApplyCrop = () => {
    const cvs = cropCanvasRef.current;
    const img = cropImgRef.current;
    if (!cvs || !img || !cropTarget) return;

    const scaleX = img.width / cvs.width;
    const scaleY = img.height / cvs.height;

    const srcPoints: Point[] = cropCornersRef.current.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    const cardW = 1011;
    const cardH = 638;
    const warpedCanvas = applyPerspectiveWarp(img, srcPoints, cardW, cardH);
    const dataUrl = warpedCanvas.toDataURL("image/jpeg", 0.96);

    if (cropTarget === "front") {
      setFrontCropped(dataUrl);
    } else {
      setBackCropped(dataUrl);
    }

    setCropTarget(null);
    setCropImgSrc(null);
  };
\n"""
    text = text[:p_start] + exact_scanner_logic + text[p_end:]

# 3. Modal JSX Replacement (Line 932 to end of Modal)
modal_start_marker = "{cropTarget && cropImgSrc && ("
p_modal = text.find(modal_start_marker)

if p_modal != -1:
    exact_scanner_modal = """{cropTarget && cropImgSrc && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xs flex flex-col items-center justify-between p-3 select-none">
          <div className="w-full max-w-xl flex items-center justify-between text-white py-1">
            <span className="text-sm font-black flex items-center gap-1.5">
              <span>👉</span> चारों कोनों को कार्ड पर सेट करें ({cropTarget === 'front' ? 'Front Side' : 'Back Side'})
            </span>
            <button
              onClick={() => { setCropTarget(null); setCropImgSrc(null); }}
              className="text-xs bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer"
            >
              रद्द करें
            </button>
          </div>

          <div className="flex-1 w-full max-w-xl flex items-center justify-center overflow-hidden my-auto p-1">
            <div className="border-2 border-slate-900 rounded-2xl p-1 bg-slate-950 shadow-md overflow-hidden select-none touch-none">
              <canvas
                ref={cropCanvasRef}
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
                  if (cropActivePointIdxRef.current !== null && e.touches.length > 0) {
                    if (e.cancelable) e.preventDefault();
                    const t = e.touches[0];
                    handlePointerMove(t.clientX, t.clientY);
                  }
                }}
                onTouchEnd={handlePointerUp}
                className="max-h-[60vh] sm:max-h-[520px] w-auto max-w-full mx-auto cursor-crosshair block select-none shadow-lg rounded-xl"
              />
            </div>
          </div>

          <div className="w-full max-w-xl flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                if (cropTarget === 'front' && fileInputFrontRef.current) fileInputFrontRef.current.click();
                if (cropTarget === 'back' && fileInputBackRef.current) fileInputBackRef.current.click();
              }}
              className="w-1/3 py-2.5 px-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition active:scale-95 text-center cursor-pointer"
            >
              🔄 नई तस्वीर
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              className="w-2/3 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-black transition shadow-md active:scale-95 text-center cursor-pointer"
            >
              📐 कार्ड क्रॉप करें (Crop)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
"""
    text = text[:p_modal] + exact_scanner_modal

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(text)

print("EXACT_SCANNER_CROPPER_INSTALLED")
