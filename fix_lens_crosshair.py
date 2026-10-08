with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# पुराना बारीक क्रॉसहेयर कोड खोजना
old_crosshair = """      // क्रॉसहेयर
      ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(magX - 12, magY);
      ctx.lineTo(magX + 12, magY);
      ctx.moveTo(magX, magY - 12);
      ctx.lineTo(magX + 12, magY);
      ctx.stroke();"""

# बड़ा, बोल्ड और स्पष्ट विज़िबल क्रॉसहेयर + सेंटर डॉट
bold_crosshair = """      // लेंस के अंदर का सटीक बड़ा व बोल्ड टारगेट क्रॉसहेयर (+)
      ctx.strokeStyle = "#ef4444"; // गहरा लाल
      ctx.lineWidth = 3.5; // बोल्ड मोटाई
      ctx.beginPath();
      // क्षैतिज रेखा (बड़ी)
      ctx.moveTo(magX - 22, magY);
      ctx.lineTo(magX + 22, magY);
      // लंबवत रेखा (बड़ी)
      ctx.moveTo(magX, magY - 22);
      ctx.lineTo(magX, magY + 22);
      ctx.stroke();

      // सेंटर पिनपॉइंट डॉट (सटीक कोना बैठाने के लिए)
      ctx.beginPath();
      ctx.arc(magX, magY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();"""

if old_crosshair in code:
    code = code.replace(old_crosshair, bold_crosshair)
else:
    # अगर कमेंट का अंतर हो तो रेगेक्स से सुरक्षित बदलना
    pattern = r'ctx\.strokeStyle = "rgba\(239, 68, 68, 0\.9\)";\s*ctx\.lineWidth = 2;\s*ctx\.beginPath\(\);\s*ctx\.moveTo\(magX - 12, magY\);\s*ctx\.lineTo\(magX \+ 12, magY\);\s*ctx\.moveTo\(magX, magY - 12\);\s*ctx\.lineTo\(magX \+ 12, magY\);\s*ctx\.stroke\(\);'
    code = re.sub(pattern, bold_crosshair, code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("BOLD_CROSSHAIR_APPLIED_SUCCESSFULLY")
