with open("src/app/tools/document-scanner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

start_kw = '} else if (mode === "bw") {'
end_kw = '} else if (mode === "magic") {'

idx_start = code.find(start_kw)
idx_end = code.find(end_kw, idx_start)

if idx_start != -1 and idx_end != -1:
    perfect_bw = """} else if (mode === "bw") {
        // असली लेज़र ज़ेरॉक्स: टेक्स्ट को गहरा पकड़ना, बारीक अक्षर धुलने न पाएँ
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;

        let xerox;
        if (gray >= 185) {
          // केवल कागज़ का हल्का हिस्सा और परछाई पूरी तरह सफेद होगी
          xerox = 255;
        } else if (gray <= 115) {
          // आधार कार्ड/रसीद का टेक्स्ट, मोहर और बारकोड गाढ़ा लेज़र ब्लैक बनेगा
          xerox = Math.round(gray * 0.35);
        } else {
          // 115 से 185 के बीच स्मूथ कंट्रास्ट रैम्प (ताकि बारीक फॉन्ट न कटे)
          const t = (gray - 115) / 70;
          xerox = Math.round(40 + t * t * 215);
        }

        r = xerox; g = xerox; b = xerox;
      """
    code = code[:idx_start] + perfect_bw + code[idx_end:]
    with open("src/app/tools/document-scanner/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("PERFECT_BW_XEROX_APPLIED")
else:
    print("BLOCK_NOT_FOUND")
