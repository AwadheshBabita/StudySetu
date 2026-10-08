with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. असली 300 DPI JFIF हेडर इंजेक्टर (यदि JFIF न हो तो भी 0xFF 0xD8 के तुरंत बाद जोड़ता है)
new_dpi_func = """  // शुद्ध 300 DPI JFIF हेडर बाइनरी इंजेक्शन (फोटोशॉप व विंडोज दोनों के लिए)
  const setJpgDpi300 = (dataUrl: string): string => {
    try {
      const parts = dataUrl.split(",");
      const raw = atob(parts[1]);
      const rawLen = raw.length;
      const bytes = new Uint8Array(rawLen);
      for (let i = 0; i < rawLen; i++) {
        bytes[i] = raw.charCodeAt(i);
      }

      // यदि पहले से JFIF मौजूद है तो उसमें 300 DPI सेट करें
      let jfifFound = false;
      for (let i = 0; i < Math.min(bytes.length - 18, 100); i++) {
        if (
          bytes[i] === 0xff &&
          bytes[i + 1] === 0xe0 &&
          bytes[i + 4] === 0x4a && // J
          bytes[i + 5] === 0x46 && // F
          bytes[i + 6] === 0x49 && // I
          bytes[i + 7] === 0x46    // F
        ) {
          bytes[i + 13] = 1;     // dots per inch (DPI)
          bytes[i + 14] = 0x01;  // 300 = 0x012C
          bytes[i + 15] = 0x2c;
          bytes[i + 16] = 0x01;
          bytes[i + 17] = 0x2c;
          jfifFound = true;
          break;
        }
      }

      let finalBytes = bytes;

      // यदि ब्राउज़र ने JFIF हेडर नहीं बनाया है, तो SOI (0xFF, 0xD8) के बाद 18-बाइट 300 DPI JFIF ब्लॉक इंजेक्ट करें
      if (!jfifFound && bytes[0] === 0xff && bytes[1] === 0xd8) {
        const jfifHeader = new Uint8Array([
          0xff, 0xe0, 0x00, 0x10, // APP0 length 16
          0x4a, 0x46, 0x49, 0x46, 0x00, // 'JFIF\0'
          0x01, 0x01, // v1.1
          0x01,       // density unit = DPI (dots/inch)
          0x01, 0x2c, // X density = 300
          0x01, 0x2c, // Y density = 300
          0x00, 0x00  // no thumbnail
        ]);

        finalBytes = new Uint8Array(bytes.length + jfifHeader.length);
        finalBytes.set(bytes.subarray(0, 2), 0); // 0xFF, 0xD8
        finalBytes.set(jfifHeader, 2);           // JFIF Block
        finalBytes.set(bytes.subarray(2), 2 + jfifHeader.length); // Image Data
      }

      let binary = "";
      const len = finalBytes.byteLength;
      for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(finalBytes[i]);
      }
      return "data:image/jpeg;base64," + btoa(binary);
    } catch {
      return dataUrl;
    }
  };"""

# setJpgDpi300 फ़ंक्शन को रिप्लेस करना
import re
code = re.sub(r'const setJpgDpi300 = .*?return dataUrl;\s*\}\s*\};', new_dpi_func, code, flags=re.DOTALL)

# 2. makeFinalCanvas में सटीक कैनवास साइज़ (getTargetDimensions) को पूरी तरह सक्रिय करना
canvas_block_target = """    return new Promise((resolve) => {
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

canvas_block_exact = """    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }

        // सटीक 300 DPI डायमेंशन
        const dims = getTargetDimensions(preset, photoOrientation);
        const cw = dims.width;
        const ch = dims.height;

        canvas.width = cw;
        canvas.height = ch;"""

if canvas_block_target in code:
    code = code.replace(canvas_block_target, canvas_block_exact)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("STUDIO_EXACT_DPI_APPLIED")
