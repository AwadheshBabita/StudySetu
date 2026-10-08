import re

file_path = "src/app/tools/photo-crop/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# डॉक्यूमेंट मोड का पूरा सक्रिय ब्लॉक
doc_sidebar_ui = """              {/* 📄 डॉक्यूमेंट मोड टूल्स */}
              {editorMode === "document" && (
                <div className="space-y-3 text-xs font-bold text-slate-700">
                  {/* 1. डॉक्यूमेंट साइज मानक */}
                  <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1.5">
                    <span className="text-emerald-950 font-black text-[11px]">📐 डॉक्यूमेंट साइज़ मानक:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "a4", label: "📄 A4 पोर्ट्रेट" },
                        { id: "4:6", label: "📑 A4 लैंडस्केप" },
                        { id: "card", label: "💳 पहचान पत्र / पैन" },
                        { id: "signature", label: "✍️ हस्ताक्षर (Sign)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            applyPreset(item.id as AspectPreset);
                            setStep("crop");
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                            preset === item.id
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                              : "bg-white text-slate-800 border-slate-300 hover:bg-emerald-50"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. स्कैन फिल्टर्स (ऑटो क्लीन सहित) */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-slate-900 font-black text-[11px]">✨ स्कैन व प्रिंट फिल्टर्स:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(125);
                          setContrast(160);
                          setSaturation(90);
                          setIsBw(false);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        ⚡ ऑटो क्लीन
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(120);
                          setContrast(165);
                          setSaturation(0);
                          setIsBw(true);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        📄 B&W ज़ेरॉक्स
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(105);
                          setContrast(120);
                          setSaturation(0);
                          setIsBw(true);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        📑 ग्रे-स्केल
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBrightness(100);
                          setContrast(100);
                          setSaturation(100);
                          setIsBw(false);
                        }}
                        className="py-1.5 px-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-black shadow-2xs cursor-pointer"
                      >
                        🎨 ओरिजिनल रंग
                      </button>
                    </div>
                  </div>

                  {/* 3. रोटेशन व फ्लिप */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-slate-900 font-black text-[11px]">🔄 ओरिएंटेशन व फ्लिप:</span>
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        type="button"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 font-black text-[11px] cursor-pointer"
                      >
                        🔄 90° घुमाएँ
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipH((v) => !v)}
                        className={`py-1.5 rounded-lg border font-black text-[11px] cursor-pointer transition-all ${
                          flipH ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-white text-slate-800 border-slate-300"
                        }`}
                      >
                        ↔️ मिरर H
                      </button>
                      <button
                        type="button"
                        onClick={() => setFlipV((v) => !v)}
                        className={`py-1.5 rounded-lg border font-black text-[11px] cursor-pointer transition-all ${
                          flipV ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs" : "bg-white text-slate-800 border-slate-300"
                        }`}
                      >
                        ↕️ फ्लिप V
                      </button>
                    </div>
                  </div>
                </div>
              )}"""

pattern = r'\{\/\* 📄 डॉक्यूमेंट मोड टूल्स \*\/\}.*?(?=\{\/\* 🎨 टोन व एडजस्टमेंट|\{editorMode === "document" && \()'
if re.search(pattern, code, re.DOTALL):
    code = re.sub(pattern, doc_sidebar_ui + "\n\n              ", code, flags=re.DOTALL)
else:
    # यदि पुराना कमेंट नहीं मिला तो editorMode === "document" वाले ब्लॉक को बदलें
    pattern_alt = r'\{editorMode === "document" && \(.*?\)\s*\}'
    code = re.sub(pattern_alt, doc_sidebar_ui, code, count=1, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(code)

print("DOC_MODE_BUTTONS_UPDATED")
