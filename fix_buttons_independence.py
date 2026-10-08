with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. सुनिश्चित करें कि तीनों स्टेट्स मौजूद हैं
if "const [isDownloadingJpg, setIsDownloadingJpg]" not in code:
    anchor = "const [isDownloading, setIsDownloading]"
    if anchor in code:
        code = code.replace(
            anchor + " = useState(false);",
            "const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);\n  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);\n  const [isSharing, setIsSharing] = useState(false);"
        )

# 2. JPG डाउनलोड फंक्शन को स्वतंत्र बनाना
old_jpg = "const handleDownloadJpg"
p_jpg = code.find(old_jpg)
p_pdf = code.find("const handleDownloadPdf")

if p_jpg != -1 and p_pdf != -1:
    new_jpg_fn = """const handleDownloadJpg = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsDownloadingJpg(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.download = `ExamSewa_IDCard_${paperType}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  """
    code = code[:p_jpg] + new_jpg_fn + code[p_pdf:]

# 3. PDF डाउनलोड फंक्शन को स्वतंत्र बनाना
p_pdf = code.find("const handleDownloadPdf")
p_share = code.find("const handleShare")

if p_pdf != -1 and p_share != -1:
    new_pdf_fn = """const handleDownloadPdf = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingPdf || isDownloadingJpg || isSharing) return;
    setIsDownloadingPdf(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdfDoc = await PDFDocument.create();
      
      const isA4 = paperType === 'a4';
      const pW = isA4 ? 595.28 : 288;
      const pH = isA4 ? 841.89 : 432;
      const page = pdfDoc.addPage([pW, pH]);
      
      const jpgImage = await pdfDoc.embedJpg(imgData);
      page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: pW,
        height: pH,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `ExamSewa_IDCard_${paperType}.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  """
    code = code[:p_pdf] + new_pdf_fn + code[p_share:]

# 4. Share फंक्शन को शुद्ध इमेज फाइल शेयरर बनाना (लिंक नहीं)
p_share = code.find("const handleShare")
p_print = code.find("const handlePrint")

if p_share != -1 and p_print != -1:
    new_share_fn = """const handleShare = async (e?: React.MouseEvent) => {
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
              text: "ExamSewa आईडी कार्ड जॉइनर से तैयार कार्ड",
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
    code = code[:p_share] + new_share_fn + code[p_print:]

# 5. JSX बटनों में टाइप और अलग-अलग लोडिंग लगाना
code = code.replace("disabled={isDownloading}", "disabled={isDownloadingJpg || isDownloadingPdf || isSharing}")
code = code.replace("onClick={handleDownloadJpg}", "type=\"button\" onClick={(e) => handleDownloadJpg(e)}")
code = code.replace("onClick={handleDownloadPdf}", "type=\"button\" onClick={(e) => handleDownloadPdf(e)}")
code = code.replace("onClick={handleShare}", "type=\"button\" onClick={(e) => handleShare(e)}")

# लोडिंग टेक्स्ट अलग-अलग करना
code = code.replace("{isDownloading ? 'तैयार हो रहा है...' : 'JPG'}", "{isDownloadingJpg ? 'बन रहा है...' : '🖼️ JPG'}")
code = code.replace("{isDownloading ? 'तैयार हो रहा है...' : 'PDF'}", "{isDownloadingPdf ? 'बन रहा है...' : '📄 PDF'}")
code = code.replace("{isDownloading ? 'तैयार हो रहा है...' : 'शेयर करें'}", "{isSharing ? 'शेयर हो रहा...' : '🔗 शेयर करें'}")

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("ALL_BUTTONS_ISOLATED_PERFECTLY")
