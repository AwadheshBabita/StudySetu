import re

with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. सुनिश्चित करें कि प्रीव्यू इमेज में Saturation, Name/DOP स्ट्रिप रेंडर हो
preview_find = """              {/* फोटो फ्रेम */}"""

# चेक करें कि साइडबार का पूरा स्ट्रक्चर सही क्रम और वर्किंग बटनों के साथ रिप्लेस हो
# हम editorMode === "photo" और editorMode === "document" और कॉमन डाउनलोडेबल एरिया को एक बार में परफेक्ट वायर करेंगे

sidebar_marker_start = '{/* दायाँ टूल्स पैनल */}'
sidebar_marker_end = '{/* डाउनलोड बटन्स */}'

# पहले चेक करते हैं कि फाइल में ये मार्कर्स हैं
if sidebar_marker_start in code:
    print("Found sidebar start")
else:
    print("Sidebar start not found!")

