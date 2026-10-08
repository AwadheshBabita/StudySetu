with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. JPG DataURL को 300 DPI JFIF हेडर देने वाला बाइनरी फ़ंक्शन
dpi_injector = """
  // JPG बाइनरी हेडर में शुद्ध 300 DPI इंजेक्ट करने का फ़ंक्शन
  const setJpgDpi300 = (dataUrl: string): string => {
    try {
      const parts = dataUrl.split(",");
      const byteString = atob(parts[1]);
      const buffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        buffer[i] = byteString.charCodeAt(i);
      }

      // JFIF APP0 मार्कर (0xFF, 0xE0) ढूँढना
      for (let i = 0; i < buffer.length - 18; i++) {
        if (
          buffer[i] === 0xff &&
          buffer[i + 1] === 0xe0 &&
          buffer[i + 4] === 0x4a && // 'J'
          buffer[i + 5] === 0x46 && // 'F'
          buffer[i + 6] === 0x49 && // 'I'
          buffer[i + 7] === 0x46    // 'F'
        ) {
          buffer[i + 13] = 1;      // यूनिट: 1 = dots per inch (DPI)
          buffer[i + 14] = 0x01;   // X Density High Byte (300 = 0x012C)
          buffer[i + 15] = 0x2c;   // X Density Low Byte
          buffer[i + 16] = 0x01;   // Y Density High Byte
          buffer[i + 17] = 0x2c;   // Y Density Low Byte
          break;
        }
      }

      let binary = "";
      for (let i = 0; i < buffer.byteLength; i++) {
        binary += String.fromCharCode(buffer[i]);
      }
      return "data:image/jpeg;base64," + btoa(binary);
    } catch {
      return dataUrl;
    }
  };
"""

if "setJpgDpi300" not in code:
    code = code.replace("const getPresetRatio =", dpi_injector + "\n  const getPresetRatio =")

# 2. handleDownloadJpg में setJpgDpi300 कॉल करना
old_dl_data = "const data = canvas.toDataURL(\"image/jpeg\", quality);"
new_dl_data = """let data = canvas.toDataURL("image/jpeg", quality);
    data = setJpgDpi300(data);"""

if old_dl_data in code:
    code = code.replace(old_dl_data, new_dl_data)

# 3. DOP Stamp Draw Logic को सटीक रूप से जोड़ना
stamp_draw_code = """        // Draw Name & DOP Stamp if enabled (Photo Mode)
        if (editorMode === "photo" && enableStamp) {
          const stampH = Math.max(60, Math.round(ch * 0.16));
          const stampY = ch - stampH;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, stampY, cw, stampH);

          ctx.strokeStyle = "#94a3b8";
          ctx.lineWidth = Math.max(2, Math.round(cw * 0.004));
          ctx.strokeRect(0, stampY, cw, stampH);

          ctx.fillStyle = "#000000";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          const fontSize = Math.max(16, Math.round(stampH * 0.32));
          ctx.font = `bold ${fontSize}px sans-serif`;

          const formattedDate = dopDate ? dopDate.split("-").reverse().join("-") : "";

          if (candidateName.trim()) {
            ctx.fillText(candidateName.toUpperCase(), cw / 2, stampY + stampH * 0.34);
            ctx.font = `bold ${Math.round(fontSize * 0.88)}px sans-serif`;
            ctx.fillText(`DOP: ${formattedDate}`, cw / 2, stampY + stampH * 0.72);
          } else {
            ctx.fillText(`DOP: ${formattedDate}`, cw / 2, stampY + stampH / 2);
          }
        }"""

if "Draw Name & DOP Stamp if enabled" not in code:
    # Border check ke pehle lagana
    border_marker = "if (hasBorder) {"
    code = code.replace(border_marker, stamp_draw_code + "\n\n        " + border_marker)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("DPI_AND_STAMP_APPLIED_SUCCESSFULLY")
