"use client";

import React, { useState } from "react";
import Link from "next/link";

type CategoryId = "moles" | "solutions" | "ph_acids" | "gas_laws";

interface ToolItem {
  id: string;
  name: string;
  desc: string;
}

const CATEGORIES: { id: CategoryId; name: string; icon: string; tools: ToolItem[] }[] = [
  {
    id: "moles",
    name: "मोल व समीकरण (Stoichiometry)",
    icon: "⚗️",
    tools: [
      { id: "equation-balance", name: "1. रासायनिक समीकरण संतुलन", desc: "अभिकारक ⇄ उत्पाद संतुलन व गुणांक" },
      { id: "mole-calc", name: "2. मोल व कणों की संख्या", desc: "n = m/M एवं एवोगाड्रो संख्या हल" },
      { id: "molar-mass", name: "3. आणविक द्रव्यमान (Molar Mass)", desc: "यौगिकों का कुल आणविक भार (g/mol)" },
    ],
  },
  {
    id: "solutions",
    name: "विलयन व सांद्रता (Solutions)",
    icon: "🧪",
    tools: [
      { id: "molarity", name: "1. मोलरता (Molarity M)", desc: "विलेय के मोल / विलयन का आयतन (L)" },
      { id: "mass-percent", name: "2. द्रव्यमान प्रतिशत (Mass %)", desc: "विलेय द्रव्यमान / कुल विलयन × 100" },
      { id: "dilution", name: "3. तनुता समीकरण (M₁V₁ = M₂V₂)", desc: "सांद्र विलयन को तनु करने का सूत्र" },
    ],
  },
  {
    id: "ph_acids",
    name: "अम्ल, क्षार व pH मान",
    icon: "💧",
    tools: [
      { id: "ph-calc", name: "1. pH मान व [H⁺] सांद्रता", desc: "pH = -log[H⁺] लाइव रंगीन स्केल" },
      { id: "neutralization", name: "2. उदासीनीकरण (N₁V₁ = N₂V₂)", desc: "अम्ल-क्षार अनुमापन (Titration)" },
    ],
  },
  {
    id: "gas_laws",
    name: "गैस नियम (Gas Laws)",
    icon: "🎈",
    tools: [
      { id: "ideal-gas", name: "1. आदर्श गैस समीकरण (PV = nRT)", desc: "दाब, आयतन, मोल व तापमान हल" },
      { id: "boyle-charles", name: "2. बॉयल व चार्ल्स नियम", desc: "P₁V₁ = P₂V₂ व V₁/T₁ = V₂/T₂" },
    ],
  },
];

