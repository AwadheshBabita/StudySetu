with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. State for Auto Mode Toggle
if "isAutoEnhanced" not in code:
    code = code.replace(
        "const [contrast, setContrast] = useState<number>(100);",
        "const [contrast, setContrast] = useState<number>(100);\n  const [isAutoEnhanced, setIsAutoEnhanced] = useState<boolean>(false);"
    )

# 2. Toggle Auto Enhance Function
auto_toggle_func = """  const toggleAutoEnhance = () => {
    if (!isAutoEnhanced) {
      setBrightness(112);
      setContrast(120);
      setSaturation(118);
      setIsAutoEnhanced(true);
    } else {
      setBrightness(100);
      setContrast(100);
      setSaturation(100);
      setIsAutoEnhanced(false);
    }
  };"""

if "toggleAutoEnhance" not in code:
    code = code.replace("const switchSizeAndCrop =", auto_toggle_func + "\n\n  const switchSizeAndCrop =")

# 3. Preview Frame me Live Stamp Box ensure karna
preview_strip_markup = """                  {/* लाइव Name & DOP स्ट्रिप */}
                  {editorMode === "photo" && enableStamp && (
                    <div className="w-full bg-white border-t-2 border-slate-900 py-1.5 px-2 text-center select-none shrink-0 shadow-xs">
                      {candidateName.trim() ? (
                        <p className="text-xs sm:text-sm font-black text-black uppercase leading-tight tracking-wider font-mono">
                          {candidateName}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm font-black text-slate-400 uppercase leading-tight tracking-wider">
                          नाम यहाँ दिखेगा
                        </p>
                      )}
                      <p className="text-[11px] sm:text-xs font-bold text-black leading-tight mt-0.5 font-mono">
                        DOP: {dopDate ? dopDate.split("-").reverse().join("-") : ""}
                      </p>
                    </div>
                  )}"""

# Purane stamp box ko clean preview se replace karna
import re
code = re.sub(
    r'\{editorMode === "photo" && enableStamp && \(.*?\)\s*\}',
    preview_strip_markup,
    code,
    flags=re.DOTALL
)

# 4. 'बारीक एडजस्टमेंट्स' ki jagah 'मैनुअल' aur Auto Toggle Button
old_adjust_header = """<div className="flex items-center justify-between">
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
                </div>"""

new_adjust_header = """<div className="flex items-center justify-between">
                  <span className="text-slate-900 font-black text-[11px]">🎚️ मैनुअल ट्यून (स्लाइडर्स):</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={toggleAutoEnhance}
                      className={`text-[10px] px-2.5 py-1 rounded-md font-black transition-all cursor-pointer border ${
                        isAutoEnhanced
                          ? "bg-amber-500 text-white border-amber-600 shadow-2xs"
                          : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                      }`}
                    >
                      {isAutoEnhanced ? "✓ ऑटो ऑन (रीसेट करें)" : "✨ ऑटो टोन"}
                    </button>
                  </div>
                </div>"""

if old_adjust_header in code:
    code = code.replace(old_adjust_header, new_adjust_header)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("STAMP_AND_AUTO_TOGGLE_APPLIED")
