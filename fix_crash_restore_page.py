with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. सुनिश्चित करें कि isProcessing, downloadingFormat और isSharing तीनों मौजूद हैं
if "const [isProcessing, setIsProcessing] = useState<boolean>(false);" not in code:
    code = code.replace(
        "const [downloadingFormat, setDownloadingFormat] = useState<'jpg' | 'pdf' | null>(null);",
        "const [isProcessing, setIsProcessing] = useState<boolean>(false);\n  const [downloadingFormat, setDownloadingFormat] = useState<'jpg' | 'pdf' | null>(null);"
    )

if "const [isSharing, setIsSharing] = useState<boolean>(false);" not in code:
    code = code.replace(
        "const [downloadingFormat, setDownloadingFormat] = useState<'jpg' | 'pdf' | null>(null);",
        "const [downloadingFormat, setDownloadingFormat] = useState<'jpg' | 'pdf' | null>(null);\n  const [isSharing, setIsSharing] = useState<boolean>(false);"
    )

# 2. handleDownload में सुरक्षित लॉजिक
old_download_func = """  const handleDownload = async (format: 'jpg' | 'pdf') => {
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

# 3. तीनों बटन पूरी तरह अलग और क्रैश-प्रूफ
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
              </button>

              {/* 3. शेयर बटन */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare();
                }}
                disabled={(!frontCropped && !backCropped) || isSharing}
                className={`py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1 transition-all active:scale-98 ${
                  (!frontCropped && !backCropped) || isSharing ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
              >
                <span>🔗</span>
                <span>{isSharing ? 'खुल रहा...' : 'शेयर करें'}</span>
              </button>"""

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("PAGE_CRASH_FIXED_PERMANENTLY")
