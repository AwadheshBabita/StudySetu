'use client';

import React from 'react';

export default function LanguageBar() {
  const changeLang = (langCode: string) => {
    const select = document.querySelector('#google_translate_element select') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  };

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-3 border-b border-slate-800">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">भाषा चुनें:</span>
          <button onClick={() => changeLang('hi')} className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-bold transition">हिंदी</button>
          <button onClick={() => changeLang('en')} className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-bold transition">English</button>
          <button onClick={() => changeLang('mr')} className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-bold transition">मराठी</button>
          <button onClick={() => changeLang('bn')} className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-bold transition">বাংলা</button>
          <button onClick={() => changeLang('te')} className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-bold transition">తెలుగు</button>
          <button onClick={() => changeLang('ta')} className="px-2 py-0.5 bg-slate-800 hover:bg-blue-600 rounded text-[11px] font-bold transition">தமிழ்</button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs">🌐</span>
          <div id="google_translate_element"></div>
        </div>
      </div>
    </div>
  );
}
