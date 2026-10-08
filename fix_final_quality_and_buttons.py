with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. 300 DPI अल्ट्रा-शार्प कैनवास स्केल (ताकि फोटो फटे नहीं)
# generateSheetCanvas(1.0) को बदलकर 300 DPI स्केल (2.5x) करना
code = code.replace("generateSheetCanvas(1.0)", "generateSheetCanvas(2.5)")

# 2. JSX में बटनों की लिंकिंग को 100% अलग-अलग करना
# पहले पुराने बटन कंटेनर को हटाकर पूरी तरह आज़ाद बटन लगाना
import re

btn_pattern = r'(<button[\s\S]*?handleDownloadJpg[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?handleDownloadPdf[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?handleShare[\s\S]*?<\/button>)'

isolated_buttons = """<button
              type="button"
              disabled={isDownloadingJpg}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadJpg(e);
              }}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDownloadingJpg ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>JPG तैयार हो रहा...</span>
                </>
              ) : (
                <>
                  <span>🖼️</span>
                  <span>JPG डाउनलोड</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isDownloadingPdf}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadPdf(e);
              }}
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>PDF तैयार हो रहा...</span>
                </>
              ) : (
                <>
                  <span>📄</span>
                  <span>PDF डाउनलोड</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isSharing}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare(e);
              }}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSharing ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>शेयर हो रहा...</span>
                </>
              ) : (
                <>
                  <span>🔗</span>
                  <span>शेयर करें</span>
                </>
              )}
            </button>"""

match = re.search(btn_pattern, code)
if match:
    code = code[:match.start()] + isolated_buttons + code[match.end():]
    print("BUTTONS_ISOLATED_INDEPENDENTLY")

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("HIGH_DPI_AND_ISOLATION_APPLIED")
