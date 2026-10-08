with open("src/app/tools/document-scanner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

old_magic_snippet = """      } else if (mode === "magic") {
        r = Math.min(255, r * 1.1 + 10);
        g = Math.min(255, g * 1.1 + 10);
        b = Math.min(255, b * 1.1 + 10);
      }"""

new_magic_snippet = """      } else if (mode === "magic") {
        // CamScanner / OpenScan Auto-Enhance Engine
        // 1. ल्युमिनेंस (चमक) कैलकुलेट करना
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        // 2. एडेप्टिव बैकग्राउंड क्लिपिंग (धब्बे और परछाई हटाकर पेपर वाइट करना)
        // ल्युमिनेंस 120 से ऊपर जाने पर तेजी से वाइट (255) की तरफ शिफ्ट
        let enhancedLum;
        if (lum > 135) {
          // बैकग्राउंड को सुपर क्लीन और ब्राइट वाइट बनाना
          enhancedLum = 255 - (255 - lum) * 0.42;
        } else {
          // टेक्स्ट, पेन मार्क्स और बारीक अक्षरों को गहरा (डार्क) और बोल्ड बनाना
          enhancedLum = lum * 0.72;
        }

        // 3. ओरिजिनल इंक कलर को प्रिजर्व करते हुए कंट्रास्ट और सैचुरेशन बूस्ट
        const ratio = enhancedLum / (lum || 1);
        r = Math.min(255, Math.max(0, r * ratio));
        g = Math.min(255, Math.max(0, g * ratio));
        b = Math.min(255, Math.max(0, b * ratio));

        // रंगीन पेन/मुहर को वाइब्रेंट रखना
        const postLum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = Math.min(255, Math.max(0, postLum + (r - postLum) * 1.35));
        g = Math.min(255, Math.max(0, postLum + (g - postLum) * 1.35));
        b = Math.min(255, Math.max(0, postLum + (b - postLum) * 1.35));
      }"""

if old_magic_snippet in code:
    code = code.replace(old_magic_snippet, new_magic_snippet)
    with open("src/app/tools/document-scanner/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("CAMSCANNER_MAGIC_COLOR_APPLIED_SUCCESSFULLY")
else:
    print("OLD_SNIPPET_NOT_MATCHED_EXACTLY")
