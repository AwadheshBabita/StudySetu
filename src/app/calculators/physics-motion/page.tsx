"use client";

import React, { useState } from "react";
import Link from "next/link";

type CategoryId = "mechanics" | "gravitation" | "optics" | "electricity" | "waves";

interface ToolItem {
  id: string;
  name: string;
  desc: string;
}

const CATEGORIES: { id: CategoryId; name: string; icon: string; tools: ToolItem[] }[] = [
  {
    id: "mechanics",
    name: "यांत्रिकी व गति (Mechanics)",
    icon: "🏃",
    tools: [
      { id: "motion-eq", name: "1. गति के समीकरण", desc: "v = u + at, s = ut + ½at²" },
      { id: "force-newton", name: "2. बल व संवेग (F = ma)", desc: "न्यूटन का द्वितीय नियम व संवेग" },
      { id: "work-energy", name: "3. कार्य, गतिज व स्थितिज ऊर्जा", desc: "W = Fs, KE = ½mv², PE = mgh" },
    ],
  },
  {
    id: "gravitation",
    name: "गुरुत्वाकर्षण व दाब",
    icon: "🌍",
    tools: [
      { id: "grav-force", name: "1. गुरुत्वाकर्षण बल", desc: "F = G(m₁m₂)/r² न्यूटन नियम" },
      { id: "weight-mass", name: "2. भार व द्रव्यमान (W = mg)", desc: "पृथ्वी व चंद्रमा पर भार तुलना" },
      { id: "pressure-density", name: "3. दाब एवं घनत्व", desc: "P = F/A तथा घनत्व = M/V" },
    ],
  },
  {
    id: "optics",
    name: "प्रकाशिकी (Optics)",
    icon: "🔍",
    tools: [
      { id: "lens-mirror", name: "1. दर्पण व लेंस सूत्र", desc: "1/f = 1/v ± 1/u व आवर्धन" },
      { id: "lens-power", name: "2. लेंस की क्षमता (P = 1/f)", desc: "डायोप्टर (Dioptre) में क्षमता" },
    ],
  },
  {
    id: "electricity",
    name: "विद्युत (Electricity)",
    icon: "⚡",
    tools: [
      { id: "ohms-law", name: "1. ओम का नियम (V = IR)", desc: "वोल्टेज, धारा व प्रतिरोध" },
      { id: "resistors-combo", name: "2. प्रतिरोधों का संयोजन", desc: "श्रेणीक्रम (Series) व समांतरक्रम (Parallel)" },
      { id: "electric-heat", name: "3. जूल का ऊष्मा नियम व पावर", desc: "H = I²Rt एवं P = VI" },
    ],
  },
  {
    id: "waves",
    name: "ऊष्मा, ध्वनि व तरंग",
    icon: "🔥",
    tools: [
      { id: "temp-convert", name: "1. तापमान रूपांतरण", desc: "सेल्सियस ⇄ फारेनहाइट ⇄ केल्विन" },
      { id: "wave-speed", name: "2. ध्वनि व तरंग चाल", desc: "v = fλ (चाल = आवृत्ति × तरंगदैर्घ्य)" },
    ],
  },
];

