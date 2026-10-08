with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# targetW से लेकर onConfirm(dataUrl); तक के स्लाइसिंग हिस्से को डॉक्यूमेंट स्कैनर वाले डायरेक्ट HD रेंडर से बदलना
p_start = code.find("const targetW = 1011;")
p_end = code.find("onConfirm(dataUrl);", p_start)

if p_start != -1 and p_end != -1:
    hd_clean_crop = """const targetW = 1011;
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
    """
    code = code[:p_start] + hd_clean_crop + code[p_end:]

with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SCANNER_CROP_HD_APPLIED")
