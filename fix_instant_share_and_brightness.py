with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. सीधे प्रीव्यू कैनवास से 1 क्लिक में ब्लोब निकालने वाला सबसे तेज हेल्पर
# यह दोबारा कोई ब्राइटनेस फ़िल्टर नहीं लगाएगा, जो स्क्रीन पर दिख रहा है वही देगा
unified_export_helper = """
  // सीधे दृश्यमान कैनवास से 0-लैग एक्सपोर्ट (बिना दोबारा रेंडर या ब्राइटनेस बदले)
  const getInstantCanvasBlob = async (): Promise<Blob | null> => {
    const canvas = previewCanvasRef?.current || document.querySelector("canvas");
    if (!canvas) return null;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
    });
  };
"""

# 2. सुपर-फास्ट और एक समान ब्राइटनेस वाले तीनों हैंडलर्स
new_handlers = """  const handleDownloadJpgOnly = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsDownloadingJpg(true);

    try {
      const blob = await getInstantCanvasBlob();
      if (!blob) throw new Error("Canvas blob failed");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ExamSewa_IDCard_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
      console.error("JPG Download error:", err);
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  const handleDownloadPdfOnly = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsDownloadingPdf(true);

    try {
      const blob = await getInstantCanvasBlob();
      if (!blob) throw new Error("Canvas blob failed");

      const arrayBuffer = await blob.arrayBuffer();
      const imgBytes = new Uint8Array(arrayBuffer);

      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 points
      const img = await pdfDoc.embedJpg(imgBytes);

      const imgDims = img.scaleToFit(595.28 - 36, 841.89 - 36);
      page.drawImage(img, {
        x: (595.28 - imgDims.width) / 2,
        y: (841.89 - imgDims.height) / 2,
        width: imgDims.width,
        height: imgDims.height,
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `ExamSewa_IDCard_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    } catch (err) {
      console.error("PDF Download error:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsSharing(true);

    try {
      // सीधे उसी कैनवास का ब्लोब जो स्क्रीन पर दिख रहा है (कोई ब्राइटनेस मिसमैच नहीं)
      const blob = await getInstantCanvasBlob();
      if (!blob) throw new Error("Canvas blob failed");

      const file = new File([blob], `ExamSewa_IDCard_${Date.now()}.jpg`, { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ExamSewa ID Card",
          text: "Joined ID Card via ExamSewa",
        });
      } else {
        // शेयर न होने पर ऑटो-डाउनलोड फॉलबैक
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ExamSewa_IDCard_${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };
"""

import re
# पुराने handleDownloadJpgOnly से लेकर handleShare तक के पूरे ब्लॉक को नए क्लीन ब्लॉक से बदलें
pattern = r'const handleDownloadJpgOnly = async[\s\S]*?const handleShare = async[\s\S]*?finally\s*\{[\s\S]*?setIsSharing\(false\);\s*\}[\s\S]*?\};'

if re.search(pattern, code):
    code = re.sub(pattern, unified_export_helper + "\n" + new_handlers, code, count=1)
    with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("INSTANT_HANDLERS_REPLACED_SUCCESSFULLY")
else:
    print("COULD_NOT_REGEX_MATCH_CHECKING_MANUALLY")
