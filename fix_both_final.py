# 1. क्रॉपर में डॉक्यूमेंट स्कैनर का असली स्लाइसिंग इंजन लगाना
with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "r", encoding="utf-8") as f:
    code = f.read()

start_fn = "  const applyWarp = () => {"
end_fn = "  return ("

p1 = code.find(start_fn)
p2 = code.find(end_fn)

if p1 != -1 and p2 != -1:
    scanner_exact_warp = """  const applyWarp = () => {
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

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = img.naturalWidth;
    srcCanvas.height = img.naturalHeight;
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) return;
    srcCtx.drawImage(img, 0, 0);

    // डॉक्यूमेंट स्कैनर का असली 80-स्लाइस हॉरिजॉन्टल वार्प इंजन
    const slices = 80;
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
      sCtx.clip();

      const sliceAngle = Math.atan2(rightY1 - leftY1, rightX1 - leftX1);
      const sliceWidth = Math.hypot(rightX1 - leftX1, rightY1 - leftY1);

      sCtx.translate(0, destY1);
      sCtx.scale(targetW / sliceWidth, 1);
      sCtx.rotate(-sliceAngle);
      sCtx.drawImage(srcCanvas, -leftX1, -leftY1);
      sCtx.restore();
    }

    const dataUrl = straightCanvas.toDataURL("image/jpeg", 0.98);
    onConfirm(dataUrl);
  };

"""
    code = code[:p1] + scanner_exact_warp + code[p2:]
    with open("src/app/tools/id-card-joiner/ScannerCropModal.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("SCANNER_WARP_INSTALLED")

# 2. पेज के बटनों (JPG, PDF, Share) को पूर्ण रूप से स्वतंत्र करना
with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    page_code = f.read()

# अलग-अलग स्टेट्स
if "const [isDownloadingJpg, setIsDownloadingJpg]" not in page_code:
    anchor = "const [isDownloading, setIsDownloading] = useState(false);"
    if anchor in page_code:
        page_code = page_code.replace(
            anchor,
            "const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);\n  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);\n  const [isSharing, setIsSharing] = useState(false);"
        )

# स्वतंत्र शेयर फंक्शन (JPG फाइल शेयरर)
p_share_start = page_code.find("const handleShare =")
p_share_end = page_code.find("const handlePrint =", p_share_start)
if p_share_start != -1 and p_share_end != -1:
    clean_share_fn = """const handleShare = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSharing || isDownloadingJpg || isDownloadingPdf) return;
    setIsSharing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) {
        setIsSharing(false);
        return;
      }

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
        const file = new File([blob], `ExamSewa_IDCard_${paperType}.jpg`, { type: "image/jpeg" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "ExamSewa ID Card",
              text: "ExamSewa आईडी कार्ड जॉइनर",
            });
          } catch (err: any) {
            if (err.name !== "AbortError") console.error(err);
          }
        } else {
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `ExamSewa_IDCard_${paperType}.jpg`;
          link.click();
          URL.revokeObjectURL(link.href);
        }
        setIsSharing(false);
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error(err);
      setIsSharing(false);
    }
  };

  """
    page_code = page_code[:p_share_start] + clean_share_fn + page_code[p_share_end:]

# JSX बटन्स इवेंट अलगाव
page_code = page_code.replace("onClick={handleDownloadJpg}", "type=\"button\" onClick={(e) => { e.stopPropagation(); handleDownloadJpg(); }}")
page_code = page_code.replace("onClick={handleDownloadPdf}", "type=\"button\" onClick={(e) => { e.stopPropagation(); handleDownloadPdf(); }}")
page_code = page_code.replace("onClick={handleShare}", "type=\"button\" onClick={(e) => { e.stopPropagation(); handleShare(); }}")

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(page_code)

print("SUCCESS_ALL_CONFIGURED")
