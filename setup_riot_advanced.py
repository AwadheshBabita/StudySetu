import os

# 1. पहले देखें exportSmartJpg कहाँ परिभाषित है
riot_path = None
for root, dirs, files in os.walk("src"):
    for file in files:
        if file.endswith((".ts", ".tsx", ".js")):
            p = os.path.join(root, file)
            with open(p, "r", encoding="utf-8", errors="ignore") as f:
                if "exportSmartJpg" in f.read() and "id-card-joiner" not in p:
                    riot_path = p
                    break
    if riot_path:
        break

print(f"RIOT Engine Module Found at: {riot_path}")

# 2. id-card-joiner/page.tsx को 300 DPI अल्ट्रा-HD और RIOT इंजन से अपग्रेड करना
with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 300 DPI Studio Scale (3.0x) - ताकि बारीक से बारीक टेक्स्ट और आधार/पैन की फोटो शीशे जैसी साफ रहे
code = code.replace("generateSheetCanvas(1.0)", "generateSheetCanvas(3.0)")
code = code.replace("generateSheetCanvas(2.5)", "generateSheetCanvas(3.0)")

# handleDownloadJpg को सीधे एडवांस RIOT एक्सपोर्टर से जोड़ना
p_jpg = code.find("const handleDownloadJpg =")
p_pdf = code.find("const handleDownloadPdf =", p_jpg)

if p_jpg != -1 and p_pdf != -1:
    new_riot_call = """const handleDownloadJpg = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (isDownloadingJpg) return;
    setIsDownloadingJpg(true);
    try {
      // 300 DPI अल्ट्रा शार्प कैनवास
      const canvas = await generateSheetCanvas(3.0);
      if (!canvas) return;
      // एडवांस RIOT स्मार्ट कंप्रेशन (क्रिस्टल क्लियर टेक्स्ट + परफेक्ट फाइल साइज)
      await exportSmartJpg(canvas, `ExamSewa_IDCard_${paperType}.jpg`, 0.98);
    } catch (err) {
      console.error("RIOT Engine Error:", err);
    } finally {
      setIsDownloadingJpg(false);
    }
  };

  """
    code = code[:p_jpg] + new_riot_call + code[p_pdf:]

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("STUDIO_300DPI_AND_RIOT_CONFIGURED")
