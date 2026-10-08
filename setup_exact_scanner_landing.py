with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# 'scanner_picker' वाले छोटे मोडल को स्मार्ट डॉक्यूमेंट स्कैनर के असली फ़ुल-पेज कार्ड लेआउट से बदलना
import re

exact_landing_jsx = """{/* ===================== दृश्य 2: स्मार्ट डॉक्यूमेंट स्कैनर का असली पेज ===================== */}
      {screen === "scanner_picker" && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-start items-center p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6 mt-4">
            
            {/* हेडर */}
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setScreen("id_home")}
                className="text-blue-600 text-xs font-bold flex items-center space-x-1 hover:underline"
              >
                <span>← वापस</span>
              </button>
              <h2 className="text-sm font-black text-slate-900 flex-1 text-center pr-8">
                {targetSlot === "front" ? "आगे का भाग (Front)" : "पीछे का भाग (Back)"} स्कैन करें
              </h2>
            </div>

            {/* कार्ड 1: कैमरा खोलें */}
            <div
              onClick={handleStartCamera}
              className="border-2 border-dashed border-blue-400 bg-blue-50/20 hover:bg-blue-50/50 rounded-3xl p-7 flex flex-col items-center justify-center cursor-pointer transition active:scale-98 text-center space-y-2 shadow-xs"
            >
              <div className="text-4xl">📸</div>
              <h3 className="text-base font-bold text-blue-600 mt-1">कैमरा खोलें</h3>
              <p className="text-xs text-slate-500 font-medium">सीधे कैमरे से काग़ज़ की फ़ोटो लें</p>
            </div>

            {/* कार्ड 2: गैलरी से चुनें */}
            <label className="border-2 border-dashed border-slate-300 bg-white hover:bg-slate-50 rounded-3xl p-7 flex flex-col items-center justify-center cursor-pointer transition active:scale-98 text-center space-y-2 block shadow-xs">
              <div className="text-4xl">📁</div>
              <h3 className="text-base font-bold text-slate-800 mt-1">गैलरी से चुनें</h3>
              <p className="text-xs text-slate-500 font-medium">गैलरी से फ़ोटो अपलोड करें</p>
              <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
            </label>

          </div>
        </div>
      )}"""

# पुराने स्क्रीन === "scanner_picker" वाले हिस्से को सटीक हिस्से से बदलना
pattern = r'\{\/\* ===================== दृश्य 2:[\s\S]*?\{\/\* ===================== लाइव कैमरा'
code = re.sub(pattern, exact_landing_jsx + "\n\n      {/* ===================== लाइव कैमरा", code)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("EXACT_LANDING_APPLIED")
