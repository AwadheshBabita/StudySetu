'use client';

import React, { useState } from 'react';

interface PhysicsTopic {
  id: string;
  name: string;
  icon: string;
  badge: string;
  questions: {
    title: string;
    description: string;
    inputs: { id: string; label: string; unit: string; defaultVal: number }[];
    solve: (vals: Record<string, number>) => {
      given: string[];
      toFind: string[];
      formula: string;
      steps: string[];
      finalAnswer: string;
      examTip: string;
    };
  }[];
}

const TOPICS: PhysicsTopic[] = [
  {
    id: 'kinematics',
    name: 'गति के नियम व समीकरण',
    icon: '🚗',
    badge: 'Kinematics',
    questions: [
      {
        title: 'ब्रेक लगाने पर रुकने वाली गाड़ी (मंदन व दूरी)',
        description: 'गाड़ी किसी चाल से चल रही है और ब्रेक लगाने पर कुछ सेकंड में रुक जाती है।',
        inputs: [
          { id: 'u_kmh', label: 'प्रारंभिक चाल (u)', unit: 'km/h', defaultVal: 72 },
          { id: 't', label: 'रुकने में लगा समय (t)', unit: 'सेकंड', defaultVal: 5 },
        ],
        solve: (v) => {
          const u_ms = (v.u_kmh * 5) / 18;
          const a = (0 - u_ms) / v.t;
          const s = (u_ms * v.t) + (0.5 * a * Math.pow(v.t, 2));
          return {
            given: [
              `प्रारंभिक वेग (u) = ${v.u_kmh} km/h = ${v.u_kmh} × (5/18) = ${u_ms.toFixed(2)} m/s`,
              `अंतिम वेग (v) = 0 m/s (क्योंकि गाड़ी रुक जाती है)`,
              `समय (t) = ${v.t} सेकंड`,
            ],
            toFind: ['मंदन / त्वरण (a)', 'रुकने से पहले तय दूरी (s)'],
            formula: 'v = u + at तथा s = ut + ½at²',
            steps: [
              `त्वरण: a = (v - u) / t = (0 - ${u_ms.toFixed(2)}) / ${v.t} = ${a.toFixed(2)} m/s²`,
              `दूरी: s = (${u_ms.toFixed(2)} × ${v.t}) + [0.5 × (${a.toFixed(2)}) × (${v.t})²]`,
              `s = ${(u_ms * v.t).toFixed(2)} - ${(0.5 * Math.abs(a) * Math.pow(v.t, 2)).toFixed(2)} = ${s.toFixed(2)} मीटर`,
            ],
            finalAnswer: `मंदन (Retardation) = ${Math.abs(a).toFixed(2)} m/s², तय दूरी = ${s.toFixed(2)} m`,
            examTip: 'परीक्षा में "रुक जाती है" लिखा हो तो अंतिम वेग (v) हमेशा 0 m/s लिया जाता है।',
          };
        },
      },
      {
        title: 'विरामावस्था से त्वरित गति (0 से शुरू)',
        description: 'वस्तु स्थिर अवस्था से निश्चित त्वरण के साथ चलना शुरू करती है।',
        inputs: [
          { id: 'a', label: 'त्वरण (a)', unit: 'm/s²', defaultVal: 2 },
          { id: 't', label: 'समय (t)', unit: 'सेकंड', defaultVal: 10 },
        ],
        solve: (v) => {
          const finalV = v.a * v.t;
          const dist = 0.5 * v.a * Math.pow(v.t, 2);
          return {
            given: [
              `प्रारंभिक वेग (u) = 0 m/s (विरामावस्था से शुरू)`,
              `त्वरण (a) = ${v.a} m/s²`,
              `समय (t) = ${v.t} सेकंड`,
            ],
            toFind: ['अंतिम वेग (v)', 'तय दूरी (s)'],
            formula: 'v = u + at तथा s = ut + ½at²',
            steps: [
              `अंतिम वेग: v = 0 + (${v.a} × ${v.t}) = ${finalV.toFixed(2)} m/s`,
              `दूरी: s = (0 × ${v.t}) + [0.5 × ${v.a} × (${v.t})²] = ${dist.toFixed(2)} मीटर`,
            ],
            finalAnswer: `अंतिम वेग = ${finalV.toFixed(2)} m/s (${(finalV * 3.6).toFixed(1)} km/h), कुल दूरी = ${dist.toFixed(2)} m`,
            examTip: '"विरामावस्था (Rest)" का अर्थ है प्रारंभिक वेग (u) = 0 होता है।',
          };
        },
      },
    ],
  },
  {
    id: 'force',
    name: 'बल और संवेग (Force & Momentum)',
    icon: '🥊',
    badge: 'Newton Laws',
    questions: [
      {
        title: 'पिंड पर आरोपित बल (F = ma)',
        description: 'दिए गए द्रव्यमान पर वेग परिवर्तन के आधार पर आवश्यक बल की गणना।',
        inputs: [
          { id: 'm', label: 'द्रव्यमान (m)', unit: 'kg', defaultVal: 1200 },
          { id: 'u', label: 'प्रारंभिक वेग (u)', unit: 'm/s', defaultVal: 10 },
          { id: 'v', label: 'अंतिम वेग (v)', unit: 'm/s', defaultVal: 25 },
          { id: 't', label: 'समय (t)', unit: 'सेकंड', defaultVal: 5 },
        ],
        solve: (v) => {
          const a = (v.v - v.u) / v.t;
          const f = v.m * a;
          const p1 = v.m * v.u;
          const p2 = v.m * v.v;
          return {
            given: [
              `द्रव्यमान (m) = ${v.m} kg`,
              `प्रारंभिक वेग (u) = ${v.u} m/s`,
              `अंतिम वेग (v) = ${v.v} m/s`,
              `समय (t) = ${v.t} सेकंड`,
            ],
            toFind: ['त्वरण (a)', 'संवेग परिवर्तन (Δp)', 'आवश्यक बल (F)'],
            formula: 'F = m × a = (p₂ - p₁) / t',
            steps: [
              `त्वरण: a = (${v.v} - ${v.u}) / ${v.t} = ${a.toFixed(2)} m/s²`,
              `प्रारंभिक संवेग (p₁) = ${v.m} × ${v.u} = ${p1} kg·m/s`,
              `अंतिम संवेग (p₂) = ${v.m} × ${v.v} = ${p2} kg·m/s`,
              `बल: F = ${v.m} × ${a.toFixed(2)} = ${f.toFixed(2)} न्यूटन (N)`,
            ],
            finalAnswer: `बल (F) = ${f.toFixed(2)} N, संवेग परिवर्तन = ${(p2 - p1).toFixed(2)} kg·m/s`,
            examTip: 'न्यूटन के द्वितीय नियमानुसार संवेग परिवर्तन की दर ही आरोपित बल कहलाती है।',
          };
        },
      },
    ],
  },
  {
    id: 'gravity',
    name: 'गुरुत्वाकर्षण व मुक्त पतन',
    icon: '🍎',
    badge: 'Gravitation',
    questions: [
      {
        title: 'ऊपर फेंकी गई गेंद (अधिकतम ऊँचाई व कुल समय)',
        description: 'जमीन से ऊर्ध्वाधर ऊपर की ओर फेंकी गई वस्तु कितनी ऊँचाई तक जाएगी।',
        inputs: [
          { id: 'u', label: 'फेंकने का वेग (u)', unit: 'm/s', defaultVal: 29.4 },
        ],
        solve: (v) => {
          const g = 9.8;
          const t_up = v.u / g;
          const h_max = Math.pow(v.u, 2) / (2 * g);
          const total_t = 2 * t_up;
          return {
            given: [
              `प्रारंभिक वेग (u) = ${v.u} m/s`,
              `उच्चतम बिंदु पर वेग (v) = 0 m/s`,
              `गुरुत्वीय त्वरण (g) = -9.8 m/s² (ऊपर जाते समय ऋणात्मक)`,
            ],
            toFind: ['अधिकतम ऊँचाई (H_max)', 'ऊपर जाने का समय (t)', 'वापस लौटने का कुल समय (T)'],
            formula: 'v² = u² - 2gh तथा v = u - gt',
            steps: [
              `ऊँचाई: 0 = (${v.u})² - 2(9.8)(H) ⇒ H = (${v.u}²) / 19.6 = ${h_max.toFixed(2)} मीटर`,
              `ऊपर पहुँचने का समय: t = u / g = ${v.u} / 9.8 = ${t_up.toFixed(2)} सेकंड`,
              `कुल उड़ान समय (उड़ान + पतन): T = 2 × t = ${total_t.toFixed(2)} सेकंड`,
            ],
            finalAnswer: `अधिकतम ऊँचाई = ${h_max.toFixed(2)} m, कुल समय = ${total_t.toFixed(2)} s`,
            examTip: 'ऊपर फेंकने पर उच्चतम बिंदु पर वेग शून्य होता है और ऊपर जाने तथा नीचे आने का समय बराबर होता है।',
          };
        },
      },
      {
        title: 'छत से गिराई गई वस्तु (मुक्त पतन / Free Fall)',
        description: 'किसी ऊँचाई से छोड़ी गई वस्तु जमीन से टकराने पर वेग व समय।',
        inputs: [
          { id: 'h', label: 'ऊँचाई (h)', unit: 'मीटर', defaultVal: 45 },
        ],
        solve: (v) => {
          const g = 9.8;
          const t = Math.sqrt((2 * v.h) / g);
          const finalV = Math.sqrt(2 * g * v.h);
          return {
            given: [
              `प्रारंभिक वेग (u) = 0 m/s (मुक्त पतन)`,
              `ऊँचाई (h) = ${v.h} मीटर`,
              `गुरुत्वीय त्वरण (g) = 9.8 m/s²`,
            ],
            toFind: ['जमीन तक पहुँचने का समय (t)', 'टकराते समय वेग (v)'],
            formula: 'h = ½gt² तथा v² = 2gh',
            steps: [
              `समय: t = √(2h / g) = √( (2 × ${v.h}) / 9.8 ) = √(${(2 * v.h / 9.8).toFixed(2)}) = ${t.toFixed(2)} सेकंड`,
              `वेग: v = √(2 × 9.8 × ${v.h}) = √(${(19.6 * v.h).toFixed(2)}) = ${finalV.toFixed(2)} m/s`,
            ],
            finalAnswer: `समय = ${t.toFixed(2)} सेकंड, टकराते समय वेग = ${finalV.toFixed(2)} m/s (${(finalV * 3.6).toFixed(1)} km/h)`,
            examTip: 'जब वस्तु गिराई या छोड़ी जाती है, तो प्रारंभिक वेग (u) शून्य माना जाता है।',
          };
        },
      },
    ],
  },
  {
    id: 'work_energy',
    name: 'कार्य, ऊर्जा और शक्ति (Work & Energy)',
    icon: '⚡',
    badge: 'Energy',
    questions: [
      {
        title: 'गतिज ऊर्जा व स्थितिज ऊर्जा (Kinetic & Potential Energy)',
        description: 'गतिमान पिंड की गतिज ऊर्जा तथा ऊँचाई पर स्थितिज ऊर्जा ज्ञात करना।',
        inputs: [
          { id: 'm', label: 'द्रव्यमान (m)', unit: 'kg', defaultVal: 50 },
          { id: 'v', label: 'वेग (v)', unit: 'm/s', defaultVal: 12 },
          { id: 'h', label: 'ऊँचाई (h)', unit: 'मीटर', defaultVal: 10 },
        ],
        solve: (v) => {
          const ke = 0.5 * v.m * Math.pow(v.v, 2);
          const pe = v.m * 9.8 * v.h;
          const totalE = ke + pe;
          return {
            given: [
              `द्रव्यमान (m) = ${v.m} kg`,
              `वेग (v) = ${v.v} m/s`,
              `ऊँचाई (h) = ${v.h} m`,
              `गुरुत्वीय त्वरण (g) = 9.8 m/s²`,
            ],
            toFind: ['गतिज ऊर्जा (KE)', 'स्थितिज ऊर्जा (PE)', 'कुल यांत्रिक ऊर्जा (E)'],
            formula: 'KE = ½mv² तथा PE = mgh',
            steps: [
              `गतिज ऊर्जा: KE = 0.5 × ${v.m} × (${v.v})² = 0.5 × ${v.m} × ${Math.pow(v.v, 2)} = ${ke.toFixed(2)} जूल (J)`,
              `स्थितिज ऊर्जा: PE = ${v.m} × 9.8 × ${v.h} = ${pe.toFixed(2)} जूल (J)`,
              `कुल ऊर्जा: E = KE + PE = ${ke.toFixed(2)} + ${pe.toFixed(2)} = ${totalE.toFixed(2)} J`,
            ],
            finalAnswer: `गतिज ऊर्जा = ${ke.toFixed(2)} J, स्थितिज ऊर्जा = ${pe.toFixed(2)} J, कुल ऊर्जा = ${totalE.toFixed(2)} J`,
            examTip: 'ऊर्जा और कार्य दोनों का मात्रक "जूल (Joule)" होता है।',
          };
        },
      },
    ],
  },
  {
    id: 'electricity',
    name: 'विद्युत धारा व ओम का नियम',
    icon: '💡',
    badge: 'Electricity',
    questions: [
      {
        title: 'घरेलू बिजली खपत व बिल यूनिट (Electricity Bill kWh)',
        description: 'रेलवे व बोर्ड परीक्षा का सबसे लोकप्रिय सवाल: उपकरणों की मासिक यूनिट गणना।',
        inputs: [
          { id: 'watts', label: 'कुल वाट (Watts)', unit: 'W', defaultVal: 500 },
          { id: 'hours', label: 'प्रतिदिन उपयोग समय', unit: 'घंटे', defaultVal: 8 },
          { id: 'days', label: 'महीने के दिन', unit: 'दिन', defaultVal: 30 },
          { id: 'rate', label: 'प्रति यूनिट दर', unit: '₹', defaultVal: 7 },
        ],
        solve: (v) => {
          const totalWattHours = v.watts * v.hours * v.days;
          const units = totalWattHours / 1000;
          const bill = units * v.rate;
          return {
            given: [
              `उपकरण की शक्ति (P) = ${v.watts} Watt`,
              `दैनिक उपयोग = ${v.hours} घंटे / दिन`,
              `अवधि = ${v.days} दिन`,
              `यूनिट दर = ₹${v.rate} प्रति kWh`,
            ],
            toFind: ['कुल उपभुक्त यूनिट (kWh)', 'मासिक विद्युत बिल (₹)'],
            formula: 'ऊर्जा (यूनिट) = (वाट × घंटे × दिन) / 1000',
            steps: [
              `कुल वाट-घंटा: ${v.watts} W × ${v.hours} h × ${v.days} = ${totalWattHours} Wh`,
              `यूनिट (kWh) में: ${totalWattHours} / 1000 = ${units.toFixed(2)} यूनिट`,
              `बिल: ${units.toFixed(2)} यूनिट × ₹${v.rate} = ₹${bill.toFixed(2)}`,
            ],
            finalAnswer: `खपत = ${units.toFixed(2)} kWh (यूनिट), कुल बिल = ₹${bill.toFixed(2)}`,
            examTip: '1 यूनिट बिजली का मतलब 1 किलोवाट-घंटा (1 kWh = 3.6 × 10⁶ Joule) होता है।',
          };
        },
      },
      {
        title: 'ओम का नियम (V = IR व शक्ति)',
        description: 'विभवांतर, प्रतिरोध और धारा के बीच संबंध।',
        inputs: [
          { id: 'v', label: 'विभवांतर (V)', unit: 'Volt', defaultVal: 220 },
          { id: 'r', label: 'प्रतिरोध (R)', unit: 'Ω (Ohm)', defaultVal: 44 },
        ],
        solve: (v) => {
          const current = v.v / v.r;
          const power = v.v * current;
          return {
            given: [
              `विभवांतर (V) = ${v.v} V`,
              `प्रतिरोध (R) = ${v.r} Ω`,
            ],
            toFind: ['विद्युत धारा (I)', 'विद्युत शक्ति (P)'],
            formula: 'I = V / R तथा P = V × I',
            steps: [
              `धारा: I = ${v.v} / ${v.r} = ${current.toFixed(2)} एम्पीयर (A)`,
              `शक्ति: P = ${v.v} × ${current.toFixed(2)} = ${power.toFixed(2)} वाट (W)`,
            ],
            finalAnswer: `विद्युत धारा (I) = ${current.toFixed(2)} A, शक्ति (P) = ${power.toFixed(2)} W`,
            examTip: 'धारा का मात्रक एम्पीयर (A) तथा प्रतिरोध का मात्रक ओम (Ω) होता है।',
          };
        },
      },
    ],
  },
  {
    id: 'waves',
    name: 'ध्वनि व तरंग (Sound & Waves)',
    icon: '🔊',
    badge: 'Sound Waves',
    questions: [
      {
        title: 'ध्वनि तरंग चाल, आवृत्ति व तरंगदैर्घ्य',
        description: 'v = f × λ सूत्र द्वारा तरंग की चाल, आवृत्ति या तरंगदैर्घ्य निकालना।',
        inputs: [
          { id: 'freq', label: 'आवृत्ति (Frequency, f)', unit: 'Hz', defaultVal: 500 },
          { id: 'lambda', label: 'तरंगदैर्घ्य (Wavelength, λ)', unit: 'मीटर', defaultVal: 0.68 },
        ],
        solve: (v) => {
          const speed = v.freq * v.lambda;
          const timePeriod = 1 / v.freq;
          return {
            given: [
              `आवृत्ति (f) = ${v.freq} Hz`,
              `तरंगदैर्घ्य (λ) = ${v.lambda} m`,
            ],
            toFind: ['तरंग की चाल (v)', 'आवर्तकाल (T)'],
            formula: 'v = f × λ तथा T = 1 / f',
            steps: [
              `तरंग चाल: v = ${v.freq} × ${v.lambda} = ${speed.toFixed(2)} m/s`,
              `आवर्तकाल: T = 1 / ${v.freq} = ${timePeriod.toFixed(4)} सेकंड`,
            ],
            finalAnswer: `तरंग चाल (v) = ${speed.toFixed(2)} m/s, आवर्तकाल (T) = ${timePeriod.toFixed(4)} s`,
            examTip: 'सामान्य ताप पर वायु में ध्वनि की चाल लगभग 340 m/s से 344 m/s होती है।',
          };
        },
      },
    ],
  },
];