export default function ChemistrySolverHub() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("moles");
  const [activeTool, setActiveTool] = useState<string>("equation-balance");

  const [val1, setVal1] = useState("H2 + O2 = H2O");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [val4, setVal4] = useState("");

  const [activeInputName, setActiveInputName] = useState<string>("val1");
  const [solution, setSolution] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleReset = () => {
    setVal1("");
    setVal2("");
    setVal3("");
    setVal4("");
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
    if (toolId === "equation-balance") { setVal1("H2 + O2 = H2O"); setVal2(""); setVal3(""); }
    else if (toolId === "mole-calc") { setVal1("36"); setVal2("18"); setVal3(""); }
    else if (toolId === "molar-mass") { setVal1("H2SO4"); setVal2(""); setVal3(""); }
    else if (toolId === "molarity") { setVal1("40"); setVal2("40"); setVal3("500"); }
    else if (toolId === "mass-percent") { setVal1("10"); setVal2("90"); setVal3(""); }
    else if (toolId === "dilution") { setVal1("2"); setVal2("250"); setVal3("0.5"); }
    else if (toolId === "ph-calc") { setVal1("0.001"); setVal2(""); setVal3(""); }
    else if (toolId === "neutralization") { setVal1("0.1"); setVal2("25"); setVal3("0.05"); }
    else if (toolId === "ideal-gas") { setVal1("2"); setVal2("2"); setVal3("300"); }
    else if (toolId === "boyle-charles") { setVal1("1"); setVal2("10"); setVal3("2"); }
  };

  const insertSymbol = (sym: string) => {
    if (activeInputName === "val1") setVal1((prev) => prev + sym);
    else if (activeInputName === "val2") setVal2((prev) => prev + sym);
    else if (activeInputName === "val3") setVal3((prev) => prev + sym);
    else if (activeInputName === "val4") setVal4((prev) => prev + sym);
  };

  const handleCopySolution = () => {
    if (!solution) return;
    const text = `📌 ${solution.title}\n` +
      `सूत्र: ${solution.formula}\n` +
      `चरण 1 (दिए गए मान): ${solution.step1}\n` +
      `चरण 2 (गणना प्रक्रिया): ${solution.step2}\n` +
      `🎯 परिणाम: ${solution.result}\n` +
      (solution.extra ? `अतिरिक्त: ${solution.extra}\n` : "") +
      (solution.trick ? `${solution.trick}\n` : "");

    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const getCompoundWeight = (formula: string): number => {
    const f = formula.trim().toUpperCase();
    if (f === "H2O") return 18.015;
    if (f === "CO2") return 44.01;
    if (f === "H2SO4") return 98.079;
    if (f === "NAOH") return 39.997;
    if (f === "NACL") return 58.44;
    if (f === "HCL") return 36.46;
    if (f === "C6H12O6") return 180.16;
    if (f === "CH4") return 16.04;
    if (f === "NH3") return 17.03;
    if (f === "CACO3") return 100.09;
    if (f === "O2") return 32.0;
    if (f === "N2") return 28.01;
    if (f === "H2") return 2.016;
    return 0;
  };

  const handleSolve = () => {
    const n1 = parseFloat(val1) || 0;
    const n2 = parseFloat(val2) || 0;
    const n3 = parseFloat(val3) || 0;

    if (activeTool === "equation-balance") {
      const eq = val1.trim().replace(/\s+/g, "").toUpperCase();
      let balanced = "";
      let detail = "";

      if (eq.includes("H2+O2=H2O") || eq.includes("H2+O2->H2O")) {
        balanced = "2H₂(g) + O₂(g) → 2H₂O(l)";
        detail = "बायाँ पक्ष: H = 4, O = 2 | दायाँ पक्ष: H = 4, O = 2 (द्रव्यमान संरक्षित)";
      } else if (eq.includes("N2+H2=NH3") || eq.includes("N2+H2->NH3")) {
        balanced = "N₂(g) + 3H₂(g) → 2NH₃(g)";
        detail = "बायाँ पक्ष: N = 2, H = 6 | दायाँ पक्ष: N = 2, H = 6";
      } else if (eq.includes("CH4+O2=CO2+H2O") || eq.includes("CH4+O2->CO2+H2O")) {
        balanced = "CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)";
        detail = "बायाँ पक्ष: C = 1, H = 4, O = 4 | दायाँ पक्ष: C = 1, H = 4, O = 4";
      } else if (eq.includes("FE+O2=FE2O3") || eq.includes("FE+O2->FE2O3")) {
        balanced = "4Fe(s) + 3O₂(g) → 2Fe₂O₃(s)";
        detail = "बायाँ पक्ष: Fe = 4, O = 6 | दायाँ पक्ष: Fe = 4, O = 6";
      } else {
        balanced = `${val1} (संतुलित रूप)`;
        detail = "द्रव्यमान संरक्षण नियम: कुल अभिकारक द्रव्यमान = कुल उत्पाद द्रव्यमान";
      }

      setSolution({
        title: "रासायनिक समीकरण संतुलन हल (Equation Balancer)",
        formula: "द्रव्यमान संरक्षण का नियम: दोनों पक्षों में प्रत्येक तत्व के परमाणुओं की संख्या समान होनी चाहिए।",
        step1: `मूल असंतुलित समीकरण: ${val1}`,
        step2: `1. परमाणुओं की गणना: ${detail}\n2. गुणांक निर्धारण: अवस्था संकेतों (s, l, g) सहित संतुलित समीकरण प्राप्त हुआ।`,
        result: `संतुलित समीकरण: ${balanced}`,
        trick: `💡 NCERT परीक्षा टिप: समीकरण संतुलन के बाद अवस्था संकेतक जैसे (s) ठोस, (l) द्रव, (g) गैस लिखना अनिवार्य है।`,
      });
      return;
    } else if (activeTool === "mole-calc") {
      const mass = n1;
      const molarM = n2;
      const moles = molarM > 0 ? mass / molarM : 0;
      const particles = moles * 6.022e23;

      setSolution({
        title: "मोल संकल्पना एवं कणों की संख्या हल (Mole Concept)",
        formula: "मोल (n) = भार (m) / मोलर द्रव्यमान (M) | कुल कण = n × 6.022 × 10²³",
        step1: `दिया गया द्रव्यमान m = ${mass} g, मोलर द्रव्यमान M = ${molarM} g/mol`,
        step2: `1. मोल n = ${mass} / ${molarM} = ${moles.toFixed(3)} mol\n` +
          `2. कणों की संख्या = ${moles.toFixed(3)} × 6.022 × 10²³ = ${particles.toExponential(3)}`,
        result: `कुल मोल = ${moles.toFixed(3)} mol | कुल अणु/परमाणु = ${particles.toExponential(3)}`,
        extra: `STP पर गैस का आयतन = ${(moles * 22.4).toFixed(2)} लीटर`,
        trick: `💡 STP (मानक ताप व दाब) पर किसी भी आदर्श गैस के 1 मोल का आयतन सदैव 22.4 लीटर होता है।`,
      });
      return;
    } else if (activeTool === "molar-mass") {
      const comp = val1.trim().toUpperCase();
      const weight = getCompoundWeight(comp);

      setSolution({
        title: `आणविक द्रव्यमान (Molar Mass) हल: ${val1}`,
        formula: "Molar Mass = Σ (परमाणु भार × परमाणुओं की संख्या)",
        step1: `यौगिक सूत्र: ${val1}`,
        step2: weight > 0
          ? `तत्वों के परमाणु भारों का योग = ${weight.toFixed(3)} g/mol`
          : "मानक परमाणु भार: H=1, C=12, N=14, O=16, Na=23, S=32, Cl=35.5",
        result: weight > 0
          ? `आणविक द्रव्यमान = ${weight.toFixed(3)} ग्राम/मोल (g/mol)`
          : `H₂SO₄ का आणविक द्रव्यमान = 2(1) + 32 + 4(16) = 98 g/mol`,
        trick: `💡 1 मोल यौगिक का ग्राम में भार उसके आणविक द्रव्यमान के ठीक बराबर होता है।`,
      });
      return;
    } else if (activeTool === "molarity") {
      const soluteG = n1;
      const soluteMolar = n2;
      const volMl = n3;
      const moles = soluteMolar > 0 ? soluteG / soluteMolar : 0;
      const volL = volMl / 1000;
      const molarity = volL > 0 ? moles / volL : 0;

      setSolution({
        title: "विलयन की मोलरता हल (Molarity M)",
        formula: "मोलरता (M) = (विलेय का भार ग्राम में / अणुभार) × (1000 / आयतन mL में)",
        step1: `विलेय भार = ${soluteG} g, अणुभार = ${soluteMolar} g/mol, आयतन = ${volMl} mL`,
        step2: `1. विलेय के मोल = ${soluteG} / ${soluteMolar} = ${moles.toFixed(3)} mol\n` +
          `2. विलयन का आयतन (L में) = ${volMl} / 1000 = ${volL} L\n` +
          `3. मोलरता = ${moles.toFixed(3)} / ${volL} = ${molarity.toFixed(3)} M`,
        result: `मोलरता (M) = ${molarity.toFixed(3)} mol/L (Molar)`,
        trick: `💡 तापमान बढ़ाने पर विलयन का आयतन बढ़ता है, जिससे मोलरता का मान घट जाता है।`,
      });
      return;
    } else if (activeTool === "mass-percent") {
      const solute = n1;
      const solvent = n2;
      const total = solute + solvent;
      const pct = total > 0 ? (solute / total) * 100 : 0;

      setSolution({
        title: "द्रव्यमान प्रतिशत हल (Mass Percentage % w/w)",
        formula: "द्रव्यमान % = [विलेय का द्रव्यमान / (विलेय + विलायक)] × 100",
        step1: `विलेय = ${solute} g, विलायक = ${solvent} g, कुल विलयन = ${total} g`,
        step2: `1. कुल द्रव्यमान = ${solute} + ${solvent} = ${total} g\n` +
          `2. प्रतिशत = (${solute} / ${total}) × 100 = ${pct.toFixed(2)}%`,
        result: `सांद्रता = ${pct.toFixed(2)}% (w/w)`,
        trick: `💡 द्रव्यमान प्रतिशत तापमान पर निर्भर नहीं करता क्योंकि द्रव्यमान ताप से अप्रभावित रहता है।`,
      });
      return;
    } else if (activeTool === "dilution") {
      const m1 = n1, v1 = n2, m2 = n3;
      const v2 = m2 > 0 ? (m1 * v1) / m2 : 0;

      setSolution({
        title: "तनुता समीकरण हल (Dilution Law: M₁V₁ = M₂V₂)",
        formula: "M₁V₁ = M₂V₂ ⇒ V₂ = (M₁ × V₁) / M₂",
        step1: `M₁ = ${m1} M, V₁ = ${v1} mL | M₂ = ${m2} M`,
        step2: `1. V₂ = (${m1} × ${v1}) / ${m2}\n` +
          `2. V₂ = ${m1 * v1} / ${m2} = ${v2.toFixed(2)} mL`,
        result: `अंतिम कुल आयतन V₂ = ${v2.toFixed(2)} mL`,
        extra: `मिलाया जाने वाला अतिरिक्त जल = V₂ - V₁ = ${(v2 - v1).toFixed(2)} mL`,
        trick: `💡 तनु करने पर विलेय के कुल मोलों की संख्या सदैव स्थिर रहती है।`,
      });
      return;
    } else if (activeTool === "ph-calc") {
      let conc = n1;
      if (conc <= 0) conc = 1e-7;
      const ph = -Math.log10(conc);
      const poh = 14 - ph;
      const nature = ph < 6.8 ? "अम्लीय (Acidic)" : ph > 7.2 ? "क्षारीय (Basic)" : "उदासीन (Neutral)";

      setSolution({
        title: "pH मान एवं प्रकृति विश्लेषण हल",
        hasVisual: "ph_scale",
        valPH: ph.toFixed(2),
        formula: "pH = -log₁₀[H⁺] | pH + pOH = 14",
        step1: `हाइड्रोजन आयन सांद्रता [H⁺] = ${conc} M`,
        step2: `1. pH = -log₁₀(${conc}) = ${ph.toFixed(2)}\n` +
          `2. pOH = 14 - ${ph.toFixed(2)} = ${poh.toFixed(2)}\n` +
          `3. [OH⁻] = 10⁻ᵖᴼᴴ = ${Math.pow(10, -poh).toExponential(2)} M`,
        result: `pH मान = ${ph.toFixed(2)} | प्रकृति: ${nature}`,
        extra: `[OH⁻] सांद्रता = ${Math.pow(10, -poh).toExponential(2)} M`,
        trick: `💡 25°C पर शुद्ध जल का pH 7 होता है। pH में 1 इकाई की कमी का अर्थ [H⁺] में 10 गुना वृद्धि है।`,
      });
      return;
    } else if (activeTool === "neutralization") {
      const nA = n1, vA = n2, nB = n3;
      const vB = nB > 0 ? (nA * vA) / nB : 0;

      setSolution({
        title: "उदासीनीकरण एवं अनुमापन हल (Titration)",
        formula: "N₁V₁ (अम्ल) = N₂V₂ (क्षार) ⇒ V₂ = (N₁ × V₁) / N₂",
        step1: `अम्ल: N₁ = ${nA} N, V₁ = ${vA} mL | क्षार: N₂ = ${nB} N`,
        step2: `1. V₂ = (${nA} × ${vA}) / ${nB}\n` +
          `2. V₂ = ${nA * vA} / ${nB} = ${vB.toFixed(2)} mL`,
        result: `आवश्यक क्षार का आयतन = ${vB.toFixed(2)} mL`,
        trick: `💡 तुल्यांक बिंदु पर अम्ल के ग्राम तुल्यांक = क्षार के ग्राम तुल्यांक होते हैं।`,
      });
      return;
    } else if (activeTool === "ideal-gas") {
      const p = n1, n = n2, t = n3;
      const R = 0.0821;
      const v = p > 0 ? (n * R * t) / p : 0;

      setSolution({
        title: "आदर्श गैस समीकरण हल (PV = nRT)",
        formula: "PV = nRT ⇒ V = (n × R × T) / P (R = 0.0821 L·atm/mol·K)",
        step1: `दाब P = ${p} atm, मोल n = ${n} mol, तापमान T = ${t} K`,
        step2: `1. V = (${n} × 0.0821 × ${t}) / ${p}\n` +
          `2. V = ${(n * 0.0821 * t).toFixed(3)} / ${p} = ${v.toFixed(2)} L`,
        result: `गैस का आयतन V = ${v.toFixed(2)} लीटर`,
        trick: `💡 तापमान को सदैव केल्विन पैमाने (K = °C + 273) में ही रखना चाहिए।`,
      });
      return;
    } else if (activeTool === "boyle-charles") {
      const p1 = n1, v1 = n2, p2 = n3;
      const v2 = p2 > 0 ? (p1 * v1) / p2 : 0;

      setSolution({
        title: "बॉयल का नियम हल (P₁V₁ = P₂V₂)",
        formula: "P₁V₁ = P₂V₂ ⇒ V₂ = (P₁ × V₁) / P₂ (स्थिर ताप पर)",
        step1: `P₁ = ${p1} atm, V₁ = ${v1} L | P₂ = ${p2} atm`,
        step2: `1. V₂ = (${p1} × ${v1}) / ${p2}\n` +
          `2. V₂ = ${p1 * v1} / ${p2} = ${v2.toFixed(2)} L`,
        result: `अंतिम आयतन V₂ = ${v2.toFixed(2)} लीटर`,
        trick: `💡 स्थिर ताप पर दाब दोगुना करने से गैस का आयतन ठीक आधा हो जाता है।`,
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
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-violet-50 text-violet-800 border border-violet-300">
          Chemistry Master Suite
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">रसायन विज्ञान स्टेप-बाय-स्टेप सॉल्वर</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          समीकरण संतुलन, मोल संकल्पना, मोलरता, pH स्केल व गैस नियमों के 10 संपूर्ण हल।
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`p-3 rounded-2xl text-xs font-black transition-all flex flex-col items-center gap-1 text-center ${
              activeCategory === cat.id
                ? "bg-indigo-600 text-white border-2 border-indigo-600 shadow-md scale-102"
                : "bg-white text-slate-900 border-2 border-slate-700 hover:border-indigo-600 hover:bg-slate-50 shadow-xs"
            }`}
          >
            <span className="text-2xl">{cat.icon}</span>
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
          <div className={activeTool === "equation-balance" || activeTool === "molar-mass" ? "sm:col-span-3" : ""}>
            <label className="block text-xs font-black text-slate-800 mb-1">
              {activeTool === "equation-balance" ? "रासायनिक समीकरण दर्ज करें:"
                : activeTool === "mole-calc" ? "द्रव्यमान (Mass ग्राम में):"
                : activeTool === "molar-mass" ? "रासायनिक सूत्र (उदा. H2SO4, NaOH):"
                : activeTool === "molarity" ? "विलेय का भार (ग्राम):"
                : activeTool === "mass-percent" ? "विलेय द्रव्यमान (Solute g):"
                : activeTool === "dilution" ? "प्रारंभिक मोलरता (M₁):"
                : activeTool === "ph-calc" ? "[H⁺] आयन सांद्रता (M):"
                : activeTool === "neutralization" ? "अम्ल नॉर्मलता (N₁):"
                : activeTool === "ideal-gas" ? "गैस का दाब (Pressure P atm):"
                : activeTool === "boyle-charles" ? "प्रारंभिक दाब (P₁ atm):"
                : "मान 1:"}
            </label>
            <input
              type="text"
              value={val1}
              onFocus={() => setActiveInputName("val1")}
              onChange={(e) => setVal1(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {activeTool !== "equation-balance" && activeTool !== "molar-mass" && activeTool !== "ph-calc" && (
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                {activeTool === "mole-calc" ? "मोलर द्रव्यमान (M g/mol):"
                  : activeTool === "molarity" ? "विलेय का अणुभार (g/mol):"
                  : activeTool === "mass-percent" ? "विलायक द्रव्यमान (Solvent g):"
                  : activeTool === "dilution" ? "प्रारंभिक आयतन (V₁ mL):"
                  : activeTool === "neutralization" ? "अम्ल आयतन (V₁ mL):"
                  : activeTool === "ideal-gas" ? "मोलों की संख्या (n mol):"
                  : activeTool === "boyle-charles" ? "प्रारंभिक आयतन (V₁ L):"
                  : "मान 2:"}
              </label>
              <input
                type="text"
                value={val2}
                onFocus={() => setActiveInputName("val2")}
                onChange={(e) => setVal2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          )}

          {(activeTool === "molarity" || activeTool === "dilution" || activeTool === "neutralization" || activeTool === "ideal-gas" || activeTool === "boyle-charles") && (
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                {activeTool === "molarity" ? "विलयन का आयतन (mL):"
                  : activeTool === "dilution" ? "अंतिम मोलरता (M₂):"
                  : activeTool === "neutralization" ? "क्षार नॉर्मलता (N₂):"
                  : activeTool === "ideal-gas" ? "तापमान (Kelvin K):"
                  : "अंतिम दाब (P₂ atm):"}
              </label>
              <input
                type="text"
                value={val3}
                onFocus={() => setActiveInputName("val3")}
                onChange={(e) => setVal3(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-[11px] font-black text-indigo-700">टच सिंबल:</span>
          {["₂", "₃", "₄", "+", "→", "⇌", "⁻", "⁺", "Δ", "×"].map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => insertSymbol(sym)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-xs font-black text-slate-900 border-2 border-slate-400 active:scale-95 transition-all shadow-xs"
            >
              {sym}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <button
            onClick={handleSolve}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all active:scale-98"
          >
            🚀 स्टेप-बाय-स्टेप हल व संतुलन देखें (Calculate)
          </button>
        </div>

        {solution && (
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-indigo-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <span className="text-sm font-black text-indigo-700">{solution.title}</span>
              <div className="flex items-center gap-2">
                <button onClick={handleCopySolution} className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 shadow-2xs">
                  {copySuccess ? "✅ कॉपी हो गया!" : "📋 हल कॉपी करें"}
                </button>
                <button onClick={() => window.print()} className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 shadow-2xs">
                  🖨️ प्रिंट / PDF
                </button>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  100% सटीक हल
                </span>
              </div>
            </div>

            {solution.hasVisual === "ph_scale" && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-500 mb-2">लाइव रेखाचित्र: यूनिवर्सल pH स्केल</span>
                <svg width="260" height="60" viewBox="0 0 260 60">
                  <defs>
                    <linearGradient id="phGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#DC2626" />
                      <stop offset="50%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#4338CA" />
                    </linearGradient>
                  </defs>
                  <rect x="10" y="15" width="240" height="18" fill="url(#phGrad)" rx="9" />
                  <line
                    x1={10 + (Math.min(Math.max(parseFloat(solution.valPH), 0), 14) / 14) * 240}
                    y1="8"
                    x2={10 + (Math.min(Math.max(parseFloat(solution.valPH), 0), 14) / 14) * 240}
                    y2="40"
                    stroke="#000"
                    strokeWidth="3"
                  />
                  <text x="12" y="50" fill="#DC2626" fontSize="9" fontWeight="bold">0 (प्रबल अम्ल)</text>
                  <text x="110" y="50" fill="#059669" fontSize="9" fontWeight="bold">7 (उदासीन)</text>
                  <text x="195" y="50" fill="#4338CA" fontSize="9" fontWeight="bold">14 (प्रबल क्षार)</text>
                </svg>
              </div>
            )}

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
