with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. State for Stamp Font Size
if "stampFontSize" not in code:
    code = code.replace(
        "const [dopDate, setDopDate] = useState<string>(\"\");",
        "const [dopDate, setDopDate] = useState<string>(\"\");\n  const [stampFontSize, setStampFontSize] = useState<number>(16);"
    )

# 2. Fix object-cover to object-contain so image is NOT forcefully zoomed/cropped
code = code.replace('className="w-full h-full object-cover block transition-all duration-150"', 'className="w-full h-full object-contain block transition-all duration-150"')

# 3. Dynamic Font Size on Preview Overlay
old_preview_stamp = """                  {/* लाइव Name & DOP स्ट्रिप (फोटो के निचले हिस्से पर साफ़ ओवरले) */}
                  {editorMode === "photo" && enableStamp && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white/95 border-t-2 border-slate-900 py-1 px-1.5 text-center select-none shadow-md z-20">
                      <p className="text-xs sm:text-sm font-black text-slate-950 uppercase leading-tight tracking-wide font-sans truncate">
                        {candidateName.trim() ? candidateName : "अभ्यर्थी का नाम"}
                      </p>
                      <p className="text-[10px] sm:text-xs font-black text-slate-900 leading-tight mt-0.5 tracking-wider">
                        DOP: {dopDate ? dopDate.split("-").reverse().join("-") : "DD-MM-YYYY"}
                      </p>
                    </div>
                  )}"""

new_preview_stamp = """                  {/* लाइव Name & DOP स्ट्रिप (फॉन्ट स्लाइडर से नियंत्रित) */}
                  {editorMode === "photo" && enableStamp && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t-2 border-slate-900 py-1 px-1.5 text-center select-none shadow-md z-20">
                      <p
                        style={{ fontSize: `${stampFontSize}px` }}
                        className="font-black text-slate-950 uppercase leading-tight tracking-wide font-sans truncate"
                      >
                        {candidateName.trim() ? candidateName : "अभ्यर्थी का नाम"}
                      </p>
                      <p
                        style={{ fontSize: `${Math.max(10, Math.round(stampFontSize * 0.82))}px` }}
                        className="font-black text-slate-800 leading-tight mt-0.5 tracking-wider font-mono"
                      >
                        DOP: {dopDate ? dopDate.split("-").reverse().join("-") : "DD-MM-YYYY"}
                      </p>
                    </div>
                  )}"""

if old_preview_stamp in code:
    code = code.replace(old_preview_stamp, new_preview_stamp)

# 4. Canvas me scale ke anusaar Stamp Font Size apply karna
old_canvas_font = """          const fontSize = Math.max(16, Math.round(stampH * 0.32));
          ctx.font = `bold ${fontSize}px sans-serif`;"""

new_canvas_font = """          // स्लाइडर के आधार पर कैनवास का अनुपातित फ़ॉन्ट साइज़
          const scaleFactor = cw / 413; // 413px पासपोर्ट बेस
          const fontSize = Math.round(stampFontSize * scaleFactor);
          ctx.font = `bold ${fontSize}px sans-serif`;"""

if old_canvas_font in code:
    code = code.replace(old_canvas_font, new_canvas_font)

# 5. Sidebar me Font Size Slider जोड़ना
old_sidebar_inputs = """                        <div>
                          <label className="block text-[11px] font-black text-slate-700 mb-1">
                            📅 फोटो की तारीख (DOP / Date):
                          </label>
                          <input
                            type="date"
                            value={dopDate}
                            onChange={(e) => setDopDate(e.target.value)}
                            className="w-full border-2 border-slate-300 focus:border-blue-600 p-2 rounded-lg text-xs bg-white font-bold text-slate-900 outline-none"
                          />
                        </div>"""

new_sidebar_inputs = """                        <div>
                          <label className="block text-[11px] font-black text-slate-700 mb-1">
                            📅 फोटो की तारीख (DOP / Date):
                          </label>
                          <input
                            type="date"
                            value={dopDate}
                            onChange={(e) => setDopDate(e.target.value)}
                            className="w-full border-2 border-slate-300 focus:border-blue-600 p-2 rounded-lg text-xs bg-white font-bold text-slate-900 outline-none"
                          />
                        </div>

                        {/* 🔤 फॉन्ट साइज़ कंट्रोल स्लाइडर */}
                        <div className="pt-1 border-t border-slate-200">
                          <div className="flex justify-between text-[11px] mb-0.5">
                            <span className="font-bold text-slate-700">🔤 नाम/तारीख का साइज़:</span>
                            <span className="font-black text-blue-700">{stampFontSize} px</span>
                          </div>
                          <input
                            type="range"
                            min="11"
                            max="26"
                            value={stampFontSize}
                            onChange={(e) => setStampFontSize(Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-pointer h-1.5"
                          />
                          <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                            <span>छोटा</span>
                            <span>मध्यम</span>
                            <span>बड़ा</span>
                          </div>
                        </div>"""

if old_sidebar_inputs in code:
    code = code.replace(old_sidebar_inputs, new_sidebar_inputs)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("ZOOM_FIXED_AND_FONT_SLIDER_ADDED")
