with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# पूरा टूल शेल्फ ब्लॉक तैयार करना - बिल्कुल स्क्रीनशॉट के क्रम और डिजाइन में
complete_sliding_tools = """          {/* ================= भाग 2: स्लाइडिंग टूल बॉक्स (सारे टूल्स स्क्रीनशॉट के अनुसार) ================= */}
          <div className="w-full max-w-md mx-auto px-3 pt-[355px] pb-32 space-y-3 z-10 relative">
            
            <div className="text-center pt-2">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
              <p className="text-[10px] font-bold text-blue-600 tracking-tight">
                ↓ टूल बॉक्स (ऊपर-नीचे स्लाइड करें)
              </p>
            </div>

            {/* 1. कार्ड स्लॉट बटन्स (आगे / पीछे) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectSlot("front")}
                className={`py-3.5 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                  frontImage
                    ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                    : "bg-white hover:bg-blue-50 border-blue-300 text-blue-900"
                }`}
              >
                <span className="text-xs font-black">
                  {frontImage ? "✓ आगे का भाग (Front)" : "📷 आगे का भाग (Front)"}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  {frontImage ? "बदलने के लिए स्कैन करें" : "+ स्कैन करें"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectSlot("back")}
                className={`py-3.5 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                  backImage
                    ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                    : "bg-white hover:bg-blue-50 border-blue-300 text-blue-900"
                }`}
              >
                <span className="text-xs font-black">
                  {backImage ? "✓ पीछे का भाग (Back)" : "📷 पीछे का भाग (Back)"}
                </span>
                <span className="text-[10px] font-bold text-blue-600">
                  {backImage ? "बदलने के लिए स्कैन करें" : "+ स्कैन करें"}
                </span>
              </button>
            </div>

            {/* 2. कार्ड लेआउट (अगल-बगल / ऊपर-नीचे) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-xs font-bold text-slate-800 block">कार्ड लेआउट</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIdLayoutMode("horizontal")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    idLayoutMode === "horizontal"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  अगल - बगल (मानक)
                </button>
                <button
                  type="button"
                  onClick={() => setIdLayoutMode("vertical")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    idLayoutMode === "vertical"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  ऊपर - नीचे
                </button>
              </div>
            </div>

            {/* 3. दिशा व घुमाव (Front / Back चयन टॉगल सहित) */}
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
            </div>

            {/* 4. फ़िल्टर्स (Magic Color, B&W Xerox, Grayscale, Original) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode("magic")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "magic"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>✨</span>
                  <span>Magic Color</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("bw")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "bw"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>📄</span>
                  <span>B&W Xerox</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("gray")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "gray"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>🔘</span>
                  <span>Grayscale</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("original")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "original"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>🌅</span>
                  <span>Original</span>
                </button>
              </div>
            </div>

            {/* 5. एडजस्टमेंट स्लाइडर्स (सफ़ेदी, कंट्रास्ट, कलर सैचुरेशन) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>सफ़ेदी / उजाला (Light)</span>
                  <span className="text-blue-600">{brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कंट्रास्ट / गहराई (Sharp)</span>
                  <span className="text-blue-600">{contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कलर सैचुरेशन (रंग का गाढ़ापन)</span>
                  <span className="text-blue-600">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>हल्का / फीका (-100%)</span>
                  <span>डिफ़ॉल्ट (0%)</span>
                  <span>गाढ़ा चटक (+100%)</span>
                </div>
              </div>
            </div>

            {/* 6. फ़ाइल क्वालिटी व साइज़ (10-300 KB, ⭐ मैक्स एचडी, कस्टम स्लाइडर) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">फ़ाइल क्वालिटी व साइज़:</label>
                <span className="text-[10px] bg-blue-600 text-white font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  लगभग {targetKb} KB
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50, 100, 200, 300].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => {
                      setTargetKb(kb);
                      setCustomKb(kb);
                      setIsMaxHd(false);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      targetKb === kb && !isMaxHd
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {kb} KB
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsMaxHd(!isMaxHd)}
                className={`w-full py-2.5 rounded-xl text-xs font-black transition border flex items-center justify-center gap-1.5 ${
                  isMaxHd
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <span>⭐</span>
                <span>मैक्स एचडी</span>
              </button>

              <div className="pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कस्टम साइज़ चुनें:</span>
                  <span className="text-blue-600 font-bold">{customKb} KB</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  value={customKb}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomKb(val);
                    setTargetKb(val);
                    setIsMaxHd(false);
                  }}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>10 KB</span>
                  <span>300 KB</span>
                  <span>600 KB</span>
                </div>
              </div>
            </div>

            {/* 7. डाउनलोड या शेयर करें (खड़ा A4) */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <label className="text-xs font-bold text-slate-800 block text-center">
                डाउनलोड या शेयर करें (खड़ा A4):
              </label>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>📤</span>
                <span>सीधे शेयर करें (WhatsApp / Bluetooth / Gmail)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>🖼️</span>
                <span>JPG डाउनलोड ({targetKb} KB)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>A4 PDF डाउनलोड</span>
              </button>
            </div>

          </div>"""

# पुराने टूलबॉक्स एरिया को पूरे नए ब्लॉक से बदलना
pattern = r'\{\/\* ================= भाग 2: स्लाइडिंग टूल बॉक्स[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\}'
code = re.sub(pattern, complete_sliding_tools + "\n        </div>\n      )}", code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SYNC_ALL_TOOLS_VERBATIM_COMPLETE")
