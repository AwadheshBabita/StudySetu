with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# 'दिशा व घुमाव' का सटीक बॉक्स (स्क्रीनशॉट के अनुसार)
exact_direction_block = """            {/* 3. दिशा व घुमाव (Front / Back चयन के साथ) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">दिशा व घुमाव</span>
                <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex items-center">
                  <button
                    type="button"
                    onClick={() => setActiveSideTool("front")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      activeSideTool === "front"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSideTool("back")}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition ${
                      activeSideTool === "back"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRotate("left")}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center bg-white hover:bg-slate-50 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-0.5">
                    <span>↺</span>
                    <span>-90°</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate("right")}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center bg-white hover:bg-slate-50 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-0.5">
                    <span>↻</span>
                    <span>+90°</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleMirror}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center bg-white hover:bg-slate-50 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                    <span>⇄</span>
                    <span>क्षैतिज</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleFlipV}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center bg-white hover:bg-slate-50 transition active:scale-95 shadow-xs"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1">
                    <span>⇅</span>
                    <span>लंबवत</span>
                  </div>
                </button>
              </div>
            </div>"""

# पुराने रोटेट और अलग टूल प्रभाव वाले हिस्से को इस सिंगल सटीक कार्ड से बदलना
pattern = r'\{\/\* टूल प्रभाव चयन[\s\S]*?\{\/\* 3\. दस्तावेज़ सीधा करें[\s\S]*?<\/div>\s*<\/div>'
if re.search(pattern, code):
    code = re.sub(pattern, exact_direction_block, code)
else:
    # बैकअप रिप्लेसमेंट
    pattern_alt = r'\{\/\* 3\. दस्तावेज़ सीधा करें[\s\S]*?<\/div>\s*<\/div>'
    code = re.sub(pattern_alt, exact_direction_block, code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("EXACT_DIRECTION_AND_ROTATE_APPLIED")
