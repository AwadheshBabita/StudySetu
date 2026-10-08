with open("src/app/tools/document-scanner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

start_kw = '} else if (mode === "magic") {'
end_kw = 'if (satVal !== 0 && mode !== "bw" && mode !== "grayscale") {'

idx_start = code.find(start_kw)
idx_end = code.find(end_kw, idx_start)

if idx_start != -1 and idx_end != -1:
    balanced_magic = """} else if (mode === "magic") {
        // संतुलित CamScanner टोनल कर्व (बिना ओवर-एक्सपोजर और बिना स्याही फैले)
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // स्मूथ नॉर्मलाइज़्ड ल्युमिनेंस कर्व (0 से 1)
        const norm = lum / 255;

        // नेचुरल कर्व: हल्के शेड्स क्लीन वाइट होंगे, टेक्स्ट बिना फैले गहरा रहेगा
        // बैकग्राउंड लिफ्ट (1.18x) + मिड-टोन रिटेंशन ताकि बारीक अक्षर न मिटें
        let enhanced;
        if (norm > 0.55) {
          // बैकग्राउंड को बिना ब्लीच किए जेंटल वाइट बनाना
          enhanced = 0.55 + Math.pow((norm - 0.55) / 0.45, 0.85) * 0.45;
          enhanced = Math.min(1, enhanced * 1.08);
        } else {
          // टेक्स्ट को सिर्फ 15% गहरा करना ताकि फॉन्ट की डिटेलिंग और गोलाई बरकरार रहे
          enhanced = Math.pow(norm / 0.55, 1.22) * 0.55;
        }

        const targetLum = enhanced * 255;
        const ratio = targetLum / (lum || 1);

        // कलर कंट्रास्ट को बैलेंस रखना
        r = Math.min(255, Math.max(0, r * ratio));
        g = Math.min(255, Math.max(0, g * ratio));
        b = Math.min(255, Math.max(0, b * ratio));

        // हल्का सा कलर वाइब्रेंसी टच (1.1x) ताकि नीली स्याही और स्टांप नेचुरल दिखें
        const postLum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, postLum + (r - postLum) * 1.12));
        g = Math.min(255, Math.max(0, postLum + (g - postLum) * 1.12));
        b = Math.min(255, Math.max(0, postLum + (b - postLum) * 1.12));
      }

      """
    code = code[:idx_start] + balanced_magic + code[idx_end:]
    with open("src/app/tools/document-scanner/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("BALANCED_MAGIC_COLOR_APPLIED")
else:
    print("COULD_NOT_LOCATE_BLOCK")
