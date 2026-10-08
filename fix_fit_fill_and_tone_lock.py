with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. State for fitMode (fit vs fill) and tuneMode (auto vs manual)
if "fitMode" not in code:
    code = code.replace(
        "const [isAutoEnhanced, setIsAutoEnhanced] = useState<boolean>(false);",
        """const [isAutoEnhanced, setIsAutoEnhanced] = useState<boolean>(false);
  const [tuneMode, setTuneMode] = useState<"manual" | "auto">("manual");
  const [fitMode, setFitMode] = useState<"fit" | "fill">("fit");"""
    )

# 2. Update toggleAutoEnhance to toggle tuneMode
new_toggle_func = """  const toggleAutoEnhance = () => {
    if (tuneMode !== "auto") {
      setTuneMode("auto");
      setIsAutoEnhanced(true);
      setBrightness(112);
      setContrast(120);
      setSaturation(118);
    } else {
      setTuneMode("manual");
      setIsAutoEnhanced(false);
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
    }
  };

  const handleManualSliderChange = (setter: (val: number) => void, val: number) => {
    if (tuneMode === "auto") {
      setTuneMode("manual");
      setIsAutoEnhanced(false);
    }
    setter(val);
  };"""

import re
code = re.sub(r'const toggleAutoEnhance = \(\) => \{.*?\}\s*\};', new_toggle_func, code, flags=re.DOTALL)

# 3. Canvas rendering logic with fitMode support
old_scale_calc = """        const isRot = rotation % 180 !== 0;
        const srcW = isRot ? img.height : img.width;
        const srcH = isRot ? img.width : img.height;
        const scale = Math.max(cw / srcW, ch / srcH);
        const renderW = img.width * scale;
        const renderH = img.height * scale;"""

new_scale_calc = """        const isRot = rotation % 180 !== 0;
        const srcW = isRot ? img.height : img.width;
        const srcH = isRot ? img.width : img.height;
        const scale = fitMode === "fill" 
          ? Math.max(cw / srcW, ch / srcH) 
          : Math.min(cw / srcW, ch / srcH);
        const renderW = img.width * scale;
        const renderH = img.height * scale;"""

if old_scale_calc in code:
    code = code.replace(old_scale_calc, new_scale_calc)

# 4. Preview image styling for fit vs fill
old_preview_img_tag = 'className="w-full h-full object-contain block transition-all duration-150"'
new_preview_img_tag = 'className={`w-full h-full block transition-all duration-150 ${fitMode === "fill" ? "object-cover" : "object-contain"}`}'

if old_preview_img_tag in code:
    code = code.replace(old_preview_img_tag, new_preview_img_tag)

# 5. Add Fit / Fill toggle buttons in the Top Preview Bar
old_top_bar = """<div className="flex items-center gap-2">
                  <button
                    onClick={() => setPhotoOrientation(o => o === "portrait" ? "landscape" : "portrait")}
                    className="text-xs bg-white border border-slate-300 px-2 py-1 rounded-lg font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {photoOrientation === "portrait" ? "↕️ पोर्ट्रेट" : "↔️ लैंडस्केप"}
                  </button>
                  <button
                    onClick={() => setStep("crop")}
                    className="text-xs text-blue-600 hover:underline font-bold"
                  >
                    ↩ दोबारा क्रॉप
                  </button>
                </div>"""

new_top_bar = """<div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {/* फिट vs फिल टॉगल */}
                  <div className="flex bg-white rounded-lg p-0.5 border border-slate-300 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFitMode("fit")}
                      className={`text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer ${
                        fitMode === "fit" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      🛡️ फिट (मार्जिन)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode("fill")}
                      className={`text-[11px] font-black px-2 py-0.5 rounded transition-all cursor-pointer ${
                        fitMode === "fill" ? "bg-blue-600 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      📐 पूरा भरें (Fill)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPhotoOrientation(o => o === "portrait" ? "landscape" : "portrait")}
                    className="text-[11px] bg-white border border-slate-300 px-2 py-1 rounded-lg font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    {photoOrientation === "portrait" ? "↕️ पोर्ट्रेट" : "↔️ लैंडस्केप"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("crop")}
                    className="text-[11px] text-blue-600 hover:underline font-bold px-1"
                  >
                    ↩ दोबारा क्रॉप
                  </button>
                </div>"""

if old_top_bar in code:
    code = code.replace(old_top_bar, new_top_bar)

# 6. Manual sliders lock when Auto Tone is ON
old_sliders_panel = """              {/* 🎨 मैनुअल ट्यून व एडजस्टमेंट स्लाइडर्स (कॉमन) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-black text-[11px]">🎚️ मैनुअल ट्यून (स्लाइडर्स):</span>
                  <button
                    type="button"
                    onClick={toggleAutoEnhance}
                    className={`text-[10px] px-2.5 py-1 rounded-md font-black transition-all cursor-pointer border ${
                      isAutoEnhanced
                        ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                        : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    {isAutoEnhanced ? "✓ ऑटो ऑन (रीसेट)" : "✨ ऑटो टोन"}
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
              </div>"""

new_sliders_panel = """              {/* 🎨 टोन एडजस्टमेंट्स: ऑटो vs मैनुअल (एक समय पर केवल एक सक्रिय) */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setTuneMode("manual");
                        setIsAutoEnhanced(false);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-black border transition-all cursor-pointer ${
                        tuneMode === "manual"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      🎚️ मैनुअल
                    </button>
                    <button
                      type="button"
                      onClick={toggleAutoEnhance}
                      className={`text-[11px] px-2.5 py-1 rounded-lg font-black border transition-all cursor-pointer ${
                        tuneMode === "auto"
                          ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                          : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {tuneMode === "auto" ? "✓ ऑटो टोन ऑन" : "✨ ऑटो टोन"}
                    </button>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {tuneMode === "auto" ? "ऑटो एक्टिव" : "मैनुअल एक्टिव"}
                  </span>
                </div>

                <div className={`space-y-2 transition-all ${tuneMode === "auto" ? "opacity-40 pointer-events-none" : "opacity-100"}`}>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-slate-700">☀️ ब्राइटनेस (उजाला):</span>
                      <span className="font-black text-blue-700">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="160"
                      disabled={tuneMode === "auto"}
                      value={brightness}
                      onChange={(e) => handleManualSliderChange(setBrightness, Number(e.target.value))}
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
                      disabled={tuneMode === "auto"}
                      value={contrast}
                      onChange={(e) => handleManualSliderChange(setContrast, Number(e.target.value))}
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
                      disabled={tuneMode === "auto"}
                      value={saturation}
                      onChange={(e) => handleManualSliderChange(setSaturation, Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>"""

if old_sliders_panel in code:
    code = code.replace(old_sliders_panel, new_sliders_panel)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("FIT_FILL_AND_TONE_LOCK_UPDATED")
