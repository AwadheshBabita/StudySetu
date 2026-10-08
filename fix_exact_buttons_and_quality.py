with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. स्वतंत्र स्टेट्स जोड़ना
if "const [isDownloadingJpg, setIsDownloadingJpg]" not in code:
    code = code.replace(
        "const [isProcessing, setIsProcessing] = useState(false);",
        "const [isProcessing, setIsProcessing] = useState(false);\n  const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);\n  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);\n  const [isSharing, setIsSharing] = useState(false);"
    )

# 2. handleDownload को अलग-अलग स्वतंत्र फ़ंक्शंस में बदलना (ताकि कॉल अलग रहे)
old_download_block = """  const handleDownload = async (format: 'jpg' | 'pdf') => {
    setIsProcessing(true);
    try {
      if (format === 'jpg') {
        const blob = await getCompressedBlob(targetKb);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `id_card_${targetKb}kb.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
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
        a.click();"""

new_download_block = """  const handleDownloadJpgOnly = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg) return;
    setIsDownloadingJpg(true);
    try {
      const blob = await getCompressedBlob(targetKb);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `id_card_${targetKb}kb.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  const handleDownloadPdfOnly = async (e?: React.MouseEvent) => {
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

  const handleDownload = async (format: 'jpg' | 'pdf') => {
    if (format === 'jpg') await handleDownloadJpgOnly();
    else await handleDownloadPdfOnly();"""

code = code.replace(old_download_block, new_download_block)

# 3. JSX बटनों को 100% अलग-अलग स्टेट्स और स्वतंत्र क्लिक से बदलना
old_jsx_block = """            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => handleDownload('jpg')}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🖼️</span>
                <span>JPG</span>
              </button>

              <button
                onClick={() => handleDownload('pdf')}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>📄</span>
                <span>PDF</span>
              </button>

              <button
                type="button" onClick={(e) => handleShare(e)}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>🔗</span>
                <span>शेयर करें</span>
              </button>
            </div>"""

new_jsx_block = """            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={(e) => handleDownloadJpgOnly(e)}
                disabled={(!frontCropped && !backCropped) || isDownloadingJpg}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isDownloadingJpg ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isDownloadingJpg ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>JPG...</span>
                  </>
                ) : (
                  <>
                    <span>🖼️</span>
                    <span>JPG</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => handleDownloadPdfOnly(e)}
                disabled={(!frontCropped && !backCropped) || isDownloadingPdf}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isDownloadingPdf ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isDownloadingPdf ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>PDF...</span>
                  </>
                ) : (
                  <>
                    <span>📄</span>
                    <span>PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={(e) => handleShare(e)}
                disabled={(!frontCropped && !backCropped) || isSharing}
                className={`py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isSharing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSharing ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    <span>शेयर...</span>
                  </>
                ) : (
                  <>
                    <span>🔗</span>
                    <span>शेयर करें</span>
                  </>
                )}
              </button>
            </div>"""

code = code.replace(old_jsx_block, new_jsx_block)

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("INDEPENDENT_BUTTONS_CONFIGURED")
