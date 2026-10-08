with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# असली पिक्सल-लेवल मैजिक कलर एल्गोरिद्म फ़ंक्शन
magic_engine_code = """  // असली गणितीय मैजिक कलर (Auto Enhance / Adaptive Paper Whitening)
  const applyPixelFilters = (canvas: HTMLCanvasElement, mode: "magic" | "bw" | "gray" | "original") => {
    if (mode === "original") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;

    // 1. Min-Max लेवल्स निकालना
    let minLum = 255;
    let maxLum = 0;
    for (let i = 0; i < d.length; i += 16) {
      const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      if (lum < minLum) minLum = lum;
      if (lum > maxLum) maxLum = lum;
    }
    const range = Math.max(1, maxLum - minLum);

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      if (mode === "bw") {
        // B&W Xerox: सख्त थ्रेशोल्ड
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const val = lum < 145 ? 0 : 255;
        d[i] = val;
        d[i + 1] = val;
        d[i + 2] = val;
      } else if (mode === "gray") {
        // Grayscale: प्राकृतिक ग्रे
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        d[i] = lum;
        d[i + 1] = lum;
        d[i + 2] = lum;
      } else if (mode === "magic") {
        // असली Magic Color (Selective Color Boost + Paper Whitening)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // बैकग्राउंड सफ़ेद करना और टेक्स्ट को गहरा करना (Sigmoid-like Contrast)
        let newLum = ((lum - minLum) / range) * 255;
        if (newLum > 195) {
          // कागज़ का हल्का हिस्सा सीधा 255 (प्योर व्हाइट)
          newLum = 255 - (255 - newLum) * 0.25;
        } else if (newLum < 75) {
          // टेक्स्ट का गहरा हिस्सा और डार्क
          newLum = newLum * 0.7;
        }

        const scale = lum > 0 ? newLum / lum : 1;
        
        // रंगों को सुरक्षित रखते हुए ब्राइटनेस बढ़ाना
        let nr = Math.min(255, Math.max(0, r * scale));
        let ng = Math.min(255, Math.max(0, g * scale));
        let nb = Math.min(255, Math.max(0, b * scale));

        // कलर सैचुरेशन हल्का बूस्ट (मुहर व फ़ोटो के लिए)
        const avg = (nr + ng + nb) / 3;
        nr = Math.min(255, Math.max(0, avg + (nr - avg) * 1.25));
        ng = Math.min(255, Math.max(0, avg + (ng - avg) * 1.25));
        nb = Math.min(255, Math.max(0, avg + (nb - avg) * 1.25));

        d[i] = nr;
        d[i + 1] = ng;
        d[i + 2] = nb;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };
"""

if "const applyPixelFilters =" not in code:
    code = code.replace("const generateA4Canvas =", magic_engine_code + "\n  const generateA4Canvas =")

# generateA4Canvas में renderCard के अंदर यह पिक्सल इंजन जोड़ना
target_render_card = """      const cardCanvas = document.createElement("canvas");
      cardCanvas.width = cardW;
      cardCanvas.height = cardH;
      const cctx = cardCanvas.getContext("2d");
      if (cctx) {
        cctx.drawImage(img, 0, 0, cardW, cardH);
        applyPixelFilters(cardCanvas, filterMode);
      }

      ctx.save();
      ctx.translate(x + cardW / 2, y + cardH / 2);
      ctx.rotate((rotationAngles[side] * Math.PI) / 180);
      ctx.scale(flipH[side] ? -1 : 1, flipV[side] ? -1 : 1);

      let filterStr = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
      ctx.filter = filterStr;

      ctx.drawImage(cardCanvas, -cardW / 2, -cardH / 2, cardW, cardH);
      ctx.restore();"""

pattern_old_render = r'ctx\.save\(\);\s*ctx\.translate\(x \+ cardW \/ 2, y \+ cardH \/ 2\);[\s\S]*?ctx\.drawImage\(img, -cardW \/ 2, -cardH \/ 2, cardW, cardH\);\s*ctx\.restore\(\);'
code = re.sub(pattern_old_render, target_render_card, code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("REAL_MAGIC_COLOR_ALGORITHM_APPLIED")
