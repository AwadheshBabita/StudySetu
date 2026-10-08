with open("src/app/tools/photo-crop/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 1. Preview Container ke andar Stamp ko Absolute Bottom Overlay banana
old_preview_block = """                  {/* लाइव Name & DOP स्ट्रिप */}
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

new_preview_block = """                  {/* लाइव Name & DOP स्ट्रिप (फोटो के निचले हिस्से पर साफ़ ओवरले) */}
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

if old_preview_block in code:
    code = code.replace(old_preview_block, new_preview_block)

# 2. Sidebar Inputs ko aur spasht aur aasan banana
old_stamp_inputs = """                        <div>
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
                        </div>"""

new_stamp_inputs = """                        <div>
                          <label className="block text-[11px] font-black text-slate-700 mb-1">
                            👤 अभ्यर्थी का नाम (Name):
                          </label>
                          <input
                            type="text"
                            placeholder="उदा. AMIT SHARMA"
                            value={candidateName}
                            onChange={(e) => setCandidateName(e.target.value)}
                            className="w-full border-2 border-slate-300 focus:border-blue-600 p-2 rounded-lg text-xs bg-white uppercase font-bold text-slate-900 outline-none"
                          />
                        </div>
                        <div>
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

if old_stamp_inputs in code:
    code = code.replace(old_stamp_inputs, new_stamp_inputs)

with open("src/app/tools/photo-crop/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("STAMP_POSITION_FIXED_PERFECTLY")
