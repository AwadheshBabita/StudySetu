with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# अंदर का दूसरा डुप्लीकेट हेडर ब्लॉक हटाना
pattern = r'\{\/\* 1\. कॉम्पैक्ट टॉप हेडर \*\/\}[\s\S]*?<\/header>'
code = re.sub(pattern, '', code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("DUPLICATE_HEADER_REMOVED")
