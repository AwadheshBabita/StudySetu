with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. getCompressedBlob को ठीक पिछली वाली स्थिति में वापस लाना
p_blob_start = code.find("const getCompressedBlob =")
p_blob_end = code.find("const handleDownloadJpgOnly =", p_blob_start)

if p_blob_start != -1 and p_blob_end != -1:
    prev_blob = """const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    const canvas = await generateSheetCanvas(1.5);
    if (!canvas) return null;

    // A4 शीट पर दोनों कार्ड्स के लिए ऑप्टिमाइज़्ड क्वालिटी (लूप हटाकर सीधे 1-पास)
    let q = 0.88;
    if (targetSizeKb <= 30) q = 0.45;
    else if (targetSizeKb <= 60) q = 0.65;
    else if (targetSizeKb <= 120) q = 0.78;

    return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", q));
  };

  """
    code = code[:p_blob_start] + prev_blob + code[p_blob_end:]

# 2. handleDownloadPdfOnly को भी ठीक पिछली वाली स्थिति में वापस लाना
p_pdf_start = code.find("const handleDownloadPdfOnly =")
p_pdf_end = code.find("const handleDownload =", p_pdf_start)

if p_pdf_start != -1 and p_pdf_end != -1:
    prev_pdf = """const handleDownloadPdfOnly = async (e?: React.MouseEvent) => {
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
      const pdfBlob = new Blob([finalPdf.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `id_card_${targetKb}kb.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  """
    code = code[:p_pdf_start] + prev_pdf + code[p_pdf_end:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("REVERTED_TO_PREVIOUS_STATE")
