filepath = "src/app/tools/id-card-joiner-demo/page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    code = f.read()

# सटीक नया फ़िल्टर स्ट्रिंग जिसमें Magic Color का 35% गहरा कंट्रास्ट + 8% पेपर ब्राइटनिंग + 25% कलर बूस्ट शामिल है
magic_filter_expr = 'filterMode === "bw" ? "grayscale(100%) contrast(170%)" : filterMode === "gray" ? "grayscale(100%)" : filterMode === "magic" ? "contrast(135%) brightness(108%) saturate(125%)" : ""'

# फ्रंट इमेज स्टाइल को बदलना
old_front_filter = 'filterMode === "bw" ? "grayscale(100%) contrast(160%)" : filterMode === "gray" ? "grayscale(100%)" : ""'

if old_front_filter in code:
    code = code.replace(old_front_filter, magic_filter_expr)
    print("SUCCESS: Magic Color फ़िल्टर कोड में सफलतापूर्वक बदल दिया गया!")
else:
    # यदि स्ट्रिंग में थोड़ा भी अंतर हो तो सीधे img स्टाइल ब्लॉक को नया रूप देना
    import re
    code = re.sub(
        r'filterMode === "bw"[\s\S]*?filterMode === "gray"[\s\S]*?: ""',
        magic_filter_expr,
        code
    )
    print("SUCCESS_REGEX: रेगेक्स द्वारा Magic Color फ़िल्टर सफलतापूर्वक लगा दिया गया!")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(code)