export default function PhysicsExamSolverPage() {
  const [activeTopicIdx, setActiveTopicIdx] = useState(0);
  const [activeQIdx, setActiveQIdx] = useState(0);

  const currentTopic = TOPICS[activeTopicIdx];
  const currentQ = currentTopic.questions[activeQIdx];

  const [inputValues, setInputValues] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    currentQ.inputs.forEach((inp) => {
      init[inp.id] = inp.defaultVal;
    });
    return init;
  });

  const handleTopicChange = (tIdx: number) => {
    setActiveTopicIdx(tIdx);
    setActiveQIdx(0);
    const newQ = TOPICS[tIdx].questions[0];
    const newVals: Record<string, number> = {};
    newQ.inputs.forEach((inp) => {
      newVals[inp.id] = inp.defaultVal;
    });
    setInputValues(newVals);
  };

  const handleQuestionChange = (qIdx: number) => {
    setActiveQIdx(qIdx);
    const newQ = currentTopic.questions[qIdx];
    const newVals: Record<string, number> = {};
    newQ.inputs.forEach((inp) => {
      newVals[inp.id] = inp.defaultVal;
    });
    setInputValues(newVals);
  };

  const handleInputChange = (id: string, val: string) => {
    const num = parseFloat(val);
    setInputValues((prev) => ({
      ...prev,
      [id]: isNaN(num) ? 0 : num,
    }));
  };

  const solution = currentQ.solve(inputValues);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="inline-block px-3 py-1 bg-violet-100 text-violet-800 text-xs font-bold rounded-full mb-3">
          परीक्षा स्पेशल • 100% स्टेप-बाय-स्टेप गाइड
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
          भौतिकी (Physics) न्यूमेरिकल संपूर्ण सॉल्वर
        </h1>
        <p className="text-sm text-slate-600 mb-6">
          बोर्ड, SSC, रेलवे और NEET में आने वाले प्रमुख भौतिकी प्रश्नों को <b>दिए गए मान, सूत्र, गणना और मात्रक</b> सहित समझें।
        </p>

        {/* 1. टॉपिक चयन बार */}
        <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-slate-200">
          {TOPICS.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => handleTopicChange(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
                activeTopicIdx === idx
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.name}</span>
            </button>
          ))}
        </div>

        {/* 2. प्रश्न प्रकार चयन */}
        {currentTopic.questions.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {currentTopic.questions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuestionChange(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  activeQIdx === idx
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                प्रश्न {idx + 1}: {q.title.substring(0, 28)}...
              </button>
            ))}
          </div>
        )}

        {/* 3. प्रश्न का विवरण व इनपुट बॉक्स */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded">
              {currentTopic.badge}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {currentQ.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mb-4">
            {currentQ.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {currentQ.inputs.map((inp) => (
              <div key={inp.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {inp.label} ({inp.unit}):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={inputValues[inp.id] ?? inp.defaultVal}
                    onChange={(e) => handleInputChange(inp.id, e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:ring-2 focus:ring-violet-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-semibold shrink-0">
                    {inp.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. संपूर्ण 5-चरणीय समाधान बॉक्स (Full 5-Step Solution) */}
        <div className="space-y-5 border-t-2 border-slate-100 pt-6">
          
          {/* चरण 1 व 2: दिया गया है और ज्ञात करना है */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block mb-1.5">
                📌 1. दिया गया है (Given Data):
              </span>
              <ul className="text-xs sm:text-sm text-slate-800 space-y-1">
                {solution.given.map((g, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-blue-600">•</span> {g}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1.5">
                🎯 2. ज्ञात करना है (To Find):
              </span>
              <ul className="text-xs sm:text-sm text-slate-800 space-y-1">
                {solution.toFind.map((tf, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="text-amber-600">?</span> <b>{tf}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* चरण 3: उपयुक्त सूत्र */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <span className="text-xs font-bold text-purple-900 uppercase tracking-wider block mb-1">
              📐 3. उपयुक्त सूत्र (Formula Used):
            </span>
            <div className="text-base sm:text-lg font-mono font-black text-purple-950">
              {solution.formula}
            </div>
          </div>

          {/* चरण 4: गणना व हल */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
              📝 4. गणना व चरण-दर-चरण हल (Step-by-Step Calculation):
            </span>
            <div className="space-y-2">
              {solution.steps.map((st, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="w-5 h-5 flex items-center justify-center bg-violet-100 text-violet-700 text-xs font-bold rounded-full shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{st}</span>
                </div>
              ))}
            </div>
          </div>

          {/* चरण 5: अंतिम उत्तर */}
          <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-center">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              ✅ 5. अंतिम उत्तर (Final Answer with Unit):
            </span>
            <div className="text-lg sm:text-2xl font-black text-emerald-950">
              {solution.finalAnswer}
            </div>
          </div>

          {/* परीक्षा टिप */}
          <div className="p-3.5 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-2.5 text-xs text-yellow-900 font-medium">
            <span className="text-base shrink-0">💡</span>
            <div>
              <b>परीक्षा सीक्रेट टिप (Exam Tip):</b> {solution.examTip}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
