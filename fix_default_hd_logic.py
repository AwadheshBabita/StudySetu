with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. getCompressedBlob में डिफ़ॉल्ट HD लॉजिक लगाना
p_blob_start = code.find("const getCompressedBlob =")
p_blob_end = code.find("const handleDownloadJpgOnly =", p_blob_start)

if p_blob_start != -1 and p_blob_end != -1:
    default_hd_blob_fn = """const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    // 2.5x स्केल = 300 DPI स्टूडियो लेवल रेजोल्यूशन
    const canvas = await generateSheetCanvas(2.5);
    if (!canvas) return null;

    // अगर डिफ़ॉल्ट मोड है या साइज 100KB से ऊपर रखा गया है -> 100% ओरिजिनल HD क्वालिटी
    // यहाँ कोई कम्प्रेशन नहीं होगा, फोटो और टेक्स्ट बिल्कुल ओरिजिनल रहेंगे।
    if (!targetSizeKb || targetSizeKb >= 100) {
      return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.95));
    }

    // अगर यूजर ने जानबूझकर स्लाइडर से साइज कम किया है (जैसे 20KB, 40KB):
    let q = 0.85;
    if (targetSizeKb <= 30) q = 0.50;
    else if (targetSizeKb <= 50) q = 0.68;
    else if (targetSizeKb <= 80) q = 0.78;

    return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", q));
  };

  """
    code = code[:p_blob_start] + default_hd_blob_fn + code[p_blob_end:]

# 2. handleShare में भी सीधे डिफ़ॉल्ट HD (0.95 क्वालिटी) देना
p_share_start = code.find("const handleShare =")
p_share_end = code.find("const handlePrint =", p_share_start)
if p_share_end == -1:
    p_share_end = code.find("return (", p_share_start)

if p_share_start != -1 and p_share_end != -1:
    hd_share_fn = """const handleShare = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSharing) return;
    setIsSharing(true);
    try {
      const canvas = await generateSheetCanvas(2.5);
      if (!canvas) {
        setIsSharing(false);
        return;
      }

      // शेयर पर सीधे बेस्ट HD क्वालिटी बिना किसी कम्प्रेशन के
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
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
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ExamSewa_IDCard_${paperType}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  """
    code = code[:p_share_start] + hd_share_fn + code[p_share_end:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("DEFAULT_HD_LOGIC_CONFIGURED")
