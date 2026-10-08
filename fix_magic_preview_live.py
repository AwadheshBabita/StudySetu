with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# 1. प्रीव्यू इमेज स्टाइल में Magic Color का मजबूत विज़िबल CSS फ़िल्टर जोड़ना
old_style_block = r'filterMode === "bw" \? "grayscale\(100%\) contrast\(160%\)" : filterMode === "gray" \? "grayscale\(100%\)" : ""'

# Magic Color होने पर: 35% गहरा कंट्रास्ट + 8% पेपर ब्राइटनिंग + 25% कलर बूस्ट (मुहर/फ़ोटो)
new_style_block = 'filterMode === "bw" ? "grayscale(100%) contrast(170%)" : filterMode === "gray" ? "grayscale(100%)" : filterMode === "magic" ? "contrast(135%) brightness(108%) saturate(125%)" : ""'

code = re.sub(old_style_block, new_style_block, code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("MAGIC_COLOR_PREVIEW_FIXED_SUCCESSFULLY")
