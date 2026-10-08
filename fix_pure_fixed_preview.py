with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# दृश्य 1 को प्योर फिक्स्ड प्रीव्यू + बिहाइंड स्लाइडिंग टूलबॉक्स में बदलना
new_screen1 = """      {/* ===================== दृश्य 1: फिक्स्ड A4 प्रीव्यू + पीछे से स्लाइड होने वाला टूल बॉक्स ===================== */}
      {screen === "id_home" && (
        <div className="relative min-h-screen bg-slate-100 flex flex-col font-sans select-none">
          
          {/* ================= भाग 1: पूरी तरह फिक्स्ड (स्थिर) प्रीव्यू बॉक्स ================= */}
          <div className="fixed top-[52px] left-0 right-0 z-30 bg-slate-100/95 backdrop-blur-sm border-b-2 border-slate-300 shadow-md px-3 pt-2 pb-2">
            <div className="max-w-md mx-auto border-2 border-slate-900 rounded-2xl p-2 bg-white shadow-sm">
              
              {/* प्रीव्यू बॉक्स हेडर पट्टी */}
              <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200 text-xs">
                <span className="font-black text-slate-900 flex items-center gap-1.5 text-[11px]">
                  <span>📄</span> A4 शीट प्रीव्यू बॉक्स
                </span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                  {idLayoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"} • ~{targetKb} KB
                </span>
              </div>

              {/* A4 शीट स्टेज */}
              <div className="w-full flex items-center justify-center py-0.5">
                <div className="w-full max-w-[215px] aspect-[210/297] bg-white rounded-lg border-2 border-slate-800 shadow-sm p-1.5 flex flex-col items-center justify-between">
                  
                  {/* दोनों आईडी कार्ड स्लॉट्स */}
                  <div
                    className={`w-full flex justify-center gap-1 transition-all ${
                      idLayoutMode === "horizontal" ? "flex-row items-center pt-0.5" : "flex-col items-center pt-0.5 gap-1"
                    }`}
                  >
                    {/* आगे का भाग (Front) */}
                    <div
                      className={`aspect-[85.6/54] border border-slate-900 rounded overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${
                        idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                      }`}
                    >
                      {frontImage ? (
                        <img src={frontImage} alt="आगे का भाग" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] font-bold text-slate-400">आगे का भाग (Front)</span>
                      )}
                    </div>

                    {/* पीछे का भाग (Back) */}
                    <div
                      className={`aspect-[85.6/54] border border-slate-900 rounded overflow-hidden bg-slate-50 flex items-center justify-center transition-all ${
                        idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                      }`}
                    >
                      {backImage ? (
                        <img src={backImage} alt="पीछे का भाग" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[8px] font-bold text-slate-400">पीछे का भाग (Back)</span>
                      )}
                    </div>
                  </div>

                  {/* कटिंग लाइन */}
                  <div className="w-full pt-1 border-t border-dashed border-slate-300 text-center">
                    <span className="text-[7.5px] text-slate-400 font-medium">
                      ✂ शेष खाली A4 कागज़ (पुनः उपयोग योग्य)
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ================= भाग 2: स्लाइडिंग टूल बॉक्स (प्रीव्यू के पीछे से स्लाइड होगा) ================= */}
          {/* pt-[355px] दिया गया है ताकि शुरू में टूल्स प्रीव्यू के ठीक नीचे से दिखें और स्क्रॉल करने पर उसके पीछे चले जाएँ */}
          <div className="w-full max-w-md mx-auto px-3 pt-[355px] pb-32 space-y-3.5 z-10 relative">
            
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
code = re.sub(pattern, new_screen1 + "\n\n      {/* ===================== दृश्य 2:", code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("FIXED_PREVIEW_WITH_BEHIND_SLIDE_DEPLOYED")
