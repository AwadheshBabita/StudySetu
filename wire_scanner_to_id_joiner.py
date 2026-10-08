with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# स्टेट जोड़ना (frontImage, backImage, targetSlot, idLayoutMode)
state_needle = 'export default function DocumentScannerPage() {'
if state_needle not in code:
    # नाम कुछ भी हो सकता है
    import re
    state_needle = re.search(r'export default function \w+\(\) \{', code).group(0)

id_states = f"""{state_needle}
  // ID CARD JOINER SLOTS & WORKFLOW
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [targetSlot, setTargetSlot] = useState<"front" | "back">("front");
  const [idLayoutMode, setIdLayoutMode] = useState<"horizontal" | "vertical">("horizontal");
  const [showIdWorkspace, setShowIdWorkspace] = useState<boolean>(true);
"""

code = code.replace(state_needle, id_states, 1)

# runCropToA4 के अंदर: क्रॉप पूरा होते ही फ़ोटो को frontImage या backImage में डालना
old_crop_end = 'setStep("filter");'
new_crop_end = """if (showIdWorkspace) {
        const croppedResult = outCanvas.toDataURL("image/jpeg", 0.95);
        if (targetSlot === "front") {
          setFrontImage(croppedResult);
        } else {
          setBackImage(croppedResult);
        }
        setShowIdWorkspace(true);
        setStep("capture");
        setImageSrc(null);
        setProcessing(false);
        return;
      }
      setStep("filter");"""

code = code.replace(old_crop_end, new_crop_end, 1)

# मुख्य UI के शीर्ष पर ID Card A4 Preview + Front/Back ट्रिगर जोड़ना
old_return_top = 'return ('
new_id_top = '''return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* ================= ID CARD JOINER WORKSPACE ================= */}
      {showIdWorkspace && step === "capture" && !imageSrc && (
        <div className="h-screen w-screen overflow-hidden flex flex-col">
          {/* ऊपरी A4 शीट प्रीव्यू बॉक्स (स्थिर) */}
          <div className="h-[52%] shrink-0 bg-slate-100 border-b-2 border-slate-300 flex flex-col p-2 items-center justify-between shadow-xs relative z-10">
            <div className="w-full max-w-sm flex items-center justify-between text-[11px] font-bold px-1 mb-1">
              <span className="text-slate-700">
                शीट: A4 • {idLayoutMode === "horizontal" ? "अगल-बगल" : "ऊपर-नीचे"}
              </span>
              <span className="text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded text-[10px]">
                आईडी कार्ड प्रीव्यू
              </span>
            </div>

            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
              <div className="h-full aspect-[210/297] bg-white rounded-xl border-2 border-slate-800 shadow-md p-2 flex flex-col items-center justify-between">
                <div className={`w-full flex justify-center gap-1.5 transition-all ${
                  idLayoutMode === "horizontal" ? "flex-row items-center pt-1" : "flex-col items-center pt-1 gap-1.5"
                }`}>
                  {/* फ्रंट स्लॉट */}
                  <div className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center ${
                    idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                  }`}>
                    {frontImage ? (
                      <img src={frontImage} alt="Front" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">आगे का भाग (Front)</span>
                    )}
                  </div>

                  {/* बैक स्लॉट */}
                  <div className={`aspect-[85.6/54] border border-slate-900 rounded-md overflow-hidden bg-white flex items-center justify-center ${
                    idLayoutMode === "horizontal" ? "w-[48%]" : "w-[66%]"
                  }`}>
                    {backImage ? (
                      <img src={backImage} alt="Back" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">पीछे का भाग (Back)</span>
                    )}
                  </div>
                </div>

                <div className="w-full pt-1 border-t border-dashed border-slate-300 text-center">
                  <span className="text-[9px] text-slate-400 font-medium">✂ शेष खाली A4 कागज़</span>
                </div>
              </div>
            </div>
          </div>

          {/* निचला टूल बॉक्स: फ्रंट और बैक बटन जो सीधे स्मार्ट स्कैनर खोलेंगे */}
          <div className="flex-1 overflow-y-auto bg-white p-3 space-y-3">
            <div className="max-w-sm mx-auto space-y-3 pb-8">
              <div className="text-center pt-1">
                <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-1"></div>
                <p className="text-[10px] font-bold text-blue-600">↓ टूल्स (नीचे स्क्रॉल करें)</p>
              </div>

              {/* 2 मुख्य स्लॉट बटन */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setTargetSlot("front");
                    setShowIdWorkspace(false);
                    setStep("capture");
                  }}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                    frontImage ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900"
                  }`}
                >
                  <span className="text-xs font-black">{frontImage ? "✓ आगे का भाग (Front)" : "📷 आगे का भाग (Front)"}</span>
                  <span className="text-[10px] font-bold text-blue-600">{frontImage ? "बदलने के लिए स्कैन करें" : "+ स्कैन करें"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTargetSlot("back");
                    setShowIdWorkspace(false);
                    setStep("capture");
                  }}
                  className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition shadow-xs active:scale-95 ${
                    backImage ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900"
                  }`}
                >
                  <span className="text-xs font-black">{backImage ? "✓ पीछे का भाग (Back)" : "📷 पीछे का भाग (Back)"}</span>
                  <span className="text-[10px] font-bold text-blue-600">{backImage ? "बदलने के लिए स्कैन करें" : "+ स्कैन करें"}</span>
                </button>
              </div>

              {/* लेआउट मोड */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">कार्ड लेआउट</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIdLayoutMode("horizontal")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                      idLayoutMode === "horizontal" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    अगल - बगल (मानक)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIdLayoutMode("vertical")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl transition border ${
                      idLayoutMode === "vertical" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    ऊपर - नीचे
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SMART SCANNER CAPTURE & CROP PAGES ================= */}
      {(!showIdWorkspace || step !== "capture" || imageSrc) && (
        <div className="relative z-50">
          <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between text-xs">
            <span className="font-bold">
              {targetSlot === "front" ? "आगे का भाग (Front) स्कैन करें" : "पीछे का भाग (Back) स्कैन करें"}
            </span>
            <button
              onClick={() => {
                setShowIdWorkspace(true);
                setStep("capture");
                setImageSrc(null);
              }}
              className="bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700"
            >
              ✕ वापस आईडी कार्ड पर जाएँ
            </button>
          </div>
'''

code = code.replace(old_return_top, new_id_top, 1)

# फ़ाइल के अंत में बंद करने वाला div जोड़ना
code = code.rstrip()
if code.endswith(');'):
    code = code[:-2] + '        </div>\n      )}\n    </div>\n  );'
elif code.endswith('}'):
    code = code[:-1] + '        </div>\n      )}\n    </div>\n  );\n}'

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("EXACT_SCANNER_WIRED_TO_ID_JOINER_SUCCESS")
