"use client";

import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* बायां कोना: प्रीमियम ES लोगो और ब्रांड नाम */}
        <Link href="/" className="flex items-center gap-2.5">
          {/* ES प्रीमियम लोगो बॉक्स */}
          <div 
            style={{ 
              background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)",
              minWidth: "40px",
              minHeight: "40px"
            }} 
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md border border-blue-400"
          >
            <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "18px", letterSpacing: "0.5px" }}>
              ES
            </span>
          </div>

          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-black tracking-tight leading-none flex items-center">
              <span className="text-green-600">Exam</span>
              <span className="text-blue-600 ml-1">Sewa</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold tracking-wider">
              ONLINE TOOL SUITE
            </span>
          </div>
        </Link>

        {/* दायां कोना: 100% Free बैज */}
        <div className="flex items-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            100% Free
          </span>
        </div>
      </div>
    </header>
  );
}
