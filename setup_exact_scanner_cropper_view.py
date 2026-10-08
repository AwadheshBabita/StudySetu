with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# कॉर्नर ड्रा फ़ंक्शन को ओरिजिनल डबल-रिंग (ब्लू + व्हाइट सेंटर) लुक देना
new_draw_func = """  // 6. क्रॉपर रेंडरर (स्मार्ट स्कैनर का ओरिजिनल: 4 कोने + डार्क ओवरले + 2.2x मैग्नीफ़ायर)
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

    // 4 कॉर्नर डॉट्स (ओरिजिनल डबल-सर्कल रिंग)
    const outerRadius = Math.max(16, Math.round(cvs.width * 0.026));
    const innerRadius = Math.max(6, Math.round(cvs.width * 0.01));
    pts.forEach((p, idx) => {
      // बाहरी ब्लू रिंग
      ctx.beginPath();
      ctx.arc(p.x, p.y, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = activeIdx === idx ? "#2563eb" : "#1d4ed8";
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // आंतरिक व्हाइट डॉट
      ctx.beginPath();
      ctx.arc(p.x, p.y, innerRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    });

    // 2.2x मैग्नीफ़ायर ग्लास
    if (activeIdx !== null && pts[activeIdx]) {
      const activePt = pts[activeIdx];
      const magRadius = Math.max(55, Math.round(cvs.width * 0.12));
      const zoom = 2.2;

      let magX = activePt.x;
      let magY = activePt.y - magRadius - 35;
      if (magY - magRadius < 0) magY = activePt.y + magRadius + 35;
      if (magX - magRadius < 0) magX = magRadius + 10;
      if (magX + magRadius > cvs.width) magX = cvs.width - magRadius - 10;

      ctx.save();
      ctx.beginPath();
      ctx.arc(magX, magY, magRadius, 0, Math.PI * 2);
      ctx.clip();

      ctx.fillStyle = "#000";
      ctx.fillRect(magX - magRadius, magY - magRadius, magRadius * 2, magRadius * 2);

      ctx.drawImage(
        img,
        activePt.x - magRadius / zoom,
        activePt.y - magRadius / zoom,
        (magRadius * 2) / zoom,
        (magRadius * 2) / zoom,
        magX - magRadius,
        magY - magRadius,
        magRadius * 2,
        magRadius * 2
      );

      ctx.restore();
      ctx.beginPath();
      ctx.arc(magX, magY, magRadius, 0, Math.PI * 2);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(magX, magY, magRadius, 0, Math.PI * 2);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#2563eb";
      ctx.stroke();

      // क्रॉसहेयर
      ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(magX - 12, magY);
      ctx.lineTo(magX + 12, magY);
      ctx.moveTo(magX, magY - 12);
      ctx.lineTo(magX + 12, magY);
      ctx.stroke();
    }
  };"""

code = re.sub(r'  \/\/ 6\. क्रॉपर रेंडरर[\s\S]*?const getCanvasCoords', new_draw_func + "\n\n  const getCanvasCoords", code)

# क्रॉपर JSX को हूबहू ओरिजिनल स्कैनर लुक में बदलना
exact_cropper_jsx = """      {/* ===================== दृश्य 3: स्मार्ट डॉक्यूमेंट स्कैनर का हूबहू असली क्रॉपर ===================== */}
      {screen === "scanner_crop" && rawImageSrc && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-3 select-none overflow-y-auto">
          <div className="max-w-xl mx-auto w-full space-y-2">
            
            {/* शीर्ष सूचना व बटन बार (ऑटो-डिटेक्ट + 90°) */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium text-[11px] flex items-center gap-1 truncate">
                <span>👉</span> चारों कोनों को अलग-अलग खींचकर कागज़ पर सेट करें
              </span>
              <div className="flex items-center space-x-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (imgRef.current) {
                      cornersRef.current = detectDocumentCorners(imgRef.current);
                      drawCropCanvas(null);
                    }
                  }}
                  className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-lg border border-emerald-700 font-bold hover:bg-emerald-700 flex items-center space-x-1 shrink-0 text-xs shadow-xs transition active:scale-95"
                >
                  <span>⚡</span>
                  <span>ऑटो-डिटेक्ट</span>
                </button>
                <button
                  type="button"
                  onClick={rotateSourceImage}
                  className="bg-white px-2 py-0.5 rounded-lg border border-blue-300 font-bold hover:bg-blue-100 flex items-center space-x-1 shrink-0 text-xs shadow-xs transition active:scale-95 text-slate-800"
                >
                  <span>🔄</span>
                  <span>90°</span>
                </button>
              </div>
            </div>

            {/* मुख्य कैनवास बॉक्स */}
            <div className="border-2 border-slate-900 rounded-2xl p-1 bg-slate-950 shadow-md overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                onMouseUp={handlePointerUp}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  if (t) handlePointerDown(t.clientX, t.clientY);
                }}
                onTouchMove={(e) => {
                  const t = e.touches[0];
                  if (t) handlePointerMove(t.clientX, t.clientY);
                }}
                onTouchEnd={handlePointerUp}
                className="max-h-[60vh] sm:max-h-[520px] w-auto max-w-full mx-auto cursor-crosshair block select-none shadow-lg"
              />
            </div>

            {/* निचली बटन पट्टी: नई तस्वीर + काग़ज़ क्रॉप करें */}
            <div className="flex items-center space-x-2.5 pt-1 pb-4">
              <button
                type="button"
                onClick={() => {
                  setScreen("scanner_picker");
                  setRawImageSrc(null);
                }}
                className="w-1/3 py-3 px-2 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 transition active:scale-95 text-center"
              >
                🔄 नई तस्वीर
              </button>
              <button
                type="button"
                onClick={runCropToSlot}
                disabled={processing}
                className="w-2/3 bg-blue-600 text-white font-bold py-3 px-3 rounded-xl hover:bg-blue-700 transition shadow-md disabled:opacity-50 text-xs sm:text-sm active:scale-95 text-center"
              >
                {processing ? "सीधा हो रहा है..." : "📐 काग़ज़ क्रॉप करें (Crop)"}
              </button>
            </div>

          </div>
        </div>
      )}"""

code = re.sub(r'\{\/\* ===================== दृश्य 3:[\s\S]*?<\/div>\s*\}\)\s*\}', exact_cropper_jsx + "\n    </div>\n  );\n}", code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("EXACT_CROPPER_VIEW_APPLIED")