export default function PhysicsSolverHub() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("mechanics");
  const [activeTool, setActiveTool] = useState<string>("motion-eq");

  const [val1, setVal1] = useState("0");
  const [val2, setVal2] = useState("9.8");
  const [val3, setVal3] = useState("5");
  const [activeInputName, setActiveInputName] = useState<string>("val1");
  const [solution, setSolution] = useState<any>(null);

  const handleReset = () => {
    setVal1("");
    setVal2("");
    setVal3("");
    setSolution(null);
  };

  const handleCategoryChange = (cat: CategoryId) => {
    setActiveCategory(cat);
    const targetCat = CATEGORIES.find((c) => c.id === cat);
    if (targetCat && targetCat.tools.length > 0) {
      setActiveTool(targetCat.tools[0].id);
      loadToolDefaults(targetCat.tools[0].id);
    }
    setSolution(null);
  };

  const loadToolDefaults = (toolId: string) => {
    if (toolId === "motion-eq") { setVal1("0"); setVal2("9.8"); setVal3("5"); }
    else if (toolId === "force-newton") { setVal1("10"); setVal2("2.5"); setVal3(""); }
    else if (toolId === "work-energy") { setVal1("50"); setVal2("10"); setVal3("5"); }
    else if (toolId === "grav-force") { setVal1("100"); setVal2("200"); setVal3("2"); }
    else if (toolId === "weight-mass") { setVal1("60"); setVal2(""); setVal3(""); }
    else if (toolId === "pressure-density") { setVal1("500"); setVal2("2"); setVal3(""); }
    else if (toolId === "lens-mirror") { setVal1("20"); setVal2("-30"); setVal3(""); }
    else if (toolId === "lens-power") { setVal1("25"); setVal2(""); setVal3(""); }
    else if (toolId === "ohms-law") { setVal1("12"); setVal2("4"); setVal3(""); }
    else if (toolId === "resistors-combo") { setVal1("6"); setVal2("3"); setVal3(""); }
    else if (toolId === "electric-heat") { setVal1("2"); setVal2("10"); setVal3("5"); }
    else if (toolId === "temp-convert") { setVal1("37"); setVal2(""); setVal3(""); }
    else if (toolId === "wave-speed") { setVal1("256"); setVal2("1.33"); setVal3(""); }
  };

  const handleSolve = () => {
    const n1 = parseFloat(val1) || 0;
    const n2 = parseFloat(val2) || 0;
    const n3 = parseFloat(val3) || 0;

    if (activeTool === "motion-eq") {
      const u = n1, a = n2, t = n3;
      const v = u + a * t;
      const s = u * t + 0.5 * a * t * t;
      setSolution({
        title: "गति के समीकरण हल (Equations of Motion)",
        formula: "v = u + at | s = ut + ½at² | v² = u² + 2as",
        step1: `u = ${u} m/s, a = ${a} m/s², t = ${t} s`,
        step2: `1. v = ${u} + (${a} × ${t}) = ${v.toFixed(2)} m/s\n` +
          `2. s = (${u} × ${t}) + ½(${a})(${t})² = ${s.toFixed(2)} m`,
        result: `अंतिम वेग v = ${v.toFixed(2)} m/s | विस्थापन s = ${s.toFixed(2)} m`,
        trick: `💡 विरामावस्था से चलने पर प्रारंभिक वेग u = 0 होता है।`,
      });
      return;
    } else if (activeTool === "force-newton") {
      const m = n1, a = n2;
      setSolution({
        title: "न्यूटन का द्वितीय गति नियम (F = ma)",
        formula: "बल (F) = द्रव्यमान (m) × त्वरण (a) | संवेग p = mv",
        step1: `द्रव्यमान m = ${m} kg, त्वरण a = ${a} m/s²`,
        step2: `F = ${m} × ${a} = ${(m * a).toFixed(2)} N`,
        result: `कुल बल (Force) = ${(m * a).toFixed(2)} न्यूटन (N)`,
        trick: `💡 1 न्यूटन = 10⁵ डाइन (CGS इकाई)।`,
      });
      return;
    } else if (activeTool === "work-energy") {
      const m = n1, v = n2, h = n3;
      const ke = 0.5 * m * v * v;
      const pe = m * 9.8 * h;
      setSolution({
        title: "गतिज एवं स्थितिज ऊर्जा हल",
        formula: "KE = ½mv² | PE = mgh",
        step1: `द्रव्यमान m = ${m} kg, वेग v = ${v} m/s, ऊँचाई h = ${h} m`,
        step2: `KE = ½ × ${m} × (${v})² = ${ke.toFixed(2)} J | PE = ${m} × 9.8 × ${h} = ${pe.toFixed(2)} J`,
        result: `गतिज ऊर्जा = ${ke.toFixed(2)} J | स्थितिज ऊर्जा = ${pe.toFixed(2)} J`,
        trick: `💡 वेग दोगुना होने पर गतिज ऊर्जा 4 गुना हो जाती है।`,
      });
      return;
    } else if (activeTool === "grav-force") {
      const m1 = n1, m2 = n2, r = n3;
      const G = 6.674e-11;
      const f = (G * m1 * m2) / (r * r);
      setSolution({
        title: "सार्वत्रिक गुरुत्वाकर्षण बल हल",
        formula: "F = G(m₁m₂) / r² (G = 6.674 × 10⁻¹¹)",
        step1: `m₁ = ${m1} kg, m₂ = ${m2} kg, दूरी r = ${r} m`,
        step2: `F = (6.674×10⁻¹¹ × ${m1} × ${m2}) / (${r})² = ${f.toExponential(4)} N`,
        result: `गुरुत्वाकर्षण बल = ${f.toExponential(4)} N`,
        trick: `💡 दूरी दोगुनी होने पर बल 1/4 रह जाता है।`,
      });
      return;
    } else if (activeTool === "weight-mass") {
      const mass = n1;
      setSolution({
        title: "भार व द्रव्यमान तुलना (पृथ्वी बनाम चंद्रमा)",
        formula: "W = mg (पृथ्वी पर g = 9.8, चंद्रमा पर g = 1.625)",
        step1: `द्रव्यमान m = ${mass} kg`,
        step2: `पृथ्वी पर W = ${mass} × 9.8 = ${(mass * 9.8).toFixed(2)} N | चंद्रमा पर = ${(mass * 1.625).toFixed(2)} N`,
        result: `पृथ्वी पर भार = ${(mass * 9.8).toFixed(2)} N | चंद्रमा पर = ${(mass * 1.625).toFixed(2)} N`,
        trick: `💡 चंद्रमा पर भार पृथ्वी के भार का ठीक 1/6 भाग होता है।`,
      });
      return;
    } else if (activeTool === "pressure-density") {
      const f = n1, a = n2;
      setSolution({
        title: "दाब हल (P = F / A)",
        formula: "दाब (P) = बल (F) / क्षेत्रफल (A)",
        step1: `F = ${f} N, A = ${a} m²`,
        step2: `P = ${f} / ${a} = ${(f / a).toFixed(2)} Pa`,
        result: `दाब = ${(f / a).toFixed(2)} पास्कल (N/m²)`,
        trick: `💡 क्षेत्रफल कम होने पर दाब बढ़ जाता है (जैसे सुई की नोक)।`,
      });
      return;
    } else if (activeTool === "lens-mirror") {
      const f = n1, u = n2;
      const invV = (1 / f) + (1 / u);
      const v = 1 / invV;
      setSolution({
        title: "लेंस एवं दर्पण सूत्र हल",
        formula: "लेंस सूत्र: 1/f = 1/v - 1/u",
        step1: `f = ${f} cm, u = ${u} cm`,
        step2: `1/v = 1/${f} + 1/${u} ⇒ v = ${v.toFixed(2)} cm`,
        result: `प्रतिबिंब दूरी v = ${v.toFixed(2)} cm | आवर्धन m = ${Math.abs(-v / u).toFixed(2)}`,
        trick: `💡 उत्तल लेंस की फोकस दूरी धनात्मक (+) और अवतल की ऋणात्मक (-) होती है।`,
      });
      return;
    } else if (activeTool === "lens-power") {
      const fCm = n1;
      const power = fCm !== 0 ? 100 / fCm : 0;
      setSolution({
        title: "लेंस की क्षमता (Power of Lens)",
        formula: "P = 100 / f (सेमी में) = 1 / f (मीटर में)",
        step1: `फोकस दूरी f = ${fCm} cm`,
        step2: `P = 100 / ${fCm} = ${power.toFixed(2)} D`,
        result: `लेंस क्षमता P = ${power.toFixed(2)} डायोप्टर (D)`,
        trick: `💡 +D दूरदृष्टि (उत्तल) तथा -D निकटदृष्टि (अवतल) दोष के लिए होता है।`,
      });
      return;
    } else if (activeTool === "ohms-law") {
      const v = n1, r = n2;
      const i = r > 0 ? v / r : 0;
      setSolution({
        title: "ओम का नियम (V = IR)",
        formula: "V = IR ⇒ I = V / R | P = VI",
        step1: `V = ${v} V, R = ${r} Ω`,
        step2: `I = ${v} / ${r} = ${i.toFixed(2)} A | P = ${v} × ${i.toFixed(2)} = ${(v * i).toFixed(2)} W`,
        result: `धारा I = ${i.toFixed(2)} A | शक्ति P = ${(v * i).toFixed(2)} वॉट`,
        trick: `💡 नियत ताप पर धारा विभवांतर के समानुपाती होती है।`,
      });
      return;
    } else if (activeTool === "resistors-combo") {
      const r1 = n1, r2 = n2;
      const rS = r1 + r2;
      const rP = (r1 * r2) / (r1 + r2);
      setSolution({
        title: "प्रतिरोधों का संयोजन (Series & Parallel)",
        formula: "श्रेणी क्रम: R_s = R₁ + R₂ | समांतर क्रम: 1/R_p = 1/R₁ + 1/R₂",
        step1: `R₁ = ${r1} Ω, R₂ = ${r2} Ω`,
        step2: `R_series = ${r1} + ${r2} = ${rS} Ω | R_parallel = (${r1}×${r2})/(${r1}+${r2}) = ${rP.toFixed(2)} Ω`,
        result: `श्रेणी क्रम तुल्य = ${rS.toFixed(2)} Ω | समांतर क्रम तुल्य = ${rP.toFixed(2)} Ω`,
        trick: `💡 घरों की वायरिंग समांतर क्रम में की जाती है।`,
      });
      return;
    } else if (activeTool === "electric-heat") {
      const i = n1, r = n2, t = n3;
      const h = i * i * r * t;
      setSolution({
        title: "जूल का तापीय नियम (Joule's Law)",
        formula: "H = I²Rt जूल (J)",
        step1: `I = ${i} A, R = ${r} Ω, t = ${t} s`,
        step2: `H = (${i})² × ${r} × ${t} = ${h.toFixed(2)} J`,
        result: `उत्पन्न ऊष्मा H = ${h.toFixed(2)} जूल (${(h / 4.184).toFixed(2)} कैलोरी)`,
        trick: `💡 धारा दोगुनी करने पर ऊष्मा 4 गुना बढ़ जाती है।`,
      });
      return;
    } else if (activeTool === "temp-convert") {
      const c = n1;
      const f = (c * 9) / 5 + 32;
      const k = c + 273.15;
      setSolution({
        title: "तापमान पैमाना रूपांतरण",
        formula: "C/5 = (F - 32)/9 = (K - 273.15)/5",
        step1: `सेल्सियस मान = ${c} °C`,
        step2: `F = (${c} × 9/5) + 32 = ${f.toFixed(2)} °F | K = ${c} + 273.15 = ${k.toFixed(2)} K`,
        result: `${c} °C = ${f.toFixed(2)} °F = ${k.toFixed(2)} K`,
        trick: `💡 -40° पर सेल्सियस और फारेनहाइट दोनों बराबर होते हैं।`,
      });
      return;
    } else if (activeTool === "wave-speed") {
      const freq = n1, lambda = n2;
      setSolution({
        title: "ध्वनि व तरंग चाल (v = fλ)",
        formula: "चाल (v) = आवृत्ति (f) × तरंगदैर्घ्य (λ)",
        step1: `f = ${freq} Hz, λ = ${lambda} m`,
        step2: `v = ${freq} × ${lambda} = ${(freq * lambda).toFixed(2)} m/s`,
        result: `तरंग चाल v = ${(freq * lambda).toFixed(2)} m/s`,
        trick: `💡 माध्यम बदलने पर आवृत्ति (f) कभी नहीं बदलती।`,
      });
      return;
    }
  };

  const currCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <Link href="/calculators" className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
          ← सभी कैलकुलेटर हब पर वापस
        </Link>
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          Physics Master Suite
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">भौतिक विज्ञान स्टेप-बाय-स्टेप सॉल्वर</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          यांत्रिकी, गुरुत्वाकर्षण, प्रकाशिकी, विद्युत व तरंगों के 12 संपूर्ण संख्यात्मक हल।
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`p-2.5 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1 text-center ${
              activeCategory === cat.id
                ? "bg-indigo-600 text-white border-2 border-indigo-600 shadow-md scale-102"
                : "bg-white text-slate-900 border-2 border-slate-700 hover:border-indigo-600 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <span className="text-xl">{cat.icon}</span>
            <span className="leading-tight">{cat.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6 p-2.5 bg-slate-100 rounded-2xl border border-slate-300">
        {currCat?.tools.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setActiveTool(t.id);
              loadToolDefaults(t.id);
              setSolution(null);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTool === t.id
                ? "bg-white text-indigo-700 shadow-sm border-2 border-indigo-400 font-black scale-102"
                : "text-slate-700 hover:text-slate-950 font-bold"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="bg-white border-2 border-slate-300 rounded-3xl p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {currCat?.tools.find((t) => t.id === activeTool)?.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {currCat?.tools.find((t) => t.id === activeTool)?.desc}
            </p>
          </div>
          <button onClick={handleReset} className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 self-start sm:self-auto">
            🔄 रीसेट करें
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1">मान 1:</label>
            <input
              type="text"
              value={val1}
              onChange={(e) => setVal1(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>
          {activeTool !== "weight-mass" && activeTool !== "lens-power" && activeTool !== "temp-convert" && (
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">मान 2:</label>
              <input
                type="text"
                value={val2}
                onChange={(e) => setVal2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          )}
          {(activeTool === "motion-eq" || activeTool === "work-energy" || activeTool === "grav-force" || activeTool === "electric-heat") && (
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">मान 3:</label>
              <input
                type="text"
                value={val3}
                onChange={(e) => setVal3(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSolve}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all active:scale-98"
          >
            🚀 स्टेप-बाय-स्टेप हल देखें (Solve)
          </button>
        </div>

        {solution && (
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-indigo-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-sm font-black text-indigo-700">{solution.title}</span>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% सटीक हल
              </span>
            </div>

            <div className="text-xs sm:text-sm space-y-2 text-slate-700">
              <p className="font-bold text-slate-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                <span className="text-indigo-700">लागू सूत्र:</span> {solution.formula}
              </p>
              <p className="p-1"><span className="font-bold text-slate-900">दिए गए मान:</span> {solution.step1}</p>
              <div className="p-1 whitespace-pre-line font-medium text-slate-800">
                <span className="font-bold text-slate-900">चरणबद्ध हल:</span>{"\n"}{solution.step2}
              </div>
              <div className="p-3.5 bg-white rounded-xl border-2 border-indigo-200 font-black text-slate-950 text-sm shadow-xs">
                🎯 {solution.result}
              </div>
              {solution.extra && (
                <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-950 font-bold text-xs border border-emerald-200">
                  📈 {solution.extra}
                </div>
              )}
            </div>

            {solution.trick && (
              <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
                {solution.trick}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
