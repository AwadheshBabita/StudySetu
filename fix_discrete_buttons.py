with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. downloadingFormat स्टेट जोड़ना
if "const [downloadingFormat, setDownloadingFormat] = useState" not in code:
    code = code.replace(
        "const [isProcessing, setIsProcessing] = useState<boolean>(false);",
        "const [downloadingFormat, setDownloadingFormat] = useState<'jpg' | 'pdf' | null>(null);"
    )

# 2. handleDownload फंक्शन को अलग-अलग फॉर्मेट स्टेट के साथ अपडेट करना
old_handle_download = """  const handleDownload = async (format: 'jpg' | 'pdf') => {
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
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsProcessing(false);
    }
  };"""

new_handle_download = """  const handleDownload = async (format: 'jpg' | 'pdf') => {
    if (downloadingFormat || isSharing) return;
    setDownloadingFormat(format);
    try {
      if (format === 'jpg') {
        const blob = await getCompressedBlob(targetKb);
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `id_card_${targetKb}kb.jpg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } else if (format === 'pdf') {
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
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } finally {
      setDownloadingFormat(null);
    }
  };"""

code = code.replace(old_handle_download, new_handle_download)

# 3. UI बटन्स को अलग-अलग स्टेट से जोड़ना
old_ui_buttons = """              {/* 1. JPG बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('jpg');
                }}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>🖼️</span>
                <span>{isProcessing ? 'तैयार...' : 'JPG'}</span>
              </button>

              {/* 2. PDF बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('pdf');
                }}
                disabled={(!frontCropped && !backCropped) || isProcessing}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>📄</span>
                <span>{isProcessing ? 'तैयार...' : 'PDF'}</span>
              </button>"""

new_ui_buttons = """              {/* 1. JPG बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('jpg');
                }}
                disabled={(!frontCropped && !backCropped) || downloadingFormat === 'jpg'}
                className={`py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || downloadingFormat === 'jpg' ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>🖼️</span>
                <span>{downloadingFormat === 'jpg' ? 'तैयार...' : 'JPG'}</span>
              </button>

              {/* 2. PDF बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload('pdf');
                }}
                disabled={(!frontCropped && !backCropped) || downloadingFormat === 'pdf'}
                className={`py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || downloadingFormat === 'pdf' ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>📄</span>
                <span>{downloadingFormat === 'pdf' ? 'तैयार...' : 'PDF'}</span>
              </button>"""

code = code.replace(old_ui_buttons, new_ui_buttons)

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("ISOLATED_EACH_BUTTON_SUCCESSFULLY")
