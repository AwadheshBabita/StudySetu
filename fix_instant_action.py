with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Share फंक्शन को 0.1 सेकंड सुपर-फास्ट बनाना (User Gesture Expiry से बचाने के लिए)
p_share_start = code.find("const handleShare =")
p_share_next = code.find("const handlePrint =", p_share_start)
if p_share_next == -1:
    p_share_next = code.find("return (", p_share_start)

if p_share_start != -1 and p_share_next != -1:
    superfast_share = """const handleShare = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isSharing) return;
    setIsSharing(true);
    try {
      const canvas = await generateSheetCanvas(1.5);
      if (!canvas) {
        setIsSharing(false);
        return;
      }

      // सिंगल-पास सुपरफास्ट ब्लब (ताकि यूजर जेस्चर एक्सपायर न हो और शेयर तुरंत खुले)
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setIsSharing(false);
          return;
        }
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
          // अगर शेयर सपोर्टेड न हो तो तुरंत डाउनलोड
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `id_card_${paperType}.jpg`;
          a.click();
          URL.revokeObjectURL(url);
        }
        setIsSharing(false);
      }, "image/jpeg", 0.90);
    } catch (err) {
      console.error("Share error:", err);
      setIsSharing(false);
    }
  };

  """
    code = code[:p_share_start] + superfast_share + code[p_share_next:]

# 2. getCompressedBlob को 1-2 सेकंड का सुपरफास्ट बनाना
p_blob_start = code.find("const getCompressedBlob =")
p_blob_end = code.find("const handleDownloadJpgOnly =", p_blob_start)

if p_blob_start != -1 and p_blob_end != -1:
    fast_blob_fn = """const getCompressedBlob = async (targetSizeKb: number): Promise<Blob | null> => {
    const canvas = await generateSheetCanvas(1.5);
    if (!canvas) return null;

    // अगर टारगेट 150KB या अधिक है, तो सीधे हाई क्वालिटी बिना किसी लूप के तुरंत देना
    if (targetSizeKb >= 150) {
      return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.92));
    }

    try {
      // फास्ट बाइनरी कम्प्रेशन (मैक्सिमम 3 इटरेशन)
      let minQ = 0.3;
      let maxQ = 0.92;
      let bestBlob: Blob | null = null;

      for (let i = 0; i < 4; i++) {
        const midQ = (minQ + maxQ) / 2;
        const b = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", midQ));
        if (!b) break;
        bestBlob = b;
        const currentKb = b.size / 1024;

        if (Math.abs(currentKb - targetSizeKb) <= 5) {
          break;
        }
        if (currentKb > targetSizeKb) {
          maxQ = midQ;
        } else {
          minQ = midQ;
        }
      }
      return bestBlob || new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.75));
    } catch {
      return new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
    }
  };

  """
    code = code[:p_blob_start] + fast_blob_fn + code[p_blob_end:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("INSTANT_PERFORMANCE_APPLIED")
