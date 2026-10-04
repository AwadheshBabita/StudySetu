"use client";

import React, { useState } from "react";
import Link from "next/link";

type CategoryId = "arithmetic" | "algebra" | "mensuration" | "trigo" | "stats" | "calculus";

interface ToolItem {
  id: string;
  name: string;
  desc: string;
}

const CATEGORIES: { id: CategoryId; name: string; icon: string; tools: ToolItem[] }[] = [
  {
    id: "arithmetic",
    name: "अंकगणित (Aptitude)",
    icon: "➗",
    tools: [
      { id: "si-ci", name: "1. ब्याज गणक (SI/CI व उल्टा हल)", desc: "ब्याज, मूलधन, दर या समय निकालें" },
      { id: "lcm-hcf", name: "2. ल.स.प. व म.स.प.", desc: "LCM & HCF अभाज्य गुणनखंड विधि" },
      { id: "speed-dist", name: "3. चाल, दूरी व समय", desc: "km/h ⇄ m/s, घंटे/मिनट/सेकंड हल" },
      { id: "profit-loss", name: "4. लाभ-हानि व छूट", desc: "CP, SP, लाभ/हानि % व डिस्काउंट" },
      { id: "percentage", name: "5. प्रतिशत (Percentage)", desc: "मान, प्रतिशत वृद्धि व कमी" },
      { id: "time-work", name: "6. कार्य और समय (भिन्न रूप)", desc: "A और B की कार्यक्षमता व कुल दिन" },
    ],
  },
  {
    id: "algebra",
    name: "बीजगणित (Algebra)",
    icon: "📐",
    tools: [
      { id: "quadratic", name: "1. द्विघात समीकरण (गुणनखंड विधि)", desc: "मध्य पद तोड़ना व श्रीधराचार्य दोनों" },
      { id: "linear-1var", name: "2. रैखिक समीकरण (1 चर - p/q)", desc: "ax + b = c का पक्षांतर व भिन्न हल" },
      { id: "linear-2var", name: "3. युगपत समीकरण (2 चर)", desc: "a₁x + b₁y = c₁ व a₂x + b₂y = c₂" },
      { id: "ap-series", name: "4. समांतर श्रेणी (A.P.)", desc: "nवाँ पद (Tn) व कुल योग (Sn)" },
      { id: "indices", name: "5. घातांक व करणी", desc: "आधार, घात (aⁿ) व करणी नियम" },
    ],
  },
  {
    id: "mensuration",
    name: "क्षेत्रमिति (2D/3D)",
    icon: "📏",
    tools: [
      { id: "pythagoras", name: "1. पाइथागोरस (समकोण त्रिभुज)", desc: "लंब व आधार के अनुपात अनुसार ढलान" },
      { id: "2d-circle", name: "2. वृत्त एवं त्रिज्यखंड (कोण लाइव)", desc: "त्रिज्या व कोण अनुसार कटा हुआ भाग" },
      { id: "2d-rect", name: "3. आयत व वर्ग (अनुपाती आकार)", desc: "लंबाई × चौड़ाई के अनुपात में ढलने वाला चित्र" },
      { id: "triangle-area", name: "4. त्रिभुज का क्षेत्रफल (हीरोन)", desc: "हीरोन का सूत्र व अर्द्ध-परिमाप हल" },
      { id: "3d-cylinder-cone", name: "5. बेलन व शंकु (3D)", desc: "आयतन एवं कुल पृष्ठीय क्षेत्रफल" },
      { id: "3d-sphere", name: "6. गोला व अर्धगोला", desc: "Sphere & Hemisphere आयतन व पृष्ठ" },
    ],
  },
  {
    id: "trigo",
    name: "त्रिकोणमिति (Trigo)",
    icon: "📐",
    tools: [
      { id: "trigo-val", name: "1. त्रिकोणमितीय अनुपात मान", desc: "sin, cos, tan, cot, sec, cosec" },
      { id: "height-dist", name: "2. ऊँचाई और दूरी (कोण अनुसार रेखाचित्र)", desc: "मीनार, छाया व लाइव उन्नयन कोण आरेख" },
      { id: "deg-rad", name: "3. डिग्री ⇄ रेडियन", desc: "कोण इकाई परिवर्तन व सूत्र" },
      { id: "trigo-identities", name: "4. त्रिकोणमितीय सर्वसमिका", desc: "sin²θ + cos²θ = 1 आदि सत्यापन" },
    ],
  },
  {
    id: "stats",
    name: "सांख्यिकी (Stats)",
    icon: "📊",
    tools: [
      { id: "mean-median", name: "1. माध्य, माध्यिका, बहुलक", desc: "डेटा का केंद्रीय प्रवृत्ति विश्लेषण" },
      { id: "variance-sd", name: "2. प्रसरण व मानक विचलन", desc: "Variance व Standard Deviation स्टेप्स" },
      { id: "probability", name: "3. साधारण प्रायिकता (p/q रूप)", desc: "सिक्के, पासे व अनुकूल/कुल परिणाम" },
      { id: "range-quartile", name: "4. परास (Range) व चतुर्थक", desc: "अधिकतम - न्यूनतम व IQR" },
    ],
  },
  {
    id: "calculus",
    name: "उच्च गणित (Calculus)",
    icon: "📈",
    tools: [
      { id: "diff-power", name: "1. अवकलन d/dx (xⁿ)", desc: "पावर रूल से फलन का अवकलन" },
      { id: "integration-power", name: "2. समाकलन ∫ xⁿ dx", desc: "निश्चित व अनिश्चित सीमा समाकलन" },
      { id: "matrix-det", name: "3. आव्यूह सारणिक (Matrix)", desc: "2×2 आव्यूह सारणिक मान" },
    ],
  },
];

