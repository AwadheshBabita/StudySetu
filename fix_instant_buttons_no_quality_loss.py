with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. handleShare को सुपर-फास्ट बनाना (सीधे instant blob से, बिना fetch लैग के)
p_share_start = code.find("const handleShare =")
p_share_end = code.find("const handlePrint =", p_share_start)
if p_share_end == -1:
    p_share_end = code.find("return (", p_share_start)

if p_share_start != -1 and p_share_end != -1:
    instant_share_fn = """const handleShare = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSharing) return;
    setIsSharing(true);

    try {
      // प्रीव्यू कैनवास या शीट कैनवास तुरंत लेना
      const canvas = await generateSheetCanvas(2.0);
      if (!canvas) {
        setIsSharing(false);
        return;
      }

      // toBlob सीधे मेमोरी में बाइनरी फाइल बनाता है (बिना fetch और बिना बेस64 लैग के)
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
            });
          } catch (err: any) {
            if (err.name !== "AbortError") console.error("Share error:", err);
          }
        } else {
          // अगर ब्राउज़र शेयर सपोर्ट न करे तो डायरेक्ट डाउनलोड
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `ExamSewa_IDCard_${paperType}.jpg`;
          a.click();
          URL.revokeObjectURL(url);
        }
        setIsSharing(false);
      }, "image/jpeg", 0.95);
    } catch (err) {
      console.error("Share execution error:", err);
      setIsSharing(false);
    }
  };

  """
    code = code[:p_share_start] + instant_share_fn + code[p_share_end:]

# 2. handleDownloadJpgOnly को फास्ट बनाना
p_jpg_start = code.find("const handleDownloadJpgOnly =")
p_jpg_end = code.find("const handleDownloadPdfOnly =", p_jpg_start)

if p_jpg_start != -1 and p_jpg_end != -1:
    fast_jpg_fn = """const handleDownloadJpgOnly = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg) return;
    setIsDownloadingJpg(true);

    try {
      const blob = await getCompressedBlob(targetKb);
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ExamSewa_IDCard_${paperType}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JPG Download error:", err);
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  """
    code = code[:p_jpg_start] + fast_jpg_fn + code[p_jpg_end:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("INSTANT_BUTTONS_CONFIGURED")
