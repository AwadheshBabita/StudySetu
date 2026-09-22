import React from 'react';
import Link from 'next/link';

export default function CalculatorsHub() {
  const tools = [
    {
      title: "Govt Exam Age Calculator",
      desc: "सरकारी भर्ती की कट-ऑफ तारीख पर सटीक उम्र (वर्ष, माह, दिन) निकालें।",
      href: "/calculators/age-calculator",
      badge: "Popular",
      category: "Exam Tools"
    },
    {
      title: "Chemical Equation Balancer",
      desc: "रासायनिक समीकरणों को 1-क्लिक में संतुलित (Balance) करें।",
      href: "/calculators/chemistry-balancer",
      badge: "Science",
      category: "Chemistry"
    },
    {
      title: "CGPA to Percentage Converter",
      desc: "CBSE, UP Board और कॉलेज CGPA को प्रतिशत में बदलें।",
      href: "/calculators/cgpa-converter",
      badge: "Academic",
      category: "Result"
    },
    {
      title: "Physics Kinematics Solver",
      desc: "गति, त्वरण, दूरी और समय (v = u + at) के सवाल हल करें।",
      href: "/calculators/physics-motion",
      badge: "Science",
      category: "Physics"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          छात्र एवं परीक्षा कैलकुलेटर
        </h1>
        <p className="mt-3 text-base text-slate-600 max-w-2xl mx-auto">
          सरकारी नौकरी की तैयारी, बोर्ड परीक्षा और साइंस के सवालों को तुरंत हल करने के लिए मुफ़्त टूल्स।
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool, idx) => (
          <Link 
            key={idx} 
            href={tool.href}
            className="block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {tool.category}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Live Now
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{tool.title}</h2>
            <p className="text-sm text-slate-600 mt-2">{tool.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
