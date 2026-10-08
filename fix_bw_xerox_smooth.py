with open("src/app/tools/document-scanner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_bw = """      } else if (mode === "bw") {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const bw = gray > 140 ? 255 : 0;
        r = bw; g = bw; b = bw;"""

new_bw = """      } else if (mode === "bw") {
        // असली लेज़र ज़ेरॉक्स (True Photocopier Mode)
        // 1. ग्रे वैल्यू
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        // 2. एडेप्टिव टोनल रैम्प (हार्ड कट 0 या 255 नहीं, ताकि अक्षर आपस में न लिपटें)
        let xerox;
        if (gray >= 165) {
          // बैकग्राउंड, परछाई और पेपर को क्लीन वाइट करना
          xerox = 255;
        } else if (gray <= 75) {
          // टेक्स्ट और मुख्य लिखावट को डीप लेज़र ब्लैक करना
          xerox = 0;
        } else {
          // 75 से 165 के बीच हाई-कंट्रास्ट स्मूथ ग्रेडिएंट
          // जिससे अक्षरों की धार, बारकोड और लोगो का आकार 100% स्पष्ट रहे
          const t = (gray - 75) / 90;
          xerox = Math.round(t * t * (3 - 2 * t) * 255);
        }

        r = xerox; g = xerox; b = xerox;"""

if old_bw in code:
    code = code.replace(old_bw, new_bw)
    with open("src/app/tools/document-scanner/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("XEROX_SMOOTH_APPLIED_SUCCESSFULLY")
else:
    print("OLD_BW_BLOCK_NOT_MATCHED")
