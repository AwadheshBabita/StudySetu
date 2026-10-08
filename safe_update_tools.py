with open("src/app/tools/id-card-joiner-demo/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

import re

# 1. जरूरी स्टेट्स जोड़ना (अगर पहले से न हों)
extra_states = """  // स्कैनर टूल्स स्टेट्स
  const [activeSideTool, setActiveSideTool] = useState<"front" | "back">("front");
  const [filterMode, setFilterMode] = useState<"magic" | "bw" | "gray" | "original">("magic");
  const [brightness, setBrightness] = useState<number>(0);
  const [contrast, setContrast] = useState<number>(20);
  const [saturation, setSaturation] = useState<number>(0);
  const [customKb, setCustomKb] = useState<number>(250);
  const [isMaxHd, setIsMaxHd] = useState<boolean>(false);
  const [rotationAngles, setRotationAngles] = useState<{ front: number; back: number }>({ front: 0, back: 0 });
  const [flipH, setFlipH] = useState<{ front: boolean; back: boolean }>({ front: false, back: false });
  const [flipV, setFlipV] = useState<{ front: boolean; back: boolean }>({ front: false, back: false });
"""

if "const [filterMode" not in code:
    code = code.replace('const [targetKb, setTargetKb] = useState<number>(150);', 'const [targetKb, setTargetKb] = useState<number>(150);\n' + extra_states)

# रोटेट, फ्लिप और डाउनलोड हैंडलर्स
handlers = """  // रोटेट और फ्लिप हैंडलर्स
  const handleRotate = (dir: "left" | "right") => {
    const side = activeSideTool;
    setRotationAngles((prev) => ({
      ...prev,
      [side]: (prev[side] + (dir === "right" ? 90 : -90) + 360) % 360,
    }));
  };

  const handleMirror = () => {
    const side = activeSideTool;
    setFlipH((prev) => ({ ...prev, [side]: !prev[side] }));
  };

  const handleFlipV = () => {
    const side = activeSideTool;
    setFlipV((prev) => ({ ...prev, [side]: !prev[side] }));
  };

  const generateA4Canvas = (): HTMLCanvasElement => {
    const canvas = document.createElement("canvas");
    canvas.width = 2480;
    canvas.height = 3508;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cardW = 1012;
    const cardH = 638;
    const startY = 260;

    const renderCard = (imgSrc: string | null, x: number, y: number, side: "front" | "back") => {
      if (!imgSrc) return;
      const img = new Image();
      img.src = imgSrc;
      ctx.save();
      ctx.translate(x + cardW / 2, y + cardH / 2);
      ctx.rotate((rotationAngles[side] * Math.PI) / 180);
      ctx.scale(flipH[side] ? -1 : 1, flipV[side] ? -1 : 1);

      let filterStr = `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%)`;
      if (filterMode === "bw") filterStr += " grayscale(100%) contrast(160%)";
      if (filterMode === "gray") filterStr += " grayscale(100%)";
      ctx.filter = filterStr;

      ctx.drawImage(img, -cardW / 2, -cardH / 2, cardW, cardH);
      ctx.restore();

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, cardW, cardH);
    };

    if (idLayoutMode === "horizontal") {
      const gap = 80;
      const totalW = cardW * 2 + gap;
      const startX = (canvas.width - totalW) / 2;
      renderCard(frontImage, startX, startY, "front");
      renderCard(backImage, startX + cardW + gap, startY, "back");
    } else {
      const startX = (canvas.width - cardW) / 2;
      renderCard(frontImage, startX, startY, "front");
      renderCard(backImage, startX, startY + cardH + 70, "back");
    }

    return canvas;
  };

  const handleDownloadJpg = () => {
    const cvs = generateA4Canvas();
    const quality = isMaxHd ? 1.0 : Math.min(0.95, Math.max(0.4, targetKb / 400));
    const url = cvs.toDataURL("image/jpeg", quality);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ID_Card_A4_${targetKb}KB.jpg`;
    a.click();
  };

  const handleShare = async () => {
    const cvs = generateA4Canvas();
    cvs.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "ID_Card_A4.jpg", { type: "image/jpeg" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: "ID Card A4" });
      } else {
        handleDownloadJpg();
      }
    }, "image/jpeg", 0.9);
  };
"""

if "const handleRotate" not in code:
    code = code.replace('const handleSelectSlot =', handlers + '\n  const handleSelectSlot =')

# 2. टूल बॉक्स लेआउट तैयार करना: "अगल-बगल / ऊपर-नीचे" को सबसे ऊपर सुरक्षित रखते हुए बाकी टूल्स जोड़ना
full_tools_content = """            {/* 2. कार्ड लेआउट (अगल-बगल / ऊपर-नीचे) - पूर्णतः सुरक्षित */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
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

            {/* टूल प्रभाव चयन (आगे या पीछे का कार्ड) */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">एडजस्टमेंट लागू करें:</span>
              <div className="flex space-x-1.5">
                <button
                  type="button"
                  onClick={() => setActiveSideTool("front")}
                  className={`px-3 py-1 rounded-lg font-bold border transition ${
                    activeSideTool === "front" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  आगे (Front)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSideTool("back")}
                  className={`px-3 py-1 rounded-lg font-bold border transition ${
                    activeSideTool === "back" ? "bg-blue-600 text-white border-blue-600" : "bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  पीछे (Back)
                </button>
              </div>
            </div>

            {/* 3. दस्तावेज़ सीधा करें (Rotate & Flip) */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-xs font-bold text-slate-800 block">दस्तावेज़ सीधा करें (Rotate & Flip):</label>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRotate("left")}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center hover:bg-slate-50 transition active:scale-95"
                >
                  <div className="text-sm">↶</div>
                  <div className="text-[10px] font-bold text-slate-700 mt-0.5">90° बाएँ</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate("right")}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center hover:bg-slate-50 transition active:scale-95"
                >
                  <div className="text-sm">↷</div>
                  <div className="text-[10px] font-bold text-slate-700 mt-0.5">90° दाएँ</div>
                </button>
                <button
                  type="button"
                  onClick={handleMirror}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center hover:bg-slate-50 transition active:scale-95"
                >
                  <div className="text-sm">⇄</div>
                  <div className="text-[10px] font-bold text-slate-700 mt-0.5">मिरर पलटें</div>
                </button>
                <button
                  type="button"
                  onClick={handleFlipV}
                  className="py-2 px-1 border border-slate-200 rounded-xl text-center hover:bg-slate-50 transition active:scale-95"
                >
                  <div className="text-sm">⇅</div>
                  <div className="text-[10px] font-bold text-slate-700 mt-0.5">उल्टा-सीधा</div>
                </button>
              </div>
            </div>

            {/* 4. फ़िल्टर्स */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterMode("magic")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "magic" ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>✨</span>
                  <span>Magic Color</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("bw")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "bw" ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>📄</span>
                  <span>B&W Xerox</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("gray")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "gray" ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>🔘</span>
                  <span>Grayscale</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("original")}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    filterMode === "original" ? "bg-blue-600 text-white border-blue-600 shadow-xs" : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}
                >
                  <span>🌅</span>
                  <span>Original</span>
                </button>
              </div>
            </div>

            {/* 5. स्लाइडर्स */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>सफ़ेदी / उजाला (Light)</span>
                  <span className="text-blue-600">{brightness}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कंट्रास्ट / गहराई (Sharp)</span>
                  <span className="text-blue-600">{contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कलर सैचुरेशन (रंग का गाढ़ापन)</span>
                  <span className="text-blue-600">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>हल्का / फीका (-100%)</span>
                  <span>डिफ़ॉल्ट (0%)</span>
                  <span>गाढ़ा चटक (+100%)</span>
                </div>
              </div>
            </div>

            {/* 6. फ़ाइल क्वालिटी व साइज़ */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-800">फ़ाइल क्वालिटी व साइज़:</label>
                <span className="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full">
                  लगभग {targetKb} KB
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 50, 100, 200, 300].map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    onClick={() => {
                      setTargetKb(kb);
                      setIsMaxHd(false);
                    }}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition ${
                      targetKb === kb && !isMaxHd
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {kb} KB
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsMaxHd(!isMaxHd)}
                className={`w-full py-2 rounded-xl text-xs font-black transition border flex items-center justify-center gap-1.5 ${
                  isMaxHd
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-slate-50 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <span>⭐</span>
                <span>मैक्स एचडी</span>
              </button>

              <div className="pt-1">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>कस्टम साइज़ चुनें:</span>
                  <span className="text-blue-600">{customKb} KB</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="600"
                  value={customKb}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCustomKb(val);
                    setTargetKb(val);
                    setIsMaxHd(false);
                  }}
                  className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                  <span>10 KB</span>
                  <span>300 KB</span>
                  <span>600 KB</span>
                </div>
              </div>
            </div>

            {/* 7. डाउनलोड या शेयर करें */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <label className="text-xs font-bold text-slate-800 block text-center">
                डाउनलोड या शेयर करें (खड़ा A4):
              </label>

              <button
                type="button"
                onClick={handleShare}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>📤</span>
                <span>सीधे शेयर करें (WhatsApp / Bluetooth / Gmail)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>🖼️</span>
                <span>JPG डाउनलोड ({targetKb} KB)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJpg}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-98 flex items-center justify-center gap-2"
              >
                <span>📄</span>
                <span>A4 PDF डाउनलोड</span>
              </button>
            </div>"""

# सिर्फ पुराने लेआउट और KB हिस्से को इस पूरे सेट से बदलें
pattern_target = r'\{\/\* 2\. कार्ड लेआउट[\s\S]*?\{\/\* 3\. टारगेट KB साइज़[\s\S]*?<\/div>\s*<\/div>'
code = re.sub(pattern_target, full_tools_content, code)

# प्रीव्यू इमेज पर ट्रांसफॉर्म और फ़िल्टर लगाना
img_f_old = 'alt="आगे का भाग" className="w-full h-full object-cover"'
img_f_new = 'alt="आगे का भाग" className="w-full h-full object-cover" style={{ transform: `rotate(${rotationAngles.front}deg) scale(${flipH.front ? -1 : 1}, ${flipV.front ? -1 : 1})`, filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) ${filterMode === "bw" ? "grayscale(100%) contrast(160%)" : filterMode === "gray" ? "grayscale(100%)" : ""}` }}'

img_b_old = 'alt="पीछे का भाग" className="w-full h-full object-cover"'
img_b_new = 'alt="पीछे का भाग" className="w-full h-full object-cover" style={{ transform: `rotate(${rotationAngles.back}deg) scale(${flipH.back ? -1 : 1}, ${flipV.back ? -1 : 1})`, filter: `brightness(${100 + brightness}%) contrast(${100 + contrast}%) saturate(${100 + saturation}%) ${filterMode === "bw" ? "grayscale(100%) contrast(160%)" : filterMode === "gray" ? "grayscale(100%)" : ""}` }}'

code = code.replace(img_f_old, img_f_new)
code = code.replace(img_b_old, img_b_new)

with open("src/app/tools/id-card-joiner-demo/page.tsx", "w", encoding="utf-8") as f:
    f.write(code)

print("SAFE_UPDATE_SUCCESS")
