with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. बॉर्डर की चौड़ाई को स्टूडियो स्टैंडर्ड के अनुसार बहुत बारीक (पतला) करना
old_border_draw = "ctx.lineWidth = Math.max(4, Math.round(cw * 0.012));"
new_border_draw = "ctx.lineWidth = Math.max(1, Math.round(cw * 0.0025)); // स्टूडियो 1-2px बारीक बॉर्डर"

if old_border_draw in code:
    code = code.replace(old_border_draw, new_border_draw)

# 2. प्रीव्यू में भी बॉर्डर को पतला (border-[1.5px]) करना
code = code.replace('border-4 border-slate-900 ring-2 ring-slate-900', 'border-[1.5px] border-slate-900')

# 3. फोटो बॉर्डर और घुमाएँ के साथ 3-कॉलम ग्रिड में "🎯 ऑटो फिट" बटन जोड़ना
old_border_section = """                  {/* 4. फोटो बॉर्डर और रोटेट */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHasBorder(!hasBorder)}
                      className={`py-1.5 rounded-lg border text-xs font-black cursor-pointer transition-all ${
                        hasBorder
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {hasBorder ? "✓ बॉर्डर लगा है" : "🔲 फोटो बॉर्डर"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-black cursor-pointer text-xs"
                    >
                      🔄 घुमाएँ ({rotation}°)
                    </button>
                  </div>"""

new_border_section = """                  {/* 4. फोटो बॉर्डर, रोटेट और ऑटो फिट */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setHasBorder(!hasBorder)}
                      className={`py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        hasBorder
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {hasBorder ? "✓ बॉर्डर ऑन" : "🔲 पतला बॉर्डर"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((r) => (r + 90) % 360)}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-black cursor-pointer text-[11px]"
                    >
                      🔄 घुमाएँ ({rotation}°)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode(fitMode === "fill" ? "fit" : "fill")}
                      className={`py-1.5 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        fitMode === "fill"
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                          : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                      }`}
                    >
                      {fitMode === "fill" ? "✓ फिटेड (नो पट्टी)" : "🎯 ऑटो फिट"}
                    </button>
                  </div>"""

if old_border_section in code:
    code = code.replace(old_border_section, new_border_section)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("BORDER_AND_FIT_BUTTON_UPDATED")
