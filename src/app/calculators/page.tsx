import React from 'react';
import Link from 'next/link';

export default function CalculatorsHub() {
  
  const colorThemes = [
    { bg: "bg-gradient-to-br from-emerald-50 via-teal-50/50 to-white", border: "border-emerald-200 hover:border-emerald-400", badge: "bg-emerald-100 text-emerald-800 border-emerald-300", link: "text-emerald-700", iconBg: "bg-emerald-100/70" },
    { bg: "bg-gradient-to-br from-amber-50 via-orange-50/50 to-white", border: "border-amber-200 hover:border-amber-400", badge: "bg-amber-100 text-amber-800 border-amber-300", link: "text-amber-700", iconBg: "bg-amber-100/70" },
    { bg: "bg-gradient-to-br from-indigo-50 via-blue-50/50 to-white", border: "border-indigo-200 hover:border-indigo-400", badge: "bg-indigo-100 text-indigo-800 border-indigo-300", link: "text-indigo-700", iconBg: "bg-indigo-100/70" },
    { bg: "bg-gradient-to-br from-purple-50 via-fuchsia-50/50 to-white", border: "border-purple-200 hover:border-purple-400", badge: "bg-purple-100 text-purple-800 border-purple-300", link: "text-purple-700", iconBg: "bg-purple-100/70" },
  ];

  const tools = [
    {
      title: "केमिकल समीकरण बैलेंसर",
      desc: "रासायनिक अभिक्रिया और समीकरणों को संतुलित (Balance) करें स्टेप-बाय-स्टेप।",
      href: "/calculators/chemistry-balancer",
      badge: "Chemistry",
      icon: "⚗️",
      color: "emerald"
    },
    {
      title: "भौतिकी गति व त्वरण सॉल्वर",
      desc: "v = u + at, दूरी और समय के न्यूमेरिकल सवाल पूरे फॉर्मूले सहित हल करें।",
      href: "/calculators/physics-motion",
      badge: "Physics",
      icon: "⚡",
      color: "indigo"
    },
    {
      title: "मैथ स्टेप-बाय-स्टेप सॉल्वर",
      desc: "द्विघात समीकरण, सूत्र विधि और बुनियादी गणित के कापी-कलम जैसे स्टेप्स।",
      href: "/calculators/math-solver",
      badge: "Math",
      icon: "📐",
      color: "amber"
    },
    {
      title: "CGPA से प्रतिशत कनवर्टर",
      desc: "CBSE, UP Board व कॉलेज मार्कशीट का CGPA तुरंत प्रतिशत में बदलें।",
      href: "/calculators/cgpa-converter",
      badge: "Academic",
      icon: "🎓",
      color: "purple"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <span>🔬</span> ACADEMIC TOOLS SUITE
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900">
          छात्र एवं परीक्षा कैलकुलेटर हब
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          साइंस, फिजिक्स न्यूमेरिकल, मैथ स्टेप्स और मार्कशीट स्कोर को तुरंत हल करने के आधुनिक टूल्स।
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((t, idx) => {
          const theme = colorThemes[idx % colorThemes.length];
          return (
            <Link
              key={idx}
              href={t.href}
              className={`group ${theme.bg} p-5 rounded-3xl border-2 ${theme.border} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-3xl p-2.5 ${theme.iconBg} group-hover:scale-110 transition-transform rounded-2xl border border-white shadow-xs`}>
                    {t.icon}
                  </span>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${theme.badge} border shadow-2xs`}>
                    {t.badge}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-slate-950 transition-colors">
                  {t.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
                  {t.desc}
                </p>
              </div>
              <div className={`mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-black ${theme.link}`}>
                <span>टूल खोलें</span>
                <span className="group-hover:translate-x-1.5 transition-transform">→</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link href="/" className="text-xs font-bold text-slate-500 hover:text-slate-800">
          ← मुख्य होमपेज पर वापस जाएँ
        </Link>
      </div>
    </div>
  );
}
