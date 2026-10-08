with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. ओरिएंटेशन स्टेट जोड़ना (डिफ़ॉल्ट पोर्ट्रेट)
if "photoOrientation" not in code:
    code = code.replace(
        "const [preset, setPreset] = useState<AspectPreset>(\"passport\");",
        "const [preset, setPreset] = useState<AspectPreset>(\"passport\");\n  const [photoOrientation, setPhotoOrientation] = useState<\"portrait\" | \"landscape\">(\"portrait\");"
    )

# 2. सटीक पिक्सेल डायमेंशन हेल्पर फ़ंक्शन जोड़ना
dimension_helper = """  const getTargetDimensions = (p: AspectPreset, orient: "portrait" | "landscape") => {
    let w = 1200;
    let h = 1800;

    if (p === "passport") { w = 413; h = 531; } // 3.5 x 4.5 cm @ 300 DPI
    else if (p === "4:6") { w = 1200; h = 1800; } // 4 x 6 inch @ 300 DPI
    else if (p === "5:7") { w = 1500; h = 2100; } // 5 x 7 inch @ 300 DPI
    else if (p === "8:10") { w = 2400; h = 3000; } // 8 x 10 inch @ 300 DPI
    else if (p === "a4") { w = 2480; h = 3508; } // A4 Sheet @ 300 DPI
    else if (p === "1:1") { w = 1200; h = 1200; }
    else if (p === "card") { w = 1004; h = 650; } // ID / PAN Card
    else if (p === "signature") { w = 413; h = 177; } // Sign 3.5 x 1.5 cm

    if (orient === "landscape" && p !== "1:1") {
      return { width: Math.max(w, h), height: Math.min(w, h) };
    }
    return { width: Math.min(w, h), height: Math.max(w, h) };
  };
"""

if "getTargetDimensions" not in code:
    code = code.replace("const getPresetRatio =", dimension_helper + "\n  const getPresetRatio =")

# 3. makeFinalCanvas में सटीक कैनवास साइज़ और स्मार्ट फिटिंग लागू करना
canvas_func_marker = "const makeFinalCanvas = async (): Promise<HTMLCanvasElement | null> => {"
canvas_logic_start = """    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        const isRotated90 = rotation % 180 !== 0;
        const cw = isRotated90 ? img.height : img.width;
        const ch = isRotated90 ? img.width : img.height;

        canvas.width = cw;
        canvas.height = ch;"""

new_canvas_logic = """    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        // सटीक 300 DPI टारगेट पिक्सेल डायमेंशन
        const dims = getTargetDimensions(preset, photoOrientation);
        const cw = dims.width;
        const ch = dims.height;

        canvas.width = cw;
        canvas.height = ch;

        // बैकग्राउंड रंग
        ctx.fillStyle = bgColor !== "transparent" ? bgColor : "#ffffff";
        ctx.fillRect(0, 0, cw, ch);

        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        const filterParts = [
          `brightness(${brightness}%)`,
          `contrast(${contrast}%)`,
          `saturate(${isBw ? 0 : saturation}%)`,
        ];
        if (isBw) filterParts.push("grayscale(100%)");
        ctx.filter = filterParts.join(" ");

        // फोटो को सटीक टारगेट कैनवास में सेंटर-फिट (Crop/Fit) करना
        const isRot = rotation % 180 !== 0;
        const srcW = isRot ? img.height : img.width;
        const srcH = isRot ? img.width : img.height;
        const scale = Math.max(cw / srcW, ch / srcH);
        const renderW = img.width * scale;
        const renderH = img.height * scale;

        ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
        ctx.restore();"""

if canvas_logic_start in code:
    code = code.replace(canvas_logic_start, new_canvas_logic)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("EXACT_STUDIO_DIMENSIONS_CONFIGURED")