export default function MathSolverHub() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("trigo");
  const [activeTool, setActiveTool] = useState<string>("trigo-val");

  // Inputs
  const [val1, setVal1] = useState("30");
  const [val2, setVal2] = useState("");
  const [val3, setVal3] = useState("");
  const [val4, setVal4] = useState("");
  const [val5, setVal5] = useState("");
  const [val6, setVal6] = useState("");

  const [timeUnit, setTimeUnit] = useState<"years" | "months" | "days">("years");
  const [distUnit, setDistUnit] = useState<"km" | "m">("km");
  const [timeSpeedUnit, setTimeSpeedUnit] = useState<"hours" | "minutes" | "seconds">("hours");
  const [interestTarget, setInterestTarget] = useState<"si" | "p" | "r" | "t">("si");
  const [signB, setSignB] = useState<"+" | "-">("-");
  const [signC, setSignC] = useState<"+" | "-">("+");

  const [activeInputName, setActiveInputName] = useState<string>("val1");
  const [solution, setSolution] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleReset = () => {
    setVal1("");
    setVal2("");
    setVal3("");
    setVal4("");
    setVal5("");
    setVal6("");
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
    if (toolId === "trigo-val") { setVal1("30"); setVal2(""); }
    else if (toolId === "height-dist") { setVal1("30"); setVal2("45"); }
    else if (toolId === "deg-rad") { setVal1("180"); setVal2(""); }
    else if (toolId === "trigo-identities") { setVal1("30"); setVal2(""); }
    else if (toolId === "mean-median") { setVal1("12, 15, 20, 25, 28, 30, 25"); }
    else if (toolId === "variance-sd") { setVal1("4, 8, 12, 16, 20"); }
    else if (toolId === "probability") { setVal1("3"); setVal2("6"); }
    else if (toolId === "range-quartile") { setVal1("10, 15, 22, 28, 35, 42, 50"); }
    else if (toolId === "diff-power") { setVal1("4"); setVal2("3"); }
    else if (toolId === "integration-power") { setVal1("3"); setVal2("2"); setVal3("0"); setVal4("2"); }
    else if (toolId === "matrix-det") { setVal1("3"); setVal2("1"); setVal3("2"); setVal4("4"); }
    else if (toolId === "pythagoras") { setVal1("3"); setVal2("4"); }
    else if (toolId === "2d-circle") { setVal1("7"); setVal2("60"); }
    else if (toolId === "2d-rect") { setVal1("20"); setVal2("10"); }
    else if (toolId === "triangle-area") { setVal1("6"); setVal2("8"); setVal3("10"); }
    else if (toolId === "3d-cylinder-cone") { setVal1("7"); setVal2("10"); }
    else if (toolId === "3d-sphere") { setVal1("7"); }
    else if (toolId === "quadratic") { setVal1("1"); setVal2("5"); setVal3("6"); setSignB("-"); setSignC("+"); }
    else if (toolId === "linear-1var") { setVal1("3"); setVal2("7"); setVal3("22"); }
    else if (toolId === "linear-2var") { setVal1("2"); setVal2("3"); setVal3("13"); setVal4("1"); setVal5("-1"); setVal6("4"); }
    else if (toolId === "ap-series") { setVal1("2"); setVal2("3"); setVal3("10"); }
    else if (toolId === "indices") { setVal1("2"); setVal2("5"); }
    else if (toolId === "si-ci") { setVal1("5000"); setVal2("10"); setVal3("2"); setInterestTarget("si"); setTimeUnit("years"); }
    else if (toolId === "lcm-hcf") { setVal1("12"); setVal2("18"); setVal3("24"); }
    else if (toolId === "speed-dist") { setVal1("120"); setVal2("2"); setDistUnit("km"); setTimeSpeedUnit("hours"); }
    else if (toolId === "profit-loss") { setVal1("1000"); setVal2("1250"); setVal3("10"); }
    else if (toolId === "percentage") { setVal1("500"); setVal2("20"); setVal3("650"); }
    else if (toolId === "time-work") { setVal1("10"); setVal2("15"); }
  };

  const insertSymbol = (sym: string) => {
    if (activeInputName === "val1") setVal1((prev) => prev + sym);
    else if (activeInputName === "val2") setVal2((prev) => prev + sym);
    else if (activeInputName === "val3") setVal3((prev) => prev + sym);
    else if (activeInputName === "val4") setVal4((prev) => prev + sym);
    else if (activeInputName === "val5") setVal5((prev) => prev + sym);
    else if (activeInputName === "val6") setVal6((prev) => prev + sym);
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

  const getGcd = (a: number, b: number): number => (b === 0 ? a : getGcd(b, a % b));

  const toFraction = (numerator: number, denominator: number): string => {
    if (denominator === 0) return "अपरिभाषित";
    const g = Math.abs(getGcd(Math.round(numerator), Math.round(denominator)));
    let num = Math.round(numerator) / g;
    let den = Math.round(denominator) / g;
    if (den < 0) { num = -num; den = -den; }
    if (den === 1) return `${num}`;
    return `${num}/${den}`;
  };

  const getPrimeFactors = (n: number): string => {
    let factors: number[] = [];
    let d = 2;
    let temp = Math.abs(n);
    if (temp <= 1) return `${temp}`;
    while (temp >= 2) {
      if (temp % d === 0) { factors.push(d); temp /= d; }
      else d++;
    }
    return factors.join(" × ");
  };

  const handleSolve = () => {
    const n1 = parseFloat(val1) || 0;
    const n2 = parseFloat(val2) || 0;
    const n3 = parseFloat(val3) || 0;
    const n4 = parseFloat(val4) || 0;

    /* ========================================================
       1. त्रिकोणमिति (Trigonometry - 100% Active)
    ======================================================== */
    if (activeTool === "trigo-val") {
      const deg = n1;
      const rad = (deg * Math.PI) / 180;
      const s = Math.sin(rad).toFixed(4);
      const c = Math.cos(rad).toFixed(4);
      const isTanInf = deg % 180 === 90;
      const t = isTanInf ? "अपरिभाषित (∞)" : Math.tan(rad).toFixed(4);
      const cot = isTanInf ? "0" : parseFloat(t) !== 0 ? (1 / Math.tan(rad)).toFixed(4) : "अपरिभाषित (∞)";
      const sec = parseFloat(c) !== 0 ? (1 / Math.cos(rad)).toFixed(4) : "अपरिभाषित (∞)";
      const cosec = parseFloat(s) !== 0 ? (1 / Math.sin(rad)).toFixed(4) : "अपरिभाषित (∞)";

      setSolution({
        title: `त्रिकोणमितीय अनुपात मान (${deg}°)`,
        formula: "sin(θ), cos(θ), tan(θ), cot(θ), sec(θ), cosec(θ)",
        step1: `कोण θ = ${deg}°, रेडियन = ${rad.toFixed(4)} rad`,
        step2: `1. sin(${deg}°) = ${s}\n` +
          `2. cos(${deg}°) = ${c}\n` +
          `3. tan(${deg}°) = ${t}\n` +
          `4. cot(${deg}°) = ${cot}, sec(${deg}°) = ${sec}, cosec(${deg}°) = ${cosec}`,
        result: `sin = ${s} | cos = ${c} | tan = ${t}`,
        extra: `व्युत्क्रम मान: cot = ${cot} | sec = ${sec} | cosec = ${cosec}`,
        trick: `💡 ट्रिक: sin²θ + cos²θ = 1 सदैव होता है। sin(90° - θ) = cos(θ)।`,
      });
      return;
    } else if (activeTool === "height-dist") {
      const baseDist = Math.max(n1, 0.1);
      const angle = Math.max(n2, 1);
      const rad = (angle * Math.PI) / 180;
      const height = baseDist * Math.tan(rad);
      const hyp = Math.sqrt(baseDist * baseDist + height * height);

      const maxDim = Math.max(height, baseDist);
      const scaledB = Math.max((baseDist / maxDim) * 180, 45);
      const scaledP = Math.max((height / maxDim) * 90, 25);
      const rectBoxSize = Math.min(scaledP * 0.35, scaledB * 0.25, 12);

      setSolution({
        title: "ऊँचाई एवं दूरी हल (Height & Distance)",
        hasVisual: "triangle_clean",
        valP: height.toFixed(2),
        valB: baseDist,
        valH: hyp.toFixed(2),
        scaledB: scaledB.toFixed(0),
        scaledP: scaledP.toFixed(0),
        rectBoxSize: rectBoxSize.toFixed(0),
        formula: "tan(θ) = लंब (ऊँचाई) / आधार (दूरी) ⇒ ऊँचाई = दूरी × tan(θ)",
        step1: `आधार से दूरी = ${baseDist} मी, उन्नयन कोण θ = ${angle}°`,
        step2: `1. tan(${angle}°) = ऊँचाई / ${baseDist}\n` +
          `2. ऊँचाई = ${baseDist} × tan(${angle}°) = ${baseDist} × ${Math.tan(rad).toFixed(4)}\n` +
          `3. ऊँचाई = ${height.toFixed(2)} मीटर\n` +
          `4. दृष्टि रेखा (कर्ण) = √(${baseDist}² + ${height.toFixed(2)}²) = ${hyp.toFixed(2)} मी`,
        result: `मीनार/खंभे की ऊँचाई = ${height.toFixed(2)} मीटर | दृष्टि रेखा = ${hyp.toFixed(2)} मीटर`,
        trick: `💡 ट्रिक: 45° उन्नयन कोण पर ऊँचाई और आधार की दूरी दोनों बिल्कुल बराबर होती हैं।`,
      });
      return;
    } else if (activeTool === "deg-rad") {
      const deg = n1;
      const rad = (deg * Math.PI) / 180;
      const frac = toFraction(deg, 180);
      setSolution({
        title: "डिग्री ⇄ रेडियन रूपांतरण हल",
        formula: "रेडियन = डिग्री × (π / 180) | डिग्री = रेडियन × (180 / π)",
        step1: `दिया गया मान = ${deg}°`,
        step2: `1. रेडियन = ${deg} × (π / 180)\n` +
          `2. रेडियन = (${deg} / 180) × π = ${frac}π rad\n` +
          `3. दशमलव मान = ${rad.toFixed(5)} रेडियन`,
        result: `${deg}° = ${frac}π rad (${rad.toFixed(5)} रेडियन)`,
        trick: `💡 NCERT टिप: 180° = π रेडियन। 1 रेडियन ≈ 57.3° होता है।`,
      });
      return;
    } else if (activeTool === "trigo-identities") {
      const deg = n1;
      const rad = (deg * Math.PI) / 180;
      const s = Math.sin(rad);
      const c = Math.cos(rad);
      const sumSq = (s * s + c * c).toFixed(4);
      setSolution({
        title: "त्रिकोणमितीय सर्वसमिका सत्यापन",
        formula: "1. sin²θ + cos²θ = 1 | 2. 1 + tan²θ = sec²θ | 3. 1 + cot²θ = cosec²θ",
        step1: `कोण θ = ${deg}° पर मान:\nsin(${deg}°) = ${s.toFixed(4)}, cos(${deg}°) = ${c.toFixed(4)}`,
        step2: `1. sin²(${deg}°) = (${s.toFixed(4)})² = ${(s * s).toFixed(4)}\n` +
          `2. cos²(${deg}°) = (${c.toFixed(4)})² = ${(c * c).toFixed(4)}\n` +
          `3. sin²θ + cos²θ = ${(s * s).toFixed(4)} + ${(c * c).toFixed(4)} = ${sumSq}`,
        result: `सत्यापित: sin²(${deg}°) + cos²(${deg}°) = 1`,
        trick: `💡 यह सर्वसमिका किसी भी वास्तविक कोण θ के लिए सदैव सत्य होती है।`,
      });
      return;
    }

    /* ========================================================
       2. सांख्यिकी (Stats - चारों टूल्स 100% Active)
    ======================================================== */
    else if (activeTool === "variance-sd") {
      const nums = val1.split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
      if (nums.length < 2) { alert("कम से कम 2 संख्याएँ कॉमा लगाकर दर्ज करें!"); return; }
      const n = nums.length;
      const sum = nums.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / n;
      const diffs = nums.map((x) => x - mean);
      const sumSquaredDiffs = diffs.map((d) => d * d).reduce((a, b) => a + b, 0);
      const variance = sumSquaredDiffs / n;
      const sd = Math.sqrt(variance);

      setSolution({
        title: "प्रसरण एवं मानक विचलन हल (Variance & Std Dev)",
        formula: "माध्य μ = Σx / n | प्रसरण σ² = Σ(x - μ)² / n | मानक विचलन σ = √प्रसरण",
        step1: `डेटा: [${nums.join(", ")}], कुल पद n = ${n}`,
        step2: `1. समांतर माध्य μ = ${sum} / ${n} = ${mean.toFixed(2)}\n` +
          `2. विचलनों के वर्गों का योग Σ(x - μ)² = ${sumSquaredDiffs.toFixed(2)}\n` +
          `3. प्रसरण σ² = ${sumSquaredDiffs.toFixed(2)} / ${n} = ${variance.toFixed(2)}\n` +
          `4. मानक विचलन σ = √${variance.toFixed(2)} = ${sd.toFixed(2)}`,
        result: `प्रसरण (σ²) = ${variance.toFixed(2)} | मानक विचलन (σ) = ${sd.toFixed(2)}`,
        extra: `विचरण गुणांक (CV) = ${(sd / mean * 100).toFixed(2)}%`,
        trick: `💡 NCERT टिप: यदि सभी पदों में कोई अचर जोड़ा जाए तो प्रसरण नहीं बदलता।`,
      });
      return;
    } else if (activeTool === "mean-median") {
      const nums = val1.split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n)).sort((a, b) => a - b);
      if (nums.length === 0) { alert("कृपया संख्याएँ दर्ज करें!"); return; }
      const sum = nums.reduce((acc, curr) => acc + curr, 0);
      const mean = sum / nums.length;
      const mid = Math.floor(nums.length / 2);
      const median = nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
      const freq: { [key: number]: number } = {};
      nums.forEach((x) => { freq[x] = (freq[x] || 0) + 1; });
      let maxFreq = 0;
      let mode: number | string = "कोई नहीं";
      for (const k in freq) {
        if (freq[k] > maxFreq && freq[k] > 1) { maxFreq = freq[k]; mode = parseFloat(k); }
      }
      setSolution({
        title: "माध्य, माध्यिका एवं बहुलक हल",
        formula: "माध्य = Σx / n | माध्यिका = मध्य पद | बहुलक = अधिकतम बारंबारता",
        step1: `आरोही क्रम: [${nums.join(", ")}], पद n = ${nums.length}`,
        step2: `1. कुल योग Σx = ${sum}\n` +
          `2. माध्य = ${sum} / ${nums.length} = ${mean.toFixed(2)}\n` +
          `3. मध्य पद (माध्यिका) = ${median}\n` +
          `4. सबसे अधिक बार आने वाला पद (बहुलक) = ${mode}`,
        result: `माध्य = ${mean.toFixed(2)} | माध्यिका = ${median} | बहुलक = ${mode}`,
        trick: `💡 अनुभवजन्य सूत्र: बहुलक ≈ 3(माध्यिका) - 2(माध्य)।`,
      });
      return;
    } else if (activeTool === "probability") {
      const fav = n1, total = n2;
      if (total <= 0 || fav < 0 || fav > total) { alert("अनुकूल परिणाम 0 और कुल के बीच होने चाहिए!"); return; }
      const prob = fav / total;
      setSolution({
        title: "साधारण प्रायिकता हल",
        formula: "P(E) = अनुकूल परिणाम n(E) / कुल परिणाम n(S)",
        step1: `अनुकूल परिणाम n(E) = ${fav}, कुल संभावित परिणाम n(S) = ${total}`,
        step2: `P(E) = ${fav} / ${total} = ${toFraction(fav, total)} = ${prob.toFixed(4)}`,
        result: `प्रायिकता P(E) = ${toFraction(fav, total)} (${(prob * 100).toFixed(2)}% संभावना)`,
        extra: `विपरीत घटना P(E') = 1 - P(E) = ${toFraction(total - fav, total)} (${((1 - prob) * 100).toFixed(2)}%)`,
        trick: `💡 प्रायिकता का मान सदैव 0 और 1 के बीच होता है (0 ≤ P ≤ 1)।`,
      });
      return;
    } else if (activeTool === "range-quartile") {
      const nums = val1.split(",").map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n)).sort((a, b) => a - b);
      if (nums.length < 2) { alert("कम से कम 2 संख्याएँ दर्ज करें!"); return; }
      const min = nums[0], max = nums[nums.length - 1];
      const q1 = nums[Math.floor(nums.length * 0.25)];
      const q3 = nums[Math.floor(nums.length * 0.75)];
      setSolution({
        title: "परास (Range) एवं IQR हल",
        formula: "Range = उच्चतम - न्यूनतम | IQR = Q₃ - Q₁",
        step1: `आरोही क्रम: [${nums.join(", ")}]`,
        step2: `1. न्यूनतम मान = ${min}, उच्चतम मान = ${max}\n` +
          `2. परास = ${max} - ${min} = ${max - min}\n` +
          `3. प्रथम चतुर्थक Q₁ = ${q1}, तृतीय चतुर्थक Q₃ = ${q3}\n` +
          `4. अंतर-चतुर्थक परास IQR = ${q3} - ${q1} = ${q3 - q1}`,
        result: `परास (Range) = ${max - min} | IQR = ${q3 - q1}`,
        trick: `💡 परास चरम मानों (Extreme Values) से अत्यधिक प्रभावित होता है।`,
      });
      return;
    }

    /* ========================================================
       3. उच्च गणित (Calculus - तीनों टूल्स 100% Active)
    ======================================================== */
    else if (activeTool === "diff-power") {
      const power = n1;
      const coeff = n2 || 1;
      setSolution({
        title: "पावर रूल अवकलन [ d/dx (c · xⁿ) ]",
        formula: "d/dx [c · xⁿ] = c · n · xⁿ⁻¹",
        step1: `फलन f(x) = ${coeff}x^${power}`,
        step2: `1. d/dx = ${coeff} × ${power} × x^(${power}-1)\n` +
          `2. d/dx = ${coeff * power}x^${power - 1}`,
        result: `अवकलन f'(x) = ${coeff * power}x^${power - 1}`,
        extra: `यदि x = 1, तो स्पर्श रेखा की ढाल = ${coeff * power}`,
        trick: `💡 किसी भी अचर संख्या (Constant) का अवकलन सदैव 0 होता है।`,
      });
      return;
    } else if (activeTool === "integration-power") {
      const power = n1, coeff = n2 || 1, lower = n3, upper = n4;
      if (power === -1) {
        setSolution({
          title: "विशिष्ट समाकलन [ ∫ (1/x) dx ]",
          formula: "∫ (1/x) dx = ln|x| + C",
          step1: `फलन f(x) = ${coeff}/x`,
          step2: `समाकलन = ${coeff} · ln|x| + C`,
          result: `उत्तर = ${coeff}ln|x| + C`,
          trick: `💡 x⁻¹ का समाकलन पावर रूल से नहीं बल्कि लघुगणक (ln) से होता है।`,
        });
        return;
      }
      const newPower = power + 1;
      const fracCoeff = toFraction(coeff, newPower);
      const defVal = (coeff / newPower) * (Math.pow(upper, newPower) - Math.pow(lower, newPower));
      setSolution({
        title: "पावर रूल समाकलन [ ∫ c · xⁿ dx ]",
        formula: "∫ c · xⁿ dx = c · [xⁿ⁺¹ / (n+1)] + C",
        step1: `फलन f(x) = ${coeff}x^${power}, n+1 = ${newPower}`,
        step2: `1. अनिश्चित समाकलन = (${coeff}/${newPower})x^${newPower} + C\n` +
          `2. सरलतम रूप = ${fracCoeff}x^${newPower} + C` +
          (upper !== lower ? `\n3. सीमा [${lower} से ${upper}] = ${defVal.toFixed(2)}` : ""),
        result: `अनिश्चित समाकलन = ${fracCoeff}x^${newPower} + C`,
        extra: upper !== lower ? `सीमाओं [${lower} से ${upper}] पर निश्चित मान = ${defVal.toFixed(2)}` : null,
        trick: `💡 समाकलन अवकलन का ठीक उल्टा (प्रति-अवकलज) होता है।`,
      });
      return;
    } else if (activeTool === "matrix-det") {
      const a = n1, b = n2, c = n3, d = n4;
      const det = a * d - b * c;
      setSolution({
        title: "2×2 आव्यूह सारणिक मान |A|",
        formula: "|A| = (a × d) - (b × c)",
        step1: `आव्यूह A = [[${a}, ${b}], [${c}, ${d}]]`,
        step2: `|A| = (${a} × ${d}) - (${b} × ${c}) = ${a * d} - ${b * c} = ${det}`,
        result: `सारणिक का मान (|A|) = ${det}`,
        extra: `प्रकृति: ${det !== 0 ? "व्युत्क्रमणीय (Invertible)" : "अव्युत्क्रमणीय (Singular Matrix)"}`,
        trick: `💡 यदि |A| = 0 हो, तो आव्यूह का प्रतिलोम (A⁻¹) निकालना संभव नहीं होता।`,
      });
      return;
    }

    /* ========================================================
       4. क्षेत्रमिति, बीजगणित, अंकगणित (बाकी सभी टूल्स)
    ======================================================== */
    else if (activeTool === "pythagoras") {
      const p = Math.max(n1, 0.1);
      const b = Math.max(n2, 0.1);
      const hSq = p * p + b * b;
      const h = Math.sqrt(hSq);

      const maxDim = Math.max(p, b);
      const scaledB = Math.max((b / maxDim) * 180, 45);
      const scaledP = Math.max((p / maxDim) * 90, 25);
      const rectBoxSize = Math.min(scaledP * 0.35, scaledB * 0.25, 12);

      const isPerfectSquare = Number.isInteger(h);
      const rootRep = isPerfectSquare ? `${h}` : `√${hSq} (≈ ${h.toFixed(2)})`;

      setSolution({
        title: "पाइथागोरस प्रमेय (समकोण त्रिभुज)",
        hasVisual: "triangle_clean",
        valP: p, valB: b, valH: rootRep,
        scaledB: scaledB.toFixed(0),
        scaledP: scaledP.toFixed(0),
        rectBoxSize: rectBoxSize.toFixed(0),
        formula: "कर्ण² = लंब² + आधार² ⇒ H = √(P² + B²)",
        step1: `लंब P = ${p} इकाई, आधार B = ${b} इकाई`,
        step2: `1. H² = (${p})² + (${b})²\n` +
          `2. H² = ${p * p} + ${b * b} = ${hSq}\n` +
          `3. H = √${hSq} = ${h.toFixed(2)} इकाई`,
        result: `कर्ण (Hypotenuse H) = ${rootRep} इकाई`,
        extra: `क्षेत्रफल = ½ × ${b} × ${p} = ${(0.5 * b * p).toFixed(2)} वर्ग इकाई`,
        trick: `💡 NCERT टिप: यदि पूर्ण वर्गमूल न निकले तो √${hSq} के रूप में उत्तर छोड़ें।`,
      });
      return;
    } else if (activeTool === "2d-circle") {
      const r = Math.max(n1, 1);
      const angle = n2 > 0 ? Math.min(n2, 360) : 60;
      const area = Math.PI * r * r;
      const peri = 2 * Math.PI * r;
      const sectorArea = (area * angle) / 360;
      const rad = (angle * Math.PI) / 180;
      const x2 = 90 + 65 * Math.cos(rad);
      const y2 = 90 - 65 * Math.sin(rad);
      const largeArc = angle > 180 ? 1 : 0;
      setSolution({
        title: `वृत्त एवं ${angle}° त्रिज्यखंड विश्लेषण`,
        hasVisual: "circle_dynamic",
        valRadius: r, valAngle: angle,
        sectorPath: `M 90,90 L 155,90 A 65,65 0 ${largeArc},0 ${x2.toFixed(1)},${y2.toFixed(1)} Z`,
        formula: "क्षेत्रफल = πr² | परिधि = 2πr | त्रिज्यखंड = (θ/360) × πr²",
        step1: `त्रिज्या r = ${r} इकाई, कोण θ = ${angle}°`,
        step2: `1. वृत्त क्षेत्रफल = π × (${r})² = ${area.toFixed(2)}\n` +
          `2. परिधि = 2 × π × ${r} = ${peri.toFixed(2)}\n` +
          `3. त्रिज्यखंड = (${angle}/360) × ${area.toFixed(2)} = ${sectorArea.toFixed(2)}`,
        result: `वृत्त क्षेत्रफल = ${area.toFixed(2)} वर्ग इकाई | परिधि = ${peri.toFixed(2)} इकाई`,
        extra: `${angle}° त्रिज्यखंड का क्षेत्रफल = ${sectorArea.toFixed(2)} वर्ग इकाई`,
        trick: `💡 छायांकित भाग ठीक ${angle}° का कोण दर्शाता है।`,
      });
      return;
    } else if (activeTool === "2d-rect") {
      const l = Math.max(n1, 1), b = Math.max(n2, 1);
      const maxDim = Math.max(l, b);
      const scaledW = Math.max((l / maxDim) * 160, 25);
      const scaledH = Math.max((b / maxDim) * 80, 20);
      setSolution({
        title: "आयत/वर्ग का क्षेत्रफल व परिमाप",
        hasVisual: "rect_dynamic",
        valL: l, valW: b,
        scaledW: scaledW.toFixed(0), scaledH: scaledH.toFixed(0),
        formula: "क्षेत्रफल = लंबाई × चौड़ाई | परिमाप = 2(लंबाई + चौड़ाई)",
        step1: `लंबाई = ${l}, चौड़ाई = ${b}`,
        step2: `क्षेत्रफल = ${l} × ${b} = ${l * b}, परिमाप = 2(${l} + ${b}) = ${2 * (l + b)}`,
        result: `क्षेत्रफल = ${l * b} वर्ग इकाई | परिमाप = ${2 * (l + b)} इकाई`,
        trick: `💡 लंबाई = चौड़ाई होने पर यह वर्ग बन जाता है।`,
      });
      return;
    } else if (activeTool === "triangle-area") {
      const a = n1, b = n2, c = n3;
      if (a + b <= c || a + c <= b || b + c <= a) { alert("अमान्य त्रिभुज: दो भुजाओं का योग तीसरी से बड़ा होना चाहिए!"); return; }
      const s = (a + b + c) / 2;
      const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
      setSolution({
        title: "त्रिभुज क्षेत्रफल (हीरोन का सूत्र)",
        formula: "s = (a+b+c)/2 | क्षेत्रफल = √[s(s-a)(s-b)(s-c)]",
        step1: `a = ${a}, b = ${b}, c = ${c} ⇒ अर्द्ध-परिमाप s = ${s}`,
        step2: `क्षेत्रफल = √[${s} × (${s - a}) × (${s - b}) × (${s - c})] = ${area.toFixed(2)}`,
        result: `क्षेत्रफल = ${area.toFixed(2)} वर्ग इकाई | परिमाप = ${a + b + c}`,
        trick: `💡 विषमबाहु त्रिभुज के लिए हीरोन सूत्र सर्वोत्तम है।`,
      });
      return;
    } else if (activeTool === "3d-cylinder-cone") {
      const r = n1, h = n2;
      const cylVol = Math.PI * r * r * h;
      setSolution({
        title: "3D बेलन व शंकु आयतन",
        formula: "बेलन आयतन = πr²h | शंकु आयतन = ⅓πr²h",
        step1: `r = ${r}, h = ${h}`,
        step2: `बेलन = π × ${r}² × ${h} = ${cylVol.toFixed(2)} | शंकु = ${cylVol.toFixed(2)} / 3`,
        result: `बेलन आयतन: ${cylVol.toFixed(2)} घन इकाई | शंकु आयतन: ${(cylVol / 3).toFixed(2)} घन इकाई`,
        trick: `💡 बेलन का आयतन शंकु से 3 गुना होता है।`,
      });
      return;
    } else if (activeTool === "3d-sphere") {
      const r = n1;
      const vol = (4 / 3) * Math.PI * Math.pow(r, 3);
      setSolution({
        title: "3D गोला एवं अर्धगोला",
        formula: "गोला आयतन = ⁴⁄₃πr³ | पृष्ठ = 4πr²",
        step1: `त्रिज्या r = ${r}`,
        step2: `आयतन = ⁴⁄₃ × π × ${r}³ = ${vol.toFixed(2)}`,
        result: `गोला आयतन = ${vol.toFixed(2)} घन इकाई | कुल पृष्ठ = ${(4 * Math.PI * r * r).toFixed(2)} वर्ग इकाई`,
        trick: `💡 अर्धगोले का संपूर्ण पृष्ठ 3πr² होता है।`,
      });
      return;
    } else if (activeTool === "quadratic") {
      const a = n1 || 1;
      const b = signB === "+" ? Math.abs(n2) : -Math.abs(n2);
      const c = signC === "+" ? Math.abs(n3) : -Math.abs(n3);
      const d = b * b - 4 * a * c;
      let rootInfo = "";
      if (d > 0) {
        const sqrtD = Math.sqrt(d);
        rootInfo = `x₁ = ${toFraction(-b + sqrtD, 2 * a)} (${((-b + sqrtD) / (2 * a)).toFixed(2)}), x₂ = ${toFraction(-b - sqrtD, 2 * a)} (${((-b - sqrtD) / (2 * a)).toFixed(2)})`;
      } else if (d === 0) {
        rootInfo = `समान मूल: x = ${toFraction(-b, 2 * a)}`;
      } else {
        rootInfo = `काल्पनिक मूल (D < 0)`;
      }
      setSolution({
        title: `द्विघात समीकरण हल: ${a}x² ${signB} ${Math.abs(n2)}x ${signC} ${Math.abs(n3)} = 0`,
        formula: "श्रीधराचार्य सूत्र: x = [-b ± √(b² - 4ac)] / 2a",
        step1: `a = ${a}, b = ${b}, c = ${c} | विविक्तकर D = ${d}`,
        step2: `x = [-(${b}) ± √${d}] / [2 × ${a}]`,
        result: `सटीक मूल: ${rootInfo}`,
        extra: `मूलों का योग = ${toFraction(-b, a)} | गुणनफल = ${toFraction(c, a)}`,
        trick: `💡 D > 0 होने पर मूल वास्तविक होते हैं।`,
      });
      return;
    } else if (activeTool === "linear-1var") {
      if (n1 === 0) { alert("x का गुणांक 0 नहीं हो सकता!"); return; }
      const diff = n3 - n2;
      setSolution({
        title: "एक चर वाले रैखिक समीकरण हल",
        formula: "ax + b = c ⇒ x = (c - b) / a",
        step1: `${n1}x + ${n2} = ${n3}`,
        step2: `${n1}x = ${diff} ⇒ x = ${diff} / ${n1}`,
        result: `x = ${toFraction(diff, n1)} (${(diff / n1).toFixed(2)})`,
        trick: `💡 पक्षांतर करने पर चिन्ह विपरीत हो जाते हैं।`,
      });
      return;
    } else if (activeTool === "linear-2var") {
      const a1 = n1, b1 = n2, c1 = n3;
      const a2 = parseFloat(val4) || 0, b2 = parseFloat(val5) || 0, c2 = parseFloat(val6) || 0;
      const det = a1 * b2 - a2 * b1;
      if (det === 0) { alert("समानांतर रेखाएं: अद्वितीय हल संभव नहीं!"); return; }
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      setSolution({
        title: "युगपत समीकरण हल (2 Variables)",
        formula: "विलोपन व क्रेमर नियम",
        step1: `${a1}x + ${b1}y = ${c1}  तथा  ${a2}x + ${b2}y = ${c2}`,
        step2: `Det = ${det} ⇒ x = ${x.toFixed(2)}, y = ${y.toFixed(2)}`,
        result: `x = ${toFraction(c1 * b2 - c2 * b1, det)} (${x.toFixed(2)}) | y = ${toFraction(a1 * c2 - a2 * c1, det)} (${y.toFixed(2)})`,
        trick: `💡 a₁/a₂ ≠ b₁/b₂ होने पर अद्वितीय हल मिलता है।`,
      });
      return;
    } else if (activeTool === "ap-series") {
      const a = n1, d = n2, n = n3;
      const tn = a + (n - 1) * d;
      const sn = (n / 2) * (2 * a + (n - 1) * d);
      setSolution({
        title: "समांतर श्रेणी (A.P.)",
        formula: "Tₙ = a + (n-1)d | Sₙ = n/2 [2a + (n-1)d]",
        step1: `a = ${a}, d = ${d}, n = ${n}`,
        step2: `T_${n} = ${a} + (${n}-1)×${d} = ${tn} | S_${n} = ${sn}`,
        result: `${n}वाँ पद = ${tn} | कुल योग = ${sn}`,
        trick: `💡 योग = पद संख्या × (पहला + अंतिम) / 2।`,
      });
      return;
    } else if (activeTool === "indices") {
      setSolution({
        title: "घातांक नियम",
        formula: "aⁿ = a × a... (n बार)",
        step1: `आधार = ${n1}, घात = ${n2}`,
        step2: `${n1}^(${n2}) = ${Math.pow(n1, n2)}`,
        result: `मान = ${Math.pow(n1, n2).toLocaleString()}`,
        trick: `💡 a⁰ = 1 सदैव होता है।`,
      });
      return;
    } else if (activeTool === "si-ci") {
      let tYears = n3;
      if (timeUnit === "months") tYears = n3 / 12;
      else if (timeUnit === "days") tYears = n3 / 365;

      if (interestTarget === "si") {
        const p = n1, r = n2;
        const si = (p * r * tYears) / 100;
        setSolution({
          title: "साधारण ब्याज विश्लेषण",
          formula: "SI = (P × R × T) / 100",
          step1: `P = ₹${p}, R = ${r}%, समय = ${n3} ${timeUnit}`,
          step2: `SI = (${p} × ${r} × ${tYears.toFixed(3)}) / 100 = ₹${si.toFixed(2)}`,
          result: `साधारण ब्याज = ₹${si.toFixed(2)} | मिश्रधन = ₹${(p + si).toFixed(2)}`,
          trick: `💡 महीनों को 12 से भाग देकर वर्ष बनाएं।`,
        });
      } else if (interestTarget === "p") {
        const p = (n1 * 100) / (n2 * tYears);
        setSolution({
          title: "मूलधन (P) ज्ञात करना",
          formula: "P = (SI × 100) / (R × T)",
          step1: `SI = ₹${n1}, R = ${n2}%, T = ${tYears.toFixed(3)} वर्ष`,
          step2: `P = (${n1} × 100) / (${n2} × ${tYears.toFixed(3)}) = ₹${p.toFixed(2)}`,
          result: `मूलधन P = ₹${p.toFixed(2)}`,
          trick: `💡 P = (100 × ब्याज) / (दर × समय)।`,
        });
      }
      return;
    } else if (activeTool === "lcm-hcf") {
      const nums = [parseInt(val1, 10), parseInt(val2, 10), parseInt(val3, 10)].filter((n) => !isNaN(n) && n > 0);
      let hcf = nums[0];
      for (let i = 1; i < nums.length; i++) hcf = getGcd(hcf, nums[i]);
      let lcm = nums[0];
      for (let i = 1; i < nums.length; i++) lcm = (lcm * nums[i]) / getGcd(lcm, nums[i]);
      setSolution({
        title: `ल.स.प. व म.स.प. हल: [${nums.join(", ")}]`,
        formula: "अभाज्य गुणनखंड विधि",
        step1: `संख्याएँ: ${nums.join(", ")}`,
        step2: nums.map((n) => `${n} = ${getPrimeFactors(n)}`).join(" | "),
        result: `HCF = ${hcf} | LCM = ${lcm}`,
        trick: `💡 दो संख्याओं का गुणनफल = HCF × LCM।`,
      });
      return;
    } else if (activeTool === "speed-dist") {
      let distKm = n1;
      if (distUnit === "m") distKm = n1 / 1000;
      let timeHours = n2;
      if (timeSpeedUnit === "minutes") timeHours = n2 / 60;
      else if (timeSpeedUnit === "seconds") timeHours = n2 / 3600;
      const speedKmh = timeHours > 0 ? distKm / timeHours : 0;
      setSolution({
        title: "चाल, दूरी एवं समय हल",
        formula: "चाल = दूरी / समय",
        step1: `दूरी = ${distKm} km, समय = ${timeHours.toFixed(3)} h`,
        step2: `चाल = ${distKm} / ${timeHours.toFixed(3)} = ${speedKmh.toFixed(2)} km/h`,
        result: `गति = ${speedKmh.toFixed(2)} km/h (${(speedKmh * 5 / 18).toFixed(2)} m/s)`,
        trick: `💡 1 km/h = 5/18 m/s।`,
      });
      return;
    } else if (activeTool === "profit-loss") {
      const diff = n2 - n1;
      const isProfit = diff >= 0;
      const pct = n1 > 0 ? (Math.abs(diff) / n1) * 100 : 0;
      setSolution({
        title: "लाभ-हानि समाधान",
        formula: isProfit ? "लाभ = SP - CP" : "हानि = CP - SP",
        step1: `CP = ₹${n1}, SP = ₹${n2}`,
        step2: `अंतर = ₹${Math.abs(diff).toFixed(2)}`,
        result: isProfit ? `लाभ: ₹${diff.toFixed(2)} (${pct.toFixed(2)}%)` : `हानि: ₹${Math.abs(diff).toFixed(2)} (${pct.toFixed(2)}%)`,
        trick: `💡 प्रतिशत सदैव क्रय मूल्य पर निकलता है।`,
      });
      return;
    } else if (activeTool === "percentage") {
      const val = (n1 * n2) / 100;
      setSolution({
        title: "प्रतिशत मान समाधान",
        formula: "मान = (कुल संख्या × प्रतिशत) / 100",
        step1: `संख्या = ${n1}, प्रतिशत = ${n2}%`,
        step2: `(${n1} × ${n2}) / 100 = ${val.toFixed(2)}`,
        result: `${n1} का ${n2}% = ${val.toFixed(2)}`,
        trick: `💡 10% के लिए 1 अंक बाद दशमलव लगाएँ।`,
      });
      return;
    } else if (activeTool === "time-work") {
      const num = n1 * n2, den = n1 + n2;
      setSolution({
        title: "कार्य एवं समय हल",
        formula: "संयुक्त दिन = (A × B) / (A + B)",
        step1: `A = ${n1} दिन, B = ${n2} दिन`,
        step2: `कुल दिन = (${n1} × ${n2}) / (${n1} + ${n2}) = ${num} / ${den}`,
        result: `दोनों मिलकर = ${toFraction(num, den)} दिन (या ${(num / den).toFixed(2)} दिन)`,
        trick: `💡 कार्यक्षमता दिनों के व्युत्क्रमानुपाती होती है।`,
      });
      return;
    }
  };

  const currCat = CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* शीर्ष नेविगेशन */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
        <Link
          href="/calculators"
          className="text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          ← सभी कैलकुलेटर हब पर वापस
        </Link>
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
          Academic Precision Hub
        </span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">गणित स्टेप-बाय-स्टेप व विज़ुअल सॉल्वर</h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
          एनसीईआरटी व बोर्ड परीक्षा अनुसार 28 प्रामाणिक गणितीय टूल्स का संपूर्ण संग्रह।
        </p>
      </div>

      {/* लेयर 1: 6 श्रेणियां */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 mb-6">
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

      {/* लेयर 2: सब-टूल बटन्स */}
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

      {/* लेयर 3: मुख्य वर्किंग कार्ड */}
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
          <button
            onClick={handleReset}
            className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 self-start sm:self-auto"
          >
            🔄 रीसेट करें
          </button>
        </div>

        {/* ब्याज टारगेट मोड */}
        {activeTool === "si-ci" && (
          <div className="mb-4 p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200">
            <span className="text-xs font-black text-indigo-900 block mb-2">🎯 आप क्या ज्ञात करना चाहते हैं?</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "si", label: "साधारण ब्याज (SI)" },
                { id: "p", label: "मूलधन (P)" },
                { id: "r", label: "वार्षिक दर (R)" },
                { id: "t", label: "समय (T)" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setInterestTarget(m.id as any); setSolution(null); }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-black transition-all ${
                    interestTarget === m.id
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* डायनेमिक इनपुट्स */}
        <div className="space-y-4">
          {activeTool === "quadratic" ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300">
              <label className="block text-xs font-black text-slate-800 mb-2">
                समीकरण दर्ज करें (चिन्हों पर टैप करके + या - बदलें):
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={val1}
                    onFocus={() => setActiveInputName("val1")}
                    onChange={(e) => setVal1(e.target.value)}
                    className="w-16 px-2.5 py-2 rounded-xl border-2 border-slate-300 font-bold text-center text-sm"
                    placeholder="a"
                  />
                  <span className="font-black text-sm text-slate-800">x²</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSignB((prev) => (prev === "+" ? "-" : "+"))}
                  className="w-9 h-9 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-black text-base border-2 border-indigo-300"
                >
                  {signB}
                </button>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={val2}
                    onFocus={() => setActiveInputName("val2")}
                    onChange={(e) => setVal2(e.target.value)}
                    className="w-16 px-2.5 py-2 rounded-xl border-2 border-slate-300 font-bold text-center text-sm"
                    placeholder="b"
                  />
                  <span className="font-black text-sm text-slate-800">x</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSignC((prev) => (prev === "+" ? "-" : "+"))}
                  className="w-9 h-9 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-black text-base border-2 border-indigo-300"
                >
                  {signC}
                </button>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={val3}
                    onFocus={() => setActiveInputName("val3")}
                    onChange={(e) => setVal3(e.target.value)}
                    className="w-16 px-2.5 py-2 rounded-xl border-2 border-slate-300 font-bold text-center text-sm"
                    placeholder="c"
                  />
                  <span className="font-black text-sm text-slate-800">= 0</span>
                </div>
              </div>
            </div>
          ) : activeTool === "linear-2var" ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200">
                <span className="text-xs font-black text-indigo-900 block mb-2">समीकरण 1: a₁x + b₁y = c₁</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">a₁ (x का गुणांक):</label>
                    <input
                      type="text"
                      value={val1}
                      onFocus={() => setActiveInputName("val1")}
                      onChange={(e) => setVal1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-bold text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">b₁ (y का गुणांक):</label>
                    <input
                      type="text"
                      value={val2}
                      onFocus={() => setActiveInputName("val2")}
                      onChange={(e) => setVal2(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-bold text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">c₁ (अचर मान):</label>
                    <input
                      type="text"
                      value={val3}
                      onFocus={() => setActiveInputName("val3")}
                      onChange={(e) => setVal3(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-bold text-sm text-center"
                    />
                  </div>
                </div>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200">
                <span className="text-xs font-black text-emerald-900 block mb-2">समीकरण 2: a₂x + b₂y = c₂</span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">a₂ (x का गुणांक):</label>
                    <input
                      type="text"
                      value={val4}
                      onFocus={() => setActiveInputName("val4")}
                      onChange={(e) => setVal4(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-bold text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">b₂ (y का गुणांक):</label>
                    <input
                      type="text"
                      value={val5}
                      onFocus={() => setActiveInputName("val5")}
                      onChange={(e) => setVal5(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-bold text-sm text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">c₂ (अचर मान):</label>
                    <input
                      type="text"
                      value={val6}
                      onFocus={() => setActiveInputName("val6")}
                      onChange={(e) => setVal6(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 font-bold text-sm text-center"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : activeTool === "matrix-det" ? (
            <div>
              <label className="block text-xs font-black text-slate-800 mb-2">2×2 आव्यूह के मान भरें:</label>
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <input
                  type="text"
                  value={val1}
                  onFocus={() => setActiveInputName("val1")}
                  onChange={(e) => setVal1(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-slate-300 text-center font-bold text-sm"
                  placeholder="a"
                />
                <input
                  type="text"
                  value={val2}
                  onFocus={() => setActiveInputName("val2")}
                  onChange={(e) => setVal2(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-slate-300 text-center font-bold text-sm"
                  placeholder="b"
                />
                <input
                  type="text"
                  value={val3}
                  onFocus={() => setActiveInputName("val3")}
                  onChange={(e) => setVal3(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-slate-300 text-center font-bold text-sm"
                  placeholder="c"
                />
                <input
                  type="text"
                  value={val4}
                  onFocus={() => setActiveInputName("val4")}
                  onChange={(e) => setVal4(e.target.value)}
                  className="px-3 py-2 rounded-xl border-2 border-slate-300 text-center font-bold text-sm"
                  placeholder="d"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* बॉक्स 1 */}
              <div className={activeTool === "mean-median" || activeTool === "variance-sd" || activeTool === "range-quartile" ? "sm:col-span-3" : ""}>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  {activeTool === "trigo-val" ? "कोण (° अंश में):"
                    : activeTool === "height-dist" ? "आधार से दूरी (मीटर):"
                    : activeTool === "deg-rad" ? "कोण (° अंश में):"
                    : activeTool === "trigo-identities" ? "कोण θ (° अंश में):"
                    : activeTool === "pythagoras" ? "लंब (Perpendicular P):"
                    : activeTool === "2d-circle" ? "त्रिज्या (Radius r):"
                    : activeTool === "2d-rect" ? "लंबाई (Length):"
                    : activeTool === "triangle-area" ? "भुजा a:"
                    : activeTool === "3d-cylinder-cone" ? "त्रिज्या (r):"
                    : activeTool === "3d-sphere" ? "त्रिज्या (r):"
                    : activeTool === "si-ci" ? (interestTarget === "si" ? "मूलधन (P ₹):" : "साधारण ब्याज (SI ₹):")
                    : activeTool === "speed-dist" ? "दूरी (Distance):"
                    : activeTool === "lcm-hcf" ? "पहली संख्या:"
                    : activeTool === "profit-loss" ? "क्रय मूल्य (CP ₹):"
                    : activeTool === "percentage" ? "कुल संख्या:"
                    : activeTool === "time-work" ? "A के दिन:"
                    : activeTool === "linear-1var" ? "a (x का गुणांक):"
                    : activeTool === "ap-series" ? "प्रथम पद (a):"
                    : activeTool === "indices" ? "आधार (Base a):"
                    : (activeTool === "mean-median" || activeTool === "variance-sd" || activeTool === "range-quartile")
                    ? "संख्याएँ दर्ज करें (कॉमा लगाकर, उदा. 4, 8, 12, 16, 20):"
                    : activeTool === "probability" ? "अनुकूल परिणाम n(E):"
                    : activeTool === "diff-power" ? "x की घात (Power n):"
                    : activeTool === "integration-power" ? "x की घात (Power n):"
                    : "मान 1:"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={val1}
                    onFocus={() => setActiveInputName("val1")}
                    onChange={(e) => setVal1(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
                  />
                  {activeTool === "speed-dist" && (
                    <select
                      value={distUnit}
                      onChange={(e) => setDistUnit(e.target.value as any)}
                      className="px-2 py-2 rounded-xl border-2 border-slate-300 font-bold text-xs bg-slate-50"
                    >
                      <option value="km">किमी</option>
                      <option value="m">मीटर</option>
                    </select>
                  )}
                </div>
              </div>

              {/* बॉक्स 2 */}
              {activeTool !== "trigo-val" &&
                activeTool !== "deg-rad" &&
                activeTool !== "trigo-identities" &&
                activeTool !== "3d-sphere" &&
                activeTool !== "diff-power" &&
                activeTool !== "mean-median" &&
                activeTool !== "variance-sd" &&
                activeTool !== "range-quartile" && (
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      {activeTool === "height-dist" ? "उन्नयन कोण θ (°):"
                        : activeTool === "pythagoras" ? "आधार (Base B):"
                        : activeTool === "2d-circle" ? "त्रिज्यखंड कोण θ (°):"
                        : activeTool === "2d-rect" ? "चौड़ाई (Width):"
                        : activeTool === "triangle-area" ? "भुजा b:"
                        : activeTool === "3d-cylinder-cone" ? "ऊँचाई (h):"
                        : activeTool === "si-ci" ? (interestTarget === "r" ? "मूलधन (P ₹):" : "वार्षिक दर (R %):")
                        : activeTool === "speed-dist" ? "समय (Time):"
                        : activeTool === "lcm-hcf" ? "दूसरी संख्या:"
                        : activeTool === "profit-loss" ? "विक्रय मूल्य (SP ₹):"
                        : activeTool === "percentage" ? "प्रतिशत (%):"
                        : activeTool === "time-work" ? "B के दिन:"
                        : activeTool === "linear-1var" ? "b (अचर पद):"
                        : activeTool === "ap-series" ? "सार्व अंतर (d):"
                        : activeTool === "indices" ? "घात (Exponent n):"
                        : activeTool === "probability" ? "कुल संभावित परिणाम n(S):"
                        : activeTool === "integration-power" ? "गुणांक (Coefficient c):"
                        : "मान 2:"}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={val2}
                        onFocus={() => setActiveInputName("val2")}
                        onChange={(e) => setVal2(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
                      />
                      {activeTool === "speed-dist" && (
                        <select
                          value={timeSpeedUnit}
                          onChange={(e) => setTimeSpeedUnit(e.target.value as any)}
                          className="px-2 py-2 rounded-xl border-2 border-slate-300 font-bold text-xs bg-slate-50"
                        >
                          <option value="hours">घंटे</option>
                          <option value="minutes">मिनट</option>
                          <option value="seconds">सेकंड</option>
                        </select>
                      )}
                    </div>
                  </div>
                )}

              {/* बॉक्स 3 */}
              {(activeTool === "si-ci" ||
                activeTool === "lcm-hcf" ||
                activeTool === "profit-loss" ||
                activeTool === "percentage" ||
                activeTool === "linear-1var" ||
                activeTool === "ap-series" ||
                activeTool === "triangle-area" ||
                activeTool === "integration-power") && (
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    {activeTool === "si-ci" ? (interestTarget === "t" ? "वार्षिक दर (R %):" : "समय (Time अवधि):")
                      : activeTool === "lcm-hcf" ? "तीसरी संख्या:"
                      : activeTool === "profit-loss" ? "छूट % (Discount):"
                      : activeTool === "percentage" ? "परिवर्तित मान:"
                      : activeTool === "linear-1var" ? "c (बराबर मान):"
                      : activeTool === "ap-series" ? "पदों की संख्या (n):"
                      : activeTool === "triangle-area" ? "भुजा c:"
                      : "निचली सीमा (Lower Limit a):"}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={val3}
                      onFocus={() => setActiveInputName("val3")}
                      onChange={(e) => setVal3(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
                    />
                    {activeTool === "si-ci" && interestTarget !== "t" && (
                      <select
                        value={timeUnit}
                        onChange={(e) => setTimeUnit(e.target.value as any)}
                        className="px-2 py-2 rounded-xl border-2 border-slate-300 font-bold text-xs bg-slate-50"
                      >
                        <option value="years">वर्ष</option>
                        <option value="months">माह</option>
                        <option value="days">दिन</option>
                      </select>
                    )}
                  </div>
                </div>
              )}

              {/* बॉक्स 4 (समाकलन की ऊपरी सीमा) */}
              {activeTool === "integration-power" && (
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    ऊपरी सीमा (Upper Limit b):
                  </label>
                  <input
                    type="text"
                    value={val4}
                    onFocus={() => setActiveInputName("val4")}
                    onChange={(e) => setVal4(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-sm focus:border-indigo-600 focus:outline-none"
                    placeholder="2"
                  />
                </div>
              )}
            </div>
          )}

          {/* ऑन-स्क्रीन सिंबल बार */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] font-black text-indigo-700">टच सिंबल:</span>
            {["²", "√", "±", "π", "°", "/", "+", "-", "×", "θ", "∫", "dx", "σ"].map((sym) => (
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
        </div>

        {/* एक्शन बटन */}
        <div className="mt-6">
          <button
            onClick={handleSolve}
            className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-md transition-all active:scale-98"
          >
            🚀 स्टेप-बाय-स्टेप हल व डायनेमिक रेखाचित्र देखें (Solve)
          </button>
        </div>

        {/* समाधान व विज़ुअल प्रीव्यू कार्ड */}
        {solution && (
          <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-slate-50 border-2 border-indigo-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <span className="text-sm font-black text-indigo-700">{solution.title}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySolution}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  {copySuccess ? "✅ कॉपी हो गया!" : "📋 हल कॉपी करें"}
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1 shadow-2xs"
                >
                  🖨️ प्रिंट / PDF
                </button>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  100% सटीक हल
                </span>
              </div>
            </div>

            {/* डायनेमिक समकोण आरेख (Zero Overlap SVG) */}
            {solution.hasVisual === "triangle_clean" && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-500 mb-2">लाइव अनुपाती रेखाचित्र: समकोण आरेख</span>
                <svg width="280" height="150" viewBox="0 0 280 150">
                  <polygon
                    points={`50,120 ${50 + parseFloat(solution.scaledB)},120 50,${120 - parseFloat(solution.scaledP)}`}
                    fill="#ECFDF5"
                    stroke="#059669"
                    strokeWidth="2.5"
                  />
                  <rect
                    x="50"
                    y={120 - parseFloat(solution.rectBoxSize)}
                    width={solution.rectBoxSize}
                    height={solution.rectBoxSize}
                    fill="none"
                    stroke="#059669"
                    strokeWidth="1.5"
                  />
                  <text
                    x="42"
                    y={120 - parseFloat(solution.scaledP) / 2}
                    fill="#DC2626"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="end"
                    dominantBaseline="middle"
                  >
                    P = {solution.valP}
                  </text>
                  <text
                    x={50 + parseFloat(solution.scaledB) / 2}
                    y="138"
                    fill="#2563EB"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    B = {solution.valB}
                  </text>
                  <text
                    x={50 + parseFloat(solution.scaledB) / 2 + 10}
                    y={120 - parseFloat(solution.scaledP) / 2 - 8}
                    fill="#7C3AED"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    H = {solution.valH}
                  </text>
                </svg>
              </div>
            )}

            {/* डायनेमिक वृत्त */}
            {solution.hasVisual === "circle_dynamic" && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-500 mb-2">
                  लाइव रेखाचित्र: वृत्त एवं {solution.valAngle}° त्रिज्यखंड
                </span>
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle cx="90" cy="90" r="65" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="2.5" />
                  <path d={solution.sectorPath} fill="#C7D2FE" stroke="#4338CA" strokeWidth="2" opacity="0.8" />
                  <line x1="90" y1="90" x2="155" y2="90" stroke="#DC2626" strokeWidth="2" />
                  <circle cx="90" cy="90" r="3.5" fill="#4F46E5" />
                  <text x="110" y="84" fill="#DC2626" fontSize="10" fontWeight="bold">r = {solution.valRadius}</text>
                  <text x="102" y="105" fill="#4338CA" fontSize="9" fontWeight="bold">{solution.valAngle}°</text>
                </svg>
              </div>
            )}

            {/* डायनेमिक आयत */}
            {solution.hasVisual === "rect_dynamic" && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col items-center">
                <span className="text-[11px] font-black text-slate-500 mb-2">
                  लाइव अनुपाती रेखाचित्र: {solution.valL === solution.valW ? "वर्ग (Square)" : "आयत (Rectangle)"}
                </span>
                <svg width="220" height="130" viewBox="0 0 220 130">
                  <rect
                    x={(220 - parseFloat(solution.scaledW)) / 2}
                    y={(120 - parseFloat(solution.scaledH)) / 2}
                    width={solution.scaledW}
                    height={solution.scaledH}
                    fill="#FEF3C7"
                    stroke="#D97706"
                    strokeWidth="3"
                    rx="4"
                  />
                  <text
                    x="110"
                    y={(120 - parseFloat(solution.scaledH)) / 2 - 6}
                    fill="#B45309"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    लंबाई = {solution.valL}
                  </text>
                  <text
                    x={(220 + parseFloat(solution.scaledW)) / 2 + 6}
                    y="65"
                    fill="#B45309"
                    fontSize="11"
                    fontWeight="bold"
                    dominantBaseline="middle"
                  >
                    चौड़ाई = {solution.valW}
                  </text>
                </svg>
              </div>
            )}

            {/* सूत्र एवं स्टेप्स */}
            <div className="text-xs sm:text-sm space-y-2 text-slate-700">
              <p className="font-bold text-slate-900 bg-indigo-50/70 p-2.5 rounded-xl border border-indigo-100">
                <span className="text-indigo-700">लागू सूत्र / सिद्धांत:</span> {solution.formula}
              </p>
              <p className="p-1">
                <span className="font-bold text-slate-900">चरण 1 (दिए गए मान):</span> {solution.step1}
              </p>
              <div className="p-1 whitespace-pre-line font-medium text-slate-800">
                <span className="font-bold text-slate-900">चरण 2 (गणना प्रक्रिया):</span>{"\n"}{solution.step2}
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
