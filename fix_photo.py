import re

file_path = "src/app/tools/photo-crop/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. फोटो मोड का साइडबार ब्लॉक तैयार करना
photo_sidebar_ui = """              {/* 📷 फोटो मोड टूल्स */}
              {editorMode === "photo" && (
                <div className="space-y-3 text-xs font-bold text-slate-700">
                  {/* 1. फोटो साइज़ मानक */}
                  <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
                    <span className="text-blue-950 font-black text-[11px]">📐 फोटो साइज़ मानक:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: "passport", label: "पासपोर्ट (3.5×4.5)" },
                        { id: "4:6", label: "🖼 4×6 इंच" },
                        { id: "5:7", label: "🖼 5×7 इंच" },
                        { id: "8:10", label: "🖼 8×10 इंच" },
                        { id: "a4", label: "📄 A4 फोटो" },
                        { id: "1:1", label: "⏹️ 1:1 स्क्वायर" },
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
                              ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. AI बैकग्राउंड रिमूवर और 10 कलर्स */}
                  <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-black">✨ AI बैकग्राउंड</span>
                      {bgRemovedUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setBgRemovedUrl(null);
                            setBgColor("transparent");
                          }}
                          className="text-[10px] text-red-600 hover:underline cursor-pointer"
                        >
                          मूल बैकग्राउंड लाएं
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveBackground}
                      disabled={isRemovingBg}
                      className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black rounded-lg shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                    >
                      <span>{isRemovingBg ? "बैकग्राउंड हटाया जा रहा है..." : "✨ 1-क्लिक बैकग्राउंड हटाएँ (AI)"}</span>
                    </button>

                    <div>
                      <span className="text-[11px] font-black text-slate-700 block mb-1">
                        🎨 स्टूडियो बैकग्राउंड कलर्स (10 शेड्स):
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {[
                          { name: "पारदर्शी", color: "transparent", border: "border-slate-300" },
                          { name: "शुद्ध सफेद", color: "#ffffff", border: "border-slate-300" },
                          { name: "हल्का नीला", color: "#93c5fd", border: "border-blue-300" },
                          { name: "पासपोर्ट नीला", color: "#2563eb", border: "border-blue-700" },
                          { name: "गहरा नेवी", color: "#1e3a8a", border: "border-blue-950" },
                          { name: "हल्का लाल", color: "#fca5a5", border: "border-red-300" },
                          { name: "स्टूडियो ग्रे", color: "#e2e8f0", border: "border-slate-300" },
                          { name: "हल्का हरा", color: "#86efac", border: "border-green-300" },
                          { name: "क्रीम येलो", color: "#fef08a", border: "border-amber-300" },
                          { name: "डार्क ग्रे", color: "#475569", border: "border-slate-600" },
                        ].map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            title={item.name}
                            style={{ backgroundColor: item.color !== "transparent" ? item.color : undefined }}
                            onClick={() => setBgColor(item.color)}
                            className={`h-7 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                              item.border
                            } ${item.color === "transparent" ? "bg-slate-100" : ""} ${
                              bgColor === item.color ? "ring-2 ring-blue-600 scale-105" : "hover:scale-105"
                            }`}
                          >
                            {bgColor === item.color && (
                              <span className="text-[10px] font-black text-slate-800">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. नाम व फोटो की तारीख (DOP) स्टैम्प */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={enableStamp}
                        onChange={(e) => setEnableStamp(e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-black text-slate-900">
                        🏷️ नाम और तारीख (DOP) स्टैम्प जोड़ें
                      </span>
                    </label>

                    {enableStamp && (
                      <div className="space-y-2 pt-1.5 border-t border-slate-200">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            अभ्यर्थी का नाम:
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. RAHUL KUMAR"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="w-full border border-slate-300 p-1.5 rounded-lg text-xs bg-white uppercase font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                            फोटो की तारीख (DOP):
                          </label>
                          <input
                            type="date"
                            value={dopDate}
                            onChange={(e) => setDopDate(e.target.value)}
                            className="w-full border border-slate-300 p-1.5 rounded-lg text-xs bg-white font-bold"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. फोटो बॉर्डर और रोटेट */}
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
                  </div>
                </div>
              )}"""

# रिप्लेसमेंट: पुराने फोटो मोड ब्लॉक को नए से बदलना
pattern = r'\{\/\* 📷 फोटो मोड टूल्स \*\/\}.*?(?=\{\/\* 📄 डॉक्यूमेंट मोड टूल्स \*\/\}|\{editorMode === "document")'
if re.search(pattern, code, re.DOTALL):
    code = re.sub(pattern, photo_sidebar_ui + "\n\n              ", code, flags=re.DOTALL)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("PHOTO_MODE_BUTTONS_UPDATED")
else:
    print("PATTERN_NOT_FOUND")
