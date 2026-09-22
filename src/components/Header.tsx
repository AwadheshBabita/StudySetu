"use client";

import React from "react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md border border-blue-400">
            ES
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl font-black tracking-tight leading-none flex items-center">
              <span className="text-green-600">Exam</span>
              <span className="text-blue-600 ml-1">Sewa</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium tracking-wider">ONLINE TOOL SUITE</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            100% Free & In-Browser
          </span>
        </div>
      </div>
    </header>
  );
}
