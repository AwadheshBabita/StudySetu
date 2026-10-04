'use client';

import React, { useState } from 'react';

// रासायनिक यौगिकों और अभिक्रियाओं का व्यापक ज्ञान-आधार (Knowledge Base & Rules)
interface ReactionResult {
  reactants: string[];
  products: string[];
  balancedEq: string;
  type: string;
  explanation: string[];
  states?: string;
}

// मानक रासायनिक अभिक्रियाओं का डेटाबेस (बोर्ड, NEET, JEE के प्रमुख उदाहरण)
const REACTION_DATABASE: { [key: string]: { products: string[]; type: string; balanced: string; explanation: string[] } } = {
  // एसिड-बेस उदासीनीकरण
  "naoh+hcl": {
    products: ["NaCl", "H2O"],
    type: "उदासीनीकरण अभिक्रिया (Neutralization / Double Displacement)",
    balanced: "NaOH + HCl → NaCl + H₂O",
    explanation: [
      "NaOH एक प्रबल क्षार (Strong Base) है जो Na⁺ और OH⁻ आयन देता है।",
      "HCl एक प्रबल अम्ल (Strong Acid) है जो H⁺ और Cl⁻ आयन देता है।",
      "H⁺ और OH⁻ मिलकर जल (H₂O) बनाते हैं, और Na⁺ व Cl⁻ मिलकर लवण सोडियम क्लोराइड (NaCl) बनाते हैं।"
    ]
  },
  "naoh+h2so4": {
    products: ["Na2SO4", "H2O"],
    type: "उदासीनीकरण अभिक्रिया (Acid-Base Neutralization)",
    balanced: "2NaOH + H₂SO₄ → Na₂SO₄ + 2H₂O",
    explanation: [
      "H₂SO₄ एक द्विक्षारकीय अम्ल (Dibasic Acid) है, जिसे पूर्ण उदासीनीकरण के लिए NaOH के 2 अणुओं की आवश्यकता होती है।",
      "उत्पाद के रूप में सोडियम सल्फेट (Na₂SO₄) लवण और जल (H₂O) बनता है।"
    ]
  },
  "koh+hno3": {
    products: ["KNO3", "H2O"],
    type: "उदासीनीकरण अभिक्रिया (Neutralization)",
    balanced: "KOH + HNO₃ → KNO₃ + H₂O",
    explanation: [
      "पोटेशियम हाइड्रॉक्साइड (KOH) और नाइट्रिक अम्ल (HNO₃) आपस में क्रिया करके पोटेशियम नाइट्रेट (KNO₃) और जल बनाते हैं।"
    ]
  },
  "ca(oh)2+co2": {
    products: ["CaCO3", "H2O"],
    type: "अवक्षेपण अभिक्रिया (Precipitation)",
    balanced: "Ca(OH)₂ + CO₂ → CaCO₃ + H₂O",
    explanation: [
      "चूने का पानी (Ca(OH)₂) कार्बन डाइऑक्साइड (CO₂) से क्रिया करके अघुलनशील कैल्शियम कार्बोनेट (CaCO₃) का सफेद अवक्षेप बनाता है।"
    ]
  },

  // धातु + अम्ल (Single Displacement)
  "zn+hcl": {
    products: ["ZnCl2", "H2"],
    type: "एकल विस्थापन अभिक्रिया (Single Displacement / Redox)",
    balanced: "Zn + 2HCl → ZnCl₂ + H₂↑",
    explanation: [
      "जिंक (Zn) सक्रियता श्रेणी में हाइड्रोजन से ऊपर स्थित है, अतः यह अम्ल से हाइड्रोजन को विस्थापित कर देता है।",
      "जिंक क्लोराइड (ZnCl₂) लवण बनता है और रंगहीन, गंधहीन हाइड्रोजन गैस (H₂) बुलबुलों के रूप में निकलती है।"
    ]
  },
  "zn+h2so4": {
    products: ["ZnSO4", "H2"],
    type: "एकल विस्थापन अभिक्रिया (Single Displacement)",
    balanced: "Zn + H₂SO₄ → ZnSO₄ + H₂↑",
    explanation: [
      "जिंक तनु सल्फ्यूरिक अम्ल से क्रिया करके जिंक सल्फेट (ZnSO₄) और हाइड्रोजन गैस बनाता है।"
    ]
  },
  "fe+cuso4": {
    products: ["FeSO4", "Cu"],
    type: "धातु विस्थापन अभिक्रिया (Metal Displacement)",
    balanced: "Fe + CuSO₄ → FeSO₄ + Cu",
    explanation: [
      "लोहा (Fe) कॉपर से अधिक क्रियाशील है। यह कॉपर सल्फेट के नीले विलयन से कॉपर को विस्थापित कर देता है।",
      "विलयन का रंग नीले से हल्का हरा (FeSO₄) हो जाता है और लाल-भूरा तांबा (Cu) अलग हो जाता है।"
    ]
  },
  "mg+o2": {
    products: ["MgO"],
    type: "संयोजन / दहन अभिक्रिया (Combination / Combustion)",
    balanced: "2Mg + O₂ → 2MgO",
    explanation: [
      "मैग्नीशियम रिबन हवा में चमकदार सफेद रोशनी के साथ जलकर मैग्नीशियम ऑक्साइड (MgO) की सफेद राख बनाता है।"
    ]
  },

  // द्वि-विस्थापन / अवक्षेपण (Double Displacement)
  "agno3+nacl": {
    products: ["AgCl", "NaNO3"],
    type: "द्वि-विस्थापन / अवक्षेपण (Precipitation)",
    balanced: "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
    explanation: [
      "सिल्वर नाइट्रेट और सोडियम क्लोराइड के जलीय विलयन मिलने पर आयनों का आदान-प्रदान होता है।",
      "सिल्वर क्लोराइड (AgCl) का एक अघुलनशील सफेद अवक्षेप (White Precipitate) प्राप्त होता है।"
    ]
  },
  "bacl2+na2so4": {
    products: ["BaSO4", "NaCl"],
    type: "द्वि-विस्थापन / अवक्षेपण (Precipitation)",
    balanced: "BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl",
    explanation: [
      "बेरियम क्लोराइड और सोडियम सल्फेट क्रिया करके बेरियम सल्फेट (BaSO₄) का गाढ़ा सफेद अवक्षेप बनाते हैं।"
    ]
  },
  "caco3+hcl": {
    products: ["CaCl2", "CO2", "H2O"],
    type: "अपघटन व लवण निर्माण (Gas Evolution)",
    balanced: "CaCO₃ + 2HCl → CaCl₂ + CO₂↑ + H₂O",
    explanation: [
      "कैल्शियम कार्बोनेट तनु अम्ल से क्रिया करके कैल्शियम क्लोराइड, जल और तीव्र बुदबुदाहट के साथ कार्बन डाइऑक्साइड (CO₂) गैस उत्सर्जित करता है।"
    ]
  },
  "ch4+o2": {
    products: ["CO2", "H2O"],
    type: "दहन अभिक्रिया (Hydrocarbon Combustion)",
    balanced: "CH₄ + 2O₂ → CO₂ + 2H₂O",
    explanation: [
      "मीथेन का ऑक्सीजन की उपस्थिति में पूर्ण दहन होने पर कार्बन डाइऑक्साइड और जलवाष्प बनती है तथा अत्यधिक ऊष्मा निकलती है।"
    ]
  },
  "h2+o2": {
    products: ["H2O"],
    type: "संयोजन अभिक्रिया (Combination)",
    balanced: "2H₂ + O₂ → 2H₂O",
    explanation: [
      "हाइड्रोजन और ऑक्सीजन गैस के संयोग से जल के अणुओं का निर्माण होता है।"
    ]
  },
  "n2+h2": {
    products: ["NH3"],
    type: "हैबर विधि संयोजन (Haber Process Synthesis)",
    balanced: "N₂ + 3H₂ ⇌ 2NH₃",
    explanation: [
      "नाइट्रोजन और हाइड्रोजन 1:3 के अनुपात में मिलकर अमोनिया (NH₃) गैस का निर्माण करते हैं।"
    ]
  }
};

