with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# स्मार्ट डॉक्यूमेंट स्कैनर के ओरिजिनल STEP 3 लेआउट पैटर्न के अनुसार हुबहू सेट करना
scanner_style_screen1 = """      {/* ===================== दृश्य 1: स्मार्ट डॉक्यूमेंट स्कैनर जैसा हुबहू लेआउट ===================== */}
      {screen === "id_home" && (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none pb-12">
          
          {/* BOX 1: ऊपर का स्टिकी प्रिव्यू बॉक्स (स्मार्ट स्कैनर जैसा STICKY TOP) */}
          <div className="w-full sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm p-2 sm:p-3">
            <div className="max-w-md mx-auto border-2 border-slate-900 rounded-2xl p-2.5 bg-white shadow-md">
              
              {/* प्रिव्यू बॉक्स हेडर पट्टी */}
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200 text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>📄</span> मुख्य A4 प्रीव्यू बॉक्स
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                  {idLayoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"} • ~{targetKb} KB
                </span>
              </div>

              {/* A4 शीट प्रिव्यू स्टेज */}
              <div className="w-full flex items-center justify-center py-0.5">
                <div className="w-full max-w-[240px] aspect-[210/297] bg-white rounded-lg border-2 border-slate-800 shadow-sm p-2 flex flex-col items-center justify-between">
                  
                  {/* दोनों कार्ड स्लॉट्स */}
                  <div
                    className={`w-full flex justify-center gap-1.5 transition-all ${
                      idLayoutMode === "horizontal" ? "flex-row items-center pt-1" : "flex-col items-center pt-1 gap-1"
                    }`}
                  >
                    {/* फ्रंट कार्ड स्लॉट */}
                    <div
                      className={`aspect-[85.6/54] border border-slate-900 rounded overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${
                        idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                      }`}
                    >
                      {frontImage ? (
                        <img src={frontImage} alt="आगे का भाग" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400">आगे का भाग (Front)</span>
                      )}
                    </div>

                    {/* बैक कार्ड स्लॉट */}
                    <div
                      className={`aspect-[85.6/54] border border-slate-900 rounded overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${
                        idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                      }`}
                    >
                      {backImage ? (
                        <img src={backImage} alt="पीछे का भाग" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400">पीछे का भाग (Back)</span>
                      )}
                    </div>
                  </div>

                  {/* कटिंग लाइन */}
                  <div className="w-full pt-1 border-t border-dashed border-slate-300 text-center">
                    <span className="text-[8px] text-slate-400 font-medium">
                      ✂ शेष खाली A4 कागज़ (पुनः उपयोग योग्य)
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* BOX 2: नीचे का टूल बॉक्स (स्मार्ट स्कैनर जैसा स्वतंत्र स्क्रॉलिंग शेल्फ) */}
          <div className="w-full max-w-md mx-auto p-3 space-y-3.5">
            
            <div className="text-center pt-1">
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
              <p className="text-[10px] font-bold text-blue-600 tracking-tight">
                ↓ टूल बॉक्स (नीचे स्लाइड करें)
              </p>
            </div>

            {/* 1. कार्ड स्लॉट बटन्स (आगे / पीछे) */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSelectSlot("front")}
                className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
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
                className={`py-3 px-2 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
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
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-800 block">कार्ड लेआउट</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIdLayoutMode("horizontal")}
                  className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                    idLayoutMode === "horizontal"
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-100 text-slate-700 border-slate-200"
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
                      : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  ऊपर - नीचे
                </button>
              </div>
            </div>

            {/* 3. टारगेट KB साइज़ */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-800 block">टारगेट साइज़ (KB)</label>
              <div className="grid grid-cols-3 gap-2">
                {[100, 150, 200].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => setTargetKb(kb)}
                    className={`py-2 text-xs font-bold rounded-xl border transition ${
                      targetKb === kb
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    ~{kb} KB
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}"""

pattern = r'\{\/\* ===================== दृश्य 1:[\s\S]*?\{\/\* ===================== दृश्य 2:'
code = re.sub(pattern, scanner_style_screen1 + "\n\n      {/* ===================== दृश्य 2:", code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SMART_SCANNER_LAYOUT_APPLIED")
