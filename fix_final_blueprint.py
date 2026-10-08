with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. getCompressedBlob: पूरा A4 कैनवास 1.5x स्केल पर, बिना ब्राउज़र हैंग किए शार्प क्वालिटी
p_blob_start = code.find("const getCompressedBlob =")
p_blob_end = code.find("const handleDownloadJpgOnly =", p_blob_start)

if p_blob_start != -1 and p_blob_end != -1:
    blueprint_blob = """const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    // पूरा A4 कैनवास (1.5x स्केल: 1240x1754 px)
    const canvas = await generateSheetCanvas(1.5);
    if (!canvas) return null;

    // A4 शीट के लिए डायरेक्ट ऑप्टिमाइज़्ड क्वालिटी (ताकि कार्ड शार्प रहे और समय 0.5s लगे)
    let q = 0.88;
    if (targetSizeKb <= 35) q = 0.50;
    else if (targetSizeKb <= 70) q = 0.70;
    else if (targetSizeKb <= 150) q = 0.85;

    return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", q));
  };

  """
    code = code[:p_blob_start] + blueprint_blob + code[p_blob_end:]

# 2. PDF जनरेटर में पूरा A4 कैनवास सही 1:1 रेश्यो में एम्बेड होना सुनिश्चित करना
p_pdf_start = code.find("const handleDownloadPdfOnly =")
p_pdf_end = code.find("const handleDownload =", p_pdf_start)

if p_pdf_start != -1 and p_pdf_end != -1:
    blueprint_pdf = """const handleDownloadPdfOnly = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      const blob = await getCompressedBlob(targetKb);
      if (!blob) return;

      const arrayBuffer = await blob.arrayBuffer();
      const imgBytes = new Uint8Array(arrayBuffer);

      const pW = (spec.sheetW_mm * 72) / 25.4;
      const pH = (spec.sheetH_mm * 72) / 25.4;

      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([pW, pH]);
      const embeddedImg = await pdfDoc.embedJpg(imgBytes);

      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: pW,
        height: pH,
      });

      const finalPdf = await pdfDoc.save();
      const pdfBlob = new Blob([finalPdf.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ExamSewa_IDCard_${paperType}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  """
    code = code[:p_pdf_start] + blueprint_pdf + code[p_pdf_end:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("BLUEPRINT_APPLIED_SUCCESSFULLY")
