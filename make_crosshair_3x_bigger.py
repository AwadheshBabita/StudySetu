with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# लेंस के अंदर 3 गुना बड़ा व सुपर बोल्ड क्रॉसहेयर (+)
triple_size_crosshair = """      // लेंस के अंदर का 3 गुना बड़ा व स्पष्ट टारगेट (+)
      ctx.strokeStyle = "#ef4444"; // गहरा लाल
      ctx.lineWidth = 6; // 3x बोल्ड मोटाई
      ctx.beginPath();
      // क्षैतिज रेखा (3x बड़ी: 60px)
      ctx.moveTo(magX - 60, magY);
      ctx.lineTo(magX + 60, magY);
      // लंबवत रेखा (3x बड़ी: 60px)
      ctx.moveTo(magX, magY - 60);
      ctx.lineTo(magX, magY + 60);
      ctx.stroke();

      // सेंटर पिनपॉइंट डॉट (3x बड़ा)
      ctx.beginPath();
      ctx.arc(magX, magY, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#000000";
      ctx.stroke();"""

# केवल इसी ब्लॉक को रिप्लेस करना
pattern = r'\/\/\s*लेंस के अंदर का[\s\S]*?ctx\.fillStyle = "#ffffff";\s*ctx\.fill\(\);'
if re.search(pattern, code):
    code = re.sub(pattern, triple_size_crosshair, code)
else:
    # बैकअप पैटर्न अगर पिछला कमेंट अलग हो
    pattern_backup = r'ctx\.strokeStyle = "#ef4444";[\s\S]*?ctx\.fillStyle = "#ffffff";\s*ctx\.fill\(\);'
    code = re.sub(pattern_backup, triple_size_crosshair, code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("CROSSHAIR_3X_BIGGER_APPLIED")
