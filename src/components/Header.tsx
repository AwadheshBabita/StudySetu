"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isToolPage = pathname && pathname.startsWith("/tools");

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* बायां कोना: लोगो और Exam Sewa ब्रांडिंग */}
        <Link href="/" className="flex items-center gap-2.5">
          <div 
            style={{ 
              background: "linear-gradient(135deg, #1d4ed8 0%, #4338ca 100%)",
              minWidth: "38px",
              minHeight: "38px"
            }} 
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md border border-blue-400"
          >
            <span style={{ color: "#ffffff", fontWeight: 900, fontSize: "16px" }}>
              ES
            </span>
          </div>

          <div className="flex flex-col">
            <div className="text-lg sm:text-2xl font-black tracking-tight leading-none flex items-center">
              <span className="text-green-600">Exam</span>
              <span className="text-blue-600 ml-1">Sewa</span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold tracking-wider">
              ONLINE TOOL SUITE
            </span>
          </div>
        </Link>

        {/* दायां कोना: टूल पेज होने पर बैक और होम बटन */}
        <div className="flex items-center gap-2">
          {isToolPage ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs sm:text-sm font-bold transition border border-slate-300 shadow-sm"
                title="पीछे जाएं (Back)"
              >
                <span className="text-sm">←</span>
                <span>Back</span>
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 text-xs sm:text-sm font-bold transition border border-blue-200 shadow-sm"
                title="होमपेज (Home)"
              >
                <span>🏠</span>
                <span>Home</span>
              </Link>
            </div>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              100% Free
            </span>
          )}
        </div>

      </div>
    </header>
  );
}
