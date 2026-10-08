with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# पुराना segs = 32 वाला डिफेक्टिव वार्प ढूंढें
start_fn = "  const applyWarp = () => {"
end_fn = "    const dataUrl = outCvs.toDataURL(\"image/jpeg\", 0.96);\n    onConfirm(dataUrl);\n  };"

p1 = code.find(start_fn)
p2 = code.find(end_fn)

if p1 != -1 and p2 != -1:
    clean_warp_fn = """  const applyWarp = () => {
    const cvs = canvasRef.current;
    const img = imgRef.current;
    if (!cvs || !img) return;

    const scaleX = img.naturalWidth / cvs.width;
    const scaleY = img.naturalHeight / cvs.height;

    const srcPts = cornersRef.current.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    const dstW = 1011;
    const dstH = 638;

    const outCvs = document.createElement("canvas");
    outCvs.width = dstW;
    outCvs.height = dstH;
    const ctx = outCvs.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // 120-सबडिवीजन विद 0.5px ओवरलैप - कोई जालीदार लाइन नहीं आएगी
    const [tl, tr, br, bl] = srcPts;
    const segs = 120;
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

        ctx.save();
        ctx.beginPath();
        // सीमलेस ओवरलैप
        ctx.rect((u0 * dstW) - 0.25, (v0 * dstH) - 0.25, (dstW / segs) + 0.5, (dstH / segs) + 0.5);
        ctx.clip();

        const dx = p10.x - p00.x;
        const dy = p10.y - p00.y;
        const sx = Math.hypot(dx, dy) / (dstW / segs);
        const ang = Math.atan2(dy, dx);

        ctx.translate(u0 * dstW, v0 * dstH);
        ctx.rotate(-ang);
        ctx.scale(1 / (sx || 1), 1 / (sx || 1));
        ctx.drawImage(img, -p00.x, -p00.y);
        ctx.restore();
      }
    }

    const dataUrl = outCvs.toDataURL("image/jpeg", 0.98);
    onConfirm(dataUrl);
  };"""
    code = code[:p1] + clean_warp_fn + code[p2 + len(end_fn):]
    with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("WARP_ENGINE_PERFECTED")
else:
    print("FN_NOT_FOUND")
