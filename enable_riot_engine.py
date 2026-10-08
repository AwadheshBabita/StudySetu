with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. handleDownloadJpg में RIOT इंजन लगाना
p_jpg = code.find("const handleDownloadJpg =")
p_pdf = code.find("const handleDownloadPdf =", p_jpg)

if p_jpg != -1 and p_pdf != -1:
    riot_jpg_fn = """const handleDownloadJpg = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg || isDownloadingPdf || isSharing) return;
    setIsDownloadingJpg(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;
      // RIOT इंजन: स्मार्ट ऑप्टिमाइज़्ड JPG एक्सपोर्ट
      await exportSmartJpg(canvas, `ExamSewa_IDCard_${paperType}.jpg`, 0.95);
    } catch (err) {
      console.error("RIOT JPG Export Error:", err);
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  """
    code = code[:p_jpg] + riot_jpg_fn + code[p_pdf:]

# 2. handleShare में भी RIOT इंजन के अनुरूप हाई-क्वालिटी फाइल शेयरिंग सुनिश्चित करना
p_share = code.find("const handleShare =")
p_print = code.find("const handlePrint =", p_share)

if p_share != -1 and p_print != -1:
    riot_share_fn = """const handleShare = async (e?: React.MouseEvent) => {
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
          await exportSmartJpg(canvas, `ExamSewa_IDCard_${paperType}.jpg`, 0.95);
        }
        setIsSharing(false);
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("Share Error:", err);
      setIsSharing(false);
    }
  };

  """
    code = code[:p_share] + riot_share_fn + code[p_print:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("RIOT_ENGINE_ACTIVATED_SUCCESSFULLY")
