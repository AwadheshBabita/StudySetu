with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# handleShare को पूरी तरह सही और डाउनलोड से 100% मैच करना
old_share_func = """  const handleShare = async () => {
    const cvs = generateA4Canvas();
    cvs.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "ID_Card_A4.jpg", { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "ID Card A4" });
      } else {
        handleDownloadJpg();
      }
    }, "image/jpeg", 0.9);
  };"""

new_share_func = """  const handleShare = async () => {
    const cvs = generateA4Canvas();
    const quality = isMaxHd ? 1.0 : Math.min(0.95, Math.max(0.4, targetKb / 400));
    
    // सटीक वही डेटा URL लें जो डाउनलोड में जाता है ताकि कलर व ब्राइटनेस 100% समान रहे
    const dataUrl = cvs.toDataURL("image/jpeg", quality);
    
    // डेटा URL से सीधे सटीक बाइट्स बनाकर फ़ाइल तैयार करें
    const arr = dataUrl.split(",");
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: "image/jpeg" });
    const file = new File([blob], `ID_Card_A4_${targetKb}KB.jpg`, { type: "image/jpeg" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "ID Card A4" });
      } catch (err) {
        // अगर यूज़र ने शेयर कैंसिल कर दिया
      }
    } else {
      handleDownloadJpg();
    }
  };"""

if old_share_func in code:
    code = code.replace(old_share_func, new_share_func)
else:
    pattern = r'const handleShare = async \(\) => \{[\s\S]*?handleDownloadJpg\(\);\s*\}\s*\}, "image\/jpeg", 0\.9\);\s*\};'
    code = re.sub(pattern, new_share_func, code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SHARE_BRIGHTNESS_BUG_FIXED")
