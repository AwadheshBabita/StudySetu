with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = False

fast_handlers = """  const handleDownloadJpgOnly = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsDownloadingJpg(true);

    try {
      const blob = await getCompressedBlob(targetKb);
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ExamSewa_IDCard_${paperType || "print"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
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
      const blob = await getCompressedBlob(targetKb);
      if (!blob) return;

      const arrayBuffer = await blob.arrayBuffer();
      const imgBytes = new Uint8Array(arrayBuffer);

      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
      const img = await pdfDoc.embedJpg(imgBytes);

      const imgDims = img.scaleToFit(595.28 - 40, 841.89 - 40);
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
      a.download = `ExamSewa_IDCard_${paperType || "print"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
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
      const blob = await getCompressedBlob(targetKb);
      if (!blob) return;

      const file = new File([blob], `ExamSewa_IDCard.jpg`, { type: "image/jpeg" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "ExamSewa ID Card",
          text: "Joined ID Card via ExamSewa",
        });
      } else {
        // फॉलबैक: डायरेक्ट सेव
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ExamSewa_IDCard.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };
"""

i = 0
while i < len(lines):
    line = lines[i]
    if "const handleDownloadJpgOnly =" in line:
        new_lines.append(fast_handlers)
        # पुराने handleDownloadJpgOnly, handleDownloadPdfOnly, handleDownload, handleShare को छोड़ें
        while i < len(lines) and "const handleShare =" not in lines[i]:
            i += 1
        # handleShare के अंत तक छोड़ें
        brace_count = 0
        started = False
        while i < len(lines):
            if "{" in lines[i]:
                brace_count += lines[i].count("{")
                started = True
            if "}" in lines[i]:
                brace_count -= lines[i].count("}")
            if started and brace_count == 0:
                i += 1
                break
            i += 1
        continue
    else:
        new_lines.append(line)
        i += 1

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("ID_JOINER_FAST_BUTTONS_PATCHED")
