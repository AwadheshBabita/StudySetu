with open("src/app/tools/document-scanner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_slice_block = """        const slices = 80;
        for (let i = 0; i < slices; i++) {
          const t1 = i / slices;
          const t2 = (i + 1) / slices;

          const leftX1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
          const leftY1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
          const rightX1 = pts[1].x + (pts[2].x - pts[1].x) * t1;
          const rightY1 = pts[1].y + (pts[2].y - pts[1].y) * t1;

          const destY1 = t1 * targetH;
          const destY2 = t2 * targetH;
          const destH = destY2 - destY1;

          sCtx.save();
          sCtx.beginPath();
          sCtx.rect(0, destY1, targetW, destH + 1.5);
          sCtx.clip();"""

new_slice_block = """        // 80 स्लाइस की जगह माइक्रो-स्लाइसिंग (1 से 1.5 पिक्सल की बारीक पट्टियां ताकि सीढ़ी जैसा कट न बने)
        sCtx.imageSmoothingEnabled = true;
        sCtx.imageSmoothingQuality = "high";

        const slices = Math.min(Math.round(targetH), 450);
        for (let i = 0; i < slices; i++) {
          const t1 = i / slices;
          const t2 = (i + 1) / slices;

          const leftX1 = pts[0].x + (pts[3].x - pts[0].x) * t1;
          const leftY1 = pts[0].y + (pts[3].y - pts[0].y) * t1;
          const rightX1 = pts[1].x + (pts[2].x - pts[1].x) * t1;
          const rightY1 = pts[1].y + (pts[2].y - pts[1].y) * t1;

          const destY1 = t1 * targetH;
          const destY2 = t2 * targetH;
          const destH = destY2 - destY1;

          sCtx.save();
          sCtx.beginPath();
          sCtx.rect(0, destY1, targetW, destH + 0.75);
          sCtx.clip();"""

if old_slice_block in code:
    code = code.replace(old_slice_block, new_slice_block)
    with open("src/app/tools/document-scanner/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("DOCUMENT_SCANNER_SMOOTH_APPLIED_SUCCESSFULLY")
else:
    print("TARGET_BLOCK_NOT_EXACTLY_MATCHED")
