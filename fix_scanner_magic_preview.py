import re

scanner_file = "src/app/tools/document-scanner/page.tsx"

try:
    with open(scanner_file, "r", encoding="utf-8") as f:
        code = f.read()

    # स्मार्ट स्कैनर में जहां फ़िल्टर स्ट्रिंग प्रीव्यू में लग रही है, वहां Magic Color का विजिबल CSS बूस्ट जोड़ना
    old_pattern = r'filterMode === "bw"\s*\?\s*"grayscale\(100%\)\s*contrast\(160%\)"\s*:\s*filterMode === "gray"\s*\?\s*"grayscale\(100%\)"\s*:\s*""'
    new_style = 'filterMode === "bw" ? "grayscale(100%) contrast(170%)" : filterMode === "gray" ? "grayscale(100%)" : filterMode === "magic" ? "contrast(135%) brightness(108%) saturate(125%)" : ""'

    if re.search(old_pattern, code):
        code = re.sub(old_pattern, new_style, code)
        with open(scanner_file, "w", encoding="utf-8") as f:
            f.write(code)
        print("SCANNER_MAGIC_PREVIEW_UPDATED_SUCCESSFULLY")
    else:
        # अगर थोड़ा सा सिंटेक्स अलग हो तो सीधे स्टाइल स्ट्रिंग चेक करना
        alt_pattern = r'filterMode === "magic"\s*\?\s*""\s*:'
        if re.search(alt_pattern, code):
            code = re.sub(alt_pattern, 'filterMode === "magic" ? "contrast(135%) brightness(108%) saturate(125%)" :', code)
            with open(scanner_file, "w", encoding="utf-8") as f:
                f.write(code)
            print("SCANNER_MAGIC_PREVIEW_ALT_UPDATED")
        else:
            print("SCANNER_PATTERN_NOT_FOUND_CHECK_CODE")

except Exception as e:
    print("ERROR:", e)
