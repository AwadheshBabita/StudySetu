with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "r", encoding="utf-8") as f:
    code = f.read()

start_fn = "  const applyWarp = () => {"
end_fn = "  return ("

p1 = code.find(start_fn)
p2 = code.find(end_fn)

if p1 != -1 and p2 != -1:
    clean_crop_fn = """  const applyWarp = () => {
    const cvs = canvasRef.current;
    const img = imgRef.current;
    if (!cvs || !img) return;

    const scaleX = img.naturalWidth / cvs.width;
    const scaleY = img.naturalHeight / cvs.height;

    // 4 कोनों का वास्तविक बाउंडिंग बॉक्स
    const xs = cornersRef.current.map((p) => p.x * scaleX);
    const ys = cornersRef.current.map((p) => p.y * scaleY);

    const minX = Math.max(0, Math.min(...xs));
    const maxX = Math.min(img.naturalWidth, Math.max(...xs));
    const minY = Math.max(0, Math.min(...ys));
    const maxY = Math.min(img.naturalHeight, Math.max(...ys));

    const cropW = maxX - minX;
    const cropH = maxY - minY;

    if (cropW <= 10 || cropH <= 10) return;

    // भारतीय मानक आईडी कार्ड का अनुपात (1011 x 638 px)
    const dstW = 1011;
    const dstH = 638;

    const outCvs = document.createElement("canvas");
    outCvs.width = dstW;
    outCvs.height = dstH;
    const ctx = outCvs.getContext("2d");
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // बिना किसी टुकड़े या जाली के सीधा क्लीन ड्रा
    ctx.drawImage(img, minX, minY, cropW, cropH, 0, 0, dstW, dstH);

    const dataUrl = outCvs.toDataURL("image/jpeg", 0.98);
    onConfirm(dataUrl);
  };

"""
    code = code[:p1] + clean_crop_fn + code[p2:]
    with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("CLEAN_CROP_ESTABLISHED")
else:
    print("MARKERS_NOT_FOUND")
