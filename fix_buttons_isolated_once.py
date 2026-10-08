with open("src/app/tools/id-card-joiner/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. सुनिश्चित करें कि तीनों स्टेट्स मौजूद हैं
if "const [isDownloadingJpg, setIsDownloadingJpg]" not in code:
    anchor = "const [frontCropped, setFrontCropped]"
    idx = code.find(anchor)
    if idx != -1:
        states = """const [isDownloadingJpg, setIsDownloadingJpg] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  """
        code = code[:idx] + states + code[idx:]

# 2. JSX में बटनों का पूरा कंटेनर ढूंढकर उसे 100% अलग-अलग स्टेट्स के साथ रिप्लेस करना
import re

# यह पैटर्न JPG, PDF और Share के पूरे बटन ब्लॉक को पकड़ता है
btn_container_pattern = r'(<button[\s\S]*?handleDownloadJpg[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?handleDownloadPdf[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?handleShare[\s\S]*?<\/button>)'

new_buttons_jsx = """<button
              type="button"
              disabled={isDownloadingJpg || isDownloadingPdf || isSharing}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadJpg(e);
              }}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDownloadingJpg ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>JPG बन रहा है...</span>
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
              disabled={isDownloadingJpg || isDownloadingPdf || isSharing}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadPdf(e);
              }}
              className="flex-1 py-3 px-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-bold rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  <span>PDF बन रहा है...</span>
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
              disabled={isDownloadingJpg || isDownloadingPdf || isSharing}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShare(e);
              }}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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

match = re.search(btn_container_pattern, code)
if match:
    code = code[:match.start()] + new_buttons_jsx + code[match.end():]
    print("JSX_BUTTONS_REPLACED_CLEANLY")
else:
    print("FALLBACK_REPLACE")
    # अगर रेगेक्स मैच न हो तो स्ट्रिंग रिप्लेसमेंट
    code = code.replace("onClick={handleDownloadJpg}", 'type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadJpg(e); }}')
    code = code.replace("onClick={handleDownloadPdf}", 'type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDownloadPdf(e); }}')
    code = code.replace("onClick={handleShare}", 'type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(e); }}')

with open("src/app/tools/id-card-joiner/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("BUTTON_ISOLATION_COMPLETE")