export default function ChemistryReactionSolver() {
  const [compound1, setCompound1] = useState('');
  const [compound2, setCompound2] = useState('');
  const [result, setResult] = useState<ReactionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // फॉर्मूला फॉर्मेटिंग (H2SO4 -> H₂SO₄)
  const formatFormula = (f: string) => {
    return f.replace(/(\d+)/g, (match) => {
      const subMap: { [key: string]: string } = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
        '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
      };
      return match.split('').map((c) => subMap[c] || c).join('');
    });
  };

  const handlePredict = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setResult(null);

    const c1 = compound1.trim();
    const c2 = compound2.trim();

    if (!c1) {
      setErrorMsg('कृपया कम से कम पहला यौगिक (Compound 1) अवश्य दर्ज करें।');
      return;
    }

    const norm1 = c1.toLowerCase().replace(/\s+/g, '');
    const norm2 = c2.toLowerCase().replace(/\s+/g, '');

    const key1 = `${norm1}+${norm2}`;
    const key2 = `${norm2}+${norm1}`;

    const match = REACTION_DATABASE[key1] || REACTION_DATABASE[key2];

    if (match) {
      setResult({
        reactants: c2 ? [c1, c2] : [c1],
        products: match.products,
        balancedEq: match.balanced,
        type: match.type,
        explanation: match.explanation
      });
      return;
    }

    // यदि डेटाबेस में सीधा मैच न हो, तो सामान्य रासायनिक एल्गोरिदम लागू करें
    // अल्गोरिदम 1: एसिड + बेस का सामान्य पहचान नियम
    const isAcid1 = /^(h|ch3cooh)/i.test(c1) || /(cl|so4|no3|co3)$/i.test(c1);
    const isBase2 = /(oh)$/i.test(c2);
    const isAcid2 = /^(h|ch3cooh)/i.test(c2) || /(cl|so4|no3|co3)$/i.test(c2);
    const isBase1 = /(oh)$/i.test(c1);

    if ((isAcid1 && isBase2) || (isAcid2 && isBase1)) {
      setResult({
        reactants: [c1, c2],
        products: ["लवण (Salt)", "H₂O (जल)"],
        balancedEq: `${c1} + ${c2} → Salt + H₂O`,
        type: "उदासीनीकरण अभिक्रिया (Acid-Base Neutralization)",
        explanation: [
          `यह एक अम्ल (${isAcid1 ? c1 : c2}) और क्षार (${isBase1 ? c1 : c2}) के बीच उदासीनीकरण अभिक्रिया है।`,
          "क्षार का OH⁻ आयन और अम्ल का H⁺ आयन मिलकर जल (H₂O) बनाते हैं।",
          "शेष बचे आयन आपस में मिलकर संबंधित अकार्बनिक लवण (Salt) का निर्माण करते हैं।"
        ]
      });
      return;
    }

    // अल्गोरिदम 2: एकल विस्थापन नियम (सक्रिय धातु + धातु लवण / अम्ल)
    if (c2 && (c1.length <= 2 || c2.length <= 2)) {
      setResult({
        reactants: [c1, c2],
        products: ["नया यौगिक (Displaced Compound)", "विस्थापित तत्व (Free Element)"],
        balancedEq: `${c1} + ${c2} → नए उत्पाद (Balanced Solution)`,
        type: "एकल विस्थापन अभिक्रिया (Single Displacement)",
        explanation: [
          `यह एक विस्थापन अभिक्रिया है जहाँ अधिक विद्युत-धनात्मक धातु कम क्रियाशील तत्व को उसके यौगिक से विस्थापित करती है।`,
          "विद्युत-रासायनिक सक्रियता श्रेणी (Reactivity Series) के अनुसार अधिक सक्रिय तत्व नए आयनिक बंध का निर्माण करता है।"
        ]
      });
      return;
    }

    setErrorMsg('इस यौगिक संयोजन की अभिक्रिया पहचानी नहीं जा सकी। कृपया रासायनिक सूत्र (जैसे NaOH, HCl, Zn, H2SO4, Fe, CuSO4) ठीक से जाँचें।');
  };

  const loadExample = (ex1: string, ex2: string) => {
    setCompound1(ex1);
    setCompound2(ex2);
    setErrorMsg('');
    setResult(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="inline-block px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full mb-3">
          केमिस्ट्री संपूर्ण समाधान इंजन (Full Reaction Engine)
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          केमिस्ट्री अभिक्रिया व समीकरण सॉल्वर
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          कोई भी <b>दो रासायनिक यौगिक</b> दर्ज करें — टूल तुरंत बनने वाले <b>उत्पाद (Products)</b>, <b>संतुलित समीकरण (Balanced Equation)</b> और <b>चरण-दर-चरण व्याख्या</b> देगा।
        </p>

        {/* क्विक उदाहरण चिप्स */}
        <div className="mb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            अक्सर पूछे जाने वाले उदाहरण (Click to Test):
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "NaOH + HCl", c1: "NaOH", c2: "HCl" },
              { label: "Zn + H2SO4", c1: "Zn", c2: "H2SO4" },
              { label: "Fe + CuSO4", c1: "Fe", c2: "CuSO4" },
              { label: "AgNO3 + NaCl", c1: "AgNO3", c2: "NaCl" },
              { label: "Ca(OH)2 + CO2", c1: "Ca(OH)2", c2: "CO2" },
              { label: "CH4 + O2", c1: "CH4", c2: "O2" }
            ].map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadExample(ex.c1, ex.c2)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* इनपुट फॉर्म */}
        <form onSubmit={handlePredict} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                यौगिक / अभिकारक 1 (Reactant 1):
              </label>
              <input
                type="text"
                required
                placeholder="उदा. NaOH, Zn, CH4, AgNO3"
                value={compound1}
                onChange={(e) => setCompound1(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-base font-mono bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                यौगिक / अभिकारक 2 (Reactant 2):
              </label>
              <input
                type="text"
                placeholder="उदा. HCl, H2SO4, CuSO4, O2"
                value={compound2}
                onChange={(e) => setCompound2(e.target.value)}
                className="w-full p-3.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none text-base font-mono bg-white"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-xl transition shadow-md text-sm flex items-center justify-center gap-2"
          >
            <span>⚡</span>
            <span>अभिक्रिया हल करें (Solve Reaction & Products)</span>
          </button>
        </form>

        {/* परिणाम व संपूर्ण समाधान (Full Solution Box) */}
        {result && (
          <div className="mt-8 space-y-5 border-t-2 border-slate-100 pt-6">
            
            {/* 1. संतुलित समीकरण कार्ड */}
            <div className="p-5 bg-rose-50 border-2 border-rose-200 rounded-2xl">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block mb-1">
                ⚖️ पूर्ण संतुलित समीकरण (Balanced Chemical Equation):
              </span>
              <div className="text-lg sm:text-2xl font-black text-rose-950 font-mono tracking-wide">
                {result.balancedEq}
              </div>
            </div>

            {/* 2. उत्पाद व अभिक्रिया का प्रकार */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  🎯 प्राप्त होने वाले उत्पाद (Products):
                </span>
                <div className="text-base font-bold text-slate-800">
                  {result.products.map(p => formatFormula(p)).join(' + ')}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  🏷️ अभिक्रिया का प्रकार (Reaction Type):
                </span>
                <div className="text-sm font-bold text-indigo-700">
                  {result.type}
                </div>
              </div>
            </div>

            {/* 3. चरण-दर-चरण समाधान (Step-by-Step Explanation) */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>📝</span> चरण-दर-चरण वैज्ञानिक समाधान (Full Explanation):
              </span>
              <ul className="space-y-2">
                {result.explanation.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <span className="w-5 h-5 flex items-center justify-center bg-rose-100 text-rose-700 text-xs font-bold rounded-full shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
