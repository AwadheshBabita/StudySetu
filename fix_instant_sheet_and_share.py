with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. handleShare को इंस्टेंट बनाना (बिना कॉलबैक के सीधे synchronous DataURL से File बनाकर share)
p_share_start = code.find("const handleShare =")
p_share_end = code.find("const handlePrint =", p_share_start)
if p_share_end == -1:
    p_share_end = code.find("return (", p_share_start)

if p_share_start != -1 and p_share_end != -1:
    clean_share_fn = """const handleShare = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSharing) return;
    setIsSharing(true);
    try {
      const canvas = await generateSheetCanvas(1.5);
      if (!canvas) {
        setIsSharing(false);
        return;
      }

      // सिंक्रोनस DataURL - 0.05 सेकंड में जेस्चर टोकन खत्म होने से पहले फाइल तैयार
      const dataUrl = canvas.toDataURL("image/jpeg", 0.90);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `id_card_${paperType}.jpg`, { type: "image/jpeg" });

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
        a.download = `id_card_${paperType}.jpg`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share execution error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  """
    code = code[:p_share_start] + clean_share_fn + code[p_share_end:]

# 2. getCompressedBlob को 1-पास फास्ट मोड पर सेट करना (ताकि 10-20 सेकंड न लगे)
p_blob_start = code.find("const getCompressedBlob =")
p_blob_end = code.find("const handleDownloadJpgOnly =", p_blob_start)

if p_blob_start != -1 and p_blob_end != -1:
    superfast_blob = """const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
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
    code = code[:p_blob_start] + superfast_blob + code[p_blob_end:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("FAST_AND_INSTANT_SHARE_APPLIED")
