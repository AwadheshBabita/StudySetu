with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. साइज़ बटन से setStep("crop") हटाना ताकि प्रीव्यू स्क्रीन न छूटे
code = code.replace('applyPreset(item.id as AspectPreset);\n                            setStep("crop");', 'applyPreset(item.id as AspectPreset);')
code = code.replace('applyPreset(item.id as AspectPreset); setStep("crop");', 'applyPreset(item.id as AspectPreset);')

# 2. पूरा कॉमन एडजस्टमेंट व डाउनलोड पैनल तैयार करना
common_panel = """
              {/* 🎨 टोन व एडजस्टमेंट स्लाइडर्स (फोटो व डॉक्यूमेंट दोनों में सक्रिय) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-black text-[11px]">🎚️ बारीक एडजस्टमेंट्स:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBrightness(115);
                      setContrast(125);
                      setSaturation(120);
                    }}
                    className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-black hover:bg-amber-200 cursor-pointer"
                  >
                    ✨ ऑटो ग्लो
                  </button>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-slate-700">☀️ ब्राइटनेस (उजाला):</span>
                    <span className="font-black text-blue-700">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-slate-700">🌓 कॉन्ट्रास्ट (शार्पनेस):</span>
                    <span className="font-black text-blue-700">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="160"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="font-bold text-slate-700">🌈 सैचुरेशन (रंग गाढ़ा):</span>
                    <span className="font-black text-blue-700">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                </div>
              </div>

              {/* 🎯 डाउनलोड क्वालिटी / KB साइज़ कंट्रोल (कॉमन) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-[11px] font-black text-slate-800">
                  🎯 डाउनलोड क्वालिटी व KB साइज़:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setKbMode("hd");
                    }}
                    className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                      kbMode === "hd"
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    ⭐ Full HD (मूल)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setKbMode("custom");
                    }}
                    className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                      kbMode === "custom"
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-300"
                    }`}
                  >
                    🎯 कस्टम KB
                  </button>
                </div>

                <div className={`space-y-1 transition-opacity ${kbMode === "hd" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  <div className="flex justify-between text-[11px]">
                    <span className="font-bold text-slate-600">टारगेट साइज़:</span>
                    <span className="font-black text-blue-700">{customKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="800"
                    step="5"
                    disabled={kbMode === "hd"}
                    value={customKb}
                    onChange={(e) => setCustomKb(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                    <span>10 KB</span>
                    <span>400 KB</span>
                    <span>800 KB</span>
                  </div>
                </div>
              </div>

              {/* डाउनलोड बटन्स */}
              <div className="pt-2 space-y-2 border-t border-slate-200">
                <button
                  onClick={handleDownloadJpg}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>📥</span>
                  <span>JPG डाउनलोड ({kbMode === "hd" ? "Full HD" : `${customKb} KB`})</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleDownloadPdf}
                    className="py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>📄</span>
                    <span>PDF डाउनलोड</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2 bg-slate-800 hover:bg-slate-900 active:scale-98 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>🔗</span>
                    <span>शेयर</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
"""

# अगर डाउनलोड बटन्स कट गए थे तो साइडबार के बंद होने से पहले इसे जोड़ें
if "handleDownloadJpg" not in code or "ब्राइटनेस" not in code or "कॉन्ट्रास्ट" not in code:
    # डॉक्यूमेंट ब्लॉक के अंत को ढूँढकर उसके बाद कॉमन पैनल लगाएं
    doc_end_idx = code.rfind('{editorMode === "document" && (')
    if doc_end_idx != -1:
        # doc block ka matching closing khojein
        close_doc = code.find('</div>\n              )}', doc_end_idx)
        if close_doc != -1:
            code = code[:close_doc + 23] + common_panel
            with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
                f.write(code)
            print("PANEL_RESTORED_SUCCESSFULLY")
        else:
            print("CLOSE_DOC_NOT_FOUND")
    else:
        print("DOC_BLOCK_NOT_FOUND")
else:
    with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
        f.write(code)
    print("SETSTEP_REMOVED_SAFELY")
