import os, glob, re

# स्मार्ट स्कैनर की सही फ़ाइल खोजना
target_file = None
possible_paths = [
    "src/app/tools/document-scanner/page.tsx",
    "src/app/tools/smart-document-scanner/page.tsx",
    "src/app/tools/scanner/page.tsx"
]

for p in possible_paths:
    if os.path.exists(p):
        target_file = p
        break

if not target_file:
    matches = glob.glob("src/app/**/scanner*/**/page.tsx", recursive=True)
    if matches:
        target_file = matches[0]

if not target_file:
    print("त्रुटि: स्मार्ट डॉक्यूमेंट स्कैनर फ़ाइल नहीं मिली!")
    exit(1)

print(f"फ़ाइल मिली: {target_file}")

with open(target_file, "r", encoding="utf-8") as f:
    code = f.read()

# नया Magic Color एक्सप्रेशन
magic_filter_expr = 'filterMode === "bw" ? "grayscale(100%) contrast(170%)" : filterMode === "gray" ? "grayscale(100%)" : filterMode === "magic" ? "contrast(135%) brightness(108%) saturate(125%)" : ""'

# अगर पुराना स्टाइल मौजूद है तो उसे रिप्लेस करना
if 'filterMode === "bw"' in code:
    code = re.sub(
        r'filterMode === "bw"[\s\S]*?filterMode === "gray"[\s\S]*?: ""',
        magic_filter_expr,
        code
    )
    with open(target_file, "w", encoding="utf-8") as f:
        f.write(code)
    print("SUCCESS: स्मार्ट डॉक्यूमेंट स्कैनर में Magic Color सफलतापूर्वक लागू हो गया!")
else:
    print("चेतावनी: filterMode पैटर्न नहीं मिला, कृपया फ़ाइल की जाँच करें।")

