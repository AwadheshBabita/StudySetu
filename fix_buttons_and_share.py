with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. शेयर फंक्शन को वास्तविक JPG फाइल भेजने वाला बनाना
old_share_start = "const handleShare"
idx_share = code.find(old_share_start)

if idx_share != -1:
    # ढूँढें कि पुराना फंक्शन कहाँ खत्म होता है
    idx_next_fn = code.find("const handlePrint", idx_share)
    if idx_next_fn != -1:
        new_share_code = """const handleShare = async () => {
    if (isSharing || isDownloadingJpg || isDownloadingPdf) return;
    setIsSharing(true);
    try {
      const canvas = await generateSheetCanvas(1.0);
      if (!canvas) return;

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
          } catch (e: any) {
            if (e.name !== "AbortError") console.error(e);
          }
        } else {
          // अगर फाइल शेयर सपोर्ट न हो तो सीधे डाउनलोड
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
      console.error(err);
      setIsSharing(false);
    }
  };

  """
        code = code[:idx_share] + new_share_code + code[idx_next_fn:]

# 2. अलग-अलग स्टेट्स जोड़ना (यदि पहले से मौजूद न हों)
if "const [isDownloadingJpg, setIsDownloadingJpg]" not in code:
    state_anchor = "const [frontCropped, setFrontCropped]"
    idx_state = code.find(state_anchor)
    if idx_state != -1:
        new_states = """const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  """
        code = code[:idx_state] + new_states + code[idx_state:]

# 3. डाउनलोड बटनों में अलग-अलग लोडिंग लगाना
code = code.replace("setIsDownloading(true)", "setIsDownloadingJpg(true)")
code = code.replace("setIsDownloading(false)", "setIsDownloadingJpg(false)")

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("BUTTONS_AND_SHARE_FIXED")
