with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# 1. टूल बॉक्स से 'कागज़ का साइज़' सेक्शन पूरी तरह हटाना
pattern_paper_size = r'\{\/\* कागज़ का साइज़[\s\S]*?\{\/\* कार्ड लेआउट \*\/\}\s*<div className="space-y-1">'
replacement = '{/* कार्ड लेआउट (ऊपर शिफ्ट किया गया) */}\n            <div className="space-y-1">'
code = re.sub(pattern_paper_size, replacement, code)

# 2. स्टिकी व स्क्रॉलिंग फिक्स: स्क्रीन 1 (id_home) को पक्का टू-पार्ट स्प्लिट लॉक करना
old_id_home = r'\{\/\* ===================== दृश्य 1: मुख्य A4 प्रीव्यू और टूल बॉक्स ===================== \*\/\}[\s\S]*?\{\/\* ===================== दृश्य 2:'

new_id_home = """{/* ===================== दृश्य 1: मुख्य A4 प्रीव्यू और टूल बॉक्स ===================== */}
      {screen === "id_home" && (
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-full h-full flex flex-col overflow-hidden bg-slate-200">
          
          {/* ================= भाग 1: प्रीव्यू बॉक्स (STRICTLY STICKY / FIXED TOP 48%) ================= */}
          <div className="h-[48vh] min-h-[310px] shrink-0 bg-slate-100 border-b-2 border-slate-300 flex flex-col p-2 items-center justify-between shadow-md z-20">
            <div className="w-full max-w-sm flex items-center justify-between text-[11px] font-bold px-1 mb-1">
              <span className="text-slate-700">
                शीट: A4 • {idLayoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"}
              </span>
              <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px]">
                टारगेट: ~{targetKb} KB में सुरक्षित
              </span>
            </div>

            {/* A4 शीट बॉक्स */}
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden py-1">
              <div className="h-full aspect-[210/297] bg-white rounded-xl border-2 border-slate-800 shadow-lg p-2.5 flex flex-col items-center justify-between">
                
                <div
                  className={`w-full flex justify-center gap-1.5 transition-all ${
                    idLayoutMode === "horizontal" ? "flex-row items-center pt-1" : "flex-col items-center pt-1 gap-1.5"
                  }`}
                >
                  {/* फ्रंट कार्ड स्लॉट */}
                  <div
                    className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center transition-all ${
                      idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                    }`}
                  >
                    {frontImage ? (
                      <img src={frontImage} alt="Front Card" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">आगे का भाग (Front)</span>
                    )}
                  </div>

                  {/* बैक कार्ड स्लॉट */}
                  <div
                    className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center transition-all ${
                      idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                    }`}
                  >
                    {backImage ? (
                      <img src={backImage} alt="Back Card" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">पीछे का भाग (Back)</span>
                    )}
                  </div>
                </div>

                <div className="w-full pt-1 border-t border-dashed border-slate-300 text-center">
                  <span className="text-[9px] text-slate-400 font-medium">
                    ✂ शेष खाली A4 कागज़ (पुनः उपयोग योग्य)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= भाग 2: टूल बॉक्स (INDEPENDENTLY SLIDING / SCROLLING) ================= */}
          <div className="flex-1 overflow-y-auto bg-white p-3 space-y-3.5 scroll-smooth overscroll-contain z-10">
            <div className="max-w-sm mx-auto space-y-3.5 pb-20">
              
              <div className="text-center pt-1">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
                <p className="text-[10px] font-bold text-blue-600 tracking-tight">
                  ↓ टूल बॉक्स (ऊपर-नीचे स्लाइड करें)
                </p>
              </div>

              {/* 1. कार्ड स्लॉट बटन्स (आगे / पीछे) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectSlot("front")}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                    frontImage
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900"
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
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                    backImage
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900"
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

              {/* 2. कार्ड लेआउट (ऊपर खिसकाया गया) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">कार्ड लेआउट</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIdLayoutMode("horizontal")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                      idLayoutMode === "horizontal"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200"
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
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    ऊपर - नीचे
                  </button>
                </div>
              </div>

              {/* 3. टारगेट KB साइज़ */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">टारगेट साइज़ (KB)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[100, 150, 200].map((kb) => (
                    <button
                      key={kb}
                      type="button"
                      onClick={() => setTargetKb(kb)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                        targetKb === kb
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      ~{kb} KB
                    </button>
                  ))}
                </div>
              </div>

              {/* नए टूल्स (ब्राइटनेस, शार्पनेस, मार्जिन आदि) के लिए खाली सुरक्षित जगह */}

            </div>
          </div>

        </div>
      )}

      {/* ===================== दृश्य 2:"""

code = re.sub(old_id_home, new_id_home, code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("FIXED_STICKY_AND_LAYOUT_SUCCESS")
