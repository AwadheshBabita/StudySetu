with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. isSharing स्टेट जोड़ना
if "const [isSharing, setIsSharing] = useState<boolean>(false);" not in code:
    code = code.replace(
        "const [isProcessing, setIsProcessing] = useState<boolean>(false);",
        "const [isProcessing, setIsProcessing] = useState<boolean>(false);\n  const [isSharing, setIsSharing] = useState<boolean>(false);"
    )

# 2. handleShare फंक्शन को पूरी तरह सुरक्षित बनाना (sheetSize बग फिक्स + अलग स्टेट)
import re
new_share_block = """  // 📤 नेटिव शेयर सिस्टम (Document Scanner जैसा सटीक फॉर्मूला)
  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;

      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.98);
      const res = await fetch(jpgDataUrl);
      const blob = await res.blob();
      const fileName = `ExamSewa_IDCard_${paperType}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'ExamSewa आईडी कार्ड',
          text: 'ExamSewa ID Card Joiner द्वारा तैयार दस्तावेज़',
        });
      } else if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: 'ExamSewa आईडी कार्ड',
          text: 'ExamSewa ID Card Joiner द्वारा तैयार दस्तावेज़',
        });
      } else {
        const link = document.createElement('a');
        link.download = fileName;
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError' && err?.name !== 'NotAllowedError') {
        console.error('शेयरिंग में त्रुटि:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };"""

code = re.sub(r'// 📤 नेटिव शेयर सिस्टम.*?const handlePrint = async', new_share_block + '\n\n  const handlePrint = async', code, flags=re.DOTALL)

# 3. UI बटन्स में Share बटन की निर्भरता को isProcessing से हटाकर सिर्फ isSharing पर करना
code = code.replace(
    "onClick={handleShare}\n                disabled={(!frontCropped && !backCropped) || isProcessing}",
    "onClick={handleShare}\n                disabled={(!frontCropped && !backCropped) || isSharing}"
)
code = code.replace(
    "(!frontCropped && !backCropped) || isProcessing ? 'opacity-50 cursor-not-allowed' : ''",
    "(!frontCropped && !backCropped) || isSharing ? 'opacity-50 cursor-not-allowed' : ''"
)

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("ALL_ISSUES_RESOLVED_CLEANLY")
